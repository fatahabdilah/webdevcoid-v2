import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/*
 * The admin's data: the two board documents the Content Studio reads (board/state for design, board/sales for
 * sales) and the inbox of decisions it sends. Two backends behind one interface:
 * - Supabase (production): when SUPABASE_URL and SUPABASE_SECRET_KEY are set. Tables from supabase/admin.sql,
 *   reached over Supabase's REST API with the secret key (server-only; RLS is on with no policies, so the
 *   public anon key can't read them). No SDK.
 * - JSON files in data/admin/ (local fallback, ignored by git; ADMIN_DATA_DIR moves it).
 */

/** board/*: the team's boards; agents/config: the agents' .md settings and the runner switch (edited in the Studio);
 *  runner/status: what the agent runner on the team's computer reports (connections, last run). */
export const DOCS = ["board/state", "board/sales", "agents/config", "runner/status"] as const;
export type DocPath = (typeof DOCS)[number];
export type DocRecord = { data: unknown; at: string };
export type InboxItem = { id: string } & Record<string, unknown>;
export const INBOX_MAX = 500;

export const isDoc = (p: string): p is DocPath => (DOCS as readonly string[]).includes(p);

/** Errors from the store carry a code the routes pass on ("unavailable" when the database can't be reached). */
export class StoreError extends Error {
  constructor(
    message: string,
    public code = "unavailable",
  ) {
    super(message);
  }
}

/* ---------------------------------------------------------------- Supabase */

const sbUrl = () => (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const sbKey = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const usingSupabase = () => Boolean(sbUrl() && sbKey());

async function sb(pathAndQuery: string, init: RequestInit & { prefer?: string } = {}) {
  const key = sbKey();
  const headers: Record<string, string> = { apikey: key, "Content-Type": "application/json" };
  // Legacy service_role keys are JWTs and also go in Authorization; the new sb_secret_ keys only in apikey.
  if (key.startsWith("eyJ")) headers.Authorization = `Bearer ${key}`;
  if (init.prefer) headers.Prefer = init.prefer;
  let res: Response;
  try {
    res = await fetch(`${sbUrl()}/rest/v1/${pathAndQuery}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new StoreError("Database tidak bisa dihubungi.");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new StoreError(`Supabase ${res.status}: ${body.slice(0, 200)}`);
  }
  return res;
}

const supabase = {
  async getDoc(p: DocPath): Promise<DocRecord | null> {
    const rows = await (await sb(`admin_docs?path=eq.${encodeURIComponent(p)}&select=data,updated_at`)).json();
    return rows[0] ? { data: rows[0].data, at: rows[0].updated_at } : null;
  },
  async setDoc(p: DocPath, data: unknown): Promise<DocRecord> {
    const at = new Date().toISOString();
    await sb("admin_docs?on_conflict=path", { method: "POST", prefer: "resolution=merge-duplicates,return=minimal", body: JSON.stringify({ path: p, data, updated_at: at }) });
    return { data, at };
  },
  async listInbox(limit: number): Promise<InboxItem[]> {
    const rows = await (await sb(`admin_inbox?select=id,item&order=at.desc.nullslast,created_at.desc&limit=${limit}`)).json();
    return rows.map((r: { id: string; item: Record<string, unknown> }) => ({ ...r.item, id: r.id }));
  },
  async addInbox(item: Record<string, unknown>): Promise<InboxItem | null> {
    const head = await sb("admin_inbox?select=id", { method: "HEAD", prefer: "count=exact" });
    const total = Number((head.headers.get("content-range") || "").split("/")[1] || 0);
    if (total >= INBOX_MAX) return null;
    const at = typeof item.at === "string" && !Number.isNaN(Date.parse(item.at)) ? item.at : new Date().toISOString();
    const rows = await (await sb("admin_inbox?select=id", { method: "POST", prefer: "return=representation", body: JSON.stringify({ item, at }) })).json();
    return { ...item, id: rows[0].id };
  },
  async updateInbox(id: string, patch: Record<string, unknown>): Promise<InboxItem | null> {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
    const rows = await (await sb(`admin_inbox?id=eq.${id}&select=item`)).json();
    if (!rows[0]) return null;
    const item = { ...rows[0].item, ...patch };
    delete item.id;
    await sb(`admin_inbox?id=eq.${id}`, { method: "PATCH", prefer: "return=minimal", body: JSON.stringify({ item }) });
    return { ...item, id };
  },
};

/* ---------------------------------------------------------------- files */

const DIR = process.env.ADMIN_DATA_DIR || path.join(process.cwd(), "data", "admin");
const file = (name: string) => path.join(DIR, `${name.replace("/", "__")}.json`);

async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file(name), "utf8")) as T;
  } catch {
    return fallback;
  }
}
// Writes go to a temp file first, then replace the old one, so a crash never leaves half a file.
async function writeJson(name: string, value: unknown) {
  await mkdir(DIR, { recursive: true });
  const tmp = `${file(name)}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(value), "utf8");
  await rename(tmp, file(name));
}

const files = {
  getDoc: (p: DocPath) => readJson<DocRecord | null>(p, null),
  async setDoc(p: DocPath, data: unknown) {
    const rec = { data, at: new Date().toISOString() };
    await writeJson(p, rec);
    return rec;
  },
  async listInbox(limit: number) {
    const all = await readJson<InboxItem[]>("inbox", []);
    return [...all].sort((a, b) => String(b.at || "").localeCompare(String(a.at || ""))).slice(0, limit);
  },
  async addInbox(item: Record<string, unknown>) {
    const all = await readJson<InboxItem[]>("inbox", []);
    if (all.length >= INBOX_MAX) return null;
    const rec = { ...item, id: randomUUID() };
    all.push(rec);
    await writeJson("inbox", all);
    return rec;
  },
  async updateInbox(id: string, patch: Record<string, unknown>) {
    const all = await readJson<InboxItem[]>("inbox", []);
    const i = all.findIndex((x) => x.id === id);
    if (i < 0) return null;
    all[i] = { ...all[i], ...patch, id };
    await writeJson("inbox", all);
    return all[i];
  },
};

/* ---------------------------------------------------------------- the store */

const store = () => (usingSupabase() ? supabase : files);

export const getDoc = (p: DocPath) => store().getDoc(p);
export const setDoc = (p: DocPath, data: unknown) => store().setDoc(p, data);
export const listInbox = (limit = 200) => store().listInbox(limit);
export const addInbox = (item: Record<string, unknown>) => store().addInbox(item);
/** For the team or an agent working the inbox: mark items handled (or change any field) by id. */
export const updateInbox = (id: string, patch: Record<string, unknown>) => store().updateInbox(id, patch);
