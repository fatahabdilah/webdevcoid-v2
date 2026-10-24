import type { NextRequest } from "next/server";
import { fail, requireRole, send } from "@/lib/admin/auth";
import { BLOB_MAX, BLOB_TYPES, isBlobName, putBlob } from "@/lib/admin/blobs";
import { StoreError } from "@/lib/admin/store";

/**
 * PUT /admin/api/blob/<name> with the image as the body and its Content-Type (png, jpeg, webp, gif; max 8 MB):
 * stores a Studio image (slide previews), then reference it from a task as "/_blob/<name>". Owner or API token.
 */
export async function PUT(request: NextRequest, ctx: RouteContext<"/admin/api/blob/[name]">) {
  const auth = await requireRole(request, "owner");
  if (auth.error) return auth.error;
  const { name } = await ctx.params;
  if (!isBlobName(name)) return fail(400, "bad_request", "Nama gambar tidak valid.");
  const type = (request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!BLOB_TYPES.includes(type)) return fail(400, "bad_request", "Hanya PNG, JPEG, WebP, atau GIF.");
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (!bytes.length) return fail(400, "bad_request", "Gambar kosong.");
  if (bytes.length > BLOB_MAX) return fail(413, "quota_exceeded", "Gambar terlalu besar (maks. 8 MB).");
  try {
    await putBlob(name, type, bytes);
    return send({ ok: true, path: `/_blob/${name}` });
  } catch (e) {
    return e instanceof StoreError ? fail(503, "unavailable", "Penyimpanan gambar belum siap.") : fail(500, "unavailable", "Terjadi kesalahan.");
  }
}
