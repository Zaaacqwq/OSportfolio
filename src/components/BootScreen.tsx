"use client";

import { useEffect, useRef, useState } from "react";
import { ZLogo } from "./icons/ZLogo";

export function BootScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const finish = () => {
      if (done.current) return;
      done.current = true;
      setFading(true);
      setTimeout(onDone, 500);
    };
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + 3 + Math.random() * 9);
      setProgress(p);
      if (p >= 100) {
        clearInterval(t);
        setTimeout(finish, 250);
      }
    }, 80);
    const skip = () => {
      clearInterval(t);
      finish();
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      clearInterval(t);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[10001] flex flex-col items-center justify-center bg-black text-white transition-opacity duration-500 ${fading ? "opacity-0" : "opacity-100"}`}
    >
      <ZLogo size={84} className="mb-20 text-white" />
      <div className="h-[5px] w-[200px] overflow-hidden rounded-full bg-white/25">
        <div className="h-full rounded-full bg-white transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
