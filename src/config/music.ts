/**
 * ✏️  Music 应用里的歌单。
 *
 * 添加歌曲：在 Spotify 里「分享 → 复制歌曲链接」，粘贴到 spotify 字段，再填上歌名和歌手。
 * 专辑封面会在服务端通过 Spotify oEmbed 自动获取（无需 API key）。
 *
 * 播放由 Spotify 官方嵌入完成：访客在浏览器里登录了 Spotify 可以听完整歌曲，否则是 30 秒试听。
 *
 * ⚠️ 下面是示例歌曲，请换成你自己的。
 */

export interface MusicTrackConfig {
  /** Spotify 歌曲链接（https://open.spotify.com/track/…）或 track ID */
  spotify: string;
  title: string;
  artist: string;
  album?: string;
}

export interface PlaylistConfig {
  id: string;
  name: string;
  description: string;
  /** 封面渐变色 */
  accent: [string, string];
  tracks: MusicTrackConfig[];
}

export const PLAYLISTS: PlaylistConfig[] = [
  {
    id: "coding",
    name: "Coding",
    description: "What's on while I ship. (Example tracks — replace with your own.)",
    accent: ["#ff375f", "#bf5af2"],
    tracks: [
      { spotify: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours" },
      { spotify: "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp", title: "Mr. Brightside", artist: "The Killers", album: "Hot Fuss" },
      { spotify: "https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3", title: "Shape of You", artist: "Ed Sheeran", album: "÷" },
    ],
  },
  {
    id: "late-night",
    name: "Late Night",
    description: "For 2 a.m. debugging sessions. (Example tracks — replace with your own.)",
    accent: ["#0a84ff", "#30d158"],
    tracks: [
      { spotify: "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT", title: "Never Gonna Give You Up", artist: "Rick Astley", album: "Whenever You Need Somebody" },
    ],
  },
];

/** 从链接或 ID 中取出 Spotify track ID */
export function spotifyTrackId(input: string): string | null {
  const m = /(?:track[/:])([A-Za-z0-9]{22})/.exec(input);
  if (m) return m[1];
  return /^[A-Za-z0-9]{22}$/.test(input) ? input : null;
}
