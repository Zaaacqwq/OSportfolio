import "server-only";

/**
 * 构建时 / 每小时（ISR）从 GitHub 拉取公开数据。
 * 任何一步失败都返回 null，页面会退回到静态数据，不会报错。
 * 设置环境变量 GITHUB_TOKEN 可以提高接口限额（可选）。
 */

export interface RepoInfo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  pushedAt: string;
  url: string;
  fork: boolean;
}

export interface ContributionDay {
  date: string;
  level: number;
}

export interface GitHubData {
  repos: RepoInfo[] | null;
  contributions: { total: number | null; days: ContributionDay[] } | null;
  latestRelease: { tag: string; url: string } | null;
}

const USER = "Zaaacqwq";
const REVALIDATE = 3600;

const headers = (): HeadersInit => {
  const h: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "osportfolio" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: headers(), next: { revalidate: REVALIDATE }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function fetchRepos(): Promise<RepoInfo[] | null> {
  type Raw = {
    name: string;
    description: string | null;
    language: string | null;
    stargazers_count: number;
    pushed_at: string;
    html_url: string;
    fork: boolean;
  };
  const data = await getJson<Raw[]>(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`);
  if (!Array.isArray(data)) return null;
  return data.map((r) => ({
    name: r.name,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    pushedAt: r.pushed_at,
    url: r.html_url,
    fork: r.fork,
  }));
}

/** 解析 github.com/users/<user>/contributions 返回的 HTML（无需 token） */
export function parseContributions(html: string): { total: number | null; days: ContributionDay[] } | null {
  const days: ContributionDay[] = [];
  const tdRe = /<td\b[^>]*ContributionCalendar-day[^>]*>/g;
  for (const m of html.match(tdRe) ?? []) {
    const date = /data-date="([\d-]+)"/.exec(m)?.[1];
    const level = /data-level="(\d)"/.exec(m)?.[1];
    if (date && level) days.push({ date, level: Number(level) });
  }
  if (!days.length) return null;
  days.sort((a, b) => a.date.localeCompare(b.date));
  const totalMatch = /([\d,]+)\s+contributions?\s+in the last year/i.exec(html);
  return { total: totalMatch ? Number(totalMatch[1].replace(/,/g, "")) : null, days };
}

async function fetchContributions() {
  try {
    const res = await fetch(`https://github.com/users/${USER}/contributions`, {
      headers: { "User-Agent": "osportfolio" },
      next: { revalidate: REVALIDATE },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return parseContributions(await res.text());
  } catch {
    return null;
  }
}

async function fetchLatestRelease(repo: string) {
  const data = await getJson<{ tag_name: string; html_url: string }>(
    `https://api.github.com/repos/${USER}/${repo}/releases/latest`,
  );
  return data?.tag_name ? { tag: data.tag_name, url: data.html_url } : null;
}

export async function getGitHubData(): Promise<GitHubData> {
  const [repos, contributions, latestRelease] = await Promise.all([
    fetchRepos(),
    fetchContributions(),
    fetchLatestRelease("vibeIsland"),
  ]);
  return { repos, contributions, latestRelease };
}
