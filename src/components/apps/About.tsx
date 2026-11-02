"use client";

import { LuBriefcase, LuGraduationCap, LuMail, LuMapPin, LuMessageCircle, LuPhone, LuVideo } from "react-icons/lu";
import { profile } from "@/config/profile";
import { FEATURED } from "@/config/projects";
import { useSystem } from "@/context/System";
import { openProject } from "@/lib/openProject";
import { Avatar } from "../Avatar";
import { Sidebar, SidebarItem, SidebarSection, Toolbar } from "../chrome/WindowChrome";
import { ProjectIcon } from "../icons/ProjectIcon";
import { SocialIcon } from "../SocialIcon";

/** “通讯录”风格的个人名片 */
export default function About() {
  const sys = useSystem();
  const actions = [
    { icon: LuMessageCircle, label: "message", onClick: () => sys.open("mail") },
    { icon: LuPhone, label: "call", disabled: true },
    { icon: LuVideo, label: "video", disabled: true },
    { icon: LuMail, label: "mail", onClick: () => (window.location.href = `mailto:${profile.email}`) },
  ];
  return (
    <div className="flex h-full">
      <Sidebar width={200}>
        <SidebarSection title="On My Mac" />
        <SidebarItem icon={<Avatar size={18} />} label={profile.name} active />
        <SidebarSection title="Featured work" />
        {FEATURED.map((p) => (
          <SidebarItem key={p.slug} icon={<ProjectIcon project={p} size={18} />} label={p.name} onClick={() => openProject(sys, p)} />
        ))}
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <Toolbar />
        <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-6 pb-8 sm:px-10">
          <div className="flex flex-col items-center text-center">
            <Avatar size={112} className="shadow-xl" />
            <h1 className="mt-3 font-display text-[28px] font-bold tracking-tight">{profile.name}</h1>
            <p className="text-[14px] text-fg-2">{profile.title}</p>
            <p className="mt-1 flex items-center gap-1 text-[12.5px] text-muted">
              <LuMapPin /> {profile.location}
            </p>
            <div className="mt-4 flex gap-3">
              {actions.map(({ icon: Icon, label, onClick, disabled }) => (
                <button key={label} disabled={disabled} onClick={onClick} className="flex w-[64px] flex-col items-center gap-1 rounded-[10px] bg-win-alt py-2 text-accent shadow-[inset_0_0_0_0.5px_var(--separator)] disabled:opacity-40">
                  <Icon className="text-[18px]" />
                  <span className="text-[11px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-[560px] space-y-4">
            <div className="card divide-y divide-[var(--separator)] text-[13px]">
              {profile.socials.map((s) => (
                <a key={s.key} href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2.5 hover:bg-hover">
                  <span className="w-[70px] text-[12px] text-muted">{s.label.toLowerCase()}</span>
                  <SocialIcon k={s.key} className="text-fg-2" />
                  <span className="text-accent">{s.handle}</span>
                </a>
              ))}
            </div>

            <div className="card p-4 text-[13.5px] leading-relaxed text-fg-2">
              <div className="mb-1 text-[12px] text-muted">note</div>
              {profile.bio.map((b, i) => (
                <p key={i} className={i ? "mt-2" : ""}>
                  {b}
                </p>
              ))}
              <p className="mt-3 italic text-fg">“{profile.motto}”</p>
            </div>

            <div className="card p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                <LuBriefcase /> experience
              </div>
              {profile.experience.map((e) => (
                <div key={e.company}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <span className="text-[14px] font-semibold">
                      {e.role} · {e.company}
                    </span>
                    <span className="text-[12px] text-muted">{e.period}</span>
                  </div>
                  <ul className="mt-1.5 space-y-1 text-[13px] text-fg-2">
                    {e.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-current" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="card p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[12px] text-muted">
                <LuGraduationCap /> education
              </div>
              {profile.education.map((e) => (
                <div key={e.school} className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="text-[14px] font-semibold">
                    {e.school} <span className="font-normal text-fg-2">— {e.degree}</span>
                  </span>
                  <span className="text-[12px] text-muted">{e.period}</span>
                </div>
              ))}
            </div>

            <div className="card p-4">
              <div className="mb-2 text-[12px] text-muted">skills</div>
              <div className="space-y-2.5">
                {Object.entries(profile.skills).map(([g, list]) => (
                  <div key={g}>
                    <div className="mb-1 text-[12px] font-semibold">{g}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {list.map((s) => (
                        <span key={s} className="chip !bg-win">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
