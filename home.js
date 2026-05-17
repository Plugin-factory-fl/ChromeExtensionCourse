document.addEventListener("DOMContentLoaded", () => {
  const previewLink = document.querySelector('a[href="#course-preview"]');
  if (previewLink) {
    previewLink.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("course-preview");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }
});
