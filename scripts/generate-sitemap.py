#!/usr/bin/env python3
"""Regenerate sitemap.xml from all public HTML pages in the repo."""

from __future__ import annotations

from datetime import date
from pathlib import Path

BASE_URL = "https://plugin-factory-fl.github.io/ChromeExtensionCourse"
ROOT = Path(__file__).resolve().parent.parent
TODAY = date.today().isoformat()

# path, changefreq, priority
PAGES: list[tuple[str, str, str]] = [
    ("/", "weekly", "1.0"),
    ("/index.html", "weekly", "1.0"),
    ("/courses.html", "weekly", "0.95"),
    ("/course-chrome-extensions.html", "weekly", "0.95"),
    ("/course-websites.html", "monthly", "0.7"),
    ("/account.html", "monthly", "0.75"),
    ("/blog.html", "weekly", "0.9"),
    # Priority guides for target keywords
    ("/blog/best-chrome-extension-course.html", "monthly", "0.85"),
    ("/blog/create-chrome-extension-cursor-ai.html", "monthly", "0.85"),
    ("/blog/create-chrome-extension-step-by-step.html", "monthly", "0.85"),
    ("/blog/how-to-build-chrome-extension.html", "monthly", "0.85"),
    ("/blog/chrome-extension-course-cursor.html", "monthly", "0.85"),
    ("/blog/chrome-extension-course-guide.html", "monthly", "0.85"),
    ("/blog/build-micro-saas-with-cursor-ai.html", "monthly", "0.85"),
    ("/blog/build-micro-saas-step-by-step.html", "monthly", "0.85"),
    ("/blog/how-to-build-micro-saas-2026.html", "monthly", "0.85"),
    ("/blog/build-micro-saas-chrome-extension.html", "monthly", "0.85"),
    ("/blog/best-micro-saas-ideas-2026.html", "monthly", "0.8"),
]

BLOG_DIR = ROOT / "blog"
if BLOG_DIR.is_dir():
    listed = {p for p, _, _ in PAGES}
    for path in sorted(BLOG_DIR.glob("*.html")):
        rel = f"/blog/{path.name}"
        if rel not in listed:
            PAGES.append((rel, "monthly", "0.75"))


def url_entry(loc: str, changefreq: str, priority: str) -> str:
    return f"""  <url>
    <loc>{loc}</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>"""


def main() -> None:
    entries = [url_entry(f"{BASE_URL}{path}", cf, pr) for path, cf, pr in PAGES]
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(entries)
        + "\n</urlset>\n"
    )
    out = ROOT / "sitemap.xml"
    out.write_text(xml, encoding="utf-8")
    print(f"Wrote {len(entries)} URLs to {out}")


if __name__ == "__main__":
    main()
