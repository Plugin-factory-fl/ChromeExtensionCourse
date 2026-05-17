const STORAGE_KEY = "chrome_ext_course_user";
const THEME_STORAGE_KEY = "ccc-theme";

const ENROLL_BTN_HTML =
  '<span class="btn-enroll-label">Enroll Now – 3-day Free Trial</span><span class="btn-enroll-sub">then $39.99 one-time payment</span>';

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
  let btn = document.getElementById("theme-toggle");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.id = "theme-toggle";
    btn.className = "theme-toggle";
    document.body.appendChild(btn);
  }
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
  return !!getUser();
}

function hasActiveMembership() {
  const user = getUser();
  return !!(user && user.hasActiveMembership);
}

function initNav() {
  initThemeToggle();
  const page = document.body.getAttribute("data-page");
  const links = document.querySelectorAll(".nav-link");
  links.forEach((link) => {
    const name = link.getAttribute("data-nav");
    const isBlog = (page === "blog" || page === "blog-post") && name === "blog";
    if (name === page || isBlog) {
      link.classList.add("is-active");
    }
  });
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const navCta = document.querySelector(".nav-cta");
  if (navCta) {
    if (hasActiveMembership()) {
      navCta.classList.add("hidden");
    } else {
      navCta.classList.remove("hidden");
    }
  }

  initFloatingCta(page);
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
  const shouldShow = !hasActiveMembership() && (page === "home" || page === "course");
  if (!shouldShow) return;

  const btn = document.createElement("a");
  btn.id = "floating-membership-cta";
  btn.href = "account.html?start=1";
  btn.className = "btn btn-enroll floating-cta";
  btn.innerHTML = ENROLL_BTN_HTML;
  document.body.appendChild(btn);
}

onDocumentReady(initNav);
