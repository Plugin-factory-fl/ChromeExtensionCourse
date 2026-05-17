function renderHomeCoursesGrid() {
  const grid = document.getElementById("home-courses-grid");
  const catalog = window.COURSE_CATALOG;
  const createCard = window.createCourseCatalogCard;
  if (!grid || !catalog || !catalog.courses || !createCard) return;

  grid.innerHTML = "";
  catalog.courses.forEach((course) => {
    grid.appendChild(createCard(course, "h3"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderHomeCoursesGrid();
});
