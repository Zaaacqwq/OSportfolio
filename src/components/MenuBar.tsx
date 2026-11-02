"use client";

import { useEffect, useRef, useState } from "react";
import { LuBatteryFull, LuSearch, LuWifi } from "react-icons/lu";
import { useSystem } from "@/context/System";
import { appMenus, logoMenu } from "@/lib/menus";
import { MenuList } from "./system/MenuList";
import { Notch } from "./system/Notch";
import { ZLogo } from "./icons/ZLogo";

export function useClock(interval = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

/** 控制中心图标（两个开关） */
function ControlCenterGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="1.5" y="2.5" width="13" height="4.5" rx="2.25" />
      <circle cx="11.75" cy="4.75" r="1.2" fill="currentColor" stroke="none" />
      <rect x="1.5" y="9" width="13" height="4.5" rx="2.25" />
      <circle cx="4.25" cy="11.25" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MenuBar({ onRestart }: { onRestart: () => void }) {
  const sys = useSystem();
  const now = useClock();
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const { appName, menus } = appMenus(sys, sys.activeId);

  const all = [{ title: "__logo", items: logoMenu(sys, onRestart) }, ...menus];

  useEffect(() => {
    if (openMenu === null) return;
    const onDown = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const date = now
    ? `${now.toLocaleDateString("en-US", { weekday: "short" })} ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : "";
  const time = now ? now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";

  return (
    <header className="menubar fixed inset-x-0 top-0 z-[9000] flex h-[26px] items-center px-2 text-[13px]" ref={barRef}>
      <nav className="flex min-w-0 items-center" aria-label="Menu bar">
        {all.map((m, i) => (
          <div key={m.title} className="relative">
            <button
              className={`menubar-item ${i === 1 ? "font-bold" : ""} ${i > 1 ? "hidden md:inline-flex" : ""}`}
              data-open={openMenu === i ? "true" : undefined}
              aria-label={i === 0 ? "Main menu" : undefined}
              onClick={() => setOpenMenu(openMenu === i ? null : i)}
              onMouseEnter={() => openMenu !== null && setOpenMenu(i)}
            >
              {i === 0 ? <ZLogo size={15} /> : i === 1 ? appName : m.title}
            </button>
            {openMenu === i && (
              <div className="absolute left-0 top-[24px] text-shadow-none" style={{ textShadow: "none" }}>
                <MenuList items={m.items} onDone={() => setOpenMenu(null)} />
              </div>
            )}
          </div>
        ))}
      </nav>

      <Notch />

      <div className="ml-auto flex shrink-0 items-center">
        <span className="menubar-item hidden lg:inline-flex">
          <LuBatteryFull className="text-[19px]" />
        </span>
        <span className="menubar-item hidden sm:inline-flex">
          <LuWifi className="text-[15px]" />
        </span>
        <button className="menubar-item" aria-label="Spotlight" onClick={() => sys.toggleOverlay("spotlight")}>
          <LuSearch className="text-[14px]" />
        </button>
        <button
          className="menubar-item"
          aria-label="Control Center"
          data-open={sys.overlay === "control" ? "true" : undefined}
          onClick={() => sys.toggleOverlay("control")}
        >
          <ControlCenterGlyph />
        </button>
        <button
          className="menubar-item tabular-nums"
          aria-label="Notification Center"
          data-open={sys.overlay === "notifications" ? "true" : undefined}
          onClick={() => sys.toggleOverlay("notifications")}
        >
          <span className="hidden sm:inline">{date}</span>
          <span className="ml-1.5">{time}</span>
        </button>
      </div>
    </header>
  );
}
