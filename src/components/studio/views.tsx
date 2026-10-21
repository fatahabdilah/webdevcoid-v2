"use client";

import { useMemo, useState } from "react";
import { RiArrowRightSLine, RiCheckboxCircleLine, RiCheckLine, RiMailLine, RiMessage3Line, RiSearchLine, RiTimeLine } from "@remixicon/react";
import {
  JENIS,
  PSTEPS,
  STAGE_INFO,
  STATUS_LABEL,
  WEBSITE_STATUS,
  STEPS,
  STEP_OF,
  TODO_KINDS,
  ago,
  channelLabel,
  daysTo,
  fmtDay,
  igHandle,
  isLate,
  isPost,
  kindLabel,
  pendingFor,
  person,
  plainLog,
  stepLabel,
  pstepOf,
  relDay,
  todos,
  type Board,
  type InboxItem,
  type Me,
  type Msg,
  type Prospect,
  type Sales,
  type Task,
  type Todo,
} from "./model";
import { Empty, Help } from "./ui";

type Send = (type: string, payload: Record<string, unknown>, label: string) => void;
export type Open = { post: (t: Task) => void; msg: (m: Msg, mode: "approve" | "send") => void; prospect: (p: Prospect) => void; find: () => void; prospects: () => void };

function When({ day, late }: { day?: string; late?: boolean }) {
  if (!day) return null;
  const n = daysTo(day) ?? 0;
  const cls = late || n < 0 ? "bad" : n <= 1 ? "you" : "";
  return <span className={`tag ${cls}`}>{n < 0 ? `telat ${-n} hari` : relDay(day)}</span>;
}

/* ---------------------------------------------------------------- Tugasku */

const ICON: Record<Todo["kind"], typeof RiCheckLine> = { dm: RiSearchLine, send: RiMessage3Line, "approve-msg": RiMailLine, approve: RiCheckboxCircleLine, publish: RiCheckLine, prepare: RiTimeLine };

function TodoRow({ t, inbox, me, open, send }: { t: Todo; inbox: InboxItem[]; me: Me; open: Open; send: Send }) {
  const Icon = ICON[t.kind];
  const ro = me.role !== "owner";
  let title = "", sub = "", day: string | undefined, late = false, action = "", onAct = () => {}, onOpen = onAct, pend = false;
  if (t.kind === "dm") {
    title = `${t.count} usaha siap kamu DM`;
    sub = `Dari Agent Riset · teratas: ${t.top.map((p) => p.nama_usaha).join(", ")}`;
    action = "Lihat daftar";
    onAct = onOpen = open.prospects;
  } else if (t.kind === "send") {
    title = `Kirim ${JENIS[t.msg.jenis || ""]?.toLowerCase() || "pesan"} ke ${t.msg.nama}`;
    sub = `${channelLabel(t.msg.kanal)}${t.msg.kampanye ? ` · ${t.msg.kampanye}` : ""}`;
    action = "Kirim";
    onAct = onOpen = () => open.msg(t.msg, "send");
    pend = pendingFor(inbox, { prospek: t.msg.id }).length > 0;
  } else if (t.kind === "approve-msg") {
    title = `Setujui pesan untuk ${t.msg.nama}`;
    sub = `${JENIS[t.msg.jenis || ""] || "Pesan"} · ${channelLabel(t.msg.kanal)}`;
    action = "Lihat";
    onAct = onOpen = () => open.msg(t.msg, "approve");
    pend = pendingFor(inbox, { prospek: t.msg.id }).length > 0;
  } else if (t.kind === "approve") {
    title = `Setujui ${kindLabel(t.task).toLowerCase()} ${t.task.id}: ${t.task.title}`;
    sub = t.task.publish ? `Jadwal tayang ${fmtDay(t.task.publish)}` : t.task.format || "";
    day = t.task.publish;
    late = (daysTo(t.task.publish) ?? 1) < 0;
    action = "Lihat & setujui";
    onAct = onOpen = () => open.post(t.task);
    pend = pendingFor(inbox, { task: t.task.id }).length > 0;
  } else if (t.kind === "publish") {
    title = `Unggah ${t.task.id} ke Instagram`;
    sub = `${t.task.title} · sudah disetujui`;
    day = t.task.publish;
    action = "Sudah tayang";
    onOpen = () => open.post(t.task);
    onAct = () => send("publish", { task: t.task.id, note: "sudah tayang" }, `${t.task.id} ditandai sudah tayang`);
    pend = pendingFor(inbox, { task: t.task.id }).length > 0;
  } else {
    title = `Siapkan: ${t.check.item}`;
    sub = t.mine ? "Untukmu" : `Untuk ${person(t.check.owner, me).name}`;
    day = t.check.due;
    action = "Sudah siap";
    onOpen = onAct = () => send("check", { item: t.index, done: true, note: t.check.item }, "Bahan ditandai siap");
    pend = inbox.some((m) => m.status === "new" && m.type === "check" && (m as { item?: number }).item === t.index);
  }
  const direct = t.kind === "publish" || t.kind === "prepare";
  return (
    <div className="row group cursor-default" onClick={direct ? undefined : onOpen} role={direct ? undefined : "button"} tabIndex={direct ? undefined : 0} onKeyDown={(e) => !direct && e.key === "Enter" && onOpen()}>
      <span className="flex size-10 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--sunken)] text-[var(--you)]">
        <Icon size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{title}</span>
        <span className="block truncate text-[13px] text-[var(--ink-3)]">{sub}</span>
      </span>
      {pend ? (
        <span className="tag info shrink-0">Terkirim ke tim</span>
      ) : (
        <>
          <span className="hidden sm:inline-flex">
            <When day={day} late={late} />
          </span>
          {direct ? (
            <button type="button" className="btn sm shrink-0" disabled={ro} onClick={(e) => (e.stopPropagation(), onAct())}>
              <RiCheckLine size={16} />
              {action}
            </button>
          ) : (
            <span className="btn sm shrink-0 group-hover:border-[var(--accent)] group-hover:text-[var(--accent-text)]">
              {action}
              <RiArrowRightSLine size={16} />
            </span>
          )}
        </>
      )}
    </div>
  );
}

export function Today({ board, sales, inbox, me, open, send, synced }: { board: Board | null; sales: Sales | null; inbox: InboxItem[]; me: Me; open: Open; send: Send; synced: string }) {
  const list = useMemo(() => todos(board, sales, me), [board, sales, me]);
  const [kind, setKind] = useState<Todo["kind"] | "all">("all");
  const shown = kind === "all" ? list : list.filter((t) => t.kind === kind);
  const open_ = list.filter((t) => !(t.kind === "send" || t.kind === "approve-msg" ? pendingFor(inbox, { prospek: t.msg.id }).length : t.kind === "approve" || t.kind === "publish" ? pendingFor(inbox, { task: t.task.id }).length : 0));
  const tasks = board?.tasks ?? [];
  const working = tasks.filter((t) => STEP_OF[t.stage] === "team" && t.stage !== "backlog");
  const late = tasks.filter(isLate);
  const next = tasks.filter((t) => isPost(t) && t.publish && (daysTo(t.publish) ?? -1) >= 0 && STEP_OF[t.stage] !== "live").sort((a, b) => (a.publish! < b.publish! ? -1 : 1)).slice(0, 4);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="panel ticks min-w-0">
        <header className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-5 py-4">
          <h2 className="mr-auto text-[17px] font-semibold">Yang perlu kamu lakukan</h2>
          <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1">
            <button type="button" className="chip" aria-pressed={kind === "all"} onClick={() => setKind("all")}>
              Semua <span className="n">{list.length}</span>
            </button>
            {TODO_KINDS.map(({ kind: k, label }) => {
              const n = list.filter((t) => t.kind === k).length;
              return n ? (
                <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>
                  {label} <span className="n">{n}</span>
                </button>
              ) : null;
            })}
          </div>
        </header>
        {shown.length ? (
          <div>
            {shown.map((t) => (
              <TodoRow key={t.key} t={t} inbox={inbox} me={me} open={open} send={send} />
            ))}
          </div>
        ) : (
          <Empty icon={<RiCheckboxCircleLine size={34} />} title="Semua beres." text={working.length ? `Tim sedang mengerjakan ${working.length} hal. Kamu akan melihatnya di sini begitu perlu keputusanmu.` : "Belum ada yang perlu kamu kerjakan."} />
        )}
        {list.length > 0 && open_.length === 0 && <p className="border-t border-[var(--line)] px-5 py-3 text-[13px] text-[var(--ink-3)]">Semua keputusanmu sudah terkirim. Tim akan memprosesnya.</p>}
      </section>

      <aside className="flex min-w-0 flex-col gap-6">
        <section className="panel p-5">
          <h3 className="lbl mb-3">Tim sedang mengerjakan</h3>
          {working.length ? (
            <ul className="flex flex-col gap-3">
              {working.slice(0, 5).map((t) => {
                const info = STAGE_INFO[t.stage];
                return (
                  <li key={t.id}>
                    <button type="button" onClick={() => open.post(t)} className="w-full text-left">
                      <span className="block truncate text-[14px] font-medium hover:text-[var(--accent-text)]">
                        <span className="mono mr-1.5 text-[var(--ink-3)]">{t.id}</span>
                        {t.title}
                      </span>
                      <span className="block text-[13px] text-[var(--ink-3)]">
                        {person(info.who).name} · {info.label.toLowerCase()}
                        {isLate(t) && <span className="text-[var(--bad)]"> · telat</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[14px] text-[var(--ink-3)]">Tidak ada yang sedang dikerjakan. Minta tim mulai lewat tombol &ldquo;Minta ke tim&rdquo;.</p>
          )}
          {late.length > 0 && <p className="mt-4 text-[13px] text-[var(--bad)]">{late.length} pekerjaan lewat target. Tim sudah diberi tahu di board-nya.</p>}
        </section>

        <section className="panel p-5">
          <h3 className="lbl mb-3">Jadwal tayang berikutnya</h3>
          {next.length ? (
            <ul className="flex flex-col gap-3">
              {next.map((t) => (
                <li key={t.id}>
                  <button type="button" onClick={() => open.post(t)} className="flex w-full items-center gap-3 text-left">
                    <span className="mono w-16 shrink-0 text-[13px] text-[var(--ink-2)]">{fmtDay(t.publish).replace(/^\w+, /, "")}</span>
                    <span className="min-w-0 flex-1 truncate text-[14px] hover:text-[var(--accent-text)]">{t.title}</span>
                    <span className={`size-2 shrink-0 rounded-full ${STEP_OF[t.stage] === "ready" ? "bg-[var(--ok)]" : STEP_OF[t.stage] === "you" ? "bg-[var(--you)]" : "bg-[var(--ink-3)]"}`} aria-label={STEPS.find((x) => x.key === STEP_OF[t.stage])?.label} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[14px] text-[var(--ink-3)]">Belum ada post yang dijadwalkan.</p>
          )}
        </section>

        <p className="flex items-center gap-2 px-1 text-[13px] text-[var(--ink-3)]">
          <span className="size-1.5 rounded-full bg-[var(--ok)]" />
          Data dari tim diperbarui {synced}
        </p>
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- Konten */

export function Content({ board, inbox, open }: { board: Board | null; inbox: InboxItem[]; open: Open }) {
  const [step, setStep] = useState<string>("all");
  const [q, setQ] = useState("");
  const tasks = board?.tasks ?? [];
  const sorted = [...tasks].sort((a, b) => (a.publish || a.due || "9").localeCompare(b.publish || b.due || "9"));
  const list = sorted.filter((t) => (step === "all" || STEP_OF[t.stage] === step) && (!q || `${t.id} ${t.title}`.toLowerCase().includes(q.toLowerCase())));
  const period = board?.project?.period;
  return (
    <div className="flex flex-col gap-6">
      {/* the four steps, explained */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {STEPS.map((s) => {
          const n = tasks.filter((t) => STEP_OF[t.stage] === s.key).length;
          return (
            <button key={s.key} type="button" onClick={() => setStep(step === s.key ? "all" : s.key)} aria-pressed={step === s.key} className={`panel ticks p-4 text-left transition-colors ${step === s.key ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "hover:bg-[var(--hover)]"}`}>
              <span className="flex items-center gap-1">
                <span className="lbl">{s.label}</span>
                <Help text={s.help} />
              </span>
              <span className={`mono mt-2 block text-[32px] leading-none ${s.key === "you" && n ? "text-[var(--you)]" : ""}`}>{n}</span>
            </button>
          );
        })}
      </div>

      <section className="panel">
        <header className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] px-5 py-4">
          <h2 className="mr-auto text-[17px] font-semibold">
            {step === "all" ? "Semua konten" : STEPS.find((s) => s.key === step)?.label}
            {period && <span className="ml-2 text-[13px] font-normal text-[var(--ink-3)]">periode {fmtDay(period[0])} sampai {fmtDay(period[1])}</span>}
          </h2>
          <label className="flex h-10 items-center gap-2 border border-[var(--line)] bg-[var(--sunken)] px-3">
            <RiSearchLine size={16} className="text-[var(--ink-3)]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari post" className="w-40 bg-transparent text-[14px] outline-none placeholder:text-[var(--ink-3)]" />
          </label>
        </header>
        {list.length ? (
          list.map((t) => {
            const s = STEP_OF[t.stage];
            const pend = pendingFor(inbox, { task: t.id }).length > 0;
            return (
              <button key={t.id} type="button" className="row" onClick={() => open.post(t)}>
                <span className="mono w-11 shrink-0 text-[13px] text-[var(--accent-text)]">{t.id}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium">{t.title}</span>
                  <span className="block truncate text-[13px] text-[var(--ink-3)]">
                    {kindLabel(t)}
                    {t.format ? ` · ${t.format}` : ""}
                    {s === "team" ? ` · ${STAGE_INFO[t.stage].label.toLowerCase()}` : ""}
                  </span>
                </span>
                {t.publish && <span className="mono hidden w-24 shrink-0 text-right text-[13px] text-[var(--ink-2)] md:block">{fmtDay(t.publish)}</span>}
                <span className="w-[176px] shrink-0 text-right max-sm:w-auto">
                  {pend ? <span className="tag info">Terkirim ke tim</span> : <span className={`tag ${s === "you" ? "you" : s === "ready" || s === "live" ? "ok" : isLate(t) ? "bad" : ""}`}>{isLate(t) ? "Telat" : stepLabel(t)}</span>}
                </span>
              </button>
            );
          })
        ) : (
          <Empty title={q ? "Tidak ada yang cocok." : "Belum ada konten di tahap ini."} />
        )}
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- Prospek */

export function Prospects({ sales, inbox, me, open }: { sales: Sales | null; inbox: InboxItem[]; me: Me; open: Open }) {
  const [step, setStep] = useState<string>("all");
  const [q, setQ] = useState("");
  const rows = sales?.pipeline ?? [];
  const f = sales?.funnel ?? {};
  const list = rows
    .filter((r) => (step === "all" || pstepOf(r.status) === step) && (!q || `${r.id} ${r.nama_usaha} ${r.kategori ?? ""} ${r.kota ?? ""} ${r.ig_url ?? ""}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (pstepOf(a.status) === "prep" ? 0 : 1) - (pstepOf(b.status) === "prep" ? 0 : 1) || (b.skor ?? 0) - (a.skor ?? 0) || a.id.localeCompare(b.id));
  const searching = inbox.filter((m) => m.status === "new" && m.type === "sales_cmd");
  const ready = rows.filter((r) => r.status === "lolos_icp").length;
  return (
    <div className="flex flex-col gap-6">
      {/* the research agent */}
      <section className="panel ticks flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-[60ch]">
          <h2 className="text-[17px] font-semibold">{ready ? `${ready} usaha siap kamu DM` : "Belum ada daftar prospek"}</h2>
          <p className="mt-1 text-[14px] text-[var(--ink-2)]">
            {searching.length
              ? `Agent Riset sedang mencari: ${searching.map((m) => (m.riset ? `${m.riset.kategori} di ${m.riset.kota}` : m.note)).join("; ")}. Hasilnya muncul di sini.`
              : "Agent Riset mencari usaha yang belum punya website, memberi skor dan alasan, lalu kamu tinggal buka Instagram-nya dan DM."}
          </p>
        </div>
        <button type="button" className="btn primary shrink-0" onClick={open.find} disabled={me.role !== "owner"}>
          <RiSearchLine size={17} />
          Cari prospek
        </button>
      </section>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Disapa", f.sapa ?? 0, "Bisnis yang sudah kita kirimi pesan pertama."],
          ["Membalas", f.balas ?? 0, "Yang membalas pesan kita."],
          ["Ngobrol", f.ngobrol ?? 0, "Yang sedang dalam percakapan serius."],
          ["Jadi klien", f.deal ?? 0, "Yang menyetujui penawaran."],
        ].map(([l, n, h]) => (
          <div key={l as string} className="panel ticks p-4">
            <span className="flex items-center gap-1">
              <span className="lbl">{l}</span>
              <Help text={h as string} />
            </span>
            <span className="mono mt-2 block text-[32px] leading-none">{n}</span>
          </div>
        ))}
      </div>
      <section className="panel">
        <header className="flex flex-wrap items-center gap-3 border-b border-[var(--line)] px-5 py-4">
          <div className="-mx-1 mr-auto flex max-w-full gap-2 overflow-x-auto px-1">
            <button type="button" className="chip" aria-pressed={step === "all"} onClick={() => setStep("all")}>
              Semua <span className="n">{rows.length}</span>
            </button>
            {PSTEPS.map((s) => {
              const n = rows.filter((r) => pstepOf(r.status) === s.key).length;
              return (
                <button key={s.key} type="button" className="chip" aria-pressed={step === s.key} onClick={() => setStep(s.key)} title={s.help}>
                  {s.label} <span className="n">{n}</span>
                </button>
              );
            })}
          </div>
          <label className="flex h-10 items-center gap-2 border border-[var(--line)] bg-[var(--sunken)] px-3">
            <RiSearchLine size={16} className="text-[var(--ink-3)]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari bisnis" className="w-40 bg-transparent text-[14px] outline-none placeholder:text-[var(--ink-3)]" />
          </label>
        </header>
        {list.length ? (
          list.map((r) => (
            <button key={r.id} type="button" className="row" onClick={() => open.prospect(r)}>
              <span className={`mono flex size-9 shrink-0 items-center justify-center border text-[13px] ${(r.skor ?? 0) >= 5 ? "border-[var(--ok)] text-[var(--ok)]" : (r.skor ?? 0) >= 4 ? "border-[var(--accent)] text-[var(--accent-text)]" : "border-[var(--line-2)] text-[var(--ink-3)]"}`} title="Skor kecocokan (1 sampai 5)">
                {r.skor ?? "–"}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">
                  {r.nama_usaha}
                  {igHandle(r.ig_url) && <span className="mono ml-2 text-[12px] font-normal text-[var(--ink-3)]">{igHandle(r.ig_url)}</span>}
                </span>
                <span className="block truncate text-[13px] text-[var(--ink-3)]">{[r.kategori, r.kota, WEBSITE_STATUS[r.website_status || ""] || r.next_action].filter(Boolean).join(" · ")}</span>
              </span>
              <span className={`tag shrink-0 ${pstepOf(r.status) === "you" ? "you" : pstepOf(r.status) === "won" ? "ok" : pstepOf(r.status) === "warm" ? "info" : ""}`}>{STATUS_LABEL[r.status] || r.status}</span>
            </button>
          ))
        ) : (
          <Empty
            title={rows.length ? "Tidak ada yang cocok." : "Belum ada prospek."}
            text={rows.length ? undefined : "Tekan \u201cCari prospek\u201d, pilih jenis usaha dan kotanya. Agent Riset akan mengisi daftar ini."}
          />
        )}
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- Riwayat */

export function History({ board, sales, inbox, me }: { board: Board | null; sales: Sales | null; inbox: InboxItem[]; me: Me }) {
  const [src, setSrc] = useState<"all" | "konten" | "sales" | "kamu">("all");
  const items = useMemo(() => {
    const out: { at: string; who: string; text: string; ref?: string; src: "konten" | "sales" | "kamu" }[] = [];
    for (const l of board?.log ?? []) {
      const text = plainLog(l.msg || "");
      if (text) out.push({ at: l.at, who: l.by || "michael", text, ref: l.task, src: "konten" });
    }
    for (const l of sales?.log ?? []) out.push({ at: l.at || l.tanggal || "", who: l.oleh || "bagas", text: [l.kejadian, l.catatan].filter(Boolean).join(": "), ref: l.id, src: "sales" });
    const LABEL: Record<string, string> = { approve: "Menyetujui", revise: "Minta revisi", publish: "Menandai tayang", check: "Menandai bahan siap", command: "Memberi perintah", sales_approve: "Keputusan pesan", sales_sent: "Mencatat pesan terkirim", sales_reply: "Meneruskan balasan", sales_cmd: "Memberi perintah ke sales" };
    for (const m of inbox) out.push({ at: m.at || "", who: m.by || "", text: `${LABEL[m.type] || m.type}${m.note ? `: ${m.note}` : ""}${m.status === "done" ? " (sudah diproses)" : ""}`, ref: (m.task as string) || (Array.isArray(m.prospek) ? m.prospek.join(", ") : m.prospek || undefined), src: "kamu" });
    return out.filter((x) => x.at).sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [board, sales, inbox]);
  const list = src === "all" ? items : items.filter((x) => x.src === src);
  return (
    <section className="panel">
      <header className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-5 py-4">
        <h2 className="mr-auto text-[17px] font-semibold">Riwayat</h2>
        {(
          [
            ["all", "Semua"],
            ["konten", "Tim konten"],
            ["sales", "Tim sales"],
            ["kamu", "Keputusan"],
          ] as const
        ).map(([k, l]) => (
          <button key={k} type="button" className="chip" aria-pressed={src === k} onClick={() => setSrc(k)}>
            {l}
          </button>
        ))}
      </header>
      {list.length ? (
        <ol>
          {list.slice(0, 200).map((x, i) => {
            const p = x.src === "kamu" ? { name: x.who === me.email ? "Kamu" : x.who.split("@")[0], role: "" } : person(x.who, me);
            return (
              <li key={i} className="flex gap-4 border-t border-[var(--line)] px-5 py-3 first:border-t-0">
                <span className="mono w-24 shrink-0 pt-0.5 text-[12px] text-[var(--ink-3)]">{ago(x.at)}</span>
                <p className="min-w-0 flex-1 text-[14px] text-[var(--ink-2)]">
                  <b className="font-medium text-[var(--ink)]">{p.name}</b>
                  {p.role && <span className="text-[var(--ink-3)]"> ({p.role})</span>}
                  {x.ref && <span className="mono ml-1.5 text-[12px] text-[var(--accent-text)]">{x.ref}</span>} {x.text}
                </p>
              </li>
            );
          })}
        </ol>
      ) : (
        <Empty title="Belum ada riwayat." />
      )}
    </section>
  );
}
