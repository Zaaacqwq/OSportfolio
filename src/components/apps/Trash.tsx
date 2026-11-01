"use client";

import { useState } from "react";
import { LuFileText } from "react-icons/lu";

const JUNK = [
  { name: "final_v2_REAL_final.psd", note: "We don't talk about this one." },
  { name: "todo-app-#47", note: "Every developer's rite of passage." },
  { name: "jquery-spaghetti.js", note: "It worked. Nobody knew why." },
  { name: "node_modules.zip", note: "Heavier than a black hole." },
];

export default function Trash() {
  const [items, setItems] = useState(JUNK);
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-black/5 px-4 text-[13px]">
        <span className="text-black/50">{items.length} items</span>
        <button
          disabled={!items.length}
          onClick={() => setItems([])}
          className="rounded-md border border-black/10 bg-white px-3 py-1 shadow-sm hover:bg-black/[0.03] disabled:opacity-40"
        >
          Empty
        </button>
      </div>
      {items.length ? (
        <ul className="divide-y divide-black/5">
          {items.map((it) => (
            <li key={it.name} className="flex items-center gap-3 px-4 py-2.5">
              <LuFileText className="shrink-0 text-xl text-black/40" />
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-medium">{it.name}</p>
                <p className="text-[12px] text-black/45">{it.note}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid flex-1 place-items-center text-[14px] text-black/40">Trash is empty ✨</div>
      )}
    </div>
  );
}
