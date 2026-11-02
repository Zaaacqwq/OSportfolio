"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LuArrowUpRight, LuClock, LuHouse, LuListMusic, LuPlay, LuSearch, LuShuffle } from "react-icons/lu";
import { music, useNowPlaying, getRecent, type Track } from "@/lib/music/store";
import { useLibrary, type Playlist } from "@/lib/music/library";
import type { AppProps } from "@/lib/apps";
import { MobileTabs, Sidebar, SidebarItem, SidebarSection, Toolbar, useWindow } from "../chrome/WindowChrome";
import { Artwork, Equalizer, ProgressBar, ShuffleRepeat, TransportControls } from "../music/MusicParts";

type View = { kind: "home" } | { kind: "playlist"; id: string } | { kind: "recent" } | { kind: "search" };

/** 歌单封面：前 4 首的封面拼贴，或者渐变 */
function PlaylistCover({ p, size, rounded = 10 }: { p: Playlist; size: number; rounded?: number }) {
  const arts = p.tracks.filter((t) => t.artwork).slice(0, 4);
  if (arts.length >= 4) {
    return (
      <span className="grid shrink-0 grid-cols-2 overflow-hidden shadow-md" style={{ width: size, height: size, borderRadius: rounded }}>
        {arts.map((t) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={t.id} src={t.artwork!} alt="" className="h-full w-full object-cover" />
        ))}
      </span>
    );
  }
  if (arts.length) return <Artwork track={arts[0]} size={size} rounded={rounded} className="shadow-md" />;
  if (size < 48) return <Artwork accent={p.accent} size={size} rounded={rounded} />;
  return (
    <span
      className="relative grid shrink-0 place-items-end overflow-hidden p-3 text-left font-display font-bold text-white shadow-md"
      style={{ width: size, height: size, borderRadius: rounded, background: `linear-gradient(135deg, ${p.accent[0]}, ${p.accent[1]})`, fontSize: Math.max(12, size / 9) }}
    >
      <LuListMusic className="absolute right-3 top-3 opacity-80" style={{ fontSize: size / 6 }} />
      <span className="w-full leading-tight drop-shadow">{p.name}</span>
    </span>
  );
}

/** 工具栏中间的 “LCD” 正在播放胶囊 */
function Lcd() {
  const { track, isPreview, status } = useNowPlaying();
  return (
    <div className="absolute left-1/2 hidden h-[38px] w-[min(40%,400px)] -translate-x-1/2 items-center gap-2.5 rounded-[11px] bg-[var(--glass-strong)] px-1.5 shadow-[inset_0_0_0_0.5px_var(--control-border)] md:flex" data-no-drag>
      {track ? (
        <>
          <Artwork track={track} size={30} rounded={6} />
          <div className="min-w-0 flex-1 text-center leading-tight">
            <div className="truncate text-[12px] font-semibold">
              {track.title}
              {isPreview && <span className="ml-1.5 rounded-[4px] bg-hover px-1 py-px text-[9.5px] font-semibold uppercase text-muted">Preview</span>}
            </div>
            <div className="truncate text-[11px] text-muted">{status === "loading" ? "Loading…" : `${track.artist}${track.album ? ` — ${track.album}` : ""}`}</div>
            <ProgressBar showTime={false} className="-mb-1.5 -mt-0.5" />
          </div>
          <a
            href={`https://open.spotify.com/track/${track.id}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Open in Spotify"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-[6px] text-muted hover:bg-hover hover:text-fg"
          >
            <LuArrowUpRight />
          </a>
        </>
      ) : (
        <div className="flex w-full items-center justify-center gap-2 text-[12px] text-muted">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
            <path d="M9 18.5a2.5 2.5 0 1 1-2-2.45V6.2l11-2.2v11.5a2.5 2.5 0 1 1-2-2.45V7.1l-7 1.4z" />
          </svg>
          Not Playing
        </div>
      )}
    </div>
  );
}

export default function Music({ params }: AppProps) {
  const library = useLibrary();
  const now = useNowPlaying();
  const win = useWindow();
  const [view, setView] = useState<View>({ kind: "home" });
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setRecent(getRecent()), [now.track?.id]);
  useEffect(() => {
    if (typeof params?.playlist === "string") setView({ kind: "playlist", id: params.playlist });
  }, [params?.playlist, params?.nonce]);

  const allTracks = useMemo(() => library.flatMap((p) => p.tracks), [library]);
  const playlist = view.kind === "playlist" ? library.find((p) => p.id === view.id) : undefined;

  const listed: Track[] = useMemo(() => {
    if (view.kind === "playlist") return playlist?.tracks ?? [];
    if (view.kind === "recent") return recent.map((id) => allTracks.find((t) => t.id === id)).filter(Boolean) as Track[];
    if (view.kind === "search") {
      const s = q.toLowerCase();
      return allTracks.filter((t) => `${t.title} ${t.artist} ${t.album ?? ""}`.toLowerCase().includes(s));
    }
    return [];
  }, [view, playlist, recent, allTracks, q]);

  // 键盘：空格播放/暂停，←/→ 快退快进，⌘←/⌘→ 切歌，回车播放选中
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.code === "Space") {
        e.preventDefault();
        music.toggle();
      } else if (e.key === "ArrowRight") (e.metaKey || e.ctrlKey ? music.next : () => music.skipBy(10_000))();
      else if (e.key === "ArrowLeft") (e.metaKey || e.ctrlKey ? music.prev : () => music.skipBy(-10_000))();
      else if (e.key === "Enter" && selected) {
        const i = listed.findIndex((t) => t.id === selected);
        if (i >= 0) music.playQueue(listed, i);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [selected, listed]);

  const title =
    view.kind === "home" ? "Home" : view.kind === "recent" ? "Recently Played" : view.kind === "search" ? `Search “${q}”` : (playlist?.name ?? "");

  return (
    <div ref={rootRef} tabIndex={-1} className="flex h-full outline-none">
      <Sidebar width={210}>
        <label className="search-field mb-2 !h-[28px]">
          <LuSearch className="shrink-0" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setView(e.target.value ? { kind: "search" } : { kind: "home" });
            }}
            placeholder="Search"
            aria-label="Search music"
          />
        </label>
        <SidebarItem icon={<LuHouse className="!text-[#ff375f]" />} label="Home" active={view.kind === "home"} onClick={() => setView({ kind: "home" })} />
        <SidebarSection title="Library" />
        <SidebarItem icon={<LuClock className="!text-[#ff375f]" />} label="Recently Played" active={view.kind === "recent"} onClick={() => setView({ kind: "recent" })} />
        <SidebarSection title="Playlists" />
        {library.map((p) => (
          <SidebarItem
            key={p.id}
            icon={<PlaylistCover p={p} size={20} rounded={4} />}
            label={p.name}
            active={view.kind === "playlist" && view.id === p.id}
            onClick={() => setView({ kind: "playlist", id: p.id })}
            trailing={now.playlistId === p.id && now.track ? <Equalizer playing={!now.isPaused} className="text-[#ff375f]" /> : null}
          />
        ))}
      </Sidebar>

      <div className="flex min-w-0 flex-1 flex-col">
        <Toolbar
          left={
            <div className="flex items-center gap-1">
              <TransportControls size={17} btnClass="h-8 w-8 rounded-full text-fg-2 hover:bg-hover" />
              <ShuffleRepeat className="hidden lg:flex" btnClass="grid h-8 w-8 place-items-center rounded-full text-[14px] text-fg-2 hover:bg-hover" />
            </div>
          }
        >
          <Lcd />
        </Toolbar>
        <MobileTabs<string>
          value={view.kind === "playlist" ? view.id : view.kind}
          onChange={(v) => setView(v === "home" || v === "recent" ? { kind: v } : { kind: "playlist", id: v })}
          items={[{ id: "home", label: "Home" }, ...library.map((p) => ({ id: p.id, label: p.name })), { id: "recent", label: "Recent" }]}
        />
        {win?.mobile && now.track && (
          <div className="mx-3 mb-2 flex items-center gap-2 rounded-[12px] bg-win-alt p-2">
            <Artwork track={now.track} size={36} rounded={6} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold">{now.track.title}</div>
              <ProgressBar showTime={false} />
            </div>
            <TransportControls size={16} btnClass="h-8 w-8" />
          </div>
        )}

        <div className="scroll-area min-h-0 flex-1 overflow-y-auto px-6 pb-6" onClick={() => setSelected(null)}>
          {view.kind === "home" ? (
            <>
              <h1 className="mb-4 font-display text-[26px] font-bold tracking-tight">Listen Now</h1>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-5">
                {library.map((p) => (
                  <div key={p.id} className="group">
                    <button className="relative block w-full" onClick={() => setView({ kind: "playlist", id: p.id })} aria-label={`Open ${p.name}`}>
                      <span className="block aspect-square w-full [&>*]:!h-full [&>*]:!w-full">
                        <PlaylistCover p={p} size={200} rounded={12} />
                      </span>
                      <span
                        role="button"
                        aria-label={`Play ${p.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          music.playQueue(p.tracks, 0);
                        }}
                        className="absolute bottom-2.5 left-2.5 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                      >
                        <LuPlay className="ml-0.5" />
                      </span>
                    </button>
                    <div className="mt-2 truncate text-[13px] font-medium">{p.name}</div>
                    <div className="truncate text-[12px] text-muted">{p.tracks.length} songs</div>
                  </div>
                ))}
              </div>
              {recent.length > 0 && (
                <>
                  <h2 className="mb-3 mt-8 text-[17px] font-bold">Recently Played</h2>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {recent
                      .map((id) => allTracks.find((t) => t.id === id))
                      .filter(Boolean)
                      .map((t) => (
                        <button key={t!.id} className="w-[120px] shrink-0 text-left" onClick={() => music.playQueue([t!], 0)}>
                          <Artwork track={t} size={120} rounded={10} />
                          <div className="mt-1.5 truncate text-[12.5px] font-medium">{t!.title}</div>
                          <div className="truncate text-[11.5px] text-muted">{t!.artist}</div>
                        </button>
                      ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {playlist ? (
                <div className="mb-6 flex flex-wrap items-end gap-5">
                  <PlaylistCover p={playlist} size={180} rounded={12} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Playlist</div>
                    <h1 className="font-display text-[30px] font-bold leading-tight tracking-tight">{playlist.name}</h1>
                    <p className="mt-1 max-w-[460px] text-[13px] text-fg-2">{playlist.description}</p>
                    <p className="mt-1 text-[12px] text-muted">{playlist.tracks.length} songs</p>
                    <div className="mt-4 flex gap-2">
                      <button className="btn !h-[32px] !bg-[#ff375f] !px-6 !text-white" onClick={() => music.playQueue(playlist.tracks, 0, { shuffle: false })}>
                        <LuPlay /> Play
                      </button>
                      <button className="btn !h-[32px] !px-6 !text-[#ff375f]" onClick={() => music.playQueue(playlist.tracks, 0, { shuffle: true })}>
                        <LuShuffle /> Shuffle
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <h1 className="mb-4 font-display text-[26px] font-bold tracking-tight">{title}</h1>
              )}

              {listed.length ? (
                <table className="w-full border-collapse text-[13px]">
                  <thead className="text-left text-[11.5px] text-muted">
                    <tr className="border-b border-sep">
                      <th className="w-10 py-1.5 text-center font-medium">#</th>
                      <th className="font-medium">Title</th>
                      <th className="hidden font-medium md:table-cell">Artist</th>
                      <th className="hidden font-medium lg:table-cell">Album</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listed.map((t, i) => {
                      const current = now.track?.id === t.id;
                      const sel = selected === t.id;
                      return (
                        <tr
                          key={`${t.playlistId}-${t.id}`}
                          data-track={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(t.id);
                          }}
                          onDoubleClick={() => music.playQueue(listed, i)}
                          className={`group ${sel ? "bg-[#ff375f] text-white" : i % 2 ? "bg-hover" : ""}`}
                        >
                          <td className="w-10 rounded-l-[6px] py-[5px] text-center">
                            {current ? (
                              <Equalizer playing={!now.isPaused} className={sel ? "text-white" : "text-[#ff375f]"} />
                            ) : (
                              <>
                                <span className={`group-hover:hidden ${sel ? "" : "text-muted"}`}>{i + 1}</span>
                                <button aria-label={`Play ${t.title}`} className="hidden group-hover:inline" onClick={() => music.playQueue(listed, i)}>
                                  <LuPlay />
                                </button>
                              </>
                            )}
                          </td>
                          <td>
                            <span className="flex items-center gap-2.5">
                              <Artwork track={t} size={32} rounded={5} />
                              <span className={`truncate ${current && !sel ? "font-semibold text-[#ff375f]" : ""}`}>{t.title}</span>
                            </span>
                          </td>
                          <td className={`hidden truncate md:table-cell ${sel ? "" : "text-fg-2"}`}>{t.artist}</td>
                          <td className={`hidden truncate rounded-r-[6px] lg:table-cell ${sel ? "" : "text-fg-2"}`}>{t.album ?? ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="py-10 text-center text-[13px] text-muted">{view.kind === "recent" ? "Nothing played yet." : "No songs found."}</p>
              )}
            </>
          )}

          <p className="mt-8 text-center text-[11px] text-muted">
            Playback by Spotify{now.isPreview ? " · 30‑second preview — log in to Spotify in this browser to hear full songs" : ""}.
          </p>
        </div>
      </div>
    </div>
  );
}
