"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LuArrowUpRight, LuMoon, LuSearch, LuSun, LuImage } from "react-icons/lu";
import { useSystem } from "@/context/System";
import { APPS, type AppId } from "@/lib/apps";
import { PROJECTS, CATEGORIES } from "@/config/projects";
import { profile } from "@/config/profile";
import { WALLPAPERS } from "@/lib/wallpapers";
import { openProject } from "@/lib/openProject";
import { SystemIcon } from "../icons/AppIcons";
import { ProjectIcon } from "../icons/ProjectIcon";
import { SOCIAL_META } from "../SocialIcon";

interface Result {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  haystack: string;
  run: () => void;
}

function score(q: string, r: Result) {
  const t = r.title.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.split(/[\s\-_]/).some((w) => w.startsWith(q))) return 60;
  if (t.includes(q)) return 50;
  if (r.haystack.includes(q)) return 20;
  // 子序列匹配
  let i = 0;
  for (const c of t) if (c === q[i]) i++;
  return i === q.length ? 10 : 0;
}

export function Spotlight() {
  const sys = useSystem();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const all = useMemo<Result[]>(() => {
    const apps: Result[] = (Object.keys(APPS) as AppId[])
      .filter((id) => APPS[id].listed)
      .map((id) => ({
        id: `app-${id}`,
        group: "Applications",
        title: APPS[id].name,
        icon: <SystemIcon name={APPS[id].icon} size={26} />,
        haystack: `${APPS[id].name} ${APPS[id].keywords ?? ""}`.toLowerCase(),
        run: () => sys.open(id),
      }));
    const launchpad: Result = {
      id: "app-launchpad",
      group: "Applications",
      title: "Launchpad",
      icon: <SystemIcon name="launchpad" size={26} />,
      haystack: "launchpad apps",
      run: () => sys.setOverlay("launchpad"),
    };
    const projects: Result[] = PROJECTS.map((p) => ({
      id: `p-${p.slug}`,
      group: "Projects",
      title: p.name,
      subtitle: `${p.kind} — ${p.tagline}`,
      icon: <ProjectIcon project={p} size={26} />,
      haystack: `${p.name} ${p.tagline} ${p.tech.join(" ")} ${p.kind} ${CATEGORIES[p.category].label}`.toLowerCase(),
      run: () => openProject(sys, p),
    }));
    const actions: Result[] = [
      {
        id: "a-dark",
        group: "Actions",
        title: sys.appearance === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
        icon: (
          <span className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-[#1c1c1e] text-[14px] text-white">
            {sys.appearance === "dark" ? <LuSun /> : <LuMoon />}
          </span>
        ),
        haystack: "dark mode light mode appearance theme",
        run: () => sys.setAppearance(sys.appearance === "dark" ? "light" : "dark"),
      },
      ...WALLPAPERS.map((w) => ({
        id: `w-${w.id}`,
        group: "Actions",
        title: `Wallpaper: ${w.name}`,
        icon: (
          <span className="grid h-[26px] w-[26px] place-items-center rounded-[7px] text-[14px] text-white" style={{ background: w.light }}>
            <LuImage />
          </span>
        ),
        haystack: `wallpaper background ${w.name}`.toLowerCase(),
        run: () => sys.setWallpaper(w.id),
      })),
    ];
    const links: Result[] = profile.socials.map((s) => {
      const M = SOCIAL_META[s.key];
      return {
        id: `l-${s.key}`,
        group: "Links",
        title: s.label,
        subtitle: s.handle,
        icon: (
          <span
            className="grid h-[26px] w-[26px] place-items-center rounded-[7px] text-[13px] text-white"
            style={{ background: `linear-gradient(135deg, ${M.from}, ${M.to})` }}
          >
            <M.icon />
          </span>
        ),
        haystack: `${s.label} ${s.handle} contact`.toLowerCase(),
        run: () => window.open(s.url, "_blank", "noopener"),
      };
    });
    return [...apps, launchpad, ...projects, ...actions, ...links];
  }, [sys]);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return all
      .map((r) => ({ r, s: score(query, r) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12)
      .map((x) => x.r);
  }, [q, all]);

  // 第一条作为 Top Hit，其余按分组
  const grouped = useMemo(() => {
    if (!results.length) return [];
    const [top, ...rest] = results;
    const groups: { name: string; items: Result[] }[] = [{ name: "Top Hit", items: [top] }];
    for (const r of rest) {
      const g = groups.find((x) => x.name === r.group);
      if (g) g.items.push(r);
      else groups.push({ name: r.group, items: [r] });
    }
    return groups;
  }, [results]);
  const flat = grouped.flatMap((g) => g.items);

  useEffect(() => setSel(0), [q]);

  const run = (r?: Result) => {
    if (!r) return;
    sys.setOverlay(null);
    r.run();
  };

  return (
    <div className="fixed inset-0 z-[9500]" onPointerDown={() => sys.setOverlay(null)}>
      <div
        className="spotlight-in glass-strong absolute left-1/2 top-[18vh] w-[min(680px,calc(100vw-32px))] -translate-x-1/2 overflow-hidden rounded-[26px]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex h-[58px] items-center gap-3 px-5">
          <LuSearch className="shrink-0 text-[22px] text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, flat.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === "Enter") run(flat[sel]);
              else if (e.key === "Escape") sys.setOverlay(null);
            }}
            placeholder="Spotlight Search — apps, projects, settings…"
            aria-label="Spotlight search"
            className="h-full w-full bg-transparent font-display text-[22px] font-light text-fg outline-none placeholder:text-muted"
          />
        </div>
        {flat.length > 0 && (
          <div className="scroll-area max-h-[52vh] overflow-y-auto border-t border-sep px-2 pb-2">
            {grouped.map((g) => (
              <div key={g.name}>
                <div className="px-3 pb-1 pt-2.5 text-[11px] font-semibold text-muted">{g.name}</div>
                {g.items.map((r) => {
                  const i = flat.indexOf(r);
                  const active = i === sel;
                  return (
                    <button
                      key={r.id}
                      onMouseEnter={() => setSel(i)}
                      onClick={() => run(r)}
                      className={`flex w-full items-center gap-3 rounded-[10px] px-3 py-[6px] text-left ${active ? "bg-accent text-white" : ""}`}
                    >
                      {r.icon}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px]">{r.title}</span>
                        {r.subtitle && (
                          <span className={`block truncate text-[12px] ${active ? "text-white/75" : "text-muted"}`}>{r.subtitle}</span>
                        )}
                      </span>
                      {r.group === "Links" && <LuArrowUpRight className="opacity-60" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        {q && !flat.length && <div className="border-t border-sep px-6 py-5 text-[14px] text-muted">No results for “{q}”</div>}
      </div>
    </div>
  );
}
