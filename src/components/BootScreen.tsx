"use client";

import { useEffect, useState } from "react";
import { profile } from "@/config/profile";

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + 4 + Math.random() * 10);
      setProgress(p);
      if (p >= 100) {
        clearInterval(t);
        setTimeout(() => setFading(true), 200);
        setTimeout(onDone, 700);
      }
    }, 90);
    return () => clearInterval(t);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[10000] flex cursor-pointer flex-col items-center justify-center bg-black transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
      onClick={onDone}
      title="Click to skip"
    >
      <div className="boot-logo mb-14 grid h-24 w-24 place-items-center rounded-[28%] text-4xl font-bold text-white">
        {profile.initials}
      </div>
      <div className="h-1.5 w-52 overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-white transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
