import type { NextRequest } from "next/server";
import { fail, requireRole, send } from "@/lib/admin/auth";
import { StoreError, getDoc, isDoc, setDoc } from "@/lib/admin/store";

/*
 * The Studio's board documents: GET ?path=board/state|board/sales → {exists, data, at} (owner or team);
 * PUT ?path=… with the whole document as JSON replaces it (owner, or `Authorization: Bearer $ADMIN_API_TOKEN`:
 * this is how the team's agent syncs the board).
 */

const MAX = 2_000_000; // bytes per document

const storeFail = (e: unknown) => (e instanceof StoreError ? fail(503, e.code, "Database belum siap atau tidak bisa dihubungi.") : fail(500, "unavailable", "Terjadi kesalahan."));

export async function GET(request: NextRequest) {
  const auth = requireRole(request);
  if (auth.error) return auth.error;
  const p = request.nextUrl.searchParams.get("path") || "";
  if (!isDoc(p)) return fail(400, "bad_request", "Dokumen tidak dikenal.");
  try {
    const rec = await getDoc(p);
    return send(rec ? { exists: true, data: rec.data, at: rec.at } : { exists: false, data: null });
  } catch (e) {
    return storeFail(e);
  }
}

export async function PUT(request: NextRequest) {
  const auth = requireRole(request, "owner");
  if (auth.error) return auth.error;
  const p = request.nextUrl.searchParams.get("path") || "";
  if (!isDoc(p)) return fail(400, "bad_request", "Dokumen tidak dikenal.");
  const text = await request.text();
  if (text.length > MAX) return fail(413, "quota_exceeded", "Dokumen terlalu besar (maks. 2 MB).");
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return fail(400, "bad_request", "Isi bukan JSON.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return fail(400, "bad_request", "Dokumen harus berupa objek.");
  try {
    const rec = await setDoc(p, data);
    return send({ ok: true, at: rec.at });
  } catch (e) {
    return storeFail(e);
  }
}
