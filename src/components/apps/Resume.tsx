"use client";

import { LuDownload } from "react-icons/lu";
import { profile } from "@/config/profile";

/** 如果 profile.resumePdf 有值则直接内嵌 PDF，否则根据配置渲染一份在线简历 */
export default function Resume() {
  if (profile.resumePdf) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-10 shrink-0 items-center justify-end border-b border-black/5 px-3">
          <a
            href={profile.resumePdf}
            download
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] hover:bg-black/5"
          >
            <LuDownload /> Download
          </a>
        </div>
        <iframe src={profile.resumePdf} title="Resume" className="min-h-0 flex-1 bg-white" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#8a8a8e]/30 p-3 sm:p-6">
      <div className="mx-auto max-w-[620px] bg-white p-7 text-[13px] leading-relaxed text-[#222] shadow-xl sm:p-10">
        <header className="border-b border-black/10 pb-4">
          <h1 className="text-[26px] font-bold tracking-tight">{profile.name}</h1>
          <p className="text-[14px] text-black/60">{profile.title}</p>
          <p className="mt-1 text-[12px] text-black/50">
            {profile.location} · {profile.email}
            {profile.socials
              .filter((s) => s.key === "github" || s.key === "linkedin")
              .map((s) => ` · ${s.url.replace(/^https?:\/\/(www\.)?/, "")}`)
              .join("")}
          </p>
        </header>

        <Section title="Summary">
          <p>{profile.bio[0]}</p>
        </Section>

        <Section title="Experience">
          {profile.experience.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex flex-wrap justify-between gap-x-4">
                <strong>
                  {e.role}, {e.company}
                </strong>
                <span className="text-black/50">{e.period}</span>
              </div>
              <p className="text-black/70">{e.summary}</p>
            </div>
          ))}
        </Section>

        <Section title="Projects">
          {profile.projects.map((p) => (
            <div key={p.name} className="mb-2">
              <strong>{p.name}</strong> <span className="text-black/50">— {p.tech.join(", ")}</span>
              <p className="text-black/70">{p.tagline}</p>
            </div>
          ))}
        </Section>

        <Section title="Skills">
          {Object.entries(profile.skills).map(([k, v]) => (
            <p key={k}>
              <strong>{k}:</strong> {v.join(", ")}
            </p>
          ))}
        </Section>

        <Section title="Education">
          {profile.education.map((e, i) => (
            <div key={i} className="flex flex-wrap justify-between gap-x-4">
              <span>
                <strong>{e.school}</strong> — {e.degree}
              </span>
              <span className="text-black/50">{e.period}</span>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#2f6fed]">{title}</h2>
      {children}
    </section>
  );
}
