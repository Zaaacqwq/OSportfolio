"use client";

import { useState, type ReactNode } from "react";
import { LuArrowUpRight, LuFolder, LuPin, LuSquarePen } from "react-icons/lu";
import { profile } from "@/config/profile";
import { FEATURED } from "@/config/projects";
import { useSystem } from "@/context/System";
import { openProject } from "@/lib/openProject";
import { Sidebar, SidebarItem, SidebarSection, Toolbar } from "../chrome/WindowChrome";

interface Note {
  id: string;
  title: string;
  date: string;
  preview: string;
  pinned?: boolean;
  body: () => ReactNode;
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[#c88a00] underline decoration-[#c88a00]/40 underline-offset-2 dark:text-[#ffd60a]">
      {children}
      <LuArrowUpRight className="text-[12px]" />
    </a>
  );
}

export default function Notes() {
  const sys = useSystem();
  const notes: Note[] = [
    {
      id: "welcome",
      title: "Welcome 👋",
      date: "Pinned",
      pinned: true,
      preview: "How to get around this Mac",
      body: () => (
        <>
          <h1>Welcome to my Mac</h1>
          <p>
            Hi, I&apos;m {profile.firstName}. This site is my portfolio dressed up as macOS — everything you see is a real, clickable app.
          </p>
          <h2>Things to try</h2>
          <ul>
            <li>
              Press <kbd>⌘K</kbd> (or <kbd>Ctrl K</kbd>) to open Spotlight and search for anything.
            </li>
            <li>Hover the notch at the top of the screen — it&apos;s a live demo of VibeIsland, my notch app.</li>
            <li>
              Open <b>Finder</b> to browse projects. Press <kbd>Space</kbd> on any project for Quick Look.
            </li>
            <li>Open <b>Simulator</b> to see my iPhone apps, or <b>Safari</b> for the live web projects.</li>
            <li>
              Try <code>neofetch</code> or <code>projects</code> in <b>Terminal</b>.
            </li>
            <li>Right‑click the desktop, flip on Dark Mode in Control Center, change the wallpaper…</li>
          </ul>
        </>
      ),
    },
    {
      id: "now",
      title: "Now",
      date: "Nov 2026",
      preview: profile.now[0],
      body: () => (
        <>
          <h1>What I&apos;m doing now</h1>
          <ul>
            {profile.now.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <h2>Featured projects</h2>
          <ul>
            {FEATURED.map((p) => (
              <li key={p.slug}>
                <button className="font-semibold text-[#c88a00] underline underline-offset-2 dark:text-[#ffd60a]" onClick={() => openProject(sys, p)}>
                  {p.name}
                </button>{" "}
                — {p.tagline}
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "blog",
      title: "Blog",
      date: "blog.zaaac.vip",
      preview: "Where I write longer things",
      body: () => (
        <>
          <h1>Blog</h1>
          <p>
            I write about the things I build and learn at <A href="https://blog.zaaac.vip/">blog.zaaac.vip</A>. The blog itself is one of my
            projects — a Spring Boot 3 + React app (<b>ZacBlog</b>).
          </p>
          <p>
            <button className="btn" onClick={() => sys.open("safari", { slug: "zacblog", nonce: Date.now() })}>
              Open in Safari
            </button>
          </p>
        </>
      ),
    },
    {
      id: "principles",
      title: "How I build",
      date: "Ideas",
      preview: profile.motto,
      body: () => (
        <>
          <h1>How I build</h1>
          <blockquote>{profile.motto}</blockquote>
          <ul>
            <li>Practical software that improves workflows, testing and knowledge access.</li>
            <li>Local‑first and private by default when it&apos;s about personal data (SwipeClean, Cents, Hearth).</li>
            <li>Self‑host what I can — my Mac mini runs betterUWWorks and my monitoring dashboard.</li>
            <li>Make AI agents useful in the tools I already use: the notch, the terminal, MCP.</li>
          </ul>
        </>
      ),
    },
    {
      id: "contact",
      title: "Contact",
      date: "Say hi",
      preview: profile.email,
      body: () => (
        <>
          <h1>Get in touch</h1>
          <ul>
            {profile.socials.map((s) => (
              <li key={s.key}>
                {s.label}: <A href={s.url}>{s.handle}</A>
              </li>
            ))}
          </ul>
        </>
      ),
    },
  ];
  const [sel, setSel] = useState("welcome");
  const note = notes.find((n) => n.id === sel)!;

  return (
    <div className="flex h-full">
      <Sidebar width={180}>
        <SidebarSection title="iCloud" />
        <SidebarItem icon={<LuFolder className="!text-[#e0a800]" />} label="Notes" active trailing={<span className="text-[11px] text-muted">{notes.length}</span>} />
      </Sidebar>
      <div className="hidden w-[230px] shrink-0 flex-col border-r border-sep sm:flex">
        <Toolbar title="Notes" subtitle={`${notes.length} notes`} />
        <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => setSel(n.id)}
              className={`mb-0.5 block w-full rounded-[8px] px-3 py-2 text-left ${sel === n.id ? "bg-[#ffd60a]/70 dark:bg-[#ffd60a]/35" : "hover:bg-hover"}`}
            >
              <div className="flex items-center gap-1 truncate text-[13px] font-semibold">
                {n.pinned && <LuPin className="shrink-0 text-[11px] text-[#e0a800]" />}
                {n.title}
              </div>
              <div className="truncate text-[12px] text-fg-2">
                <span className="text-fg">{n.date}</span> {n.preview}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <Toolbar>
          <div className="tb-capsule">
            <button className="tb-btn" aria-label="New note" disabled>
              <LuSquarePen />
            </button>
          </div>
        </Toolbar>
        <div className="notes-body scroll-area min-h-0 flex-1 overflow-y-auto px-10 pb-10 text-[14.5px] leading-relaxed">
          <p className="mb-4 text-center text-[11.5px] text-muted">{note.date}</p>
          {note.body()}
        </div>
      </div>
      <style>{`
        .notes-body h1{font-family:var(--font-display);font-size:26px;font-weight:700;margin:0 0 10px;letter-spacing:-.01em}
        .notes-body h2{font-size:17px;font-weight:650;margin:18px 0 6px}
        .notes-body p{margin:8px 0;color:var(--fg-2)}
        .notes-body ul{margin:6px 0;padding-left:20px;list-style:disc;color:var(--fg-2)}
        .notes-body li{margin:4px 0}
        .notes-body kbd,.notes-body code{font-family:var(--font-mono);font-size:12px;padding:1px 6px;border-radius:5px;background:var(--hover);box-shadow:inset 0 0 0 .5px var(--separator);color:var(--fg)}
        .notes-body blockquote{border-left:3px solid #ffd60a;padding:4px 12px;margin:8px 0;font-style:italic;color:var(--fg)}
      `}</style>
    </div>
  );
}
