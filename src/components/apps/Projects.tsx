"use client";

import { useEffect, useState } from "react";
import { LuArrowUpRight, LuChevronLeft, LuChevronRight, LuFolder } from "react-icons/lu";
import { profile, type Project } from "@/config/profile";
import type { AppProps } from "@/lib/apps";

function Folder({ color, size = 64 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 80 64" aria-hidden>
      <path d="M4 10a6 6 0 0 1 6-6h18l6 7h36a6 6 0 0 1 6 6v3H4z" fill={color} opacity=".75" />
      <rect x="4" y="16" width="72" height="44" rx="6" fill={color} />
      <rect x="4" y="16" width="72" height="44" rx="6" fill="url(#fg)" />
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Projects({ params }: AppProps) {
  const initial = typeof params?.project === "string" ? params.project : null;
  const [current, setCurrent] = useState<string | null>(initial);
  useEffect(() => {
    if (initial) setCurrent(initial);
  }, [initial]);

  const project = profile.projects.find((p) => p.name === current);

  return (
    <div className="flex h-full flex-col">
      {/* 工具栏 */}
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-black/5 px-3 text-[13px]">
        <button
          aria-label="Back"
          disabled={!project}
          onClick={() => setCurrent(null)}
          className="rounded p-1 hover:bg-black/5 disabled:opacity-30"
        >
          <LuChevronLeft />
        </button>
        <button aria-label="Forward" disabled className="rounded p-1 opacity-30">
          <LuChevronRight />
        </button>
        <span className="flex items-center gap-1.5 font-semibold">
          <LuFolder className="text-[#3a9bf0]" />
          {project ? (
            <>
              <button onClick={() => setCurrent(null)} className="hover:underline">
                Projects
              </button>
              <LuChevronRight className="opacity-40" />
              {project.name}
            </>
          ) : (
            "Projects"
          )}
        </span>
        <span className="ml-auto text-black/40">{profile.projects.length} items</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {project ? <Detail project={project} /> : <Grid onOpen={setCurrent} />}
      </div>
    </div>
  );
}

function Grid({ onOpen }: { onOpen: (name: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2 p-4" onClick={() => setSelected(null)}>
      {profile.projects.map((p) => (
        <button
          key={p.name}
          onClick={(e) => {
            e.stopPropagation();
            // 触屏设备单击即可打开
            if (window.matchMedia("(pointer: coarse)").matches) onOpen(p.name);
            else setSelected(p.name);
          }}
          onDoubleClick={() => onOpen(p.name)}
          className={`flex flex-col items-center gap-1.5 rounded-lg p-3 text-center ${
            selected === p.name ? "bg-black/10" : "hover:bg-black/[0.04]"
          }`}
        >
          <Folder color={p.color} />
          <span
            className={`rounded px-1.5 text-[13px] font-medium ${selected === p.name ? "bg-[#2f6fed] text-white" : ""}`}
          >
            {p.name}
          </span>
          <span className="line-clamp-2 text-[11.5px] text-black/50">{p.tagline}</span>
        </button>
      ))}
      <p className="col-span-full mt-2 text-center text-[12px] text-black/35">Double‑click a folder to open it</p>
    </div>
  );
}

function Detail({ project }: { project: Project }) {
  return (
    <article className="mx-auto max-w-2xl p-6">
      <div className="flex items-center gap-4">
        <Folder color={project.color} size={72} />
        <div>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-[14px] text-black/55">
            {project.year} · {project.tagline}
          </p>
        </div>
      </div>

      {/* 预览占位：可以替换成截图 */}
      <div
        className="mt-5 grid aspect-[16/8] place-items-center rounded-xl text-2xl font-bold text-white shadow-inner"
        style={{ background: `linear-gradient(135deg, ${project.color}, #111827)` }}
      >
        {project.name}
      </div>

      <p className="mt-5 text-[14.5px] leading-relaxed text-black/80">{project.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span key={t} className="rounded-md border border-black/10 bg-white px-2.5 py-1 text-[12.5px] shadow-sm">
            {t}
          </span>
        ))}
      </div>

      {project.links?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {project.links.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 rounded-lg bg-[#2f6fed] px-3.5 py-2 text-[13px] font-medium text-white shadow hover:brightness-110"
            >
              {l.label} <LuArrowUpRight />
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
