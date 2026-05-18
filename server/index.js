require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");
const { handleWebhook } = require("./webhooks");
const subscriptionRouter = require("./routes/subscription");
const checkoutRouter = require("./routes/checkout");

const app = express();
const PORT = process.env.PORT || 10000;

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    "https://plugin-factory-fl.github.io",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:3000",
  ]
    .filter(Boolean)
    .map((u) => u.replace(/\/$/, ""))
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, "");
      if (allowedOrigins.has(normalized)) return callback(null, true);
      if (normalized.startsWith("https://plugin-factory-fl.github.io")) return callback(null, true);
      callback(null, false);
    },
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "Create with Cursor API",
    health: "/health",
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/webhooks/stripe", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json());
app.use(subscriptionRouter);
app.use(checkoutRouter);

app.get("/config.js", (_req, res) => {
  const apiBase =
    process.env.PUBLIC_API_URL ||
    (process.env.RENDER_EXTERNAL_URL ? process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "") : "");
  res.type("application/javascript");
  res.send(`window.CCC_STRIPE_API_BASE=${JSON.stringify(apiBase)};`);
});

function start() {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Create with Cursor API listening on port ${PORT}`);
    initDb().catch((err) => console.error("DB init error", err));
  });
}

start();
