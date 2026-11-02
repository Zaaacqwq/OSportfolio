"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { profile } from "@/config/profile";
import { CATEGORIES, getProject, PROJECTS, type Project } from "@/config/projects";
import { useSystem } from "@/context/System";
import { APPS, type AppId, type AppProps } from "@/lib/apps";
import { WALLPAPERS } from "@/lib/wallpapers";
import { openProject } from "@/lib/openProject";
import { Toolbar } from "../chrome/WindowChrome";

interface Line {
  id: number;
  content: ReactNode;
}

const USER = profile.firstName.toLowerCase();
const HOST = "zacs-mac";
const visible = PROJECTS.filter((p) => p.category !== "archive");

const FILES: Record<string, string> = {
  "about.txt": profile.bio.join("\n\n"),
  "contact.txt": profile.socials.map((s) => `${s.label.toLowerCase().padEnd(9)} ${s.url.replace("mailto:", "")}`).join("\n"),
  "skills.txt": Object.entries(profile.skills)
    .map(([k, v]) => `${k.padEnd(15)} ${v.join(", ")}`)
    .join("\n"),
  "motto.txt": profile.motto,
};

const COMMANDS = ["help", "about", "whoami", "neofetch", "projects", "project", "open", "skills", "experience", "contact", "ls", "cat", "tree", "wallpaper", "theme", "date", "echo", "clear", "history", "sudo", "exit"];

export default function Terminal({ params }: AppProps) {
  const sys = useSystem();
  const [lines, setLines] = useState<Line[]>(() => [
    { id: 0, content: <span className="text-white/45">Last login: {new Date().toDateString()} on ttys001</span> },
    {
      id: 1,
      content: (
        <span>
          Welcome to {profile.firstName}&apos;s Mac. Type <C>help</C> to get started, or <C>projects</C> to see what I&apos;ve built.
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

  const push = (...content: ReactNode[]) => setLines((ls) => [...ls, ...content.map((c) => ({ id: idRef.current++, content: c }))]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  // 其他应用可以让终端执行一条命令
  useEffect(() => {
    if (typeof params?.run === "string") run(params.run);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.nonce]);

  const projectCard = (p: Project) => (
    <div className="my-1 border-l-2 pl-3" style={{ borderColor: p.accent[0] }}>
      <div>
        <span className="font-bold text-white">{p.name}</span> <span className="text-white/45">({p.kind}, {p.year})</span>{" "}
        {p.private ? <span className="text-[#ffa657]">[private]</span> : <span className="text-[#7ee787]">[public]</span>}
      </div>
      <div className="text-white/80">{p.tagline}</div>
      {p.description.map((d, i) => (
        <div key={i} className="mt-1 text-white/60">
          {d}
        </div>
      ))}
      {p.highlights?.map((h) => (
        <div key={h} className="text-white/70">
          <span className="text-[#79c0ff]">•</span> {h}
        </div>
      ))}
      <div className="mt-1">
        <span className="text-[#d2a8ff]">stack</span> {p.tech.join(" · ")}
      </div>
      {p.repo && (
        <div>
          <span className="text-[#d2a8ff]">repo </span> <Link href={p.repo} />
        </div>
      )}
      {p.live && (
        <div>
          <span className="text-[#d2a8ff]">live </span> <Link href={p.live} />
        </div>
      )}
    </div>
  );

  const pipeline = (p: Project) => {
    if (p.slug === "slaythespire")
      return (
        <pre className="mt-1 text-white/70">{`SlayTheSpireRL/
├── mod/            C# · exposes live game state + actions
├── mcp/            Python MCP server → any LLM client can play
├── rl/             training environment (PPO planned)
├── dashboard/      runs & replays
└── sts2-cli/       headless game engine (submodule)

  Slay the Spire 2 ──▶ mod ──▶ MCP server ──▶ LLM / RL agent
          ▲                                       │
          └──────────────── actions ◀─────────────┘`}</pre>
      );
    if (p.slug === "balatromcp")
      return (
        <pre className="mt-1 text-white/70">{`  Balatro ──▶ Lua mod (local HTTP) ──▶ Python MCP server ──▶ AI client
                                         tools: get_game_state, play_hand, …`}</pre>
      );
    if (p.slug === "autouwlearn")
      return (
        <pre className="mt-1 text-white/70">{`  MCP client ──▶ autoUWLearn ──▶ Brightspace Valence API
                    (read‑only)      deadlines · grades · announcements · content`}</pre>
      );
    return null;
  };

  const run = (raw: string) => {
    const cmdline = raw.trim();
    push(<Prompt>{raw}</Prompt>);
    if (!cmdline) return;
    setHistory((h) => [cmdline, ...h.filter((x) => x !== cmdline)]);
    const [cmd, ...args] = cmdline.split(/\s+/);
    const arg = args.join(" ");

    switch (cmd.toLowerCase()) {
      case "help":
        push(
          <div className="grid grid-cols-[150px_1fr] gap-x-4">
            {[
              ["about / whoami", "who I am"],
              ["neofetch", "system info, the fun way"],
              ["projects", "list my projects"],
              ["project <name>", "details for one project"],
              ["open <app|project>", "open an app or project"],
              ["skills / experience", "what I work with, where I've worked"],
              ["contact", "how to reach me"],
              ["ls · cat · tree", "browse files"],
              ["wallpaper <name>", "change the wallpaper"],
              ["theme dark|light", "change appearance"],
              ["clear", "clear the screen (⌃L)"],
            ].map(([c, d]) => (
              <div key={c} className="contents">
                <C>{c}</C>
                <span className="text-white/65">{d}</span>
              </div>
            ))}
          </div>,
          <span className="text-white/45">Tip: ↑/↓ for history, Tab to autocomplete.</span>,
        );
        break;
      case "whoami":
        push(<span>{USER}</span>);
        break;
      case "about":
        push(
          <span>
            <b className="text-[#7ee787]">{profile.name}</b> — {profile.title}
          </span>,
          ...profile.bio.map((b) => <span className="text-white/75">{b}</span>),
        );
        break;
      case "neofetch":
        push(<Neofetch />);
        break;
      case "projects": {
        const cats = Object.keys(CATEGORIES).filter((c) => c !== "archive") as (keyof typeof CATEGORIES)[];
        for (const c of cats) {
          const list = visible.filter((p) => p.category === c);
          if (!list.length) continue;
          push(<span className="mt-1 font-bold" style={{ color: CATEGORIES[c].color }}>{CATEGORIES[c].label}</span>);
          list.forEach((p) =>
            push(
              <span>
                {"  "}
                <span className="inline-block w-[150px] text-[#ffa657]">{p.slug}</span>
                <span className="text-white/75">{p.tagline}</span>
                {p.private && <span className="text-white/35"> 🔒</span>}
              </span>,
            ),
          );
        }
        push(
          <span className="mt-1 text-white/45">
            Run <C>project &lt;name&gt;</C> for details, or <C>open &lt;name&gt;</C> to launch it.
          </span>,
        );
        break;
      }
      case "project":
      case "cat":
      case "tree": {
        if (cmd === "cat" && FILES[arg]) {
          push(<pre className="whitespace-pre-wrap text-white/80">{FILES[arg]}</pre>);
          break;
        }
        const slug = arg.replace(/^projects\//, "").replace(/\/(README(\.md)?)?$/i, "").toLowerCase();
        const p = PROJECTS.find((x) => x.slug === slug || x.name.toLowerCase() === slug);
        if (!p) {
          push(<Err>{cmd}: {arg || "(missing name)"}: no such project or file. Try “projects” or “ls”.</Err>);
          break;
        }
        if (cmd === "tree") {
          push(pipeline(p) ?? <span className="text-white/60">{p.name}/ (no tree available)</span>);
        } else {
          push(projectCard(p));
          const pl = pipeline(p);
          if (pl) push(pl);
          push(
            <span className="text-white/45">
              <C>open {p.slug}</C> to launch it.
            </span>,
          );
        }
        break;
      }
      case "open": {
        const a = arg.toLowerCase();
        const app = (Object.keys(APPS) as AppId[]).find((k) => k === a || APPS[k].name.toLowerCase() === a);
        const p = getProject(a) ?? PROJECTS.find((x) => x.name.toLowerCase() === a);
        if (app) {
          sys.open(app);
          push(<span className="text-white/55">Opening {APPS[app].name}…</span>);
        } else if (p) {
          if (p.showcase === "terminal") {
            push(projectCard(p));
            if (pipeline(p)) push(pipeline(p));
            if (p.repo) window.open(p.repo, "_blank", "noopener");
          } else {
            openProject(sys, p);
            push(<span className="text-white/55">Opening {p.name}…</span>);
          }
        } else push(<Err>open: {arg || "(missing name)"}: not found. Try “projects” or an app like “finder”.</Err>);
        break;
      }
      case "skills":
        Object.entries(profile.skills).forEach(([k, v]) =>
          push(
            <span>
              <span className="inline-block w-[130px] text-[#79c0ff]">{k}</span>
              {v.join(" · ")}
            </span>,
          ),
        );
        break;
      case "experience":
        profile.experience.forEach((e) =>
          push(
            <span>
              <span className="text-white/45">{e.period}</span> <span className="text-[#d2a8ff]">{e.role}</span> @ {e.company}
            </span>,
            ...e.points.map((p) => <span className="text-white/65">  • {p}</span>),
          ),
        );
        break;
      case "contact":
        profile.socials.forEach((s) =>
          push(
            <span>
              <span className="inline-block w-[90px]">{s.label.toLowerCase()}</span>
              <Link href={s.url} label={s.handle} />
            </span>,
          ),
        );
        break;
      case "ls":
        if (arg.startsWith("projects")) {
          push(
            <span className="flex flex-wrap gap-x-5">
              {visible.map((p) => (
                <span key={p.slug} className="text-[#79c0ff]">
                  {p.slug}/
                </span>
              ))}
            </span>,
          );
        } else
          push(
            <span className="flex flex-wrap gap-x-6">
              {Object.keys(FILES).map((f) => (
                <span key={f}>{f}</span>
              ))}
              <span className="text-[#79c0ff]">projects/</span>
            </span>,
          );
        break;
      case "wallpaper": {
        const w = WALLPAPERS.find((x) => x.id === arg.toLowerCase());
        if (w) {
          sys.setWallpaper(w.id);
          push(<span>Wallpaper set to {w.name}.</span>);
        } else push(<span>Available: {WALLPAPERS.map((x) => x.id).join(", ")}</span>);
        break;
      }
      case "theme":
        if (arg === "dark" || arg === "light") {
          sys.setAppearance(arg);
          push(<span>Appearance set to {arg}.</span>);
        } else push(<span>Usage: theme dark|light</span>);
        break;
      case "date":
        push(<span>{new Date().toString()}</span>);
        break;
      case "echo":
        push(<span>{arg}</span>);
        break;
      case "history":
        history
          .slice()
          .reverse()
          .forEach((h, i) => push(<span className="text-white/70">{String(i + 1).padStart(4)}  {h}</span>));
        break;
      case "clear":
        setLines([]);
        break;
      case "sudo":
        push(<Err>{USER} is not in the sudoers file. This incident will be reported. 🚨</Err>);
        break;
      case "exit":
        sys.close("terminal");
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
      const parts = input.split(" ");
      if (parts.length === 1) {
        const m = COMMANDS.filter((c) => c.startsWith(parts[0].toLowerCase()));
        if (m.length === 1) setInput(m[0] + " ");
        else if (m.length > 1) push(<Prompt>{input}</Prompt>, <span>{m.join("  ")}</span>);
      } else {
        const last = parts[parts.length - 1].toLowerCase();
        const pool = [...PROJECTS.map((p) => p.slug), ...(Object.keys(APPS) as string[]), ...Object.keys(FILES)];
        const m = pool.filter((c) => c.startsWith(last));
        if (m.length === 1) setInput([...parts.slice(0, -1), m[0]].join(" "));
        else if (m.length > 1) push(<Prompt>{input}</Prompt>, <span>{m.join("  ")}</span>);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#1e1e20] text-[#e6e6e6]">
      <Toolbar lights title={`${USER} — -zsh — 80×24`} center className="!h-[38px] border-b border-white/10 bg-[#2a2a2d] text-white" />
      <div
        className="terminal scroll-area min-h-0 flex-1 overflow-y-auto p-3 text-[12.5px] leading-[1.6]"
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
    </div>
  );
}

function Neofetch() {
  const art = `        ##########
        ##########
               ###
             ###
           ###
         ###
       ###
      ##########
      ##########`;
  const rows: [string, string][] = [
    ["OS", "zacOS 26 (Liquid Glass)"],
    ["Host", "University of Waterloo · Computer Engineering"],
    ["Uptime", "since 2023, graduating 2028"],
    ["Shell", `zsh · ${profile.role}`],
    ["Employer", profile.company],
    ["Languages", "TypeScript, Python, Swift, Java, C++, C#, Go"],
    ["Projects", `${PROJECTS.length} (${PROJECTS.filter((p) => p.private).length} private)`],
    ["Lines written", profile.stats.linesOfCode],
    ["Motto", profile.motto],
  ];
  return (
    <div className="my-1 flex flex-wrap gap-6">
      <pre className="leading-[1.25] text-[#79c0ff]">{art}</pre>
      <div>
        <div>
          <span className="font-bold text-[#7ee787]">{USER}</span>@<span className="font-bold text-[#7ee787]">{HOST}</span>
        </div>
        <div className="text-white/30">------------------------</div>
        {rows.map(([k, v]) => (
          <div key={k}>
            <span className="font-bold text-[#79c0ff]">{k}</span>: <span className="text-white/80">{v}</span>
          </div>
        ))}
        <div className="mt-2 flex gap-0">
          {["#ff5f57", "#febc2e", "#28c840", "#0a84ff", "#bf5af2", "#64d2ff", "#f5f5f7"].map((c) => (
            <span key={c} className="inline-block h-3 w-6" style={{ background: c }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PromptPrefix() {
  return (
    <span className="shrink-0">
      <span className="text-[#7ee787]">
        {USER}@{HOST}
      </span>
      <span className="text-white/45"> ~ %</span>
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

const C = ({ children }: { children: ReactNode }) => <span className="text-[#ffa657]">{children}</span>;
const Err = ({ children }: { children: ReactNode }) => <span className="text-[#ff7b72]">{children}</span>;
const Link = ({ href, label }: { href: string; label?: string }) => (
  <a className="text-[#79c0ff] underline decoration-[#79c0ff]/40" href={href} target="_blank" rel="noreferrer">
    {label ?? href}
  </a>
);
