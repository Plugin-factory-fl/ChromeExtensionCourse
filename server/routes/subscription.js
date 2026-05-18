const express = require("express");
const { getUserByEmail, syncUserFromStripeSub } = require("../db");
const { requireAuth } = require("../auth-tokens");
const { getStripe, subscriptionPayload } = require("../stripe-helpers");
const { getClientUser } = require("../sync-subscription");
const { subscriptionFromRow } = require("../membership");

const router = express.Router();

router.get("/subscription", requireAuth, async (req, res) => {
  try {
    const user = await getUserByEmail(req.authEmail);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.stripe_subscription_id) {
      return res.json(subscriptionFromRow(user));
    }
    const refreshed = await getClientUser(req.authEmail, { refresh: true });
    return res.json(refreshed.subscription);
  } catch (err) {
    console.error("GET /subscription", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

router.post("/subscription/cancel", requireAuth, async (req, res) => {
  try {
    const user = await getUserByEmail(req.authEmail);
    if (!user?.stripe_subscription_id) {
      return res.status(404).json({ error: "No subscription found" });
    }
    const sub = await getStripe().subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
    await syncUserFromStripeSub(req.authEmail, sub);
    return res.json(subscriptionPayload(sub));
  } catch (err) {
    console.error("POST /subscription/cancel", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

router.post("/subscription/reactivate", requireAuth, async (req, res) => {
  try {
    const user = await getUserByEmail(req.authEmail);
    if (!user?.stripe_subscription_id) {
      return res.status(404).json({ error: "No subscription found" });
    }
    const sub = await getStripe().subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: false,
    });
    await syncUserFromStripeSub(req.authEmail, sub);
    return res.json(subscriptionPayload(sub));
  } catch (err) {
    console.error("POST /subscription/reactivate", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;
