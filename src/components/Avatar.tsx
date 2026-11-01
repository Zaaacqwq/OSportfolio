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
      className={`grid shrink-0 place-items-center rounded-full font-bold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: "linear-gradient(135deg,#4f8bff,#1d4ed8)",
      }}
    >
      {profile.initials}
    </span>
  );
}
