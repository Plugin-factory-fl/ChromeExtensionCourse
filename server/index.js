if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection", err);
});
process.on("uncaughtException", (err) => {
  console.error("uncaughtException", err);
});

const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");
const { handleWebhook } = require("./webhooks");
const authRouter = require("./routes/auth");
const subscriptionRouter = require("./routes/subscription");
const checkoutRouter = require("./routes/checkout");

const app = express();
const PORT = parseInt(process.env.PORT || "10000", 10);

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

function healthHandler(_req, res) {
  res.type("text").send("ccc-health-ok");
}
app.get("/health", healthHandler);
app.head("/health", healthHandler);

app.post("/webhooks/stripe", express.raw({ type: "application/json" }), handleWebhook);

app.use(express.json());
app.use(authRouter);
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
  console.log(`[ccc-api] booting node ${process.version} port=${PORT} env=${process.env.NODE_ENV || "development"}`);
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ccc-api] listening on http://0.0.0.0:${PORT}`);
    initDb().catch((err) => console.error("[ccc-api] DB init error", err));
  });
  server.on("error", (err) => {
    console.error("[ccc-api] server listen error", err);
    process.exit(1);
  });
}

start();
