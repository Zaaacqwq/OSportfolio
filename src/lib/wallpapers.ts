/**
 * 原创的“流光”壁纸：模糊光斑 + 弧形玻璃丝带，全部由代码生成。
 * 每张壁纸都有浅色和深色两个版本，跟随系统外观自动切换（类似 macOS 动态壁纸）。
 *
 * 想用自己的图片：把图片放进 public/wallpapers/，然后添加
 *   { id: "mine", name: "Mine", light: "url(/wallpapers/a.jpg) center/cover", dark: "url(/wallpapers/b.jpg) center/cover" }
 */

export interface Wallpaper {
  id: string;
  name: string;
  light: string;
  dark: string;
}

interface Palette {
  sky: [string, string];
  glows: string[];
  ribbons: [string, string][];
}

function flow(p: Palette): string {
  const W = 1600;
  const H = 1000;
  const glowPos = [
    [260, 220, 520],
    [1300, 180, 480],
    [900, 760, 620],
    [200, 900, 460],
  ];
  const glows = p.glows
    .map((c, i) => {
      const [x, y, r] = glowPos[i % glowPos.length];
      return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.7}" fill="${c}"/>`;
    })
    .join("");

  // 三条从左下扫向右上的丝带
  const ribbonShapes = [
    "M-100 760 C 300 560, 620 900, 1000 640 S 1500 380, 1750 460 L 1750 640 C 1450 600, 1250 820, 980 860 S 380 820, -100 1000 Z",
    "M-100 560 C 260 380, 640 700, 1040 500 S 1480 240, 1750 300 L 1750 420 C 1460 380, 1240 620, 1000 680 S 300 560, -100 760 Z",
    "M-100 360 C 300 220, 700 480, 1080 330 S 1500 120, 1750 160 L 1750 240 C 1480 220, 1220 420, 1000 470 S 340 340, -100 520 Z",
  ];
  const ribbonDefs = p.ribbons
    .map(
      ([a, b], i) =>
        `<linearGradient id="r${i}" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`,
    )
    .join("");
  const ribbons = p.ribbons
    .map(
      (_, i) =>
        `<path d="${ribbonShapes[i % 3]}" fill="url(#r${i})" opacity=".92"/><path d="${ribbonShapes[i % 3].split(" L ")[0]}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>`,
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="${p.sky[0]}"/><stop offset="1" stop-color="${p.sky[1]}"/></linearGradient>${ribbonDefs}<filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="90"/></filter><filter id="soft"><feGaussianBlur stdDeviation="3"/></filter></defs><rect width="${W}" height="${H}" fill="url(#s)"/><g filter="url(#b)" opacity=".85">${glows}</g><g filter="url(#soft)">${ribbons}</g></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") center / cover no-repeat`;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "lake",
    name: "Lake",
    light: flow({
      sky: ["#bfe3ff", "#5aa6f0"],
      glows: ["#ffffff", "#9fd8ff", "#2b7be4", "#c2b8ff"],
      ribbons: [
        ["#1d6fe0", "#0a4fc2"],
        ["#3d95f5", "#1c6be0"],
        ["#8fcbff", "#4ea2f7"],
      ],
    }),
    dark: flow({
      sky: ["#0b1d3a", "#04101f"],
      glows: ["#1f4fa8", "#123a7a", "#0b2a5e", "#3a2a8a"],
      ribbons: [
        ["#0e3f9c", "#082c70"],
        ["#1653c2", "#0b3a8f"],
        ["#2f6fe0", "#1a4fb8"],
      ],
    }),
  },
  {
    id: "dune",
    name: "Dune",
    light: flow({
      sky: ["#ffe7c7", "#f6b07a"],
      glows: ["#fff6e5", "#ffc58f", "#f27a52", "#ffd1a8"],
      ribbons: [
        ["#e2683c", "#c44a2a"],
        ["#f58d55", "#e0663a"],
        ["#ffc187", "#f7925b"],
      ],
    }),
    dark: flow({
      sky: ["#2a140f", "#140806"],
      glows: ["#6a2a17", "#4a1d10", "#7a3218", "#3a1a2a"],
      ribbons: [
        ["#8a3417", "#5e2210"],
        ["#a8461e", "#7a3014"],
        ["#c9632d", "#9a451c"],
      ],
    }),
  },
  {
    id: "bloom",
    name: "Bloom",
    light: flow({
      sky: ["#f6dcff", "#c99cf5"],
      glows: ["#ffffff", "#ffb3e1", "#8f6bff", "#ffd6f0"],
      ribbons: [
        ["#8a4dff", "#6b2fe0"],
        ["#c065f5", "#9447e8"],
        ["#ff9fd8", "#d97cf0"],
      ],
    }),
    dark: flow({
      sky: ["#1d0b33", "#0c0418"],
      glows: ["#4c1f8a", "#6a1f6f", "#2a1366", "#5a1a5a"],
      ribbons: [
        ["#4a1fa8", "#2f1078"],
        ["#7a2fbf", "#511c94"],
        ["#b04aa8", "#7a2f9a"],
      ],
    }),
  },
  {
    id: "meadow",
    name: "Meadow",
    light: flow({
      sky: ["#e2f6d8", "#93d1a6"],
      glows: ["#ffffff", "#c8f0a8", "#3fa77a", "#bde9e0"],
      ribbons: [
        ["#2f8f62", "#1e6e4a"],
        ["#4fb07c", "#2f8f62"],
        ["#9edb9a", "#5dbd85"],
      ],
    }),
    dark: flow({
      sky: ["#0a1f17", "#04100b"],
      glows: ["#1a5a3e", "#0f3d2a", "#1d4a4a", "#244a1f"],
      ribbons: [
        ["#14573b", "#0b3a27"],
        ["#1f7550", "#135438"],
        ["#3a9a6a", "#22744d"],
      ],
    }),
  },
  {
    id: "graphite",
    name: "Graphite",
    light: flow({
      sky: ["#eef0f4", "#b8bec8"],
      glows: ["#ffffff", "#dfe3ea", "#8a93a3", "#cfd6e2"],
      ribbons: [
        ["#5d6675", "#3f4652"],
        ["#8a93a3", "#646d7d"],
        ["#c4cad4", "#98a0ae"],
      ],
    }),
    dark: flow({
      sky: ["#18191c", "#0a0a0c"],
      glows: ["#33363d", "#24262b", "#3a3f4a", "#2a2d33"],
      ribbons: [
        ["#2b2e35", "#1b1d22"],
        ["#3d424c", "#2a2d34"],
        ["#5a606c", "#3e434c"],
      ],
    }),
  },
];

export const getWallpaper = (id: string) => WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
