const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const { applyStripeSubscriptionToRow, userToClient } = require("./membership");

let pool = null;
const memory = new Map();

const USER_COLS = `email, name, password_hash, stripe_customer_id, stripe_subscription_id,
  subscription_status, trial_end, current_period_end, cancel_at_period_end, updated_at`;

function usePostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!usePostgres()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 8000,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function migrate(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      name TEXT,
      password_hash TEXT,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      subscription_status TEXT DEFAULT 'inactive',
      trial_end BIGINT,
      current_period_end BIGINT,
      cancel_at_period_end BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  const alters = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_end BIGINT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_end BIGINT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE`,
  ];
  for (const sql of alters) {
    await client.query(sql);
  }
}

async function initDb() {
  if (!usePostgres()) {
    console.warn("[ccc-api] DATABASE_URL not set — using in-memory store (not for production).");
    return;
  }
  try {
    const client = await getPool().connect();
    try {
      await migrate(client);
      console.log("[ccc-api] PostgreSQL ready");
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[ccc-api] PostgreSQL init failed — API will run without DB:", err.message);
  }
}

function normalizeRow(row) {
  if (!row) return null;
  return {
    ...row,
    email: row.email?.toLowerCase().trim(),
    cancel_at_period_end: !!row.cancel_at_period_end,
    trial_end: row.trial_end != null ? Number(row.trial_end) : null,
    current_period_end: row.current_period_end != null ? Number(row.current_period_end) : null,
  };
}

async function getUserByEmail(email) {
  const key = email.toLowerCase().trim();
  if (!usePostgres()) return normalizeRow(memory.get(key) || null);
  const { rows } = await getPool().query(`SELECT ${USER_COLS} FROM users WHERE email = $1`, [key]);
  return normalizeRow(rows[0] || null);
}

async function createUser({ email, name, password }) {
  const key = email.toLowerCase().trim();
  const existing = await getUserByEmail(key);
  if (existing?.password_hash) {
    const err = new Error("An account with this email already exists");
    err.code = "EMAIL_EXISTS";
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const record = {
    email: key,
    name: name || null,
    password_hash: passwordHash,
    stripe_customer_id: existing?.stripe_customer_id || null,
    stripe_subscription_id: existing?.stripe_subscription_id || null,
    subscription_status: existing?.subscription_status || "inactive",
    trial_end: existing?.trial_end ?? null,
    current_period_end: existing?.current_period_end ?? null,
    cancel_at_period_end: existing?.cancel_at_period_end ?? false,
  };

  if (!usePostgres()) {
    memory.set(key, { ...record, updated_at: new Date() });
    return normalizeRow(memory.get(key));
  }

  const { rows } = await getPool().query(
    `INSERT INTO users (email, name, password_hash, subscription_status, updated_at)
     VALUES ($1, $2, $3, 'inactive', NOW())
     ON CONFLICT (email) DO UPDATE SET
       name = COALESCE(EXCLUDED.name, users.name),
       password_hash = COALESCE(EXCLUDED.password_hash, users.password_hash),
       updated_at = NOW()
     RETURNING ${USER_COLS}`,
    [key, record.name, passwordHash]
  );
  return normalizeRow(rows[0]);
}

async function verifyUserPassword(email, password) {
  const user = await getUserByEmail(email);
  if (!user?.password_hash) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

async function updateUserSubscription(email, stripeFields) {
  const key = email.toLowerCase().trim();
  const existing = (await getUserByEmail(key)) || { email: key };

  const record = {
    ...existing,
    ...stripeFields,
    email: key,
  };

  if (!usePostgres()) {
    memory.set(key, { ...record, updated_at: new Date() });
    return normalizeRow(memory.get(key));
  }

  const { rows } = await getPool().query(
    `INSERT INTO users (
       email, name, password_hash, stripe_customer_id, stripe_subscription_id,
       subscription_status, trial_end, current_period_end, cancel_at_period_end, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
     ON CONFLICT (email) DO UPDATE SET
       name = COALESCE(EXCLUDED.name, users.name),
       password_hash = COALESCE(users.password_hash, EXCLUDED.password_hash),
       stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, users.stripe_customer_id),
       stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, users.stripe_subscription_id),
       subscription_status = COALESCE(EXCLUDED.subscription_status, users.subscription_status),
       trial_end = COALESCE(EXCLUDED.trial_end, users.trial_end),
       current_period_end = COALESCE(EXCLUDED.current_period_end, users.current_period_end),
       cancel_at_period_end = COALESCE(EXCLUDED.cancel_at_period_end, users.cancel_at_period_end),
       updated_at = NOW()
     RETURNING ${USER_COLS}`,
    [
      key,
      record.name,
      record.password_hash || null,
      record.stripe_customer_id || null,
      record.stripe_subscription_id || null,
      record.subscription_status || "inactive",
      record.trial_end ?? null,
      record.current_period_end ?? null,
      !!record.cancel_at_period_end,
    ]
  );
  return normalizeRow(rows[0]);
}

async function upsertUser({ email, name, stripeCustomerId, stripeSubscriptionId, subscriptionPatch }) {
  const key = email.toLowerCase().trim();
  const existing = (await getUserByEmail(key)) || {};
  return updateUserSubscription(key, {
    name: name || existing.name,
    password_hash: existing.password_hash,
    stripe_customer_id: stripeCustomerId || existing.stripe_customer_id,
    stripe_subscription_id: stripeSubscriptionId || existing.stripe_subscription_id,
    subscription_status: subscriptionPatch?.subscription_status ?? existing.subscription_status ?? "inactive",
    trial_end: subscriptionPatch?.trial_end ?? existing.trial_end,
    current_period_end: subscriptionPatch?.current_period_end ?? existing.current_period_end,
    cancel_at_period_end:
      subscriptionPatch?.cancel_at_period_end ?? existing.cancel_at_period_end ?? false,
  });
}

async function syncUserFromStripeSub(email, stripeSub, { stripeCustomerId } = {}) {
  const patch = stripeSub ? applyStripeSubscriptionToRow(stripeSub) : {};
  return updateUserSubscription(email, {
    stripe_customer_id: stripeCustomerId,
    ...patch,
  });
}

async function getUserByStripeCustomerId(customerId) {
  if (!customerId) return null;
  if (!usePostgres()) {
    for (const row of memory.values()) {
      if (row.stripe_customer_id === customerId) return normalizeRow(row);
    }
    return null;
  }
  const { rows } = await getPool().query(`SELECT ${USER_COLS} FROM users WHERE stripe_customer_id = $1 LIMIT 1`, [
    customerId,
  ]);
  return normalizeRow(rows[0] || null);
}

module.exports = {
  initDb,
  getUserByEmail,
  getUserByStripeCustomerId,
  createUser,
  verifyUserPassword,
  upsertUser,
  updateUserSubscription,
  syncUserFromStripeSub,
  userToClient,
  usePostgres,
};
