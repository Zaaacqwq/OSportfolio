"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { profile } from "@/config/profile";
import { useWindowManager } from "@/context/WindowManager";
import { APPS, type AppId } from "@/lib/apps";
import { WALLPAPERS } from "@/lib/wallpapers";

interface Line {
  id: number;
  content: ReactNode;
}

const user = profile.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "") || "guest";
const host = "portfolio";
const FILES: Record<string, string> = {
  "about.txt": profile.bio.join("\n\n"),
  "contact.txt": [`email: ${profile.email}`, ...profile.socials.map((s) => `${s.label.toLowerCase()}: ${s.url}`)].join("\n"),
  "skills.txt": Object.entries(profile.skills)
    .map(([k, v]) => `${k}: ${v.join(", ")}`)
    .join("\n"),
};

const COMMANDS = [
  "help",
  "about",
  "whoami",
  "skills",
  "projects",
  "experience",
  "contact",
  "socials",
  "open",
  "ls",
  "cat",
  "wallpaper",
  "date",
  "echo",
  "clear",
  "sudo",
  "exit",
];

export default function Terminal() {
  const { open, close, setWallpaper } = useWindowManager();
  const [lines, setLines] = useState<Line[]>(() => [
    { id: 0, content: <span className="text-white/50">Last login: {new Date().toDateString()} on ttys000</span> },
    {
      id: 1,
      content: (
        <span>
          Welcome! Type <Cmd>help</Cmd> to see what you can do.
        </span>
      ),
    },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const idRef = useRef(2);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const push = (...content: ReactNode[]) =>
    setLines((ls) => [...ls, ...content.map((c) => ({ id: idRef.current++, content: c }))]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const run = (raw: string) => {
    const cmdline = raw.trim();
    push(<Prompt>{raw}</Prompt>);
    if (!cmdline) return;
    setHistory((h) => [cmdline, ...h]);
    const [cmd, ...args] = cmdline.split(/\s+/);
    const arg = args.join(" ");

    switch (cmd.toLowerCase()) {
      case "help":
        push(
          <div className="grid grid-cols-[110px_1fr] gap-x-4">
            {[
              ["about", "who I am"],
              ["skills", "what I work with"],
              ["projects", "things I've built"],
              ["experience", "where I've worked"],
              ["contact", "how to reach me"],
              ["open <app>", `open an app (${Object.keys(APPS).filter((k) => APPS[k as AppId].component).join(", ")})`],
              ["ls / cat", "browse files"],
              ["wallpaper", "list or set wallpapers"],
              ["clear", "clear the screen"],
            ].map(([c, d]) => (
              <div key={c} className="contents">
                <Cmd>{c}</Cmd>
                <span className="text-white/70">{d}</span>
              </div>
            ))}
          </div>,
        );
        break;
      case "about":
      case "whoami":
        push(
          <span>
            <span className="font-bold text-[#7ee787]">{profile.name}</span> — {profile.title}, {profile.location}
          </span>,
          ...(cmd === "about" ? profile.bio.map((b) => <span className="text-white/80">{b}</span>) : []),
        );
        break;
      case "skills":
        Object.entries(profile.skills).forEach(([k, v]) =>
          push(
            <span>
              <span className="text-[#79c0ff]">{k.padEnd(10, " ")}</span> {v.join(" · ")}
            </span>,
          ),
        );
        break;
      case "projects":
        profile.projects.forEach((p, i) =>
          push(
            <span>
              <span className="text-white/40">{String(i + 1).padStart(2, "0")}</span>{" "}
              <span className="text-[#ffa657]">{p.name}</span> — {p.tagline}
            </span>,
          ),
        );
        push(
          <span className="text-white/50">
            Tip: <Cmd>open projects</Cmd> to browse them in Finder.
          </span>,
        );
        break;
      case "experience":
        profile.experience.forEach((e) =>
          push(
            <span>
              <span className="text-white/40">{e.period}</span> <span className="text-[#d2a8ff]">{e.role}</span> @ {e.company}
            </span>,
          ),
        );
        break;
      case "contact":
      case "socials":
        push(
          <span>
            email{"    "}
            <a className="text-[#79c0ff] underline" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </span>,
          ...profile.socials
            .filter((s) => s.key !== "email")
            .map((s) => (
              <span>
                {s.label.toLowerCase().padEnd(9, " ")}
                <a className="text-[#79c0ff] underline" href={s.url} target="_blank" rel="noreferrer">
                  {s.url}
                </a>
              </span>
            )),
        );
        break;
      case "open": {
        const target = (Object.keys(APPS) as AppId[]).find(
          (k) => k === arg.toLowerCase() || APPS[k].title.toLowerCase() === arg.toLowerCase(),
        );
        if (!target) push(<Err>open: no such app: {arg || "(none)"}</Err>);
        else {
          open(target);
          push(<span className="text-white/60">Opening {APPS[target].title}…</span>);
        }
        break;
      }
      case "ls":
        push(
          <span className="flex flex-wrap gap-x-6">
            {Object.keys(FILES).map((f) => (
              <span key={f}>{f}</span>
            ))}
            <span className="text-[#79c0ff]">projects/</span>
          </span>,
        );
        break;
      case "cat":
        if (FILES[arg]) push(<pre className="whitespace-pre-wrap">{FILES[arg]}</pre>);
        else push(<Err>cat: {arg || "(none)"}: No such file or directory</Err>);
        break;
      case "wallpaper": {
        if (!arg) {
          push(<span>Available: {WALLPAPERS.map((w) => w.id).join(", ")}</span>);
          push(<span className="text-white/50">Usage: wallpaper &lt;name&gt;</span>);
        } else {
          const w = WALLPAPERS.find((x) => x.id === arg.toLowerCase());
          if (w) {
            setWallpaper(w.id);
            push(<span>Wallpaper set to {w.name}.</span>);
          } else push(<Err>wallpaper: unknown wallpaper “{arg}”</Err>);
        }
        break;
      }
      case "date":
        push(<span>{new Date().toString()}</span>);
        break;
      case "echo":
        push(<span>{arg}</span>);
        break;
      case "clear":
        setLines([]);
        break;
      case "sudo":
        push(<Err>Nice try. This incident will be reported. 🚨</Err>);
        break;
      case "exit":
        close("terminal");
        break;
      default:
        push(<Err>zsh: command not found: {cmd}</Err>);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
      setHIndex(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const i = Math.min(hIndex + 1, history.length - 1);
      if (i >= 0) {
        setHIndex(i);
        setInput(history[i]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const i = hIndex - 1;
      setHIndex(Math.max(i, -1));
      setInput(i >= 0 ? history[i] : "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = COMMANDS.filter((c) => c.startsWith(input.toLowerCase()));
      if (match.length === 1) setInput(match[0] + " ");
      else if (match.length > 1) push(<Prompt>{input}</Prompt>, <span>{match.join("  ")}</span>);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div
      className="terminal min-h-full bg-[#1a1820]/60 p-3 text-[13px] leading-relaxed text-[#e6e6e6]"
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus();
      }}
    >
      {lines.map((l) => (
        <div key={l.id} className="break-words">
          {l.content}
        </div>
      ))}
      <div className="flex items-center">
        <PromptPrefix />
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Terminal input"
          className="ml-2 flex-1 bg-transparent caret-[#7ee787] outline-none"
        />
      </div>
      <div ref={bottomRef} />
    </div>
  );
}

function PromptPrefix() {
  return (
    <span className="shrink-0">
      <span className="text-[#7ee787]">
        {user}@{host}
      </span>
      <span className="text-white/50"> ~ %</span>
    </span>
  );
}

function Prompt({ children }: { children: ReactNode }) {
  return (
    <span>
      <PromptPrefix /> <span>{children}</span>
    </span>
  );
}

function Cmd({ children }: { children: ReactNode }) {
  return <span className="text-[#ffa657]">{children}</span>;
}

function Err({ children }: { children: ReactNode }) {
  return <span className="text-[#ff7b72]">{children}</span>;
}
