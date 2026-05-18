const express = require("express");
const { getUserByEmail, syncUserFromStripeSub } = require("../db");
const { requireAuth } = require("../auth-tokens");
const { getStripe, subscriptionPayload } = require("../stripe-helpers");
const { getClientUser } = require("../sync-subscription");
const { signToken } = require("../auth-tokens");

const router = express.Router();

function frontendBase() {
  const base = (process.env.FRONTEND_URL || "https://plugin-factory-fl.github.io/ChromeExtensionCourse").replace(
    /\/$/,
    ""
  );
  return base;
}

router.post("/checkout/create-session", requireAuth, async (req, res) => {
  try {
    const email = req.authEmail;
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!process.env.STRIPE_PRICE_ID) {
      return res.status(500).json({ error: "STRIPE_PRICE_ID is not configured" });
    }

    const stripe = getStripe();
    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: user.name || undefined,
        metadata: { source: "create-with-cursor" },
      });
      customerId = customer.id;
      await syncUserFromStripeSub(email, null, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      subscription_data: {
        trial_period_days: Number(process.env.TRIAL_DAYS || 3),
        metadata: { email },
      },
      success_url: `${frontendBase()}/account.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBase()}/account.html?start=1`,
      metadata: { email, name: user.name || "" },
      allow_promotion_codes: true,
    });

    return res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("POST /checkout/create-session", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

router.get("/checkout/session-status", async (req, res) => {
  try {
    const sessionId = (req.query.session_id || "").trim();
    if (!sessionId) {
      return res.status(400).json({ error: "session_id is required" });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    const complete =
      session.status === "complete" ||
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required";

    if (!complete) {
      return res.status(402).json({
        error: "Checkout not completed yet",
        status: session.status,
        payment_status: session.payment_status,
      });
    }

    const email = (
      session.metadata?.email ||
      session.customer_details?.email ||
      session.customer_email ||
      ""
    )
      .toLowerCase()
      .trim();

    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subObj = session.subscription;

    if (email && subObj && typeof subObj === "object") {
      await syncUserFromStripeSub(email, subObj, { stripeCustomerId: customerId });
    } else if (email && subObj) {
      const sub = await stripe.subscriptions.retrieve(subObj);
      await syncUserFromStripeSub(email, sub, { stripeCustomerId: customerId });
    } else if (email) {
      await syncUserFromStripeSub(email, null, { stripeCustomerId: customerId });
    }

    const user = email ? await getClientUser(email, { refresh: false }) : null;
    const token = email ? signToken(email) : null;

    let subscription = null;
    if (subObj && typeof subObj === "object") {
      subscription = subscriptionPayload(subObj);
    } else if (typeof subObj === "string") {
      subscription = subscriptionPayload(await stripe.subscriptions.retrieve(subObj));
    }

    return res.json({
      ok: true,
      email,
      name: session.metadata?.name || session.customer_details?.name || user?.name || "",
      subscription: user?.subscription || subscription,
      user,
      token,
    });
  } catch (err) {
    console.error("GET /checkout/session-status", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;
