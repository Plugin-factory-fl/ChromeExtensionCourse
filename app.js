const STORAGE_KEY = "chrome_ext_course_user";
const THEME_STORAGE_KEY = "ccc-theme";

const MEMBERSHIP_PRICE = "$29.99";

const ENROLL_BTN_HTML =
  '<span class="btn-enroll-label">Enroll Now – 3-day Free Trial</span><span class="btn-enroll-sub">then ' +
  MEMBERSHIP_PRICE +
  '/month</span><span class="btn-enroll-cancel">Cancel Anytime</span>';

const THEME_ICONS = {
  sun: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
};

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function setTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  updateThemeToggle();
}

function updateThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const isLight = getTheme() === "light";
  btn.innerHTML = isLight ? THEME_ICONS.moon : THEME_ICONS.sun;
  btn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  btn.title = isLight ? "Dark mode" : "Light mode";
}

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  if (!btn.dataset.themeBound) {
    btn.dataset.themeBound = "true";
    btn.addEventListener("click", () => {
      setTheme(getTheme() === "dark" ? "light" : "dark");
    });
  }
  updateThemeToggle();
}

function onDocumentReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

function getUser() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setUser(user) {
  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function isLoggedIn() {
  const user = getUser();
  return !!(user && user.email);
}

function hasActiveMembership() {
  const user = getUser();
  if (window.SubscriptionService) {
    return SubscriptionService.isMembershipActive(user);
  }
  return !!(user && user.hasActiveMembership);
}

function syncThemeFromStorage() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch {
    /* ignore */
  }
}

function isEnrollPromoElement(el) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.closest("#manage-modal")) return false;
  if (el.id === "go-course" || el.id === "activate-membership") return false;

  if (el.classList.contains("nav-cta") || el.classList.contains("floating-cta")) return true;

  const href = el.getAttribute("href") || "";
  if (href.includes("account.html") && href.includes("start=1")) return true;
  if (el.classList.contains("btn-enroll-lg") && href.includes("account.html")) return true;
  if (el.querySelector(".btn-enroll-label")) return true;

  if (el.classList.contains("btn-enroll") && /enroll now/i.test(el.textContent || "")) return true;

  return false;
}

function hideEnrollPromoButtons() {
  const member = hasActiveMembership();
  document.body.classList.toggle("has-membership", member);

  document.querySelectorAll("a.btn-enroll, button.btn-enroll").forEach((el) => {
    if (!isEnrollPromoElement(el)) return;
    el.classList.toggle("hidden", member);
    if (member) el.setAttribute("aria-hidden", "true");
    else el.removeAttribute("aria-hidden");
  });
}

function initNav() {
  syncThemeFromStorage();
  initThemeToggle();
  const page = document.body.getAttribute("data-page");
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    const name = link.getAttribute("data-nav");
    const isBlog = (page === "blog" || page === "blog-post") && name === "blog";
    const isCourses = (page === "courses" || page === "course") && name === "courses";
    if (name === page || isBlog || isCourses) {
      link.classList.add("is-active");
    }
  });
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  initFloatingCta(page);
  hideEnrollPromoButtons();
}

function applyMembershipUi() {
  initNav();
  protectCoursePage();
}

function protectCoursePage() {
  const locked = document.getElementById("course-locked");
  const content = document.getElementById("course-content");
  if (!locked || !content) return;

  if (hasActiveMembership()) {
    locked.classList.add("hidden");
    content.classList.remove("hidden");
  } else {
    locked.classList.remove("hidden");
    content.classList.add("hidden");
  }
}

function initFloatingCta(page) {
  const existing = document.getElementById("floating-membership-cta");
  if (existing) {
    existing.remove();
  }
  const shouldShow = !hasActiveMembership() && (page === "home" || page === "course" || page === "courses");
  if (!shouldShow) return;

  const btn = document.createElement("a");
  btn.id = "floating-membership-cta";
  btn.href = "account.html?start=1";
  btn.className = "btn btn-enroll floating-cta";
  btn.innerHTML = ENROLL_BTN_HTML;
  document.body.appendChild(btn);
}

async function bootstrapApp() {
  const user = getUser();
  if (user?.token && window.AuthAPI) {
    try {
      await AuthAPI.refreshSession();
    } catch {
      /* ignore */
    }
  }
  applyMembershipUi();
}

window.hideEnrollPromoButtons = hideEnrollPromoButtons;
window.applyMembershipUi = applyMembershipUi;
window.hasActiveMembership = hasActiveMembership;

onDocumentReady(bootstrapApp);
