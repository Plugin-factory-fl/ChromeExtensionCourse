window.COURSE_CATALOG = {
  membershipPrice: "$29.99",
  membershipLabel: "per month",
  courses: [
    {
      id: "chrome-extensions",
      slug: "course-chrome-extensions.html",
      title: "Create Chrome Extensions with Cursor",
      shortTitle: "Chrome Extensions",
      tag: "Browser tools",
      description: "Build, monetize, and publish Chrome extensions with Cursor AI—from your first popup to the Chrome Web Store.",
      parts: 5,
      hours: "12+",
      icon: "🧩"
    },
    {
      id: "websites",
      slug: "course-websites.html",
      title: "Create Websites with Cursor",
      shortTitle: "Websites",
      tag: "Web products",
      description: "Design, build, and launch modern websites and landing pages with Cursor—from HTML to deploy and payments.",
      parts: 5,
      hours: "10+",
      icon: "🌐",
      comingSoon: true,
      comingSoonLabel: "Course Coming Soon: June 2026"
    }
  ],
  curricula: {
    "chrome-extensions": [
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
],
    "websites": [
  {
    "id": "part-1",
    "title": "Part 1 — Web foundations",
    "lessons": [
      {
        "id": "html-css-cursor",
        "title": "HTML, CSS & Cursor basics",
        "duration": "20 min",
        "videoSrc": "https://www.w3schools.com/html/mov_bbb.mp4",
        "description": "Learn how to prompt Cursor for semantic HTML and modern CSS layouts.",
        "takeaways": [
          "Structure pages with accessible HTML.",
          "Use Cursor to iterate on layout quickly.",
          "Preview locally in the browser."
        ]
      },
      {
        "id": "cursor-web-setup",
        "title": "Setting up a web project",
        "duration": "16 min",
        "videoSrc": "https://www.w3schools.com/html/movie.mp4",
        "description": "Scaffold a simple site with folders, assets, and live reload.",
        "takeaways": [
          "Organize files for growth.",
          "Configure Cursor for front-end work.",
          "Run a local dev workflow."
        ]
      },
      {
        "id": "first-page",
        "title": "Project: Your first landing page",
        "duration": "25 min",
        "videoSrc": "https://www.w3schools.com/html/mov_bbb.mp4",
        "description": "Build a one-page site with hero, features, and CTA using prompts.",
        "takeaways": [
          "Ship a responsive page.",
          "Polish typography and spacing.",
          "Deploy-ready HTML/CSS."
        ]
      }
    ]
  },
  {
    "id": "part-2",
    "title": "Part 2 — Interactive sites",
    "lessons": [
      {
        "id": "js-basics",
        "title": "JavaScript with Cursor",
        "duration": "22 min",
        "videoSrc": "https://www.w3schools.com/html/movie.mp4",
        "description": "Add interactivity: menus, modals, and form validation.",
        "takeaways": [
          "Prompt safe, readable JS.",
          "Wire up DOM events.",
          "Debug in browser DevTools."
        ]
      },
      {
        "id": "components",
        "title": "Reusable sections & components",
        "duration": "24 min",
        "videoSrc": "https://www.w3schools.com/html/mov_bbb.mp4",
        "description": "Break pages into reusable blocks you can prompt again and again.",
        "takeaways": [
          "DRY up repeated UI.",
          "Build a small component library.",
          "Speed up new pages."
        ]
      },
      {
        "id": "multi-page",
        "title": "Project: Multi-page marketing site",
        "duration": "35 min",
        "videoSrc": "https://www.w3schools.com/html/movie.mp4",
        "description": "Create About, Pricing, and Contact pages with consistent design.",
        "takeaways": [
          "Shared nav and footer.",
          "Internal linking and SEO basics.",
          "Mobile-friendly layouts."
        ]
      }
    ]
  },
  {
    "id": "part-3",
    "title": "Part 3 — Backend & forms",
    "lessons": [
      {
        "id": "forms-backend",
        "title": "Forms & simple backends",
        "duration": "28 min",
        "videoSrc": "https://www.w3schools.com/html/mov_bbb.mp4",
        "description": "Connect contact forms and newsletters with lightweight backends.",
        "takeaways": [
          "Choose hosted form or API routes.",
          "Handle submissions securely.",
          "Confirm success states in UI."
        ]
      },
      {
        "id": "auth-basics",
        "title": "Optional login & dashboards",
        "duration": "30 min",
        "videoSrc": "https://www.w3schools.com/html/movie.mp4",
        "description": "Add member areas when your product needs accounts.",
        "takeaways": [
          "Auth patterns with Cursor.",
          "Protect routes and pages.",
          "Sync user data safely."
        ]
      },
      {
        "id": "cms",
        "title": "Project: Content you can update",
        "duration": "32 min",
        "videoSrc": "https://www.w3schools.com/html/mov_bbb.mp4",
        "description": "Wire a simple CMS or markdown workflow for blog-style content.",
        "takeaways": [
          "Non-dev friendly updates.",
          "Structured content folders.",
          "Fast publish loop."
        ]
      }
    ]
  },
  {
    "id": "part-4",
    "title": "Part 4 — Ship & monetize",
    "lessons": [
      {
        "id": "deploy",
        "title": "Deploy to the web",
        "duration": "26 min",
        "videoSrc": "https://www.w3schools.com/html/mov_bbb.mp4",
        "description": "Publish on GitHub Pages, Vercel, or Netlify with custom domains.",
        "takeaways": [
          "Pick the right host.",
          "Configure DNS.",
          "HTTPS by default."
        ]
      },
      {
        "id": "stripe-web",
        "title": "Payments & pricing pages",
        "duration": "28 min",
        "videoSrc": "https://www.w3schools.com/html/movie.mp4",
        "description": "Add Stripe checkout for products, courses, or subscriptions.",
        "takeaways": [
          "Pricing table UX.",
          "Test mode checkout.",
          "Webhook basics."
        ]
      },
      {
        "id": "analytics",
        "title": "Project: Launch with analytics",
        "duration": "24 min",
        "videoSrc": "https://www.w3schools.com/html/mov_bbb.mp4",
        "description": "Go live with analytics and a launch checklist.",
        "takeaways": [
          "Track conversions.",
          "Share on social.",
          "Iterate from data."
        ]
      }
    ]
  },
  {
    "id": "part-5",
    "title": "Part 5 — Scale & iterate",
    "lessons": [
      {
        "id": "performance",
        "title": "Performance & SEO",
        "duration": "22 min",
        "videoSrc": "https://www.w3schools.com/html/mov_bbb.mp4",
        "description": "Speed up loads and improve search visibility.",
        "takeaways": [
          "Image optimization.",
          "Meta tags and sitemaps.",
          "Core Web Vitals tips."
        ]
      },
      {
        "id": "iterate",
        "title": "A/B tests & iterations",
        "duration": "20 min",
        "videoSrc": "https://www.w3schools.com/html/movie.mp4",
        "description": "Use Cursor to ship experiments and improvements fast.",
        "takeaways": [
          "Hypothesis-driven changes.",
          "Rollback safely.",
          "User feedback loops."
        ]
      },
      {
        "id": "portfolio",
        "title": "Project: Portfolio & next site",
        "duration": "30 min",
        "videoSrc": "https://www.w3schools.com/html/mov_bbb.mp4",
        "description": "Package your work and plan your next web product.",
        "takeaways": [
          "Showcase projects.",
          "Template your stack.",
          "Repeat the playbook."
        ]
      }
    ]
  }
]
  }
};