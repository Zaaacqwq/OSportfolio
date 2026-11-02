"use client";

import { LuDownload, LuMinus, LuPlus, LuShare } from "react-icons/lu";
import { useState } from "react";
import { profile } from "@/config/profile";
import { FEATURED } from "@/config/projects";
import { Toolbar } from "../chrome/WindowChrome";

/** Preview：有 profile.resumePdf 时内嵌 PDF，否则根据资料生成一份在线简历 */
export default function Preview() {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="flex h-full flex-col">
      <Toolbar lights title="Resume.pdf" subtitle={profile.resumePdf ? "PDF Document" : "1 page"}>
        {!profile.resumePdf && (
          <div className="tb-capsule">
            <button className="tb-btn" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}>
              <LuMinus />
            </button>
            <button className="tb-btn" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}>
              <LuPlus />
            </button>
          </div>
        )}
        <div className="tb-capsule">
          {profile.resumePdf ? (
            <a className="tb-btn" href={profile.resumePdf} download aria-label="Download">
              <LuDownload />
            </a>
          ) : (
            <button className="tb-btn" aria-label="Print" onClick={() => window.print()}>
              <LuShare />
            </button>
          )}
        </div>
      </Toolbar>
      {profile.resumePdf ? (
        <iframe src={profile.resumePdf} title="Resume" className="min-h-0 flex-1 border-t border-sep bg-white" />
      ) : (
        <div className="scroll-area min-h-0 flex-1 overflow-auto border-t border-sep bg-[#8e8e93]/25 p-6">
          <div
            className="mx-auto w-[612px] origin-top bg-white px-12 py-10 text-[11.5px] leading-[1.5] text-[#1d1d1f] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
            style={{ transform: `scale(${zoom})`, marginBottom: `${(zoom - 1) * 790}px` }}
          >
            <header className="text-center">
              <h1 className="text-[24px] font-bold tracking-tight">{profile.name}</h1>
              <p className="mt-0.5 text-[11px] text-black/60">
                {profile.email} · linkedin.com/in/zaaac · github.com/{profile.githubUser} · {profile.location}
              </p>
            </header>
            <Section title="Education">
              {profile.education.map((e) => (
                <div key={e.school} className="flex justify-between">
                  <span>
                    <b>{e.school}</b> — {e.degree}
                  </span>
                  <span className="text-black/60">{e.period}</span>
                </div>
              ))}
            </Section>
            <Section title="Experience">
              {profile.experience.map((e) => (
                <div key={e.company}>
                  <div className="flex justify-between">
                    <b>
                      {e.company} — {e.role}
                    </b>
                    <span className="text-black/60">{e.period}</span>
                  </div>
                  <ul className="mt-0.5 list-disc pl-4">
                    {e.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Section>
            <Section title="Projects">
              {FEATURED.map((p) => (
                <div key={p.slug} className="mb-1.5">
                  <div className="flex justify-between">
                    <span>
                      <b>{p.name}</b> <span className="text-black/60">| {p.tech.slice(0, 4).join(", ")}</span>
                    </span>
                    <span className="text-black/60">{p.year}</span>
                  </div>
                  <p className="text-black/80">{p.tagline} {p.description[0].split(". ")[0]}.</p>
                </div>
              ))}
            </Section>
            <Section title="Skills">
              {Object.entries(profile.skills).map(([k, v]) => (
                <p key={k}>
                  <b>{k}:</b> {v.join(", ")}
                </p>
              ))}
            </Section>
            <p className="mt-6 text-center text-[9.5px] text-black/40">Generated from this site&apos;s data · ask me for the PDF version</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="mb-1 border-b border-black/70 text-[12px] font-bold uppercase tracking-[0.08em]">{title}</h2>
      {children}
    </section>
  );
}
