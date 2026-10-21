import type { NextRequest } from "next/server";
import { SESSION_COOKIE, adminHeaders, readSession, whoIs } from "@/lib/admin/auth";
import { getBlob, isBlobName } from "@/lib/admin/blobs";

/**
 * GET /_blob/<name>: a Studio image (see lib/admin/blobs.ts), at the path the claude.ai artifact used, so the board
 * data needs no rewriting (the folder is %5Fblob because Next treats "_" folders as private). Only for a signed-in
 * account (session cookie, path /) or the API token; anyone else gets a plain 404.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/_blob/[name]">) {
  const signedIn = readSession(request.cookies.get(SESSION_COOKIE)?.value) || whoIs(request);
  if (!signedIn) return new Response("Not found", { status: 404, headers: adminHeaders });
  const { name } = await ctx.params;
  if (!isBlobName(name)) return new Response("Not found", { status: 404, headers: adminHeaders });
  const blob = await getBlob(name).catch(() => null);
  if (!blob) return new Response("Not found", { status: 404, headers: adminHeaders });
  return new Response(Buffer.from(blob.bytes), {
    headers: { ...adminHeaders, "Content-Type": blob.type, "Cache-Control": "private, max-age=3600", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'" },
  });
}
