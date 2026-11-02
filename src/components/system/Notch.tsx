"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LuChevronRight } from "react-icons/lu";
import { useSystem, type Toast } from "@/context/System";
import { APPS } from "@/lib/apps";
import { music, useNowPlaying, type Track } from "@/lib/music/store";
import { useLibrary } from "@/lib/music/library";
import { Artwork, Equalizer, ProgressBar, TransportControls } from "../music/MusicParts";
import { SystemIcon } from "../icons/AppIcons";
import { useClock } from "../MenuBar";

/**
 * 灵动岛：菜单栏中间的黑色岛，根据状态在几种形态之间弹性变形。
 * 优先级：alert（通知） > expanded（悬停） > peek（切歌提示） > compact（有歌） > idle
 */

type Mode = "idle" | "compact" | "peek" | "expanded" | "alert";

const SIZE: Record<Mode | "expanded-home", { w: number; h: number; r: number }> = {
  idle: { w: 200, h: 30, r: 12 },
  compact: { w: 236, h: 30, r: 14 },
  peek: { w: 360, h: 50, r: 22 },
  alert: { w: 400, h: 68, r: 26 },
  expanded: { w: 520, h: 156, r: 32 },
  "expanded-home": { w: 480, h: 138, r: 32 },
};

function modeFor({ toast, hover, peek, track }: { toast: boolean; hover: boolean; peek: boolean; track: boolean }): Mode {
  if (toast) return "alert";
  if (hover) return "expanded";
  if (peek && track) return "peek";
  if (track) return "compact";
  return "idle";
}

export function Notch() {
  const sys = useSystem();
  const now = useNowPlaying();
  const [hover, setHover] = useState(false);
  const [peek, setPeek] = useState(false);
  const enterT = useRef<number | null>(null);
  const leaveT = useRef<number | null>(null);
  const lastTrack = useRef<string | null | undefined>(undefined);

  const toast = sys.toasts[sys.toasts.length - 1];
  const mode = modeFor({ toast: !!toast, hover, peek, track: !!now.track });
  const sizeKey = mode === "expanded" && !now.track ? "expanded-home" : mode;
  const size = SIZE[sizeKey];

  // 切歌时短暂弹出歌名
  useEffect(() => {
    const id = now.track?.id ?? null;
    if (lastTrack.current === undefined) {
      lastTrack.current = id;
      return;
    }
    if (id && id !== lastTrack.current) {
      setPeek(true);
      const t = setTimeout(() => setPeek(false), 2600);
      lastTrack.current = id;
      return () => clearTimeout(t);
    }
    lastTrack.current = id;
  }, [now.track?.id]);

  // 记录上一次的尺寸，用来区分变大（弹性）还是变小（利落）
  const prevArea = useRef(size.w * size.h);
  const grow = size.w * size.h >= prevArea.current;
  useEffect(() => {
    prevArea.current = size.w * size.h;
  }, [size.w, size.h]);

  const onEnter = () => {
    if (leaveT.current) clearTimeout(leaveT.current);
    enterT.current = window.setTimeout(() => setHover(true), 80);
  };
  const onLeave = () => {
    if (enterT.current) clearTimeout(enterT.current);
    leaveT.current = window.setTimeout(() => setHover(false), 160);
  };

  return (
    <div
      className="absolute left-1/2 top-0 z-[9001] hidden -translate-x-1/2 md:block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ textShadow: "none" }}
      data-notch={mode === "expanded" ? "open" : "closed"}
      data-mode={mode}
    >
      <div
        className="notch relative overflow-hidden"
        data-grow={grow ? "true" : "false"}
        data-shadow={mode === "idle" || mode === "compact" ? "none" : "deep"}
        style={{ width: size.w, height: size.h, borderRadius: `0 0 ${size.r}px ${size.r}px` }}
        onClick={() => mode !== "expanded" && mode !== "alert" && setHover(true)}
      >
        <div key={sizeKey} className="island-content absolute inset-0">
          {mode === "compact" && <Compact track={now.track!} playing={!now.isPaused} />}
          {mode === "peek" && <Peek track={now.track!} playing={!now.isPaused} />}
          {mode === "alert" && <Alert t={toast} onDone={() => sys.dismissToast(toast.id)} />}
          {mode === "expanded" && (now.track ? <ExpandedMusic track={now.track} /> : <MiniHome />)}
        </div>
      </div>
    </div>
  );
}

function Compact({ track, playing }: { track: Track; playing: boolean }) {
  return (
    <div className="flex h-[30px] items-center justify-between px-3">
      <Artwork track={track} size={18} rounded={5} />
      <Equalizer playing={playing} className={playing ? "text-[#ff375f]" : "text-white/40"} />
    </div>
  );
}

function Peek({ track, playing }: { track: Track; playing: boolean }) {
  return (
    <div className="flex h-full items-center gap-2.5 px-3 pt-[6px]">
      <Artwork track={track} size={32} rounded={8} />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[13px] font-semibold">{track.title}</div>
        <div className="truncate text-[11.5px] text-white/55">{track.artist}</div>
      </div>
      <Equalizer playing={playing} className="text-[#ff375f]" />
    </div>
  );
}

function Alert({ t, onDone }: { t: Toast; onDone: () => void }) {
  return (
    <button
      className="flex h-full w-full items-center gap-3 px-4 pt-[6px] text-left"
      onClick={() => {
        t.onClick?.();
        onDone();
      }}
      aria-label={`Notification: ${t.title}`}
    >
      <SystemIcon name={t.icon ? APPS[t.icon].icon : "aboutmac"} size={38} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-semibold">{t.title}</span>
          <span className="ml-auto shrink-0 text-[11px] text-white/40">now</span>
        </div>
        <p className="line-clamp-2 text-[12px] leading-snug text-white/65">{t.body}</p>
      </div>
    </button>
  );
}

function VibeLink() {
  const sys = useSystem();
  return (
    <button onClick={() => sys.open("vibeisland")} className="flex items-center gap-0.5 text-[11px] text-white/40 hover:text-white/75">
      Inspired by my app VibeIsland <LuChevronRight className="text-[11px]" />
    </button>
  );
}

function ExpandedMusic({ track }: { track: Track }) {
  const sys = useSystem();
  const { isPaused, isPreview } = useNowPlaying();
  return (
    <div className="flex h-full flex-col px-5 pb-3 pt-[36px]">
      <div className="flex items-center gap-3.5">
        <button onClick={() => sys.open("music")} aria-label="Open Music" className="shrink-0">
          <Artwork track={track} size={56} rounded={14} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold">{track.title}</div>
          <div className="truncate text-[12.5px] text-white/55">
            {track.artist}
            {isPreview && <span className="ml-1.5 text-white/35">· Preview</span>}
          </div>
        </div>
        <Equalizer playing={!isPaused} className="mr-1 text-[#ff375f]" />
        <TransportControls size={19} btnClass="h-9 w-9 rounded-full text-white hover:bg-white/15" />
      </div>
      <ProgressBar dark className="mt-2.5 text-white" />
      <div className="mt-auto flex justify-end">
        <VibeLink />
      </div>
    </div>
  );
}

function MiniHome() {
  const sys = useSystem();
  const now = useClock(15_000);
  const library = useLibrary();
  const first = library[0];
  return (
    <div className="flex h-full flex-col px-5 pb-3 pt-[36px]">
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="font-display text-[34px] font-semibold leading-none tabular-nums">
            {now?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, "")}
          </div>
          <div className="mt-1 text-[12px] text-white/55">{now?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        </div>
        <Tile>
          <span className="text-[9px] font-bold uppercase text-[#ff453a]">{now?.toLocaleDateString("en-US", { weekday: "short" })}</span>
          <span className="text-[24px] font-light leading-none">{now?.getDate()}</span>
        </Tile>
        {first && (
          <div className="flex h-[56px] items-center gap-2.5 rounded-[16px] bg-white/10 pl-2 pr-3.5">
            <button onClick={() => music.playQueue(first.tracks, 0)} aria-label={`Play ${first.name}`} className="shrink-0">
              <Artwork accent={first.accent} size={40} rounded={10} />
            </button>
            <span className="leading-tight">
              <button onClick={() => music.playQueue(first.tracks, 0)} className="block text-[12.5px] font-semibold hover:text-white/85">
                Play {first.name}
              </button>
              <button onClick={() => sys.open("music")} className="text-[11px] text-white/50 hover:text-white/80">
                Open Music
              </button>
            </span>
          </div>
        )}
      </div>
      <div className="mt-auto flex justify-end">
        <VibeLink />
      </div>
    </div>
  );
}

function Tile({ children }: { children: ReactNode }) {
  return <div className="grid h-[56px] w-[56px] shrink-0 place-content-center justify-items-center rounded-[16px] bg-white/10">{children}</div>;
}
