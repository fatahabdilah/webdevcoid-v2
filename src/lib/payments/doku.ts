import "server-only";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";

/*
 * DOKU Checkout (non-SNAP), with plain fetch: create a checkout page, check an order's status, and verify the HTTP
 * notifications DOKU sends. Env: DOKU_CLIENT_ID, DOKU_SECRET_KEY (DOKU Back Office → Integration → API Keys),
 * DOKU_ENV = "sandbox" (default) or "production".
 * Docs: developers.doku.com → DOKU Checkout → Backend Integration; Signature Component (non-SNAP); Check Status API.
 */

// DOKU_API_BASE points the calls elsewhere (a local mock, for tests); unset in real use
const BASE = () => process.env.DOKU_API_BASE || (process.env.DOKU_ENV === "production" ? "https://api.doku.com" : "https://api-sandbox.doku.com");
const clientId = () => process.env.DOKU_CLIENT_ID || "";
const secret = () => process.env.DOKU_SECRET_KEY || "";
export const dokuConfigured = () => Boolean(clientId() && secret());
export const dokuEnv = () => (process.env.DOKU_ENV === "production" ? "production" : "sandbox");

export class DokuError extends Error {}

/** `HMACSHA256=` + base64 HMAC-SHA256 (secret key) of the component lines; Digest (base64 SHA-256 of the body) only with a body. */
function signature(p: { clientId: string; requestId: string; timestamp: string; target: string; body?: string }) {
  const lines = [`Client-Id:${p.clientId}`, `Request-Id:${p.requestId}`, `Request-Timestamp:${p.timestamp}`, `Request-Target:${p.target}`];
  if (p.body !== undefined) lines.push(`Digest:${createHash("sha256").update(p.body, "utf8").digest("base64")}`);
  return `HMACSHA256=${createHmac("sha256", secret()).update(lines.join("\n"), "utf8").digest("base64")}`;
}

/** UTC, ISO 8601 without milliseconds, as DOKU asks ("2020-08-11T08:45:42Z"). */
const stamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

async function call(method: "GET" | "POST", target: string, body?: unknown) {
  if (!dokuConfigured()) throw new DokuError("DOKU belum diatur (DOKU_CLIENT_ID dan DOKU_SECRET_KEY).");
  const requestId = randomUUID();
  const timestamp = stamp();
  const text = body === undefined ? undefined : JSON.stringify(body);
  const headers: Record<string, string> = {
    "Client-Id": clientId(),
    "Request-Id": requestId,
    "Request-Timestamp": timestamp,
    Signature: signature({ clientId: clientId(), requestId, timestamp, target, body: text }),
  };
  if (text !== undefined) headers["Content-Type"] = "application/json";
  let res: Response;
  try {
    res = await fetch(`${BASE()}${target}`, { method, headers, body: text, cache: "no-store" });
  } catch {
    throw new DokuError("DOKU tidak bisa dihubungi.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new DokuError(`DOKU ${res.status}: ${JSON.stringify(data.message ?? data.error ?? data).slice(0, 200)}`);
  return data;
}

export type CheckoutRequest = {
  invoice: string;
  amount: number;
  item: { id: string; name: string; price: number; quantity: number };
  customer: { name: string; email: string; phone?: string };
  /** Where "Back to merchant" and the result page lead. */
  returnUrl: string;
  /** Overrides the Notification URL set in the Back Office (only for a public https address). */
  notifyUrl?: string;
  /** Minutes until the checkout page expires. */
  dueMinutes: number;
};

/** Creates the DOKU checkout page for one order; returns its URL and expiry (yyyyMMddHHmmss, UTC+7). */
export async function createCheckout(r: CheckoutRequest): Promise<{ url: string; expiredDate: string }> {
  const data = await call("POST", "/checkout/v1/payment", {
    order: {
      amount: r.amount,
      invoice_number: r.invoice,
      currency: "IDR",
      callback_url: r.returnUrl,
      callback_url_result: r.returnUrl,
      language: "ID",
      auto_redirect: true,
      line_items: [r.item],
    },
    payment: { payment_due_date: r.dueMinutes },
    customer: { id: r.customer.email, name: r.customer.name, email: r.customer.email, ...(r.customer.phone ? { phone: r.customer.phone } : {}), country: "ID" },
    ...(r.notifyUrl ? { additional_info: { override_notification_url: r.notifyUrl } } : {}),
  });
  const url = data?.response?.payment?.url;
  if (typeof url !== "string") throw new DokuError("DOKU tidak mengirim alamat halaman pembayaran.");
  return { url, expiredDate: String(data.response.payment.expired_date ?? "") };
}

/** The order's status at DOKU (`transaction.status`: SUCCESS, PENDING, FAILED, EXPIRED, ...), or null when DOKU has none yet. */
export async function checkStatus(invoice: string): Promise<{ status: string; channel?: string; date?: string } | null> {
  try {
    const data = await call("GET", `/orders/v1/status/${encodeURIComponent(invoice)}`);
    const status = data?.transaction?.status;
    if (typeof status !== "string") return null;
    return { status, channel: data?.channel?.id ?? data?.service?.id, date: data?.transaction?.date };
  } catch (e) {
    if (e instanceof DokuError && /\b404\b/.test(e.message)) return null;
    throw e;
  }
}

/**
 * True when an HTTP notification really comes from DOKU: the Signature header must match the one rebuilt from its
 * Client-Id, Request-Id and Request-Timestamp headers, our notification path as Request-Target and the raw body.
 */
export function verifyNotification(headers: Headers, rawBody: string, target: string) {
  const got = headers.get("signature") || "";
  const id = headers.get("client-id") || "";
  const requestId = headers.get("request-id") || "";
  const timestamp = headers.get("request-timestamp") || "";
  if (!got || !requestId || !timestamp || id !== clientId() || !dokuConfigured()) return false;
  const want = signature({ clientId: id, requestId, timestamp, target, body: rawBody });
  const a = Buffer.from(got), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}
