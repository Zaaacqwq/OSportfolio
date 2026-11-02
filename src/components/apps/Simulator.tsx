"use client";

import { useEffect, useState } from "react";
import { LuBatteryFull, LuChevronLeft, LuChevronRight, LuLock, LuSignal, LuWifi } from "react-icons/lu";
import { PROJECTS, type Project } from "@/config/projects";
import { useProjectImages } from "@/context/Data";
import type { AppProps } from "@/lib/apps";
import { MobileTabs, Sidebar, SidebarItem, SidebarSection, Toolbar } from "../chrome/WindowChrome";
import { ProjectIcon } from "../icons/ProjectIcon";
import { StatusBadge } from "./ProjectDetail";

const IOS_APPS = PROJECTS.filter((p) => p.showcase === "simulator");

/** 没有真实截图时，生成的示意界面里显示的条目（标注为 mock‑up） */
const MOCK_ROWS: Record<string, string[]> = {
  dofocus: ["Plan my day from voice", "Deep work · 50 min", "Habits & goals", "Pomodoro 25 / 5"],
  swipeclean: ["Swipe to review", "Similar photos", "Travel recap", "Empty albums"],
  fridgy: ["Fridge", "Freezer", "Pantry", "Scan a receipt"],
  cents: ["This month", "By category", "By card", "Budgets"],
  warehousecare: ["Overview", "Items", "Activity", "Settings"],
};

function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div className={`flex h-[44px] items-center justify-between px-7 pt-1 text-[13px] font-semibold ${dark ? "text-white" : "text-black"}`}>
      <span>9:41</span>
      <span className="flex items-center gap-1 text-[13px]">
        <LuSignal />
        <LuWifi />
        <LuBatteryFull className="text-[17px]" />
      </span>
    </div>
  );
}

function MockScreen({ project, page }: { project: Project; page: number }) {
  const rows = MOCK_ROWS[project.slug] ?? ["Home", "Browse", "Settings"];
  if (page === 0) {
    return (
      <div className="flex h-full flex-col bg-[#f2f2f7] text-black">
        <StatusBar />
        <div className="px-5 pt-2">
          <div className="text-[30px] font-bold tracking-tight">{project.name}</div>
        </div>
        <div
          className="mx-4 mt-3 rounded-[22px] p-4 text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${project.accent[0]}, ${project.accent[1]})` }}
        >
          <ProjectIcon project={project} size={44} />
          <div className="mt-3 text-[17px] font-semibold leading-tight">{project.tagline}</div>
        </div>
        <div className="mx-4 mt-4 divide-y divide-black/5 overflow-hidden rounded-[14px] bg-white">
          {rows.map((r, i) => (
            <div key={r} className="flex items-center gap-3 px-4 py-3 text-[15px]">
              <span className="h-7 w-7 rounded-[8px]" style={{ background: project.accent[i % 2], opacity: 0.85 - i * 0.12 }} />
              {r}
              <LuChevronRight className="ml-auto text-black/25" />
            </div>
          ))}
        </div>
        <div className="mt-auto mb-3 text-center text-[10px] text-black/35">Illustrative mock‑up · screenshots coming soon</div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col bg-white text-black">
      <StatusBar />
      <div className="px-5 pt-2 text-[30px] font-bold tracking-tight">About</div>
      <div className="mx-4 mt-3 space-y-3 overflow-hidden text-[14px] leading-snug text-black/70">
        {project.description.map((d, i) => (
          <p key={i}>{d}</p>
        ))}
      </div>
      <div className="mx-4 mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <span key={t} className="rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-medium">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Simulator({ params }: AppProps) {
  const [slug, setSlug] = useState<string>(IOS_APPS[0].slug);
  const [page, setPage] = useState(0);
  useEffect(() => {
    if (typeof params?.app === "string") {
      setSlug(params.app);
      setPage(0);
    }
  }, [params?.app]);

  const project = IOS_APPS.find((p) => p.slug === slug) ?? IOS_APPS[0];
  const screens = useProjectImages(project.slug).filter((s) => /screen/i.test(s));
  const pages = screens.length || 2;

  useEffect(() => setPage(0), [slug]);

  return (
    <div className="flex h-full">
      <Sidebar width={200}>
        <SidebarSection title="iOS Apps" />
        {IOS_APPS.map((p) => (
          <SidebarItem
            key={p.slug}
            icon={<ProjectIcon project={p} size={20} />}
            label={p.name}
            active={p.slug === slug}
            onClick={() => setSlug(p.slug)}
            trailing={p.private ? <LuLock className="!text-[10px] !text-muted" /> : null}
          />
        ))}
      </Sidebar>
      <div className="flex min-w-0 flex-1 flex-col">
        <Toolbar title="iPhone 17 Pro" subtitle="iOS 26.1">
          <div className="tb-capsule">
            <button className="tb-btn" aria-label="Previous screen" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <LuChevronLeft />
            </button>
            <button className="tb-btn" aria-label="Next screen" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>
              <LuChevronRight />
            </button>
          </div>
        </Toolbar>
        <MobileTabs value={slug} onChange={setSlug} items={IOS_APPS.map((p) => ({ id: p.slug, label: p.name }))} />
        <div className="scroll-area min-h-0 flex-1 overflow-auto bg-win-alt">
          <div className="flex min-h-full flex-wrap items-center justify-center gap-8 p-6">
            <div className="iphone shrink-0" style={{ width: 280 }}>
              <div className="iphone-screen bg-black" style={{ height: 560 }}>
                {screens.length ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={screens[page]} alt={`${project.name} screenshot ${page + 1}`} className="h-full w-full object-cover" />
                ) : (
                  <MockScreen project={project} page={page} />
                )}
                <div className="absolute left-1/2 top-[11px] h-[30px] w-[96px] -translate-x-1/2 rounded-full bg-black" />
                <div className="absolute bottom-[8px] left-1/2 h-[5px] w-[120px] -translate-x-1/2 rounded-full bg-black/80" />
              </div>
            </div>
            <div className="w-[240px] text-fg">
              <ProjectIcon project={project} size={64} />
              <h2 className="mt-3 font-display text-[22px] font-bold">{project.name}</h2>
              <p className="text-[13px] text-fg-2">{project.tagline}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <StatusBadge project={project} />
                <span className="chip">{project.kind}</span>
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-fg-2">{project.description[0]}</p>
              <div className="mt-3 flex gap-1.5">
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    key={i}
                    aria-label={`Screen ${i + 1}`}
                    onClick={() => setPage(i)}
                    className={`h-[7px] w-[7px] rounded-full ${i === page ? "bg-fg" : "bg-sel"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
