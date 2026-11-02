import type { ComponentType } from "react";
import type { IconName } from "@/components/icons/AppIcons";
import Finder from "@/components/apps/Finder";
import About from "@/components/apps/About";
import Safari from "@/components/apps/Safari";
import Mail from "@/components/apps/Contact";
import Notes from "@/components/apps/Notes";
import Terminal from "@/components/apps/Terminal";
import Simulator from "@/components/apps/Simulator";
import GitHubApp from "@/components/apps/GitHubApp";
import Settings from "@/components/apps/Settings";
import Preview from "@/components/apps/Resume";
import Trash from "@/components/apps/Trash";
import VibeIslandApp from "@/components/apps/VibeIslandApp";
import AboutMac from "@/components/apps/AboutMac";

export type AppId =
  | "finder"
  | "launchpad"
  | "about"
  | "safari"
  | "mail"
  | "notes"
  | "terminal"
  | "simulator"
  | "github"
  | "settings"
  | "preview"
  | "trash"
  | "vibeisland"
  | "aboutmac";

export interface AppProps {
  params?: Record<string, unknown>;
}

export interface AppDef {
  id: AppId;
  /** 菜单栏上显示的应用名 */
  name: string;
  icon: IconName;
  size: { w: number; h: number };
  resizable?: boolean;
  kind: "window" | "overlay";
  component?: ComponentType<AppProps>;
  /** 是否出现在 Launchpad / Spotlight */
  listed?: boolean;
  /** Spotlight 关键词 */
  keywords?: string;
}

export const APPS: Record<AppId, AppDef> = {
  finder: { id: "finder", name: "Finder", icon: "finder", size: { w: 940, h: 580 }, kind: "window", component: Finder, listed: true, keywords: "projects files folder" },
  launchpad: { id: "launchpad", name: "Launchpad", icon: "launchpad", size: { w: 0, h: 0 }, kind: "overlay", listed: false },
  about: { id: "about", name: "Contacts", icon: "contacts", size: { w: 780, h: 560 }, kind: "window", component: About, listed: true, keywords: "about me zac chen bio experience education skills" },
  safari: { id: "safari", name: "Safari", icon: "safari", size: { w: 1040, h: 640 }, kind: "window", component: Safari, listed: true, keywords: "browser web live demo" },
  mail: { id: "mail", name: "Mail", icon: "mail", size: { w: 660, h: 540 }, kind: "window", component: Mail, listed: true, keywords: "contact email message" },
  notes: { id: "notes", name: "Notes", icon: "notes", size: { w: 820, h: 540 }, kind: "window", component: Notes, listed: true, keywords: "blog now welcome" },
  terminal: { id: "terminal", name: "Terminal", icon: "terminal", size: { w: 700, h: 460 }, kind: "window", component: Terminal, listed: true, keywords: "shell cli command" },
  simulator: { id: "simulator", name: "Simulator", icon: "simulator", size: { w: 860, h: 720 }, kind: "window", component: Simulator, listed: true, keywords: "iphone ios apps" },
  github: { id: "github", name: "GitHub", icon: "github", size: { w: 860, h: 580 }, kind: "window", component: GitHubApp, listed: true, keywords: "stats contributions repos activity" },
  settings: { id: "settings", name: "System Settings", icon: "settings", size: { w: 760, h: 540 }, kind: "window", component: Settings, listed: true, keywords: "wallpaper appearance dark mode preferences" },
  preview: { id: "preview", name: "Preview", icon: "preview", size: { w: 720, h: 720 }, kind: "window", component: Preview, listed: true, keywords: "resume cv pdf" },
  trash: { id: "trash", name: "Trash", icon: "trash", size: { w: 620, h: 400 }, kind: "window", component: Trash, listed: false },
  vibeisland: { id: "vibeisland", name: "VibeIsland", icon: "vibeisland", size: { w: 980, h: 660 }, kind: "window", component: VibeIslandApp, listed: true, keywords: "notch macos app agents" },
  aboutmac: { id: "aboutmac", name: "Finder", icon: "aboutmac", size: { w: 300, h: 470 }, resizable: false, kind: "window", component: AboutMac, listed: false },
};

/** 打开的窗口在标题栏/Dock 中显示的标题 */
export const APP_TITLES: Partial<Record<AppId, string>> = {
  about: "Zac Chen",
  preview: "Resume.pdf",
  aboutmac: "",
};

/** Dock 中固定的应用；"|" 是分隔线 */
export const DOCK: (AppId | "|")[] = [
  "finder",
  "launchpad",
  "safari",
  "about",
  "mail",
  "notes",
  "terminal",
  "simulator",
  "github",
  "settings",
  "|",
  "preview",
  "trash",
];
