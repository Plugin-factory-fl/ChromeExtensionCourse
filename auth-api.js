/** API auth client — register, login, session refresh. Requires billing-config.js + app.js */

function apiBase() {
  return (window.CCC_STRIPE_API_BASE || "").replace(/\/$/, "");
}

function authHeaders() {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const user = typeof getUser === "function" ? getUser() : null;
  if (user?.token) {
    headers.Authorization = `Bearer ${user.token}`;
  }
  return headers;
}

function applySession({ token, user }) {
  if (!user) return;
  const session = { ...user, token: token || getUser()?.token };
  if (typeof setUser === "function") setUser(session);
  return session;
}

async function register({ name, email, password }) {
  const base = apiBase();
  if (!base) throw new Error("Billing API is not configured.");
  const res = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return applySession(data);
}

async function login({ email, password }) {
  const base = apiBase();
  if (!base) throw new Error("Billing API is not configured.");
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Login failed");
  return applySession(data);
}

async function fetchMe() {
  const base = apiBase();
  const user = typeof getUser === "function" ? getUser() : null;
  if (!base || !user?.token) return user;

  const res = await fetch(`${base}/auth/me`, {
    headers: authHeaders(),
  });
  if (res.status === 401) {
    if (typeof setUser === "function") setUser(null);
    return null;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return user;
  return applySession({ token: user.token, user: data.user });
}

async function refreshSession() {
  return fetchMe();
}

function logout() {
  if (typeof setUser === "function") setUser(null);
}

window.AuthAPI = {
  apiBase,
  authHeaders,
  register,
  login,
  fetchMe,
  refreshSession,
  logout,
};
