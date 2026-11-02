"use client";

import { useEffect, useState } from "react";
import { LuArrowUpRight, LuDownload } from "react-icons/lu";
import { useSystem } from "@/context/System";
import { useData, useProjectImages } from "@/context/Data";
import { getProject } from "@/config/projects";
import { music, useNowPlaying } from "@/lib/music/store";
import { useLibrary } from "@/lib/music/library";
import { Artwork, Equalizer, ProgressBar, TransportControls } from "../music/MusicParts";

type Tab = "music" | "vibeisland";

/**
 * 菜单栏中间的“刘海”。
 * - 收起：有歌在放时显示专辑封面 + 跳动的波形（像 VibeIsland 的 live activity）
 * - 展开：Music（正在播放 + 控制）和 VibeIsland（我的刘海 App，真实截图）两个标签
 */
export function Notch() {
  const sys = useSystem();
  const { github } = useData();
  const images = useProjectImages("vibeisland").filter((s) => /agent-|calendar|weather|timer|file-shelf|home/.test(s));
  const project = getProject("vibeisland")!;
  const now = useNowPlaying();
  const library = useLibrary();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("vibeisland");
  const [idx, setIdx] = useState(0);
  const playing = !!now.track && !now.isPaused;

  useEffect(() => {
    if (!open || tab !== "vibeisland" || images.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 2600);
    return () => clearInterval(t);
  }, [open, tab, images.length]);

  const download = github.latestRelease?.url ?? project.download?.url;
  const height = !open ? 30 : tab === "music" ? 176 : 262;

  return (
    <div
      className="absolute left-1/2 top-0 z-[9001] hidden -translate-x-1/2 md:block"
      onMouseEnter={() => {
        setTab(now.track ? "music" : "vibeisland");
        setOpen(true);
      }}
      onMouseLeave={() => setOpen(false)}
      style={{ textShadow: "none" }}
      data-notch={open ? "open" : "closed"}
    >
      <div
        className="notch relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
        style={{ width: open ? 560 : 200, height, borderRadius: open ? "0 0 28px 28px" : "0 0 12px 12px" }}
      >
        {/* 收起状态：左边封面，右边波形 */}
        <div className={`absolute inset-x-0 top-0 flex h-[30px] items-center justify-between px-3 transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`}>
          {now.track ? (
            <Artwork track={now.track} size={18} rounded={5} />
          ) : (
            <span className="h-[18px] w-[18px] rounded-[5px] bg-gradient-to-br from-[#5fd6c8] to-[#0f8a8f]" />
          )}
          {now.track ? (
            <Equalizer playing={playing} className="text-white/75" />
          ) : (
            <span className="flex items-end gap-[2px]">
              {[6, 11, 8, 13].map((h, i) => (
                <span key={i} className="w-[2.5px] animate-pulse rounded-full bg-white/70" style={{ height: h, animationDelay: `${i * 120}ms` }} />
              ))}
            </span>
          )}
        </div>

        {open && (
          <div className="fade-in absolute inset-0 flex flex-col px-5 pb-4 pt-[36px]">
            <div className="mb-3 flex gap-1 text-[11.5px] font-medium">
              {(["music", "vibeisland"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-2.5 py-0.5 ${tab === t ? "bg-white/20 text-white" : "text-white/55 hover:text-white/80"}`}
                >
                  {t === "music" ? "Music" : "VibeIsland"}
                </button>
              ))}
            </div>

            {tab === "music" ? (
              now.track ? (
                <>
                  <div className="flex items-center gap-3">
                    <button onClick={() => sys.open("music")} aria-label="Open Music">
                      <Artwork track={now.track} size={64} rounded={12} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-semibold">{now.track.title}</div>
                      <div className="truncate text-[12.5px] text-white/60">{now.track.artist}</div>
                      {now.isPreview && <div className="mt-0.5 text-[10.5px] text-white/40">30‑second preview</div>}
                    </div>
                    <Equalizer playing={playing} className="mr-1 text-[#ff375f]" />
                    <TransportControls size={18} btnClass="h-9 w-9 rounded-full text-white hover:bg-white/15" />
                  </div>
                  <ProgressBar dark className="mt-3 text-white" />
                </>
              ) : (
                <div className="flex flex-1 items-center gap-3">
                  <Artwork accent={library[0]?.accent} size={64} rounded={12} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold">Not Playing</div>
                    <div className="text-[12.5px] text-white/55">Pick something from my playlists</div>
                  </div>
                  <button
                    onClick={() => library[0] && music.playQueue(library[0].tracks, 0)}
                    className="rounded-full bg-[#ff375f] px-3 py-1 text-[12px] font-medium hover:brightness-110"
                  >
                    Play {library[0]?.name}
                  </button>
                  <button onClick={() => sys.open("music")} className="rounded-full bg-white/15 px-3 py-1 text-[12px] hover:bg-white/25">
                    Open Music
                  </button>
                </div>
              )
            ) : (
              <>
                <button
                  className="relative block w-full overflow-hidden rounded-[14px] bg-[#111]"
                  style={{ aspectRatio: "1600 / 436" }}
                  onClick={() => sys.open("vibeisland")}
                  aria-label="Open VibeIsland"
                >
                  {images.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500" style={{ opacity: i === idx ? 1 : 0 }} />
                  ))}
                </button>
                <div className="mt-3 flex items-center gap-2 text-[12px]">
                  <span className="font-semibold">VibeIsland</span>
                  <span className="text-white/50">— my notch app · real screenshots</span>
                  <div className="ml-auto flex gap-1.5">
                    {download && (
                      <a href={download} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 hover:bg-white/25">
                        <LuDownload /> {github.latestRelease?.tag ?? "Download"}
                      </a>
                    )}
                    <button onClick={() => sys.open("vibeisland")} className="flex items-center gap-1 rounded-full bg-[#30d158] px-2.5 py-1 font-medium text-black hover:brightness-110">
                      Learn more <LuArrowUpRight />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
