import { NextResponse, type NextRequest } from "next/server";
import { sameOrigin } from "@/lib/admin/auth";
import { StoreError } from "@/lib/admin/store";
import { DokuError, createCheckout, dokuConfigured, dokuEnv } from "@/lib/payments/doku";
import { addOrder, newInvoice, patchOrder } from "@/lib/payments/orders";
import { TEST_PRODUCT } from "@/lib/payments/products";

/*
 * POST /api/payments/doku: starts a payment for the /testing page's one product. Takes {name, email, phone?}, saves
 * the order (pending) in the admin store FIRST, so no DOKU checkout ever exists without its record, then opens the
 * DOKU checkout page and returns {invoice, url}. The price is fixed on the server (`TEST_PRODUCT`), never taken from
 * the browser.
 */

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
const fail = (status: number, code: string, message: string) => json({ code, message }, status);

/* At most 5 checkouts per IP per 10 minutes (in memory, per server instance). */
const recent = new Map<string, number[]>();
function tooMany(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60e3);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > 5;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return fail(403, "not_granted", "Asal permintaan ditolak.");
  if (!dokuConfigured()) return fail(503, "unavailable", "Pembayaran belum diatur di server.");
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) return fail(429, "quota_exceeded", "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.");

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim().slice(0, 80);
  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 120);
  const phone = String(body?.phone ?? "").replace(/[^\d+]/g, "").slice(0, 16);
  if (name.length < 2) return fail(400, "bad_request", "Isi namamu.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(400, "bad_request", "Alamat email belum benar.");

  const origin = request.nextUrl.origin;
  const invoice = newInvoice();
  const now = new Date().toISOString();
  // DOKU can only reach a public https address; elsewhere (localhost) the Back Office's Notification URL applies
  const notifyUrl = origin.startsWith("https://") && !/localhost|127\.0\.0\.1/.test(origin) ? `${origin}/api/payments/doku/notify` : undefined;

  try {
    await addOrder({
      invoice,
      item: TEST_PRODUCT.name,
      amount: TEST_PRODUCT.price,
      customer: { name, email, ...(phone ? { phone } : {}) },
      status: "pending",
      created_at: now,
      updated_at: now,
      env: dokuEnv(),
      log: [{ at: now, event: "dibuat", note: notifyUrl ? `notifikasi ke ${notifyUrl}` : "notifikasi ke URL di DOKU Back Office" }],
    });
  } catch (e) {
    if (e instanceof StoreError) return fail(503, "unavailable", "Database belum siap, pembayaran belum bisa dibuat.");
    throw e;
  }

  try {
    const checkout = await createCheckout({
      invoice,
      amount: TEST_PRODUCT.price,
      item: { id: TEST_PRODUCT.id, name: TEST_PRODUCT.name, price: TEST_PRODUCT.price, quantity: 1 },
      customer: { name, email, phone: phone || undefined },
      returnUrl: `${origin}/testing/selesai?invoice=${invoice}`,
      notifyUrl,
      dueMinutes: 60,
    });
    // the page is open at DOKU either way; a failed note here only loses the link in the Studio
    await patchOrder(invoice, { checkout_url: checkout.url, expires: checkout.expiredDate }, "halaman DOKU dibuat").catch(() => {});
    return json({ invoice, url: checkout.url });
  } catch (e) {
    if (!(e instanceof DokuError)) throw e;
    console.error("[doku] checkout", e.message);
    await patchOrder(invoice, { status: "failed" }, "DOKU menolak", e.message.slice(0, 200)).catch(() => {});
    return fail(502, "unavailable", "DOKU menolak atau tidak bisa dihubungi. Coba lagi sebentar lagi.");
  }
}
