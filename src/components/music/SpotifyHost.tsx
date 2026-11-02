"use client";

import { useEffect, useRef } from "react";
import { LuX } from "react-icons/lu";
import { createMockAdapter, createSpotifyAdapter } from "@/lib/music/adapter";
import { music, registerAdapterFactory, useNowPlaying } from "@/lib/music/store";

/**
 * 常驻的 Spotify 嵌入播放器。
 * 平时藏在屏幕外（保持可见以便出声）；浏览器拦截自动播放时，变成右下角的浮窗让访客点一下。
 */
export function SpotifyHost() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { status } = useNowPlaying();
  const blocked = status === "blocked";

  useEffect(() => {
    const mock = new URLSearchParams(window.location.search).get("mockPlayer");
    registerAdapterFactory(() =>
      mock !== null ? createMockAdapter(mock) : createSpotifyAdapter(mountRef.current ?? document.body),
    );
  }, []);

  return (
    <div
      className={
        blocked
          ? "glass slide-down fixed bottom-[96px] right-4 z-[9350] w-[340px] rounded-[22px] p-3 text-fg"
          : "pointer-events-none fixed bottom-0 left-0 z-[-1] h-px w-px overflow-hidden opacity-[0.01]"
      }
      aria-hidden={!blocked}
      data-spotify-host={blocked ? "visible" : "hidden"}
    >
      {blocked && (
        <div className="mb-2 flex items-center gap-2 px-1">
          <span className="text-[13px] font-semibold">Tap play in Spotify to start</span>
          <button aria-label="Close" className="ml-auto grid h-6 w-6 place-items-center rounded-full hover:bg-hover" onClick={music.dismissBlocked}>
            <LuX />
          </button>
        </div>
      )}
      <div ref={mountRef} className={blocked ? "overflow-hidden rounded-[12px]" : "h-[152px] w-[300px]"} />
      {blocked && (
        <p className="mt-2 px-1 text-[11.5px] text-muted">
          Your browser blocked autoplay. After one tap, the controls in Music, the notch and Control Center work normally.
        </p>
      )}
    </div>
  );
}
