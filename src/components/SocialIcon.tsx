import {
  FaBilibili,
  FaDribbble,
  FaEnvelope,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaWeixin,
  FaXTwitter,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { SocialKey } from "@/config/profile";
import type { IconSpec } from "./AppIcon";

export const SOCIAL_META: Record<SocialKey, { icon: IconType; bg: string }> = {
  github: { icon: FaGithub, bg: "linear-gradient(180deg,#2b3137,#0d1117)" },
  linkedin: { icon: FaLinkedinIn, bg: "linear-gradient(180deg,#1a8cd8,#0a5ea8)" },
  x: { icon: FaXTwitter, bg: "linear-gradient(180deg,#2a2a2a,#000)" },
  instagram: {
    icon: FaInstagram,
    bg: "radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285aeb 90%)",
  },
  dribbble: { icon: FaDribbble, bg: "linear-gradient(180deg,#f57fb0,#d9437f)" },
  email: { icon: FaEnvelope, bg: "linear-gradient(180deg,#7cc8ff,#1b8cff)" },
  website: { icon: FaGlobe, bg: "linear-gradient(180deg,#60a5fa,#4338ca)" },
  bilibili: { icon: FaBilibili, bg: "linear-gradient(180deg,#5cc8f5,#00a1d6)" },
  wechat: { icon: FaWeixin, bg: "linear-gradient(180deg,#5ee07a,#07c160)" },
};

export function SocialIcon({ k, className }: { k: SocialKey; className?: string }) {
  const Icon = SOCIAL_META[k].icon;
  return <Icon className={className} />;
}

export function socialIconSpec(k: SocialKey): IconSpec {
  const { icon: Icon, bg } = SOCIAL_META[k];
  return { bg, glyph: <Icon /> };
}
