/** Membership status: inactive | trialing | active | canceling | past_due | canceled */

function isMembershipActive(row) {
  if (!row) return false;
  const status = row.subscription_status || "inactive";
  const now = Math.floor(Date.now() / 1000);
  const periodEnd = row.current_period_end;

  if (status === "trialing" || status === "active") return true;
  if (periodEnd && periodEnd > now) {
    return status === "canceling" || status === "canceled" || row.cancel_at_period_end;
  }
  return false;
}

function subscriptionFromRow(row) {
  if (!row) return null;
  const status = row.subscription_status || "inactive";
  if (status === "inactive" && !row.stripe_subscription_id) {
    return {
      status: "inactive",
      trial_end: null,
      current_period_end: null,
      cancel_at_period_end: false,
      plan_label: "Create with Cursor — All courses",
      price_display: "$29.99/month",
    };
  }
  return {
    status,
    trial_end: row.trial_end,
    current_period_end: row.current_period_end,
    cancel_at_period_end: !!row.cancel_at_period_end,
    plan_label: "Create with Cursor — All courses",
    price_display: "$29.99/month",
    id: row.stripe_subscription_id,
  };
}

function applyStripeSubscriptionToRow(stripeSub) {
  if (!stripeSub) {
    return {
      subscription_status: "inactive",
      trial_end: null,
      current_period_end: null,
      cancel_at_period_end: false,
    };
  }

  let status = stripeSub.status;
  if (stripeSub.cancel_at_period_end && (status === "active" || status === "trialing")) {
    status = "canceling";
  }

  return {
    subscription_status: status,
    trial_end: stripeSub.trial_end || null,
    current_period_end: stripeSub.current_period_end || null,
    cancel_at_period_end: !!stripeSub.cancel_at_period_end,
    stripe_subscription_id: stripeSub.id,
  };
}

function userToClient(row) {
  if (!row) return null;
  const subscription = subscriptionFromRow(row);
  return {
    name: row.name || "",
    email: row.email,
    hasActiveMembership: isMembershipActive(row),
    subscription,
  };
}

module.exports = {
  isMembershipActive,
  subscriptionFromRow,
  applyStripeSubscriptionToRow,
  userToClient,
};
