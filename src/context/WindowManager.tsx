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
  /** 最大化之前的位置，用于还原 */
  restore?: Rect;
  /** 打开时附带的参数，例如要显示的项目 */
  params?: Record<string, unknown>;
}

interface State {
  windows: WindowState[];
  topZ: number;
  wallpaper: string;
}

type Action =
  | { type: "open"; id: AppId; params?: Record<string, unknown>; viewport: { w: number; h: number } }
  | { type: "close"; id: AppId }
  | { type: "focus"; id: AppId }
  | { type: "minimize"; id: AppId }
  | { type: "toggleMaximize"; id: AppId; viewport: { w: number; h: number } }
  | { type: "move"; id: AppId; rect: Partial<Rect> }
  | { type: "wallpaper"; id: string };

export const MENU_BAR_H = 28;
export const DOCK_SPACE = 84;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "open": {
      const existing = state.windows.find((w) => w.id === action.id);
      const z = state.topZ + 1;
      if (existing) {
        return {
          ...state,
          topZ: z,
          windows: state.windows.map((w) =>
            w.id === action.id
              ? { ...w, z, minimized: false, params: action.params ?? w.params }
              : w,
          ),
        };
      }
      const app = APPS[action.id];
      const { w: vw, h: vh } = action.viewport;
      const usableH = vh - MENU_BAR_H - DOCK_SPACE;
      const w = Math.min(app.size.w, vw - 24);
      const h = Math.min(app.size.h, usableH - 16);
      // 每打开一个窗口错开一点，避免完全重叠
      const offset = (state.windows.length % 6) * 28;
      const x = Math.max(12, Math.round((vw - w) / 2) - 80 + offset);
      const y = Math.max(MENU_BAR_H + 8, Math.round(MENU_BAR_H + (usableH - h) / 2) - 40 + offset);
      return {
        ...state,
        topZ: z,
        windows: [
          ...state.windows,
          { id: action.id, x, y, w, h, z, minimized: false, maximized: false, params: action.params },
        ],
      };
    }
    case "close":
      return { ...state, windows: state.windows.filter((w) => w.id !== action.id) };
    case "focus": {
      const target = state.windows.find((w) => w.id === action.id);
      if (!target || target.z === state.topZ) return state;
      const z = state.topZ + 1;
      return {
        ...state,
        topZ: z,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, z } : w)),
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
          if (w.maximized && w.restore) {
            return { ...w, ...w.restore, z, maximized: false, restore: undefined };
          }
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
          w.id === action.id ? { ...w, ...action.rect, maximized: false } : w,
        ),
      };
    case "wallpaper":
      return { ...state, wallpaper: action.id };
    default:
      return state;
  }
}

interface WindowManagerValue {
  windows: WindowState[];
  topZ: number;
  activeId: AppId | null;
  wallpaper: string;
  open: (id: AppId, params?: Record<string, unknown>) => void;
  close: (id: AppId) => void;
  focus: (id: AppId) => void;
  minimize: (id: AppId) => void;
  toggleMaximize: (id: AppId) => void;
  move: (id: AppId, rect: Partial<Rect>) => void;
  setWallpaper: (id: string) => void;
}

const Ctx = createContext<WindowManagerValue | null>(null);

const WALLPAPER_KEY = "osportfolio:wallpaper";

const viewport = () =>
  typeof window === "undefined"
    ? { w: 1280, h: 800 }
    : { w: window.innerWidth, h: window.innerHeight };

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    windows: [],
    topZ: 10,
    wallpaper: WALLPAPERS[0].id,
  });

  // 读取上次选择的壁纸
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WALLPAPER_KEY);
      if (saved && WALLPAPERS.some((w) => w.id === saved)) dispatch({ type: "wallpaper", id: saved });
    } catch {
      /* 隐私模式等情况下 localStorage 不可用 */
    }
  }, []);

  const open = useCallback(
    (id: AppId, params?: Record<string, unknown>) => {
      const app = APPS[id];
      if (app.href) {
        window.open(app.href, "_blank", "noopener,noreferrer");
        return;
      }
      dispatch({ type: "open", id, params, viewport: viewport() });
    },
    [],
  );
  const close = useCallback((id: AppId) => dispatch({ type: "close", id }), []);
  const focus = useCallback((id: AppId) => dispatch({ type: "focus", id }), []);
  const minimize = useCallback((id: AppId) => dispatch({ type: "minimize", id }), []);
  const toggleMaximize = useCallback(
    (id: AppId) => dispatch({ type: "toggleMaximize", id, viewport: viewport() }),
    [],
  );
  const move = useCallback((id: AppId, rect: Partial<Rect>) => dispatch({ type: "move", id, rect }), []);
  const setWallpaper = useCallback((id: string) => {
    dispatch({ type: "wallpaper", id });
    try {
      localStorage.setItem(WALLPAPER_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const activeId = useMemo(() => {
    const visible = state.windows.filter((w) => !w.minimized);
    if (!visible.length) return null;
    return visible.reduce((a, b) => (a.z > b.z ? a : b)).id;
  }, [state.windows]);

  const value = useMemo(
    () => ({
      windows: state.windows,
      topZ: state.topZ,
      wallpaper: state.wallpaper,
      activeId,
      open,
      close,
      focus,
      minimize,
      toggleMaximize,
      move,
      setWallpaper,
    }),
    [state, activeId, open, close, focus, minimize, toggleMaximize, move, setWallpaper],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWindowManager() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWindowManager must be used inside <WindowManagerProvider>");
  return ctx;
}
