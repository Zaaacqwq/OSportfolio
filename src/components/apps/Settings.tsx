"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LuCheck, LuImage, LuInfo, LuMonitor, LuSearch, LuSunMoon } from "react-icons/lu";
import { profile } from "@/config/profile";
import { useSystem } from "@/context/System";
import type { AppProps } from "@/lib/apps";
import { WALLPAPERS } from "@/lib/wallpapers";
import { Avatar } from "../Avatar";
import { MobileTabs, Sidebar, SidebarItem, Toolbar } from "../chrome/WindowChrome";

type Pane = "appearance" | "wallpaper" | "displays" | "about";

function Tile({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-[6px] text-[12px] text-white" style={{ background: color }}>
      {children}
    </span>
  );
}

function Group({ children }: { children: ReactNode }) {
  return <div className="card divide-y divide-[var(--separator)] text-[13px]">{children}</div>;
}
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-4 px-4 py-2">
      <span>{label}</span>
      {children}
    </div>
  );
}

export default function Settings({ params }: AppProps) {
  const sys = useSystem();
  const [pane, setPane] = useState<Pane>("appearance");
  useEffect(() => {
    if (typeof params?.pane === "string") setPane(params.pane as Pane);
  }, [params?.nonce, params?.pane]);

  const titles: Record<Pane, string> = { appearance: "Appearance", wallpaper: "Wallpaper", displays: "Displays", about: "About" };
  const dark = sys.appearance === "dark";

  return (
    <div className="flex h-full">
      <Sidebar width={215}>
        <label className="search-field mb-3 !h-[28px]">
          <LuSearch className="shrink-0" />
          <input placeholder="Search" aria-label="Search settings" />
        </label>
        <button className="mb-2 flex w-full items-center gap-2.5 rounded-[10px] p-2 text-left hover:bg-hover" onClick={() => sys.open("about")}>
          <Avatar size={36} />
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold">{profile.name}</span>
            <span className="block text-[11px] text-muted">Apple Account… just kidding</span>
          </span>
        </button>
        <SidebarItem icon={<Tile color="#1c1c1e"><LuSunMoon /></Tile>} label="Appearance" active={pane === "appearance"} onClick={() => setPane("appearance")} />
        <SidebarItem icon={<Tile color="#30b0c7"><LuImage /></Tile>} label="Wallpaper" active={pane === "wallpaper"} onClick={() => setPane("wallpaper")} />
        <SidebarItem icon={<Tile color="#0a84ff"><LuMonitor /></Tile>} label="Displays" active={pane === "displays"} onClick={() => setPane("displays")} />
        <SidebarItem icon={<Tile color="#8e8e93"><LuInfo /></Tile>} label="About" active={pane === "about"} onClick={() => setPane("about")} />
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <Toolbar title={titles[pane]} />
        <MobileTabs<Pane> value={pane} onChange={setPane} items={(Object.keys(titles) as Pane[]).map((id) => ({ id, label: titles[id] }))} />
        <div className="scroll-area min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6">
          {pane === "appearance" && (
            <>
              <Group>
                <div className="px-4 py-3">
                  <div className="mb-3">Appearance</div>
                  <div className="flex gap-5">
                    {(["light", "dark"] as const).map((a) => (
                      <button key={a} onClick={() => sys.setAppearance(a)} className="flex flex-col items-center gap-1.5">
                        <span
                          className={`block h-[52px] w-[74px] overflow-hidden rounded-[8px] ring-[3px] ${sys.appearance === a ? "ring-accent" : "ring-transparent"}`}
                          style={{ background: a === "light" ? "linear-gradient(135deg,#e8eef7,#b9c8de)" : "linear-gradient(135deg,#2a2d36,#11131a)" }}
                        >
                          <span className={`m-2 block h-[30px] rounded-[4px] ${a === "light" ? "bg-white" : "bg-[#2c2c2e]"}`} />
                        </span>
                        <span className="text-[12px] capitalize">{a}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Row label="Accent color">
                  <span className="flex gap-1.5">
                    {["#0a84ff", "#bf5af2", "#ff375f", "#ff9f0a", "#ffd60a", "#30d158", "#8e8e93"].map((c, i) => (
                      <span key={c} className={`h-[16px] w-[16px] rounded-full ${i === 0 ? "ring-2 ring-offset-2 ring-offset-[var(--window-alt)]" : "opacity-60"}`} style={{ background: c, ["--tw-ring-color" as string]: c }} />
                    ))}
                  </span>
                </Row>
              </Group>
              <p className="px-1 text-[12px] text-muted">Tip: Dark Mode also switches every wallpaper to its night variant.</p>
            </>
          )}

          {pane === "wallpaper" && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {WALLPAPERS.map((w) => {
                const on = w.id === sys.wallpaper;
                return (
                  <button key={w.id} onClick={() => sys.setWallpaper(w.id)} className="text-left">
                    <span
                      className={`relative block aspect-[16/10] rounded-[10px] shadow-sm ring-[3px] ${on ? "ring-accent" : "ring-transparent hover:ring-sel"}`}
                      style={{ background: dark ? w.dark : w.light }}
                    >
                      {on && (
                        <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-[11px] text-white">
                          <LuCheck />
                        </span>
                      )}
                    </span>
                    <span className="mt-1.5 block text-[12px] font-medium">{w.name}</span>
                    <span className="block text-[11px] text-muted">Dynamic · light & dark</span>
                  </button>
                );
              })}
            </div>
          )}

          {pane === "displays" && (
            <Group>
              <Row label="Brightness">
                <input
                  type="range"
                  min={0.4}
                  max={1}
                  step={0.01}
                  value={sys.brightness}
                  onChange={(e) => sys.setBrightness(Number(e.target.value))}
                  className="w-[220px] accent-[var(--accent)]"
                  aria-label="Brightness"
                />
              </Row>
              <Row label="Resolution">
                <span className="text-muted">{typeof window !== "undefined" ? `${window.innerWidth} × ${window.innerHeight}` : "—"}</span>
              </Row>
            </Group>
          )}

          {pane === "about" && (
            <Group>
              <Row label="Name">
                <span className="text-muted">{profile.name}</span>
              </Row>
              <Row label="Built with">
                <span className="text-muted">Next.js · TypeScript · Tailwind CSS</span>
              </Row>
              <Row label="Source">
                <a className="text-accent" href="https://github.com/Zaaacqwq/OSportfolio" target="_blank" rel="noreferrer">
                  github.com/Zaaacqwq/OSportfolio
                </a>
              </Row>
              <Row label="Icons & wallpapers">
                <span className="text-muted">Original, drawn in code</span>
              </Row>
            </Group>
          )}
        </div>
      </div>
    </div>
  );
}
