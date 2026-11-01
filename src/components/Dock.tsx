"use client";

import { useRef, useState } from "react";
import { APPS, DOCK, type AppId } from "@/lib/apps";
import { useWindowManager } from "@/context/WindowManager";
import { useIsMobile } from "@/lib/useIsMobile";
import { AppIcon } from "./AppIcon";

const BASE = 50;
const MAX = 84;
const RANGE = 150;

export function Dock() {
  const { windows, open, focus, activeId, minimize } = useWindowManager();
  const isMobile = useIsMobile();
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState<AppId | null>(null);
  const refs = useRef<Partial<Record<AppId, HTMLButtonElement | null>>>({});

  const base = isMobile ? 40 : BASE;

  const sizeFor = (id: AppId) => {
    if (mouseX === null || isMobile) return base;
    const el = refs.current[id];
    if (!el) return base;
    const rect = el.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    const d = Math.abs(mouseX - center);
    if (d > RANGE) return base;
    // 余弦曲线放大，越靠近鼠标越大
    const f = (Math.cos((d / RANGE) * Math.PI) + 1) / 2;
    return base + (MAX - base) * f;
  };

  const handleClick = (id: AppId) => {
    const win = windows.find((w) => w.id === id);
    if (win && !win.minimized) {
      // 已经在最前面时再点一下 → 最小化（和 macOS 行为一致）
      if (activeId === id) minimize(id);
      else focus(id);
      return;
    }
    if (!win && !APPS[id].href) {
      setBouncing(id);
      setTimeout(() => setBouncing(null), 700);
    }
    open(id);
  };

  return (
    <nav
      aria-label="Dock"
      className="fixed inset-x-0 bottom-2 z-[8000] flex justify-center px-2"
      onMouseLeave={() => setMouseX(null)}
    >
      <div
        className="dock flex max-w-full items-end gap-1.5 overflow-x-auto rounded-2xl px-2 pb-1.5 pt-1.5 sm:gap-2 sm:overflow-visible"
        onMouseMove={(e) => setMouseX(e.clientX)}
      >
        {DOCK.map((id, i) => {
          if (id === "|") return <div key={`sep-${i}`} className="mx-1 h-10 w-px self-center bg-white/25" />;
          const app = APPS[id];
          const size = sizeFor(id);
          const isOpen = windows.some((w) => w.id === id);
          return (
            <button
              key={id}
              ref={(el) => {
                refs.current[id] = el;
              }}
              onClick={() => handleClick(id)}
              aria-label={app.title}
              className="dock-item group relative flex shrink-0 flex-col items-center"
              style={{ width: size }}
            >
              <span className="dock-tooltip pointer-events-none absolute -top-9 whitespace-nowrap rounded-md px-2.5 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {app.title}
              </span>
              <span className={bouncing === id ? "dock-bounce" : ""}>
                <AppIcon icon={app.icon} size={size} />
              </span>
              <span
                className={`mt-0.5 h-1 w-1 rounded-full bg-white/80 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
