"use client";

import { useState } from "react";
import { LuFileText } from "react-icons/lu";
import { Toolbar } from "../chrome/WindowChrome";

const JUNK = [
  { name: "final_v2_REAL_final.psd", kind: "Photoshop file", note: "We don't talk about this one." },
  { name: "todo-app-#47", kind: "Folder", note: "Every developer's rite of passage." },
  { name: "jquery-spaghetti.js", kind: "JavaScript", note: "It worked. Nobody knew why." },
  { name: "node_modules", kind: "Folder", note: "Heavier than a black hole." },
  { name: "tempMail", kind: "Repository", note: "An empty repo. Ideas are cheap." },
];

export default function Trash() {
  const [items, setItems] = useState(JUNK);
  return (
    <div className="flex h-full flex-col">
      <Toolbar lights title="Trash" subtitle={`${items.length} items`}>
        <button className="btn" disabled={!items.length} onClick={() => setItems([])}>
          Empty
        </button>
      </Toolbar>
      {items.length ? (
        <div className="scroll-area min-h-0 flex-1 overflow-y-auto border-t border-sep">
          {items.map((it, i) => (
            <div key={it.name} className={`flex items-center gap-3 px-5 py-2 ${i % 2 ? "bg-hover" : ""}`}>
              <LuFileText className="shrink-0 text-[20px] text-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{it.name}</p>
                <p className="text-[11.5px] text-muted">{it.note}</p>
              </div>
              <span className="text-[11.5px] text-muted">{it.kind}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid flex-1 place-items-center border-t border-sep text-[14px] text-muted">Trash is empty ✨</div>
      )}
    </div>
  );
}
