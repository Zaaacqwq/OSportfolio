"use client";

/**
 * 原创的 macOS 风格应用图标（全部是 SVG，100×100 画布，超椭圆裁剪）。
 * 没有使用任何苹果的素材。
 */
import { useId, type ReactNode } from "react";
import type { IconType } from "react-icons";
import { FaGithub } from "react-icons/fa6";
import { SQUIRCLE_PATH } from "@/lib/squirclePath";

export type IconName =
  | "contacts"
  | "finder"
  | "launchpad"
  | "safari"
  | "mail"
  | "notes"
  | "terminal"
  | "preview"
  | "settings"
  | "simulator"
  | "github"
  | "trash"
  | "vibeisland"
  | "aboutmac"
  | "drive"
  | "music";

/** 外层：超椭圆裁剪 + 顶部高光 + 细描边 */
function Squircle({ children, id }: { children: ReactNode; id: string }) {
  return (
    <>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={SQUIRCLE_PATH} />
        </clipPath>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".32" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        {children}
        <rect width="100" height="100" fill={`url(#${id}-shine)`} />
      </g>
      <path d={SQUIRCLE_PATH} fill="none" stroke="#000" strokeOpacity=".12" strokeWidth=".6" />
    </>
  );
}

function Grad({ id, from, to, angle = "v" }: { id: string; from: string; to: string; angle?: "v" | "d" }) {
  return angle === "v" ? (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={from} />
      <stop offset="1" stopColor={to} />
    </linearGradient>
  ) : (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={from} />
      <stop offset="1" stopColor={to} />
    </linearGradient>
  );
}

/** 把 react-icons 的图标嵌进 SVG */
export function Glyph({ icon: Icon, x, y, size, color = "#fff" }: { icon: IconType; x: number; y: number; size: number; color?: string }) {
  return <Icon x={x} y={y} width={size} height={size} size={size} color={color} />;
}

function Contacts({ id }: { id: string }) {
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#f4d7a8" to="#d9a86a" />
        <Grad id={`${id}-p`} from="#9a6a3c" to="#6d4423" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <rect x="0" y="0" width="14" height="100" fill="#000" opacity=".08" />
      {[22, 40, 58, 76].map((y) => (
        <rect key={y} x="4" y={y} width="6" height="4" rx="2" fill="#fff" opacity=".7" />
      ))}
      <circle cx="56" cy="40" r="15" fill={`url(#${id}-p)`} />
      <path d="M28 82c2-16 14-24 28-24s26 8 28 24z" fill={`url(#${id}-p)`} />
    </Squircle>
  );
}

function Finder({ id }: { id: string }) {
  // 原创设计：蓝白渐变底 + 打开的文件夹
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#e8f3ff" to="#b9d9ff" />
        <Grad id={`${id}-back`} from="#3a9cff" to="#1477f2" />
        <Grad id={`${id}-front`} from="#7cc0ff" to="#3f9bff" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <path d="M18 30a5 5 0 0 1 5-5h18l6 6h30a5 5 0 0 1 5 5v40a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5z" fill={`url(#${id}-back)`} />
      <rect x="25" y="34" width="50" height="30" rx="2" fill="#fff" opacity=".95" />
      <path d="M14 44a5 5 0 0 1 5-5h62a5 5 0 0 1 5 5l-4 32a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5z" fill={`url(#${id}-front)`} />
      <path d="M38 58h24M42 66h16" stroke="#fff" strokeOpacity=".75" strokeWidth="3.5" strokeLinecap="round" />
    </Squircle>
  );
}

function Launchpad({ id }: { id: string }) {
  const colors = ["#ff5f57", "#febc2e", "#28c840", "#0a84ff", "#bf5af2", "#ff9f0a", "#64d2ff", "#ff375f", "#30d158"];
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#4a4a52" to="#1d1d22" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      {colors.map((c, i) => (
        <rect key={i} x={21 + (i % 3) * 21} y={21 + Math.floor(i / 3) * 21} width="16" height="16" rx="4.5" fill={c} />
      ))}
    </Squircle>
  );
}

function Safari({ id }: { id: string }) {
  const ticks = Array.from({ length: 48 }, (_, i) => i);
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#ffffff" to="#e4e7ee" />
        <radialGradient id={`${id}-face`} cx=".5" cy=".35" r=".7">
          <stop offset="0" stopColor="#5ad1ff" />
          <stop offset="1" stopColor="#0a63e8" />
        </radialGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <circle cx="50" cy="50" r="38" fill={`url(#${id}-face)`} />
      {ticks.map((i) => {
        const a = (i / 48) * Math.PI * 2;
        const r1 = i % 4 === 0 ? 30 : 33;
        return (
          <line
            key={i}
            x1={50 + Math.cos(a) * r1}
            y1={50 + Math.sin(a) * r1}
            x2={50 + Math.cos(a) * 36}
            y2={50 + Math.sin(a) * 36}
            stroke="#fff"
            strokeOpacity=".85"
            strokeWidth={i % 4 === 0 ? 1.4 : 0.8}
          />
        );
      })}
      <path d="M50 50 L70 28 L54 54 Z" fill="#ff3b30" />
      <path d="M50 50 L30 72 L46 46 Z" fill="#fff" />
      <circle cx="50" cy="50" r="2.4" fill="#fff" />
    </Squircle>
  );
}

function Mail({ id }: { id: string }) {
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#5ac8fa" to="#0a72f0" />
        <Grad id={`${id}-env`} from="#ffffff" to="#dfe9f7" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <rect x="18" y="30" width="64" height="42" rx="6" fill={`url(#${id}-env)`} />
      <path d="M19 33l31 22 31-22" fill="none" stroke="#9fb6d6" strokeWidth="3" strokeLinejoin="round" />
    </Squircle>
  );
}

function Notes({ id }: { id: string }) {
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-top`} from="#ffe06a" to="#ffc928" />
      </defs>
      <rect width="100" height="100" fill="#fbfaf6" />
      <rect width="100" height="30" fill={`url(#${id}-top)`} />
      <path d="M0 30h100" stroke="#000" strokeOpacity=".1" />
      {[46, 60, 74].map((y) => (
        <path key={y} d={`M12 ${y}h76`} stroke="#c9c6bd" strokeWidth="1.4" />
      ))}
      {[...Array(9)].map((_, i) => (
        <circle key={i} cx={14 + i * 9} cy="34" r="1.2" fill="#b9b6ad" />
      ))}
    </Squircle>
  );
}

function Terminal({ id }: { id: string }) {
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#e8e8ea" to="#b8b8bd" />
        <Grad id={`${id}-scr`} from="#2b2b30" to="#0e0e10" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <rect x="12" y="16" width="76" height="68" rx="8" fill={`url(#${id}-scr)`} />
      <path d="M24 36l12 9-12 9" fill="none" stroke="#f5f5f7" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M42 58h18" stroke="#f5f5f7" strokeWidth="5" strokeLinecap="round" />
    </Squircle>
  );
}

function Preview({ id }: { id: string }) {
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#f0f4fa" to="#c9d6e8" />
        <Grad id={`${id}-photo`} from="#7fd1ff" to="#2f7de1" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <g transform="rotate(-8 50 50)">
        <rect x="24" y="18" width="48" height="62" rx="3" fill="#fff" stroke="#000" strokeOpacity=".1" />
      </g>
      <rect x="28" y="20" width="48" height="62" rx="3" fill="#fff" stroke="#000" strokeOpacity=".1" />
      <rect x="33" y="26" width="38" height="22" rx="2" fill={`url(#${id}-photo)`} />
      <path d="M33 48l10-10 8 7 6-5 14 8z" fill="#2c9a4b" opacity=".9" />
      {[55, 61, 67, 73].map((y, i) => (
        <rect key={y} x="33" y={y} width={i === 3 ? 22 : 38} height="2.6" rx="1.3" fill="#c3cbd6" />
      ))}
    </Squircle>
  );
}

function Settings({ id }: { id: string }) {
  const teeth = 12;
  const outer = 34;
  const inner = 27;
  let d = "";
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a1 = (i / (teeth * 2)) * Math.PI * 2;
    const a2 = ((i + 1) / (teeth * 2)) * Math.PI * 2;
    const p1 = [50 + Math.cos(a1) * r, 50 + Math.sin(a1) * r];
    const p2 = [50 + Math.cos(a2) * r, 50 + Math.sin(a2) * r];
    d += `${i === 0 ? "M" : "L"}${p1[0].toFixed(2)} ${p1[1].toFixed(2)} L${p2[0].toFixed(2)} ${p2[1].toFixed(2)} `;
  }
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#a7a7ad" to="#5d5d63" />
        <Grad id={`${id}-gear`} from="#f2f2f4" to="#b9b9bf" />
        <Grad id={`${id}-hub`} from="#6c6c72" to="#3b3b40" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <path d={d + "Z"} fill={`url(#${id}-gear)`} stroke="#000" strokeOpacity=".15" strokeWidth=".6" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="19" fill={`url(#${id}-hub)`} />
      <circle cx="50" cy="50" r="8" fill={`url(#${id}-gear)`} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <line key={i} x1={50 + Math.cos(a) * 9} y1={50 + Math.sin(a) * 9} x2={50 + Math.cos(a) * 18} y2={50 + Math.sin(a) * 18} stroke="#d9d9de" strokeWidth="3" />
        );
      })}
    </Squircle>
  );
}

function Simulator({ id }: { id: string }) {
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#2c2c30" to="#0f0f12" />
        <Grad id={`${id}-scr`} from="#5e5ce6" to="#0a84ff" angle="d" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <rect x="31" y="14" width="38" height="72" rx="9" fill="#3a3a3f" />
      <rect x="33.5" y="16.5" width="33" height="67" rx="7" fill={`url(#${id}-scr)`} />
      <rect x="44" y="19.5" width="12" height="3.6" rx="1.8" fill="#000" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={37 + (i % 3) * 9.5} y={30 + Math.floor(i / 3) * 10} width="7" height="7" rx="2" fill="#fff" opacity=".8" />
      ))}
    </Squircle>
  );
}

function GitHub({ id }: { id: string }) {
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#3b434b" to="#0d1117" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <Glyph icon={FaGithub} x={22} y={22} size={56} />
    </Squircle>
  );
}

function Trash({ id }: { id: string }) {
  // macOS 的废纸篓不是方形图标：一个半透明的网格桶
  return (
    <>
      <defs>
        <Grad id={`${id}-bin`} from="#f4f6f9" to="#b9c0ca" />
        <Grad id={`${id}-lid`} from="#ffffff" to="#cfd5dd" />
      </defs>
      <path d="M22 26h56l-6 64a6 6 0 0 1-6 5H34a6 6 0 0 1-6-5z" fill={`url(#${id}-bin)`} stroke="#8a929d" strokeWidth="1" />
      {[34, 42, 50, 58, 66].map((x) => (
        <path key={x} d={`M${x} 32 L${x + (x - 50) * 0.06} 88`} stroke="#8a929d" strokeOpacity=".55" strokeWidth="1.2" />
      ))}
      <ellipse cx="50" cy="26" rx="29" ry="5" fill={`url(#${id}-lid)`} stroke="#8a929d" strokeWidth="1" />
    </>
  );
}

function VibeIsland({ id }: { id: string }) {
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#5fd6c8" to="#0f8a8f" angle="d" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <rect x="16" y="22" width="68" height="22" rx="11" fill="#000" />
      <circle cx="28" cy="33" r="5" fill="#ff9f0a" />
      <rect x="62" y="29" width="3" height="8" rx="1.5" fill="#fff" opacity=".8" />
      <rect x="67" y="27" width="3" height="12" rx="1.5" fill="#fff" opacity=".8" />
      <rect x="72" y="30" width="3" height="6" rx="1.5" fill="#fff" opacity=".8" />
      <rect x="16" y="54" width="68" height="26" rx="8" fill="#000" opacity=".55" />
      <rect x="22" y="62" width="26" height="10" rx="5" fill="#ff453a" opacity=".85" />
      <rect x="52" y="62" width="26" height="10" rx="5" fill="#30d158" />
    </Squircle>
  );
}

function Music({ id }: { id: string }) {
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#ff6b81" to="#e8204a" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <path
        d="M41 69.5a8.5 8.5 0 1 1-6-8.1V31.6l34-7v35.9a8.5 8.5 0 1 1-6-8.1V37.9l-22 4.6z"
        fill="#fff"
      />
    </Squircle>
  );
}

function AboutMac({ id }: { id: string }) {
  return (
    <Squircle id={id}>
      <defs>
        <Grad id={`${id}-bg`} from="#5b8cff" to="#7c3aed" angle="d" />
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-bg)`} />
      <path d="M30 32h40L32 70h40" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </Squircle>
  );
}

function Drive({ id }: { id: string }) {
  return (
    <>
      <defs>
        <Grad id={`${id}-body`} from="#f2f3f5" to="#b5b9c0" />
      </defs>
      <rect x="10" y="30" width="80" height="44" rx="7" fill={`url(#${id}-body)`} stroke="#7d838c" strokeWidth="1" />
      <rect x="10" y="62" width="80" height="12" rx="0" fill="#000" opacity=".06" />
      <circle cx="78" cy="66" r="2.2" fill="#30d158" />
      <rect x="18" y="38" width="40" height="3" rx="1.5" fill="#8d939c" opacity=".6" />
    </>
  );
}

const MAP: Record<IconName, (p: { id: string }) => ReactNode> = {
  contacts: Contacts,
  finder: Finder,
  launchpad: Launchpad,
  safari: Safari,
  mail: Mail,
  notes: Notes,
  terminal: Terminal,
  preview: Preview,
  settings: Settings,
  simulator: Simulator,
  github: GitHub,
  trash: Trash,
  vibeisland: VibeIsland,
  aboutmac: AboutMac,
  drive: Drive,
  music: Music,
};

export function SystemIcon({ name, size = 56, className = "" }: { name: IconName; size?: number; className?: string }) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const Comp = MAP[name];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`app-icon shrink-0 ${className}`} aria-hidden>
      <Comp id={`i${raw}`} />
    </svg>
  );
}

/** 项目用的图标：强调色渐变 + react-icons 字形 */
export function GlyphIcon({
  glyph,
  from,
  to,
  size = 56,
  color = "#fff",
  className = "",
}: {
  glyph: IconType;
  from: string;
  to: string;
  size?: number;
  color?: string;
  className?: string;
}) {
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={`app-icon shrink-0 ${className}`} aria-hidden>
      <Squircle id={id}>
        <defs>
          <Grad id={`${id}-bg`} from={from} to={to} angle="d" />
        </defs>
        <rect width="100" height="100" fill={`url(#${id}-bg)`} />
        <Glyph icon={glyph} x={26} y={26} size={48} color={color} />
      </Squircle>
    </svg>
  );
}

/** macOS 风格文件夹图标 */
export function FolderIcon({ size = 64, tint = "#3a9cff", className = "" }: { size?: number; tint?: string; className?: string }) {
  const id = `f${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg viewBox="0 0 100 80" width={size} height={size * 0.8} className={`shrink-0 ${className}`} aria-hidden>
      <defs>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint} stopOpacity=".85" />
          <stop offset="1" stopColor={tint} />
        </linearGradient>
        <linearGradient id={`${id}-f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".45" />
          <stop offset="1" stopColor="#fff" stopOpacity=".05" />
        </linearGradient>
      </defs>
      <path d="M6 12a6 6 0 0 1 6-6h22c2 0 3.4.8 4.6 2.2L43 14h45a6 6 0 0 1 6 6v6H6z" fill={`url(#${id}-b)`} />
      <path d="M6 12a6 6 0 0 1 6-6h22c2 0 3.4.8 4.6 2.2L43 14h45a6 6 0 0 1 6 6v6H6z" fill="#000" opacity=".12" />
      <rect x="6" y="20" width="88" height="54" rx="6" fill={`url(#${id}-b)`} />
      <rect x="6" y="20" width="88" height="54" rx="6" fill={`url(#${id}-f)`} />
      <path d="M6 26h88" stroke="#fff" strokeOpacity=".35" />
    </svg>
  );
}
