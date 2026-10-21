"use client";

import { useMemo, useState } from "react";
import { RiCheckboxCircleFill, RiCloseCircleFill, RiErrorWarningFill, RiHistoryLine, RiLockLine, RiRefreshLine, RiSave3Line } from "@remixicon/react";
import { ago, parseAgent, type AgentsConfig, type Me, type RunnerStatus } from "./model";
import { Empty, Help } from "./ui";

/*
 * Pengaturan: where the agents are set up. The agents run on the team's computer (a runner + Claude Code on the
 * owner's subscription); this page edits what they read (one .md per agent, in agents/config) and shows what the
 * runner reports (runner/status): whether it is on, and whether Claude, Gemini and Figma are connected.
 */

type Save = (path: string, data: unknown) => Promise<void>;

const CONN: { k: "claude" | "gemini" | "figma"; title: string; what: string; how: string[] }[] = [
  {
    k: "claude",
    title: "Claude (langganan)",
    what: "Otak semua agent. Berjalan lewat Claude Code di komputer tim, memakai langganan Claude, tanpa API key.",
    how: ["Pasang Claude Code dan login sekali: jalankan `claude` di Terminal.", "Jalankan runner: `npm run agents` di folder website."],
  },
  {
    k: "gemini",
    title: "Gemini (gambar)",
    what: "Segera hadir: untuk Agent Mockup dan Konten. Belum dipakai agent yang aktif.",
    how: ["Langganan Gemini (aplikasi) tidak bisa dipakai program; yang bisa: API key dari aistudio.google.com (generate gambar berbayar).", "Kalau nanti dipakai: tambahkan `GEMINI_API_KEY=...` ke `.env.local`, lalu restart runner."],
  },
  {
    k: "figma",
    title: "Figma (desain)",
    what: "Segera hadir: untuk Agent Mockup (contoh tampilan) dan Konten. Belum dipakai agent yang aktif.",
    how: ["Di Terminal komputer tim: jalankan `claude`, ketik `/mcp`, pilih figma, lalu Authenticate (login Figma di browser).", "Akun Figma paket Starter cepat kena batas; paket Professional lebih lancar."],
  },
];

function Status({ ok, unknown }: { ok?: boolean; unknown?: boolean }) {
  if (unknown) return <span className="tag">Belum dilaporkan</span>;
  return ok ? (
    <span className="tag ok">
      <RiCheckboxCircleFill size={13} />
      Tersambung
    </span>
  ) : (
    <span className="tag bad">
      <RiCloseCircleFill size={13} />
      Belum
    </span>
  );
}

/** Inline `code` in plain help text. */
const md = (s: string) => s.split(/(`[^`]+`)/g).map((p, i) => (p.startsWith("`") ? <code key={i} className="mono text-[12.5px] text-[var(--ink)]">{p.slice(1, -1)}</code> : p));

export function Settings({ agents, runner, me, now, save, toast }: { agents: AgentsConfig | null; runner: RunnerStatus | null; me: Me; now: number; save: Save; toast: (t: string, bad?: boolean) => void }) {
  const ro = me.role !== "owner";
  const cfg = agents ?? {};
  // in the order the work flows: the content team, then sales, then anyone added, then the shared rules
  const ORDER = ["riset", "pesan", "mockup", "penawaran", "developer", "qa", "konten", "admin"];
  const rank = (k: string) => (k.startsWith("_") ? 99 : ORDER.indexOf(k) < 0 ? 50 : ORDER.indexOf(k));
  const list = Object.entries(cfg.agents ?? {}).sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b));
  const [picked, setSel] = useState<string>("");
  const sel = picked || list[0]?.[0] || "";
  // unsaved edits per agent; an agent without one shows its saved .md
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const current = sel ? cfg.agents?.[sel] : undefined;
  const draft = drafts[sel] ?? current?.md ?? "";
  const setDraft = (v: string) => setDrafts((d) => ({ ...d, [sel]: v }));
  const dropDraft = () =>
    setDrafts((d) => {
      const next = { ...d };
      delete next[sel];
      return next;
    });

  const online = runner?.at && now ? now - new Date(runner.at).getTime() < ((runner.interval_min ?? 5) * 3 + 2) * 6e4 : false;
  const dirty = !!current && draft !== current.md;
  const parsed = useMemo(() => parseAgent(draft), [draft]);

  const put = async (next: AgentsConfig, ok: string) => {
    setBusy(true);
    try {
      await save("agents/config", next);
      toast(ok);
    } catch {
      toast("Gagal menyimpan. Cek koneksi, lalu coba lagi.", true);
    } finally {
      setBusy(false);
    }
  };
  const install = async () => {
    const r = await fetch("/admin/api/agents/defaults", { cache: "no-store" }).then((x) => x.json());
    const at = new Date().toISOString();
    const a: AgentsConfig["agents"] = {};
    for (const x of r.agents as { key: string; md: string }[]) a[x.key] = { md: x.md, updated_at: at, updated_by: me.email, history: [] };
    await put({ enabled: false, interval_min: 5, agents: a }, "Pengaturan awal agent terpasang");
  };
  const saveAgent = () => {
    if (!current) return;
    const at = new Date().toISOString();
    const history = [{ md: current.md, at: current.updated_at || at, by: current.updated_by || "" }, ...(current.history ?? [])].slice(0, 10);
    void put({ ...cfg, agents: { ...cfg.agents, [sel]: { md: draft, updated_at: at, updated_by: me.email, history } } }, `Pengaturan ${parsed.meta.name || sel} disimpan`).then(dropDraft);
  };
  const restore = (v: { md: string }) => setDraft(v.md);

  return (
    <div className="flex flex-col gap-6">
      {/* the runner */}
      <section className="panel ticks p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[60ch]">
            <h2 className="flex items-center gap-2 text-[17px] font-semibold">
              Agent di komputer tim
              <Help text="Agent berjalan di komputer yang login Claude Code. Studio hanya menyimpan pengaturan dan menerima hasilnya." />
            </h2>
            <p className="mt-1 text-[14px] text-[var(--ink-2)]">
              {online ? (
                <>
                  <span className="text-[var(--ok)]">Aktif</span> di {runner?.host || "komputer tim"}, terakhir melapor {ago(runner?.at)}.
                  {runner?.busy && " Sedang bekerja."}
                </>
              ) : runner?.at ? (
                <>Tidak aktif. Terakhir melapor {ago(runner.at)}. Jalankan <code className="mono">npm run agents</code> di komputer tim.</>
              ) : (
                <>Belum pernah tersambung. Jalankan <code className="mono">npm run agents</code> di komputer tim.</>
              )}
            </p>
            {runner?.last_run?.at && (
              <p className={`mt-2 text-[13px] ${runner.last_run.ok === false ? "text-[var(--bad)]" : "text-[var(--ink-3)]"}`}>
                Giliran terakhir {ago(runner.last_run.at)}: {runner.last_run.ok === false ? runner.last_run.error || "gagal" : runner.last_run.summary || `${runner.last_run.items ?? 0} item diproses`}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <label className={`flex cursor-pointer items-center gap-3 ${ro || !agents ? "pointer-events-none opacity-50" : ""}`}>
              <span className="text-[15px] font-medium">{cfg.enabled ? "Agent bekerja" : "Agent dijeda"}</span>
              <input
                type="checkbox"
                className="peer sr-only"
                checked={!!cfg.enabled}
                onChange={(e) => void put({ ...cfg, enabled: e.target.checked }, e.target.checked ? "Agent mulai bekerja di giliran berikutnya" : "Agent dijeda")}
              />
              <span className="relative h-7 w-12 border border-[var(--line-2)] bg-[var(--sunken)] transition-colors peer-checked:border-[var(--accent)] peer-checked:bg-[var(--accent)] after:absolute after:top-1 after:left-1 after:size-[18px] after:bg-[var(--ink)] after:transition-transform peer-checked:after:translate-x-5" />
            </label>
            <label className="flex items-center gap-2 text-[13px] text-[var(--ink-3)]">
              Periksa inbox setiap
              <select
                disabled={ro || !agents}
                value={cfg.interval_min ?? 5}
                onChange={(e) => void put({ ...cfg, interval_min: Number(e.target.value) }, "Jadwal disimpan")}
                className="border border-[var(--line-2)] bg-[var(--sunken)] px-2 py-1 text-[var(--ink)]"
              >
                {[2, 5, 10, 15, 30].map((n) => (
                  <option key={n} value={n}>
                    {n} menit
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <p className="mt-4 flex gap-2 border-t border-[var(--line)] pt-4 text-[13px] text-[var(--you)]">
          <RiErrorWarningFill size={16} className="mt-0.5 shrink-0" />
          Jalankan agent di satu komputer saja. Kalau tim di laptop Mic juga masih sinkron, matikan dulu di sana supaya tidak bekerja dua kali.
        </p>
      </section>

      {/* connections */}
      <section className="grid gap-3 lg:grid-cols-3">
        {CONN.map((c) => {
          const s = runner?.[c.k];
          return (
            <div key={c.k} className="panel p-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-[15px] font-semibold">{c.title}</h3>
                <Status ok={s?.ok} unknown={!s} />
              </div>
              <p className="text-[14px] text-[var(--ink-2)]">{c.what}</p>
              {s?.detail && <p className="mono mt-2 text-[12px] text-[var(--ink-3)]">{s.detail}</p>}
              {!s?.ok && (
                <ol className="mt-3 flex list-decimal flex-col gap-1 pl-4 text-[13px] text-[var(--ink-3)]">
                  {c.how.map((h) => (
                    <li key={h}>{md(h)}</li>
                  ))}
                </ol>
              )}
            </div>
          );
        })}
      </section>

      {/* the agents */}
      <section className="panel">
        <header className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-5 py-4">
          <h2 className="mr-auto flex items-center gap-2 text-[17px] font-semibold">
            Agen
            <Help text="Setiap agent membaca file .md-nya: perannya, aturannya, dan alat yang boleh dipakai. Perubahan dipakai di giliran berikutnya." />
          </h2>
        </header>
        {!agents ? (
          <div className="p-6">
            <Empty title="Agent belum diatur." text="Pasang pengaturan awal: 8 agent sesuai alur kerja (Riset prospek aktif, 7 lainnya segera hadir) dan aturan tim. Semuanya bisa diedit setelahnya." />
            <div className="flex justify-center">
              <button type="button" className="btn primary" disabled={ro || busy} onClick={() => void install()}>
                <RiRefreshLine size={17} />
                Pasang pengaturan awal
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
            <ul className="flex gap-1 overflow-x-auto border-b border-[var(--line)] p-2 lg:flex-col lg:border-r lg:border-b-0">
              {list.map(([k, a]) => {
                const m = parseAgent(a.md).meta;
                return (
                  <li key={k} className="shrink-0">
                    <button type="button" onClick={() => setSel(k)} aria-current={sel === k ? "true" : undefined} className={`w-full px-3 py-2.5 text-left transition-colors ${sel === k ? "bg-[var(--hover)] ring-1 ring-[var(--line-2)]" : "hover:bg-[var(--hover)]"}`}>
                      <span className="flex items-center justify-between gap-2">
                        <span className="block text-[14px] font-medium">{k.startsWith("_") ? "Aturan tim" : m.role || m.name || k}</span>
                        {!k.startsWith("_") && (m.status === "aktif" ? <span className="tag ok h-5 px-1.5 text-[10px]">Aktif</span> : <RiLockLine size={14} className="text-[var(--ink-3)]" aria-label="Segera hadir" />)}
                      </span>
                      <span className="block text-[12px] text-[var(--ink-3)]">{k.startsWith("_") ? "berlaku untuk semua" : m.status === "aktif" ? "Sedang bekerja" : "Segera hadir"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {current ? (
              <div className="flex min-w-0 flex-col gap-3 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="mr-auto text-[13px] text-[var(--ink-3)]">
                    {parsed.meta.description || (sel.startsWith("_") ? "Aturan yang dibaca semua agent." : "")}
                  </p>
                  {(current.history?.length ?? 0) > 0 && (
                    <label className="flex items-center gap-2 text-[13px] text-[var(--ink-3)]">
                      <RiHistoryLine size={15} />
                      <select className="border border-[var(--line-2)] bg-[var(--sunken)] px-2 py-1 text-[var(--ink)]" value="" onChange={(e) => e.target.value && restore(current.history![Number(e.target.value)])}>
                        <option value="">Versi sebelumnya</option>
                        {current.history!.map((h, i) => (
                          <option key={i} value={i}>
                            {ago(h.at)} · {h.by.split("@")[0]}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                {parsed.meta.status && parsed.meta.status !== "aktif" && (
                  <p className="panel flex items-start gap-3 p-4 text-[14px] text-[var(--ink-2)]">
                    <RiLockLine size={18} className="mt-0.5 shrink-0 text-[var(--you)]" />
                    <span>
                      <b className="block font-medium text-[var(--ink)]">Segera hadir</b>
                      Agent ini sedang disiapkan dan belum dijalankan. Rencana tugasnya bisa dibaca di bawah.
                    </span>
                  </p>
                )}
                <textarea
                  className="field mono !min-h-[440px] text-[13px] leading-relaxed"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  readOnly={ro}
                  spellCheck={false}
                  aria-label={`Pengaturan ${sel}`}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[12px] text-[var(--ink-3)]">
                    Diubah {ago(current.updated_at)}
                    {current.updated_by ? ` oleh ${current.updated_by.split("@")[0]}` : ""}
                  </span>
                  <div className="flex gap-2">
                    <button type="button" className="btn ghost sm" disabled={!dirty || busy} onClick={dropDraft}>
                      Batalkan perubahan
                    </button>
                    <button type="button" className="btn primary sm" disabled={ro || !dirty || busy} onClick={saveAgent}>
                      <RiSave3Line size={16} />
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
