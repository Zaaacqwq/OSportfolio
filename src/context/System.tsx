"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { APPS, type AppId } from "@/lib/apps";
import { WALLPAPERS } from "@/lib/wallpapers";
import type { MenuEntry } from "@/lib/menuTypes";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindowState extends Rect {
  id: AppId;
  z: number;
  minimized: boolean;
  maximized: boolean;
  restore?: Rect;
  params?: Record<string, unknown>;
  /** 打开动画的起点（屏幕坐标，通常是 Dock 图标中心） */
  origin?: { x: number; y: number };
  /** 每次打开递增，用来重新触发打开动画 */
  openKey: number;
}

export type Overlay = "spotlight" | "launchpad" | "control" | "notifications" | null;
export type Appearance = "light" | "dark";

export interface Toast {
  id: number;
  title: string;
  body: string;
  icon?: AppId;
  time: number;
  onClick?: () => void;
}

interface State {
  windows: WindowState[];
  topZ: number;
  wallpaper: string;
  appearance: Appearance;
  brightness: number;
  locked: boolean;
  overlay: Overlay;
  contextMenu: { x: number; y: number; items: MenuEntry[] } | null;
  toasts: Toast[];
  history: Toast[];
  openCounter: number;
}

type Action =
  | { type: "open"; id: AppId; params?: Record<string, unknown>; origin?: { x: number; y: number }; viewport: Vp }
  | { type: "close"; id: AppId }
  | { type: "focus"; id: AppId }
  | { type: "minimize"; id: AppId }
  | { type: "toggleMaximize"; id: AppId; viewport: Vp }
  | { type: "move"; id: AppId; rect: Partial<Rect> }
  | { type: "params"; id: AppId; params: Record<string, unknown> }
  | { type: "wallpaper"; id: string }
  | { type: "appearance"; value: Appearance }
  | { type: "brightness"; value: number }
  | { type: "locked"; value: boolean }
  | { type: "overlay"; value: Overlay }
  | { type: "contextMenu"; value: State["contextMenu"] }
  | { type: "toast"; toast: Toast }
  | { type: "dismissToast"; id: number }
  | { type: "clearHistory" };

type Vp = { w: number; h: number };

export const MENU_BAR_H = 26;
export const DOCK_SPACE = 92;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open": {
      const existing = state.windows.find((w) => w.id === action.id);
      const z = state.topZ + 1;
      if (existing) {
        return {
          ...state,
          topZ: z,
          overlay: null,
          windows: state.windows.map((w) =>
            w.id === action.id
              ? { ...w, z, minimized: false, params: action.params ? { ...w.params, ...action.params } : w.params }
              : w,
          ),
        };
      }
      const app = APPS[action.id];
      const { w: vw, h: vh } = action.viewport;
      const usableH = vh - MENU_BAR_H - DOCK_SPACE;
      const w = Math.min(app.size.w, vw - 32);
      const h = Math.min(app.size.h, usableH - 12);
      const n = state.windows.length % 5;
      const x = Math.max(16, Math.round((vw - w) / 2) + (n - 2) * 26);
      const y = Math.max(MENU_BAR_H + 10, Math.round(MENU_BAR_H + (usableH - h) / 2) + (n - 2) * 22);
      const openKey = state.openCounter + 1;
      return {
        ...state,
        topZ: z,
        overlay: null,
        openCounter: openKey,
        windows: [
          ...state.windows,
          {
            id: action.id,
            x,
            y,
            w,
            h,
            z,
            minimized: false,
            maximized: false,
            params: action.params,
            origin: action.origin,
            openKey,
          },
        ],
      };
    }
    case "close":
      return { ...state, windows: state.windows.filter((w) => w.id !== action.id) };
    case "focus": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target || (target.z === state.topZ && !target.minimized)) return state;
      const z = state.topZ + 1;
      return {
        ...state,
        topZ: z,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, z, minimized: false } : w)),
      };
    }
    case "minimize":
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, minimized: true } : w)),
      };
    case "toggleMaximize": {
      const { w: vw, h: vh } = action.viewport;
      const z = state.topZ + 1;
      return {
        ...state,
        topZ: z,
        windows: state.windows.map((w) => {
          if (w.id !== action.id) return w;
          if (w.maximized && w.restore) return { ...w, ...w.restore, z, maximized: false, restore: undefined };
          return {
            ...w,
            z,
            maximized: true,
            restore: { x: w.x, y: w.y, w: w.w, h: w.h },
            x: 0,
            y: MENU_BAR_H,
            w: vw,
            h: vh - MENU_BAR_H,
          };
        }),
      };
    }
    case "move":
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, ...action.rect, maximized: false, restore: undefined } : w,
        ),
      };
    case "params":
      return {
        ...state,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, params: { ...w.params, ...action.params } } : w)),
      };
    case "wallpaper":
      return { ...state, wallpaper: action.id };
    case "appearance":
      return { ...state, appearance: action.value };
    case "brightness":
      return { ...state, brightness: action.value };
    case "locked":
      return { ...state, locked: action.value, overlay: null, contextMenu: null };
    case "overlay":
      return { ...state, overlay: action.value, contextMenu: null };
    case "contextMenu":
      return { ...state, contextMenu: action.value };
    case "toast":
      return {
        ...state,
        toasts: [...state.toasts, action.toast].slice(-3),
        history: [action.toast, ...state.history].slice(0, 20),
      };
    case "dismissToast":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "clearHistory":
      return { ...state, history: [] };
    default:
      return state;
  }
}

export interface SystemApi {
  windows: WindowState[];
  activeId: AppId | null;
  wallpaper: string;
  appearance: Appearance;
  brightness: number;
  locked: boolean;
  overlay: Overlay;
  contextMenu: State["contextMenu"];
  toasts: Toast[];
  history: Toast[];
  open: (id: AppId, params?: Record<string, unknown>, origin?: { x: number; y: number }) => void;
  close: (id: AppId) => void;
  focus: (id: AppId) => void;
  minimize: (id: AppId) => void;
  toggleMaximize: (id: AppId) => void;
  move: (id: AppId, rect: Partial<Rect>) => void;
  setParams: (id: AppId, params: Record<string, unknown>) => void;
  setWallpaper: (id: string) => void;
  setAppearance: (v: Appearance) => void;
  setBrightness: (v: number) => void;
  lock: () => void;
  unlock: () => void;
  setOverlay: (o: Overlay) => void;
  toggleOverlay: (o: Exclude<Overlay, null>) => void;
  showContextMenu: (x: number, y: number, items: MenuEntry[]) => void;
  hideContextMenu: () => void;
  notify: (t: Omit<Toast, "id" | "time">) => void;
  dismissToast: (id: number) => void;
  clearHistory: () => void;
}

const Ctx = createContext<SystemApi | null>(null);

const KEYS = { wallpaper: "osp:wallpaper", appearance: "osp:appearance" };

const viewport = (): Vp =>
  typeof window === "undefined" ? { w: 1280, h: 800 } : { w: window.innerWidth, h: window.innerHeight };

const safeGet = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const safeSet = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
};

let toastId = 1;

export function SystemProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    windows: [],
    topZ: 10,
    wallpaper: WALLPAPERS[0].id,
    appearance: "light",
    brightness: 1,
    locked: true,
    overlay: null,
    contextMenu: null,
    toasts: [],
    history: [],
    openCounter: 0,
  });

  // 恢复上次的壁纸和外观；首次访问跟随系统
  useEffect(() => {
    const wp = safeGet(KEYS.wallpaper);
    if (wp && WALLPAPERS.some((w) => w.id === wp)) dispatch({ type: "wallpaper", id: wp });
    const ap = safeGet(KEYS.appearance);
    const initial: Appearance =
      ap === "dark" || ap === "light" ? ap : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    dispatch({ type: "appearance", value: initial });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = state.appearance;
  }, [state.appearance]);

  const open = useCallback((id: AppId, params?: Record<string, unknown>, origin?: { x: number; y: number }) => {
    const app = APPS[id];
    if (app.kind === "overlay") {
      dispatch({ type: "overlay", value: id === "launchpad" ? "launchpad" : null });
      return;
    }
    dispatch({ type: "open", id, params, origin, viewport: viewport() });
  }, []);
  const close = useCallback((id: AppId) => dispatch({ type: "close", id }), []);
  const focus = useCallback((id: AppId) => dispatch({ type: "focus", id }), []);
  const minimize = useCallback((id: AppId) => dispatch({ type: "minimize", id }), []);
  const toggleMaximize = useCallback((id: AppId) => dispatch({ type: "toggleMaximize", id, viewport: viewport() }), []);
  const move = useCallback((id: AppId, rect: Partial<Rect>) => dispatch({ type: "move", id, rect }), []);
  const setParams = useCallback((id: AppId, params: Record<string, unknown>) => dispatch({ type: "params", id, params }), []);
  const setWallpaper = useCallback((id: string) => {
    dispatch({ type: "wallpaper", id });
    safeSet(KEYS.wallpaper, id);
  }, []);
  const setAppearance = useCallback((value: Appearance) => {
    dispatch({ type: "appearance", value });
    safeSet(KEYS.appearance, value);
  }, []);
  const setBrightness = useCallback((value: number) => dispatch({ type: "brightness", value }), []);
  const lock = useCallback(() => dispatch({ type: "locked", value: true }), []);
  const unlock = useCallback(() => dispatch({ type: "locked", value: false }), []);
  const setOverlay = useCallback((value: Overlay) => dispatch({ type: "overlay", value }), []);
  const showContextMenu = useCallback(
    (x: number, y: number, items: MenuEntry[]) => dispatch({ type: "contextMenu", value: { x, y, items } }),
    [],
  );
  const hideContextMenu = useCallback(() => dispatch({ type: "contextMenu", value: null }), []);
  const notify = useCallback((t: Omit<Toast, "id" | "time">) => {
    const toast = { ...t, id: toastId++, time: Date.now() };
    dispatch({ type: "toast", toast });
    setTimeout(() => dispatch({ type: "dismissToast", id: toast.id }), 7000);
  }, []);
  const dismissToast = useCallback((id: number) => dispatch({ type: "dismissToast", id }), []);
  const clearHistory = useCallback(() => dispatch({ type: "clearHistory" }), []);

  const overlay = state.overlay;
  const toggleOverlay = useCallback(
    (o: Exclude<Overlay, null>) => dispatch({ type: "overlay", value: overlay === o ? null : o }),
    [overlay],
  );

  const activeId = useMemo(() => {
    const visible = state.windows.filter((w) => !w.minimized);
    if (!visible.length) return null;
    return visible.reduce((a, b) => (a.z > b.z ? a : b)).id;
  }, [state.windows]);

  const value = useMemo<SystemApi>(
    () => ({
      windows: state.windows,
      activeId,
      wallpaper: state.wallpaper,
      appearance: state.appearance,
      brightness: state.brightness,
      locked: state.locked,
      overlay: state.overlay,
      contextMenu: state.contextMenu,
      toasts: state.toasts,
      history: state.history,
      open,
      close,
      focus,
      minimize,
      toggleMaximize,
      move,
      setParams,
      setWallpaper,
      setAppearance,
      setBrightness,
      lock,
      unlock,
      setOverlay,
      toggleOverlay,
      showContextMenu,
      hideContextMenu,
      notify,
      dismissToast,
      clearHistory,
    }),
    [
      state,
      activeId,
      open,
      close,
      focus,
      minimize,
      toggleMaximize,
      move,
      setParams,
      setWallpaper,
      setAppearance,
      setBrightness,
      lock,
      unlock,
      setOverlay,
      toggleOverlay,
      showContextMenu,
      hideContextMenu,
      notify,
      dismissToast,
      clearHistory,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSystem() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSystem must be used inside <SystemProvider>");
  return ctx;
}
