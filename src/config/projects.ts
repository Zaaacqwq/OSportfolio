/**
 * ✏️  项目列表。每个项目会出现在 Finder、Spotlight、Launchpad 和终端里。
 *
 * 截图：把图片放进 public/projects/<slug>/ 即可自动显示（按文件名排序），
 *       文件名里带 "screen" 的图片会用作 iPhone 模拟器里的屏幕。
 */

export type Category = "apple" | "ai" | "web" | "tools" | "archive";

export const CATEGORIES: Record<Category, { label: string; color: string }> = {
  apple: { label: "macOS & iOS Apps", color: "#bf5af2" },
  ai: { label: "AI & Agents", color: "#0a84ff" },
  web: { label: "Full‑stack Web", color: "#30d158" },
  tools: { label: "Developer Tools", color: "#ff9f0a" },
  archive: { label: "Archive", color: "#8e8e93" },
};

/** 项目在桌面上的“打开方式” */
export type Showcase = "vibeisland" | "simulator" | "safari" | "terminal" | "quicklook";

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string[];
  highlights?: string[];
  category: Category;
  /** 种类，显示在列表视图的 Kind 列 */
  kind: string;
  tech: string[];
  year: string;
  /** 公开仓库地址；私有仓库留空并设置 private: true */
  repo?: string;
  private?: boolean;
  /** 线上地址 */
  live?: string;
  /** 线上地址允许被 iframe 嵌入时设为 true，Safari 会直接加载 */
  iframe?: boolean;
  /** 下载地址（例如 GitHub Releases） */
  download?: { label: string; url: string };
  featured?: boolean;
  showcase: Showcase;
  /** 图标渐变色和字形（字形名见 src/lib/projectGlyphs.ts） */
  accent: [string, string];
  glyph: string;
  /** 在封面上展示的图片（相对 public/），不填则用 public/projects/<slug>/ 里的第一张 */
  cover?: string;
}

export const PROJECTS: Project[] = [
  // ───────────────────────── macOS & iOS ─────────────────────────
  {
    slug: "vibeisland",
    name: "VibeIsland",
    tagline: "A command center for your MacBook notch.",
    description: [
      "VibeIsland turns the MacBook notch into a Dynamic Island‑style command center. Media, AI coding agents, system status and everyday utilities stay visible without taking over your desktop.",
      "It hooks into Claude Code, Codex, Gemini CLI, Cursor, OpenCode and more: sessions stay compact while they run, then surface with a halo and a sound when an agent asks a question or needs permission — and you can answer or approve right from the notch, then jump back to the originating terminal.",
    ],
    highlights: [
      "Answer agent questions & approve permission requests inline",
      "Provider usage at a glance — tokens, cache, cost and rate‑limit windows",
      "Live activities: now playing & lyrics, weather, timer, Focus",
      "Notch‑aware replacements for volume, brightness, battery and input‑source HUDs",
      "Signed & notarized releases",
    ],
    category: "apple",
    kind: "macOS App",
    tech: ["Swift", "SwiftUI", "macOS 14.6+", "MediaRemote"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/vibeIsland",
    download: { label: "Download for macOS", url: "https://github.com/Zaaacqwq/vibeIsland/releases/latest" },
    featured: true,
    showcase: "vibeisland",
    accent: ["#5fd6c8", "#0f8a8f"],
    glyph: "notch",
    cover: "/projects/vibeisland/agent-permission.png",
  },
  {
    slug: "dofocus",
    name: "DoFocus",
    tagline: "An AI‑powered focus planner.",
    description: [
      "Turn text or voice input into editable schedules and linked tasks, organize habits and goals, and stay on track with customizable Pomodoro timers.",
      "Built natively for iPhone with widgets, a Screen Time‑based focus shield and an AI proxy for planning.",
    ],
    category: "apple",
    kind: "iOS App",
    tech: ["Swift", "SwiftUI", "SwiftData", "WidgetKit", "FamilyControls"],
    year: "2026",
    private: true,
    featured: true,
    showcase: "simulator",
    accent: ["#ff9f0a", "#ff375f"],
    glyph: "target",
  },
  {
    slug: "swipeclean",
    name: "SwipeClean",
    tagline: "Clean up a huge photo library by swiping.",
    description: [
      "An iOS 26 photo‑cleanup app for people with thousands of photos. Swipe cards left or right; left only marks a photo for cleanup, and everything is confirmed at the end of a round — deleted photos go to Recently Deleted, so nothing is lost by accident.",
      "Also groups similar photos (auto‑picking the best one), shows a GPS‑based travel recap and manages albums. Free, no ads, no account, no analytics — all processing happens on device.",
    ],
    category: "apple",
    kind: "iOS App",
    tech: ["Swift", "SwiftUI", "PhotoKit", "Vision", "iOS 26"],
    year: "2026",
    private: true,
    featured: true,
    showcase: "simulator",
    accent: ["#64d2ff", "#5e5ce6"],
    glyph: "photos",
  },
  {
    slug: "fridgy",
    name: "Fridgy",
    tagline: "A shared fridge for the whole family.",
    description: [
      "A native iPhone app for managing a family's fridge together: fridge / freezer / pantry inventory with batches and expiry estimates, receipt scanning (on‑device Vision OCR or cloud AI), barcode lookup via Open Food Facts, and AI‑generated recipes from what you have.",
      "Households sync in real time through Supabase with row‑level security, atomic inventory updates with undo, invite codes and daily expiry digests via APNs.",
    ],
    category: "apple",
    kind: "iOS App",
    tech: ["Swift", "SwiftUI", "Supabase", "PostgreSQL", "Vision", "APNs"],
    year: "2026",
    private: true,
    showcase: "simulator",
    accent: ["#30d158", "#0a9b6e"],
    glyph: "fridge",
  },
  {
    slug: "cents",
    name: "Cents",
    tagline: "Automatic Apple Pay expense tracking with clear monthly insights.",
    description: [
      "Every Apple Pay tap is logged automatically through a Shortcuts Wallet automation; everything else takes three seconds to add from a number pad, the Lock Screen, Siri or Apple Watch.",
      "Monthly totals and category breakdowns, per‑card splits, CSV / OFX import, screenshot OCR, budgets and subscription tracking — with on‑device categorization, and data that never leaves the phone.",
    ],
    category: "apple",
    kind: "iOS App",
    tech: ["Swift 6", "SwiftUI", "GRDB", "Swift Charts", "App Intents", "FoundationModels"],
    year: "2026",
    private: true,
    showcase: "simulator",
    accent: ["#34c759", "#1f8f3a"],
    glyph: "wallet",
  },
  {
    slug: "warehousecare",
    name: "WarehouseCare",
    tagline: "An iOS app — details coming soon.",
    description: ["A native SwiftUI app. Description coming soon."],
    category: "apple",
    kind: "iOS App",
    tech: ["Swift", "SwiftUI"],
    year: "2026",
    private: true,
    showcase: "simulator",
    accent: ["#a2845e", "#6d5236"],
    glyph: "box",
  },

  // ───────────────────────── AI & Agents ─────────────────────────
  {
    slug: "slaythespire",
    name: "SlayTheSpireRL",
    tagline: "An agent stack for Slay the Spire 2.",
    description: [
      "A game mod exposes live state and actions, an MCP server lets an LLM play the game, and a reinforcement‑learning environment trains agents on top of the same interface.",
      "It drives a headless build of the real game engine (sts2‑cli) through a JSON protocol, so agents and RL code can play full runs without a window.",
    ],
    highlights: [
      "C# / .NET 9 game mod exposing state and actions",
      "MCP server so any LLM client can play",
      "RL training environment, dashboard and replay tests",
    ],
    category: "ai",
    kind: "Game AI",
    tech: ["Python", "C#", ".NET 9", "MCP", "Reinforcement Learning"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/SlayTheSpireRL",
    featured: true,
    showcase: "terminal",
    accent: ["#bf5af2", "#5e2bd6"],
    glyph: "cards",
    cover: "/projects/slaythespire/teaser.png",
  },
  {
    slug: "sts2-cli",
    name: "sts2‑cli",
    tagline: "Slay the Spire 2, headless, in your terminal.",
    description: [
      "Runs the real game engine headlessly (patched engine DLL, Godot stubs, Harmony patches) and speaks a JSON stdin/stdout protocol so AI agents and RL code can drive it. A fork pinned for SlayTheSpireRL.",
    ],
    category: "ai",
    kind: "CLI",
    tech: ["C#", ".NET 9", "Python"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/sts2-cli",
    showcase: "quicklook",
    accent: ["#3a3a3c", "#111113"],
    glyph: "terminal",
    cover: "/projects/sts2-cli/demo.gif",
  },
  {
    slug: "autouwlearn",
    name: "autoUWLearn",
    tagline: "Ask your Waterloo LEARN account anything, through MCP.",
    description: [
      "A read‑only MCP server for Waterloo LEARN (Brightspace): deadlines, grades, announcements and lecture content through the Brightspace Valence API. A browser is used only for the SSO / MFA login.",
    ],
    category: "ai",
    kind: "MCP Server",
    tech: ["TypeScript", "Node.js", "MCP", "OAuth 2.0 PKCE"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/autoUWLearn",
    showcase: "terminal",
    accent: ["#ffd60a", "#e0a800"],
    glyph: "school",
  },
  {
    slug: "balatromcp",
    name: "BalatroMCP",
    tagline: "Let an AI play Balatro through MCP.",
    description: [
      "A Lua mod exposes Balatro's game state over local HTTP; a Python MCP server gives AI clients tools like get_game_state and play_hand, plus a strategy pack.",
    ],
    category: "ai",
    kind: "Game AI",
    tech: ["Python", "FastAPI", "Lua", "MCP"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/BalatroMCP",
    showcase: "terminal",
    accent: ["#ff453a", "#b0201a"],
    glyph: "joker",
  },
  {
    slug: "agentswarm",
    name: "agentSwarm",
    tagline: "A multi‑agent dev team from a one‑sentence request.",
    description: [
      "Agents research, plan, then develop in parallel on branches through pull requests — with per‑agent sandboxing, Discord chat and a dashboard. Currently being rewritten.",
    ],
    category: "ai",
    kind: "Agent Platform",
    tech: ["TypeScript", "Playwright", "OpenRouter"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/agentSwarm",
    showcase: "terminal",
    accent: ["#5e5ce6", "#2c2a9e"],
    glyph: "hive",
  },
  {
    slug: "llm-mcp-rag",
    name: "LLM_MCP_RAG",
    tagline: "A modular framework for LLM apps with MCP tools and RAG.",
    description: [
      "A CLI, an HTTP server, a retrieval pipeline (HNSW) and sandboxed tools under one orchestration layer, with OpenAI‑compatible models.",
    ],
    category: "ai",
    kind: "Framework",
    tech: ["Python", "FastAPI", "HNSW", "pytest"],
    year: "2025",
    repo: "https://github.com/Zaaacqwq/LLM_MCP_RAG",
    showcase: "quicklook",
    accent: ["#0a84ff", "#0050b3"],
    glyph: "brain",
  },
  {
    slug: "hearth",
    name: "Hearth",
    tagline: "A private AI for you and the friends you approve.",
    description: [
      "Private AI chat with an iPhone / iPad app and a web client. Conversations are stored per account in a self‑hosted Supabase and sync across devices; the upstream model is swappable by config — OpenRouter today, a local LM Studio model later.",
      "Designed so friends can use it reliably without a VPN, with queuing, quotas and spending caps when many people share one model.",
    ],
    category: "ai",
    kind: "Web + iOS",
    tech: ["TypeScript", "Supabase", "OpenRouter", "LM Studio"],
    year: "2026",
    private: true,
    featured: true,
    showcase: "quicklook",
    accent: ["#ff9f0a", "#c2410c"],
    glyph: "flame",
  },
  {
    slug: "discord-music-bot",
    name: "discord‑music‑bot",
    tagline: "A Discord music bot that understands Spotify links.",
    description: [
      "Audio is streamed by a Lavalink v4 server (Docker), not Node. Spotify tracks are matched to the same YouTube recording by ISRC instead of fuzzy title search.",
    ],
    category: "ai",
    kind: "Discord Bot",
    tech: ["TypeScript", "discord.js", "Lavalink", "Prisma", "Docker"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/discord-music-bot",
    live: "https://discord.com/oauth2/authorize?client_id=1433520589447889087",
    showcase: "quicklook",
    accent: ["#5865f2", "#3b44c4"],
    glyph: "music",
  },

  // ───────────────────────── Full‑stack Web ─────────────────────────
  {
    slug: "betteruwworks",
    name: "betterUWWorks",
    tagline: "A private WaterlooWorks companion.",
    description: [
      "Collects WaterlooWorks co‑op postings, makes them searchable, and scores each job against your resume with line‑by‑line evidence — so you can see exactly which line earned which point.",
      "A Chrome extension captures postings; a Next.js app with Postgres / Drizzle and Ollama embeddings does search and scoring. Self‑hosted on a Mac mini behind a Cloudflare tunnel, with a public demo on made‑up data.",
    ],
    highlights: [
      "Line‑by‑line resume ↔ job scoring with evidence",
      "Chrome extension (Manifest V3) for capturing postings",
      "Self‑hosted: Docker Compose, Ollama embeddings, Cloudflare tunnel",
    ],
    category: "web",
    kind: "Web App",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Drizzle", "Ollama", "Docker"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/betterUWWorks",
    live: "https://jobs.zaaac.vip/demo",
    iframe: true,
    featured: true,
    showcase: "safari",
    accent: ["#ffd60a", "#1c1c1e"],
    glyph: "briefcase",
  },
  {
    slug: "zacblog",
    name: "ZacBlog",
    tagline: "My personal blog — Spring Boot + React.",
    description: [
      "Version 2 of my blog: a Spring Boot 3.5 backend (Spring Data JDBC, Flyway, MySQL) and a React 18 + Vite front end, deployed with CI/CD.",
    ],
    category: "web",
    kind: "Web App",
    tech: ["Java 17", "Spring Boot", "MySQL", "React", "Vite"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/ZacBlog",
    live: "https://blog.zaaac.vip/",
    iframe: true,
    showcase: "safari",
    accent: ["#0e83cd", "#075985"],
    glyph: "pen",
  },
  {
    slug: "particleportfolio",
    name: "Particle Portfolio",
    tagline: "A portfolio where particles morph between sections.",
    description: [
      "Three.js particle models morph between the About, Projects, Experience and Contact sections. Partly based on a 2017 Tencent event site.",
    ],
    category: "web",
    kind: "Website",
    tech: ["React", "TypeScript", "Three.js", "tween.js"],
    year: "2025",
    repo: "https://github.com/Zaaacqwq/Particleportfolio",
    live: "https://portfolio.zaaac.vip/",
    iframe: true,
    showcase: "safari",
    accent: ["#1c1c1e", "#5e5ce6"],
    glyph: "sparkles",
    cover: "/projects/particleportfolio/preview.png",
  },
  {
    slug: "deviceboard",
    name: "deviceBoard",
    tagline: "One dashboard for my Mac Studio, Mac mini and VPS.",
    description: [
      "Agents on each host stream CPU, memory, GPU, disks, network, services, local‑LLM slots and token usage; a server keeps 14 days of minute averages in SQLite and serves a React dashboard behind Cloudflare Access.",
    ],
    category: "web",
    kind: "Dashboard",
    tech: ["TypeScript", "Node.js", "SQLite", "React", "Vite", "Tailwind"],
    year: "2026",
    private: true,
    showcase: "quicklook",
    accent: ["#30d158", "#14532d"],
    glyph: "gauge",
  },
  {
    slug: "studypilot",
    name: "studyPilot",
    tagline: "Outline‑first studying with branchable AI conversations.",
    description: [
      "AI turns your notes into an outline; branch a chat off any outline item and merge the answer back as a summary.",
    ],
    category: "web",
    kind: "Web App",
    tech: ["Next.js", "Supabase", "Claude API"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/studyPilot",
    showcase: "quicklook",
    accent: ["#64d2ff", "#0a84ff"],
    glyph: "book",
  },
  {
    slug: "tokenmanager",
    name: "tokenManager",
    tagline: "A dashboard for API tokens and usage.",
    description: ["React + Recharts front end with an Express / SQLite backend, JWT auth and scheduled jobs."],
    category: "web",
    kind: "Web App",
    tech: ["React", "Recharts", "Express", "SQLite"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/tokenManager",
    showcase: "quicklook",
    accent: ["#ff9f0a", "#b45309"],
    glyph: "key",
  },
  {
    slug: "pokerchips",
    name: "pokerChips",
    tagline: "Poker chip tracking for game night.",
    description: ["A Next.js app with Prisma, shadcn/ui and Vitest."],
    category: "web",
    kind: "Web App",
    tech: ["Next.js", "Prisma", "shadcn/ui"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/pokerChips",
    showcase: "quicklook",
    accent: ["#ff375f", "#9f1239"],
    glyph: "chip",
  },

  // ───────────────────────── Tools ─────────────────────────
  {
    slug: "gitgreen",
    name: "gitgreen",
    tagline: "Draw on your GitHub contribution graph.",
    description: ["A single‑file HTML tool for designing patterns on the GitHub contribution graph."],
    category: "tools",
    kind: "Web Tool",
    tech: ["HTML", "JavaScript"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/gitgreen",
    live: "https://zaaacqwq.github.io/gitgreen/",
    iframe: true,
    showcase: "safari",
    accent: ["#39d353", "#0e4429"],
    glyph: "grid",
  },
  {
    slug: "osportfolio",
    name: "OS Portfolio",
    tagline: "This website.",
    description: ["A macOS‑style desktop in the browser, built with Next.js, TypeScript and Tailwind CSS."],
    category: "tools",
    kind: "Website",
    tech: ["Next.js", "TypeScript", "Tailwind CSS"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/OSportfolio",
    showcase: "quicklook",
    accent: ["#5b8cff", "#7c3aed"],
    glyph: "laptop",
  },

  // ───────────────────────── Archive ─────────────────────────
  {
    slug: "sts2-agent",
    name: "STS2‑Agent",
    tagline: "The first Slay the Spire 2 agent (superseded by SlayTheSpireRL).",
    description: ["An early Python agent experiment, superseded by SlayTheSpireRL."],
    category: "archive",
    kind: "Game AI",
    tech: ["Python"],
    year: "2026",
    repo: "https://github.com/Zaaacqwq/STS2-Agent",
    showcase: "quicklook",
    accent: ["#8e8e93", "#48484a"],
    glyph: "cards",
  },
  {
    slug: "ocr",
    name: "ocr",
    tagline: "OCR training data and scripts.",
    description: ["Scratch work for text‑recognition training."],
    category: "archive",
    kind: "Scripts",
    tech: ["Python"],
    year: "2025",
    repo: "https://github.com/Zaaacqwq/ocr",
    showcase: "quicklook",
    accent: ["#8e8e93", "#48484a"],
    glyph: "scan",
  },
  {
    slug: "tictactoe",
    name: "TicTacToe",
    tagline: "Tic‑tac‑toe in Python.",
    description: ["A small Python game."],
    category: "archive",
    kind: "Game",
    tech: ["Python"],
    year: "2025",
    repo: "https://github.com/Zaaacqwq/TicTacToe",
    showcase: "quicklook",
    accent: ["#8e8e93", "#48484a"],
    glyph: "grid",
  },
];

export const getProject = (slug: string) => PROJECTS.find((p) => p.slug === slug);
export const FEATURED = PROJECTS.filter((p) => p.featured);
