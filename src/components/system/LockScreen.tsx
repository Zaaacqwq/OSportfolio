"use client";

import { useEffect, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { profile } from "@/config/profile";
import { useClock } from "../MenuBar";
import { Avatar } from "../Avatar";

/** macOS 风格锁屏：大时钟 + 头像，点击或按任意键进入 */
export function LockScreen({ background, onUnlock }: { background: string; onUnlock: () => void }) {
  const now = useClock(1000);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const go = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return;
      unlock();
    };
    window.addEventListener("keydown", go);
    return () => window.removeEventListener("keydown", go);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unlock = () => {
    setLeaving(true);
    setTimeout(onUnlock, 550);
  };

  const date = now?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const time = now?.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, "");

  return (
    <div
      className={`fixed inset-0 z-[10000] flex cursor-default flex-col items-center text-white ${leaving ? "lock-leave" : ""}`}
      style={{ background }}
      onClick={unlock}
      role="button"
      aria-label="Unlock"
    >
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
      <div className="relative mt-[9vh] text-center">
        <div className="text-[22px] font-semibold opacity-90 drop-shadow">{date}</div>
        <div className="lock-clock text-[112px] leading-none sm:text-[150px]">{time}</div>
      </div>

      <div className="relative mt-auto mb-[9vh] flex flex-col items-center">
        <Avatar size={72} className="ring-2 ring-white/40 shadow-2xl" />
        <div className="mt-3 text-[17px] font-semibold drop-shadow">{profile.name}</div>
        <div className="mt-3 flex h-[34px] w-[200px] items-center rounded-full bg-white/25 pl-4 pr-1 text-[13px] text-white/80 shadow-inner backdrop-blur-xl">
          Click to enter
          <span className="ml-auto grid h-[26px] w-[26px] place-items-center rounded-full bg-white/30">
            <LuArrowRight />
          </span>
        </div>
        <div className="mt-4 text-[12px] text-white/70">Press any key or click anywhere</div>
      </div>
    </div>
  );
}
