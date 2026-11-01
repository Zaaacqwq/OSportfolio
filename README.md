# OS Portfolio

一个 macOS 风格的交互式个人作品集网站 —— 在浏览器里打开一台“桌面电脑”。

Built with **Next.js 16 · React 19 · TypeScript · Tailwind CSS 4**.

## ✨ Features

- **开机动画**（每个会话播放一次，点击可跳过；菜单里的 *Restart…* 可重播）
- **菜单栏**：头像 + 名字下拉菜单、当前应用名、邮箱、日期时间
- **窗口管理**：拖动标题栏移动、八个方向缩放、双击标题栏最大化、红黄绿按钮（关闭 / 最小化 / 缩放）、点击置顶
- **Dock**：鼠标悬停放大、打开时弹跳、已打开应用下方显示小圆点、再次点击可最小化
- **内置应用**
  | App | 内容 |
  | --- | --- |
  | About Me | 个人简介、技能、经历、教育（Finder 风格侧边栏） |
  | Projects | 项目文件夹，双击打开详情 |
  | Launchpad | 社交账号 + 应用入口 |
  | Terminal | 可交互终端：`help` `about` `projects` `skills` `contact` `open <app>` `ls` `cat` `wallpaper <name>`…支持 ↑↓ 历史和 Tab 补全 |
  | Browser | 起始页：收藏夹 + 项目链接 |
  | Mail | 联系表单（通过 `mailto:` 打开访客的邮件客户端，无需后端） |
  | Resume.pdf | 内嵌 PDF，或根据配置自动生成在线简历 |
  | System Settings | 切换壁纸（会记住选择） |
  | Trash | 小彩蛋 |
- **6 张代码生成的壁纸**，无需任何图片素材
- **移动端适配**：窗口全屏显示，桌面图标横排，Dock 可横向滚动

## 🚀 Getting started

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。

```bash
npm run build && npm start   # 生产构建
npm run lint                  # TypeScript 类型检查
```

## ✏️ 换成你自己的内容

几乎所有内容都在 **`src/config/profile.ts`** 一个文件里：

- `name` / `initials` / `title` / `location` / `email`
- `avatar`：把头像放到 `public/avatar.png`，然后填 `"/avatar.png"`
- `resumePdf`：把简历放到 `public/resume.pdf`，然后填 `"/resume.pdf"`（留空则自动生成在线简历）
- `bio`、`skills`、`experience`、`education`
- `socials`：支持 `github` `linkedin` `x` `instagram` `dribbble` `email` `website` `bilibili` `wechat`
- `projects`：每个项目一个文件夹，可以设置颜色和链接

其他可调整的地方：

| 想改什么 | 文件 |
| --- | --- |
| Dock 顺序 / 桌面图标 / 新增应用 | `src/lib/apps.tsx` |
| 壁纸（或添加自己的图片壁纸） | `src/lib/wallpapers.ts` |
| 终端命令 | `src/components/apps/Terminal.tsx` |
| 整体样式（毛玻璃、窗口、动画） | `src/app/globals.css` |

### 新增一个应用

1. 在 `src/components/apps/` 下新建组件，例如 `Photos.tsx`
2. 在 `src/lib/apps.tsx` 的 `AppId` 和 `APPS` 中注册（标题、图标、默认尺寸、组件）
3. 把它加进 `DOCK` 或 `DESKTOP_ICONS`

## 📁 Structure

```
src/
├── app/                 # Next.js App Router（layout、page、全局样式）
├── config/profile.ts    # ✏️ 你的个人信息
├── context/             # 窗口管理器（打开/关闭/聚焦/最小化/最大化/壁纸）
├── lib/                 # 应用注册表、壁纸、hooks
└── components/
    ├── Desktop.tsx      # 桌面：壁纸 + 标题 + 图标 + 窗口 + Dock
    ├── MenuBar.tsx
    ├── Dock.tsx
    ├── Window.tsx       # 可拖动/缩放的窗口
    ├── BootScreen.tsx
    └── apps/            # 各个应用
```

## ☁️ Deploy

推荐部署到 [Vercel](https://vercel.com/new)：导入这个仓库即可，无需任何配置。

---

Design inspired by the desktop‑metaphor portfolio idea (e.g. [fabiconcept/macintosh-os](https://github.com/fabiconcept/macintosh-os)); all code, icons and wallpapers here are original.
