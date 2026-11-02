import "server-only";
import { PLAYLISTS, spotifyTrackId } from "@/config/music";

export interface TrackMeta {
  artwork: string | null;
  title: string | null;
}

/**
 * 通过 Spotify oEmbed（公开接口，无需 key）获取每首歌的封面。
 * 每小时刷新（ISR）；失败时返回 null，前端会显示生成的渐变封面。
 */
export async function getMusicMeta(): Promise<Record<string, TrackMeta>> {
  const ids = [...new Set(PLAYLISTS.flatMap((p) => p.tracks.map((t) => spotifyTrackId(t.spotify)).filter(Boolean) as string[]))];
  const entries = await Promise.all(
    ids.map(async (id): Promise<[string, TrackMeta]> => {
      try {
        const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/track/${id}`)}`, {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) return [id, { artwork: null, title: null }];
        const j = (await res.json()) as { thumbnail_url?: string; title?: string };
        return [id, { artwork: j.thumbnail_url ?? null, title: j.title ?? null }];
      } catch {
        return [id, { artwork: null, title: null }];
      }
    }),
  );
  return Object.fromEntries(entries);
}
