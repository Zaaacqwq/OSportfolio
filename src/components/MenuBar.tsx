"use client";

import { useEffect, useRef, useState } from "react";
import { LuBatteryFull, LuMail, LuSearch, LuWifi } from "react-icons/lu";
import { profile } from "@/config/profile";
import { APPS } from "@/lib/apps";
import { useWindowManager } from "@/context/WindowManager";
import { Avatar } from "./Avatar";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function MenuBar({ onRestart }: { onRestart: () => void }) {
  const now = useClock();
  const { activeId, open, close } = useWindowManager();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [menuOpen]);

  const date = now?.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const time = now?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  const items: { label: string; action?: () => void; divider?: boolean }[] = [
    { label: "About Me", action: () => open("about") },
    { label: "System Settings…", action: () => open("settings") },
    { label: "", divider: true },
    { label: "Open Terminal", action: () => open("terminal") },
    { label: "Close Window", action: () => activeId && close(activeId) },
    { label: "", divider: true },
    { label: "Restart…", action: onRestart },
  ];

  return (
    <header className="menubar fixed inset-x-0 top-0 z-[9000] flex h-7 items-center justify-between px-3 text-[13px] text-white sm:px-4">
      <div className="flex min-w-0 items-center gap-1" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={`flex items-center gap-2 rounded px-1.5 py-0.5 ${menuOpen ? "bg-white/20" : "hover:bg-white/10"}`}
        >
          <Avatar size={18} />
          <span className="truncate font-semibold">{profile.name}</span>
        </button>
        {activeId && (
          <span className="hidden px-2 font-medium opacity-90 sm:inline">{APPS[activeId].title}</span>
        )}
        {menuOpen && (
          <div className="glass-menu absolute left-2 top-7 w-56 rounded-lg p-1 text-[13px]">
            {items.map((it, i) =>
              it.divider ? (
                <div key={i} className="mx-2 my-1 h-px bg-white/15" />
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    it.action?.();
                    setMenuOpen(false);
                  }}
                  className="block w-full rounded-md px-3 py-1 text-left hover:bg-[#2f6fed]"
                >
                  {it.label}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <a
          href={`mailto:${profile.email}`}
          className="hidden items-center gap-1.5 opacity-95 hover:opacity-100 md:flex"
        >
          <LuMail className="text-[14px]" />
          {profile.email}
        </a>
        <LuWifi className="hidden text-[15px] sm:block" />
        <LuBatteryFull className="hidden text-[18px] sm:block" />
        <button aria-label="Search" onClick={() => open("terminal")} className="hidden sm:block">
          <LuSearch className="text-[14px]" />
        </button>
        <span className="hidden sm:inline">{date}</span>
        <span className="tabular-nums">{time}</span>
      </div>
    </header>
  );
}
