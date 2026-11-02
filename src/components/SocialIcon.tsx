import type { IconType } from "react-icons";
import { FaEnvelope, FaGithub, FaGlobe, FaInstagram, FaLinkedinIn, FaPenNib, FaXTwitter } from "react-icons/fa6";
import type { SocialKey } from "@/config/profile";

export const SOCIAL_META: Record<SocialKey, { icon: IconType; from: string; to: string }> = {
  github: { icon: FaGithub, from: "#3b434b", to: "#0d1117" },
  linkedin: { icon: FaLinkedinIn, from: "#1a8cd8", to: "#0a5ea8" },
  email: { icon: FaEnvelope, from: "#5ac8fa", to: "#0a72f0" },
  blog: { icon: FaPenNib, from: "#2ba3f0", to: "#075985" },
  website: { icon: FaGlobe, from: "#7c8cff", to: "#4338ca" },
  x: { icon: FaXTwitter, from: "#2a2a2a", to: "#000" },
  instagram: { icon: FaInstagram, from: "#f58529", to: "#c13584" },
};

export function SocialIcon({ k, className }: { k: SocialKey; className?: string }) {
  const Icon = SOCIAL_META[k].icon;
  return <Icon className={className} />;
}
