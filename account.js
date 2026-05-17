function parseQuery() {
  const params = new URLSearchParams(window.location.search);
  return {
    start: params.get("start") === "1",
  };
}

function renderAccount() {
  const root = document.getElementById("account-root");
  if (!root) return;

  const user = getUser();
  const { start } = parseQuery();

  if (!user) {
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
          <div class="helper-text">Stored only in your browser for this demo—no real payments or servers yet.</div>
        </div>
        <p class="helper-text">
          Start with a <strong>3-day free trial</strong>, then <strong>$39.99/month</strong> for access to all courses. In this preview version, checkout is simulated locally so you can try the full flow.
        </p>
        <button type="submit" class="btn btn-enroll btn-enroll-lg" style="width: 100%; margin-top: 8px;"><span class="btn-enroll-label">Enroll Now – 3-day Free Trial</span><span class="btn-enroll-sub">then $39.99/month</span></button>
      </form>
      <div class="spacer"></div>
      <p class="muted-link">
        Already have a local account? <button type="button" id="show-login">Log in</button>
      </p>
    `;

    const signupForm = document.getElementById("signup-form");
    const showLogin = document.getElementById("show-login");
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const form = e.target;
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        if (!name || !email) return;
        setUser({ name, email, hasActiveMembership: true });
        renderAccount();
      });
    }
    if (showLogin) {
      showLogin.addEventListener("click", () => renderLogin());
    }
    if (start && document.getElementById("name")) {
      document.getElementById("name").focus();
    }
    return;
  }

  if (!user.hasActiveMembership) {
    root.innerHTML = `
      <h1 class="account-title">Your enrollment</h1>
      <p class="account-subtitle">Activate your membership to unlock every course.</p>
      <div class="stack">
        <div class="row">
          <div>
            <strong>${user.name || "Student"}</strong><br />
            <span class="helper-text">${user.email || ""}</span>
          </div>
          <span class="status-pill inactive">
            <span class="status-dot"></span>
            Inactive
          </span>
        </div>
        <button type="button" id="activate-membership" class="btn btn-enroll btn-enroll-lg"><span class="btn-enroll-label">Enroll Now – 3-day Free Trial</span><span class="btn-enroll-sub">then $39.99/month</span></button>
        <button type="button" id="go-course" class="btn btn-secondary">Browse courses</button>
        <button type="button" id="logout" class="btn btn-ghost">Log out</button>
      </div>
    `;
    attachCommonHandlers();
    const activate = document.getElementById("activate-membership");
    if (activate) {
      activate.addEventListener("click", () => {
        setUser({ ...user, hasActiveMembership: true });
        renderAccount();
      });
    }
    return;
  }

  root.innerHTML = `
    <h1 class="account-title">You’re enrolled.</h1>
    <p class="account-subtitle">
      Your membership is active. Pick a course and start building with Cursor.
    </p>
    <div class="stack">
      <div class="row">
        <div>
          <strong>${user.name || "Student"}</strong><br />
          <span class="helper-text">${user.email || ""}</span>
        </div>
        <span class="status-pill active">
          <span class="status-dot"></span>
          Active
        </span>
      </div>
      <button type="button" id="go-course" class="btn btn-enroll">Browse courses</button>
      <button type="button" id="cancel-membership" class="btn btn-secondary">Remove course access (demo)</button>
      <button type="button" id="logout" class="btn btn-ghost">Log out</button>
      <p class="helper-text">
        In the future, this page will connect to real billing and a backend. For now, everything lives locally in your browser.
      </p>
    </div>
  `;

  attachCommonHandlers(true);
}

function renderLogin() {
  const root = document.getElementById("account-root");
  if (!root) return;
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
  const loginForm = document.getElementById("login-form");
  const showSignup = document.getElementById("show-signup");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      const email = form.email.value.trim();
      if (!email) return;
      const existing = getUser();
      const base = existing && existing.email === email ? existing : { name: "Student", email };
      setUser({ ...base, hasActiveMembership: !!base.hasActiveMembership });
      renderAccount();
    });
  }
  if (showSignup) {
    showSignup.addEventListener("click", () => renderAccount());
  }
}

function attachCommonHandlers(includeCancel) {
  const goCourse = document.getElementById("go-course");
  const logout = document.getElementById("logout");
  const cancel = includeCancel ? document.getElementById("cancel-membership") : null;

  if (goCourse) {
    goCourse.addEventListener("click", () => {
      window.location.href = "courses.html";
    });
  }
  if (logout) {
    logout.addEventListener("click", () => {
      setUser(null);
      renderAccount();
    });
  }
  if (cancel) {
    cancel.addEventListener("click", () => {
      const user = getUser();
      if (!user) return;
      setUser({ ...user, hasActiveMembership: false });
      renderAccount();
    });
  }
}

document.addEventListener("DOMContentLoaded", renderAccount);
