const Stripe = require("stripe");

let stripe = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

function subscriptionPayload(sub) {
  if (!sub) return null;
  return {
    id: sub.id,
    status: sub.status,
    trial_end: sub.trial_end,
    current_period_end: sub.current_period_end,
    cancel_at_period_end: sub.cancel_at_period_end,
    plan_label: "Create with Cursor — All courses",
    price_display: "$29.99/month",
  };
}

async function retrieveSubscriptionForUser(user) {
  if (!user?.stripe_subscription_id) return null;
  const sub = await getStripe().subscriptions.retrieve(user.stripe_subscription_id);
  return subscriptionPayload(sub);
}

module.exports = { getStripe, subscriptionPayload, retrieveSubscriptionForUser };
