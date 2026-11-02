import "server-only";
import fs from "node:fs";
import path from "node:path";

/** 扫描 public/projects/<slug>/ 下的图片，返回 slug → 图片 URL 列表（按文件名排序） */
export function getProjectAssets(): Record<string, string[]> {
  const root = path.join(process.cwd(), "public", "projects");
  const out: Record<string, string[]> = {};
  try {
    for (const slug of fs.readdirSync(root)) {
      const dir = path.join(root, slug);
      if (!fs.statSync(dir).isDirectory()) continue;
      out[slug] = fs
        .readdirSync(dir)
        .filter((f) => /\.(png|jpe?g|gif|webp|avif)$/i.test(f))
        .sort()
        .map((f) => `/projects/${slug}/${f}`);
    }
  } catch {
    /* 目录不存在 */
  }
  return out;
}
