"use client";

import { useState, type FormEvent } from "react";
import { LuPaperclip, LuSend } from "react-icons/lu";
import { profile } from "@/config/profile";
import { useSystem } from "@/context/System";
import { Toolbar } from "../chrome/WindowChrome";

/**
 * 不需要后端：发送时用 mailto: 打开访客自己的邮件客户端。
 * 想在网页里直接收信，可以把 submit 换成 Formspree / Resend 之类的服务。
 */
export default function Mail() {
  const sys = useSystem();
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!body.trim()) return;
    const text = `${body}\n\n— ${name || "A visitor"}${from ? ` <${from}>` : ""}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject || `Hello from ${name || "your portfolio"}`)}&body=${encodeURIComponent(text)}`;
    sys.notify({ title: "Mail", body: "Your mail app should open with the message ready to send.", icon: "mail" });
  };

  const row = "flex items-center gap-2 border-b border-sep py-[7px]";
  const label = "w-[64px] shrink-0 text-right text-[13px] text-muted";
  const input = "w-full bg-transparent text-[13px] outline-none placeholder:text-muted";

  return (
    <form onSubmit={submit} className="flex h-full flex-col">
      <Toolbar lights title="New Message">
        <div className="tb-capsule">
          <button type="button" className="tb-btn" aria-label="Attach" disabled>
            <LuPaperclip />
          </button>
        </div>
        <button type="submit" disabled={!body.trim()} className="btn btn-primary disabled:opacity-40">
          <LuSend className="text-[12px]" /> Send
        </button>
      </Toolbar>
      <div className="px-4">
        <div className={row}>
          <span className={label}>To:</span>
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[13px] text-accent">{profile.name}</span>
          <span className="text-[12px] text-muted">&lt;{profile.email}&gt;</span>
        </div>
        <label className={row}>
          <span className={label}>From:</span>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </label>
        <label className={row}>
          <span className={label}>Reply‑To:</span>
          <input className={input} type="email" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="you@example.com" />
        </label>
        <label className={row}>
          <span className={label}>Subject:</span>
          <input className={input} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Let's work together" />
        </label>
      </div>
      <textarea
        className="min-h-0 flex-1 resize-none bg-transparent px-6 py-4 text-[14px] leading-relaxed outline-none placeholder:text-muted"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
        }}
        placeholder={`Hi ${profile.firstName}, …`}
        aria-label="Message"
      />
      <div className="border-t border-sep px-4 py-2 text-[11.5px] text-muted">⌘↩ to send · opens your mail app</div>
    </form>
  );
}
