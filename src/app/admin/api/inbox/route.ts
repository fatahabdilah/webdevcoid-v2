import type { NextRequest } from "next/server";
import { fail, requireRole, send } from "@/lib/admin/auth";
import { StoreError, addInbox, listInbox, updateInbox } from "@/lib/admin/store";

/*
 * The Studio's inbox (approve, revise, commands…): GET ?limit= newest first (owner or team); POST adds one (the
 * Studio's buttons, owner); PATCH ?id= merges fields into one (owner/agent working the inbox, e.g. {status:"done"}).
 */

const MAX = 50_000; // bytes per item

const storeFail = (e: unknown) => (e instanceof StoreError ? fail(503, e.code, "Database belum siap atau tidak bisa dihubungi.") : fail(500, "unavailable", "Terjadi kesalahan."));

async function readObject(request: NextRequest) {
  const text = await request.text();
  if (text.length > MAX) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request);
  if (auth.error) return auth.error;
  const limit = Math.min(500, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 200));
  try {
    return send({ items: await listInbox(limit) });
  } catch (e) {
    return storeFail(e);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, "owner");
  if (auth.error) return auth.error;
  const item = await readObject(request);
  if (!item) return fail(400, "bad_request", "Isi tidak valid.");
  delete item.id;
  try {
    const rec = await addInbox({ ...item, by: auth.who.email === "api" ? (item.by ?? "api") : auth.who.email });
    if (!rec) return fail(429, "quota_exceeded", "Inbox penuh.");
    return send({ id: rec.id });
  } catch (e) {
    return storeFail(e);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireRole(request, "owner");
  if (auth.error) return auth.error;
  const id = request.nextUrl.searchParams.get("id") || "";
  const patch = await readObject(request);
  if (!id || !patch) return fail(400, "bad_request", "Isi tidak valid.");
  try {
    const rec = await updateInbox(id, patch);
    if (!rec) return fail(404, "bad_request", "Item tidak ditemukan.");
    return send({ ok: true });
  } catch (e) {
    return storeFail(e);
  }
}
