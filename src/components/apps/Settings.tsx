"use client";

import { LuCheck } from "react-icons/lu";
import { useWindowManager } from "@/context/WindowManager";
import { WALLPAPERS } from "@/lib/wallpapers";

export default function Settings() {
  const { wallpaper, setWallpaper } = useWindowManager();
  return (
    <div className="p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Wallpaper</h2>
      <p className="mb-4 text-[13px] text-black/50">Pick a desktop background. Your choice is remembered.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {WALLPAPERS.map((w) => {
          const active = w.id === wallpaper;
          return (
            <button key={w.id} onClick={() => setWallpaper(w.id)} className="group text-left">
              <div
                className={`relative aspect-[16/10] rounded-lg shadow-sm ring-2 transition ${
                  active ? "ring-[#2f6fed]" : "ring-transparent group-hover:ring-black/15"
                }`}
                style={{ background: w.background }}
              >
                {active && (
                  <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[#2f6fed] text-[12px] text-white">
                    <LuCheck />
                  </span>
                )}
              </div>
              <span className="mt-1.5 block text-[12.5px] font-medium">{w.name}</span>
            </button>
          );
        })}
      </div>

      <h2 className="mt-7 text-lg font-semibold">About this site</h2>
      <p className="mt-1 text-[13px] leading-relaxed text-black/60">
        Built with Next.js, TypeScript and Tailwind CSS. Drag windows by their title bar, resize from any edge,
        double‑click a title bar to zoom, and try the Terminal for a few hidden commands.
      </p>
    </div>
  );
}
