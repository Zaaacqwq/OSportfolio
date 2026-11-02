"use client";

import { useMemo } from "react";
import { PLAYLISTS, spotifyTrackId, type PlaylistConfig } from "@/config/music";
import { useData } from "@/context/Data";
import type { Track } from "./store";

export interface Playlist extends Omit<PlaylistConfig, "tracks"> {
  tracks: Track[];
}

/** 配置里的歌单 + 服务端拿到的封面 → 可以直接播放的曲目 */
export function useLibrary(): Playlist[] {
  const { music } = useData();
  return useMemo(
    () =>
      PLAYLISTS.map((p) => ({
        ...p,
        tracks: p.tracks.flatMap((t) => {
          const id = spotifyTrackId(t.spotify);
          if (!id) return [];
          return [
            {
              id,
              title: t.title,
              artist: t.artist,
              album: t.album,
              artwork: music[id]?.artwork ?? null,
              playlistId: p.id,
              accent: p.accent,
            } satisfies Track,
          ];
        }),
      })),
    [music],
  );
}
