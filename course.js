const courseSections = [
  {
    id: "part-1",
    title: "Part 1 — Foundations",
    lessons: [
      {
        id: "mv3-architecture",
        title: "Chrome extension architecture (MV3)",
        duration: "18 min",
        videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
        description:
          "Understand popup, options page, side panel, content scripts, and the background service worker—and how Cursor helps you wire them together.",
        takeaways: [
          "Map each extension surface to a real use case in your project.",
          "Know when to use content scripts vs. the service worker.",
          "Avoid common MV3 lifecycle and permission mistakes early.",
        ],
      },
      {
        id: "cursor-setup",
        title: "Installing & configuring Cursor AI",
        duration: "15 min",
        videoSrc: "https://www.w3schools.com/html/movie.mp4",
        description:
          "Set up Composer and Agents with prompt patterns tuned for Chrome extension work.",
        takeaways: [
          "Configure Cursor for extension folder structures.",
          "Write prompts that produce valid manifest.json files.",
          "Iterate quickly when Chrome rejects a load or permission.",
        ],
      },
      {
        id: "quote-popup",
        title: "Project: Quote of the Day popup",
        duration: "20 min",
        videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
        description:
          "Build and load a tiny popup extension in under 15 minutes using only Cursor prompts.",
        takeaways: [
          "Generate manifest, popup HTML/CSS, and service worker from prompts.",
          "Load unpacked in chrome://extensions and debug with DevTools.",
          "Ship a working extension you can extend in Part 2.",
        ],
      },
    ],
  },
  {
    id: "part-2",
    title: "Part 2 — First Real Extension",
    lessons: [
      {
        id: "folder-structure",
        title: "Prompting for complete folder structure",
        duration: "22 min",
        videoSrc: "https://www.w3schools.com/html/movie.mp4",
        description:
          "Use Cursor to scaffold manifest.json, popup UI, service worker, and content scripts for a real tool.",
        takeaways: [
          "Request a production-ready file tree in one prompt sequence.",
          "Validate permissions before your first test load.",
          "Keep popup, background, and content script responsibilities clear.",
        ],
      },
      {
        id: "storage-dom",
        title: "Storage, content scripts & DOM",
        duration: "25 min",
        videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
        description:
          "Persist data with chrome.storage and interact with page DOM safely from content scripts.",
        takeaways: [
          "Choose sync vs. local storage for your use case.",
          "Inject scripts only where permissions allow.",
          "Handle errors and edge cases in the testing workflow.",
        ],
      },
      {
        id: "simple-project",
        title: "Project: Build your simple extension",
        duration: "35 min",
        videoSrc: "https://www.w3schools.com/html/movie.mp4",
        description:
          "Pick an idea—tab organizer, LinkedIn summarizer, price tracker—and build it end-to-end with guided prompts.",
        takeaways: [
          "Follow a repeatable prompt sequence from idea to working build.",
          "Iterate with Cursor: dark mode, export, and polish features.",
          "Leave Part 2 with a publishable foundation for Part 3.",
        ],
      },
    ],
  },
  {
    id: "part-3",
    title: "Part 3 — Dashboard + Login",
    lessons: [
      {
        id: "render-backend",
        title: "Choosing Render & secure auth",
        duration: "28 min",
        videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
        description:
          "Prompt Cursor for email/password, Google OAuth, or magic-link flows backed by Render.",
        takeaways: [
          "Stand up a minimal backend on Render.",
          "Keep tokens and secrets out of the extension bundle.",
          "Follow privacy best practices for user data.",
        ],
      },
      {
        id: "dashboard-sync",
        title: "Dashboard & extension sync",
        duration: "32 min",
        videoSrc: "https://www.w3schools.com/html/movie.mp4",
        description:
          "Build a side panel or options-page dashboard and sync data between extension and server.",
        takeaways: [
          "Use chrome.runtime messaging across popup, panel, and background.",
          "Store user-specific data on the backend.",
          "Handle offline and re-auth gracefully.",
        ],
      },
      {
        id: "login-project",
        title: "Project: Upgrade with login + dashboard",
        duration: "40 min",
        videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
        description:
          "Upgrade your Part 2 extension with accounts and a personalized dashboard using the exact prompt sequence from the course.",
        takeaways: [
          "Gate features behind authenticated state.",
          "Sync preferences and user content to Render.",
          "Deliver the full-stack “wow” milestone of the course.",
        ],
      },
    ],
  },
  {
    id: "part-4",
    title: "Part 4 — Monetize with Stripe",
    lessons: [
      {
        id: "stripe-basics",
        title: "Stripe basics for extensions",
        duration: "24 min",
        videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
        description:
          "Subscriptions, one-time payments, and checkout flows—prompted through Cursor with minimal backend pain.",
        takeaways: [
          "Set up Stripe test mode for safe learning.",
          "Understand customer vs. subscription objects.",
          "Plan freemium limits before you code gating logic.",
        ],
      },
      {
        id: "webhooks-gating",
        title: "Webhooks & payment gating",
        duration: "30 min",
        videoSrc: "https://www.w3schools.com/html/movie.mp4",
        description:
          "Verify payment status in the service worker and unlock premium features reliably.",
        takeaways: [
          "Handle Stripe webhooks on Render.",
          "Reflect subscription state inside the extension.",
          "Show upgrade prompts at the right moments.",
        ],
      },
      {
        id: "stripe-project",
        title: "Project: Add a paid tier",
        duration: "38 min",
        videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
        description:
          "Add a paid tier to your Part 3 extension—unlimited saves, premium features—and test live in Stripe test mode.",
        takeaways: [
          "Implement checkout and return URLs.",
          "Gate premium UI and API calls by plan.",
          "Use the Stripe dashboard for receipts and debugging.",
        ],
      },
    ],
  },
  {
    id: "part-5",
    title: "Part 5 — Publish & Scale",
    lessons: [
      {
        id: "web-store",
        title: "Chrome Web Store submission",
        duration: "26 min",
        videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
        description:
          "Submit your extension with optimized icons, screenshots, and description SEO.",
        takeaways: [
          "Complete the developer dashboard checklist.",
          "Write listing copy that converts.",
          "Avoid common rejection reasons on first submit.",
        ],
      },
      {
        id: "marketing-analytics",
        title: "Marketing & analytics",
        duration: "22 min",
        videoSrc: "https://www.w3schools.com/html/movie.mp4",
        description:
          "CWS SEO, content marketing, and lightweight analytics (Google Analytics or Plausible) inside extensions.",
        takeaways: [
          "Track what matters without hurting performance.",
          "Build a simple launch content plan.",
          "Prepare for 10k+ users: updates and support.",
        ],
      },
      {
        id: "launch-project",
        title: "Project: Publish & launch video",
        duration: "30 min",
        videoSrc: "https://www.w3schools.com/html/mov_bbb.mp4",
        description:
          "Publish your monetized extension and create a 60-second launch video using the course template.",
        takeaways: [
          "Ship to the Chrome Web Store with confidence.",
          "Record a compelling demo for social and landing pages.",
          "Know your next steps for community and iteration.",
        ],
      },
    ],
  },
];

let currentSectionIndex = 0;
let currentLessonIndex = 0;

function setCurrentLesson(sectionIndex, lessonIndex) {
  currentSectionIndex = sectionIndex;
  currentLessonIndex = lessonIndex;
  renderSidebar();
  renderLesson();
}

function renderSidebar() {
  const container = document.getElementById("course-sidebar-inner");
  if (!container) return;
  container.innerHTML = "";

  courseSections.forEach((section, sIdx) => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "course-section";

    const title = document.createElement("h2");
    title.className = "course-section-title";
    title.textContent = section.title;
    sectionEl.appendChild(title);

    const ul = document.createElement("ul");
    ul.className = "lesson-list";

    section.lessons.forEach((lesson, lIdx) => {
      const li = document.createElement("li");
      li.className = "lesson-item";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lesson-button";
      if (sIdx === currentSectionIndex && lIdx === currentLessonIndex) {
        btn.classList.add("is-active");
      }
      btn.innerHTML = `
        <div>
          <div class="lesson-label">${lesson.title}</div>
          <div class="lesson-meta-small">${lesson.duration}</div>
        </div>
        <div class="lesson-progress-dot"></div>
      `;
      btn.addEventListener("click", () => setCurrentLesson(sIdx, lIdx));
      li.appendChild(btn);
      ul.appendChild(li);
    });

    sectionEl.appendChild(ul);
    container.appendChild(sectionEl);
  });
}

function renderLesson() {
  const section = courseSections[currentSectionIndex];
  const lesson = section.lessons[currentLessonIndex];
  const titleEl = document.getElementById("lesson-title");
  const descEl = document.getElementById("lesson-description");
  const takeawaysEl = document.getElementById("lesson-takeaways");
  const videoSource = document.getElementById("lesson-video-source");
  const videoEl = document.getElementById("lesson-video");

  if (!titleEl || !descEl || !takeawaysEl || !videoSource || !videoEl) return;

  titleEl.textContent = lesson.title;
  descEl.textContent = lesson.description;
  takeawaysEl.innerHTML = "";
  (lesson.takeaways || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    takeawaysEl.appendChild(li);
  });

  videoSource.src = lesson.videoSrc || "";
  videoEl.load();
}

function goToPrevLesson() {
  if (currentLessonIndex > 0) {
    setCurrentLesson(currentSectionIndex, currentLessonIndex - 1);
    return;
  }
  if (currentSectionIndex > 0) {
    const prevSectionIndex = currentSectionIndex - 1;
    const prevLessons = courseSections[prevSectionIndex].lessons;
    setCurrentLesson(prevSectionIndex, prevLessons.length - 1);
  }
}

function goToNextLesson() {
  const lessons = courseSections[currentSectionIndex].lessons;
  if (currentLessonIndex < lessons.length - 1) {
    setCurrentLesson(currentSectionIndex, currentLessonIndex + 1);
    return;
  }
  if (currentSectionIndex < courseSections.length - 1) {
    setCurrentLesson(currentSectionIndex + 1, 0);
  }
}

function initCoursePage() {
  protectCoursePage();
  if (!hasActiveMembership()) {
    return;
  }
  renderSidebar();
  renderLesson();

  const prevBtn = document.getElementById("prev-lesson");
  const nextBtn = document.getElementById("next-lesson");
  if (prevBtn) {
    prevBtn.addEventListener("click", goToPrevLesson);
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", goToNextLesson);
  }
}

document.addEventListener("DOMContentLoaded", initCoursePage);
