function createCourseCatalogCard(course, titleTag) {
  const Tag = titleTag || "h2";
  const isSoon = !!course.comingSoon;
  const soonLabel = course.comingSoonLabel || "Course Coming Soon: June 2026";

  const card = document.createElement("article");
  card.className = isSoon
    ? "course-catalog-card course-catalog-card--coming-soon"
    : "course-catalog-card";

  const title = document.createElement(Tag);
  title.className = "course-catalog-title";
  title.textContent = course.title;

  if (isSoon) {
    const badge = document.createElement("p");
    badge.className = "course-catalog-soon-badge";
    badge.setAttribute("role", "status");
    badge.textContent = soonLabel;
    card.appendChild(badge);

    const body = document.createElement("div");
    body.className = "course-catalog-card-body";
    body.innerHTML = `
      <div class="course-catalog-icon" aria-hidden="true">${course.icon}</div>
      <span class="course-catalog-tag">${course.tag}</span>
      <p class="course-catalog-desc">${course.description}</p>
      <ul class="course-catalog-meta">
        <li>${course.parts} parts</li>
        <li>${course.hours} hours of video</li>
      </ul>
    `;
    body.querySelector(".course-catalog-tag").after(title);
    card.appendChild(body);

    const cta = document.createElement("span");
    cta.className = "btn btn-secondary course-catalog-cta is-disabled";
    cta.textContent = "Coming soon";
    cta.setAttribute("aria-disabled", "true");
    body.appendChild(cta);
    return card;
  }

  card.innerHTML = `
    <div class="course-catalog-icon" aria-hidden="true">${course.icon}</div>
    <span class="course-catalog-tag">${course.tag}</span>
    <p class="course-catalog-desc">${course.description}</p>
    <ul class="course-catalog-meta">
      <li>${course.parts} parts</li>
      <li>${course.hours} hours of video</li>
    </ul>
  `;
  card.querySelector(".course-catalog-tag").after(title);

  const cta = document.createElement("a");
  cta.href = course.slug;
  cta.className = "btn btn-primary course-catalog-cta";
  cta.textContent = "View course";
  card.appendChild(cta);

  return card;
}

function renderCoursesCatalog() {
  const grid = document.getElementById("courses-grid");
  const catalog = window.COURSE_CATALOG;
  if (!grid || !catalog || !catalog.courses) return;

  grid.innerHTML = "";
  catalog.courses.forEach((course) => {
    grid.appendChild(createCourseCatalogCard(course, "h2"));
  });
}

window.createCourseCatalogCard = createCourseCatalogCard;

document.addEventListener("DOMContentLoaded", renderCoursesCatalog);
