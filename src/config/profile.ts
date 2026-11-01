/**
 * ✏️  这里是整个作品集的内容配置。
 *     修改这个文件即可替换成你自己的信息，不需要动组件代码。
 */

export type SocialKey =
  | "github"
  | "linkedin"
  | "x"
  | "instagram"
  | "email"
  | "website"
  | "bilibili"
  | "wechat"
  | "dribbble";

export interface SocialLink {
  key: SocialKey;
  label: string;
  url: string;
}

export interface Project {
  name: string;
  /** 一句话简介 */
  tagline: string;
  description: string;
  tech: string[];
  year: string;
  /** 项目文件夹的颜色 */
  color: string;
  links?: { label: string; url: string }[];
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  summary: string;
}

export const profile = {
  name: "Your Name",
  /** 显示在菜单栏左上角头像里的缩写 */
  initials: "YN",
  title: "Full‑Stack Developer",
  location: "Shanghai, China",
  email: "hello@example.com",
  /** 头像图片放在 /public 下，例如 "/avatar.png"；留空则显示缩写 */
  avatar: "",
  /** 简历 PDF 放在 /public 下，例如 "/resume.pdf"；留空则显示在线简历 */
  resumePdf: "",
  bio: [
    "Hi 👋 I build fast, delightful products for the web — from pixel‑perfect interfaces to the APIs behind them.",
    "I love turning fuzzy ideas into shipped software, and I care a lot about the small details that make an interface feel right.",
  ],
  skills: {
    Languages: ["TypeScript", "JavaScript", "Python", "Go", "SQL"],
    Frontend: ["React", "Next.js", "Tailwind CSS", "Framer Motion"],
    Backend: ["Node.js", "PostgreSQL", "Redis", "Docker"],
    Tools: ["Git", "Figma", "Vercel", "Linux"],
  } as Record<string, string[]>,
  experience: [
    {
      role: "Software Engineer",
      company: "Acme Inc.",
      period: "2024 — Now",
      summary: "Building the core product dashboard and internal design system.",
    },
    {
      role: "Frontend Intern",
      company: "Startup Co.",
      period: "2023 — 2024",
      summary: "Shipped the marketing site and onboarding flow; improved Lighthouse score to 98.",
    },
  ] as Experience[],
  education: [
    { school: "Your University", degree: "B.S. Computer Science", period: "2020 — 2024" },
  ],
  socials: [
    { key: "github", label: "GitHub", url: "https://github.com/Zaaacqwq" },
    { key: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/" },
    { key: "x", label: "X", url: "https://x.com/" },
    { key: "instagram", label: "Instagram", url: "https://instagram.com/" },
    { key: "dribbble", label: "Dribbble", url: "https://dribbble.com/" },
    { key: "email", label: "Mail", url: "mailto:hello@example.com" },
  ] as SocialLink[],
  projects: [
    {
      name: "OS Portfolio",
      tagline: "This website — a macOS‑style desktop in the browser.",
      description:
        "A desktop‑metaphor portfolio with draggable, resizable windows, a magnifying dock, a working terminal and swappable wallpapers. Built with Next.js, TypeScript and Tailwind CSS.",
      tech: ["Next.js", "TypeScript", "Tailwind CSS"],
      year: "2026",
      color: "#3b82f6",
      links: [{ label: "Source", url: "https://github.com/Zaaacqwq/OSportfolio" }],
    },
    {
      name: "Project Two",
      tagline: "A real‑time collaborative whiteboard.",
      description:
        "Multiplayer canvas with live cursors, CRDT‑based syncing and offline support. Replace this with one of your own projects.",
      tech: ["React", "WebSocket", "Yjs"],
      year: "2025",
      color: "#a855f7",
      links: [{ label: "Demo", url: "https://example.com" }],
    },
    {
      name: "Project Three",
      tagline: "CLI tool that automates boring things.",
      description:
        "A small but mighty command‑line utility. Replace this with one of your own projects.",
      tech: ["Go", "Cobra"],
      year: "2024",
      color: "#f97316",
    },
    {
      name: "Project Four",
      tagline: "Mobile app for tracking habits.",
      description: "Replace this with one of your own projects.",
      tech: ["React Native", "Expo", "SQLite"],
      year: "2024",
      color: "#10b981",
    },
  ] as Project[],
};

export type Profile = typeof profile;
