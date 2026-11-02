"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  LuAppWindow,
  LuChevronLeft,
  LuChevronRight,
  LuClock,
  LuColumns3,
  LuDownload,
  LuEye,
  LuFileText,
  LuFolder,
  LuGalleryVertical,
  LuHardDrive,
  LuLayoutGrid,
  LuList,
  LuLock,
  LuSearch,
  LuStar,
  LuX,
} from "react-icons/lu";
import { CATEGORIES, PROJECTS, type Category, type Project } from "@/config/projects";
import { useSystem } from "@/context/System";
import { APPS, type AppId, type AppProps } from "@/lib/apps";
import { openProject } from "@/lib/openProject";
import { MobileTabs, Sidebar, SidebarItem, SidebarSection, Toolbar } from "../chrome/WindowChrome";
import { SystemIcon } from "../icons/AppIcons";
import { ProjectIcon } from "../icons/ProjectIcon";
import { ProjectCover, ProjectDetail, StatusBadge } from "./ProjectDetail";

type Section = "recents" | "all" | "featured" | "applications" | Category;
type View = "icons" | "list" | "gallery" | "columns";

const SECTION_TITLE: Record<string, string> = {
  recents: "Recents",
  all: "Projects",
  featured: "Featured",
  applications: "Applications",
};

const sectionTitle = (s: Section) => SECTION_TITLE[s] ?? CATEGORIES[s as Category].label;

function itemsFor(section: Section, q: string): Project[] {
  let list: Project[];
  if (section === "all") list = PROJECTS.filter((p) => p.category !== "archive");
  else if (section === "featured") list = PROJECTS.filter((p) => p.featured);
  else if (section === "recents") list = PROJECTS.filter((p) => p.category !== "archive").slice(0, 10);
  else if (section === "applications") list = [];
  else list = PROJECTS.filter((p) => p.category === section);
  if (q) {
    const s = q.toLowerCase();
    list = PROJECTS.filter((p) => `${p.name} ${p.tagline} ${p.tech.join(" ")} ${p.kind}`.toLowerCase().includes(s));
  }
  return list;
}

const APP_LIST: AppId[] = ["about", "safari", "mail", "notes", "terminal", "simulator", "github", "settings", "preview", "vibeisland"];

export default function Finder({ params }: AppProps) {
  const sys = useSystem();
  const [history, setHistory] = useState<Section[]>(["all"]);
  const [hIndex, setHIndex] = useState(0);
  const section = history[hIndex];
  const [view, setView] = useState<View>("icons");
  const [selected, setSelected] = useState<string | null>(null);
  const [quicklook, setQuicklook] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const go = (s: Section) => {
    if (s === section) return;
    const next = [...history.slice(0, hIndex + 1), s];
    setHistory(next);
    setHIndex(next.length - 1);
    setSelected(null);
    setQ("");
  };

  // 外部通过 params 打开某个分区 / 项目
  useEffect(() => {
    if (!params) return;
    if (typeof params.section === "string") go(params.section as Section);
    if (typeof params.select === "string") {
      const p = PROJECTS.find((x) => x.slug === params.select);
      if (p) {
        if (p.category === "archive") go("archive");
        setSelected(p.slug);
      }
    }
    if (typeof params.quicklook === "string") setQuicklook(params.quicklook);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.nonce]);

  const items = useMemo(() => itemsFor(section, q), [section, q]);
  const selectedProject = PROJECTS.find((p) => p.slug === selected) ?? null;
  const qlProject = PROJECTS.find((p) => p.slug === quicklook) ?? null;

  // 空格键 = Quick Look，回车 = 打开，方向键选择
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (quicklook) setQuicklook(null);
        else if (selected) setQuicklook(selected);
      } else if (e.key === "Escape") setQuicklook(null);
      else if (e.key === "Enter" && selectedProject) openProject(sys, selectedProject);
      else if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key) && items.length) {
        e.preventDefault();
        const i = items.findIndex((p) => p.slug === selected);
        const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
        const next = items[Math.max(0, Math.min(items.length - 1, i + d))];
        setSelected(next.slug);
        if (quicklook) setQuicklook(next.slug);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [selected, quicklook, items, selectedProject, sys]);

  const onItemContext = (e: React.MouseEvent, p: Project) => {
    e.preventDefault();
    setSelected(p.slug);
    sys.showContextMenu(e.clientX, e.clientY, [
      { label: "Open", action: () => openProject(sys, p) },
      { label: "Quick Look", shortcut: "Space", action: () => setQuicklook(p.slug) },
      "separator",
      ...(p.repo ? [{ label: "Open on GitHub", action: () => window.open(p.repo, "_blank") }] : []),
      ...(p.live ? [{ label: "Open Live Site", action: () => window.open(p.live, "_blank") }] : []),
      { label: "Copy Name", action: () => navigator.clipboard?.writeText(p.name) },
    ]);
  };

  const sideCat = (Object.keys(CATEGORIES) as Category[]).filter((c) => c !== "archive");

  return (
    <div ref={rootRef} tabIndex={-1} className="flex h-full outline-none">
      <Sidebar width={208}>
        <SidebarSection title="Favorites" />
        <SidebarItem icon={<LuClock />} label="Recents" active={section === "recents"} onClick={() => go("recents")} />
        <SidebarItem icon={<LuFolder />} label="Projects" active={section === "all"} onClick={() => go("all")} />
        <SidebarItem icon={<LuStar />} label="Featured" active={section === "featured"} onClick={() => go("featured")} />
        <SidebarItem icon={<LuAppWindow />} label="Applications" active={section === "applications"} onClick={() => go("applications")} />
        <SidebarItem icon={<LuFileText />} label="Documents" onClick={() => sys.open("preview")} />
        <SidebarItem icon={<LuDownload />} label="Downloads" onClick={() => sys.open("vibeisland")} />
        <SidebarSection title="Locations" />
        <SidebarItem icon={<LuHardDrive />} label="Zac HD" onClick={() => sys.open("aboutmac")} />
        <SidebarItem icon={<LuFolder />} label="Archive" active={section === "archive"} onClick={() => go("archive")} />
        <SidebarSection title="Tags" />
        {sideCat.map((c) => (
          <SidebarItem
            key={c}
            icon={<span className="ml-[3px] mr-[2px] h-[10px] w-[10px] shrink-0 rounded-full" style={{ background: CATEGORIES[c].color }} />}
            label={CATEGORIES[c].label}
            active={section === c}
            onClick={() => go(c)}
          />
        ))}
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <Toolbar
          left={
            <div className="tb-capsule">
              <button className="tb-btn" aria-label="Back" disabled={hIndex === 0} onClick={() => setHIndex(hIndex - 1)}>
                <LuChevronLeft />
              </button>
              <button className="tb-btn" aria-label="Forward" disabled={hIndex >= history.length - 1} onClick={() => setHIndex(hIndex + 1)}>
                <LuChevronRight />
              </button>
            </div>
          }
          title={q ? `Searching “${q}”` : sectionTitle(section)}
        >
          <div className="tb-capsule hidden md:inline-flex">
            {(
              [
                ["icons", LuLayoutGrid],
                ["list", LuList],
                ["columns", LuColumns3],
                ["gallery", LuGalleryVertical],
              ] as const
            ).map(([v, Icon]) => (
              <button key={v} className="tb-btn" aria-label={`${v} view`} data-active={view === v ? "true" : undefined} onClick={() => setView(v)}>
                <Icon />
              </button>
            ))}
          </div>
          <div className="tb-capsule hidden sm:inline-flex">
            <button className="tb-btn" aria-label="Quick Look" disabled={!selected} onClick={() => selected && setQuicklook(selected)}>
              <LuEye />
            </button>
          </div>
          <label className="search-field w-[120px] sm:w-[170px]">
            <LuSearch className="shrink-0" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" aria-label="Search projects" />
          </label>
        </Toolbar>

        <MobileTabs<Section>
          value={section}
          onChange={go}
          items={[
            { id: "all", label: "Projects" },
            { id: "featured", label: "Featured" },
            ...sideCat.map((c) => ({ id: c as Section, label: CATEGORIES[c].label })),
            { id: "archive", label: "Archive" },
          ]}
        />
        <div className="scroll-area relative min-h-0 flex-1 overflow-auto" onClick={() => setSelected(null)}>
          {section === "applications" && !q ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2 p-5">
              {APP_LIST.map((id) => (
                <button key={id} className="flex flex-col items-center gap-1.5 rounded-[10px] p-2 hover:bg-hover" onDoubleClick={() => sys.open(id)} onClick={(e) => e.stopPropagation()}>
                  <SystemIcon name={APPS[id].icon} size={64} />
                  <span className="text-[12px]">{APPS[id].name}</span>
                </button>
              ))}
            </div>
          ) : view === "icons" ? (
            <IconsView items={items} selected={selected} setSelected={setSelected} onContext={onItemContext} />
          ) : view === "list" ? (
            <ListView items={items} selected={selected} setSelected={setSelected} onContext={onItemContext} />
          ) : view === "columns" ? (
            <ColumnsView items={items} selected={selectedProject} setSelected={setSelected} />
          ) : (
            <GalleryView items={items} selected={selectedProject ?? items[0] ?? null} setSelected={setSelected} />
          )}
          {!items.length && section !== "applications" && <div className="p-10 text-center text-[13px] text-muted">No items</div>}
        </div>

        {/* 路径栏 / 状态栏 */}
        <div className="flex h-[26px] shrink-0 items-center gap-1.5 border-t border-sep px-3 text-[11.5px] text-muted">
          <LuHardDrive /> Zac HD <LuChevronRight className="opacity-50" /> <LuFolder className="text-accent" /> {sectionTitle(section)}
          {selectedProject && (
            <>
              <LuChevronRight className="opacity-50" /> <span className="text-fg">{selectedProject.name}</span>
            </>
          )}
          <span className="ml-auto">
            {section === "applications" ? APP_LIST.length : items.length} items<span className="hidden sm:inline"> · Press Space for Quick Look</span>
          </span>
        </div>
      </div>

      {qlProject && <QuickLook project={qlProject} onClose={() => setQuicklook(null)} />}
    </div>
  );
}

interface ViewProps {
  items: Project[];
  selected: string | null;
  setSelected: (s: string) => void;
  onContext: (e: React.MouseEvent, p: Project) => void;
}

function IconsView({ items, selected, setSelected, onContext }: ViewProps) {
  const sys = useSystem();
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(118px,1fr))] gap-1 p-4">
      {items.map((p) => {
        const sel = selected === p.slug;
        return (
          <button
            key={p.slug}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(p.slug);
            }}
            onDoubleClick={() => openProject(sys, p)}
            onContextMenu={(e) => onContext(e, p)}
            className="flex flex-col items-center gap-1.5 p-2 outline-none"
          >
            <span className={`relative rounded-[12px] p-1.5 ${sel ? "bg-sel" : ""}`}>
              <ProjectIcon project={p} size={64} />
              {p.private && (
                <span className="absolute bottom-0.5 right-0.5 grid h-[18px] w-[18px] place-items-center rounded-full bg-white text-[10px] text-black shadow">
                  <LuLock />
                </span>
              )}
            </span>
            <span className={`max-w-full truncate rounded-[5px] px-1.5 text-[12px] leading-[17px] ${sel ? "bg-accent text-white" : ""}`}>{p.name}</span>
            <span className="line-clamp-2 text-center text-[11px] leading-tight text-muted">{p.tagline}</span>
          </button>
        );
      })}
    </div>
  );
}

function ListView({ items, selected, setSelected, onContext }: ViewProps) {
  const sys = useSystem();
  return (
    <table className="w-full border-collapse text-[12.5px]">
      <thead className="sticky top-0 z-[1] bg-win text-left text-[11.5px] text-muted">
        <tr className="border-b border-sep">
          <th className="py-1.5 pl-5 font-medium">Name</th>
          <th className="font-medium">Kind</th>
          <th className="hidden font-medium lg:table-cell">Stack</th>
          <th className="font-medium">Year</th>
          <th className="pr-4 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p, i) => {
          const sel = selected === p.slug;
          return (
            <tr
              key={p.slug}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(p.slug);
              }}
              onDoubleClick={() => openProject(sys, p)}
              onContextMenu={(e) => onContext(e, p)}
              className={sel ? "bg-accent text-white" : i % 2 ? "bg-hover" : ""}
            >
              <td className="py-[5px] pl-5">
                <span className="flex items-center gap-2">
                  <ProjectIcon project={p} size={20} /> {p.name}
                </span>
              </td>
              <td className={sel ? "" : "text-fg-2"}>{p.kind}</td>
              <td className={`hidden truncate lg:table-cell ${sel ? "" : "text-fg-2"}`}>{p.tech.slice(0, 3).join(", ")}</td>
              <td className={sel ? "" : "text-fg-2"}>{p.year}</td>
              <td className="pr-4">{p.private ? "🔒 Private" : p.live ? "● Live" : "Public"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ColumnsView({ items, selected, setSelected }: { items: Project[]; selected: Project | null; setSelected: (s: string) => void }) {
  const sys = useSystem();
  return (
    <div className="flex h-full min-h-[300px]">
      <div className="scroll-area w-[240px] shrink-0 overflow-y-auto border-r border-sep p-1.5">
        {items.map((p) => (
          <button
            key={p.slug}
            onClick={(e) => {
              e.stopPropagation();
              setSelected(p.slug);
            }}
            onDoubleClick={() => openProject(sys, p)}
            className={`flex w-full items-center gap-2 rounded-[6px] px-2 py-[3px] text-left text-[12.5px] ${selected?.slug === p.slug ? "bg-accent text-white" : "hover:bg-hover"}`}
          >
            <ProjectIcon project={p} size={18} />
            <span className="flex-1 truncate">{p.name}</span>
            <LuChevronRight className="opacity-50" />
          </button>
        ))}
      </div>
      <div className="scroll-area min-w-0 flex-1 overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        {selected ? (
          <div className="mx-auto max-w-[520px]">
            <ProjectDetail project={selected} compact />
          </div>
        ) : (
          <div className="grid h-full place-items-center text-[13px] text-muted">Select a project</div>
        )}
      </div>
    </div>
  );
}

function GalleryView({ items, selected, setSelected }: { items: Project[]; selected: Project | null; setSelected: (s: string) => void }) {
  const sys = useSystem();
  if (!selected) return null;
  return (
    <div className="flex h-full min-h-[360px] flex-col" onClick={(e) => e.stopPropagation()}>
      <div className="flex min-h-0 flex-1 gap-4 p-4">
        <div className="grid min-w-0 flex-1 place-items-center rounded-[12px] bg-win-alt p-4">
          <ProjectCover
            project={selected}
            className="aspect-[16/9] max-h-full w-full max-w-[720px] rounded-[10px] shadow-lg"
            fit={selected.slug === "slaythespire" || selected.slug === "vibeisland" ? "contain" : "cover"}
          />
        </div>
        <div className="scroll-area hidden w-[230px] shrink-0 overflow-y-auto text-[12.5px] xl:block">
          <div className="flex items-center gap-2">
            <ProjectIcon project={selected} size={36} />
            <div>
              <div className="font-semibold">{selected.name}</div>
              <div className="text-muted">{selected.kind}</div>
            </div>
          </div>
          <p className="mt-3 text-fg-2">{selected.tagline}</p>
          <div className="mt-3 border-t border-sep pt-3 font-semibold">Information</div>
          {[
            ["Category", CATEGORIES[selected.category].label],
            ["Year", selected.year],
            ["Stack", selected.tech.join(", ")],
          ].map(([k, v]) => (
            <div key={k} className="mt-1.5 flex justify-between gap-3">
              <span className="text-muted">{k}</span>
              <span className="text-right">{v}</span>
            </div>
          ))}
          <div className="mt-3">
            <StatusBadge project={selected} />
          </div>
          <button className="btn btn-primary mt-4" onClick={() => openProject(sys, selected)}>
            Open
          </button>
        </div>
      </div>
      <div className="scroll-area flex shrink-0 gap-2 overflow-x-auto border-t border-sep px-4 py-3">
        {items.map((p) => (
          <button
            key={p.slug}
            onClick={() => setSelected(p.slug)}
            onDoubleClick={() => openProject(sys, p)}
            className={`shrink-0 rounded-[10px] p-1 ${selected.slug === p.slug ? "bg-accent/20 ring-2 ring-accent" : ""}`}
          >
            <ProjectIcon project={p} size={44} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Quick Look 预览面板 */
function QuickLook({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <div className="fade-in absolute inset-0 z-20 grid place-items-center bg-black/25 p-6" onClick={onClose}>
      <div
        className="panel spotlight-in flex max-h-full w-full max-w-[640px] flex-col overflow-hidden rounded-[22px]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Quick Look: ${project.name}`}
      >
        <div className="flex h-[40px] shrink-0 items-center gap-2 px-3">
          <button aria-label="Close Quick Look" className="tb-btn !h-7 !min-w-7" onClick={onClose}>
            <LuX />
          </button>
          <span className="flex-1 truncate text-center text-[13px] font-semibold">{project.name}</span>
          <span className="w-7" />
        </div>
        <div className="scroll-area min-h-0 overflow-y-auto px-5 pb-5">
          <ProjectDetail project={project} />
        </div>
      </div>
    </div>
  );
}
