import type { CSSProperties } from "react";

const HUES = [250, 160, 30, 290, 200, 340, 110, 60];

function hueOf(slug: string) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return HUES[hash % HUES.length];
}

export function ProjectTile({ slug, name, size = "md" }: { slug: string; name: string; size?: "sm" | "md" | "lg" }) {
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  return (
    <span className={`project-tile is-${size}`} style={{ "--tile-hue": hueOf(slug) } as CSSProperties} aria-hidden="true">
      {initial}
    </span>
  );
}
