"use client";

import { useState, type ReactNode } from "react";
import { LuBluetooth, LuMoon, LuSun, LuVolume2, LuWifi, LuAirplay, LuSunMedium, LuMoonStar, LuMonitor } from "react-icons/lu";
import { useSystem } from "@/context/System";
import { WALLPAPERS } from "@/lib/wallpapers";
import { useNowPlaying } from "@/lib/music/store";
import { Artwork, TransportControls } from "../music/MusicParts";

function Module({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[20px] bg-white/45 p-3 shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.6)] dark:bg-white/[0.08] dark:shadow-[inset_0_0_0_0.5px_rgba(255,255,255,0.12)] ${className}`}>{children}</div>;
}

function Toggle({ on, icon, label, sub, onClick }: { on: boolean; icon: ReactNode; label: string; sub: string; onClick: () => void }) {
  return (
    <button className="flex w-full items-center gap-2.5 text-left" onClick={onClick}>
      <span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full text-[15px] ${on ? "bg-accent text-white" : "bg-black/10 text-fg dark:bg-white/15"}`}>
        {icon}
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-[13px] font-semibold">{label}</span>
        <span className="block truncate text-[11px] text-muted">{sub}</span>
      </span>
    </button>
  );
}

function Slider({ value, onChange, icon, label }: { value: number; onChange: (v: number) => void; icon: ReactNode; label: string }) {
  return (
    <div>
      <div className="mb-2 text-[13px] font-semibold">{label}</div>
      <div className="relative flex h-[24px] items-center overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
        <div className="absolute inset-y-0 left-0 rounded-full bg-white shadow" style={{ width: `${Math.max(12, value * 100)}%` }} />
        <span className="relative ml-[6px] text-[13px] text-black/60">{icon}</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 cursor-default opacity-0"
        />
      </div>
    </div>
  );
}

/** 正在播放：封面、歌名、上一首/播放/下一首；没有歌时点击打开 Music */
function NowPlayingModule() {
  const sys = useSystem();
  const { track, isPaused } = useNowPlaying();
  return (
    <div className="flex items-center gap-3" data-cc="now-playing">
      <button onClick={() => sys.open("music")} aria-label="Open Music" className="shrink-0">
        <Artwork track={track} size={42} rounded={8} />
      </button>
      <button onClick={() => sys.open("music")} className="min-w-0 flex-1 text-left leading-tight">
        <span className="block truncate text-[13px] font-semibold">{track ? track.title : "Not Playing"}</span>
        <span className="block truncate text-[11.5px] text-muted">{track ? `${track.artist}${isPaused ? " · Paused" : ""}` : "Open Music"}</span>
      </button>
      <TransportControls size={15} btnClass="h-8 w-8 rounded-full hover:bg-black/10 dark:hover:bg-white/15" />
    </div>
  );
}

export function ControlCenter() {
  const sys = useSystem();
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(true);
  const [airdrop, setAirdrop] = useState(false);
  const [focus, setFocus] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const dark = sys.appearance === "dark";
  // 亮度滑块 0..1 映射到 0.4..1
  const bright = (sys.brightness - 0.4) / 0.6;

  return (
    <div className="fixed inset-0 z-[9400]" onPointerDown={() => sys.setOverlay(null)}>
      <div
        className="slide-down glass absolute right-2 top-[30px] w-[330px] rounded-[26px] p-3 text-fg"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-2 gap-2.5">
          <Module className="row-span-2 space-y-3">
            <Toggle on={wifi} icon={<LuWifi />} label="Wi‑Fi" sub={wifi ? "Waterloo‑5G" : "Off"} onClick={() => setWifi(!wifi)} />
            <Toggle on={bt} icon={<LuBluetooth />} label="Bluetooth" sub={bt ? "On" : "Off"} onClick={() => setBt(!bt)} />
            <Toggle on={airdrop} icon={<LuAirplay />} label="AirDrop" sub={airdrop ? "Everyone" : "Contacts Only"} onClick={() => setAirdrop(!airdrop)} />
          </Module>
          <Module>
            <Toggle
              on={dark}
              icon={dark ? <LuMoon /> : <LuSun />}
              label={dark ? "Dark" : "Light"}
              sub="Appearance"
              onClick={() => sys.setAppearance(dark ? "light" : "dark")}
            />
          </Module>
          <Module>
            <Toggle on={focus} icon={<LuMoonStar />} label="Focus" sub={focus ? "Do Not Disturb" : "Off"} onClick={() => setFocus(!focus)} />
          </Module>
          <Module className="col-span-2">
            <NowPlayingModule />
          </Module>
          <Module className="col-span-2">
            <Slider label="Display" icon={<LuSunMedium />} value={bright} onChange={(v) => sys.setBrightness(0.4 + v * 0.6)} />
          </Module>
          <Module className="col-span-2">
            <Slider label="Sound" icon={<LuVolume2 />} value={volume} onChange={setVolume} />
          </Module>
          <Module className="col-span-2">
            <div className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold">
              <LuMonitor /> Wallpaper
            </div>
            <div className="flex gap-2">
              {WALLPAPERS.map((w) => (
                <button
                  key={w.id}
                  aria-label={w.name}
                  title={w.name}
                  onClick={() => sys.setWallpaper(w.id)}
                  className={`h-[34px] flex-1 rounded-[9px] ring-2 ${sys.wallpaper === w.id ? "ring-accent" : "ring-transparent"}`}
                  style={{ background: dark ? w.dark : w.light }}
                />
              ))}
            </div>
          </Module>
        </div>
      </div>
    </div>
  );
}
