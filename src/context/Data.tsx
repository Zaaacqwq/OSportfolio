"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { GitHubData } from "@/lib/github";

export interface SiteData {
  github: GitHubData;
  assets: Record<string, string[]>;
}

const Ctx = createContext<SiteData>({
  github: { repos: null, contributions: null, latestRelease: null },
  assets: {},
});

export function DataProvider({ value, children }: { value: SiteData; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useData = () => useContext(Ctx);

/** 某个项目的图片（public/projects/<slug>/） */
export function useProjectImages(slug: string) {
  return useContext(Ctx).assets[slug] ?? [];
}
