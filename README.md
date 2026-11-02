# Zac's Mac — OS Portfolio

My portfolio, dressed up as **macOS 26 Tahoe**: a lock screen, menu bar with real menus, a glass Dock, Spotlight,
Launchpad, Control Center, Notification Center, desktop widgets, and every project shown as an app.

Built with **Next.js 16 · React 19 · TypeScript · Tailwind CSS 4**. All icons and wallpapers are original and drawn in
code — no Apple assets.

## ✨ What's inside

| | |
| --- | --- |
| **System** | Boot → lock screen → desktop · menu bar with per‑app menus (File/Edit/View/Go/Window/Help) · Z menu (About This Mac, Lock Screen, Restart…) · Spotlight (`⌘K` / `Ctrl K`) · fullscreen Launchpad · Control Center (Dark Mode, brightness, wallpaper) · Notification Center with widgets · right‑click menus · drag‑select on the desktop |
| **Windows** | Unified toolbars, glass sidebars, traffic lights, drag / resize from any edge, double‑click to zoom, open & minimize animations to the Dock |
| **Dock** | Glass dock with magnification, bounce, running indicators, tooltips, right‑click menus |
| **Appearance** | Light / dark (follows the system, remembers your choice); each wallpaper has a day and night variant |
| **Mobile** | iOS‑style home screen; apps open fullscreen |

### How projects are shown

Every project is an app, opened in the way that fits it:

| Project type | Where it opens |
| --- | --- |
| **VibeIsland** (macOS notch app) | A live **notch** in the menu bar — hover it to see real screenshots — plus an App‑Store‑style product page |
| **iOS apps** (DoFocus, SwipeClean, Fridgy, Cents…) | **Simulator** — an iPhone frame with screenshots (or an illustrative mock‑up until screenshots are added) |
| **Web projects** (betterUWWorks, ZacBlog, Particle Portfolio…) | **Safari** — the live site in a tab when it allows embedding, otherwise a project page |
| **AI / agent projects** (SlayTheSpireRL, BalatroMCP, autoUWLearn…) | **Terminal** — `project <name>` prints the README‑style summary and the architecture |
| Everything | **Finder** — Icons / List / Columns / Gallery views, tags by category, **Quick Look** with `Space` |

Private repositories are shown with a 🔒 badge and no source link.

## 🚀 Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start
npm run lint       # TypeScript check
```

## ✏️ Editing content

| What | Where |
| --- | --- |
| Name, bio, experience, skills, links, avatar, resume PDF | `src/config/profile.ts` |
| Projects (copy, tech, links, category, how each one opens) | `src/config/projects.ts` |
| Dock order, apps | `src/lib/apps.tsx` |
| Menus | `src/lib/menus.ts` |
| Wallpapers | `src/lib/wallpapers.ts` |
| Colors, glass, window styling | `src/app/globals.css` |

### Adding screenshots

Drop images into `public/projects/<slug>/` — they're picked up automatically at build time (sorted by filename):

- The first image becomes the project's cover in Finder, Quick Look, Safari and the Featured widget
  (or set `cover` in `projects.ts`).
- Images with **`screen`** in the filename (e.g. `screen-1.png`, `screen-2.png`) are shown inside the iPhone in
  **Simulator**. Use portrait iPhone screenshots.

### Avatar & resume

Put `avatar.jpg` and/or `resume.pdf` in `public/` and set `avatar: "/avatar.jpg"` / `resumePdf: "/resume.pdf"` in
`profile.ts`. Without a PDF, Preview shows a resume generated from the profile data.

## 🐙 GitHub data

The GitHub app and the contributions widget use live data fetched on the server and refreshed every hour (ISR):
the public repo list from the GitHub API, the contribution calendar from your public profile, and the latest
VibeIsland release. If GitHub is unreachable the site falls back to the static numbers in `profile.ts`.
Setting a `GITHUB_TOKEN` environment variable (no scopes needed) raises the API rate limit — optional.

## ☁️ Deploy

Import the repo on [Vercel](https://vercel.com/new) — no configuration needed.

## 📁 Structure

```
src/
├── app/                    layout (fonts, theme), page (fetches GitHub data), globals.css (design tokens)
├── config/                 ✏️ profile.ts, projects.ts
├── context/                System (windows, appearance, overlays, notifications), Data (GitHub + assets)
├── lib/                    app registry, menus, wallpapers, GitHub fetchers, helpers
└── components/
    ├── Desktop · MenuBar · Dock · Window · BootScreen
    ├── chrome/             toolbar, sidebar, traffic lights
    ├── system/             lock screen, Spotlight, Launchpad, Control/Notification Center, notch, widgets, menus
    ├── apps/               Finder, Contacts, Safari, Mail, Notes, Terminal, Simulator, GitHub, Settings, Preview…
    ├── icons/              original squircle app icons
    └── mobile/             iOS‑style shell
```

---

Inspired by desktop‑metaphor portfolios such as [fabiconcept/macintosh-os](https://github.com/fabiconcept/macintosh-os).
macOS, Finder, Safari and related names belong to Apple Inc.; this is an unaffiliated personal homage.
