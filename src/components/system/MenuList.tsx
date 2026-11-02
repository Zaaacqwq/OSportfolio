"use client";

import { useState } from "react";
import { LuCheck, LuChevronRight } from "react-icons/lu";
import type { MenuEntry } from "@/lib/menuTypes";

/** macOS 风格的菜单列表（下拉菜单、右键菜单共用） */
export function MenuList({ items, onDone, minWidth = 220 }: { items: MenuEntry[]; onDone: () => void; minWidth?: number }) {
  const [sub, setSub] = useState<number | null>(null);
  return (
    <div className="menu-panel" style={{ minWidth }} role="menu">
      {items.map((it, i) => {
        if (it === "separator") return <div key={i} className="menu-sep" />;
        return (
          <div key={i} className="relative" onMouseEnter={() => setSub(it.submenu ? i : null)}>
            <button
              role="menuitem"
              className="menu-item"
              disabled={it.disabled}
              data-active={sub === i ? "true" : undefined}
              onClick={() => {
                if (it.submenu) return;
                it.action?.();
                onDone();
              }}
            >
              {it.checked && <LuCheck className="absolute left-[6px] text-[12px]" />}
              <span>{it.label}</span>
              {it.shortcut && <span className="shortcut">{it.shortcut}</span>}
              {it.submenu && <LuChevronRight className="ml-auto pl-2 text-[14px] opacity-60" />}
            </button>
            {it.submenu && sub === i && (
              <div className="absolute left-full top-[-5px] z-10 pl-1">
                <MenuList items={it.submenu} onDone={onDone} minWidth={180} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
