(function initThemeEarly() {
  const STORAGE_KEY = "ccc-theme";
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme === "light" ? "light" : "dark");
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
      return;
    }
  } catch {
    /* ignore */
  }

  applyTheme("dark");
})();
