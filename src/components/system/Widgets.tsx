"use client";

import { useEffect, useMemo, useState } from "react";
import { LuArrowUpRight, LuMapPin, LuPause, LuPlay, LuSkipForward } from "react-icons/lu";
import { music, useNowPlaying } from "@/lib/music/store";
import { useLibrary } from "@/lib/music/library";
import { Artwork, Equalizer, ProgressBar } from "../music/MusicParts";
import { profile } from "@/config/profile";
import { FEATURED } from "@/config/projects";
import { useData, useProjectImages } from "@/context/Data";
import { useSystem } from "@/context/System";
import { openProject } from "@/lib/openProject";
import { Avatar } from "../Avatar";
import { ProjectIcon } from "../icons/ProjectIcon";
import { useClock } from "../MenuBar";

/** 个人信息小组件 */
export function ProfileWidget({ solid = false }: { solid?: boolean }) {
  const sys = useSystem();
  return (
    <button onClick={() => sys.open("about")} className={`widget ${solid ? "widget-solid" : ""} block w-full p-4 text-left`}>
      <div className="flex items-center gap-3">
        <Avatar size={46} className="shadow-md" />
        <div className="min-w-0">
          <div className="font-display text-[17px] font-semibold leading-tight">{profile.name}</div>
          <div className="truncate text-[12px] opacity-80">{profile.title.replace(" @ ", " · ")}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-[12px] bg-black/[0.06] px-3 py-2 text-[12px] dark:bg-white/10">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#30d158] shadow-[0_0_8px_#30d158]" />
        <span className="truncate">
          {profile.role} @ <b>{profile.company}</b>
        </span>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[11px] opacity-75">
        <LuMapPin /> {profile.location}
      </div>
    </button>
  );
}

const LEVEL_COLORS = ["rgba(127,127,127,0.22)", "#0e4429", "#006d32", "#26a641", "#39d353"];

/** GitHub 贡献热力图（最近 20 周） */
export function ContributionsWidget({ solid = false }: { solid?: boolean }) {
  const { github } = useData();
  const sys = useSystem();
  const weeks = useMemo(() => {
    const days = github.contributions?.days ?? [];
    if (!days.length) return null;
    const recent = days.slice(-20 * 7);
    // 从周日开始对齐
    const first = new Date(recent[0].date + "T00:00:00");
    const pad = first.getDay();
    const cells = [...Array(pad).fill(null), ...recent];
    const out: ({ date: string; level: number } | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [github.contributions]);

  const total = github.contributions?.total ?? profile.stats.contributionsThisYear;

  return (
    <button onClick={() => sys.open("github")} className={`widget ${solid ? "widget-solid" : ""} block w-full p-4 text-left`}>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-wide opacity-75">GitHub</span>
        <span className="text-[11px] opacity-70">@{profile.githubUser}</span>
      </div>
      <div className="mt-0.5 font-display text-[22px] font-semibold leading-tight">
        {total.toLocaleString()} <span className="text-[13px] font-medium opacity-75">contributions</span>
      </div>
      {weeks ? (
        <div className="mt-2.5 flex gap-[3px]">
          {weeks.map((w, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }, (_, d) => {
                const c = w[d];
                return (
                  <span
                    key={d}
                    title={c ? c.date : undefined}
                    className="h-[9px] w-[9px] rounded-[2.5px]"
                    style={{ background: c ? LEVEL_COLORS[c.level] : "transparent" }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 text-[12px] opacity-80">
          {profile.stats.linesOfCode} lines of code written · {profile.stats.publicRepos} public repos
        </div>
      )}
    </button>
  );
}

/** 日历小组件 */
export function CalendarWidget({ solid = false }: { solid?: boolean }) {
  const now = useClock(60_000);
  if (!now) return <div className={`widget ${solid ? "widget-solid" : ""} aspect-square`} />;
  const y = now.getFullYear();
  const m = now.getMonth();
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className={`widget ${solid ? "widget-solid" : ""} aspect-square p-3`}>
      <div className="text-[11px] font-bold uppercase text-[#ff453a]">{now.toLocaleDateString("en-US", { month: "long" })}</div>
      <div className="mt-1 grid grid-cols-7 gap-y-[2px] text-center text-[8.5px] font-medium">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="opacity-60">
            {d}
          </span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            className={`mx-auto grid h-[14px] w-[14px] place-items-center rounded-full ${d === now.getDate() ? "bg-[#ff453a] text-white" : ""}`}
          >
            {d ?? ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** 模拟时钟小组件 */
export function ClockWidget({ solid = false }: { solid?: boolean }) {
  const now = useClock(1000);
  const h = now ? (now.getHours() % 12) + now.getMinutes() / 60 : 0;
  const mi = now ? now.getMinutes() + now.getSeconds() / 60 : 0;
  const s = now ? now.getSeconds() : 0;
  return (
    <div className={`widget ${solid ? "widget-solid" : ""} grid aspect-square place-items-center p-3`}>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <circle cx="50" cy="50" r="47" fill="#fff" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <text key={i} x={50 + Math.sin(a) * 36} y={50 - Math.cos(a) * 36 + 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="#1d1d1f">
              {i === 0 ? 12 : i}
            </text>
          );
        })}
        <line x1="50" y1="50" x2={50 + Math.sin((h / 12) * Math.PI * 2) * 22} y2={50 - Math.cos((h / 12) * Math.PI * 2) * 22} stroke="#1d1d1f" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="50" x2={50 + Math.sin((mi / 60) * Math.PI * 2) * 32} y2={50 - Math.cos((mi / 60) * Math.PI * 2) * 32} stroke="#1d1d1f" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="50" x2={50 + Math.sin((s / 60) * Math.PI * 2) * 36} y2={50 - Math.cos((s / 60) * Math.PI * 2) * 36} stroke="#ff9f0a" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="50" cy="50" r="2.6" fill="#ff9f0a" />
      </svg>
    </div>
  );
}

/** 精选项目（自动轮播） */
export function FeaturedWidget({ solid = false }: { solid?: boolean }) {
  const sys = useSystem();
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % FEATURED.length), 6000);
    return () => clearInterval(t);
  }, []);
  const p = FEATURED[i];
  const imgs = useProjectImages(p.slug);
  const cover = p.cover ?? imgs[0];
  return (
    <button onClick={() => openProject(sys, p)} className={`widget ${solid ? "widget-solid" : ""} block w-full overflow-hidden text-left`}>
      <div
        className="relative h-[92px] overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${p.accent[0]}, ${p.accent[1]})` }}
      >
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover object-left-top opacity-95" />
        )}
        <span className="absolute left-3 top-2.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          Featured
        </span>
      </div>
      <div className="flex items-center gap-2.5 p-3">
        <ProjectIcon project={p} size={34} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold">
            {p.name} {p.private && <span className="text-[11px] opacity-70">🔒</span>}
          </div>
          <div className="truncate text-[11.5px] opacity-75">{p.tagline}</div>
        </div>
        <LuArrowUpRight className="shrink-0 opacity-70" />
      </div>
      <div className="flex justify-center gap-1 pb-2.5">
        {FEATURED.map((_, k) => (
          <span key={k} className={`h-[5px] w-[5px] rounded-full ${k === i ? "bg-current" : "bg-current opacity-30"}`} />
        ))}
      </div>
    </button>
  );
}

/** 音乐小组件：small 放在桌面（方形），medium 放在通知中心 */
export function MusicWidget({ solid = false, size = "small" }: { solid?: boolean; size?: "small" | "medium" }) {
  const sys = useSystem();
  const now = useNowPlaying();
  const library = useLibrary();
  const track = now.track ?? library[0]?.tracks[0] ?? null;
  const playing = !!now.track && !now.isPaused;
  const start = () => (now.track ? music.toggle() : library[0] && music.playQueue(library[0].tracks, 0));

  const bg = track?.artwork ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={track.artwork} alt="" className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl" />
  ) : (
    <span className="absolute inset-0 opacity-50" style={{ background: `linear-gradient(135deg, ${(track?.accent ?? ["#ff375f", "#bf5af2"])[0]}, ${(track?.accent ?? ["#ff375f", "#bf5af2"])[1]})` }} />
  );

  const controls = (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button aria-label={playing ? "Pause" : "Play"} onClick={start} className="grid h-8 w-8 place-items-center rounded-full bg-black/10 text-[15px] hover:bg-black/20 dark:bg-white/15 dark:hover:bg-white/25">
        {playing ? <LuPause /> : <LuPlay className="ml-0.5" />}
      </button>
      {now.track && (
        <button aria-label="Next" onClick={music.next} className="grid h-8 w-8 place-items-center rounded-full text-[15px] hover:bg-black/10 dark:hover:bg-white/15">
          <LuSkipForward />
        </button>
      )}
    </div>
  );

  if (size === "medium") {
    return (
      <div role="button" tabIndex={0} onClick={() => sys.open("music")} className={`widget ${solid ? "widget-solid" : ""} relative block w-full p-4 text-left`} data-widget="music">
        {bg}
        <div className="relative flex items-center gap-3">
          <Artwork track={track} size={64} rounded={10} />
          <div className="min-w-0 flex-1">
            <div className="text-[10.5px] font-semibold uppercase tracking-wide opacity-60">{now.track ? (playing ? "Now Playing" : "Paused") : "Music"}</div>
            <div className="truncate text-[14px] font-semibold">{track?.title ?? "Nothing yet"}</div>
            <div className="truncate text-[12px] opacity-70">{track?.artist}</div>
          </div>
          {controls}
        </div>
        {now.track && (
          <div className="relative mt-2" onClick={(e) => e.stopPropagation()}>
            <ProgressBar showTime={false} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div role="button" tabIndex={0} onClick={() => sys.open("music")} className={`widget ${solid ? "widget-solid" : ""} relative flex aspect-square flex-col p-3 text-left`} data-widget="music">
      {bg}
      <div className="relative flex items-start justify-between">
        <Artwork track={track} size={52} rounded={9} />
        {now.track && <Equalizer playing={playing} className="mt-1 text-[#ff375f]" />}
      </div>
      <div className="relative mt-auto min-w-0">
        <div className="truncate text-[13px] font-semibold leading-tight">{track?.title ?? "Music"}</div>
        <div className="truncate text-[11.5px] opacity-70">{now.track ? track?.artist : `Play “${library[0]?.name ?? "Music"}”`}</div>
      </div>
      <div className="relative mt-1.5">{controls}</div>
    </div>
  );
}
