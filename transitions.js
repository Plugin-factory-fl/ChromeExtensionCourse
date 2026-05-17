(function initPageTransitions() {
  const CURTAIN_ID = "page-curtain";
  const EXIT_MS = 750;
  const ENTER_DELAY_MS = 120;

  function ensureCurtain() {
    let curtain = document.getElementById(CURTAIN_ID);
    if (!curtain) {
      curtain = document.createElement("div");
      curtain.id = CURTAIN_ID;
      curtain.className = "page-curtain";
      curtain.setAttribute("aria-hidden", "true");
      document.body.prepend(curtain);
    }
    return curtain;
  }

  function markRevealTargets() {
    const selectors = [
      ".site-header",
      ".top-banner",
      ".hero .container > *",
      ".section .container",
      ".site-footer",
      ".account-card",
      ".course-locked-card",
      ".course-content",
    ];
    let delayIndex = 0;
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        if (el.classList.contains("reveal-on-load")) return;
        el.classList.add("reveal-on-load");
        const step = Math.min(delayIndex, 8);
        el.style.setProperty("--reveal-delay", `${step * 0.1}s`);
        delayIndex += 1;
      });
    });
  }

  function finishEnter() {
    window.setTimeout(() => {
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
    }, ENTER_DELAY_MS);
  }

  function bindExitOnNavigate() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      let url;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      event.preventDefault();
      document.body.classList.add("is-exiting");
      document.body.classList.remove("is-ready");

      window.setTimeout(() => {
        window.location.href = link.href;
      }, EXIT_MS);
    });
  }

  document.body.classList.add("is-loading");
  ensureCurtain();
  markRevealTargets();
  bindExitOnNavigate();

  if (document.readyState === "complete") {
    finishEnter();
  } else {
    window.addEventListener("load", finishEnter, { once: true });
  }
})();
