require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");
const { handleWebhook } = require("./webhooks");
const subscriptionRouter = require("./routes/subscription");
const checkoutRouter = require("./routes/checkout");

const app = express();
const PORT = Number(process.env.PORT) || 10000;

app.use((req, res, next) => {
  res.setHeader("X-CCC-API", "1");
  next();
});

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.get("/", (_req, res) => {
  res.type("text").send("CCC_API_OK");
});

app.get("/health", (_req, res) => {
  res.type("text").send("ccc-health-ok");
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
