"use client";

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LuSearch } from "react-icons/lu";
import { useSystem } from "@/context/System";
import { APPS, type AppId } from "@/lib/apps";
import { PROJECTS } from "@/config/projects";
import { openProject } from "@/lib/openProject";
import { SystemIcon } from "../icons/AppIcons";
import { ProjectIcon } from "../icons/ProjectIcon";

interface Tile {
  key: string;
  label: string;
  icon: ReactNode;
  run: (origin?: { x: number; y: number }) => void;
}

type Phase = "closed" | "opening" | "open" | "closing";

const PER_PAGE = 28;
const CLOSE_MS = 240;
const DRAG_START = 6;
const EDGE_RESISTANCE = 0.35;

/**
 * 全屏 Launchpad。
 * - 常驻挂载（由 Desktop 在空闲时预挂载），打开时没有挂载/栅格化开销
 * - 背景层只改自身 opacity，内容层只改 transform/opacity，全部用可中途反向的 transition
 * - 分页是一条横向轨道：拖拽跟手（边缘橡皮筋）、松手按位移/速度吸附、触控板横向滑动翻页
 */
export function Launchpad({ open }: { open: boolean }) {
  const { open: openApp, setOverlay } = useSystem();
  const [phase, setPhase] = useState<Phase>("closed");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const wheel = useRef({ acc: 0, lockUntil: 0 });

  // ── 打开 / 关闭状态机 ────────────────────────────────────────────
  useEffect(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (open) {
      setPhase((p) => (p === "closed" ? "opening" : "open"));
      // 先让元素可见（opening = 初始状态），下一帧再切到 open，过渡才会触发
      let r2 = 0;
      const r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => setPhase("open"));
      });
      return () => {
        cancelAnimationFrame(r1);
        cancelAnimationFrame(r2);
      };
    }
    setPhase((p) => (p === "closed" ? p : "closing"));
    closeTimer.current = window.setTimeout(() => {
      setPhase("closed");
      setQ("");
      setPage(0);
    }, CLOSE_MS);
  }, [open]);

  useEffect(() => {
    if (phase === "open") inputRef.current?.focus({ preventScroll: true });
    if (phase === "closing") inputRef.current?.blur();
  }, [phase]);

  const close = useCallback(() => setOverlay(null), [setOverlay]);

  // ── 内容（用稳定的回调生成，避免每次系统状态变化都重渲染 33 个图标） ──
  const tiles = useMemo<Tile[]>(() => {
    const apps: Tile[] = (Object.keys(APPS) as AppId[])
      .filter((id) => APPS[id].listed)
      .map((id) => ({
        key: id,
        label: APPS[id].name,
        icon: <SystemIcon name={APPS[id].icon} size={84} />,
        run: (origin) => openApp(id, undefined, origin),
      }));
    const projects: Tile[] = PROJECTS.filter((p) => p.category !== "archive" && p.slug !== "vibeisland").map((p) => ({
      key: p.slug,
      label: p.name,
      icon: <ProjectIcon project={p} size={84} />,
      run: (origin) => openProject({ open: openApp }, p, origin),
    }));
    return [...apps, ...projects];
  }, [openApp]);

  const filtered = useMemo(
    () => (q ? tiles.filter((t) => t.label.toLowerCase().includes(q.toLowerCase())) : tiles),
    [q, tiles],
  );
  const pageList = useMemo(() => {
    const out: Tile[][] = [];
    for (let i = 0; i < filtered.length; i += PER_PAGE) out.push(filtered.slice(i, i + PER_PAGE));
    return out.length ? out : [[]];
  }, [filtered]);
  const pages = pageList.length;

  useEffect(() => setPage(0), [q]);

  // ── 轨道位置：直接写 transform（拖拽时不触发 React 渲染） ───────────
  const applyTrack = useCallback((p: number, offset = 0, animate = true) => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = animate ? "transform 420ms cubic-bezier(0.25, 1, 0.3, 1)" : "none";
    el.style.transform = `translate3d(calc(${-p * 100}% + ${offset}px), 0, 0)`;
  }, []);

  useLayoutEffect(() => {
    applyTrack(page, 0, phase === "open");
  }, [page, phase, applyTrack]);

  const goTo = useCallback((p: number) => setPage(Math.max(0, Math.min(pages - 1, p))), [pages]);

  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(page + 1);
      if (e.key === "ArrowLeft") goTo(page - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, page, goTo]);

  // 拖拽翻页
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("input, [data-no-swipe]")) return;
    const width = trackRef.current?.parentElement?.clientWidth ?? window.innerWidth;
    const startX = e.clientX;
    const startT = performance.now();
    let dragging = false;
    let lastX = startX;
    let lastT = startT;
    let velocity = 0;

    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (!dragging && Math.abs(dx) > DRAG_START) dragging = true;
      if (!dragging) return;
      const now = performance.now();
      velocity = (ev.clientX - lastX) / Math.max(1, now - lastT);
      lastX = ev.clientX;
      lastT = now;
      const atEdge = (page === 0 && dx > 0) || (page === pages - 1 && dx < 0);
      applyTrack(page, atEdge ? dx * EDGE_RESISTANCE : dx, false);
    };
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      if (!dragging) return;
      suppressClick.current = true;
      const dx = ev.clientX - startX;
      let next = page;
      if (dx < -width * 0.2 || velocity < -0.4) next = page + 1;
      else if (dx > width * 0.2 || velocity > 0.4) next = page - 1;
      next = Math.max(0, Math.min(pages - 1, next));
      if (next === page) applyTrack(page, 0, true);
      else setPage(next);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  // 触控板横向滑动 / 滚轮翻页（一次手势只翻一页）
  const onWheel = (e: React.WheelEvent) => {
    const w = wheel.current;
    const now = performance.now();
    if (now < w.lockUntil) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    w.acc += d;
    if (Math.abs(w.acc) > 60) {
      goTo(page + (w.acc > 0 ? 1 : -1));
      w.acc = 0;
      w.lockUntil = now + 450;
    }
  };

  const launch = useCallback(
    (t: Tile, el: HTMLElement) => {
      const icon = el.querySelector(".lp-icon")?.getBoundingClientRect();
      const origin = icon ? { x: icon.left + icon.width / 2, y: icon.top + icon.height / 2 } : undefined;
      close();
      t.run(origin);
    },
    [close],
  );

  return (
    <div
      className="lp-root fixed inset-0 z-[7900]"
      data-state={phase}
      aria-hidden={phase === "closed"}
      inert={phase === "closed" || phase === "closing"}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        close();
      }}
      onPointerDown={onPointerDown}
      onWheel={onWheel}
    >
      <div className="lp-backdrop absolute inset-0" />
      <div className="lp-content relative flex h-full flex-col items-center pb-28 pt-12">
        <label
          data-no-swipe
          className="flex h-[30px] w-[230px] items-center gap-2 rounded-[9px] bg-white/15 px-3 text-[13px] text-white shadow-inner"
          onClick={(e) => e.stopPropagation()}
        >
          <LuSearch className="text-white/70" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            aria-label="Search Launchpad"
            tabIndex={phase === "open" ? 0 : -1}
            className="w-full bg-transparent outline-none placeholder:text-white/60"
          />
        </label>

        <div className="mt-10 w-full flex-1 overflow-hidden">
          <div ref={trackRef} className="lp-track flex h-full">
            {pageList.map((list, i) => (
              <LaunchpadPage key={i} tiles={list} onLaunch={launch} suppress={suppressClick} />
            ))}
          </div>
        </div>

        {pages > 1 && (
          <div className="flex gap-2" data-no-swipe>
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                aria-label={`Page ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(i);
                }}
                className={`h-[7px] w-[7px] rounded-full transition-colors duration-300 ${i === page ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 单页图标网格；memo 后只在内容变化时重渲染 */
const LaunchpadPage = memo(function LaunchpadPage({
  tiles,
  onLaunch,
  suppress,
}: {
  tiles: Tile[];
  onLaunch: (t: Tile, el: HTMLElement) => void;
  suppress: React.MutableRefObject<boolean>;
}) {
  return (
    <div className="w-full shrink-0 px-6">
      <div className="mx-auto grid max-w-[1100px] grid-cols-4 content-start gap-x-4 gap-y-8 sm:grid-cols-5 md:grid-cols-7">
        {tiles.map((t) => (
          <button
            key={t.key}
            className="lp-tile group flex flex-col items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              if (suppress.current) {
                suppress.current = false;
                return;
              }
              onLaunch(t, e.currentTarget);
            }}
          >
            <span className="lp-icon">{t.icon}</span>
            <span className="max-w-[110px] truncate text-[13px] text-white drop-shadow">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
