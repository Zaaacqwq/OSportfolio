"use client";

import { useRef, useState } from "react";
import { LuPause, LuPlay, LuRepeat, LuRepeat1, LuShuffle, LuSkipBack, LuSkipForward } from "react-icons/lu";
import { formatTime, music, useNowPlaying, useProgress, type Track } from "@/lib/music/store";

/** 专辑封面；没有封面时用歌单的渐变色 + 音符 */
export function Artwork({ track, accent, size, className = "", rounded = 8 }: { track?: Track | null; accent?: [string, string]; size: number; className?: string; rounded?: number }) {
  const [failed, setFailed] = useState(false);
  const a = track?.accent ?? accent ?? ["#ff375f", "#bf5af2"];
  const style = { width: size, height: size, borderRadius: rounded };
  if (track?.artwork && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={track.artwork} alt={track.album ?? track.title} onError={() => setFailed(true)} className={`shrink-0 object-cover shadow-sm ${className}`} style={style} />
    );
  }
  return (
    <span className={`grid shrink-0 place-items-center text-white shadow-sm ${className}`} style={{ ...style, background: `linear-gradient(135deg, ${a[0]}, ${a[1]})` }}>
      <svg viewBox="0 0 24 24" width={size * 0.42} height={size * 0.42} fill="currentColor" aria-hidden>
        <path d="M9 18.5a2.5 2.5 0 1 1-2-2.45V6.2l11-2.2v11.5a2.5 2.5 0 1 1-2-2.45V7.1l-7 1.4z" />
      </svg>
    </span>
  );
}

/** 跳动的均衡器（播放时动，暂停时静止） */
export function Equalizer({ playing, className = "" }: { playing: boolean; className?: string }) {
  return (
    <span className={`inline-flex h-[12px] items-end gap-[2px] ${className}`} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={`w-[2.5px] rounded-full bg-current ${playing ? "eq-bar" : ""}`} style={{ height: playing ? undefined : 3 + (i % 2) * 3, animationDelay: `${i * -0.22}s` }} />
      ))}
    </span>
  );
}

/** 上一首 / 播放暂停 / 下一首 */
export function TransportControls({ size = 18, className = "", btnClass = "" }: { size?: number; className?: string; btnClass?: string }) {
  const { isPaused, track, status } = useNowPlaying();
  const playing = !isPaused || status === "loading";
  return (
    <div className={`flex items-center ${className}`}>
      <button aria-label="Previous" disabled={!track} onClick={music.prev} className={`grid place-items-center disabled:opacity-35 ${btnClass}`} style={{ fontSize: size }}>
        <LuSkipBack />
      </button>
      <button aria-label={playing ? "Pause" : "Play"} disabled={!track} onClick={music.toggle} className={`grid place-items-center disabled:opacity-35 ${btnClass}`} style={{ fontSize: size * 1.3 }}>
        {playing ? <LuPause /> : <LuPlay />}
      </button>
      <button aria-label="Next" disabled={!track} onClick={music.next} className={`grid place-items-center disabled:opacity-35 ${btnClass}`} style={{ fontSize: size }}>
        <LuSkipForward />
      </button>
    </div>
  );
}

export function ShuffleRepeat({ className = "", btnClass = "" }: { className?: string; btnClass?: string }) {
  const { shuffle, repeat } = useNowPlaying();
  return (
    <div className={`flex items-center ${className}`}>
      <button aria-label="Shuffle" aria-pressed={shuffle} onClick={() => music.setShuffle(!shuffle)} className={`${btnClass} ${shuffle ? "!text-accent" : ""}`}>
        <LuShuffle />
      </button>
      <button aria-label={`Repeat ${repeat}`} aria-pressed={repeat !== "off"} onClick={music.cycleRepeat} className={`${btnClass} ${repeat !== "off" ? "!text-accent" : ""}`}>
        {repeat === "one" ? <LuRepeat1 /> : <LuRepeat />}
      </button>
    </div>
  );
}

/** 进度条（可拖动）；只有它订阅高频的进度更新 */
export function ProgressBar({ showTime = true, className = "", dark = false }: { showTime?: boolean; className?: string; dark?: boolean }) {
  const { position, duration } = useProgress();
  const { track } = useNowPlaying();
  const barRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const pct = duration ? ((drag ?? position) / duration) * 100 : 0;

  const at = (clientX: number) => {
    const r = barRef.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duration;
  };

  const onDown = (e: React.PointerEvent) => {
    if (!track || !duration) return;
    e.stopPropagation();
    setDrag(at(e.clientX));
    const move = (ev: PointerEvent) => setDrag(at(ev.clientX));
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      music.seek(at(ev.clientX));
      setDrag(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const track_ = dark ? "bg-white/20" : "bg-black/10 dark:bg-white/15";
  const fill = dark ? "bg-white/85" : "bg-fg/70";
  return (
    <div className={`flex items-center gap-2 ${className}`} data-no-drag>
      {showTime && <span className="w-8 text-right text-[10.5px] tabular-nums opacity-60">{formatTime(drag ?? position)}</span>}
      <div
        ref={barRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration / 1000)}
        aria-valuenow={Math.round((drag ?? position) / 1000)}
        onPointerDown={onDown}
        className="group relative h-[14px] flex-1 cursor-default"
      >
        <div className={`absolute inset-x-0 top-1/2 h-[4px] -translate-y-1/2 overflow-hidden rounded-full ${track_}`}>
          <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      {showTime && <span className="w-8 text-[10.5px] tabular-nums opacity-60">{duration ? `-${formatTime(duration - (drag ?? position))}` : "--:--"}</span>}
    </div>
  );
}
