"use client";

import { useMemo, useState } from "react";
import { LuArrowUpRight, LuStar } from "react-icons/lu";
import { profile } from "@/config/profile";
import { PROJECTS } from "@/config/projects";
import { useData } from "@/context/Data";
import { Toolbar } from "../chrome/WindowChrome";

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Swift: "#F05138",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  Lua: "#000080",
  HTML: "#e34c26",
  Shell: "#89e051",
  TeX: "#3D6117",
  Go: "#00ADD8",
};

const LEVELS = ["var(--selected)", "#0e4429", "#006d32", "#26a641", "#39d353"];

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 86400000;
  if (d < 1) return "today";
  if (d < 30) return `${Math.round(d)}d ago`;
  if (d < 365) return `${Math.round(d / 30)}mo ago`;
  return `${Math.round(d / 365)}y ago`;
}

export default function GitHubApp() {
  const { github } = useData();
  const [tab, setTab] = useState<"overview" | "repos">("overview");

  const repos = useMemo(() => (github.repos ?? []).filter((r) => !r.fork), [github.repos]);
  const fromApi = repos.length > 0;

  const langs = useMemo(() => {
    const counts: Record<string, number> = {};
    if (fromApi) repos.forEach((r) => r.language && (counts[r.language] = (counts[r.language] ?? 0) + 1));
    else {
      const norm: Record<string, string> = { "Next.js": "TypeScript", React: "TypeScript", "Swift 6": "Swift", "Java 17": "Java" };
      PROJECTS.forEach((p) => {
        const l = norm[p.tech[0]] ?? p.tech[0];
        counts[l] = (counts[l] ?? 0) + 1;
      });
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, n]) => ({ name, pct: (n / total) * 100 }));
  }, [repos, fromApi]);

  const weeks = useMemo(() => {
    const days = github.contributions?.days ?? [];
    if (!days.length) return null;
    const first = new Date(days[0].date + "T00:00:00").getDay();
    const cells = [...Array(first).fill(null), ...days];
    const out: ({ date: string; level: number } | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [github.contributions]);

  const stats = [
    { label: "Contributions (last year)", value: (github.contributions?.total ?? profile.stats.contributionsThisYear).toLocaleString() },
    { label: "Public repositories", value: fromApi ? repos.length : profile.stats.publicRepos },
    { label: "Lines of code written", value: profile.stats.linesOfCode },
    { label: "Stars", value: fromApi ? repos.reduce((a, r) => a + r.stars, 0) : "—" },
  ];

  return (
    <div className="flex h-full flex-col">
      <Toolbar lights title="GitHub" subtitle={`@${profile.githubUser}`}>
        <div className="tb-capsule">
          {(["overview", "repos"] as const).map((t) => (
            <button key={t} className="tb-btn !text-[12.5px] !font-medium" data-active={tab === t ? "true" : undefined} onClick={() => setTab(t)}>
              {t === "overview" ? "Overview" : "Repositories"}
            </button>
          ))}
        </div>
        <a className="btn" href={`https://github.com/${profile.githubUser}`} target="_blank" rel="noreferrer">
          Profile <LuArrowUpRight />
        </a>
      </Toolbar>

      <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-5 pb-5">
        {tab === "overview" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="card p-3.5">
                  <div className="font-display text-[24px] font-bold tabular-nums">{s.value}</div>
                  <div className="text-[11.5px] text-muted">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="card p-4">
              <div className="mb-3 text-[13px] font-semibold">Contribution activity</div>
              {weeks ? (
                <div className="scroll-area overflow-x-auto">
                  <div className="flex w-max gap-[3px]">
                    {weeks.map((w, i) => (
                      <div key={i} className="flex flex-col gap-[3px]">
                        {Array.from({ length: 7 }, (_, d) => (
                          <span key={d} title={w[d]?.date} className="h-[10px] w-[10px] rounded-[2.5px]" style={{ background: w[d] ? LEVELS[w[d]!.level] : "transparent" }} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[12.5px] text-muted">
                  Live contribution data loads when the site is deployed. Meanwhile:{" "}
                  <a className="text-accent" href={`https://github.com/${profile.githubUser}`} target="_blank" rel="noreferrer">
                    see it on GitHub
                  </a>
                  .
                </p>
              )}
            </div>

            <div className="card p-4">
              <div className="mb-3 text-[13px] font-semibold">Languages</div>
              <div className="flex h-[10px] overflow-hidden rounded-full">
                {langs.map((l) => (
                  <span key={l.name} style={{ width: `${l.pct}%`, background: LANG_COLORS[l.name] ?? "#8e8e93" }} />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px]">
                {langs.map((l) => (
                  <span key={l.name} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: LANG_COLORS[l.name] ?? "#8e8e93" }} />
                    {l.name} <span className="text-muted">{l.pct.toFixed(0)}%</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead className="sticky top-0 bg-win text-left text-[11.5px] text-muted">
              <tr className="border-b border-sep">
                <th className="py-1.5 font-medium">Repository</th>
                <th className="font-medium">Language</th>
                <th className="font-medium">Stars</th>
                <th className="font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {fromApi
                ? repos.map((r, i) => (
                    <tr key={r.name} className={i % 2 ? "bg-hover" : ""}>
                      <td className="py-[5px]">
                        <a className="text-accent hover:underline" href={r.url} target="_blank" rel="noreferrer">
                          {r.name}
                        </a>
                        {r.description && <div className="max-w-[360px] truncate text-[11.5px] text-muted">{r.description}</div>}
                      </td>
                      <td>
                        {r.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ background: LANG_COLORS[r.language] ?? "#8e8e93" }} />
                            {r.language}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="flex items-center gap-1">
                          <LuStar className="text-[11px]" /> {r.stars}
                        </span>
                      </td>
                      <td className="text-fg-2">{timeAgo(r.pushedAt)}</td>
                    </tr>
                  ))
                : PROJECTS.filter((p) => p.repo).map((p, i) => (
                    <tr key={p.slug} className={i % 2 ? "bg-hover" : ""}>
                      <td className="py-[5px]">
                        <a className="text-accent hover:underline" href={p.repo} target="_blank" rel="noreferrer">
                          {p.repo!.split("/").pop()}
                        </a>
                        <div className="max-w-[360px] truncate text-[11.5px] text-muted">{p.tagline}</div>
                      </td>
                      <td>{p.tech[0]}</td>
                      <td>—</td>
                      <td className="text-fg-2">{p.year}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
