"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { RiAddLine, RiCheckboxCircleLine, RiCloseLine, RiHistoryLine, RiLayoutGridLine, RiLogoutBoxRLine, RiSettings3Line, RiUserSearchLine } from "@remixicon/react";
import { ago, fmtLongToday, todos, type Me, type Msg, type Prospect, type Task } from "./model";
import { AskSheet, FindSheet, MsgSheet, PostSheet, ProspectSheet } from "./sheets";
import { useStudio } from "./useStudio";
import { Settings } from "./settings";
import { Content, History, Prospects, Today, type Open } from "./views";
import "./studio.css";

/*
 * The Studio, rebuilt around one question: "what do I need to do now?". Four places (Tugasku, Konten, Prospek,
 * Riwayat), plain words, one clear action per card, details in a side sheet, every decision undoable for 5 seconds.
 * The look is the team's original Content Studio; the data and the inbox format are unchanged, so the agents that
 * fill the board keep working as they are. The old page stays at /admin/classic.
 */

const VIEWS = [
  { k: "tugas", label: "Tugasku", icon: RiCheckboxCircleLine },
  { k: "konten", label: "Konten", icon: RiLayoutGridLine },
  { k: "prospek", label: "Prospek", icon: RiUserSearchLine },
  { k: "riwayat", label: "Riwayat", icon: RiHistoryLine },
  { k: "pengaturan", label: "Pengaturan", icon: RiSettings3Line },
] as const;
type View = (typeof VIEWS)[number]["k"];

const onHash = (cb: () => void) => (addEventListener("hashchange", cb), () => removeEventListener("hashchange", cb));
const SEEN = "wd-studio-welcome";
const onStorage = (cb: () => void) => (addEventListener("storage", cb), () => removeEventListener("storage", cb));
const readSeen = () => {
  try {
    return localStorage.getItem(SEEN) === "1";
  } catch {
    return false;
  }
};

const Mark = () => (
  <svg viewBox="0 0 107 124.852" className="h-6 w-auto" aria-hidden>
    <path fill="currentColor" fillRule="evenodd" d="M0 30.8798V93.9535L11.6386 100.674V24.1595L0 30.8798ZM20.9307 18.8095V106.043L32.5693 112.763V12.0891L20.9307 18.8095ZM41.8614 6.72035V118.132L53.5 124.852V0L41.8614 6.72035ZM62.7921 5.36877V18.8095L95.3614 37.6002V87.2332L62.7921 106.043V119.483L107 93.9535V30.8798L62.7921 5.36877Z" />
  </svg>
);

function Welcome({ name, onClose }: { name: string; onClose: () => void }) {
  return (
    <section className="panel ticks relative mb-6 overflow-hidden p-5 md:p-6">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(35_110_243/0.35),transparent)]" />
      <button type="button" className="btn ghost sm absolute top-3 right-3" onClick={onClose} aria-label="Tutup panduan">
        <RiCloseLine size={18} />
      </button>
      <p className="lbl mb-2">Selamat datang, {name}</p>
      <h2 className="mb-5 max-w-[34ch] text-[19px] font-semibold text-balance">Studio ini tempat kamu mengarahkan tim konten dan sales webdev.co.id.</h2>
      <ol className="grid gap-3 md:grid-cols-3">
        {[
          ["Tim bekerja", "Tim membuat post Instagram dan menyiapkan pesan untuk calon klien."],
          ["Kamu memutuskan", "Yang butuh keputusanmu muncul di Tugasku. Setujui, minta revisi, atau kirim pesannya."],
          ["Tim melanjutkan", "Keputusanmu dikirim ke tim. Kamu bisa membatalkannya dalam 5 detik."],
        ].map(([t, d], i) => (
          <li key={t} className="flex gap-3">
            <span className="mono flex size-7 shrink-0 items-center justify-center border border-[var(--line-2)] text-[13px] text-[var(--accent-text)]">{i + 1}</span>
            <span>
              <b className="block text-[15px] font-medium">{t}</b>
              <span className="text-[14px] text-[var(--ink-2)]">{d}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function StudioApp({ me }: { me: Me }) {
  const { board, sales, agents, runner, inbox, history: decisions, send, undo, toast, setToast, now, saveDoc } = useStudio(me);
  const [sheet, setSheet] = useState<{ t: "post"; task: Task } | { t: "msg"; msg: Msg; mode: "approve" | "send" } | { t: "prospect"; p: Prospect } | { t: "ask" } | { t: "find" } | null>(null);
  // the view follows the address (#konten), so back/forward and bookmarks work
  const hash = useSyncExternalStore(onHash, () => location.hash.slice(1), () => "");
  const view: View = VIEWS.some((v) => v.k === hash) ? (hash as View) : "tugas";
  const go = (v: View) => {
    history.pushState(null, "", `#${v}`);
    dispatchEvent(new HashChangeEvent("hashchange"));
    scrollTo(0, 0);
  };
  // the first-visit guide, until it is closed once on this device
  const seen = useSyncExternalStore(onStorage, readSeen, () => true);
  const [closed, setClosed] = useState(false);
  const welcome = !seen && !closed;
  const closeWelcome = () => {
    setClosed(true);
    try {
      localStorage.setItem(SEEN, "1");
    } catch {}
  };

  const open: Open = useMemo(
    () => ({
      post: (task) => setSheet({ t: "post", task }),
      msg: (msg, mode) => setSheet({ t: "msg", msg, mode }),
      prospect: (p) => setSheet({ t: "prospect", p }),
      find: () => setSheet({ t: "find" }),
      prospects: () => {
        history.pushState(null, "", "#prospek");
        dispatchEvent(new HashChangeEvent("hashchange"));
        scrollTo(0, 0);
      },
    }),
    [],
  );
  const close = useCallback(() => setSheet(null), []);

  // keep an open sheet's data fresh as the board updates
  const liveTask = sheet?.t === "post" ? (board.data?.tasks ?? []).find((x) => x.id === sheet.task.id) ?? sheet.task : null;

  const count = todos(board.data, sales.data, me).length;
  const syncedAt = [board.data?.synced_at, sales.data?.synced_at].filter(Boolean).sort().pop();
  const stale = syncedAt && now ? now - new Date(syncedAt).getTime() > 36 * 36e5 : false;
  const loading = board.state === "loading" && sales.state === "loading";
  const missing = board.state === "missing" && sales.state === "missing";

  const title = { tugas: "Tugasku", konten: "Konten Instagram", prospek: "Prospek", riwayat: "Riwayat", pengaturan: "Pengaturan" }[view];
  const lede = {
    tugas: count ? `${count === 1 ? "Ada 1 hal" : `Ada ${count} hal`} yang menunggu keputusanmu.` : "Tidak ada yang menunggumu. Tim sedang bekerja.",
    konten: "Semua post dan pekerjaan tim konten, dari yang sedang dibuat sampai yang sudah tayang.",
    prospek: "Daftar usaha yang cocok jadi klien, dari Agent Riset. Buka Instagram-nya, DM sendiri, lalu tandai di sini.",
    riwayat: "Semua yang dikerjakan tim dan keputusan yang sudah dikirim.",
    pengaturan: "Atur agent tim: perannya, aturannya, dan koneksi ke Claude, Gemini, dan Figma.",
  }[view];

  return (
    <div className="studio overflow-x-clip">
      <div className="mx-auto flex min-h-svh max-w-[1440px]">
        {/* side navigation (desktop) */}
        <nav aria-label="Menu Studio" className="sticky top-0 hidden h-svh w-[248px] shrink-0 flex-col border-r border-[var(--line)] px-4 py-6 lg:flex">
          <div className="mb-8 flex items-center gap-3 px-2">
            <Mark />
            <div>
              <b className="block text-[15px] leading-tight font-semibold">webdev.co.id</b>
              <span className="lbl">Studio</span>
            </div>
          </div>
          <ul className="flex flex-col gap-1">
            {VIEWS.map(({ k, label, icon: Icon }) => (
              <li key={k}>
                <button type="button" onClick={() => go(k)} aria-current={view === k ? "page" : undefined} className={`flex h-11 w-full items-center gap-3 px-3 text-[15px] transition-colors ${view === k ? "bg-[var(--ink)] font-medium text-[#0b0b0e]" : "text-[var(--ink-2)] hover:bg-[var(--hover)] hover:text-[var(--ink)]"}`}>
                  <Icon size={19} />
                  <span className="flex-1 text-left">{label}</span>
                  {k === "tugas" && count > 0 && <span className={`mono text-[12px] ${view === k ? "" : "text-[var(--you)]"}`}>{count}</span>}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn primary mt-6 w-full" onClick={() => setSheet({ t: "ask" })} disabled={me.role !== "owner"}>
            <RiAddLine size={18} />
            Minta ke tim
          </button>
          <div className="mt-auto flex flex-col gap-3 border-t border-[var(--line)] pt-4">
            <p className="px-2 text-[13px] text-[var(--ink-2)]">
              {me.name}
              <span className="block text-[12px] text-[var(--ink-3)]">{me.role === "owner" ? "Bisa memutuskan" : "Hanya melihat"}</span>
            </p>
            <form method="post" action="/admin/logout">
              <button type="submit" className="btn ghost sm w-full !justify-start">
                <RiLogoutBoxRLine size={16} />
                Keluar
              </button>
            </form>
          </div>
        </nav>

        <main className="min-w-0 flex-1 overflow-x-clip px-4 pt-5 pb-28 md:px-8 lg:px-10 lg:pt-10 lg:pb-16">
          {/* top bar (phones) */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <Mark />
            <b className="flex-1 text-[15px] font-semibold">Studio</b>
            <button type="button" className="btn primary sm" onClick={() => setSheet({ t: "ask" })} disabled={me.role !== "owner"}>
              <RiAddLine size={17} />
              Minta ke tim
            </button>
            <form method="post" action="/admin/logout">
              <button type="submit" className="btn ghost sm" aria-label="Keluar">
                <RiLogoutBoxRLine size={18} />
              </button>
            </form>
          </div>

          <header className="mb-7">
            <p className="lbl mb-2">{fmtLongToday()}</p>
            <h1 className="text-[28px] leading-tight font-semibold tracking-tight md:text-[34px]">
              {view === "tugas" ? (
                <>
                  <span className="text-[var(--ink-3)]">Halo, {me.name}. </span>
                  {count ? "Ini tugasmu." : "Semua aman."}
                </>
              ) : (
                title
              )}
            </h1>
            <p className="mt-2 max-w-[60ch] text-[15px] text-[var(--ink-2)]">{lede}</p>
          </header>

          {me.role !== "owner" && <p className="panel mb-6 px-4 py-3 text-[14px] text-[var(--ink-2)]">Akunmu hanya bisa melihat. Keputusan (menyetujui, revisi, mengirim) diambil oleh pemilik akun.</p>}
          {stale && !loading && (
            <p className="panel mb-6 border-[color-mix(in_srgb,var(--you)_40%,transparent)] px-4 py-3 text-[14px] text-[var(--you)]">
              Tim belum mengirim pembaruan sejak {ago(syncedAt)}. Data di sini mungkin belum yang terbaru. Minta Mic menjalankan sinkronisasi di laptopnya.
            </p>
          )}
          {welcome && view === "tugas" && <Welcome name={me.name} onClose={closeWelcome} />}

          {loading ? (
            <div className="flex flex-col gap-3" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-[72px] w-full" />
              ))}
            </div>
          ) : view === "pengaturan" ? (
            <Settings agents={agents.data} runner={runner.data} me={me} now={now} save={saveDoc} toast={(text, bad) => setToast({ text, tone: bad ? "bad" : undefined })} />
          ) : missing ? (
            <div className="panel ticks p-8 text-center">
              <p className="text-[17px] font-medium">Belum ada data dari tim.</p>
              <p className="mx-auto mt-2 max-w-[48ch] text-[14px] text-[var(--ink-3)]">Studio akan terisi setelah tim mengirim board pertama mereka. Minta Mic menjalankan &ldquo;Michael, sync dashboard&rdquo;.</p>
            </div>
          ) : view === "tugas" ? (
            <Today board={board.data} sales={sales.data} inbox={inbox} me={me} open={open} send={send} synced={ago(syncedAt)} />
          ) : view === "konten" ? (
            <Content board={board.data} inbox={inbox} open={open} />
          ) : view === "prospek" ? (
            <Prospects sales={sales.data} inbox={inbox} me={me} open={open} />
          ) : (
            <History board={board.data} sales={sales.data} inbox={decisions} me={me} />
          )}
        </main>
      </div>

      {/* bottom tabs (phones) */}
      <nav aria-label="Menu Studio" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[var(--line-2)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        {VIEWS.map(({ k, label, icon: Icon }) => (
          <button key={k} type="button" onClick={() => go(k)} aria-current={view === k ? "page" : undefined} className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] ${view === k ? "text-[var(--ink)]" : "text-[var(--ink-3)]"}`}>
            {view === k && <span className="absolute top-0 h-0.5 w-10 bg-[var(--accent)]" />}
            <Icon size={21} />
            {label}
            {k === "tugas" && count > 0 && <span className="mono absolute top-2 right-[calc(50%-22px)] flex h-4 min-w-4 items-center justify-center bg-[var(--you)] px-1 text-[10px] text-[#1a1000]">{count}</span>}
          </button>
        ))}
      </nav>

      {sheet?.t === "post" && liveTask && <PostSheet task={liveTask} board={board.data} inbox={inbox} me={me} send={send} onClose={close} />}
      {sheet?.t === "msg" && <MsgSheet msg={sheet.msg} mode={sheet.mode} inbox={inbox} me={me} send={send} onClose={close} />}
      {sheet?.t === "prospect" && <ProspectSheet p={(sales.data?.pipeline ?? []).find((x) => x.id === sheet.p.id) ?? sheet.p} inbox={inbox} me={me} send={send} onClose={close} />}
      {sheet?.t === "ask" && <AskSheet board={board.data} me={me} send={send} onClose={close} />}
      {sheet?.t === "find" && <FindSheet me={me} send={send} onClose={close} />}

      {toast && (
        <div className={`toast ${toast.tone === "bad" ? "bad" : ""}`} role="status" aria-live="polite">
          <span>{toast.text}</span>
          {toast.undo ? (
            <button type="button" className="btn sm border-[#0b0b0e] bg-transparent text-[#0b0b0e] hover:!bg-black/10" onClick={() => undo(toast.undo!)}>
              Batalkan
            </button>
          ) : (
            <button type="button" className="btn ghost sm text-[#0b0b0e]" onClick={() => setToast(null)} aria-label="Tutup">
              <RiCloseLine size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
