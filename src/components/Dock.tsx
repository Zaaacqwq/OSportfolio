"use client";

import { useRef, useState } from "react";
import { APPS, APP_TITLES, DOCK, type AppId } from "@/lib/apps";
import { useSystem } from "@/context/System";
import { SystemIcon } from "./icons/AppIcons";

const BASE = 54;
const MAX = 92;
const RANGE = 170;

export function Dock() {
  const sys = useSystem();
  const { windows, open, focus, activeId, minimize, overlay, setOverlay, showContextMenu, close } = sys;
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState<AppId | null>(null);
  const refs = useRef<Partial<Record<AppId, HTMLButtonElement | null>>>({});

  // 运行中但没有固定在 Dock 的应用，追加在分隔线前（和 macOS 一样）
  const pinned = DOCK.filter((d): d is AppId => d !== "|");
  const extra = windows.map((w) => w.id).filter((id) => !pinned.includes(id) && id !== "aboutmac");
  const sep = DOCK.indexOf("|");
  const items: (AppId | "|")[] = [...DOCK.slice(0, sep), ...extra, ...DOCK.slice(sep)];

  const sizeFor = (id: AppId) => {
    if (mouseX === null) return BASE;
    const el = refs.current[id];
    if (!el) return BASE;
    const r = el.getBoundingClientRect();
    const d = Math.abs(mouseX - (r.left + r.width / 2));
    if (d > RANGE) return BASE;
    const f = (Math.cos((d / RANGE) * Math.PI) + 1) / 2;
    return BASE + (MAX - BASE) * f;
  };

  const centerOf = (id: AppId) => {
    const r = refs.current[id]?.getBoundingClientRect();
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
    setTimeout(() => setBouncing(null), 800);
    setTimeout(() => open(id, undefined, centerOf(id)), 250);
  };

  const onContext = (e: React.MouseEvent, id: AppId) => {
    e.preventDefault();
    const running = windows.some((w) => w.id === id);
    showContextMenu(e.clientX, e.clientY - 8, [
      ...(running
        ? [{ label: "Show All Windows", action: () => focus(id) }, "separator" as const]
        : []),
      { label: running ? "Show" : "Open", action: () => handleClick(id) },
      ...(id !== "finder" && id !== "launchpad" && id !== "trash"
        ? [{ label: "Show in Finder", action: () => open("finder", { section: "applications", nonce: Date.now() }) }]
        : []),
      ...(running ? ["separator" as const, { label: "Quit", action: () => close(id) }] : []),
    ]);
  };

  return (
    <nav
      aria-label="Dock"
      className="pointer-events-none fixed inset-x-0 bottom-[6px] z-[8000] flex justify-center px-2"
      onMouseLeave={() => setMouseX(null)}
    >
      <div
        data-dock
        className="dock pointer-events-auto flex max-w-full items-end gap-[5px] rounded-[26px] px-[7px] pb-[6px] pt-[6px]"
        onMouseMove={(e) => setMouseX(e.clientX)}
      >
        {items.map((id, i) => {
          if (id === "|") return <div key={`sep-${i}`} className="mx-1 h-[46px] w-px self-center bg-black/15 dark:bg-white/20" />;
          const app = APPS[id];
          const size = sizeFor(id);
          const isOpen = windows.some((w) => w.id === id) || (id === "launchpad" && overlay === "launchpad");
          const title = APP_TITLES[id] && id === "preview" ? "Resume.pdf" : app.name;
          return (
            <button
              key={id}
              ref={(el) => {
                refs.current[id] = el;
              }}
              data-dock-id={id}
              onClick={() => handleClick(id)}
              onContextMenu={(e) => onContext(e, id)}
              aria-label={title}
              className="dock-item group relative flex shrink-0 flex-col items-center"
              style={{ width: size }}
            >
              <span className="tooltip pointer-events-none absolute -top-[46px] whitespace-nowrap rounded-[8px] px-2.5 py-[3px] text-[13px] opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                {title}
              </span>
              <span className={`app-icon-box block ${bouncing === id ? "dock-bounce" : ""}`} style={{ width: size, height: size }}>
                <SystemIcon name={app.icon} size={size} />
              </span>
              <span
                className={`absolute -bottom-[5px] h-[4px] w-[4px] rounded-full bg-black/70 transition-opacity dark:bg-white/80 ${isOpen ? "opacity-100" : "opacity-0"}`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
