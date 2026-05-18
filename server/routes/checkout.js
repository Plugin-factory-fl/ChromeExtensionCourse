const express = require("express");
const { getUserByEmail, upsertUser } = require("../db");
const { getStripe } = require("../stripe-helpers");

const router = express.Router();

function frontendBase() {
  const base = (process.env.FRONTEND_URL || "https://plugin-factory-fl.github.io/ChromeExtensionCourse").replace(
    /\/$/,
    ""
  );
  return base;
}

router.post("/checkout/create-session", async (req, res) => {
  try {
    const email = (req.body?.email || "").toLowerCase().trim();
    const name = (req.body?.name || "").trim();
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!process.env.STRIPE_PRICE_ID) {
      return res.status(500).json({ error: "STRIPE_PRICE_ID is not configured" });
    }

    const stripe = getStripe();
    let user = await getUserByEmail(email);
    let customerId = user?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: name || undefined,
        metadata: { source: "create-with-cursor" },
      });
      customerId = customer.id;
      user = await upsertUser({ email, name, stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      subscription_data: {
        trial_period_days: Number(process.env.TRIAL_DAYS || 3),
        metadata: { email },
      },
      success_url: `${frontendBase()}/account.html?checkout=success`,
      cancel_url: `${frontendBase()}/account.html?start=1`,
      metadata: { email },
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("POST /checkout/create-session", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;
