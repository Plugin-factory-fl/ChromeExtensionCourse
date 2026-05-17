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

function openManageSubscription() {
  manageOpen = true;
  manageStep = "overview";
  manageError = "";
  renderAccount();
  refreshSubscription();
}

function closeManageSubscription() {
  manageOpen = false;
  manageStep = "overview";
  manageError = "";
  renderAccount();
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

function enrollUserWithTrial(name, email) {
  const sub = SubscriptionService.createTrialSubscription();
  setUser({
    name,
    email,
    hasActiveMembership: true,
    subscription: sub,
  });
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
      <h2 class="manage-title">Manage subscription</h2>
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
    <div id="manage-subscription-mount" class="manage-subscription ${manageOpen ? "" : "hidden"}"></div>
  `;

  document.getElementById("manage-subscription")?.addEventListener("click", openManageSubscription);

  if (manageOpen) {
    renderManagePanel();
  }

  root.className = manageOpen ? "account-card account-card--wide" : "account-card";
  attachCommonHandlers();
}

function renderAccount() {
  const root = document.getElementById("account-root");
  if (!root || !window.SubscriptionService) return;

  const user = getUser();
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
          <div class="helper-text">Stored only in your browser until Stripe checkout is connected.</div>
        </div>
        <p class="helper-text">
          Start with a <strong>3-day free trial</strong>, then <strong>$29.99/month</strong> for access to all courses. <strong>Cancel anytime.</strong>
        </p>
        <button type="submit" class="btn btn-enroll btn-enroll-lg" style="width: 100%; margin-top: 8px;">${ENROLL_BTN_HTML}</button>
      </form>
      <div class="spacer"></div>
      <p class="muted-link">
        Already have a local account? <button type="button" id="show-login">Log in</button>
      </p>
    `;

    document.getElementById("signup-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      if (!name || !email) return;
      enrollUserWithTrial(name, email);
      renderAccount();
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
    root.innerHTML = `
      <h1 class="account-title">Your enrollment</h1>
      <p class="account-subtitle">Activate your membership to unlock every course.</p>
      <div class="stack">
        <div class="row">
          <div>
            <strong>${activeUser.name || "Student"}</strong><br />
            <span class="helper-text">${activeUser.email || ""}</span>
          </div>
          <span class="status-pill inactive">
            <span class="status-dot"></span>
            Inactive
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
      enrollUserWithTrial(activeUser.name, activeUser.email);
      renderAccount();
    });
    return;
  }

  subscriptionSummary = SubscriptionService.getSubscriptionSummary(activeUser.subscription);
  renderEnrolledAccount(activeUser);
}

function renderLogin() {
  const root = document.getElementById("account-root");
  if (!root) return;
  manageOpen = false;
  root.innerHTML = `
    <h1 class="account-title">Log in to your account</h1>
    <p class="account-subtitle">If you created a local account on this device, log in to manage your enrollment.</p>
    <form class="account-form" id="login-form">
      <div class="field">
        <label for="login-email">Email</label>
        <input id="login-email" name="email" type="email" autocomplete="email" required />
      </div>
      <div class="field">
        <label for="login-password">Password</label>
        <input id="login-password" name="password" type="password" autocomplete="current-password" required />
        <div class="helper-text">Password is not verified in this demo; your device simply remembers that you logged in.</div>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%; margin-top:4px;">Log in</button>
    </form>
    <div class="spacer"></div>
    <p class="muted-link">
      New here? <button type="button" id="show-signup">Create an account</button>
    </p>
  `;
  document.getElementById("login-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    if (!email) return;
    const existing = getUser();
    const base = existing && existing.email === email ? existing : { name: "Student", email };
    const withSub = SubscriptionService.ensureUserSubscription({
      ...base,
      hasActiveMembership: SubscriptionService.isMembershipActive(
        SubscriptionService.ensureUserSubscription({ ...base, hasActiveMembership: !!base.hasActiveMembership })
      ),
    });
    setUser(withSub);
    renderAccount();
  });
  document.getElementById("show-signup")?.addEventListener("click", () => renderAccount());
}

function attachCommonHandlers() {
  document.getElementById("go-course")?.addEventListener("click", () => {
    window.location.href = "courses.html";
  });
  document.getElementById("logout")?.addEventListener("click", () => {
    manageOpen = false;
    setUser(null);
    renderAccount();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();
  if (user?.hasActiveMembership && window.SubscriptionService) {
    subscriptionSummary = SubscriptionService.getSubscriptionSummary(
      SubscriptionService.ensureUserSubscription(user).subscription
    );
  }
  renderAccount();
});
