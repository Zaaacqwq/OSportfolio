"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSystem } from "@/context/System";
import { MenuList } from "./MenuList";

export function ContextMenu() {
  const { contextMenu, hideContextMenu } = useSystem();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  // 保证菜单不超出屏幕
  useLayoutEffect(() => {
    if (!contextMenu || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: Math.min(contextMenu.x, window.innerWidth - r.width - 6),
      y: Math.min(contextMenu.y, window.innerHeight - r.height - 6),
    });
  }, [contextMenu]);

  useEffect(() => {
    if (!contextMenu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hideContextMenu();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [contextMenu, hideContextMenu]);

  if (!contextMenu) return null;
  return (
    <div
      className="fixed inset-0 z-[9600]"
      onPointerDown={hideContextMenu}
      onContextMenu={(e) => {
        e.preventDefault();
        hideContextMenu();
      }}
    >
      <div
        ref={ref}
        className="absolute"
        style={{ left: pos?.x ?? contextMenu.x, top: pos?.y ?? contextMenu.y, visibility: pos ? "visible" : "hidden" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <MenuList items={contextMenu.items} onDone={hideContextMenu} minWidth={200} />
      </div>
    </div>
  );
}
