/**
 * 壁纸全部由代码生成（SVG 波浪 + 渐变），无需图片素材。
 * 想用自己的图片：把图片放进 /public，然后添加
 *   { id: "mine", name: "Mine", background: "url(/my-wallpaper.jpg) center/cover" }
 */

export interface Wallpaper {
  id: string;
  name: string;
  background: string;
}

/** 生成一张层叠的“沙丘”波浪 SVG，作为 data URI 返回 */
function dunes(sky: [string, string], layers: string[]): string {
  const W = 1600;
  const H = 1000;
  const paths = layers
    .map((color, i) => {
      const n = layers.length;
      const base = H * (0.28 + (i / n) * 0.62);
      const amp = 90 - i * 8;
      const shift = i * 260;
      // 一条由三次贝塞尔组成的起伏曲线
      const p = [
        `M0 ${base + amp * Math.sin(shift)}`,
        `C ${W * 0.18} ${base - amp * 1.4}, ${W * 0.32} ${base + amp * 0.9}, ${W * 0.5} ${base - amp * 0.2}`,
        `S ${W * 0.78} ${base - amp * 1.6}, ${W} ${base + amp * 0.4}`,
        `L ${W} ${H} L 0 ${H} Z`,
      ];
      // 奇数层水平镜像，让层次更自然
      const flip = i % 2 ? ` transform="translate(${W} 0) scale(-1 1)"` : "";
      return `<path d="${p.join(" ")}" fill="${color}"${flip}/>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#s)"/>${paths}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}") center / cover no-repeat`;
}

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "dusk",
    name: "Dusk",
    background: dunes(
      ["#9aa3c4", "#b98bb5"],
      ["#c86b9e", "#a8508f", "#86418c", "#6a2f8a", "#4b2386", "#321a6e"],
    ),
  },
  {
    id: "ocean",
    name: "Ocean",
    background: dunes(
      ["#a7d3ea", "#7fb5dd"],
      ["#4e9fd6", "#2f7fc4", "#2364a8", "#1b4c8a", "#14376c", "#0d2650"],
    ),
  },
  {
    id: "sunset",
    name: "Sunset",
    background: dunes(
      ["#ffd6a5", "#ffb38a"],
      ["#ff9a76", "#f2766b", "#d95a6a", "#b0436b", "#7f3166", "#4e2257"],
    ),
  },
  {
    id: "forest",
    name: "Forest",
    background: dunes(
      ["#cfe3c8", "#a9cdb0"],
      ["#7fb38f", "#5e9a77", "#447f61", "#30654f", "#214b3d", "#15332b"],
    ),
  },
  {
    id: "midnight",
    name: "Midnight",
    background: dunes(
      ["#1c1f3a", "#2b2350"],
      ["#3b2d6b", "#33275f", "#2a2053", "#211a46", "#18133a", "#100c2d"],
    ),
  },
  {
    id: "aurora",
    name: "Aurora",
    background:
      "radial-gradient(at 20% 20%, #5eead4 0, transparent 45%), radial-gradient(at 80% 10%, #a78bfa 0, transparent 45%), radial-gradient(at 70% 80%, #f472b6 0, transparent 50%), radial-gradient(at 10% 90%, #60a5fa 0, transparent 50%), #0f172a",
  },
];

export const getWallpaper = (id: string) => WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
