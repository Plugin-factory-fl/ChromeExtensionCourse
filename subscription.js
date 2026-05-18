/** Stripe-backed subscription helpers. Set window.CCC_STRIPE_API_BASE when your billing API is live. */

const TRIAL_LENGTH_DAYS = 3;
const MEMBERSHIP_PRICE_LABEL = "$29.99/month";

function getStripeApiBase() {
  const base = (window.CCC_STRIPE_API_BASE || "").replace(/\/$/, "");
  return base;
}

function unixNow() {
  return Math.floor(Date.now() / 1000);
}

function createTrialSubscription() {
  const now = unixNow();
  return {
    status: "trialing",
    trial_end: now + TRIAL_LENGTH_DAYS * 24 * 60 * 60,
    current_period_end: now + TRIAL_LENGTH_DAYS * 24 * 60 * 60,
    cancel_at_period_end: false,
    planLabel: "Create with Cursor — All courses",
    priceDisplay: MEMBERSHIP_PRICE_LABEL,
  };
}

function normalizeStripeSubscription(data) {
  if (!data || typeof data !== "object") {
    return {
      status: "inactive",
      trial_end: null,
      current_period_end: null,
      cancel_at_period_end: false,
      planLabel: "Create with Cursor — All courses",
      priceDisplay: MEMBERSHIP_PRICE_LABEL,
    };
  }
  return {
    status: data.status || "inactive",
    trial_end: data.trial_end ?? null,
    current_period_end: data.current_period_end ?? data.trial_end ?? null,
    cancel_at_period_end: !!data.cancel_at_period_end,
    planLabel: data.plan_label || data.planLabel || "Create with Cursor — All courses",
    priceDisplay: data.price_display || data.priceDisplay || MEMBERSHIP_PRICE_LABEL,
    stripeSubscriptionId: data.id || data.stripe_subscription_id || data.stripeSubscriptionId || null,
  };
}

function getTrialDaysRemaining(subscription) {
  if (!subscription || subscription.status !== "trialing" || !subscription.trial_end) return null;
  const msLeft = subscription.trial_end * 1000 - Date.now();
  if (msLeft <= 0) return 0;
  return Math.ceil(msLeft / (24 * 60 * 60 * 1000));
}

function formatDateFromUnix(unixSeconds) {
  if (!unixSeconds) return "";
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getSubscriptionSummary(subscription) {
  const sub = subscription || createTrialSubscription();
  const trialDays = getTrialDaysRemaining(sub);
  const accessUntil = formatDateFromUnix(
    sub.cancel_at_period_end || sub.status === "canceled"
      ? sub.current_period_end
      : sub.status === "trialing"
        ? sub.trial_end
        : sub.current_period_end
  );

  let statusLabel = "Active";
  let statusDetail = `Billed at ${sub.priceDisplay} after your trial.`;

  if (sub.status === "trialing") {
    statusLabel = "Free trial";
    if (trialDays === 0) {
      statusDetail = "Your trial ends today. Billing starts next unless you cancel.";
    } else if (trialDays === 1) {
      statusDetail = "1 day left in your 3-day free trial.";
    } else {
      statusDetail = `${trialDays} days left in your 3-day free trial.`;
    }
  } else if (sub.cancel_at_period_end) {
    statusLabel = "Canceling";
    statusDetail = accessUntil
      ? `You keep access until ${accessUntil}. You will not be charged again.`
      : "Your subscription will end at the close of this billing period.";
  } else if (sub.status === "inactive") {
    statusLabel = "Inactive";
    statusDetail = "Complete checkout to start your 3-day free trial.";
  } else if (sub.status === "canceled" || sub.status === "unpaid") {
    statusLabel = "Ended";
    statusDetail = accessUntil ? `Access ended on ${accessUntil}.` : "Your subscription is no longer active.";
  } else if (sub.status === "past_due") {
    statusLabel = "Past due";
    statusDetail = "Update your payment method in Stripe to restore access.";
  }

  return {
    planLabel: sub.planLabel,
    priceDisplay: sub.priceDisplay,
    statusLabel,
    statusDetail,
    trialDays,
    isTrialing: sub.status === "trialing",
    accessUntil,
    cancelAtPeriodEnd: !!sub.cancel_at_period_end,
    raw: sub,
  };
}

function isMembershipActive(user) {
  if (!user) return false;
  if (typeof user.hasActiveMembership === "boolean") return user.hasActiveMembership;
  const sub = user.subscription;
  if (!sub || sub.status === "inactive") return false;
  if (sub.status === "active" || sub.status === "trialing") return true;
  if (sub.current_period_end && sub.current_period_end * 1000 > Date.now()) {
    return sub.status === "canceled" || sub.status === "canceling" || sub.cancel_at_period_end;
  }
  return false;
}

function subscriptionAuthHeaders() {
  if (window.AuthAPI?.authHeaders) return window.AuthAPI.authHeaders();
  return { Accept: "application/json" };
}

async function fetchSubscription(user) {
  const base = getStripeApiBase();
  if (base && user?.token) {
    try {
      const res = await fetch(`${base}/subscription`, {
        method: "GET",
        headers: subscriptionAuthHeaders(),
      });
      if (res.ok) {
        return normalizeStripeSubscription(await res.json());
      }
    } catch (err) {
      console.warn("Could not load subscription from API:", err);
    }
  }

  if (user?.subscription) {
    return normalizeStripeSubscription(user.subscription);
  }

  return normalizeStripeSubscription({ status: "inactive" });
}

async function cancelSubscriptionAtPeriodEnd(user) {
  const base = getStripeApiBase();
  if (base && user?.token) {
    const res = await fetch(`${base}/subscription/cancel`, {
      method: "POST",
      headers: subscriptionAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error("Unable to cancel subscription. Please try again or contact support.");
    }
    return normalizeStripeSubscription(await res.json());
  }

  const sub = normalizeStripeSubscription(user.subscription);
  const periodEnd =
    sub.status === "trialing"
      ? sub.trial_end
      : sub.current_period_end || unixNow() + 30 * 24 * 60 * 60;

  return {
    ...sub,
    cancel_at_period_end: true,
    current_period_end: periodEnd,
    status: sub.status === "trialing" ? "trialing" : sub.status,
  };
}

async function keepSubscription(user) {
  const base = getStripeApiBase();
  if (base && user?.token) {
    const res = await fetch(`${base}/subscription/reactivate`, {
      method: "POST",
      headers: subscriptionAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error("Unable to update subscription. Please try again.");
    }
    return normalizeStripeSubscription(await res.json());
  }

  const sub = normalizeStripeSubscription(user.subscription);
  return { ...sub, cancel_at_period_end: false };
}

function ensureUserSubscription(user) {
  if (!user) return user;
  if (!user.subscription) {
    return {
      ...user,
      subscription: normalizeStripeSubscription({ status: "inactive" }),
      hasActiveMembership: false,
    };
  }
  return user;
}

async function createCheckoutSession() {
  const base = getStripeApiBase();
  if (!base) {
    throw new Error("Billing API is not configured.");
  }
  const res = await fetch(`${base}/checkout/create-session`, {
    method: "POST",
    headers: subscriptionAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Could not start Stripe checkout.");
  }
  if (!data.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }
  return data;
}

async function verifyCheckoutSession(sessionId) {
  const base = getStripeApiBase();
  if (!base || !sessionId) {
    throw new Error("Missing checkout session.");
  }
  const res = await fetch(
    `${base}/checkout/session-status?session_id=${encodeURIComponent(sessionId)}`,
    { headers: { Accept: "application/json" } }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Could not verify checkout.");
  }
  return data;
}

window.SubscriptionService = {
  TRIAL_LENGTH_DAYS,
  MEMBERSHIP_PRICE_LABEL,
  createTrialSubscription,
  fetchSubscription,
  cancelSubscriptionAtPeriodEnd,
  keepSubscription,
  getSubscriptionSummary,
  getTrialDaysRemaining,
  isMembershipActive,
  ensureUserSubscription,
  formatDateFromUnix,
  getStripeApiBase,
  createCheckoutSession,
  verifyCheckoutSession,
};
