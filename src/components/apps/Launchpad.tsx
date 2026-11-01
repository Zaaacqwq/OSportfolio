"use client";

import { profile } from "@/config/profile";
import { AppIcon } from "@/components/AppIcon";
import { socialIconSpec } from "@/components/SocialIcon";
import { useWindowManager } from "@/context/WindowManager";
import { APPS, type AppId } from "@/lib/apps";

const INTERNAL: AppId[] = ["about", "projects", "terminal", "resume", "contact", "settings"];

export default function Launchpad() {
  const { open } = useWindowManager();
  return (
    <div className="p-5 sm:p-7">
      <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-white/45">Find me on</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-y-5">
        {profile.socials.map((s) => (
          <a
            key={s.key + s.url}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col items-center gap-2"
          >
            <span className="transition-transform group-hover:scale-105 group-active:scale-95">
              <AppIcon icon={socialIconSpec(s.key)} size={64} />
            </span>
            <span className="text-[12.5px] text-white/90">{s.label}</span>
          </a>
        ))}
      </div>

      <h3 className="mb-3 mt-8 text-[12px] font-semibold uppercase tracking-wide text-white/45">Apps</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-y-5">
        {INTERNAL.map((id) => (
          <button key={id} onClick={() => open(id)} className="group flex flex-col items-center gap-2">
            <span className="transition-transform group-hover:scale-105 group-active:scale-95">
              <AppIcon icon={APPS[id].icon} size={64} />
            </span>
            <span className="text-[12.5px] text-white/90">{APPS[id].title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
