"use client";

/**
 * 播放器适配层：真实环境用 Spotify iFrame API，测试时（URL 带 ?mockPlayer）用模拟实现。
 */

export interface PlaybackUpdate {
  isPaused: boolean;
  isBuffering: boolean;
  /** 毫秒 */
  position: number;
  /** 毫秒 */
  duration: number;
}

export interface PlayerAdapter {
  load(trackId: string): Promise<void>;
  play(): void;
  pause(): void;
  resume(): void;
  seek(seconds: number): void;
  onUpdate(cb: (u: PlaybackUpdate) => void): void;
  destroy(): void;
}

// ───────────────────────── Spotify ─────────────────────────

interface SpotifyController {
  loadUri(uri: string, preferVideo?: boolean, startAt?: number): void;
  play(): void;
  pause(): void;
  resume(): void;
  togglePlay(): void;
  seek(seconds: number): void;
  destroy(): void;
  addListener(event: string, cb: (e: { data: Record<string, unknown> }) => void): void;
}

interface SpotifyIFrameAPI {
  createController(el: HTMLElement, opts: { uri: string; width?: string | number; height?: string | number }, cb: (c: SpotifyController) => void): void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
    __spotifyApi?: Promise<SpotifyIFrameAPI>;
  }
}

function loadSpotifyApi(): Promise<SpotifyIFrameAPI> {
  if (window.__spotifyApi) return window.__spotifyApi;
  window.__spotifyApi = new Promise((resolve, reject) => {
    window.onSpotifyIframeApiReady = (api) => resolve(api);
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.onerror = () => reject(new Error("Could not load Spotify"));
    document.body.appendChild(s);
  });
  return window.__spotifyApi;
}

export function createSpotifyAdapter(mount: HTMLElement): PlayerAdapter {
  let controller: SpotifyController | null = null;
  let listener: ((u: PlaybackUpdate) => void) | null = null;
  let creating: Promise<void> | null = null;

  const ensure = async (uri: string) => {
    if (controller) return;
    if (!creating) {
      creating = loadSpotifyApi().then(
        (api) =>
          new Promise<void>((resolve) => {
            const el = document.createElement("div");
            mount.appendChild(el);
            api.createController(el, { uri, width: "100%", height: 152 }, (c) => {
              controller = c;
              c.addListener("playback_update", (e) => {
                const d = e.data as { isPaused?: boolean; isBuffering?: boolean; position?: number; duration?: number };
                listener?.({
                  isPaused: !!d.isPaused,
                  isBuffering: !!d.isBuffering,
                  position: Number(d.position) || 0,
                  duration: Number(d.duration) || 0,
                });
              });
              c.addListener("ready", () => resolve());
              // 某些版本不会触发 ready，兜底
              setTimeout(resolve, 2500);
            });
          }),
      );
    }
    await creating;
  };

  return {
    async load(trackId) {
      const uri = `spotify:track:${trackId}`;
      if (!controller) await ensure(uri);
      else controller.loadUri(uri);
    },
    play: () => controller?.play(),
    pause: () => controller?.pause(),
    resume: () => controller?.resume(),
    seek: (s) => controller?.seek(s),
    onUpdate: (cb) => (listener = cb),
    destroy: () => controller?.destroy(),
  };
}

// ───────────────────────── 测试用模拟播放器 ─────────────────────────

/** ?mockPlayer —— 每首歌 12 秒；?mockPlayer=blocked 模拟浏览器拦截自动播放 */
export function createMockAdapter(mode: string | null): PlayerAdapter {
  let listener: ((u: PlaybackUpdate) => void) | null = null;
  let position = 0;
  let paused = true;
  let timer: number | null = null;
  let blocked = mode === "blocked";
  const duration = 12_000;

  const emit = () => listener?.({ isPaused: paused, isBuffering: false, position, duration });
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
  const start = () => {
    stop();
    timer = window.setInterval(() => {
      position = Math.min(duration, position + 500);
      if (position >= duration) {
        paused = true;
        stop();
      }
      emit();
    }, 500);
  };
  const play = () => {
    if (blocked) return;
    paused = false;
    start();
    emit();
  };

  // 测试可以调用 window.__mockUnblock() 模拟用户点了一下嵌入播放器
  (window as unknown as { __mockUnblock?: () => void }).__mockUnblock = () => {
    blocked = false;
    play();
  };

  return {
    async load() {
      stop();
      position = 0;
      paused = true;
      emit();
    },
    play,
    resume: play,
    pause() {
      paused = true;
      stop();
      emit();
    },
    seek(s) {
      position = Math.max(0, Math.min(duration, s * 1000));
      emit();
    },
    onUpdate: (cb) => (listener = cb),
    destroy: stop,
  };
}
