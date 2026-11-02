"use client";

import { useEffect, useState } from "react";
import { LuArrowUpRight, LuDownload } from "react-icons/lu";
import { useSystem } from "@/context/System";
import { useData, useProjectImages } from "@/context/Data";
import { getProject } from "@/config/projects";

/**
 * 菜单栏中间的“刘海”——VibeIsland 的现场演示。
 * 悬停展开，轮播 VibeIsland 的真实截图；点击打开完整的产品页。
 */
export function Notch() {
  const sys = useSystem();
  const { github } = useData();
  const images = useProjectImages("vibeisland").filter((s) => /agent-|calendar|weather|timer|file-shelf|home/.test(s));
  const project = getProject("vibeisland")!;
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!open || images.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 2600);
    return () => clearInterval(t);
  }, [open, images.length]);

  const download = github.latestRelease?.url ?? project.download?.url;

  return (
    <div
      className="absolute left-1/2 top-0 z-[9001] hidden -translate-x-1/2 md:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ textShadow: "none" }}
    >
      <div
        className="notch relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
        style={{
          width: open ? 560 : 200,
          height: open ? 214 : 30,
          borderRadius: open ? "0 0 28px 28px" : "0 0 12px 12px",
        }}
      >
        {/* 收起状态：左边一个“正在播放”，右边一个音频波形 */}
        <div
          className={`absolute inset-x-0 top-0 flex h-[30px] items-center justify-between px-3 transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`}
        >
          <span className="h-[18px] w-[18px] rounded-[5px] bg-gradient-to-br from-[#5fd6c8] to-[#0f8a8f]" />
          <span className="flex items-end gap-[2px]">
            {[6, 11, 8, 13].map((h, i) => (
              <span key={i} className="w-[2.5px] animate-pulse rounded-full bg-white/70" style={{ height: h, animationDelay: `${i * 120}ms` }} />
            ))}
          </span>
        </div>

        {/* 展开状态 */}
        {open && (
          <div className="fade-in absolute inset-0 flex flex-col px-5 pb-4 pt-9">
            <button
              className="relative block w-full overflow-hidden rounded-[14px] bg-[#111]"
              style={{ aspectRatio: "1600 / 436" }}
              onClick={() => sys.open("vibeisland")}
              aria-label="Open VibeIsland"
            >
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
                  style={{ opacity: i === idx ? 1 : 0 }}
                />
              ))}
            </button>
            <div className="mt-3 flex items-center gap-2 text-[12px]">
              <span className="font-semibold">VibeIsland</span>
              <span className="text-white/50">— my notch app · real screenshots</span>
              <div className="ml-auto flex gap-1.5">
                {download && (
                  <a
                    href={download}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 hover:bg-white/25"
                  >
                    <LuDownload /> {github.latestRelease?.tag ?? "Download"}
                  </a>
                )}
                <button
                  onClick={() => sys.open("vibeisland")}
                  className="flex items-center gap-1 rounded-full bg-[#30d158] px-2.5 py-1 font-medium text-black hover:brightness-110"
                >
                  Learn more <LuArrowUpRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
