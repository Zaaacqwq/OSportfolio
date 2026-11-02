"use client";

import { useEffect, useState } from "react";
import { APPS, APP_TITLES, DOCK, type AppId } from "@/lib/apps";
import { useSystem } from "@/context/System";
import { SystemIcon } from "./icons/AppIcons";
import { useDockMagnification } from "./useDockMagnification";
import { useNowPlaying } from "@/lib/music/store";

const BASE = 54;
const MAX = 92;
const GAP = 5;
const RANGE = 2.6 * (BASE + GAP);

export function Dock() {
  const sys = useSystem();
  const nowPlaying = useNowPlaying();
  const { windows, open, focus, activeId, minimize, overlay, setOverlay, showContextMenu, close } = sys;
  const [bouncing, setBouncing] = useState<AppId | null>(null);
  const { register, handlers, measure } = useDockMagnification({ base: BASE, max: MAX, range: RANGE });

  // 运行中但没有固定在 Dock 的应用，追加在分隔线前（和 macOS 一样）
  const pinned = DOCK.filter((d): d is AppId => d !== "|");
  const extra = windows.map((w) => w.id).filter((id) => !pinned.includes(id) && id !== "aboutmac");
  const sep = DOCK.indexOf("|");
  const items: (AppId | "|")[] = [...DOCK.slice(0, sep), ...extra, ...DOCK.slice(sep)];
  const itemsKey = items.join(",");

  // Dock 里的图标变化后重新测量静止位置
  useEffect(() => {
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [itemsKey, measure]);

  const centerOf = (id: AppId) => {
    const r = document.querySelector(`[data-dock-id="${id}"]`)?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined;
  };

  const handleClick = (id: AppId) => {
    if (id === "launchpad") {
      setOverlay(overlay === "launchpad" ? null : "launchpad");
      return;
    }
    const win = windows.find((w) => w.id === id);
    if (win && !win.minimized) {
      if (activeId === id) minimize(id);
      else focus(id);
      return;
    }
    if (win?.minimized) {
      focus(id);
      return;
    }
    setBouncing(id);
    setTimeout(() => setBouncing(null), 900);
    setTimeout(() => open(id, undefined, centerOf(id)), 250);
  };

  const onContext = (e: React.MouseEvent, id: AppId) => {
    e.preventDefault();
    const running = windows.some((w) => w.id === id);
    showContextMenu(e.clientX, e.clientY - 8, [
      ...(running ? [{ label: "Show All Windows", action: () => focus(id) }, "separator" as const] : []),
      { label: running ? "Show" : "Open", action: () => handleClick(id) },
      ...(id !== "finder" && id !== "launchpad" && id !== "trash"
        ? [{ label: "Show in Finder", action: () => open("finder", { section: "applications", nonce: Date.now() }) }]
        : []),
      ...(running ? ["separator" as const, { label: "Quit", action: () => close(id) }] : []),
    ]);
  };

  return (
    <nav aria-label="Dock" className="pointer-events-none fixed inset-x-0 bottom-[6px] z-[8000] flex justify-center px-2">
      <div
        data-dock
        className="dock pointer-events-auto flex max-w-full items-end rounded-[26px] px-[7px] py-[6px]"
        style={{ gap: GAP }}
        {...handlers}
      >
        {items.map((id, i) => {
          if (id === "|") return <div key={`sep-${i}`} className="mx-1 h-[42px] w-px self-center bg-black/15 dark:bg-white/20" />;
          const app = APPS[id];
          const isOpen =
            windows.some((w) => w.id === id) || (id === "launchpad" && overlay === "launchpad") || (id === "music" && !!nowPlaying.track);
          const title = APP_TITLES[id] && id === "preview" ? "Resume.pdf" : app.name;
          return (
            <button
              key={id}
              ref={register(id, "slot")}
              data-dock-id={id}
              onClick={() => handleClick(id)}
              onContextMenu={(e) => onContext(e, id)}
              aria-label={title}
              className="dock-slot relative shrink-0"
              style={{ width: BASE, height: BASE }}
            >
              <span ref={register(id, "tooltip")} className="dock-tooltip tooltip" style={{ bottom: BASE + 12 }}>
                {title}
              </span>
              <span className={`dock-bounce-layer ${bouncing === id ? "dock-bounce" : ""}`}>
                <span ref={register(id, "scaler")} className="dock-scaler" style={{ width: MAX, height: MAX }}>
                  <SystemIcon name={app.icon} size={MAX} />
                </span>
              </span>
              <span className={`dock-dot ${isOpen ? "opacity-100" : "opacity-0"}`} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
