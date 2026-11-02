import type { Project } from "@/config/projects";
import type { SystemApi } from "@/context/System";

/** 按项目的展示方式打开它 */
export function openProject(sys: Pick<SystemApi, "open">, p: Project, origin?: { x: number; y: number }) {
  switch (p.showcase) {
    case "vibeisland":
      return sys.open("vibeisland", undefined, origin);
    case "simulator":
      return sys.open("simulator", { app: p.slug }, origin);
    case "safari":
      return sys.open("safari", { slug: p.slug, nonce: Date.now() }, origin);
    case "terminal":
      return sys.open("terminal", { run: `project ${p.slug}`, nonce: Date.now() }, origin);
    default:
      return sys.open("finder", { quicklook: p.slug, select: p.slug, nonce: Date.now() }, origin);
  }
}
