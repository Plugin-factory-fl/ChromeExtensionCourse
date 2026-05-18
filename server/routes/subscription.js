const express = require("express");
const { getUserByEmail } = require("../db");
const { getStripe, subscriptionPayload, retrieveSubscriptionForUser } = require("../stripe-helpers");

const router = express.Router();

function getEmail(req) {
  return (req.headers["x-user-email"] || req.body?.email || "").toLowerCase().trim();
}

router.get("/subscription", async (req, res) => {
  try {
    const email = getEmail(req);
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }
    const user = await getUserByEmail(email);
    if (!user?.stripe_subscription_id) {
      return res.status(404).json({ error: "No subscription found for this email" });
    }
    const payload = await retrieveSubscriptionForUser(user);
    return res.json(payload);
  } catch (err) {
    console.error("GET /subscription", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

router.post("/subscription/cancel", async (req, res) => {
  try {
    const email = getEmail(req);
    const user = await getUserByEmail(email);
    if (!user?.stripe_subscription_id) {
      return res.status(404).json({ error: "No subscription found" });
    }
    const sub = await getStripe().subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
    return res.json(subscriptionPayload(sub));
  } catch (err) {
    console.error("POST /subscription/cancel", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

router.post("/subscription/reactivate", async (req, res) => {
  try {
    const email = getEmail(req);
    const user = await getUserByEmail(email);
    if (!user?.stripe_subscription_id) {
      return res.status(404).json({ error: "No subscription found" });
    }
    const sub = await getStripe().subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: false,
    });
    return res.json(subscriptionPayload(sub));
  } catch (err) {
    console.error("POST /subscription/reactivate", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;
