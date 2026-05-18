const { Pool } = require("pg");

let pool = null;
const memory = new Map();

function usePostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool() {
  if (!usePostgres()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function initDb() {
  if (!usePostgres()) {
    console.warn("DATABASE_URL not set — using in-memory store (not for production).");
    return;
  }
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        name TEXT,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
  } finally {
    client.release();
  }
}

async function getUserByEmail(email) {
  const key = email.toLowerCase().trim();
  if (!usePostgres()) return memory.get(key) || null;
  const { rows } = await getPool().query(
    `SELECT email, name, stripe_customer_id, stripe_subscription_id FROM users WHERE email = $1`,
    [key]
  );
  return rows[0] || null;
}

async function upsertUser({ email, name, stripeCustomerId, stripeSubscriptionId }) {
  const key = email.toLowerCase().trim();
  const existing = (await getUserByEmail(key)) || {};
  const record = {
    email: key,
    name: name || existing.name || null,
    stripe_customer_id: stripeCustomerId || existing.stripe_customer_id || null,
    stripe_subscription_id: stripeSubscriptionId || existing.stripe_subscription_id || null,
  };

  if (!usePostgres()) {
    memory.set(key, record);
    return record;
  }

  const { rows } = await getPool().query(
    `INSERT INTO users (email, name, stripe_customer_id, stripe_subscription_id, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (email) DO UPDATE SET
       name = COALESCE(EXCLUDED.name, users.name),
       stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, users.stripe_customer_id),
       stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, users.stripe_subscription_id),
       updated_at = NOW()
     RETURNING email, name, stripe_customer_id, stripe_subscription_id`,
    [key, record.name, record.stripe_customer_id, record.stripe_subscription_id]
  );
  return rows[0];
}

module.exports = { initDb, getUserByEmail, upsertUser, usePostgres };
