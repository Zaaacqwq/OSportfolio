"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { APPS } from "@/lib/apps";
import { MENU_BAR_H, useWindowManager, type Rect, type WindowState } from "@/context/WindowManager";
import { useIsMobile } from "@/lib/useIsMobile";

const MIN_W = 320;
const MIN_H = 220;

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export function Window({ win }: { win: WindowState }) {
  const app = APPS[win.id];
  const { close, focus, minimize, toggleMaximize, move, activeId } = useWindowManager();
  const isMobile = useIsMobile();
  const active = activeId === win.id;
  const [closing, setClosing] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 拖动/缩放期间直接操作 DOM，松手时再写回状态，保证 60fps
  const live = useRef<Rect>({ x: win.x, y: win.y, w: win.w, h: win.h });
  useEffect(() => {
    live.current = { x: win.x, y: win.y, w: win.w, h: win.h };
  }, [win.x, win.y, win.w, win.h]);

  const apply = (r: Rect) => {
    const el = ref.current;
    if (!el) return;
    el.style.left = `${r.x}px`;
    el.style.top = `${r.y}px`;
    el.style.width = `${r.w}px`;
    el.style.height = `${r.h}px`;
  };

  const startDrag = useCallback(
    (e: ReactPointerEvent) => {
      if (isMobile || e.button !== 0) return;
      if ((e.target as HTMLElement).closest("button")) return;
      focus(win.id);
      const startX = e.clientX;
      const startY = e.clientY;
      // 从最大化状态拖出来时，先还原尺寸并让窗口跟随鼠标
      let origin = { ...live.current };
      if (win.maximized && win.restore) {
        const ratio = (startX - origin.x) / origin.w;
        origin = {
          ...win.restore,
          x: startX - win.restore.w * ratio,
          y: MENU_BAR_H,
        };
      }
      setInteracting(true);
      const onMove = (ev: PointerEvent) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const x = Math.min(Math.max(origin.x + ev.clientX - startX, 80 - origin.w), vw - 80);
        const y = Math.min(Math.max(origin.y + ev.clientY - startY, MENU_BAR_H), vh - 40);
        live.current = { ...origin, x, y };
        apply(live.current);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        setInteracting(false);
        move(win.id, { ...live.current });
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [focus, move, win.id, win.maximized, win.restore, isMobile],
  );

  const startResize = (edge: Edge) => (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    focus(win.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const o = { ...live.current };
    setInteracting(true);
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let { x, y, w, h } = o;
      if (edge.includes("e")) w = Math.max(MIN_W, o.w + dx);
      if (edge.includes("s")) h = Math.max(MIN_H, o.h + dy);
      if (edge.includes("w")) {
        w = Math.max(MIN_W, o.w - dx);
        x = o.x + (o.w - w);
      }
      if (edge.includes("n")) {
        const maxDy = o.y - MENU_BAR_H;
        h = Math.max(MIN_H, o.h - Math.max(dy, -maxDy));
        y = o.y + (o.h - h);
      }
      live.current = { x, y, w, h };
      apply(live.current);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setInteracting(false);
      move(win.id, { ...live.current });
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => close(win.id), 160);
  };

  const Content = app.component;
  const dark = app.theme === "dark";

  const style = isMobile
    ? { left: 0, top: MENU_BAR_H, width: "100%", height: `calc(100dvh - ${MENU_BAR_H}px - 76px)`, zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={app.title}
      onPointerDown={() => focus(win.id)}
      className={[
        "window absolute flex flex-col overflow-hidden",
        isMobile ? "rounded-none" : "rounded-xl",
        dark ? "window-dark" : "window-light",
        active ? "window-active" : "",
        closing ? "window-closing" : "window-opening",
        win.minimized ? "window-minimized" : "",
        interacting ? "select-none" : "",
        !interacting && !isMobile ? "window-animate" : "",
      ].join(" ")}
      style={style}
    >
      {/* 标题栏 */}
      <div
        className="titlebar relative flex h-10 shrink-0 items-center px-3"
        onPointerDown={startDrag}
        onDoubleClick={() => !isMobile && toggleMaximize(win.id)}
      >
        <div className="traffic group flex items-center gap-2">
          <button aria-label="Close" className="light light-close" onClick={handleClose}>
            <svg viewBox="0 0 10 10"><path d="M3 3l4 4M7 3l-4 4" /></svg>
          </button>
          <button aria-label="Minimize" className="light light-min" onClick={() => minimize(win.id)}>
            <svg viewBox="0 0 10 10"><path d="M2.5 5h5" /></svg>
          </button>
          <button
            aria-label="Zoom"
            className="light light-max"
            onClick={() => !isMobile && toggleMaximize(win.id)}
          >
            <svg viewBox="0 0 10 10"><path d="M3 7V3.6L6.4 7zM7 3v3.4L3.6 3z" fill="currentColor" stroke="none" /></svg>
          </button>
        </div>
        <div className="pointer-events-none absolute inset-x-0 text-center text-[13px] font-semibold opacity-80">
          {app.title}
        </div>
      </div>

      {/* 内容 */}
      <div className="window-body relative min-h-0 flex-1 overflow-auto">
        {Content ? <Content params={win.params} /> : null}
      </div>

      {/* 缩放手柄 */}
      {!isMobile && !win.maximized && (
        <>
          {(["n", "s", "e", "w", "ne", "nw", "se", "sw"] as Edge[]).map((edge) => (
            <div key={edge} className={`resize resize-${edge}`} onPointerDown={startResize(edge)} />
          ))}
        </>
      )}
    </div>
  );
}
