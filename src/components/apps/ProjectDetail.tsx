"use client";

import { LuArrowUpRight, LuDownload, LuGithub, LuGlobe, LuLock, LuPlay } from "react-icons/lu";
import { CATEGORIES, type Project } from "@/config/projects";
import { useData, useProjectImages } from "@/context/Data";
import { useSystem } from "@/context/System";
import { glyphFor } from "@/lib/projectGlyphs";
import { openProject } from "@/lib/openProject";
import { ProjectIcon } from "../icons/ProjectIcon";

/** 没有截图时生成的封面 */
export function ProjectArt({ project, className = "" }: { project: Project; className?: string }) {
  const Glyph = glyphFor(project);
  return (
    <div
      className={`relative grid place-items-center overflow-hidden text-white ${className}`}
      style={{ background: `linear-gradient(135deg, ${project.accent[0]}, ${project.accent[1]})` }}
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <Glyph className="absolute -right-6 -bottom-8 text-[180px] opacity-15" />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <Glyph className="text-[44px] drop-shadow" />
        <span className="font-display text-[22px] font-bold tracking-tight drop-shadow">{project.name}</span>
      </div>
    </div>
  );
}

/** 项目的封面：自定义 cover → public/projects/<slug> 第一张 → 生成的封面 */
export function ProjectCover({ project, className = "", fit = "cover" }: { project: Project; className?: string; fit?: "cover" | "contain" }) {
  const imgs = useProjectImages(project.slug);
  const src = project.cover ?? imgs.find((s) => !/screen/i.test(s));
  if (!src) return <ProjectArt project={project} className={className} />;
  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${project.name} preview`} className={`h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`} />
    </div>
  );
}

export function StatusBadge({ project }: { project: Project }) {
  if (project.private)
    return (
      <span className="chip">
        <LuLock className="text-[10px]" /> Private
      </span>
    );
  if (project.live) return <span className="chip !text-[#1a7f37] dark:!text-[#3fb950]">● Live</span>;
  return <span className="chip">Public</span>;
}

const SHOWCASE_LABEL: Record<Project["showcase"], string | null> = {
  vibeisland: "Open product page",
  simulator: "Open in Simulator",
  safari: "Open in Safari",
  terminal: "Open in Terminal",
  quicklook: null,
};

/** 项目详情（Quick Look、移动端共用） */
export function ProjectDetail({ project, compact = false }: { project: Project; compact?: boolean }) {
  const sys = useSystem();
  const { github } = useData();
  const repo = github.repos?.find((r) => r.url.toLowerCase() === project.repo?.toLowerCase());
  const showcase = SHOWCASE_LABEL[project.showcase];

  return (
    <article className="text-fg">
      <ProjectCover project={project} className={`w-full rounded-[14px] ${compact ? "aspect-[16/7]" : "aspect-[16/7]"}`} fit={project.slug === "slaythespire" || project.slug === "vibeisland" ? "contain" : "cover"} />
      <div className="mt-4 flex items-start gap-3">
        <ProjectIcon project={project} size={52} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[22px] font-bold leading-tight tracking-tight">{project.name}</h2>
          <p className="text-[13.5px] text-fg-2">{project.tagline}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge project={project} />
            <span className="chip">
              <span className="h-2 w-2 rounded-full" style={{ background: CATEGORIES[project.category].color }} />
              {CATEGORIES[project.category].label}
            </span>
            <span className="chip">{project.kind}</span>
            <span className="chip">{project.year}</span>
            {repo && repo.stars > 0 && <span className="chip">★ {repo.stars}</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 text-[13.5px] leading-relaxed text-fg-2">
        {project.description.map((d, i) => (
          <p key={i}>{d}</p>
        ))}
      </div>

      {project.highlights && (
        <ul className="mt-3 space-y-1.5 text-[13px]">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <span key={t} className="chip !bg-win">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {showcase && (
          <button className="btn btn-primary" onClick={() => openProject(sys, project)}>
            <LuPlay className="text-[12px]" /> {showcase}
          </button>
        )}
        {project.live && (
          <a className="btn" href={project.live} target="_blank" rel="noreferrer">
            <LuGlobe /> Visit <LuArrowUpRight className="opacity-60" />
          </a>
        )}
        {project.download && (
          <a className="btn" href={github.latestRelease?.url ?? project.download.url} target="_blank" rel="noreferrer">
            <LuDownload /> {project.download.label}
          </a>
        )}
        {project.repo ? (
          <a className="btn" href={project.repo} target="_blank" rel="noreferrer">
            <LuGithub /> Source <LuArrowUpRight className="opacity-60" />
          </a>
        ) : (
          <span className="btn opacity-60">
            <LuLock /> Private repository
          </span>
        )}
      </div>
    </article>
  );
}
