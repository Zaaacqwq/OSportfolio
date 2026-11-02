"use client";

import type { Project } from "@/config/projects";
import { glyphFor } from "@/lib/projectGlyphs";
import { GlyphIcon, SystemIcon } from "./AppIcons";

export function ProjectIcon({ project, size = 56, className }: { project: Project; size?: number; className?: string }) {
  if (project.slug === "vibeisland") return <SystemIcon name="vibeisland" size={size} className={className} />;
  return <GlyphIcon glyph={glyphFor(project)} from={project.accent[0]} to={project.accent[1]} size={size} className={className} />;
}
