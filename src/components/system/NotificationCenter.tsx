"use client";

import { LuX } from "react-icons/lu";
import { useSystem, type Toast } from "@/context/System";
import { APPS } from "@/lib/apps";
import { SystemIcon } from "../icons/AppIcons";
import { CalendarWidget, ClockWidget, ContributionsWidget, FeaturedWidget, ProfileWidget } from "./Widgets";

function ago(t: number) {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "now";
  const m = Math.round(s / 60);
  return m < 60 ? `${m}m ago` : `${Math.round(m / 60)}h ago`;
}

export function NotificationCard({ t, onClose }: { t: Toast; onClose?: () => void }) {
  const sys = useSystem();
  return (
    <div
      className="group glass relative flex w-full cursor-default gap-3 rounded-[22px] p-3 pr-4 text-left text-fg"
      onClick={() => {
        t.onClick?.();
        onClose?.();
        sys.setOverlay(null);
      }}
    >
      <SystemIcon name={t.icon ? APPS[t.icon].icon : "aboutmac"} size={38} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[13px] font-semibold">{t.title}</span>
          <span className="ml-auto shrink-0 text-[11px] text-muted">{ago(t.time)}</span>
        </div>
        <p className="mt-0.5 text-[12.5px] leading-snug text-fg-2">{t.body}</p>
      </div>
      {onClose && (
        <button
          aria-label="Dismiss"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="glass absolute -left-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full text-[11px] opacity-0 transition-opacity group-hover:opacity-100"
        >
          <LuX />
        </button>
      )}
    </div>
  );
}

/** 右上角弹出的通知横幅 */
export function Toasts() {
  const sys = useSystem();
  return (
    <div className="fixed right-3 top-[34px] z-[9300] flex w-[360px] max-w-[calc(100vw-24px)] flex-col gap-2">
      {sys.toasts.map((t) => (
        <div key={t.id} className="notif-in">
          <NotificationCard t={t} onClose={() => sys.dismissToast(t.id)} />
        </div>
      ))}
    </div>
  );
}

export function NotificationCenter() {
  const sys = useSystem();
  return (
    <div className="fixed inset-0 z-[9400]" onPointerDown={() => sys.setOverlay(null)}>
      <div
        className="notif-in scroll-area absolute bottom-2 right-2 top-[30px] w-[360px] max-w-[calc(100vw-16px)] space-y-3 overflow-y-auto p-1"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {sys.history.length > 0 && (
          <>
            <div className="flex items-center justify-between px-2 text-[13px] font-semibold text-white drop-shadow">
              Notifications
              <button className="glass rounded-full px-2.5 py-0.5 text-[11px] text-fg" onClick={sys.clearHistory}>
                Clear
              </button>
            </div>
            {sys.history.map((t) => (
              <NotificationCard key={t.id} t={t} />
            ))}
          </>
        )}
        <ProfileWidget solid />
        <div className="grid grid-cols-2 gap-3">
          <CalendarWidget solid />
          <ClockWidget solid />
        </div>
        <ContributionsWidget solid />
        <FeaturedWidget solid />
      </div>
    </div>
  );
}
