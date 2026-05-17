function renderCoursesCatalog() {
  const grid = document.getElementById("courses-grid");
  const catalog = window.COURSE_CATALOG;
  if (!grid || !catalog || !catalog.courses) return;

  grid.innerHTML = "";
  catalog.courses.forEach((course) => {
    const card = document.createElement("article");
    card.className = "course-catalog-card";
    card.innerHTML = `
      <div class="course-catalog-icon" aria-hidden="true">${course.icon}</div>
      <span class="course-catalog-tag">${course.tag}</span>
      <h2 class="course-catalog-title">${course.title}</h2>
      <p class="course-catalog-desc">${course.description}</p>
      <ul class="course-catalog-meta">
        <li>${course.parts} parts</li>
        <li>${course.hours} hours of video</li>
      </ul>
      <a href="${course.slug}" class="btn btn-primary course-catalog-cta">View course</a>
    `;
    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", renderCoursesCatalog);
