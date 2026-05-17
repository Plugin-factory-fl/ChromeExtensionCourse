(function initThemeEarly() {
  const STORAGE_KEY = "ccc-theme";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const theme = stored === "light" || stored === "dark" ? stored : "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
