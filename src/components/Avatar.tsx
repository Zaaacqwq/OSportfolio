import { profile } from "@/config/profile";

export function Avatar({ size = 40, className = "" }: { size?: number; className?: string }) {
  if (profile.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar}
        alt={profile.name}
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: "linear-gradient(160deg,#a5b4c8,#6b7a90)",
        letterSpacing: "-0.02em",
      }}
    >
      {profile.name
        .split(" ")
        .map((s) => s[0])
        .join("")}
    </span>
  );
}
