"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSystem } from "@/context/System";
import { getWallpaper, WALLPAPERS } from "@/lib/wallpapers";
import { getProject } from "@/config/projects";
import { openProject } from "@/lib/openProject";
import { useIsMobile } from "@/lib/useIsMobile";
import { BootScreen } from "./BootScreen";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { Window } from "./Window";
import { FolderIcon, SystemIcon } from "./icons/AppIcons";
import { LockScreen } from "./system/LockScreen";
import { Spotlight } from "./system/Spotlight";
import { Launchpad } from "./system/Launchpad";
import { ControlCenter } from "./system/ControlCenter";
import { NotificationCenter, Toasts } from "./system/NotificationCenter";
import { ContextMenu } from "./system/ContextMenu";
import { CalendarWidget, ClockWidget, ContributionsWidget, FeaturedWidget, ProfileWidget } from "./system/Widgets";
import { MobileShell } from "./mobile/MobileShell";

const BOOT_KEY = "osp:booted";

interface DesktopItem {
  id: string;
  label: string;
  icon: ReactNode;
  open: () => void;
}

export function Desktop() {
  const sys = useSystem();
  const isMobile = useIsMobile();
  const [booting, setBooting] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const iconRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const welcomed = useRef(false);
  const [lpMounted, setLpMounted] = useState(false);

  const wp = getWallpaper(sys.wallpaper);
  const background = sys.appearance === "dark" ? wp.dark : wp.light;

  // 同一会话里只播放一次开机动画和锁屏
  useEffect(() => {
    try {
      if (sessionStorage.getItem(BOOT_KEY)) {
        setBooting(false);
        sys.unlock();
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishBoot = useCallback(() => setBooting(false), []);

  const restart = useCallback(() => {
    sys.windows.forEach((w) => sys.close(w.id));
    try {
      sessionStorage.removeItem(BOOT_KEY);
    } catch {
      /* ignore */
    }
    sys.lock();
    setBooting(true);
  }, [sys]);

  const handleUnlock = () => {
    sys.unlock();
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  // 解锁后：欢迎通知
  useEffect(() => {
    if (sys.locked || booting || welcomed.current || isMobile) return;
    welcomed.current = true;
    const t1 = setTimeout(
      () =>
        sys.notify({
          title: "Welcome to Zac's Mac 👋",
          body: "Press ⌘K to search, hover the notch to see VibeIsland, or open Finder to browse my projects.",
          icon: "finder",
          onClick: () => sys.open("finder"),
        }),
      900,
    );
    return () => clearTimeout(t1);
  }, [sys.locked, booting, isMobile, sys]);

  // Launchpad 在空闲时预挂载，第一次打开也不用现场生成图标
  useEffect(() => {
    if (lpMounted) return;
    if (sys.overlay === "launchpad") {
      setLpMounted(true);
      return;
    }
    if (sys.locked || booting) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setLpMounted(true), { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setLpMounted(true), 1200);
    return () => clearTimeout(t);
  }, [lpMounted, sys.overlay, sys.locked, booting]);

  // 全局快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (sys.locked) return;
      if (mod && (e.key === "k" || e.code === "Space")) {
        e.preventDefault();
        sys.toggleOverlay("spotlight");
      } else if (e.key === "Escape") {
        if (sys.overlay) sys.setOverlay(null);
      } else if (mod && e.key.toLowerCase() === "m" && sys.activeId) {
        e.preventDefault();
        sys.minimize(sys.activeId);
      } else if (mod && e.key === "`" && sys.windows.length > 1) {
        e.preventDefault();
        const sorted = [...sys.windows].filter((w) => !w.minimized).sort((a, b) => a.z - b.z);
        if (sorted[0]) sys.focus(sorted[0].id);
      } else if (e.altKey && e.key.toLowerCase() === "w" && sys.activeId) {
        sys.close(sys.activeId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sys]);

  const items: DesktopItem[] = [
    { id: "hd", label: "Zac HD", icon: <SystemIcon name="drive" size={58} />, open: () => sys.open("about") },
    { id: "projects", label: "Projects", icon: <FolderIcon size={60} />, open: () => sys.open("finder", { section: "all", nonce: Date.now() }) },
    { id: "resume", label: "Resume.pdf", icon: <SystemIcon name="preview" size={56} />, open: () => sys.open("preview") },
    { id: "vibe", label: "VibeIsland.app", icon: <SystemIcon name="vibeisland" size={56} />, open: () => sys.open("vibeisland") },
    {
      id: "sts",
      label: "SlayTheSpireRL",
      icon: <FolderIcon size={60} tint="#a35cff" />,
      open: () => openProject(sys, getProject("slaythespire")!),
    },
  ];

  // 在桌面空白处拖动画框选择
  const onDesktopPointerDown = (e: React.PointerEvent) => {
    if (e.target !== e.currentTarget || e.button !== 0) return;
    setSelected([]);
    const sx = e.clientX;
    const sy = e.clientY;
    const onMove = (ev: PointerEvent) => {
      const r = { x: Math.min(sx, ev.clientX), y: Math.min(sy, ev.clientY), w: Math.abs(ev.clientX - sx), h: Math.abs(ev.clientY - sy) };
      setRect(r);
      const hit = Object.entries(iconRefs.current)
        .filter(([, el]) => {
          if (!el) return false;
          const b = el.getBoundingClientRect();
          return b.left < r.x + r.w && b.right > r.x && b.top < r.y + r.h && b.bottom > r.y;
        })
        .map(([id]) => id);
      setSelected(hit);
    };
    const onUp = () => {
      setRect(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const onDesktopContext = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    sys.showContextMenu(e.clientX, e.clientY, [
      { label: "New Folder", shortcut: "⇧⌘N", disabled: true },
      "separator",
      { label: "Get Info", shortcut: "⌘I", action: () => sys.open("aboutmac") },
      { label: "Change Wallpaper…", action: () => sys.open("settings", { pane: "wallpaper", nonce: Date.now() }) },
      {
        label: "Wallpaper",
        submenu: WALLPAPERS.map((w) => ({ label: w.name, checked: w.id === sys.wallpaper, action: () => sys.setWallpaper(w.id) })),
      },
      "separator",
      { label: sys.appearance === "dark" ? "Use Light Appearance" : "Use Dark Appearance", action: () => sys.setAppearance(sys.appearance === "dark" ? "light" : "dark") },
      { label: "Use Stacks", disabled: true },
      { label: "Sort By", submenu: [{ label: "Name", checked: true }, { label: "Kind" }, { label: "Date Modified" }] },
      { label: "Show View Options", shortcut: "⌘J", disabled: true },
      "separator",
      { label: "Open Terminal Here", action: () => sys.open("terminal") },
    ]);
  };

  if (isMobile) return <MobileShell background={background} />;

  return (
    <main className="fixed inset-0 overflow-hidden" style={{ filter: sys.brightness < 1 ? `brightness(${sys.brightness})` : undefined }}>
      <div className="absolute inset-0 transition-[background] duration-700" style={{ background }} />

      <div className="absolute inset-0" onPointerDown={onDesktopPointerDown} onContextMenu={onDesktopContext}>
        {/* 小组件 */}
        <div className="pointer-events-auto absolute left-5 top-[44px] hidden w-[300px] flex-col gap-4 lg:flex">
          <ProfileWidget />
          <ContributionsWidget />
          <div className="grid grid-cols-2 gap-4">
            <CalendarWidget />
            <ClockWidget />
          </div>
          <FeaturedWidget />
        </div>

        {/* 桌面图标（右侧竖排） */}
        <div className="absolute right-3 top-[38px] flex flex-col items-center gap-1">
          {items.map((it) => (
            <button
              key={it.id}
              ref={(el) => {
                iconRefs.current[it.id] = el;
              }}
              className={`desktop-icon flex w-[92px] flex-col items-center gap-1 p-1 text-white ${selected.includes(it.id) ? "is-selected" : ""}`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => setSelected(e.metaKey || e.shiftKey ? [...selected, it.id] : [it.id])}
              onDoubleClick={it.open}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelected([it.id]);
                sys.showContextMenu(e.clientX, e.clientY, [
                  { label: "Open", action: it.open },
                  "separator",
                  { label: "Get Info", action: () => sys.open("aboutmac") },
                  { label: "Rename", disabled: true },
                  { label: "Move to Trash", action: () => sys.open("trash") },
                ]);
              }}
            >
              <span className="icon-wrap grid h-[68px] w-[72px] place-items-center rounded-[8px]">{it.icon}</span>
              <span className="desktop-label rounded-[4px] px-1.5 text-center text-[12px] font-medium leading-[15px]">{it.label}</span>
            </button>
          ))}
        </div>

        {rect && <div className="selection-rect pointer-events-none fixed rounded-[3px]" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} />}
      </div>

      {sys.windows.map((w) => (
        <Window key={w.id} win={w} />
      ))}

      <MenuBar onRestart={restart} />
      <Dock />

      {lpMounted && <Launchpad open={sys.overlay === "launchpad"} />}
      {sys.overlay === "spotlight" && <Spotlight />}
      {sys.overlay === "control" && <ControlCenter />}
      {sys.overlay === "notifications" && <NotificationCenter />}
      <Toasts />
      <ContextMenu />

      {!booting && sys.locked && <LockScreen background={background} onUnlock={handleUnlock} />}
      {booting && <BootScreen onDone={finishBoot} />}
    </main>
  );
}
