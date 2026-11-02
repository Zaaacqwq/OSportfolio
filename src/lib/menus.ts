import type { SystemApi } from "@/context/System";
import { FEATURED, PROJECTS } from "@/config/projects";
import { profile } from "@/config/profile";
import { WALLPAPERS } from "@/lib/wallpapers";
import { APPS, APP_TITLES, type AppId } from "./apps";
import type { MenuDef, MenuEntry } from "./menuTypes";
import { openProject } from "./openProject";
import { music } from "./music/store";

const S = "separator" as const;

export function logoMenu(sys: SystemApi, restart: () => void): MenuEntry[] {
  return [
    { label: "About This Mac", action: () => sys.open("aboutmac") },
    S,
    { label: "System Settings…", action: () => sys.open("settings") },
    { label: "App Store…", disabled: true },
    S,
    {
      label: "Recent Items",
      submenu: FEATURED.slice(0, 6).map((p) => ({ label: p.name, action: () => openProject(sys, p) })),
    },
    S,
    { label: "Force Quit…", shortcut: "⌥⌘⎋", disabled: true },
    S,
    { label: "Sleep", action: sys.lock },
    { label: "Restart…", action: restart },
    { label: "Shut Down…", disabled: true },
    S,
    { label: "Lock Screen", shortcut: "⌃⌘Q", action: sys.lock },
    { label: `Log Out ${profile.name}…`, shortcut: "⇧⌘Q", action: sys.lock },
  ];
}

function windowMenu(sys: SystemApi, active: AppId | null): MenuDef {
  const list: MenuEntry[] = sys.windows.map((w) => ({
    label: APP_TITLES[w.id] || APPS[w.id].name,
    checked: w.id === active,
    action: () => sys.focus(w.id),
  }));
  return {
    title: "Window",
    items: [
      { label: "Minimize", shortcut: "⌘M", disabled: !active, action: () => active && sys.minimize(active) },
      { label: "Zoom", disabled: !active, action: () => active && sys.toggleMaximize(active) },
      S,
      { label: "Bring All to Front", disabled: !sys.windows.length, action: () => sys.windows.forEach((w) => sys.focus(w.id)) },
      ...(list.length ? [S, ...list] : []),
    ],
  };
}

function helpMenu(sys: SystemApi): MenuDef {
  return {
    title: "Help",
    items: [
      { label: "Search", shortcut: "⌘K", action: () => sys.setOverlay("spotlight") },
      S,
      { label: "Portfolio Help", action: () => sys.open("terminal", { run: "help", nonce: Date.now() }) },
      { label: "View Source on GitHub", action: () => window.open("https://github.com/Zaaacqwq/OSportfolio", "_blank") },
    ],
  };
}

export function appMenus(sys: SystemApi, active: AppId | null): { appName: string; menus: MenuDef[] } {
  const appName = active ? APPS[active].name : "Finder";
  const close: MenuEntry = { label: "Close Window", shortcut: "⌘W", disabled: !active, action: () => active && sys.close(active) };

  const appMenu: MenuDef = {
    title: appName,
    items: [
      { label: `About ${appName}`, action: () => sys.open("aboutmac") },
      S,
      { label: "Settings…", shortcut: "⌘,", action: () => sys.open("settings") },
      S,
      { label: `Hide ${appName}`, shortcut: "⌘H", disabled: !active, action: () => active && sys.minimize(active) },
      { label: `Quit ${appName}`, shortcut: "⌘Q", disabled: !active, action: () => active && sys.close(active) },
    ],
  };

  const go: MenuDef = {
    title: "Go",
    items: [
      { label: "Projects", shortcut: "⇧⌘P", action: () => sys.open("finder", { section: "all", nonce: Date.now() }) },
      { label: "Applications", shortcut: "⇧⌘A", action: () => sys.setOverlay("launchpad") },
      { label: "Desktop", shortcut: "⇧⌘D", action: () => sys.windows.forEach((w) => sys.minimize(w.id)) },
      { label: "Documents", action: () => sys.open("preview") },
      S,
      ...FEATURED.map((p) => ({ label: p.name, action: () => openProject(sys, p) })),
    ],
  };

  const view: MenuDef = {
    title: "View",
    items: [
      { label: "Enter Full Screen", shortcut: "⌃⌘F", disabled: !active, action: () => active && sys.toggleMaximize(active) },
      S,
      {
        label: "Appearance",
        submenu: [
          { label: "Light", checked: sys.appearance === "light", action: () => sys.setAppearance("light") },
          { label: "Dark", checked: sys.appearance === "dark", action: () => sys.setAppearance("dark") },
        ],
      },
      {
        label: "Wallpaper",
        submenu: WALLPAPERS.map((w) => ({ label: w.name, checked: sys.wallpaper === w.id, action: () => sys.setWallpaper(w.id) })),
      },
    ],
  };

  const edit: MenuDef = {
    title: "Edit",
    items: [
      { label: "Undo", shortcut: "⌘Z", disabled: true },
      { label: "Redo", shortcut: "⇧⌘Z", disabled: true },
      S,
      { label: "Cut", shortcut: "⌘X", disabled: true },
      { label: "Copy", shortcut: "⌘C", disabled: true },
      { label: "Paste", shortcut: "⌘V", disabled: true },
      { label: "Select All", shortcut: "⌘A", disabled: true },
      S,
      { label: "Copy Email Address", action: () => navigator.clipboard?.writeText(profile.email) },
    ],
  };

  let file: MenuDef;
  switch (active) {
    case "safari":
      file = {
        title: "File",
        items: [
          { label: "New Tab", shortcut: "⌘T", action: () => sys.setParams("safari", { slug: null, nonce: Date.now() }) },
          S,
          ...PROJECTS.filter((p) => p.live).map((p) => ({ label: `Open ${p.name}`, action: () => openProject(sys, p) })),
          S,
          close,
        ],
      };
      break;
    case "terminal":
      file = {
        title: "Shell",
        items: [
          { label: "New Window", shortcut: "⌘N", action: () => sys.open("terminal") },
          S,
          { label: "Run “help”", action: () => sys.open("terminal", { run: "help", nonce: Date.now() }) },
          { label: "Run “neofetch”", action: () => sys.open("terminal", { run: "neofetch", nonce: Date.now() }) },
          S,
          close,
        ],
      };
      break;
    case "mail":
      file = { title: "File", items: [{ label: "New Message", shortcut: "⌘N", action: () => sys.open("mail") }, S, close] };
      break;
    default:
      file = {
        title: "File",
        items: [
          { label: "New Finder Window", shortcut: "⌘N", action: () => sys.open("finder") },
          { label: "Open Resume", shortcut: "⌘O", action: () => sys.open("preview") },
          S,
          close,
          S,
          { label: "Get Info", shortcut: "⌘I", action: () => sys.open("about") },
        ],
      };
  }

  const controls: MenuDef = {
    title: "Controls",
    items: [
      { label: "Play / Pause", shortcut: "Space", action: music.toggle },
      { label: "Next", shortcut: "⌘→", action: music.next },
      { label: "Previous", shortcut: "⌘←", action: music.prev },
      S,
      { label: "Go Forward 10s", shortcut: "→", action: () => music.skipBy(10_000) },
      { label: "Go Back 10s", shortcut: "←", action: () => music.skipBy(-10_000) },
      S,
      { label: "Shuffle", checked: music.getNow().shuffle, action: () => music.setShuffle(!music.getNow().shuffle) },
      {
        label: "Repeat",
        submenu: (["off", "all", "one"] as const).map((r) => ({
          label: r === "off" ? "Off" : r === "all" ? "All" : "One",
          checked: music.getNow().repeat === r,
          action: () => {
            while (music.getNow().repeat !== r) music.cycleRepeat();
          },
        })),
      },
    ],
  };

  const menus = [appMenu, file, edit, view, go, ...(active === "music" ? [controls] : []), windowMenu(sys, active), helpMenu(sys)];
  return { appName, menus };
}
