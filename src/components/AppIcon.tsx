import type { ReactNode } from "react";

export interface IconSpec {
  /** CSS background，例如渐变 */
  bg: string;
  glyph: ReactNode;
  /** 图标前景色 */
  color?: string;
}

/** macOS 风格的圆角方形应用图标 */
export function AppIcon({ icon, size = 56, className = "" }: { icon: IconSpec; size?: number; className?: string }) {
  return (
    <div
      className={`app-icon relative grid place-items-center select-none ${className}`}
      style={{
        width: size,
        height: size,
        background: icon.bg,
        color: icon.color ?? "#fff",
        borderRadius: size * 0.225,
        fontSize: size * 0.52,
      }}
    >
      {/* 顶部高光 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: "inherit",
          background: "linear-gradient(180deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 45%)",
        }}
      />
      <span className="relative flex drop-shadow-[0_1px_1px_rgba(0,0,0,.25)]">{icon.glyph}</span>
    </div>
  );
}
