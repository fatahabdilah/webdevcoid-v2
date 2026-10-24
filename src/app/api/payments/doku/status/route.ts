import { NextResponse, type NextRequest } from "next/server";
import { DokuError, checkStatus } from "@/lib/payments/doku";
import { applyStatus, getOrder } from "@/lib/payments/orders";

/*
 * GET /api/payments/doku/status?invoice=…: what the "selesai" page shows. Reads the order from the store; while it is
 * still pending (no notification yet, e.g. on localhost) it also asks DOKU's Check Status API, at most every 15 s per
 * invoice. Only the status, amount and item go out, never the customer's details.
 */

const lastAsked = new Map<string, number>();

export async function GET(request: NextRequest) {
  const invoice = request.nextUrl.searchParams.get("invoice") || "";
  if (!/^WD[0-9A-F]{14}$/.test(invoice)) return NextResponse.json({ code: "bad_request", message: "Invoice tidak dikenal." }, { status: 400 });
  let order = await getOrder(invoice);
  if (!order) return NextResponse.json({ code: "not_found", message: "Invoice tidak ditemukan." }, { status: 404 });
  if (order.status === "pending" && Date.now() - (lastAsked.get(invoice) ?? 0) > 15_000) {
    lastAsked.set(invoice, Date.now());
    try {
      const s = await checkStatus(invoice);
      if (s && s.status !== order.doku_status) order = (await applyStatus(invoice, s.status, "cek status", { channel: s.channel, date: s.date })) ?? order;
    } catch (e) {
      if (!(e instanceof DokuError)) throw e;
      console.error("[doku] status", e.message);
    }
  }
  return NextResponse.json(
    { invoice: order.invoice, status: order.status, amount: order.amount, item: order.item, paid_at: order.paid_at ?? null },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}
