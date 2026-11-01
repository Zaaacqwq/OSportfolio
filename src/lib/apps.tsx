import type { ComponentType } from "react";
import {
  LuCompass,
  LuFileText,
  LuFolderOpen,
  LuLayoutGrid,
  LuMail,
  LuSettings,
  LuSquareTerminal,
  LuTrash2,
  LuUserRound,
} from "react-icons/lu";
import { FaGithub } from "react-icons/fa6";
import type { IconSpec } from "@/components/AppIcon";
import { profile } from "@/config/profile";
import About from "@/components/apps/About";
import Projects from "@/components/apps/Projects";
import Terminal from "@/components/apps/Terminal";
import Launchpad from "@/components/apps/Launchpad";
import Contact from "@/components/apps/Contact";
import Settings from "@/components/apps/Settings";
import Resume from "@/components/apps/Resume";
import Trash from "@/components/apps/Trash";
import Browser from "@/components/apps/Browser";

export type AppId =
  | "about"
  | "projects"
  | "terminal"
  | "launchpad"
  | "contact"
  | "resume"
  | "browser"
  | "settings"
  | "github"
  | "trash";

export interface AppProps {
  params?: Record<string, unknown>;
}

export interface AppDef {
  id: AppId;
  title: string;
  icon: IconSpec;
  size: { w: number; h: number };
  component?: ComponentType<AppProps>;
  /** 有 href 的应用点击后直接在新标签页打开链接 */
  href?: string;
  /** 窗口内容区域的背景主题 */
  theme?: "light" | "dark";
}

const githubUrl = profile.socials.find((s) => s.key === "github")?.url;

export const APPS: Record<AppId, AppDef> = {
  about: {
    id: "about",
    title: "About Me",
    icon: { bg: "linear-gradient(180deg,#6ec3ff,#1677ff)", glyph: <LuUserRound /> },
    size: { w: 720, h: 520 },
    component: About,
  },
  projects: {
    id: "projects",
    title: "Projects",
    icon: { bg: "linear-gradient(180deg,#8fd3ff,#3a9bf0)", glyph: <LuFolderOpen /> },
    size: { w: 820, h: 540 },
    component: Projects,
  },
  terminal: {
    id: "terminal",
    title: "Terminal",
    icon: { bg: "linear-gradient(180deg,#3a3a3c,#111)", glyph: <LuSquareTerminal />, color: "#e5e5e5" },
    size: { w: 680, h: 440 },
    component: Terminal,
    theme: "dark",
  },
  launchpad: {
    id: "launchpad",
    title: "Launchpad",
    icon: {
      bg: "conic-gradient(from 45deg,#ff6b6b,#ffd93d,#6bcB77,#4d96ff,#c77dff,#ff6b6b)",
      glyph: <LuLayoutGrid />,
    },
    size: { w: 720, h: 460 },
    component: Launchpad,
    theme: "dark",
  },
  contact: {
    id: "contact",
    title: "Mail",
    icon: { bg: "linear-gradient(180deg,#7cc8ff,#1b8cff)", glyph: <LuMail /> },
    size: { w: 620, h: 520 },
    component: Contact,
  },
  resume: {
    id: "resume",
    title: "Resume.pdf",
    icon: { bg: "linear-gradient(180deg,#ffffff,#e6e6e6)", glyph: <LuFileText />, color: "#e5484d" },
    size: { w: 680, h: 600 },
    component: Resume,
  },
  browser: {
    id: "browser",
    title: "Browser",
    icon: { bg: "linear-gradient(180deg,#ffffff,#dfe8f5)", glyph: <LuCompass />, color: "#1677ff" },
    size: { w: 900, h: 580 },
    component: Browser,
  },
  settings: {
    id: "settings",
    title: "System Settings",
    icon: { bg: "linear-gradient(180deg,#a1a1aa,#52525b)", glyph: <LuSettings /> },
    size: { w: 640, h: 460 },
    component: Settings,
  },
  github: {
    id: "github",
    title: "GitHub",
    icon: { bg: "linear-gradient(180deg,#2b3137,#0d1117)", glyph: <FaGithub /> },
    size: { w: 0, h: 0 },
    href: githubUrl,
  },
  trash: {
    id: "trash",
    title: "Trash",
    icon: {
      bg: "linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.2))",
      glyph: <LuTrash2 />,
      color: "#3f3f46",
    },
    size: { w: 560, h: 380 },
    component: Trash,
  },
};

/** Dock 中的应用顺序；"|" 表示分隔线 */
export const DOCK: (AppId | "|")[] = [
  "about",
  "projects",
  "launchpad",
  "terminal",
  "browser",
  "contact",
  "settings",
  ...(githubUrl ? (["github"] as AppId[]) : []),
  "|",
  "resume",
  "trash",
];

/** 桌面右侧的图标 */
export const DESKTOP_ICONS: AppId[] = ["about", "projects", "resume", "contact"];
