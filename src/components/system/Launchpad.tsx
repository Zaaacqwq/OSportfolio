"use client";

import { useEffect, useMemo, useState } from "react";
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
  icon: React.ReactNode;
  run: () => void;
}

const PER_PAGE = 28;

/** 全屏 Launchpad：第一页是应用，后面是项目 */
export function Launchpad() {
  const sys = useSystem();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const tiles = useMemo<Tile[]>(() => {
    const apps = (Object.keys(APPS) as AppId[])
      .filter((id) => APPS[id].listed)
      .map((id) => ({ key: id, label: APPS[id].name, icon: <SystemIcon name={APPS[id].icon} size={84} />, run: () => sys.open(id) }));
    const projects = PROJECTS.filter((p) => p.category !== "archive" && p.slug !== "vibeisland").map((p) => ({
      key: p.slug,
      label: p.name,
      icon: <ProjectIcon project={p} size={84} />,
      run: () => openProject(sys, p),
    }));
    return [...apps, ...projects];
  }, [sys]);

  const filtered = q ? tiles.filter((t) => t.label.toLowerCase().includes(q.toLowerCase())) : tiles;
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const shown = filtered.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  useEffect(() => setPage(0), [q]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setPage((p) => Math.min(p + 1, pages - 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages]);

  return (
    <div className="fade-in fixed inset-0 z-[8500]" onClick={() => sys.setOverlay(null)}>
      <div className="absolute inset-0 bg-black/25" style={{ backdropFilter: "blur(36px) saturate(150%)", WebkitBackdropFilter: "blur(36px) saturate(150%)" }} />
      <div className="launchpad-in relative flex h-full flex-col items-center px-6 pb-28 pt-12">
        <label className="flex h-[30px] w-[230px] items-center gap-2 rounded-[9px] bg-white/15 px-3 text-[13px] text-white shadow-inner backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
          <LuSearch className="text-white/70" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent outline-none placeholder:text-white/60"
          />
        </label>
        <div className="mt-10 grid w-full max-w-[1100px] flex-1 grid-cols-4 content-start gap-x-4 gap-y-8 sm:grid-cols-5 md:grid-cols-7">
          {shown.map((t) => (
            <button
              key={t.key}
              className="group flex flex-col items-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                sys.setOverlay(null);
                t.run();
              }}
            >
              <span className="transition-transform group-active:scale-90">{t.icon}</span>
              <span className="max-w-[110px] truncate text-[13px] text-white drop-shadow">{t.label}</span>
            </button>
          ))}
        </div>
        {pages > 1 && (
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                aria-label={`Page ${i + 1}`}
                onClick={() => setPage(i)}
                className={`h-[7px] w-[7px] rounded-full ${i === page ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
