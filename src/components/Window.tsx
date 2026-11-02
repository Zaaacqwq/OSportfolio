"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { APPS } from "@/lib/apps";
import { MENU_BAR_H, useSystem, type Rect, type WindowState } from "@/context/System";
import { WindowCtx, type WindowCtxValue } from "./chrome/WindowChrome";

const MIN_W = 360;
const MIN_H = 260;

type Edge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

/** 找到 Dock 里对应图标的中心点（最小化动画的终点） */
function dockTarget(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-dock-id="${id}"]`) ?? document.querySelector<HTMLElement>("[data-dock]");
  if (!el) return { x: window.innerWidth / 2, y: window.innerHeight - 30 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

export function Window({ win }: { win: WindowState }) {
  const app = APPS[win.id];
  const sys = useSystem();
  const { close, focus, minimize, toggleMaximize, move, activeId } = sys;
  const active = activeId === win.id;
  const resizable = app.resizable !== false;
  const [closing, setClosing] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [opening, setOpening] = useState(true);
  const [minTarget, setMinTarget] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const live = useRef<Rect>({ x: win.x, y: win.y, w: win.w, h: win.h });

  useEffect(() => {
    live.current = { x: win.x, y: win.y, w: win.w, h: win.h };
  }, [win.x, win.y, win.w, win.h]);

  useEffect(() => {
    const t = setTimeout(() => setOpening(false), 420);
    return () => clearTimeout(t);
  }, [win.openKey]);

  const apply = (r: Rect) => {
    const el = ref.current;
    if (!el) return;
    el.style.left = `${r.x}px`;
    el.style.top = `${r.y}px`;
    el.style.width = `${r.w}px`;
    el.style.height = `${r.h}px`;
  };

  const onDragStart = useCallback(
    (e: ReactPointerEvent) => {
      if (e.button !== 0) return;
      focus(win.id);
      const startX = e.clientX;
      const startY = e.clientY;
      let origin = { ...live.current };
      let detached = false;
      setInteracting(true);
      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        // 从最大化状态拖出：先还原尺寸，让窗口保持在鼠标下
        if (win.maximized && win.restore && !detached && Math.hypot(dx, dy) > 4) {
          detached = true;
          const ratio = (startX - origin.x) / origin.w;
          origin = { ...win.restore, x: startX - win.restore.w * ratio, y: MENU_BAR_H };
        }
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const x = Math.min(Math.max(origin.x + dx, 60 - origin.w), vw - 60);
        const y = Math.min(Math.max(origin.y + dy, MENU_BAR_H), vh - 50);
        live.current = { ...origin, x, y };
        apply(live.current);
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        setInteracting(false);
        const r = live.current;
        if (r.x !== win.x || r.y !== win.y || r.w !== win.w || r.h !== win.h) move(win.id, { ...r });
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [focus, move, win.id, win.maximized, win.restore, win.x, win.y, win.w, win.h],
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
        h = Math.max(MIN_H, o.h - Math.max(dy, MENU_BAR_H - o.y));
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

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => close(win.id), 170);
  }, [close, win.id]);

  const handleMinimize = useCallback(() => {
    setMinTarget(dockTarget(win.id));
    minimize(win.id);
  }, [minimize, win.id]);

  const ctx = useMemo<WindowCtxValue>(
    () => ({
      id: win.id,
      active,
      maximized: win.maximized,
      resizable,
      mobile: false,
      close: handleClose,
      minimize: handleMinimize,
      zoom: () => resizable && toggleMaximize(win.id),
      onDragStart,
    }),
    [win.id, active, win.maximized, resizable, handleClose, handleMinimize, toggleMaximize, onDragStart],
  );

  const Content = app.component;

  // 打开动画从 Dock 图标放大；最小化动画缩向 Dock 图标
  const style: CSSProperties & Record<string, string | number> = {
    left: win.x,
    top: win.y,
    width: win.w,
    height: win.h,
    zIndex: win.z,
  };
  if (win.origin) {
    style["--origin-x"] = `${win.origin.x - win.x}px`;
    style["--origin-y"] = `${win.origin.y - win.y}px`;
  }
  if (win.minimized) {
    const t = minTarget ?? dockTarget(win.id);
    style["--origin-x"] = "50%";
    style["--origin-y"] = "50%";
    style["--min-x"] = `${t.x - (win.x + win.w / 2)}px`;
    style["--min-y"] = `${t.y - (win.y + win.h / 2)}px`;
  }

  return (
    <WindowCtx.Provider value={ctx}>
      <div
        ref={ref}
        role="dialog"
        aria-label={app.name}
        data-window={win.id}
        onPointerDown={() => focus(win.id)}
        className={[
          "window absolute flex flex-col overflow-hidden",
          active ? "window-active" : "",
          win.maximized ? "is-maximized" : "",
          closing ? "window-closing" : opening ? "window-opening" : "",
          win.minimized ? "window-minimized" : "",
          interacting ? "select-none" : "window-animate",
        ].join(" ")}
        style={style}
      >
        <div className="relative flex min-h-0 flex-1 flex-col">{Content ? <Content params={win.params} /> : null}</div>

        {resizable && !win.maximized && (
          <>
            {(["n", "s", "e", "w", "ne", "nw", "se", "sw"] as Edge[]).map((edge) => (
              <div key={edge} className={`resize resize-${edge}`} onPointerDown={startResize(edge)} />
            ))}
          </>
        )}
      </div>
    </WindowCtx.Provider>
  );
}
