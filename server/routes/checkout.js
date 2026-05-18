const express = require("express");
const { getUserByEmail, upsertUser } = require("../db");
const { getStripe, subscriptionPayload } = require("../stripe-helpers");

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
    const user = await getUserByEmail(email);
    const customerId = user?.stripe_customer_id;

    const sessionParams = {
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      subscription_data: {
        trial_period_days: Number(process.env.TRIAL_DAYS || 3),
        metadata: { email },
      },
      success_url: `${frontendBase()}/account.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBase()}/account.html?start=1`,
      metadata: { email, name: name || "" },
      allow_promotion_codes: true,
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

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
    const subscriptionId = typeof subObj === "string" ? subObj : subObj?.id;

    if (email) {
      await upsertUser({
        email,
        name: session.metadata?.name || session.customer_details?.name || "",
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
      });
    }

    let subscription = null;
    if (subObj && typeof subObj === "object") {
      subscription = subscriptionPayload(subObj);
    } else if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      subscription = subscriptionPayload(sub);
    }

    return res.json({
      ok: true,
      email,
      name: session.metadata?.name || session.customer_details?.name || "",
      subscription,
    });
  } catch (err) {
    console.error("GET /checkout/session-status", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

module.exports = router;
