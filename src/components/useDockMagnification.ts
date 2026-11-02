"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Dock 放大效果：一个 rAF 循环 + 每个图标一个弹簧，直接写 DOM，不触发 React 渲染。
 *
 * - 放大量按“静止时”的图标中心计算（鼠标进入时测量一次），避免图标变大后反过来影响距离造成抖动。
 * - 每帧只写样式（slot 宽度、scaler 的 transform、tooltip 位置），循环里不读取布局。
 */

export interface DockMagnificationOptions {
  base: number;
  max: number;
  /** 影响半径（px） */
  range: number;
  stiffness?: number;
  damping?: number;
}

interface Item {
  slot: HTMLElement;
  scaler: HTMLElement;
  tooltip: HTMLElement | null;
  rest: number;
  value: number;
  velocity: number;
  target: number;
}

export function useDockMagnification({ base, max, range, stiffness = 320, damping = 28 }: DockMagnificationOptions) {
  const items = useRef(new Map<string, Item>());
  const mouseX = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const last = useRef(0);
  const shownTip = useRef<string | null>(null);
  const enabled = useRef(true);

  const write = (it: Item) => {
    it.slot.style.width = `${it.value}px`;
    it.scaler.style.transform = `scale(${it.value / max})`;
    if (it.tooltip) it.tooltip.style.transform = `translate(-50%, ${-(it.value - base)}px)`;
  };

  const showTooltip = (id: string | null) => {
    if (shownTip.current === id) return;
    const prev = shownTip.current ? items.current.get(shownTip.current) : undefined;
    prev?.tooltip?.removeAttribute("data-show");
    const next = id ? items.current.get(id) : undefined;
    next?.tooltip?.setAttribute("data-show", "true");
    shownTip.current = id;
  };

  const tick = useCallback(
    (now: number) => {
      const dt = Math.min((now - (last.current || now)) / 1000, 1 / 30);
      last.current = now;
      const mx = mouseX.current;
      let moving = false;
      let nearest: string | null = null;
      let nearestD = Infinity;

      items.current.forEach((it, id) => {
        if (mx !== null && enabled.current) {
          const d = Math.abs(mx - it.rest);
          it.target = d >= range ? base : base + (max - base) * ((Math.cos((Math.PI * d) / range) + 1) / 2);
          if (d < nearestD) {
            nearestD = d;
            nearest = id;
          }
        } else {
          it.target = base;
        }
        // 半隐式欧拉积分的阻尼弹簧
        const force = stiffness * (it.target - it.value) - damping * it.velocity;
        it.velocity += force * dt;
        it.value += it.velocity * dt;
        if (Math.abs(it.velocity) < 0.01 && Math.abs(it.target - it.value) < 0.05) {
          it.value = it.target;
          it.velocity = 0;
        } else {
          moving = true;
        }
        write(it);
      });

      // 只给鼠标正下方（最近、且在图标宽度内）的图标显示 tooltip
      showTooltip(mx !== null && nearestD < base * 0.75 ? nearest : null);

      if (moving || mx !== null) raf.current = requestAnimationFrame(tick);
      else {
        raf.current = null;
        last.current = 0;
      }
    },
    [base, max, range, stiffness, damping],
  );

  const start = useCallback(() => {
    if (raf.current === null) raf.current = requestAnimationFrame(tick);
  }, [tick]);

  /**
   * 测量每个图标的“静止中心”（所有图标都是 base 大小时的中心点）。
   * 即使此刻还在放大中也能算对：Dock 居中，放大量 E 让左边缘左移 E/2，
   * 第 i 个图标再被它左边图标的放大量推右。反推即可得到静止位置。
   */
  const measure = useCallback(() => {
    const list = [...items.current.values()].map((it) => ({ it, r: it.slot.getBoundingClientRect() }));
    if (!list.length) return;
    list.sort((a, b) => a.r.left - b.r.left);
    const total = list.reduce((s, { it }) => s + (it.value - base), 0);
    let before = 0;
    for (const { it, r } of list) {
      const extra = it.value - base;
      it.rest = r.left + r.width / 2 + total / 2 - before - extra / 2;
      before += extra;
    }
  }, [base]);

  // 每个 (id, part) 的 ref 回调保持稳定，避免每次渲染都卸载/重新挂载导致弹簧状态被重置
  const refCache = useRef(new Map<string, (el: HTMLElement | null) => void>());
  const register = useCallback(
    (id: string, part: "slot" | "scaler" | "tooltip") => {
      const key = `${id}:${part}`;
      let cb = refCache.current.get(key);
      if (cb) return cb;
      cb = (el: HTMLElement | null) => {
        const map = items.current;
        let it = map.get(id);
        if (!el) {
          if (part === "slot") {
            map.delete(id);
            if (shownTip.current === id) shownTip.current = null;
          }
          return;
        }
        if (!it) {
          it = { slot: el, scaler: el, tooltip: null, rest: 0, value: base, velocity: 0, target: base };
          map.set(id, it);
        }
        if (part === "slot") it.slot = el;
        else if (part === "scaler") it.scaler = el;
        else it.tooltip = el;
        write(it);
      };
      refCache.current.set(key, cb);
      return cb;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, max],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)");
    const update = () => (enabled.current = !mq.matches);
    update();
    mq.addEventListener("change", update);
    const onResize = () => requestAnimationFrame(measure);
    window.addEventListener("resize", onResize);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", onResize);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, [measure]);

  const handlers = {
    onPointerEnter: (e: React.PointerEvent) => {
      if (e.pointerType === "touch") return;
      measure();
      mouseX.current = e.clientX;
      start();
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (mouseX.current === null) measure();
      mouseX.current = e.clientX;
      start();
    },
    onPointerLeave: () => {
      mouseX.current = null;
      start();
    },
  };

  return { register, handlers, measure };
}
