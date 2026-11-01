"use client";

import { useState, type FormEvent } from "react";
import { LuCheck, LuSend } from "react-icons/lu";
import { profile } from "@/config/profile";

/**
 * 不依赖后端：提交时用 mailto: 打开访客的邮件客户端。
 * 如需真正的表单提交，可以把 onSubmit 换成 Formspree / Resend 等服务。
 */
export default function Contact() {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = `${body}\n\n— ${name}${from ? ` <${from}>` : ""}`;
    const url = `mailto:${profile.email}?subject=${encodeURIComponent(subject || `Hello from ${name || "your portfolio"}`)}&body=${encodeURIComponent(text)}`;
    window.location.href = url;
    setSent(true);
  };

  const field = "w-full bg-transparent py-2 text-[14px] outline-none placeholder:text-black/35";

  return (
    <form onSubmit={submit} className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-black/5 px-4">
        <span className="text-[13px] font-semibold">New Message</span>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-md bg-[#2f6fed] px-3 py-1.5 text-[13px] font-medium text-white shadow hover:brightness-110"
        >
          {sent ? <LuCheck /> : <LuSend />} {sent ? "Opened" : "Send"}
        </button>
      </div>
      <div className="divide-y divide-black/5 px-4">
        <label className="flex items-center gap-2">
          <span className="w-16 text-[13px] text-black/45">To:</span>
          <span className="rounded-full bg-[#2f6fed]/10 px-2 py-0.5 text-[13px] text-[#2f6fed]">{profile.email}</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-[13px] text-black/45">Name:</span>
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        </label>
        <label className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-[13px] text-black/45">From:</span>
          <input
            className={field}
            type="email"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-[13px] text-black/45">Subject:</span>
          <input className={field} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Let's work together" />
        </label>
      </div>
      <textarea
        className="min-h-40 flex-1 resize-none border-t border-black/5 bg-white/60 p-4 text-[14px] outline-none placeholder:text-black/35"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your message…"
        required
      />
    </form>
  );
}
