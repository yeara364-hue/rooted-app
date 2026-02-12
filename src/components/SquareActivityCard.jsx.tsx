import React from "react";

type Platform = "spotify" | "youtube" | "inapp";

type SquareActivityCardProps = {
  title: string;
  subtitle?: string;
  duration?: string; // "5:32"
  platform: Platform;
  illustrationSrc: string; // "/illustrations/breathing-01.png"
  onClick?: () => void;
};

const PLATFORM_LABEL: Record<Platform, string> = {
  spotify: "Spotify",
  youtube: "YouTube",
  inapp: "Rooted",
};

export function SquareActivityCard({
  title,
  subtitle,
  duration,
  platform,
  illustrationSrc,
  onClick,
}: SquareActivityCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-square w-[180px] sm:w-[200px] overflow-hidden rounded-2xl shadow-sm transition-transform active:scale-[0.98] hover:scale-[1.01] focus:outline-none"
      aria-label={`${title} (${PLATFORM_LABEL[platform]})`}
    >
      {/* Background illustration */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${illustrationSrc})` }}
      />

      {/* Optional: subtle blur/glow layer (nice if illustrations are flat) */}
      <div className="absolute inset-0 bg-black/5" />

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

      {/* Platform badge (top-left) */}
      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-black backdrop-blur">
        <PlatformDot platform={platform} />
        <span>{PLATFORM_LABEL[platform]}</span>
      </div>

      {/* Duration (bottom-right) */}
      {duration ? (
        <div className="absolute bottom-3 right-3 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-black backdrop-blur">
          {duration}
        </div>
      ) : null}

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-left text-white">
        <div className="text-sm font-semibold leading-snug line-clamp-2">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-1 text-xs text-white/85 line-clamp-1">
            {subtitle}
          </div>
        ) : null}
      </div>

      {/* Hover sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute -inset-10 rotate-12 bg-white/10 blur-xl" />
      </div>
    </button>
  );
}

function PlatformDot({ platform }: { platform: Platform }) {
  // לא מגדירים צבעים ספציפיים? פה זה רק נקודה קטנה—אם את רוצה בלי צבע בכלל, אפשר להחליף לאייקון קבוע.
  const cls =
    platform === "spotify"
      ? "bg-emerald-500"
      : platform === "youtube"
      ? "bg-red-500"
      : "bg-sky-500";

  return <span className={`h-2 w-2 rounded-full ${cls}`} />;
}
