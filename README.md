# Create with Cursor by Alexander Miller

Static marketing and course site for the Create with Cursor by Alexander Miller membership. This version runs entirely in the browser using HTML/CSS/JS and `localStorage` to simulate accounts and enrollment.

## Pages

- `index.html` – marketing home page with 5-part curriculum overview.
- `account.html` – create a local account, toggle enrollment, and manage status.
- `course.html` – gated course layout with sidebar navigation and lesson content.

## Local development

You can open `index.html` directly in a browser, but for best results run a small static server:

```bash
cd /path/to/ChromeExtensionCourse
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## GitHub Pages (Classic)

This project is set up for **GitHub Pages Classic**—deploying static files directly from a branch, with no GitHub Actions build step.

1. Commit and push all files to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch** (Classic).
4. Choose:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **Save**.

GitHub serves the site at:

- `https://plugin-factory-fl.github.io/ChromeExtensionCourse/`

All links are relative, so the site works at that path. The `.nojekyll` file at the repo root disables Jekyll processing so files are served as-is.

> **Note:** Do not enable “GitHub Actions” as the Pages source for this repo unless you add a workflow. Classic branch deployment is the intended setup.

## How mock enrollment works

- Account data is stored in `localStorage` under the key `chrome_ext_course_user`.
- Creating an account on `account.html` sets `hasActiveMembership: true` and unlocks the course.
- The course page checks this flag and shows either a locked card or the full lesson player.

In a future version, replace the `localStorage` helpers in `app.js` with API calls to a backend and real billing (e.g. Stripe).

## Course outline

1. **Foundations** – Cursor + MV3 setup, DevTools, Quote of the Day project  
2. **First real extension** – storage, content scripts, end-to-end project  
3. **Dashboard + login** – Render, auth, messaging, personalized dashboard  
4. **Monetize with Stripe** – checkout, webhooks, freemium gating  
5. **Publish & scale** – Chrome Web Store, marketing, analytics, launch
