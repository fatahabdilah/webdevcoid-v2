import "server-only";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { StoreError, usingSupabase } from "./store";

/*
 * Images the Studio shows (slide previews), referenced by tasks as "/_blob/<name>" (the claude.ai artifact's asset
 * paths, kept so board data moves across unchanged). The team's agent uploads them with PUT /admin/api/blob/<name>;
 * GET /_blob/<name> serves them to a signed-in account.
 * - Supabase Storage (bucket "admin-blobs", private) when Supabase is configured;
 * - files in data/admin/blobs/ otherwise.
 */

export const BLOB_MAX = 8_000_000; // bytes per image
export const BLOB_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const BUCKET = "admin-blobs";
/** Names are hashes or simple file names: letters, digits, dash, underscore, dot; no paths. */
export const isBlobName = (n: string) => /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(n) && !n.includes("..");

const sbUrl = () => (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const sbKey = () => process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const sbHeaders = (extra: Record<string, string> = {}) => {
  const key = sbKey();
  return { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), ...extra };
};

const DIR = path.join(process.env.ADMIN_DATA_DIR || path.join(process.cwd(), "data", "admin"), "blobs");

export async function putBlob(name: string, type: string, bytes: Uint8Array) {
  if (usingSupabase()) {
    let res: Response;
    try {
      res = await fetch(`${sbUrl()}/storage/v1/object/${BUCKET}/${name}`, {
        method: "POST",
        headers: sbHeaders({ "Content-Type": type, "x-upsert": "true" }),
        body: Buffer.from(bytes),
        cache: "no-store",
      });
    } catch {
      throw new StoreError("Penyimpanan gambar tidak bisa dihubungi.");
    }
    if (!res.ok) throw new StoreError(`Supabase Storage ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
    return;
  }
  await mkdir(DIR, { recursive: true });
  const tmp = path.join(DIR, `${name}.${process.pid}.tmp`);
  await writeFile(tmp, bytes);
  await rename(tmp, path.join(DIR, name));
  await writeFile(path.join(DIR, `${name}.type`), type, "utf8");
}

export async function getBlob(name: string): Promise<{ type: string; bytes: Uint8Array } | null> {
  if (usingSupabase()) {
    let res: Response;
    try {
      res = await fetch(`${sbUrl()}/storage/v1/object/authenticated/${BUCKET}/${name}`, { headers: sbHeaders(), cache: "no-store" });
    } catch {
      throw new StoreError("Penyimpanan gambar tidak bisa dihubungi.");
    }
    if (res.status === 404 || res.status === 400) return null;
    if (!res.ok) throw new StoreError(`Supabase Storage ${res.status}`);
    return { type: res.headers.get("content-type") || "application/octet-stream", bytes: new Uint8Array(await res.arrayBuffer()) };
  }
  try {
    const [bytes, type] = await Promise.all([readFile(path.join(DIR, name)), readFile(path.join(DIR, `${name}.type`), "utf8").catch(() => "application/octet-stream")]);
    return { type, bytes: new Uint8Array(bytes) };
  } catch {
    return null;
  }
}
