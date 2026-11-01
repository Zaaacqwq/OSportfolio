"use client";

import { useCallback, useEffect, useState } from "react";
import { profile } from "@/config/profile";
import { APPS, DESKTOP_ICONS } from "@/lib/apps";
import { getWallpaper } from "@/lib/wallpapers";
import { useWindowManager } from "@/context/WindowManager";
import { useIsMobile } from "@/lib/useIsMobile";
import { AppIcon } from "./AppIcon";
import { BootScreen } from "./BootScreen";
import { Dock } from "./Dock";
import { MenuBar } from "./MenuBar";
import { Window } from "./Window";

const BOOT_KEY = "osportfolio:booted";

export function Desktop() {
  const { windows, wallpaper, open } = useWindowManager();
  const isMobile = useIsMobile();
  const [booting, setBooting] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  // 同一个会话里只播放一次开机动画
  useEffect(() => {
    try {
      if (sessionStorage.getItem(BOOT_KEY)) setBooting(false);
    } catch {
      /* ignore */
    }
  }, []);

  const finishBoot = useCallback(() => {
    setBooting(false);
    try {
      sessionStorage.setItem(BOOT_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  // 开机后自动打开 About 窗口（桌面端）
  useEffect(() => {
    if (!booting && !isMobile && windows.length === 0) {
      const t = setTimeout(() => open("about"), 350);
      return () => clearTimeout(t);
    }
    // 只在开机结束时触发一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting]);

  return (
    <main
      className="desktop fixed inset-0 overflow-hidden"
      style={{ background: getWallpaper(wallpaper).background }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setSelected(null);
      }}
    >
      <MenuBar onRestart={() => setBooting(true)} />

      {/* 桌面中央的大标题 */}
      <section className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 pb-24 text-center text-white">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.35em] opacity-80">{profile.title}</p>
        <h1 className="hero-title text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl">
          Hi, I&apos;m {profile.name}.
        </h1>
        <p className="mt-4 max-w-xl text-base opacity-85 sm:text-lg">
          Welcome to my desktop — open an app from the dock to look around.
        </p>
      </section>

      {/* 桌面图标 */}
      <div className="absolute inset-x-0 top-10 flex flex-row justify-around px-2 sm:inset-x-auto sm:right-5 sm:top-12 sm:flex-col sm:items-center sm:gap-3 sm:px-0">
        {DESKTOP_ICONS.map((id) => {
          const app = APPS[id];
          return (
            <button
              key={id}
              className={`desktop-icon flex w-20 flex-col items-center gap-1 rounded-md p-1.5 text-white ${selected === id ? "is-selected" : ""}`}
              onClick={() => (isMobile ? open(id) : setSelected(id))}
              onDoubleClick={() => open(id)}
            >
              <AppIcon icon={app.icon} size={isMobile ? 44 : 52} />
              <span className="desktop-icon-label rounded px-1 text-[12px] leading-tight">{app.title}</span>
            </button>
          );
        })}
      </div>

      {windows.map((w) => (
        <Window key={w.id} win={w} />
      ))}

      <Dock />

      {booting && <BootScreen onDone={finishBoot} />}
    </main>
  );
}
