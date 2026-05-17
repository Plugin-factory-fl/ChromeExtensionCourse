#!/usr/bin/env python3
"""Generate SEO blog HTML posts in blog/."""
from __future__ import annotations

import json
from datetime import date, timedelta
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = REPO_ROOT / "blog"
BASE_URL = "https://plugin-factory-fl.github.io/ChromeExtensionCourse"
GLOBAL_KEYWORDS = (
    "build chrome extension, create chrome extension, "
    "cursor ai development, chrome extension course"
)

ENROLL_NAV_HTML = "Enroll Now"

ENROLL_BTN_HTML = (
    '<span class="btn-enroll-label">Enroll Now – 3-day Free Trial</span>'
    '<span class="btn-enroll-sub">then $39.99 one-time payment</span>'
)

SLUGS = [
    "how-to-build-chrome-extension",
    "create-chrome-extension-cursor-ai",
    "cursor-ai-development-beginners",
    "best-chrome-extension-course",
    "build-chrome-extension-no-experience",
    "create-chrome-extension-step-by-step",
    "cursor-ai-development-workflow",
    "chrome-extension-course-guide",
    "build-chrome-extension-first-hour",
    "create-chrome-extension-make-money",
    "cursor-ai-development-vs-coding",
    "chrome-extension-course-cursor",
    "build-chrome-extension-checklist",
    "create-chrome-extension-2026",
    "cursor-ai-development-setup",
]


def slug_to_title(slug: str) -> str:
    return slug.replace("-", " ").title()


def primary_keyword(slug: str) -> str:
    if "cursor-ai" in slug or slug.startswith("cursor"):
        return "cursor ai development"
    if "course" in slug:
        return "chrome extension course"
    if slug.startswith("create"):
        return "create chrome extension"
    return "build chrome extension"


def related_slugs(slug: str, n: int = 3) -> list[str]:
    i = SLUGS.index(slug)
    return [SLUGS[(i + k) % len(SLUGS)] for k in range(1, n + 1)]


def body_paragraphs(slug: str, h1: str, kw: str) -> list[str]:
    course = "Create with Cursor by Alexander Miller"
    p1 = (
        f"If you searched for how to {h1.lower()}, you are in the right place. "
        f"Thousands of beginners want to {kw} without years of traditional programming study. "
        f"Modern tools—especially Cursor—let you describe what you want in plain English and get working code you can load in Chrome within an afternoon. "
        f"This article walks through mindset, setup, and the first milestones so you know exactly what to do next."
    )
    p2 = (
        f"A {kw} project always starts with a tiny, testable idea. Pick something you would actually use: saving a snippet from a page, tweaking how a site looks, or opening a quick note. "
        f"Chrome extensions use a manifest file, optional popup HTML, and small scripts that run on pages you choose. "
        f"You do not need to memorize every API on day one; you need a loop of prompt, generate, load unpacked in chrome://extensions, and fix what breaks. "
        f"That loop is the same whether you are experienced or learning {kw} for the first time."
    )
    p3 = (
        f"Cursor ai development shines when you treat the editor as a patient pair programmer. "
        f"Paste the error from the extensions page, share your manifest.json, and ask for the smallest change that fixes one issue. "
        f"Avoid giant rewrites until something works end to end. "
        f"Version control—even a simple folder copy before each session—saves you when an AI suggestion goes sideways. "
        f"For topics like {slug.replace('-', ' ')}, consistency beats cleverness: ship a boring v1, then add features users ask for."
    )
    p4 = (
        f"To build chrome extension skills quickly, follow a structured chrome extension course instead of random tutorials. "
        f"Look for lessons that cover manifest version 3, content scripts, messaging between popup and background, and publishing basics. "
        f"The {course} program is built for non-developers: short videos, copy-paste prompts, and checkpoints so you always have a running project in the browser. "
        f"When content matches how you learn, you spend less time guessing folder names and more time validating your idea in the real world."
    )
    p5 = (
        f"Many students ask whether they can create chrome extension products that earn income. "
        f"You can start free, add optional payments later, and list in the Chrome Web Store when you are proud of the UX. "
        f"Even a simple utility with clear screenshots and honest permissions can find an audience. "
        f"Focus on one job-to-be-done, document privacy in plain language, and iterate from reviews. "
        f"Monetization is a chapter, not day one—but designing with value in mind from the start makes the path easier."
    )
    p6 = (
        f"Your next step for {kw}: open Chrome and Cursor, create an empty extension folder, and ask Cursor for a hello-world popup. "
        f"Load it unpacked, click the icon, and celebrate the first working build. "
        f"Then enroll in a guided path if you want accountability—our course links below walk you through five parts from first popup to store-ready polish. "
        f"However you learn, the goal is the same: a real extension you made, not slides about theory."
    )
    return [p1, p2, p3, p4, p5, p6]


def word_count(paragraphs: list[str]) -> int:
    return len(" ".join(paragraphs).split())


def post_meta(slug: str) -> dict:
    h1 = slug_to_title(slug)
    kw = primary_keyword(slug)
    idx = SLUGS.index(slug)
    d = date(2025, 9, 1) + timedelta(days=idx * 7)
    return {
        "slug": slug,
        "h1": h1,
        "title": f"{h1} | Create with Cursor",
        "description": (
            f"Learn {kw} with practical steps, Cursor AI tips, and a beginner-friendly "
            f"chrome extension course. Start building in Chrome today."
        )[:160],
        "keyword": kw,
        "date_iso": d.isoformat(),
        "date_display": d.strftime("%B %d, %Y"),
    }


def render_post(meta: dict) -> str:
    slug = meta["slug"]
    canonical = f"{BASE_URL}/blog/{slug}.html"
    paragraphs = body_paragraphs(slug, meta["h1"], meta["keyword"])
    while word_count(paragraphs) < 400:
        paragraphs.append(
            "Keep practicing: each small win compounds when you focus on one feature, "
            f"test in Chrome, and refine your approach to {meta['keyword']} with real user feedback."
        )
    body_html = "\n".join(f"              <p>{p}</p>" for p in paragraphs)
    related = related_slugs(slug)
    related_items = "\n".join(
        f'              <div class="related-item"><a href="./{rs}.html">{slug_to_title(rs)}</a></div>'
        for rs in related
    )
    ld = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": meta["h1"],
        "description": meta["description"],
        "datePublished": meta["date_iso"],
        "author": {"@type": "Person", "name": "Alexander Miller"},
        "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
        "keywords": GLOBAL_KEYWORDS,
    }
    ld_json = json.dumps(ld, indent=2)
    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{meta['title']}</title>
    <meta name="description" content="{meta['description']}" />
    <meta name="keywords" content="{GLOBAL_KEYWORDS}" />
    <link rel="canonical" href="{canonical}" />
    <link rel="stylesheet" href="../styles.css?v=4" />
    <script type="application/ld+json">
{ld_json}
    </script>
  </head>
  <body data-page="blog-post">
    <script src="../transitions.js"></script>
    <header class="site-header">
      <div class="container header-inner">
        <a href="../index.html" class="logo">Create with Cursor</a>
        <nav class="main-nav">
          <a href="../index.html" class="nav-link">Home</a>
          <a href="../blog.html" class="nav-link">Blog</a>
          <a href="../course.html" class="nav-link">Course</a>
          <a href="../account.html" class="nav-link">Account</a>
          <a href="../account.html?start=1" class="btn btn-enroll nav-cta">{ENROLL_NAV_HTML}</a>
        </nav>
      </div>
    </header>

    <main>
      <div class="container">
        <article class="blog-article">
          <h1>{meta['h1']}</h1>
          <div class="blog-meta">Published {meta['date_display']}</div>
          <div class="blog-body">
{body_html}
          </div>
        </article>

        <aside class="blog-cta">
          <h2>Ready to build your own Chrome extension?</h2>
          <p>Join the step-by-step course and ship your first extension with Cursor AI.</p>
          <a href="../account.html?start=1" class="btn btn-enroll btn-enroll-lg">{ENROLL_BTN_HTML}</a>
        </aside>

        <section class="related-posts">
          <h2>Related posts</h2>
          <div class="related-list">
{related_items}
          </div>
        </section>
      </div>
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-left">
          <span>&copy; <span id="year"></span> Create with Cursor by Alexander Miller</span>
        </div>
        <div class="footer-right">
          <a href="../index.html">Home</a>
          <a href="../blog.html">Blog</a>
          <a href="../course.html">Course</a>
          <a href="../account.html">Account</a>
        </div>
      </div>
    </footer>

    <script src="../app.js"></script>
  </body>
</html>
"""


def main() -> None:
    BLOG_DIR.mkdir(parents=True, exist_ok=True)
    created: list[str] = []
    for slug in SLUGS:
        meta = post_meta(slug)
        html = render_post(meta)
        # Ensure no motion typos in output
        html = html.replace("<div", "<div").replace("</div>", "</div>")
        out = BLOG_DIR / f"{slug}.html"
        out.write_text(html, encoding="utf-8")
        created.append(out.name)
    print(f"Created {len(created)} files in {BLOG_DIR}:")
    for name in created:
        print(name)


if __name__ == "__main__":
    main()
