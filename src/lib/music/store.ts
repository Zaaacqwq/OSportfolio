"use client";

import { useSyncExternalStore } from "react";
import type { PlaybackUpdate, PlayerAdapter } from "./adapter";

/**
 * 音乐播放状态。放在 React 之外的小 store 里：
 * 进度每 ~0.5 秒更新一次，只有订阅了 useProgress() 的组件会重新渲染，桌面其余部分不受影响。
 */

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artwork: string | null;
  playlistId: string;
  accent: [string, string];
}

export type Repeat = "off" | "all" | "one";
export type Status = "idle" | "loading" | "playing" | "paused" | "blocked" | "error";

export interface NowPlaying {
  queue: Track[];
  /** 播放顺序（随机时被打乱），元素是 queue 的下标 */
  order: number[];
  pos: number;
  track: Track | null;
  playlistId: string | null;
  isPaused: boolean;
  status: Status;
  shuffle: boolean;
  repeat: Repeat;
  isPreview: boolean;
}

export interface Progress {
  position: number;
  duration: number;
}

let now: NowPlaying = {
  queue: [],
  order: [],
  pos: 0,
  track: null,
  playlistId: null,
  isPaused: true,
  status: "idle",
  shuffle: false,
  repeat: "off",
  isPreview: false,
};
let progress: Progress = { position: 0, duration: 0 };

const nowListeners = new Set<() => void>();
const progressListeners = new Set<() => void>();

const setNow = (patch: Partial<NowPlaying>) => {
  now = { ...now, ...patch };
  nowListeners.forEach((l) => l());
};
const setProgress = (p: Progress) => {
  if (p.position === progress.position && p.duration === progress.duration) return;
  progress = p;
  progressListeners.forEach((l) => l());
};

// ───────────────────── 播放器适配层 ─────────────────────

let factory: (() => PlayerAdapter) | null = null;
let adapter: PlayerAdapter | null = null;
let lastUpdate: PlaybackUpdate | null = null;
let blockTimer: number | null = null;
let loadToken = 0;

/** SpotifyHost 挂载时注册；播放器在第一次播放时才真正创建（懒加载 Spotify） */
export function registerAdapterFactory(f: () => PlayerAdapter) {
  factory = f;
}

function getAdapter(): PlayerAdapter | null {
  if (adapter) return adapter;
  if (!factory) return null;
  adapter = factory();
  adapter.onUpdate(onUpdate);
  return adapter;
}

function clearBlockTimer() {
  if (blockTimer) clearTimeout(blockTimer);
  blockTimer = null;
}

function onUpdate(u: PlaybackUpdate) {
  const prev = lastUpdate;
  lastUpdate = u;
  setProgress({ position: u.position, duration: u.duration });
  if (!u.isPaused) clearBlockTimer();
  const ended = prev && !prev.isPaused && u.isPaused && u.duration > 0 && u.position >= u.duration - 900;
  setNow({
    isPaused: u.isPaused,
    status: u.isPaused ? (now.status === "loading" || now.status === "blocked" ? now.status : "paused") : "playing",
    isPreview: u.duration > 0 && u.duration <= 30_500,
  });
  if (ended) handleEnded();
}

function handleEnded() {
  if (now.repeat === "one") {
    void loadAt(now.pos);
    return;
  }
  if (now.pos < now.order.length - 1) void loadAt(now.pos + 1);
  else if (now.repeat === "all") void loadAt(0);
  else setNow({ status: "paused", isPaused: true });
}

const shuffled = (n: number, first: number) => {
  const rest = [...Array(n).keys()].filter((i) => i !== first);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [first, ...rest];
};

async function loadAt(pos: number) {
  const a = getAdapter();
  const track = now.queue[now.order[pos]];
  if (!a || !track) return;
  const token = ++loadToken;
  lastUpdate = null;
  setNow({ pos, track, status: "loading", isPaused: true });
  setProgress({ position: 0, duration: progress.duration });
  rememberRecent(track.id);
  updateMediaSession(track);
  try {
    await a.load(track.id);
  } catch {
    if (token === loadToken) setNow({ status: "error" });
    return;
  }
  if (token !== loadToken) return;
  // 给嵌入播放器一点时间切换曲目
  setTimeout(() => token === loadToken && a.play(), 250);
  clearBlockTimer();
  // 2.5 秒还没开始播放 → 多半是浏览器拦截了自动播放，显示 Spotify 嵌入让用户点一下
  blockTimer = window.setTimeout(() => {
    if (token === loadToken && (!lastUpdate || lastUpdate.isPaused)) setNow({ status: "blocked" });
  }, 2800);
}

// ───────────────────── 对外的操作 ─────────────────────

export const music = {
  playQueue(queue: Track[], startIndex = 0, opts?: { shuffle?: boolean }) {
    if (!queue.length) return;
    const shuffle = opts?.shuffle ?? now.shuffle;
    const start = opts?.shuffle ? Math.floor(Math.random() * queue.length) : startIndex;
    const order = shuffle ? shuffled(queue.length, start) : [...queue.keys()];
    setNow({ queue, order, shuffle, playlistId: queue[0].playlistId });
    void loadAt(shuffle ? 0 : start);
  },
  toggle() {
    const a = getAdapter();
    if (!now.track) return;
    if (!a) return;
    if (now.isPaused) {
      if (lastUpdate && lastUpdate.duration > 0 && lastUpdate.position >= lastUpdate.duration - 900) void loadAt(now.pos);
      else a.resume();
    } else a.pause();
  },
  play() {
    if (now.isPaused) music.toggle();
  },
  pause() {
    if (!now.isPaused) getAdapter()?.pause();
  },
  next() {
    if (!now.track) return;
    if (now.pos < now.order.length - 1) void loadAt(now.pos + 1);
    else if (now.repeat !== "off" || now.order.length > 1) void loadAt(0);
  },
  prev() {
    if (!now.track) return;
    if (progress.position > 3000 || now.pos === 0) {
      getAdapter()?.seek(0);
      setProgress({ position: 0, duration: progress.duration });
    } else void loadAt(now.pos - 1);
  },
  seek(ms: number) {
    const a = getAdapter();
    if (!a || !now.track) return;
    const t = Math.max(0, Math.min(progress.duration || ms, ms));
    a.seek(t / 1000);
    setProgress({ position: t, duration: progress.duration });
  },
  skipBy(ms: number) {
    music.seek(progress.position + ms);
  },
  setShuffle(on: boolean) {
    if (!now.queue.length) return setNow({ shuffle: on });
    const current = now.order[now.pos];
    const order = on ? shuffled(now.queue.length, current) : [...now.queue.keys()];
    setNow({ shuffle: on, order, pos: on ? 0 : current });
  },
  cycleRepeat() {
    setNow({ repeat: now.repeat === "off" ? "all" : now.repeat === "all" ? "one" : "off" });
  },
  /** 用户点了 Spotify 浮窗后，取消“被拦截”状态 */
  dismissBlocked() {
    if (now.status === "blocked") setNow({ status: now.isPaused ? "paused" : "playing" });
  },
  getNow: () => now,
  getProgress: () => progress,
};

// ───────────────────── React hooks ─────────────────────

const subNow = (l: () => void) => {
  nowListeners.add(l);
  return () => nowListeners.delete(l);
};
const subProgress = (l: () => void) => {
  progressListeners.add(l);
  return () => progressListeners.delete(l);
};

export function useNowPlaying(): NowPlaying {
  return useSyncExternalStore(subNow, () => now, () => now);
}

export function useProgress(): Progress {
  return useSyncExternalStore(subProgress, () => progress, () => progress);
}

// ───────────────────── 最近播放 & Media Session ─────────────────────

const RECENT_KEY = "osp:music:recent";

function rememberRecent(id: string) {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...list.filter((x) => x !== id)].slice(0, 8)));
  } catch {
    /* ignore */
  }
}

export function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

let sessionWired = false;
function updateMediaSession(t: Track) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title,
      artist: t.artist,
      album: t.album ?? "",
      artwork: t.artwork ? [{ src: t.artwork, sizes: "300x300" }] : [],
    });
    if (!sessionWired) {
      sessionWired = true;
      navigator.mediaSession.setActionHandler("play", () => music.play());
      navigator.mediaSession.setActionHandler("pause", () => music.pause());
      navigator.mediaSession.setActionHandler("nexttrack", () => music.next());
      navigator.mediaSession.setActionHandler("previoustrack", () => music.prev());
      navigator.mediaSession.setActionHandler("seekto", (d) => d.seekTime !== undefined && music.seek(d.seekTime * 1000));
    }
  } catch {
    /* 部分浏览器不支持某些 action */
  }
}

export const formatTime = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
