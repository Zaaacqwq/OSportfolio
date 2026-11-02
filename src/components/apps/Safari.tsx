"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  LuArrowUpRight,
  LuChevronLeft,
  LuChevronRight,
  LuGithub,
  LuLock,
  LuPlus,
  LuRotateCw,
  LuShare,
  LuX,
  LuShieldCheck,
} from "react-icons/lu";
import { getProject, PROJECTS, type Project } from "@/config/projects";
import { profile } from "@/config/profile";
import type { AppProps } from "@/lib/apps";
import { Toolbar } from "../chrome/WindowChrome";
import { ProjectIcon } from "../icons/ProjectIcon";
import { SOCIAL_META } from "../SocialIcon";
import { ProjectCover, StatusBadge } from "./ProjectDetail";

interface Tab {
  id: number;
  slug: string | null;
}

let tabId = 1;

const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export default function Safari({ params }: AppProps) {
  const [tabs, setTabs] = useState<Tab[]>([{ id: tabId++, slug: null }]);
  const [active, setActive] = useState(tabs[0].id);
  const [reload, setReload] = useState(0);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  const project = tab.slug ? getProject(tab.slug) : undefined;

  const openInTab = (slug: string | null, newTab = false) => {
    if (newTab || (slug && tabs.some((t) => t.slug === slug))) {
      const existing = tabs.find((t) => t.slug === slug && slug);
      if (existing) {
        setActive(existing.id);
        return;
      }
      const t = { id: tabId++, slug };
      setTabs((ts) => [...ts, t]);
      setActive(t.id);
      return;
    }
    setTabs((ts) => ts.map((t) => (t.id === active ? { ...t, slug } : t)));
  };

  // 外部打开某个项目 → 新标签页
  useEffect(() => {
    if (!params || params.slug === undefined) return;
    const slug = (params.slug as string | null) ?? null;
    if (slug === null) openInTab(null, true);
    else openInTab(slug, tab.slug !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.nonce]);

  const closeTab = (id: number) => {
    if (tabs.length === 1) {
      setTabs([{ id: tabId++, slug: null }]);
      return;
    }
    const idx = tabs.findIndex((t) => t.id === id);
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (id === active) setActive(next[Math.max(0, idx - 1)].id);
  };

  const url = project ? (project.live ?? project.repo ?? "") : "";
  const [address, setAddress] = useState("");
  useEffect(() => setAddress(url ? host(url) : ""), [url]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = address.trim();
    if (!v) return;
    const match = PROJECTS.find((p) => p.live && host(p.live).startsWith(v.replace(/^https?:\/\//, "")));
    if (match) openInTab(match.slug);
    else window.open(/^https?:\/\//.test(v) ? v : /\.\w{2,}/.test(v) ? `https://${v}` : `https://www.google.com/search?q=${encodeURIComponent(v)}`, "_blank", "noopener");
  };

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        lights
        left={
          <div className="tb-capsule ml-1">
            <button className="tb-btn" aria-label="Back" disabled={!project} onClick={() => openInTab(null)}>
              <LuChevronLeft />
            </button>
            <button className="tb-btn" aria-label="Forward" disabled>
              <LuChevronRight />
            </button>
          </div>
        }
      >
        <form onSubmit={submit} className="absolute left-1/2 w-[min(46%,520px)] -translate-x-1/2" data-no-drag>
          <label className="search-field w-full justify-center">
            {project?.live ? <LuLock className="shrink-0 text-[11px]" /> : null}
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={(e) => e.target.select()}
              placeholder="Search or enter website name"
              aria-label="Address"
              className="text-center focus:text-left"
            />
            {project && (
              <button type="button" aria-label="Reload" onClick={() => setReload((r) => r + 1)} className="shrink-0 text-muted hover:text-fg">
                <LuRotateCw className="text-[12px]" />
              </button>
            )}
          </label>
        </form>
        <div className="tb-capsule">
          {url && (
            <a className="tb-btn" aria-label="Open in new tab" href={url} target="_blank" rel="noreferrer">
              <LuShare />
            </a>
          )}
          <button className="tb-btn" aria-label="New tab" onClick={() => openInTab(null, true)}>
            <LuPlus />
          </button>
        </div>
      </Toolbar>

      {/* 标签栏 */}
      {tabs.length > 1 && (
        <div className="flex h-[30px] shrink-0 gap-1 px-2 pb-1">
          {tabs.map((t) => {
            const p = t.slug ? getProject(t.slug) : undefined;
            return (
              <div
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`group flex min-w-0 flex-1 items-center gap-1.5 rounded-[8px] px-2 text-[12px] ${t.id === active ? "bg-sel" : "hover:bg-hover"}`}
              >
                <button
                  aria-label="Close tab"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(t.id);
                  }}
                  className="grid h-4 w-4 shrink-0 place-items-center rounded opacity-0 hover:bg-hover group-hover:opacity-100"
                >
                  <LuX className="text-[10px]" />
                </button>
                {p && <ProjectIcon project={p} size={14} />}
                <span className="truncate">{p ? p.name : "Start Page"}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden border-t border-sep bg-win">
        {project ? <ProjectPage key={`${project.slug}-${reload}`} project={project} /> : <StartPage onOpen={(s) => openInTab(s)} />}
      </div>
    </div>
  );
}

function StartPage({ onOpen }: { onOpen: (slug: string) => void }) {
  const sites = PROJECTS.filter((p) => p.live || p.showcase === "safari");
  return (
    <div className="scroll-area h-full overflow-y-auto bg-gradient-to-b from-win-alt to-win px-8 py-10">
      <div className="mx-auto max-w-[760px]">
        <h2 className="font-display text-[22px] font-bold">Favorites</h2>
        <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-y-5">
          {sites.map((p) => (
            <button key={p.slug} onClick={() => onOpen(p.slug)} className="group flex flex-col items-center gap-1.5">
              <span className="transition-transform group-hover:scale-105">
                <ProjectIcon project={p} size={60} />
              </span>
              <span className="max-w-[84px] truncate text-[12px] text-fg-2">{p.name}</span>
            </button>
          ))}
          {profile.socials
            .filter((s) => s.key !== "email")
            .map((s) => {
              const M = SOCIAL_META[s.key];
              return (
                <a key={s.key} href={s.url} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-1.5">
                  <span
                    className="app-icon squircle grid h-[60px] w-[60px] place-items-center text-[26px] text-white transition-transform group-hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${M.from}, ${M.to})` }}
                  >
                    <M.icon />
                  </span>
                  <span className="text-[12px] text-fg-2">{s.label}</span>
                </a>
              );
            })}
        </div>

        <h2 className="mt-10 font-display text-[22px] font-bold">Privacy Report</h2>
        <div className="card mt-3 flex items-center gap-3 p-4 text-[13px] text-fg-2">
          <LuShieldCheck className="text-[28px] text-accent" />
          This portfolio uses no trackers, no cookies and no analytics. It&apos;s just a website pretending to be a Mac.
        </div>
      </div>
    </div>
  );
}

/** 有线上地址且允许嵌入 → iframe；否则显示一个“项目网页” */
function ProjectPage({ project }: { project: Project }) {
  const [showFrame, setShowFrame] = useState(!!(project.live && project.iframe));
  if (showFrame && project.live) {
    return (
      <div className="flex h-full flex-col">
        <iframe src={project.live} title={project.name} className="min-h-0 w-full flex-1 bg-white" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
        <div className="flex shrink-0 items-center gap-2 border-t border-sep bg-win-alt px-3 py-1.5 text-[11.5px] text-muted">
          Live site embedded. Blank page? The site may block embedding —
          <a className="text-accent" href={project.live} target="_blank" rel="noreferrer">
            open it in a new tab
          </a>
          or
          <button className="text-accent" onClick={() => setShowFrame(false)}>
            view the project page
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="scroll-area h-full overflow-y-auto">
      <div className="relative">
        <ProjectCover project={project} className="h-[260px] w-full" fit={project.slug === "particleportfolio" ? "cover" : "contain"} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-5 left-8 flex items-end gap-4 text-white">
          <ProjectIcon project={project} size={72} />
          <div>
            <h1 className="font-display text-[34px] font-bold leading-none tracking-tight drop-shadow">{project.name}</h1>
            <p className="mt-1 text-[15px] opacity-90">{project.tagline}</p>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[720px] px-8 py-8">
        <div className="flex flex-wrap gap-2">
          {project.live && (
            <a className="btn btn-primary" href={project.live} target="_blank" rel="noreferrer">
              Visit {host(project.live).split("/")[0]} <LuArrowUpRight />
            </a>
          )}
          {project.live && project.iframe && (
            <button className="btn" onClick={() => setShowFrame(true)}>
              Load live site here
            </button>
          )}
          {project.repo && (
            <a className="btn" href={project.repo} target="_blank" rel="noreferrer">
              <LuGithub /> Source
            </a>
          )}
          <StatusBadge project={project} />
        </div>
        <div className="mt-6 space-y-3 text-[15px] leading-relaxed text-fg-2">
          {project.description.map((d, i) => (
            <p key={i}>{d}</p>
          ))}
        </div>
        {project.highlights && (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {project.highlights.map((h) => (
              <li key={h} className="card p-3 text-[13px]">
                {h}
              </li>
            ))}
          </ul>
        )}
        {project.slug === "betteruwworks" && <BetterUWWorksDiagram />}
        <div className="mt-6 flex flex-wrap gap-1.5">
          {project.tech.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** betterUWWorks 的架构简图 */
function BetterUWWorksDiagram() {
  const steps = [
    ["Chrome extension", "captures WaterlooWorks postings"],
    ["Postgres + Drizzle", "stores & indexes postings"],
    ["Ollama embeddings", "semantic search, self‑hosted"],
    ["Resume scoring", "line‑by‑line evidence"],
  ];
  return (
    <div className="mt-8">
      <h3 className="mb-3 text-[13px] font-semibold text-muted">How it works</h3>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        {steps.map(([t, d], i) => (
          <div key={t} className="flex flex-1 items-center gap-2">
            <div className="card flex-1 p-3">
              <div className="text-[13px] font-semibold">{t}</div>
              <div className="text-[11.5px] text-muted">{d}</div>
            </div>
            {i < steps.length - 1 && <LuChevronRight className="hidden shrink-0 text-muted sm:block" />}
          </div>
        ))}
      </div>
    </div>
  );
}
