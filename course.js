let courseSections = [];
let currentSectionIndex = 0;
let currentLessonIndex = 0;

function getCourseId() {
  return document.body.getAttribute("data-course") || "chrome-extensions";
}

function getCourseMeta() {
  const catalog = window.COURSE_CATALOG;
  if (!catalog) return null;
  return catalog.courses.find((c) => c.id === getCourseId()) || null;
}

function loadCourseSections() {
  const catalog = window.COURSE_CATALOG;
  if (!catalog || !catalog.curricula) return [];
  return catalog.curricula[getCourseId()] || [];
}

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

  const meta = getCourseMeta();
  if (meta) {
    const back = document.createElement("a");
    back.href = "courses.html";
    back.className = "course-back-link";
    back.textContent = "← All courses";
    container.appendChild(back);

    const heading = document.createElement("h2");
    heading.className = "course-sidebar-title";
    heading.textContent = meta.shortTitle;
    container.appendChild(heading);
  }

  courseSections.forEach((section, sIdx) => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "course-section";

    const title = document.createElement("h3");
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
  if (!section) return;
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

function updateLockedCopy() {
  const meta = getCourseMeta();
  const titleEl = document.getElementById("course-locked-title");
  const descEl = document.getElementById("course-locked-desc");
  if (titleEl && meta) titleEl.textContent = `${meta.title} is locked`;
  if (descEl) {
    descEl.innerHTML = `Subscribe to <strong>Create with Cursor</strong> for <strong>$29.99/month</strong> (cancel anytime) to unlock every course—including <strong>${meta ? meta.shortTitle : "this course"}</strong> and all future releases.`;
  }
}

function showComingSoonPage(meta) {
  const locked = document.getElementById("course-locked");
  const content = document.getElementById("course-content");
  const titleEl = document.getElementById("course-locked-title");
  const descEl = document.getElementById("course-locked-desc");
  const enrollBtn = locked && locked.querySelector(".btn-enroll");

  if (content) content.classList.add("hidden");
  if (!locked) return;

  locked.classList.remove("hidden");
  if (titleEl) titleEl.textContent = meta.comingSoonLabel || "Course Coming Soon: June 2026";
  if (descEl) {
    descEl.textContent = `${meta.title} is not available yet. Browse the courses that are open now, or check back in June 2026.`;
  }
  if (enrollBtn) enrollBtn.classList.add("hidden");
}

function isCourseComingSoon(meta) {
  if (meta && meta.comingSoon) return true;
  return document.body.getAttribute("data-coming-soon") === "true";
}

async function initCoursePage() {
  const meta = getCourseMeta();
  if (isCourseComingSoon(meta)) {
    showComingSoonPage(meta || { title: "This course", comingSoonLabel: "Course Coming Soon: June 2026" });
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

  courseSections = loadCourseSections();
  updateLockedCopy();
  protectCoursePage();
  if (!hasActiveMembership()) {
    return;
  }
  renderSidebar();
  renderLesson();

  const prevBtn = document.getElementById("prev-lesson");
  const nextBtn = document.getElementById("next-lesson");
  if (prevBtn) prevBtn.addEventListener("click", goToPrevLesson);
  if (nextBtn) nextBtn.addEventListener("click", goToNextLesson);
}

document.addEventListener("DOMContentLoaded", initCoursePage);
