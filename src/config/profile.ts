/**
 * ✏️  个人信息。修改这个文件即可更新整个网站的个人资料。
 *     项目在 src/config/projects.ts。
 */

export type SocialKey = "github" | "linkedin" | "email" | "blog" | "website" | "x" | "instagram";

export interface SocialLink {
  key: SocialKey;
  label: string;
  url: string;
  /** 展示用的短文本 */
  handle: string;
}

export const profile = {
  name: "Zac Chen",
  firstName: "Zac",
  /** 菜单栏左上角的标志字母 */
  logoLetter: "Z",
  title: "Computer Engineering @ University of Waterloo",
  role: "Software Developer in Test Co-op",
  company: "Sony PlayStation",
  location: "Waterloo, ON",
  email: "zac.chen@uwaterloo.ca",
  motto: "Build the tool you wish existed, then use it every day.",
  /** 头像放到 public/ 下，例如 "/avatar.jpg"；留空则显示字母 */
  avatar: "",
  /** 简历 PDF 放到 public/ 下，例如 "/resume.pdf"；留空则显示自动生成的在线简历 */
  resumePdf: "",
  githubUser: "Zaaacqwq",
  bio: [
    "I'm a Computer Engineering student at the University of Waterloo (2023–2028), currently on co‑op as a Software Developer in Test at Sony PlayStation.",
    "I explore full‑stack development, AI systems, developer tools and automation — and I like building practical software that improves workflows, testing and knowledge access.",
  ],
  now: [
    "Co‑op @ Sony PlayStation — test infrastructure & quality engineering",
    "Shipping VibeIsland, a notch command center for AI coding agents",
    "Building betterUWWorks and DoFocus",
  ],
  skills: {
    Languages: ["TypeScript", "JavaScript", "Python", "Java", "Swift", "C", "C++", "C#", "Go"],
    Frameworks: ["React", "Next.js", "Vue.js", "SwiftUI", "Spring Boot", "FastAPI", "Node.js"],
    Infrastructure: ["Docker", "PostgreSQL", "Redis", "AWS", "Supabase", "Cloudflare"],
    Testing: ["Appium", "Playwright", "Jenkins", "Vitest", "pytest"],
  } as Record<string, string[]>,
  experience: [
    {
      role: "Software Developer in Test Co‑op",
      company: "Sony PlayStation",
      location: "Waterloo, ON",
      period: "Jan 2026 — Apr 2026",
      points: [
        "Contributed to test infrastructure and quality engineering workflows for internal software systems.",
        "Worked with tools and services across automation, backend integration and test management.",
        "Supported scalable testing processes that improve reliability and development efficiency.",
      ],
    },
  ],
  education: [
    { school: "University of Waterloo", degree: "BASc, Computer Engineering", period: "2023 — 2028" },
  ],
  /** 来自 GitHub 个人主页（WakaTime / GitHub 统计）的静态数字；GitHub 接口不可用时显示 */
  stats: {
    linesOfCode: "6.32M",
    contributionsThisYear: 2323,
    publicRepos: 25,
  },
  socials: [
    { key: "github", label: "GitHub", url: "https://github.com/Zaaacqwq", handle: "Zaaacqwq" },
    { key: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/zaaac/", handle: "in/zaaac" },
    { key: "blog", label: "Blog", url: "https://blog.zaaac.vip/", handle: "blog.zaaac.vip" },
    { key: "website", label: "Website", url: "https://zaaac.vip/", handle: "zaaac.vip" },
    { key: "email", label: "Email", url: "mailto:zac.chen@uwaterloo.ca", handle: "zac.chen@uwaterloo.ca" },
  ] as SocialLink[],
};

export type Profile = typeof profile;
