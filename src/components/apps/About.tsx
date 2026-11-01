"use client";

import { useState } from "react";
import { LuBriefcase, LuCode, LuGraduationCap, LuMapPin, LuUserRound } from "react-icons/lu";
import { profile } from "@/config/profile";
import { Avatar } from "@/components/Avatar";
import { SocialIcon } from "@/components/SocialIcon";
import { useWindowManager } from "@/context/WindowManager";

const TABS = [
  { id: "about", label: "About", icon: LuUserRound },
  { id: "skills", label: "Skills", icon: LuCode },
  { id: "experience", label: "Experience", icon: LuBriefcase },
  { id: "education", label: "Education", icon: LuGraduationCap },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default function About() {
  const [tab, setTab] = useState<Tab>("about");
  const { open } = useWindowManager();

  return (
    <div className="flex h-full flex-col sm:flex-row">
      {/* 侧边栏 */}
      <aside className="flex shrink-0 gap-1 overflow-x-auto border-b border-black/5 bg-black/[0.03] p-2 sm:w-44 sm:flex-col sm:border-b-0 sm:border-r">
        <p className="hidden px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-black/40 sm:block">
          Favorites
        </p>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] ${
              tab === id ? "bg-black/10 font-medium" : "hover:bg-black/5"
            }`}
          >
            <Icon className="text-[15px] text-[#2f6fed]" />
            {label}
          </button>
        ))}
      </aside>

      <div className="min-h-0 flex-1 overflow-auto p-5 sm:p-7">
        {tab === "about" && (
          <div>
            <div className="flex items-center gap-4">
              <Avatar size={76} className="shadow-lg" />
              <div>
                <h2 className="text-2xl font-bold">{profile.name}</h2>
                <p className="text-[15px] text-black/60">{profile.title}</p>
                <p className="mt-1 flex items-center gap-1 text-[13px] text-black/50">
                  <LuMapPin /> {profile.location}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-[14.5px] leading-relaxed text-black/80">
              {profile.bio.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.socials.map((s) => (
                <a
                  key={s.key}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[13px] shadow-sm hover:bg-black/[0.03]"
                >
                  <SocialIcon k={s.key} /> {s.label}
                </a>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => open("projects")}
                className="rounded-lg bg-[#2f6fed] px-4 py-2 text-[13px] font-medium text-white shadow hover:brightness-110"
              >
                View Projects
              </button>
              <button
                onClick={() => open("resume")}
                className="rounded-lg border border-black/10 bg-white px-4 py-2 text-[13px] font-medium shadow-sm hover:bg-black/[0.03]"
              >
                Resume
              </button>
            </div>
          </div>
        )}

        {tab === "skills" && (
          <div className="space-y-5">
            {Object.entries(profile.skills).map(([group, items]) => (
              <section key={group}>
                <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-black/45">{group}</h3>
                <div className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <span key={s} className="rounded-md border border-black/10 bg-white px-2.5 py-1 text-[13px] shadow-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {tab === "experience" && (
          <ol className="relative ml-2 border-l border-black/10">
            {profile.experience.map((e, i) => (
              <li key={i} className="mb-6 ml-5">
                <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-[#2f6fed] ring-4 ring-[#2f6fed]/15" />
                <p className="text-[12px] text-black/45">{e.period}</p>
                <h3 className="text-[15px] font-semibold">
                  {e.role} <span className="font-normal text-black/50">@ {e.company}</span>
                </h3>
                <p className="mt-1 text-[14px] text-black/70">{e.summary}</p>
              </li>
            ))}
          </ol>
        )}

        {tab === "education" && (
          <div className="space-y-3">
            {profile.education.map((e, i) => (
              <div key={i} className="rounded-xl border border-black/10 bg-white p-4 shadow-sm">
                <h3 className="text-[15px] font-semibold">{e.school}</h3>
                <p className="text-[14px] text-black/70">{e.degree}</p>
                <p className="text-[12px] text-black/45">{e.period}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
