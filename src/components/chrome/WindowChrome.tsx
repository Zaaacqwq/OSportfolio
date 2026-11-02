"use client";

import { createContext, useContext, type PointerEvent, type ReactNode } from "react";
import type { AppId } from "@/lib/apps";

export interface WindowCtxValue {
  id: AppId;
  active: boolean;
  maximized: boolean;
  resizable: boolean;
  mobile: boolean;
  close: () => void;
  minimize: () => void;
  zoom: () => void;
  onDragStart: (e: PointerEvent) => void;
}

export const WindowCtx = createContext<WindowCtxValue | null>(null);
export const useWindow = () => useContext(WindowCtx);

/** 让某个区域可以拖动窗口（双击缩放） */
export function useDragRegion() {
  const w = useWindow();
  return w
    ? {
        onPointerDown: (e: PointerEvent) => {
          const t = e.target as HTMLElement;
          if (t.closest("button, a, input, textarea, select, [data-no-drag]")) return;
          w.onDragStart(e);
        },
        onDoubleClick: (e: React.MouseEvent) => {
          const t = e.target as HTMLElement;
          if (t.closest("button, a, input, textarea, select, [data-no-drag]")) return;
          if (w.resizable) w.zoom();
        },
      }
    : {};
}

export function TrafficLights() {
  const w = useWindow();
  if (!w) return null;
  return (
    <div className="traffic shrink-0" data-no-drag>
      <button aria-label="Close" className="light light-close" onClick={w.close}>
        <svg viewBox="0 0 10 10">
          <path d="M3 3l4 4M7 3l-4 4" />
        </svg>
      </button>
      <button aria-label="Minimize" className="light light-min" onClick={w.minimize} disabled={w.mobile}>
        <svg viewBox="0 0 10 10">
          <path d="M2.5 5h5" />
        </svg>
      </button>
      <button aria-label="Zoom" className="light light-max" onClick={w.zoom} disabled={!w.resizable || w.mobile}>
        <svg viewBox="0 0 10 10">
          <path d="M3 7V3.6L6.4 7zM7 3v3.4L3.6 3z" fill="currentColor" stroke="none" />
        </svg>
      </button>
    </div>
  );
}

/**
 * 一体化工具栏：标题 + 工具按钮。
 * 没有侧边栏的窗口传 lights 显示红黄绿按钮。
 */
export function Toolbar({
  title,
  subtitle,
  lights = false,
  left,
  children,
  className = "",
  center = false,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  lights?: boolean;
  left?: ReactNode;
  children?: ReactNode;
  className?: string;
  center?: boolean;
}) {
  const drag = useDragRegion();
  return (
    <div className={`toolbar ${className}`} {...drag}>
      {lights && <TrafficLights />}
      {left}
      {title !== undefined &&
        (center ? (
          <div className="pointer-events-none absolute inset-x-0 text-center">
            <div className="toolbar-title text-[13px]">{title}</div>
          </div>
        ) : (
          <div className="ml-1 min-w-0 leading-tight">
            <div className="toolbar-title">{title}</div>
            {subtitle && <div className="toolbar-dim truncate text-[11px] text-muted">{subtitle}</div>}
          </div>
        ))}
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  );
}

/** 液态玻璃侧边栏：顶部放红黄绿按钮 */
export function Sidebar({ children, width = 200 }: { children: ReactNode; width?: number }) {
  const drag = useDragRegion();
  const w = useWindow();
  if (w?.mobile) return null;
  return (
    <aside className="sidebar" style={{ width }}>
      <div className="flex h-[45px] shrink-0 items-center px-3" {...drag}>
        <TrafficLights />
      </div>
      <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-2.5 pb-3">{children}</div>
    </aside>
  );
}

export function SidebarSection({ title }: { title: string }) {
  return <div className="sidebar-section">{title}</div>;
}

export function SidebarItem({
  icon,
  label,
  active,
  onClick,
  trailing,
}: {
  icon?: ReactNode;
  label: ReactNode;
  active?: boolean;
  onClick?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <button className="sidebar-item" data-active={active ? "true" : undefined} onClick={onClick}>
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {trailing}
    </button>
  );
}

/** 手机上代替侧边栏的横向标签 */
export function MobileTabs<T extends string>({
  items,
  value,
  onChange,
}: {
  items: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const w = useWindow();
  if (!w?.mobile) return null;
  return (
    <div className="scroll-area flex shrink-0 gap-1.5 overflow-x-auto px-3 pb-2">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => onChange(it.id)}
          className={`shrink-0 rounded-full px-3 py-1 text-[12.5px] font-medium ${value === it.id ? "bg-accent text-white" : "bg-hover text-fg"}`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
