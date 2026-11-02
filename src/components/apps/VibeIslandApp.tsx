"use client";

import { useState } from "react";
import { LuArrowUpRight, LuChevronLeft, LuChevronRight, LuDownload, LuGithub } from "react-icons/lu";
import { getProject } from "@/config/projects";
import { useData, useProjectImages } from "@/context/Data";
import { Toolbar } from "../chrome/WindowChrome";
import { SystemIcon } from "../icons/AppIcons";

const AGENTS = ["Claude Code", "Codex", "Gemini CLI", "Antigravity", "OpenCode", "Cursor", "Pi"];

const CAPTIONS: Record<string, string> = {
  "agent-permission": "Approve permission requests from the notch",
  "agent-question": "Answer an agent's question without switching windows",
  "agent-usage": "Agent sessions at a glance",
  "agent-provider-usage": "Provider usage, tokens and rate‑limit windows",
  "vibeisland-home": "Home: media, calendar and status",
  "file-shelf": "File shelf and AirDrop",
  calendar: "Calendar",
  weather: "Weather",
  timer: "Timer",
};

/** VibeIsland 的 App Store 风格产品页 */
export default function VibeIslandApp() {
  const project = getProject("vibeisland")!;
  const { github } = useData();
  const imgs = useProjectImages("vibeisland");
  const big = imgs.filter((s) => !/\/(hud-|live-)/.test(s)).sort((a, b) => Number(/agent-permission/.test(b)) - Number(/agent-permission/.test(a)));
  const strips = imgs.filter((s) => /\/(hud-|live-)/.test(s));
  const [i, setI] = useState(0);
  const name = (s: string) => s.split("/").pop()!.replace(/\.\w+$/, "");
  const release = github.latestRelease;

  return (
    <div className="flex h-full flex-col">
      <Toolbar lights title="VibeIsland" subtitle="macOS App" />
      <div className="scroll-area min-h-0 flex-1 overflow-y-auto">
        {/* 头部 */}
        <div className="flex flex-wrap items-center gap-5 px-8 pb-6 pt-2">
          <SystemIcon name="vibeisland" size={112} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight">VibeIsland</h1>
            <p className="text-[15px] text-fg-2">{project.tagline}</p>
            <p className="mt-1 text-[12px] text-muted">by {project.repo?.split("/")[3]} · Free · Open source (GPL‑3.0)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a className="btn btn-primary !h-[30px] !px-5" href={release?.url ?? project.download!.url} target="_blank" rel="noreferrer">
                <LuDownload /> {release ? `Download ${release.tag}` : "Download"}
              </a>
              <a className="btn !h-[30px]" href={project.repo} target="_blank" rel="noreferrer">
                <LuGithub /> View on GitHub <LuArrowUpRight className="opacity-60" />
              </a>
            </div>
          </div>
        </div>

        <div className="mx-8 grid grid-cols-2 divide-x divide-[var(--separator)] border-y border-sep py-3 text-center text-[11px] text-muted sm:grid-cols-4">
          {[
            ["Requires", "macOS 14.6+"],
            ["Built with", "SwiftUI"],
            ["Releases", "Signed & notarized"],
            ["License", "GPL‑3.0"],
          ].map(([k, v]) => (
            <div key={k} className="px-2">
              <div className="uppercase tracking-wide">{k}</div>
              <div className="mt-0.5 text-[14px] font-semibold text-fg">{v}</div>
            </div>
          ))}
        </div>

        {/* 截图轮播 */}
        {big.length > 0 && (
          <div className="px-8 pt-6">
            <h2 className="mb-3 text-[17px] font-bold">Preview</h2>
            <div className="relative overflow-hidden rounded-[16px] bg-[#0b2e33]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={big[i]} alt={CAPTIONS[name(big[i])] ?? "VibeIsland screenshot"} className="block w-full" />
              <button
                aria-label="Previous screenshot"
                onClick={() => setI((i - 1 + big.length) % big.length)}
                className="glass absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-fg"
              >
                <LuChevronLeft />
              </button>
              <button
                aria-label="Next screenshot"
                onClick={() => setI((i + 1) % big.length)}
                className="glass absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-fg"
              >
                <LuChevronRight />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px] text-muted">
              <span>{CAPTIONS[name(big[i])] ?? name(big[i])}</span>
              <span>
                {i + 1} / {big.length}
              </span>
            </div>
            <div className="scroll-area mt-2 flex gap-2 overflow-x-auto pb-1">
              {big.map((s, k) => (
                <button key={s} onClick={() => setI(k)} className={`shrink-0 overflow-hidden rounded-[8px] ring-2 ${k === i ? "ring-accent" : "ring-transparent"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s} alt="" className="h-[46px] w-auto" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 px-8 py-6 md:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="mb-2 text-[17px] font-bold">About</h2>
            <div className="space-y-2.5 text-[13.5px] leading-relaxed text-fg-2">
              {project.description.map((d, k) => (
                <p key={k}>{d}</p>
              ))}
            </div>
            <ul className="mt-3 space-y-1.5 text-[13px]">
              {project.highlights?.map((h) => (
                <li key={h} className="flex gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#30d158]" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-2 text-[17px] font-bold">Works with</h2>
            <div className="flex flex-wrap gap-1.5">
              {AGENTS.map((a) => (
                <span key={a} className="chip">
                  {a}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-muted">One‑click hook / plugin setup for each tool.</p>
          </div>
        </div>

        {strips.length > 0 && (
          <div className="px-8 pb-8">
            <h2 className="mb-1 text-[17px] font-bold">Live activities & HUDs</h2>
            <p className="mb-3 text-[12.5px] text-muted">When the notch is collapsed, only what matters stays glanceable.</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {strips.map((s) => (
                <figure key={s} className="overflow-hidden rounded-[12px] bg-[#0b2e33]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s} alt={name(s)} className="block w-full" loading="lazy" />
                  <figcaption className="bg-win-alt px-3 py-1.5 text-[11.5px] capitalize text-fg-2">{name(s).replace(/-/g, " ")}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
