"use client";

import { useState, type FormEvent } from "react";
import { LuChevronLeft, LuChevronRight, LuSearch } from "react-icons/lu";
import { profile } from "@/config/profile";
import { AppIcon } from "@/components/AppIcon";
import { socialIconSpec } from "@/components/SocialIcon";

/**
 * 一个“起始页”风格的浏览器：大多数网站禁止被 iframe 嵌入，
 * 所以点击链接会在新标签页打开。
 */
export default function Browser() {
  const [q, setQ] = useState("");

  const go = (e: FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    const url = /^https?:\/\//.test(v) || /^[\w-]+\.[\w.]+/.test(v)
      ? (v.startsWith("http") ? v : `https://${v}`)
      : `https://www.google.com/search?q=${encodeURIComponent(v)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const projectLinks = profile.projects.flatMap((p) =>
    (p.links ?? []).map((l) => ({ ...l, project: p.name, color: p.color })),
  );

  return (
    <div className="flex h-full flex-col">
      <form onSubmit={go} className="flex h-11 shrink-0 items-center gap-2 border-b border-black/5 px-3">
        <LuChevronLeft className="opacity-30" />
        <LuChevronRight className="opacity-30" />
        <label className="mx-auto flex w-full max-w-md items-center gap-2 rounded-lg bg-black/[0.06] px-3 py-1.5">
          <LuSearch className="shrink-0 text-[13px] opacity-40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search or enter website name"
            className="w-full bg-transparent text-center text-[13px] outline-none placeholder:text-black/40 focus:text-left"
          />
        </label>
        <span className="w-8" />
      </form>

      <div className="min-h-0 flex-1 overflow-auto bg-gradient-to-b from-white/40 to-white/80 px-6 py-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-xl font-bold">Favorites</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-y-5">
            {profile.socials.map((s) => (
              <a
                key={s.key + s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col items-center gap-1.5"
              >
                <span className="transition-transform group-hover:scale-105">
                  <AppIcon icon={socialIconSpec(s.key)} size={56} />
                </span>
                <span className="text-[12px] text-black/70">{s.label}</span>
              </a>
            ))}
          </div>

          {projectLinks.length > 0 && (
            <>
              <h2 className="mb-3 mt-9 text-xl font-bold">Project links</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {projectLinks.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-3 shadow-sm hover:shadow"
                  >
                    <span className="h-10 w-10 shrink-0 rounded-lg" style={{ background: l.color }} />
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-medium">
                        {l.project} · {l.label}
                      </span>
                      <span className="block truncate text-[12px] text-black/45">{l.url}</span>
                    </span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
