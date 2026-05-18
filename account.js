let manageOpen = false;
let manageStep = "overview";
let manageLoading = false;
let manageError = "";
let subscriptionSummary = null;

function parseQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    start: params.get("start") === "1",
    manage: params.get("manage") === "1",
  };
}

function ensureManageModal() {
  let modal = document.getElementById("manage-modal");
  if (modal) return modal;

  modal = document.createElement("div");
  modal.id = "manage-modal";
  modal.className = "manage-modal hidden";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "manage-modal-title");
  modal.innerHTML = `
    <button type="button" class="manage-modal-backdrop" aria-label="Close dialog" data-close-modal></button>
    <div class="manage-modal-panel">
      <button type="button" class="manage-modal-close" aria-label="Close" data-close-modal>&times;</button>
      <div id="manage-subscription-mount" class="manage-modal-body"></div>
    </div>
  `;

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeManageSubscription);
  });

  document.addEventListener("keydown", onManageModalKeydown);
  document.body.appendChild(modal);
  return modal;
}

function onManageModalKeydown(e) {
  if (e.key === "Escape" && manageOpen) {
    closeManageSubscription();
  }
}

function showManageModal() {
  const modal = ensureManageModal();
  modal.classList.remove("hidden");
  document.body.classList.add("manage-modal-open");
  const closeBtn = modal.querySelector(".manage-modal-close");
  if (closeBtn) closeBtn.focus();
}

function hideManageModal() {
  const modal = document.getElementById("manage-modal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("manage-modal-open");
}

function openManageSubscription() {
  manageOpen = true;
  manageStep = "overview";
  manageError = "";
  showManageModal();
  renderManagePanel();
  refreshSubscription();
}

function closeManageSubscription() {
  manageOpen = false;
  manageStep = "overview";
  manageError = "";
  hideManageModal();
}

async function refreshSubscription() {
  const user = getUser();
  if (!user || !window.SubscriptionService) return;

  manageLoading = true;
  manageError = "";
  renderManagePanel();

  try {
    const sub = await SubscriptionService.fetchSubscription(user);
    const updated = SubscriptionService.ensureUserSubscription({
      ...user,
      subscription: sub,
      hasActiveMembership: SubscriptionService.isMembershipActive({
        ...user,
        subscription: sub,
      }),
    });
    setUser(updated);
    subscriptionSummary = SubscriptionService.getSubscriptionSummary(sub);
  } catch (err) {
    manageError = err.message || "Could not load subscription details.";
  } finally {
    manageLoading = false;
    if (manageOpen) {
      renderManagePanel();
    } else {
      renderAccount();
    }
  }
}

function setSubmitLoading(loading, label) {
  const btn = document.querySelector("#signup-form button[type=submit], #activate-membership, #login-form button[type=submit]");
  if (!btn) return;
  btn.disabled = loading;
  if (loading) btn.textContent = label || "Please wait…";
}

async function enrollWithStripe(name, email, password) {
  const btn = document.querySelector("#signup-form button[type=submit], #activate-membership");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Redirecting to Stripe…";
  }
  try {
    const existing = getUser();
    if (!existing?.token) {
      if (!password) {
        throw new Error("Password is required to create your account.");
      }
      await AuthAPI.register({ name, email, password });
    }
    const { url } = await SubscriptionService.createCheckoutSession();
    window.location.href = url;
  } catch (err) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = ENROLL_BTN_HTML;
    }
    alert(err.message || "Could not start checkout. Check that Stripe keys are set on Render.");
  }
}

async function handleCheckoutReturn() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("checkout") !== "success") return;

  const sessionId = params.get("session_id");
  if (!sessionId || !window.SubscriptionService) return;

  const root = document.getElementById("account-root");
  if (root) {
    root.innerHTML = `<h1 class="account-title">Confirming payment…</h1><p class="account-subtitle">One moment while we verify your Stripe checkout.</p>`;
  }

  try {
    const data = await SubscriptionService.verifyCheckoutSession(sessionId);
    const user = data.user || {
      name: data.name || "Student",
      email: data.email,
      hasActiveMembership: true,
      subscription: data.subscription
        ? SubscriptionService.normalizeStripeSubscription(data.subscription)
        : SubscriptionService.normalizeStripeSubscription({ status: "trialing" }),
    };
    setUser({ ...user, token: data.token || getUser()?.token });
    window.history.replaceState({}, "", "account.html");
    renderAccount();
  } catch (err) {
    if (root) {
      root.innerHTML = `
        <h1 class="account-title">Checkout verification failed</h1>
        <p class="account-subtitle">${err.message || "Please try again or contact support."}</p>
        <a href="account.html?start=1" class="btn btn-enroll">Try again</a>
      `;
    }
  }
}

function renderManagePanel() {
  const mount = document.getElementById("manage-subscription-mount");
  if (!mount) return;

  const user = getUser();
  const summary =
    subscriptionSummary ||
    (user?.subscription
      ? SubscriptionService.getSubscriptionSummary(user.subscription)
      : SubscriptionService.getSubscriptionSummary(SubscriptionService.createTrialSubscription()));

  if (manageLoading) {
    mount.innerHTML = `<p class="helper-text manage-loading">${
      manageStep === "overview" ? "Loading subscription from Stripe…" : "Updating your subscription…"
    }</p>`;
    return;
  }

  if (manageError && manageStep === "overview") {
    mount.innerHTML = `
      <p class="manage-error" role="alert">${manageError}</p>
      <button type="button" class="btn btn-secondary" id="manage-retry">Try again</button>
    `;
    document.getElementById("manage-retry")?.addEventListener("click", refreshSubscription);
    return;
  }

  const trialBanner =
    summary.isTrialing && summary.trialDays !== null
      ? `<div class="manage-trial-banner" role="status">
          <strong>${summary.trialDays === 1 ? "1 day" : summary.trialDays + " days"}</strong>
          left in your 3-day free trial
        </div>`
      : "";

  const cards = {
    overview: `
      <h2 class="manage-title" id="manage-modal-title">Manage subscription</h2>
      ${trialBanner}
      <div class="manage-plan-card">
        <div class="manage-plan-row"><span>Plan</span><strong>${summary.planLabel}</strong></div>
        <div class="manage-plan-row"><span>Price</span><strong>${summary.priceDisplay}</strong></div>
        <div class="manage-plan-row"><span>Status</span><strong>${summary.statusLabel}</strong></div>
        <p class="manage-plan-detail">${summary.statusDetail}</p>
        ${
          summary.accessUntil && (summary.cancelAtPeriodEnd || summary.statusLabel === "Canceling")
            ? `<p class="manage-plan-detail">Access until <strong>${summary.accessUntil}</strong>.</p>`
            : ""
        }
      </div>
      <p class="manage-prompt">What would you like to do?</p>
      <div class="manage-actions">
        <button type="button" class="btn btn-enroll" id="manage-keep">Keep subscription</button>
        <button type="button" class="btn btn-secondary" id="manage-cancel-start">Cancel subscription</button>
        <button type="button" class="btn btn-ghost" id="manage-back-account">Back to account</button>
      </div>
    `,
    keep: `
      <h2 class="manage-title">Keep your subscription</h2>
      <p class="manage-body">
        You'll continue with full access to every Create with Cursor course${
          summary.isTrialing
            ? ` for the rest of your free trial, then ${summary.priceDisplay}.`
            : ` at ${summary.priceDisplay}.`
        }
        Cancel anytime from this page.
      </p>
      ${
        summary.cancelAtPeriodEnd
          ? `<p class="manage-body">We'll remove the pending cancellation and keep your membership active.</p>`
          : ""
      }
      <div class="manage-actions">
        <button type="button" class="btn btn-enroll" id="manage-keep-confirm">Confirm — keep subscription</button>
        <button type="button" class="btn btn-ghost" id="manage-back-overview">Go back</button>
      </div>
    `,
    "cancel-warn": `
      <h2 class="manage-title">Cancel subscription</h2>
      <p class="manage-body">If you cancel:</p>
      <ul class="manage-list">
        <li>You keep course access until <strong>${summary.accessUntil || "the end of your current period"}</strong>.</li>
        <li>${
          summary.isTrialing
            ? "You won't be charged when the trial ends."
            : "You won't be charged again after this period."
        }</li>
        <li>You can resubscribe anytime from your account.</li>
      </ul>
      <div class="manage-actions">
        <button type="button" class="btn btn-secondary" id="manage-cancel-confirm">Continue to cancel</button>
        <button type="button" class="btn btn-enroll" id="manage-keep-from-cancel">Keep subscription</button>
      </div>
    `,
    "cancel-confirm": `
      <h2 class="manage-title">Are you sure?</h2>
      <p class="manage-body">
        Your subscription will be set to cancel. You'll still have access until
        <strong>${summary.accessUntil || "your billing period ends"}</strong>.
      </p>
      <div class="manage-actions">
        <button type="button" class="btn btn-secondary" id="manage-cancel-final">Yes, cancel subscription</button>
        <button type="button" class="btn btn-enroll" id="manage-keep-from-final">Keep subscription</button>
      </div>
    `,
    done: `
      <h2 class="manage-title">Subscription updated</h2>
      <p class="manage-body" id="manage-done-message"></p>
      <div class="manage-actions">
        <button type="button" class="btn btn-enroll" id="manage-done-close">Back to account</button>
      </div>
    `,
  };

  mount.innerHTML = cards[manageStep] || cards.overview;
  bindManageStepHandlers(summary);
}

function bindManageStepHandlers(summary) {
  const go = (step) => {
    manageStep = step;
    manageError = "";
    renderManagePanel();
  };

  document.getElementById("manage-back-account")?.addEventListener("click", closeManageSubscription);
  document.getElementById("manage-back-overview")?.addEventListener("click", () => go("overview"));
  document.getElementById("manage-keep")?.addEventListener("click", () => go("keep"));
  document.getElementById("manage-keep-from-cancel")?.addEventListener("click", () => go("keep"));
  document.getElementById("manage-keep-from-final")?.addEventListener("click", () => go("keep"));
  document.getElementById("manage-cancel-start")?.addEventListener("click", () => go("cancel-warn"));
  document.getElementById("manage-cancel-confirm")?.addEventListener("click", () => go("cancel-confirm"));

  document.getElementById("manage-keep-confirm")?.addEventListener("click", async () => {
    const user = getUser();
    if (!user) return;
    manageLoading = true;
    renderManagePanel();
    try {
      const sub = await SubscriptionService.keepSubscription(user);
      setUser({
        ...user,
        subscription: sub,
        hasActiveMembership: SubscriptionService.isMembershipActive({ ...user, subscription: sub }),
      });
      subscriptionSummary = SubscriptionService.getSubscriptionSummary(sub);
      manageStep = "done";
      manageLoading = false;
      renderManagePanel();
      const msg = document.getElementById("manage-done-message");
      if (msg) {
        msg.textContent = summary.cancelAtPeriodEnd
          ? "Pending cancellation removed. Your membership stays active."
          : "You're all set. Your subscription remains active.";
      }
    } catch (err) {
      manageLoading = false;
      manageError = err.message;
      manageStep = "overview";
      renderManagePanel();
    }
  });

  document.getElementById("manage-cancel-final")?.addEventListener("click", async () => {
    const user = getUser();
    if (!user) return;
    manageLoading = true;
    renderManagePanel();
    try {
      const sub = await SubscriptionService.cancelSubscriptionAtPeriodEnd(user);
      const updated = {
        ...user,
        subscription: sub,
        hasActiveMembership: SubscriptionService.isMembershipActive({ ...user, subscription: sub }),
      };
      setUser(updated);
      subscriptionSummary = SubscriptionService.getSubscriptionSummary(sub);
      manageStep = "done";
      manageLoading = false;
      renderManagePanel();
      const msg = document.getElementById("manage-done-message");
      if (msg) {
        const until = subscriptionSummary.accessUntil || "the end of your billing period";
        msg.textContent = `Your subscription is set to cancel. You'll keep access until ${until}.`;
      }
    } catch (err) {
      manageLoading = false;
      manageError = err.message;
      manageStep = "cancel-confirm";
      renderManagePanel();
    }
  });

  document.getElementById("manage-done-close")?.addEventListener("click", closeManageSubscription);
}

function renderEnrolledAccount(user) {
  const root = document.getElementById("account-root");
  if (!root) return;

  const summary = SubscriptionService.getSubscriptionSummary(
    user.subscription || SubscriptionService.createTrialSubscription()
  );
  const trialNote =
    summary.isTrialing && summary.trialDays !== null
      ? `<p class="account-trial-note">${summary.trialDays === 1 ? "1 day" : summary.trialDays + " days"} left in your free trial</p>`
      : "";

  root.innerHTML = `
    <h1 class="account-title">You're enrolled.</h1>
    <p class="account-subtitle">
      Your membership is active. Pick a course and start building with Cursor.
    </p>
    ${trialNote}
    <div class="stack">
      <div class="row">
        <div>
          <strong>${user.name || "Student"}</strong><br />
          <span class="helper-text">${user.email || ""}</span>
        </div>
        <span class="status-pill ${summary.cancelAtPeriodEnd ? "inactive" : "active"}">
          <span class="status-dot"></span>
          ${summary.cancelAtPeriodEnd ? "Canceling" : summary.statusLabel === "Free trial" ? "Trial" : "Active"}
        </span>
      </div>
      <button type="button" id="go-course" class="btn btn-enroll">Browse courses</button>
      <button type="button" id="manage-subscription" class="btn btn-secondary">Manage subscription</button>
      <button type="button" id="logout" class="btn btn-ghost">Log out</button>
    </div>
  `;

  document.getElementById("manage-subscription")?.addEventListener("click", openManageSubscription);

  root.className = "account-card";

  if (manageOpen) {
    showManageModal();
    renderManagePanel();
  }
  attachCommonHandlers();
}

function renderAccount() {
  const root = document.getElementById("account-root");
  if (!root || !window.SubscriptionService) return;

  let user = getUser();
  if (user && !user.token) {
    setUser(null);
    user = null;
  }
  const { start, manage } = parseQuery();

  if (manage && user?.hasActiveMembership) {
    manageOpen = true;
  }

  if (!user) {
    manageOpen = false;
    root.innerHTML = `
      <h1 class="account-title">Create your account</h1>
      <p class="account-subtitle">
        Enroll in Create with Cursor by Alexander Miller and unlock every course—Chrome extensions, websites, and new releases as they launch.
      </p>
      <form class="account-form" id="signup-form">
        <div class="field">
          <label for="name">Name</label>
          <input id="name" name="name" type="text" autocomplete="name" required />
        </div>
        <div class="field">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="email" required />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="new-password" required />
          <div class="helper-text">Stored securely on our server (hashed). Minimum 8 characters.</div>
        </div>
        <p class="helper-text">
          Start with a <strong>3-day free trial</strong>, then <strong>$29.99/month</strong> for access to all courses. <strong>Cancel anytime.</strong>
        </p>
        <button type="submit" class="btn btn-enroll btn-enroll-lg" style="width: 100%; margin-top: 8px;">${ENROLL_BTN_HTML}</button>
      </form>
      <div class="spacer"></div>
      <p class="muted-link">
        Already have an account? <button type="button" id="show-login">Log in</button>
      </p>
    `;

    document.getElementById("signup-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;
      if (!name || !email || !password) return;
      enrollWithStripe(name, email, password);
    });
    document.getElementById("show-login")?.addEventListener("click", () => renderLogin());
    if (start) document.getElementById("name")?.focus();
    return;
  }

  const activeUser = SubscriptionService.ensureUserSubscription(user);
  if (JSON.stringify(activeUser) !== JSON.stringify(user)) {
    setUser(activeUser);
  }

  if (!SubscriptionService.isMembershipActive(activeUser)) {
    manageOpen = false;
    const inactiveSummary = SubscriptionService.getSubscriptionSummary(activeUser.subscription);
    root.innerHTML = `
      <h1 class="account-title">Your enrollment</h1>
      <p class="account-subtitle">${inactiveSummary.statusDetail}</p>
      <div class="stack">
        <div class="row">
          <div>
            <strong>${activeUser.name || "Student"}</strong><br />
            <span class="helper-text">${activeUser.email || ""}</span>
          </div>
          <span class="status-pill inactive">
            <span class="status-dot"></span>
            ${inactiveSummary.statusLabel}
          </span>
        </div>
        <button type="button" id="activate-membership" class="btn btn-enroll btn-enroll-lg">${ENROLL_BTN_HTML}</button>
        <button type="button" id="go-course" class="btn btn-secondary">Browse courses</button>
        <button type="button" id="logout" class="btn btn-ghost">Log out</button>
      </div>
    `;
    root.className = "account-card";
    attachCommonHandlers();
    document.getElementById("activate-membership")?.addEventListener("click", () => {
      enrollWithStripe(activeUser.name, activeUser.email, null);
    });
    return;
  }

  subscriptionSummary = SubscriptionService.getSubscriptionSummary(activeUser.subscription);
  renderEnrolledAccount(activeUser);

  if (manage) {
    refreshSubscription();
  }
}

function renderLogin() {
  const root = document.getElementById("account-root");
  if (!root) return;
  manageOpen = false;
  root.innerHTML = `
    <h1 class="account-title">Log in to your account</h1>
    <p class="account-subtitle">Log in to manage your enrollment and subscription.</p>
    <form class="account-form" id="login-form">
      <div class="field">
        <label for="login-email">Email</label>
        <input id="login-email" name="email" type="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="login-password">Password</label>
        <input id="login-password" name="password" type="password" autocomplete="current-password" required />
        <div class="helper-text">Sign in with the email and password you used when you enrolled.</div>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%; margin-top:4px;">Log in</button>
    </form>
    <div class="spacer"></div>
    <p class="muted-link">
      New here? <button type="button" id="show-signup">Create an account</button>
    </p>
  `;
  document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    if (!email || !password) return;
    setSubmitLoading(true, "Logging in…");
    try {
      await AuthAPI.login({ email, password });
      renderAccount();
    } catch (err) {
      alert(err.message || "Login failed");
    } finally {
      setSubmitLoading(false);
    }
  });
  document.getElementById("show-signup")?.addEventListener("click", () => renderAccount());
}

function attachCommonHandlers() {
  document.getElementById("go-course")?.addEventListener("click", () => {
    window.location.href = "courses.html";
  });
  document.getElementById("logout")?.addEventListener("click", () => {
    manageOpen = false;
    if (window.AuthAPI) AuthAPI.logout();
    else setUser(null);
    renderAccount();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("checkout") === "success" && params.get("session_id")) {
    handleCheckoutReturn();
    return;
  }

  const user = getUser();
  if (user?.token && window.AuthAPI) {
    try {
      await AuthAPI.refreshSession();
    } catch {
      /* ignore */
    }
  }

  const refreshed = getUser();
  if (refreshed?.subscription && window.SubscriptionService) {
    subscriptionSummary = SubscriptionService.getSubscriptionSummary(refreshed.subscription);
  }
  renderAccount();
});
