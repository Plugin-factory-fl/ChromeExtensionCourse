const { getUserByEmail, syncUserFromStripeSub, userToClient } = require("./db");
const { getStripe, subscriptionPayload } = require("./stripe-helpers");

async function refreshUserSubscription(email) {
  const user = await getUserByEmail(email);
  if (!user) return null;

  if (!user.stripe_subscription_id) {
    return user;
  }

  try {
    const sub = await getStripe().subscriptions.retrieve(user.stripe_subscription_id);
    return syncUserFromStripeSub(email, sub, {
      stripeCustomerId:
        typeof sub.customer === "string" ? sub.customer : user.stripe_customer_id,
    });
  } catch (err) {
    console.warn("[ccc-api] Stripe subscription refresh failed", email, err.message);
    return user;
  }
}

async function getClientUser(email, { refresh = true } = {}) {
  const row = refresh ? await refreshUserSubscription(email) : await getUserByEmail(email);
  return userToClient(row);
}

module.exports = { refreshUserSubscription, getClientUser, subscriptionPayload };
