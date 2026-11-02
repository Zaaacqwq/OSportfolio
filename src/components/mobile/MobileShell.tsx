"use client";

import { useEffect, useMemo, useState } from "react";
import { LuBatteryFull, LuSearch, LuSignal, LuWifi } from "react-icons/lu";
import { useSystem, type WindowState } from "@/context/System";
import { APPS, type AppId } from "@/lib/apps";
import { FEATURED } from "@/config/projects";
import { openProject } from "@/lib/openProject";
import { WindowCtx } from "../chrome/WindowChrome";
import { SystemIcon } from "../icons/AppIcons";
import { ProjectIcon } from "../icons/ProjectIcon";
import { useClock } from "../MenuBar";
import { ContributionsWidget, ProfileWidget } from "../system/Widgets";
import { Spotlight } from "../system/Spotlight";
import { Toasts } from "../system/NotificationCenter";
import { ContextMenu } from "../system/ContextMenu";
import { SpotifyHost } from "../music/SpotifyHost";
import { Artwork, TransportControls, ProgressBar } from "../music/MusicParts";
import { useNowPlaying } from "@/lib/music/store";

const GRID: AppId[] = ["about", "finder", "music", "vibeisland", "github", "notes", "preview", "settings"];
const DOCK: AppId[] = ["finder", "safari", "mail", "terminal"];

function StatusBar() {
  const now = useClock(10_000);
  return (
    <div className="flex h-[44px] shrink-0 items-center justify-between px-7 pt-[env(safe-area-inset-top)] text-[15px] font-semibold text-white">
      <span className="tabular-nums">{now?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, "")}</span>
      <span className="flex items-center gap-1.5">
        <LuSignal />
        <LuWifi />
        <LuBatteryFull className="text-[20px]" />
      </span>
    </div>
  );
}

/** 手机上：类 iOS 的主屏幕，应用全屏打开 */
export function MobileShell({ background }: { background: string }) {
  const sys = useSystem();
  const now = useNowPlaying();

  // 手机上没有锁屏
  useEffect(() => {
    if (sys.locked) sys.unlock();
  }, [sys]);

  const top = useMemo(() => {
    const visible = sys.windows.filter((w) => !w.minimized);
    return visible.length ? visible.reduce((a, b) => (a.z > b.z ? a : b)) : null;
  }, [sys.windows]);

  const tile = (id: AppId) => (
    <button key={id} onClick={() => sys.open(id)} className="flex flex-col items-center gap-1.5 active:scale-95">
      <SystemIcon name={APPS[id].icon} size={60} />
      <span className="max-w-[72px] truncate text-[11.5px] font-medium text-white drop-shadow">{id === "preview" ? "Resume" : APPS[id].name}</span>
    </button>
  );

  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden" style={{ background }}>
      <StatusBar />
      <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-5 pb-36 pt-2">
        <div className="grid grid-cols-1 gap-4">
          <ProfileWidget />
        </div>
        <div className="mt-6 grid grid-cols-4 gap-x-3 gap-y-5">{GRID.map(tile)}</div>
        <div className="mt-6">
          <ContributionsWidget />
        </div>
        <div className="mt-6 grid grid-cols-4 gap-x-3 gap-y-5">
          {FEATURED.filter((p) => p.slug !== "vibeisland").map((p) => (
            <button key={p.slug} onClick={() => openProject(sys, p)} className="flex flex-col items-center gap-1.5 active:scale-95">
              <ProjectIcon project={p} size={60} />
              <span className="max-w-[72px] truncate text-[11.5px] font-medium text-white drop-shadow">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {now.track && (
        <div className="glass absolute inset-x-3 bottom-[100px] flex items-center gap-2.5 rounded-[18px] p-2 pr-1 text-fg" data-mini-player>
          <button onClick={() => sys.open("music")} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
            <Artwork track={now.track} size={40} rounded={8} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold">{now.track.title}</span>
              <span className="block truncate text-[11.5px] text-muted">{now.track.artist}</span>
            </span>
          </button>
          <TransportControls size={17} btnClass="h-9 w-9" />
          <div className="absolute inset-x-4 bottom-[1px]">
            <ProgressBar showTime={false} className="!gap-0 [&>div]:!h-[4px]" />
          </div>
        </div>
      )}

      <button
        onClick={() => sys.setOverlay("spotlight")}
        className={`absolute ${now.track ? "bottom-[170px]" : "bottom-[112px]"} left-1/2 flex h-[30px] -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/25 px-4 text-[13px] font-medium text-white backdrop-blur-xl`}
      >
        <LuSearch /> Search
      </button>

      <div className="dock absolute inset-x-3 bottom-3 flex justify-around rounded-[32px] px-3 py-3">
        {DOCK.map((id) => (
          <button key={id} onClick={() => sys.open(id)} aria-label={APPS[id].name} className="active:scale-95">
            <SystemIcon name={APPS[id].icon} size={60} />
          </button>
        ))}
      </div>

      {top && <MobileWindow key={top.id} win={top} />}
      {sys.overlay === "spotlight" && <Spotlight />}
      <Toasts />
      <ContextMenu />
      <SpotifyHost />
    </main>
  );
}

function MobileWindow({ win }: { win: WindowState }) {
  const sys = useSystem();
  const [leaving, setLeaving] = useState(false);
  const app = APPS[win.id];
  const Content = app.component;
  const close = () => {
    setLeaving(true);
    setTimeout(() => sys.close(win.id), 220);
  };
  return (
    <WindowCtx.Provider
      value={{ id: win.id, active: true, maximized: true, resizable: false, mobile: true, close, minimize: close, zoom: () => {}, onDragStart: () => {} }}
    >
      <div
        className={`window fixed inset-0 z-[5000] flex flex-col !rounded-none pt-[env(safe-area-inset-top)] transition-transform duration-200 ${leaving ? "translate-y-full" : "window-opening"}`}
        style={{ ["--origin-x" as string]: "50%", ["--origin-y" as string]: "100%" }}
      >
        <div className="relative flex min-h-0 flex-1 flex-col">{Content ? <Content params={win.params} /> : null}</div>
        <button aria-label="Close app" onClick={close} className="flex h-[26px] shrink-0 items-center justify-center pb-[env(safe-area-inset-bottom)]">
          <span className="h-[5px] w-[134px] rounded-full bg-fg opacity-80" />
        </button>
      </div>
    </WindowCtx.Provider>
  );
}
