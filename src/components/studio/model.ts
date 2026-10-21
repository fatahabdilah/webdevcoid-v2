/*
 * The Studio's data and the plain-language reading of it. The data is exactly what the team's agents send (board/state
 * from Michael, board/sales from Bagas) and what the old artifact page wrote to the inbox, so the agents need no
 * change. Everything here is pure: the views ask it "what does this mean for the person looking?".
 */

export type Me = { email: string; role: "owner" | "team"; name: string };

export type Feedback = { at: string; by: string; note: string; resolved?: boolean };
export type Task = {
  id: string;
  title: string;
  stage: Stage;
  type?: "post" | "task" | "setup" | string;
  pillar?: string;
  format?: string;
  due?: string;
  publish?: string;
  start?: string;
  owner?: string;
  hook?: string;
  cta?: string;
  brief?: string;
  figma?: string;
  previews?: string[];
  feedback?: Feedback[];
  history?: { at: string; by: string; stage: string }[];
  priority?: string;
  week?: string;
};
export type Check = { item: string; due?: string; owner?: string; done?: boolean };
export type Log = { at: string; by?: string; msg?: string; task?: string };
export type Board = {
  project?: { name?: string; period?: [string, string] };
  milestones?: { id: string; title: string; theme?: string; start: string; end: string }[];
  tasks?: Task[];
  checklist?: Check[];
  docs?: Record<string, Record<string, string>>;
  log?: Log[];
  updated?: string;
  synced_at?: string;
};
export type Msg = {
  id: string;
  nama: string;
  kanal?: "dm" | "email" | string;
  jenis?: string;
  teks?: string;
  subjek?: string;
  email?: string;
  ig_url?: string;
  kampanye?: string;
  pesan_masuk?: string;
};
export type Prospect = {
  id: string;
  nama_usaha: string;
  kategori?: string;
  kota?: string;
  kanal?: string;
  ig_url?: string;
  status: string;
  skor?: number;
  kampanye?: string;
  next_action?: string;
  next_date?: string;
  /** From the research agent: why it fits, its site (if any), where it was found, when. */
  alasan?: string;
  website?: string;
  website_status?: "tidak_ada" | "rusak" | "kuno" | "lambat" | string;
  bukti?: string;
  ditemukan?: string;
};
export const WEBSITE_STATUS: Record<string, string> = { tidak_ada: "Belum punya website", rusak: "Website rusak", kuno: "Website kuno", lambat: "Website lambat" };
/** "@handle" from an Instagram link. */
export const igHandle = (url?: string) => {
  const m = (url || "").match(/instagram\.com\/([A-Za-z0-9._]+)/);
  return m ? `@${m[1]}` : "";
};
export type SalesLog = { id?: string; tanggal?: string; at?: string; oleh?: string; kejadian?: string; catatan?: string; kampanye?: string; kanal?: string };
export type Sales = {
  approval?: Msg[];
  kirim_hari_ini?: Msg[];
  pipeline?: Prospect[];
  funnel?: Record<string, number>;
  log?: SalesLog[];
  updated?: string;
  synced_at?: string;
};
export type InboxItem = { id: string; type: string; status: string; at?: string; by?: string; task?: string | null; prospek?: string | string[] | null; note?: string; reply?: string; riset?: { kategori?: string; kota?: string; jumlah?: number } };

/** agents/config: each agent's .md (Claude Code subagent format), its last versions, and the runner switch. */
export type AgentDoc = { md: string; updated_at?: string; updated_by?: string; history?: { md: string; at: string; by: string }[] };
export type AgentsConfig = { enabled?: boolean; interval_min?: number; agents?: Record<string, AgentDoc> };
type Conn = { ok?: boolean; detail?: string };
/** runner/status: what the agent runner on the team's computer last reported. */
export type RunnerStatus = {
  at?: string;
  host?: string;
  enabled?: boolean;
  busy?: boolean;
  interval_min?: number;
  last_run?: { at?: string; ok?: boolean; items?: number; summary?: string; error?: string };
  claude?: Conn;
  gemini?: Conn;
  figma?: Conn;
};
/** The frontmatter of an agent .md (name, role, description, tools), and the body. */
export function parseAgent(md: string) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  if (m) for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m ? m[2] : md };
}

/* ---------------------------------------------------------------- dates */

export const dayOf = (s?: string) => {
  if (!s) return null;
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  return y ? new Date(y, m - 1, d) : null;
};
export const today = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};
/** Whole days from today to `s` (negative = past). */
export const daysTo = (s?: string) => {
  const d = dayOf(s);
  return d ? Math.round((d.getTime() - today().getTime()) / 864e5) : null;
};
const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
export const fmtDay = (s?: string) => {
  const d = dayOf(s);
  return d ? `${HARI[d.getDay()].slice(0, 3)}, ${d.getDate()} ${BULAN[d.getMonth()]}` : "";
};
export const fmtLongToday = () => {
  const d = today();
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]}`;
};
/** "hari ini", "besok", "3 hari lagi", "telat 2 hari". */
export const relDay = (s?: string) => {
  const n = daysTo(s);
  if (n === null) return "";
  if (n === 0) return "hari ini";
  if (n === 1) return "besok";
  if (n === -1) return "kemarin";
  return n > 0 ? `${n} hari lagi` : `${-n} hari lalu`;
};
export const ago = (s?: string) => {
  const d = s ? new Date(s) : null;
  if (!d || Number.isNaN(d.getTime())) return "belum pernah";
  const m = Math.round((Date.now() - d.getTime()) / 6e4);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.round(h / 24)} hari lalu`;
};

/* ---------------------------------------------------------------- people */

/** The team, in plain words: their name and what they do. */
export const PEOPLE: Record<string, { name: string; role: string }> = {
  michael: { name: "Michael", role: "koordinator konten" },
  adrian: { name: "Adrian", role: "riset" },
  supri: { name: "Supri", role: "penulis" },
  darno: { name: "Darno", role: "desainer" },
  bagas: { name: "Bagas", role: "kepala sales" },
  rani: { name: "Rani", role: "riset pasar" },
  yudi: { name: "Yudi", role: "target & kampanye" },
  joko: { name: "Joko", role: "cari prospek" },
  laras: { name: "Laras", role: "penulis pesan" },
  wawan: { name: "Wawan", role: "closing" },
  hendra: { name: "Hendra", role: "analis" },
};
export const person = (k?: string, me?: Me) => {
  if (!k) return { name: "Tim", role: "" };
  if (PEOPLE[k]) return PEOPLE[k];
  if (me && k.toLowerCase() === me.name.toLowerCase()) return { name: "Kamu", role: "" };
  if (k === "mic" || k === "kamu") return { name: me && me.name.toLowerCase() === "mic" ? "Kamu" : "Mic", role: "" };
  return { name: k.charAt(0).toUpperCase() + k.slice(1), role: "" };
};
/** Whether a checklist owner is the person signed in ("mic"/"kamu" belong to the owner account). */
export const isMine = (owner: string | undefined, me: Me) => {
  const o = (owner || "").toLowerCase();
  const n = me.name.toLowerCase();
  return o === n || (me.role === "owner" && (o === "kamu" || (o === "mic" && n === "mic")));
};

/* ---------------------------------------------------------------- content stages */

export type Stage = "backlog" | "research" | "writing" | "design" | "review" | "approval" | "approved" | "published";
/** Four plain steps instead of eight: who has it now. */
export type Step = "team" | "you" | "ready" | "live";
export const STEP_OF: Record<string, Step> = {
  backlog: "team",
  research: "team",
  writing: "team",
  design: "team",
  review: "team",
  approval: "you",
  approved: "ready",
  published: "live",
};
export const STEPS: { key: Step; label: string; help: string }[] = [
  { key: "team", label: "Sedang dibuat tim", help: "Tim sedang meriset, menulis, mendesain, atau mengecek kualitasnya. Belum perlu apa-apa darimu." },
  { key: "you", label: "Perlu persetujuanmu", help: "Sudah lolos cek kualitas. Lihat hasilnya, lalu setujui atau minta revisi." },
  { key: "ready", label: "Siap tayang", help: "Sudah kamu setujui. Unggah ke Instagram sesuai jadwal, lalu tandai sudah tayang." },
  { key: "live", label: "Sudah tayang", help: "Sudah ada di Instagram." },
];
/** What the team is doing at each internal stage, and who. */
export const STAGE_INFO: Record<string, { label: string; who: string }> = {
  backlog: { label: "Menunggu dikerjakan", who: "michael" },
  research: { label: "Riset", who: "adrian" },
  writing: { label: "Menulis teks", who: "supri" },
  design: { label: "Desain", who: "darno" },
  review: { label: "Cek kualitas", who: "michael" },
  approval: { label: "Menunggu persetujuanmu", who: "" },
  approved: { label: "Siap tayang", who: "" },
  published: { label: "Sudah tayang", who: "" },
};
export const isPost = (t: Task) => (t.type || "post") === "post";
/** The four-step label, worded for what it is: a post is "ready to publish", a document or setup job is "done". */
export const stepLabel = (t: Task) => {
  const s = STEP_OF[t.stage] ?? "team";
  if (!isPost(t) && (s === "ready" || s === "live")) return "Selesai";
  return STEPS.find((x) => x.key === s)?.label ?? "";
};
/** The team's log lines in everyday words; file-path notes are dropped (empty string). */
export function plainLog(msg: string) {
  if (/^File \w+: /.test(msg)) return "";
  const words: [RegExp, string][] = [
    [/Approval kamu/g, "menunggu persetujuanmu"],
    [/Review QC/g, "cek kualitas"],
    [/\bQC lolos\b/g, "lolos cek kualitas"],
    [/\bQC\b/g, "cek kualitas"],
    [/\bResearch\b/g, "riset"],
    [/\bWriting\b/g, "menulis"],
    [/\bDesign\b/g, "desain"],
    [/\bBacklog\b/g, "antrean"],
    [/\bApproved\b/g, "disetujui"],
    [/\bPublished\b/g, "tayang"],
    [/ → /g, " lalu "],
  ];
  return words.reduce((m, [re, w]) => m.replace(re, w), msg);
}
export const kindLabel = (t: Task) => (isPost(t) ? "Post" : t.type === "setup" ? "Persiapan" : "Dokumen");
/** Late: the step's deadline has passed and it isn't waiting on you or done. */
export const isLate = (t: Task) => {
  const n = daysTo(t.due);
  return n !== null && n < 0 && STEP_OF[t.stage] === "team";
};

/** The docs a task carries, in reading order, with plain names. */
export const DOC_TABS: [string, string][] = [
  ["copy", "Isi post"],
  ["review", "Catatan cek kualitas"],
  ["design", "Catatan desain"],
  ["research", "Riset"],
  ["brief", "Brief"],
  ["other", "Lainnya"],
];

/* ---------------------------------------------------------------- prospects */

export type PStep = "prep" | "waiting" | "warm" | "you" | "won" | "closed";
export const PSTEPS: { key: PStep; label: string; help: string; of: string[] }[] = [
  { key: "prep", label: "Disiapkan tim", help: "Tim sales sedang mengecek bisnisnya dan menulis pesan pertama.", of: ["lolos_icp", "draf", "menunggu_approval", "siap_kirim"] },
  { key: "waiting", label: "Menunggu balasan", help: "Pesan sudah terkirim. Tim akan mengingatkan untuk follow-up.", of: ["terkirim", "followup_1", "followup_2"] },
  { key: "warm", label: "Tertarik", help: "Sudah membalas, sedang ngobrol, demo, atau menunggu penawaran.", of: ["dibalas", "ngobrol", "demo_terjadwal", "penawaran"] },
  { key: "you", label: "Perlu kamu", help: "Butuh keputusan atau tindakan langsung darimu.", of: ["perlu_mic"] },
  { key: "won", label: "Jadi klien", help: "Deal.", of: ["deal"] },
  { key: "closed", label: "Selesai", help: "Tidak tertarik, tidak membalas, atau minta tidak dihubungi lagi.", of: ["dingin", "tidak", "jangan_dihubungi"] },
];
export const pstepOf = (status: string) => PSTEPS.find((s) => s.of.includes(status))?.key ?? "prep";
export const STATUS_LABEL: Record<string, string> = {
  lolos_icp: "Siap di-DM",
  draf: "Pesan sedang ditulis",
  menunggu_approval: "Pesan menunggu persetujuanmu",
  siap_kirim: "Siap kamu kirim",
  terkirim: "Sapaan terkirim",
  followup_1: "Follow-up 1 terkirim",
  followup_2: "Follow-up 2 terkirim",
  dibalas: "Membalas",
  ngobrol: "Sedang ngobrol",
  demo_terjadwal: "Demo dijadwalkan",
  penawaran: "Penawaran dikirim",
  deal: "Jadi klien",
  dingin: "Tidak membalas",
  tidak: "Tidak tertarik",
  jangan_dihubungi: "Minta tidak dihubungi",
  perlu_mic: "Perlu kamu",
};
export const JENIS: Record<string, string> = { sapaan: "Sapaan pertama", followup_1: "Follow-up 1", followup_2: "Follow-up 2", jawaban: "Jawaban balasan" };
export const channelLabel = (k?: string) => (k === "email" ? "Email" : "DM Instagram");

/* ---------------------------------------------------------------- inbox */

const isSales = (type: string) => type.startsWith("sales_");
const hasProspek = (p: InboxItem["prospek"], id: string) => p === id || (Array.isArray(p) && p.includes(id));
/** A decision already sent about this post / prospect, waiting for the team to pick it up. */
export const pendingFor = (inbox: InboxItem[], key: { task?: string; prospek?: string }) =>
  inbox.filter((m) => m.status === "new" && (key.task ? !isSales(m.type) && m.task === key.task : isSales(m.type) && !!key.prospek && hasProspek(m.prospek, key.prospek)));

/* ---------------------------------------------------------------- the to-do list */

export type Todo =
  | { kind: "send"; key: string; msg: Msg; urgent: number }
  | { kind: "approve-msg"; key: string; msg: Msg; urgent: number }
  | { kind: "approve"; key: string; task: Task; urgent: number }
  | { kind: "publish"; key: string; task: Task; urgent: number }
  | { kind: "prepare"; key: string; check: Check; index: number; mine: boolean; urgent: number }
  | { kind: "dm"; key: string; count: number; top: Prospect[]; urgent: number };

export const TODO_KINDS: { kind: Todo["kind"]; label: string }[] = [
  { kind: "dm", label: "DM prospek" },
  { kind: "send", label: "Kirim pesan" },
  { kind: "approve", label: "Setujui post" },
  { kind: "approve-msg", label: "Setujui pesan" },
  { kind: "publish", label: "Tayangkan" },
  { kind: "prepare", label: "Siapkan bahan" },
];

/**
 * Everything that waits on a person, as one list, most urgent first: replies to send, posts past their publish date,
 * messages and posts to approve, materials due. Lower `urgent` = sooner.
 */
export function todos(board: Board | null, sales: Sales | null, me: Me): Todo[] {
  const out: Todo[] = [];
  for (const m of sales?.kirim_hari_ini ?? []) out.push({ kind: "send", key: `send:${m.id}:${m.jenis}`, msg: m, urgent: m.jenis === "jawaban" ? -50 : 0 });
  for (const m of sales?.approval ?? []) out.push({ kind: "approve-msg", key: `amsg:${m.id}`, msg: m, urgent: 5 });
  // prospects from the research agent, waiting for a DM: one line for the lot, best first
  const ready = (sales?.pipeline ?? []).filter((p) => p.status === "lolos_icp").sort((a, b) => (b.skor ?? 0) - (a.skor ?? 0));
  if (ready.length) out.push({ kind: "dm", key: "dm", count: ready.length, top: ready.slice(0, 3), urgent: 2 });
  for (const t of board?.tasks ?? []) {
    if (t.stage === "approval") out.push({ kind: "approve", key: `appr:${t.id}`, task: t, urgent: Math.min(daysTo(t.publish) ?? 30, 30) });
    if (t.stage === "approved" && isPost(t) && (daysTo(t.publish) ?? 99) <= 1) out.push({ kind: "publish", key: `pub:${t.id}`, task: t, urgent: (daysTo(t.publish) ?? 0) - 1 });
  }
  (board?.checklist ?? []).forEach((c, index) => {
    if (c.done) return;
    const n = daysTo(c.due) ?? 30;
    const mine = isMine(c.owner, me);
    if (n <= 7 || mine) out.push({ kind: "prepare", key: `chk:${index}`, check: c, index, mine, urgent: Math.min(n, 30) + (mine ? 0 : 3) });
  });
  return out.sort((a, b) => a.urgent - b.urgent);
}
