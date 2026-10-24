import { NextResponse, type NextRequest } from "next/server";
import { verifyNotification } from "@/lib/payments/doku";
import { applyStatus } from "@/lib/payments/orders";

/*
 * POST /api/payments/doku/notify: DOKU's HTTP Notification. Accepted only with a valid Signature (rebuilt with this
 * path as Request-Target); then the order's status is updated. DOKU may send the same event more than once, and
 * applying a status is safe to repeat. Any 2xx tells DOKU it arrived; anything else makes it retry.
 */

const TARGET = "/api/payments/doku/notify";

export async function POST(request: NextRequest) {
  const raw = await request.text();
  if (!verifyNotification(request.headers, raw, TARGET)) return NextResponse.json({ code: "not_granted", message: "Signature tidak valid." }, { status: 401 });
  let body: { order?: { invoice_number?: string }; transaction?: { status?: string; date?: string }; channel?: { id?: string }; service?: { id?: string } };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ code: "bad_request", message: "Isi bukan JSON." }, { status: 400 });
  }
  const invoice = body.order?.invoice_number;
  const status = body.transaction?.status;
  if (!invoice || !status) return NextResponse.json({ code: "bad_request", message: "Notifikasi tanpa invoice atau status." }, { status: 400 });
  const order = await applyStatus(invoice, status, "notifikasi DOKU", { channel: body.channel?.id ?? body.service?.id, date: body.transaction?.date });
  // an invoice we don't know is still acknowledged, so DOKU doesn't keep retrying it
  if (!order) console.warn("[doku] notification for an unknown invoice", invoice);
  return NextResponse.json({ ok: true });
}
