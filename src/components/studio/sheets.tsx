"use client";

import { useState } from "react";
import { RiCheckLine, RiExternalLinkLine, RiFileCopyLine, RiMailLine, RiSendPlaneLine, RiTimeLine, RiEditLine, RiUserSearchLine } from "@remixicon/react";
import {
  DOC_TABS,
  JENIS,
  PEOPLE,
  STAGE_INFO,
  STATUS_LABEL,
  WEBSITE_STATUS,
  STEP_OF,
  channelLabel,
  fmtDay,
  igHandle,
  isLate,
  isPost,
  kindLabel,
  pendingFor,
  person,
  relDay,
  stepLabel,
  type Board,
  type InboxItem,
  type Me,
  type Msg,
  type Prospect,
  type Task,
} from "./model";
import { Doc, Sheet } from "./ui";

type Send = (type: string, payload: Record<string, unknown>, label: string) => void;

const REVISE_CHIPS = ["Teksnya kepanjangan", "Ganti warna atau gaya", "Gambarnya kurang pas", "Ada salah ketik", "Judulnya kurang menarik"];

/** "Sent, waiting for the team to pick it up". */
function Pending({ who }: { who: string }) {
  return (
    <p className="flex items-center gap-2 text-[14px] text-[var(--accent-text)]">
      <RiTimeLine size={17} />
      Keputusanmu sudah terkirim. Statusnya berubah setelah {who} memprosesnya.
    </p>
  );
}

/* ---------------------------------------------------------------- a post (or another piece of work) */

export function PostSheet({ task: t, board, inbox, me, send, onClose }: { task: Task; board: Board | null; inbox: InboxItem[]; me: Me; send: Send; onClose: () => void }) {
  const docs = board?.docs?.[t.id] ?? {};
  const tabs = DOC_TABS.filter(([k]) => docs[k]);
  const [tab, setTab] = useState(tabs[0]?.[0] ?? "");
  const [revising, setRevising] = useState(false);
  const [note, setNote] = useState("");
  const pend = pendingFor(inbox, { task: t.id }).length > 0;
  const ro = me.role !== "owner";
  const step = STEP_OF[t.stage] ?? "team";
  const info = STAGE_INFO[t.stage];
  const openFb = (t.feedback ?? []).filter((f) => !f.resolved);

  const approve = () => {
    send("approve", { task: t.id, note: "", force: t.stage !== "approval", from_stage: t.stage }, `${t.id} disetujui, dikirim ke tim`);
    onClose();
  };
  const revise = () => {
    if (!note.trim()) return;
    send("revise", { task: t.id, note: note.trim() }, `Revisi ${t.id} dikirim ke tim`);
    onClose();
  };
  const publish = () => {
    send("publish", { task: t.id, note: "sudah tayang" }, `${t.id} ditandai sudah tayang`);
    onClose();
  };

  let footer = null;
  if (pend) footer = <Pending who="Michael" />;
  else if (ro) footer = <p className="text-[14px] text-[var(--ink-3)]">Akunmu hanya bisa melihat. Keputusan diambil oleh pemilik akun.</p>;
  else if (step === "live") footer = <p className="flex items-center gap-2 text-[14px] text-[var(--ok)]"><RiCheckLine size={17} />Sudah tayang di Instagram.</p>;
  else if (step === "ready" && !isPost(t)) footer = <p className="flex items-center gap-2 text-[14px] text-[var(--ok)]"><RiCheckLine size={17} />Sudah kamu setujui. Tim melanjutkan dari sini.</p>;
  else if (step === "ready")
    footer = (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[14px] text-[var(--ink-2)]">Sudah kamu setujui. Setelah diunggah ke Instagram, tandai di sini.</p>
        <button type="button" className="btn primary" onClick={publish}>
          <RiCheckLine size={18} />
          Sudah tayang
        </button>
      </div>
    );
  else if (revising)
    footer = (
      <div className="flex flex-col gap-3">
        <label htmlFor="rev" className="text-[14px] font-medium">Apa yang perlu diubah?</label>
        <div className="flex flex-wrap gap-2">
          {REVISE_CHIPS.map((c) => (
            <button key={c} type="button" className="chip" onClick={() => setNote((n) => (n ? `${n}. ${c}` : c))}>
              + {c}
            </button>
          ))}
        </div>
        <textarea id="rev" className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: judul slide 3 kepanjangan, mockup diganti ke HP" autoFocus />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn ghost" onClick={() => setRevising(false)}>Batal</button>
          <button type="button" className="btn primary" onClick={revise} disabled={!note.trim()}>
            <RiSendPlaneLine size={17} />
            Kirim revisi
          </button>
        </div>
      </div>
    );
  else
    footer = (
      <div className="flex flex-col gap-3">
        {step === "team" && (
          <p className="text-[13px] text-[var(--you)]">Tim belum selesai ({info?.label.toLowerCase()}). Kamu tetap bisa menyetujuinya sekarang.</p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn" onClick={() => setRevising(true)}>
            <RiEditLine size={17} />
            Minta revisi
          </button>
          <button type="button" className="btn primary" onClick={approve}>
            <RiCheckLine size={18} />
            Setujui
          </button>
        </div>
      </div>
    );

  const late = isLate(t);
  return (
    <Sheet
      onClose={onClose}
      footer={footer}
      title={
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono text-[13px] text-[var(--accent-text)]">{t.id}</span>
            <span className="tag">{kindLabel(t)}{t.format ? ` · ${t.format}` : ""}</span>
            <span className={`tag ${step === "you" ? "you" : step === "live" || step === "ready" ? "ok" : late ? "bad" : ""}`}>{stepLabel(t)}</span>
          </div>
          <h2 className="text-[20px] leading-snug font-semibold text-balance">{t.title}</h2>
        </div>
      }
    >
      <div className="flex flex-col gap-7">
        {/* the essentials, in one line each */}
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[14px] sm:grid-cols-3">
          {t.publish && (
            <div>
              <dt className="lbl">Jadwal tayang</dt>
              <dd className="mt-1">{fmtDay(t.publish)} <span className="text-[var(--ink-3)]">({relDay(t.publish)})</span></dd>
            </div>
          )}
          <div>
            <dt className="lbl">Sekarang</dt>
            <dd className="mt-1">
              {info?.label}
              {info?.who && <span className="text-[var(--ink-3)]"> · {person(info.who).name}</span>}
            </dd>
          </div>
          {t.due && step === "team" && (
            <div>
              <dt className="lbl">Target tahap ini</dt>
              <dd className={`mt-1 ${late ? "text-[var(--bad)]" : ""}`}>{late ? `Telat, ${relDay(t.due)}` : relDay(t.due)}</dd>
            </div>
          )}
          {t.hook && (
            <div className="col-span-2 sm:col-span-3">
              <dt className="lbl">Judul pembuka</dt>
              <dd className="mt-1 font-medium">{t.hook}</dd>
            </div>
          )}
        </dl>

        {openFb.length > 0 && (
          <div className="panel ticks p-4">
            <p className="lbl mb-2">Catatan yang belum selesai</p>
            {openFb.map((f, i) => (
              <p key={i} className="text-[14px] text-[var(--ink-2)]">
                <b className="font-medium text-[var(--ink)]">{person(f.by, me).name}:</b> {f.note}
              </p>
            ))}
          </div>
        )}

        {/* the slides */}
        {(t.previews?.length ?? 0) > 0 && (
          <div>
            <p className="lbl mb-3">Pratinjau ({t.previews!.length} slide)</p>
            <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 md:-mx-7 md:px-7">
              {t.previews!.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element -- private, signed-in images from /_blob
                <img key={src} src={src} alt={`Slide ${i + 1}`} loading="lazy" className="aspect-[4/5] w-[min(260px,70vw)] shrink-0 snap-start border border-[var(--line)] bg-[var(--sunken)] object-cover" />
              ))}
            </div>
          </div>
        )}
        {t.figma && (
          <a href={t.figma} target="_blank" rel="noreferrer" className="btn sm w-fit">
            <RiExternalLinkLine size={16} />
            Buka desain di Figma
          </a>
        )}

        {/* the team's documents */}
        {tabs.length > 0 && (
          <div>
            <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Dokumen">
              {tabs.map(([k, l]) => (
                <button key={k} type="button" aria-pressed={tab === k} className="chip" onClick={() => setTab(k)}>
                  {l}
                </button>
              ))}
            </div>
            <div className="panel max-h-[60vh] overflow-y-auto p-5">
              <Doc text={docs[tab] ?? ""} />
            </div>
          </div>
        )}
        {!tabs.length && t.brief && (
          <div>
            <p className="lbl mb-2">Brief</p>
            <p className="text-[15px] text-[var(--ink-2)]">{t.brief}</p>
          </div>
        )}
      </div>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- a message to a prospect */

export function MsgSheet({ msg: m, mode, inbox, me, send, onClose }: { msg: Msg; mode: "approve" | "send"; inbox: InboxItem[]; me: Me; send: Send; onClose: () => void }) {
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState("");
  const pend = pendingFor(inbox, { prospek: m.id }).length > 0;
  const ro = me.role !== "owner";
  const email = m.kanal === "email";
  const copy = async (what: string, text?: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(what);
    setTimeout(() => setCopied(""), 1800);
  };

  let footer;
  if (pend) footer = <Pending who="Bagas" />;
  else if (ro) footer = <p className="text-[14px] text-[var(--ink-3)]">Akunmu hanya bisa melihat.</p>;
  else if (mode === "send")
    footer = (
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn" onClick={() => copy("teks", m.teks)}>
          <RiFileCopyLine size={17} />
          {copied === "teks" ? "Tersalin" : "1. Salin pesan"}
        </button>
        {email ? (
          <button type="button" className="btn" onClick={() => copy("email", m.email)} disabled={!m.email}>
            <RiMailLine size={17} />
            {copied === "email" ? "Tersalin" : "2. Salin alamat email"}
          </button>
        ) : (
          <a className={`btn ${m.ig_url ? "" : "pointer-events-none opacity-45"}`} href={m.ig_url || undefined} target="_blank" rel="noreferrer">
            <RiExternalLinkLine size={17} />
            2. Buka Instagram-nya
          </a>
        )}
        <button
          type="button"
          className="btn primary"
          onClick={() => {
            send("sales_sent", { prospek: m.id, jenis: m.jenis || "sapaan" }, `Pesan ke ${m.nama} dicatat terkirim`);
            onClose();
          }}
        >
          <RiCheckLine size={18} />
          3. Sudah kukirim
        </button>
      </div>
    );
  else if (rejecting)
    footer = (
      <div className="flex flex-col gap-3">
        <label htmlFor="rej" className="text-[14px] font-medium">Apa yang perlu diperbaiki di pesan ini?</label>
        <textarea id="rej" className="field" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: pembukanya terlalu panjang, sebut proyek terbaru kita" autoFocus />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn ghost" onClick={() => setRejecting(false)}>Batal</button>
          <button
            type="button"
            className="btn primary"
            disabled={!note.trim()}
            onClick={() => {
              send("sales_approve", { prospek: m.id, decision: "reject", note: note.trim() }, `Catatan untuk pesan ke ${m.nama} dikirim`);
              onClose();
            }}
          >
            <RiSendPlaneLine size={17} />
            Kirim catatan
          </button>
        </div>
      </div>
    );
  else
    footer = (
      <div className="flex flex-col gap-3">
        <p className="text-[13px] text-[var(--ink-3)]">Setelah disetujui, pesan masuk ke daftar &ldquo;Kirim pesan&rdquo; di Tugasku. Tidak ada yang terkirim otomatis.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn" onClick={() => setRejecting(true)}>
            <RiEditLine size={17} />
            Perbaiki dulu
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              send("sales_approve", { prospek: m.id, decision: "approve", note: "" }, `Pesan ke ${m.nama} disetujui`);
              onClose();
            }}
          >
            <RiCheckLine size={18} />
            Setujui pesan
          </button>
        </div>
      </div>
    );

  return (
    <Sheet
      onClose={onClose}
      footer={footer}
      title={
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono text-[13px] text-[var(--accent-text)]">{m.id}</span>
            <span className="tag">{channelLabel(m.kanal)}</span>
            <span className={`tag ${m.jenis === "jawaban" ? "you" : ""}`}>{JENIS[m.jenis || ""] || m.jenis}</span>
          </div>
          <h2 className="text-[20px] leading-snug font-semibold">{mode === "send" ? `Kirim pesan ke ${m.nama}` : `Pesan untuk ${m.nama}`}</h2>
          {m.kampanye && <p className="text-[13px] text-[var(--ink-3)]">Kampanye: {m.kampanye}</p>}
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {mode === "send" && (
          <ol className="grid gap-2 text-[14px] text-[var(--ink-2)] sm:grid-cols-3">
            <li className="panel p-3"><b className="mono text-[var(--accent-text)]">1</b> Salin pesannya</li>
            <li className="panel p-3"><b className="mono text-[var(--accent-text)]">2</b> {email ? "Kirim dari email kita" : "Kirim lewat DM @webdev.co.id"}</li>
            <li className="panel p-3"><b className="mono text-[var(--accent-text)]">3</b> Tekan &ldquo;Sudah kukirim&rdquo;</li>
          </ol>
        )}
        {m.pesan_masuk && (
          <div>
            <p className="lbl mb-2">Mereka menulis</p>
            <div className="msgbox border-l-2 border-l-[var(--you)]">{m.pesan_masuk}</div>
          </div>
        )}
        {email && (
          <dl className="grid gap-2 text-[14px]">
            <div className="flex gap-3"><dt className="lbl w-20 shrink-0 pt-0.5">Kepada</dt><dd className="mono break-all">{m.email || "belum ada"}</dd></div>
            <div className="flex gap-3"><dt className="lbl w-20 shrink-0 pt-0.5">Subjek</dt><dd>{m.subjek || "(tanpa subjek)"}</dd></div>
          </dl>
        )}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="lbl">Pesannya</p>
            <span className="mono text-[12px] text-[var(--ink-3)]">{(m.teks || "").length} karakter</span>
          </div>
          <div className="msgbox">{m.teks || <span className="text-[var(--ink-3)]">Teks kosong, minta tim mengecek draf.</span>}</div>
        </div>
      </div>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- a prospect */

export function ProspectSheet({ p, inbox, me, send, onClose }: { p: Prospect; inbox: InboxItem[]; me: Me; send: Send; onClose: () => void }) {
  const [reply, setReply] = useState("");
  const [showReply, setShowReply] = useState(false);
  const [copied, setCopied] = useState(false);
  const pend = pendingFor(inbox, { prospek: p.id }).length > 0;
  const ro = me.role !== "owner";
  const contacted = !["lolos_icp", "draf", "menunggu_approval", "siap_kirim"].includes(p.status);
  const handle = igHandle(p.ig_url);
  return (
    <Sheet
      onClose={onClose}
      title={
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono text-[13px] text-[var(--accent-text)]">{p.id}</span>
            <span className="tag">{STATUS_LABEL[p.status] || p.status}</span>
            {p.skor ? <span className={`tag ${p.skor >= 5 ? "ok" : p.skor >= 4 ? "info" : ""}`}>Skor {p.skor}/5</span> : null}
          </div>
          <h2 className="text-[20px] leading-snug font-semibold">{p.nama_usaha}</h2>
          <p className="text-[14px] text-[var(--ink-3)]">{[p.kategori, p.kota].filter(Boolean).join(" · ")}</p>
        </div>
      }
      footer={
        pend ? (
          <Pending who="agent" />
        ) : ro ? null : showReply ? (
          <div className="flex flex-col gap-3">
            <label htmlFor="rp" className="text-[14px] font-medium">Tempel balasan mereka</label>
            <textarea id="rp" className="field !min-h-[90px]" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Salin persis apa yang mereka tulis" autoFocus />
            <div className="flex justify-end gap-2">
              <button type="button" className="btn ghost" onClick={() => setShowReply(false)}>Batal</button>
              <button
                type="button"
                className="btn primary"
                disabled={!reply.trim()}
                onClick={() => {
                  send("sales_reply", { prospek: p.id, note: reply.trim() }, `Balasan ${p.nama_usaha} disimpan`);
                  onClose();
                }}
              >
                <RiSendPlaneLine size={17} />
                Simpan balasan
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {contacted && (
              <button type="button" className="btn" onClick={() => setShowReply(true)}>
                Mereka membalas
              </button>
            )}
            {p.ig_url && (
              <a className="btn" href={p.ig_url} target="_blank" rel="noreferrer">
                <RiExternalLinkLine size={17} />
                1. Buka Instagram
              </a>
            )}
            {!contacted && (
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  send("sales_sent", { prospek: p.id, jenis: "sapaan" }, `${p.nama_usaha} dicatat sudah kamu DM`);
                  onClose();
                }}
              >
                <RiCheckLine size={18} />
                {p.ig_url ? "2. Sudah kuDM" : "Sudah kuhubungi"}
              </button>
            )}
          </div>
        )
      }
    >
      <div className="flex flex-col gap-6">
        {p.alasan && (
          <div>
            <p className="lbl mb-2">Kenapa cocok</p>
            <p className="text-[15px] text-[var(--ink-2)]">{p.alasan}</p>
          </div>
        )}
        <dl className="grid gap-4 text-[14px] sm:grid-cols-2">
          <div>
            <dt className="lbl">Instagram</dt>
            <dd className="mt-1 flex items-center gap-2">
              {handle ? (
                <>
                  <span className="mono">{handle}</span>
                  <button
                    type="button"
                    className="btn ghost sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(handle).catch(() => {});
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    <RiFileCopyLine size={14} />
                    {copied ? "Tersalin" : "Salin"}
                  </button>
                </>
              ) : (
                <span className="text-[var(--ink-3)]">Belum ketemu</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="lbl">Website</dt>
            <dd className="mt-1">
              {p.website ? (
                <a href={p.website.startsWith("http") ? p.website : `https://${p.website}`} target="_blank" rel="noreferrer" className="text-[var(--accent-text)] hover:underline">
                  {p.website.replace(/^https?:\/\//, "")}
                </a>
              ) : null}{" "}
              <span className="text-[var(--ink-3)]">{WEBSITE_STATUS[p.website_status || ""] || (p.website ? "" : "Belum punya website")}</span>
            </dd>
          </div>
          {p.kampanye && <div><dt className="lbl">Kampanye</dt><dd className="mt-1">{p.kampanye}</dd></div>}
          {p.ditemukan && <div><dt className="lbl">Ditemukan</dt><dd className="mt-1">{fmtDay(p.ditemukan)}</dd></div>}
          {p.next_action && (
            <div className="sm:col-span-2">
              <dt className="lbl">Langkah berikutnya</dt>
              <dd className="mt-1">{p.next_action}{p.next_date && <span className="text-[var(--ink-3)]"> · {fmtDay(p.next_date)}</span>}</dd>
            </div>
          )}
          {p.bukti && (
            <div className="sm:col-span-2">
              <dt className="lbl">Sumber</dt>
              <dd className="mt-1 truncate">
                <a href={p.bukti} target="_blank" rel="noreferrer" className="text-[var(--accent-text)] hover:underline">{p.bukti.replace(/^https?:\/\//, "")}</a>
              </dd>
            </div>
          )}
        </dl>
        <p className="text-[13px] text-[var(--ink-3)]">Ingat: DM dikirim sendiri dari @webdev.co.id, bukan otomatis. Sesuaikan kalimatnya dengan isi Instagram mereka.</p>
      </div>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- find prospects */

const KATEGORI = ["Interior", "Wedding", "Kontraktor", "Klinik", "Kafe & resto", "Toko"];
export function FindSheet({ me, send, onClose }: { me: Me; send: Send; onClose: () => void }) {
  const [kategori, setKategori] = useState("Interior");
  const [lain, setLain] = useState("");
  const [kota, setKota] = useState("");
  const [jumlah, setJumlah] = useState(20);
  const [catatan, setCatatan] = useState("");
  const ro = me.role !== "owner";
  const kat = kategori === "lain" ? lain.trim() : kategori;
  const ok = !!kat && !!kota.trim() && !ro;
  return (
    <Sheet
      onClose={onClose}
      title={
        <div className="flex flex-col gap-1">
          <h2 className="text-[20px] font-semibold">Cari prospek baru</h2>
          <p className="text-[14px] text-[var(--ink-3)]">Agent Riset mencari usaha yang belum punya website, lalu menyusunnya jadi daftar siap DM.</p>
        </div>
      }
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            className="btn primary"
            disabled={!ok}
            onClick={() => {
              const note = `Carikan ${jumlah} usaha ${kat} di ${kota.trim()} yang belum punya website${catatan.trim() ? `. Catatan: ${catatan.trim()}` : ""}`;
              send("sales_cmd", { prospek: null, note, riset: { kategori: kat, kota: kota.trim(), jumlah, catatan: catatan.trim() } }, `Agent Riset mulai mencari ${kat} di ${kota.trim()}`);
              onClose();
            }}
          >
            <RiUserSearchLine size={17} />
            Mulai cari
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="lbl mb-2">Jenis usaha</p>
          <div className="flex flex-wrap gap-2">
            {KATEGORI.map((k) => (
              <button key={k} type="button" className="chip" aria-pressed={kategori === k} onClick={() => setKategori(k)}>{k}</button>
            ))}
            <button type="button" className="chip" aria-pressed={kategori === "lain"} onClick={() => setKategori("lain")}>Lainnya…</button>
          </div>
          {kategori === "lain" && <input className="field mt-3 !min-h-0 py-3" value={lain} onChange={(e) => setLain(e.target.value)} placeholder="Contoh: bengkel mobil, salon, sekolah musik" autoFocus />}
        </div>
        <div>
          <label htmlFor="kota" className="lbl mb-2 block">Kota atau daerah</label>
          <input id="kota" className="field !min-h-0 py-3" value={kota} onChange={(e) => setKota(e.target.value)} placeholder="Contoh: Tangerang Selatan, Bekasi, Jakarta Selatan" />
        </div>
        <div>
          <p className="lbl mb-2">Berapa banyak</p>
          <div className="flex flex-wrap gap-2">
            {[10, 20, 30, 50].map((n) => (
              <button key={n} type="button" className="chip" aria-pressed={jumlah === n} onClick={() => setJumlah(n)}>{n} usaha</button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="cat" className="lbl mb-2 block">Catatan (opsional)</label>
          <textarea id="cat" className="field !min-h-[80px]" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Contoh: utamakan yang pengikut IG-nya di atas 5 ribu" />
        </div>
        <ol className="flex flex-col gap-2 text-[13px] text-[var(--ink-3)]">
          <li>1. Agent mencari dari halaman publik (pencarian web, direktori vendor). Tidak login ke Instagram dan tidak mengirim pesan.</li>
          <li>2. Setiap usaha dicek: sudah punya website atau belum, lalu diberi skor dan alasan.</li>
          <li>3. Hasilnya muncul di Prospek dalam beberapa menit, lengkap dengan link Instagram.</li>
        </ol>
      </div>
    </Sheet>
  );
}

/* ---------------------------------------------------------------- ask the team */

const EXAMPLES = {
  design: ["Buat post tentang pentingnya muncul di Google", "Majukan jadwal post minggu depan", "Pakai foto portfolio terbaru di post berikutnya"],
  sales: ["Fokus ke klinik di Bekasi minggu ini", "Kurangi sapaan jadi 15 per hari", "Siapkan penawaran untuk prospek yang sedang ngobrol"],
};
export function AskSheet({ board, me, send, onClose }: { board: Board | null; me: Me; send: Send; onClose: () => void }) {
  const [team, setTeam] = useState<"design" | "sales">("design");
  const [text, setText] = useState("");
  const [task, setTask] = useState("");
  const ro = me.role !== "owner";
  const lead = team === "design" ? PEOPLE.michael : PEOPLE.bagas;
  return (
    <Sheet
      onClose={onClose}
      title={<h2 className="text-[20px] font-semibold">Minta sesuatu ke tim</h2>}
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            className="btn primary"
            disabled={!text.trim() || ro}
            onClick={() => {
              if (team === "design") send("command", { task: task || null, note: text.trim() }, `Permintaan dikirim ke ${lead.name}`);
              else send("sales_cmd", { prospek: null, note: text.trim() }, `Permintaan dikirim ke ${lead.name}`);
              onClose();
            }}
          >
            <RiSendPlaneLine size={17} />
            Kirim ke {lead.name}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="lbl mb-2">Untuk</p>
          <div className="grid grid-cols-2 gap-2">
            {(["design", "sales"] as const).map((k) => (
              <button key={k} type="button" aria-pressed={team === k} onClick={() => setTeam(k)} className={`panel p-4 text-left transition-colors ${team === k ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "hover:bg-[var(--hover)]"}`}>
                <b className="block text-[15px] font-medium">{k === "design" ? "Tim konten" : "Tim sales"}</b>
                <span className="text-[13px] text-[var(--ink-3)]">{k === "design" ? "Post Instagram, desain, jadwal" : "Prospek, pesan, kampanye"}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="ask" className="lbl mb-2 block">Permintaanmu</label>
          <textarea id="ask" className="field !min-h-[140px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Tulis seperti chat biasa" autoFocus />
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES[team].map((e) => (
              <button key={e} type="button" className="chip" onClick={() => setText(e)}>
                {e}
              </button>
            ))}
          </div>
        </div>
        {team === "design" && (board?.tasks?.length ?? 0) > 0 && (
          <div>
            <label htmlFor="ask-task" className="lbl mb-2 block">Tentang post tertentu? (opsional)</label>
            <select id="ask-task" value={task} onChange={(e) => setTask(e.target.value)} className="field !min-h-0 py-3">
              <option value="">Tidak, permintaan umum</option>
              {board!.tasks!.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} · {t.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <p className="text-[13px] text-[var(--ink-3)]">
          {lead.name} ({lead.role}) membaca permintaanmu saat tim memeriksa inbox, lalu mengerjakannya.
        </p>
      </div>
    </Sheet>
  );
}
