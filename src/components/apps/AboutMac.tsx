"use client";

import { profile } from "@/config/profile";
import { PROJECTS } from "@/config/projects";
import { useSystem } from "@/context/System";
import { useDragRegion, TrafficLights } from "../chrome/WindowChrome";
import { SystemIcon } from "../icons/AppIcons";

/** “关于本机”——一份有趣的个人规格表 */
export default function AboutMac() {
  const sys = useSystem();
  const drag = useDragRegion();
  const rows: [string, string][] = [
    ["Chip", "Computer Engineering · UWaterloo"],
    ["Memory", `${profile.stats.linesOfCode} lines of code`],
    ["Startup disk", `${PROJECTS.length} projects`],
    ["Currently", `${profile.role.replace(" Co‑op", "")} @ ${profile.company.replace("Sony ", "")}`],
    ["Serial number", profile.githubUser],
    ["macOS", "zacOS Tahoe 26"],
  ];
  return (
    <div className="flex h-full flex-col items-center px-6 pb-6 text-center" {...drag}>
      <div className="flex h-[40px] w-full items-center">
        <TrafficLights />
      </div>
      <SystemIcon name="aboutmac" size={104} className="mt-2" />
      <h1 className="mt-4 font-display text-[24px] font-bold tracking-tight">{profile.name}</h1>
      <p className="text-[12px] text-muted">Class of 2028</p>
      <dl className="mt-5 w-full space-y-1.5 text-[12px]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[96px_1fr] gap-3 text-left">
            <dt className="text-right font-semibold">{k}</dt>
            <dd className="text-fg-2">{v}</dd>
          </div>
        ))}
      </dl>
      <button className="btn mt-auto" onClick={() => sys.open("about")}>
        More Info…
      </button>
      <p className="mt-3 text-[10px] text-muted">™ and © 2026 {profile.name}. All rights reserved.</p>
    </div>
  );
}
