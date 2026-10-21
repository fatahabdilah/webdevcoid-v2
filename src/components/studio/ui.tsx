"use client";

import { useEffect, type ReactNode } from "react";
import { RiCloseLine, RiQuestionLine } from "@remixicon/react";

/** A side sheet (full screen on phones): closes on Escape or the scrim. */
export function Sheet({ title, onClose, children, footer }: { title: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <>
      <div className="scrim" onClick={onClose} aria-hidden />
      <aside className="sheet" role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : undefined}>
        <header className="flex items-start gap-3 border-b border-[var(--line)] px-5 py-4 md:px-7">
          <div className="min-w-0 flex-1">{title}</div>
          <button type="button" className="btn ghost sm -mr-2" onClick={onClose} aria-label="Tutup">
            <RiCloseLine size={20} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-7">{children}</div>
        {footer && <footer className="border-t border-[var(--line)] bg-[var(--raised)] px-5 py-4 pb-[calc(16px+env(safe-area-inset-bottom))] md:px-7">{footer}</footer>}
      </aside>
    </>
  );
}

/** A small "?" that explains a term in one sentence (hover or tap). */
export function Help({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button type="button" className="inline-flex size-5 items-center justify-center text-[var(--ink-3)] hover:text-[var(--ink)]" aria-label={text}>
        <RiQuestionLine size={15} />
      </button>
      <span role="tooltip" className="pointer-events-none absolute top-full left-1/2 z-30 mt-2 w-64 -translate-x-1/2 border border-[var(--line-2)] bg-[var(--raised)] p-3 text-[13px] leading-snug font-normal tracking-normal text-[var(--ink-2)] normal-case opacity-0 shadow-[var(--pop)] transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

/** An empty state: a calm sentence, never a blank box. */
export function Empty({ title, text, icon }: { title: string; text?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      {icon && <span className="mb-1 text-[var(--ok)]">{icon}</span>}
      <p className="text-[16px] font-medium">{title}</p>
      {text && <p className="max-w-[44ch] text-[14px] text-[var(--ink-3)]">{text}</p>}
    </div>
  );
}

/* A tiny, safe Markdown reader for the team's docs: headings, lists, bold, rules, paragraphs (no HTML). */
function inline(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i}>{p.slice(2, -2)}</strong>
    ) : p.startsWith("`") && p.endsWith("`") ? (
      <code key={i} className="mono text-[13px] text-[var(--ink)]">
        {p.slice(1, -1)}
      </code>
    ) : (
      p
    ),
  );
}
export function Doc({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) out.push(<ul key={`l${out.length}`}>{list.map((l, i) => <li key={i}>{inline(l)}</li>)}</ul>);
    list = [];
  };
  text.split("\n").forEach((raw, i) => {
    const l = raw.trimEnd();
    const li = l.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/);
    if (li) return void list.push(li[1]);
    flush();
    if (!l.trim()) return;
    const h = l.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const H = (`h${h[1].length}` as "h1" | "h2" | "h3");
      out.push(<H key={i}>{inline(h[2])}</H>);
    } else if (/^-{3,}$/.test(l.trim())) out.push(<hr key={i} />);
    else out.push(<p key={i}>{inline(l.replace(/^>\s?/, ""))}</p>);
  });
  flush();
  return <div className="doc text-[15px]">{out}</div>;
}
