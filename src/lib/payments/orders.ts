import "server-only";
import { randomBytes } from "node:crypto";
import { getDoc, setDoc } from "@/lib/admin/store";

/*
 * Payment orders, kept in the admin store as one document (`payments/orders`), newest first, so the Studio reads them
 * like its other boards. Writes go through one queue per server instance, so a new order and a notification arriving
 * together don't overwrite each other.
 */

export type OrderStatus = "pending" | "paid" | "failed" | "expired";
export type Order = {
  invoice: string;
  item: string;
  amount: number;
  customer: { name: string; email: string; phone?: string };
  status: OrderStatus;
  /** DOKU's own status word, as last received (SUCCESS, PENDING, FAILED, EXPIRED, ...). */
  doku_status?: string;
  channel?: string;
  checkout_url?: string;
  expires?: string;
  created_at: string;
  paid_at?: string;
  updated_at: string;
  env: "sandbox" | "production";
  /** What happened, oldest first: created, notified, checked. */
  log: { at: string; event: string; note?: string }[];
};
type Doc = { orders: Order[] };

const PATH = "payments/orders" as const;
const KEEP = 500;

/** WD + yymmdd + 8 hex: unique, short, no symbols (some DOKU channels refuse them). */
export const newInvoice = () => {
  const d = new Date(Date.now() + 7 * 36e5).toISOString(); // WIB date
  return `WD${d.slice(2, 4)}${d.slice(5, 7)}${d.slice(8, 10)}${randomBytes(4).toString("hex").toUpperCase()}`;
};

/** DOKU's transaction status → ours. Unknown words keep the order pending. */
export function fromDoku(status: string): OrderStatus {
  const s = status.toUpperCase();
  if (s === "SUCCESS") return "paid";
  if (s === "FAILED") return "failed";
  if (s === "EXPIRED") return "expired";
  return "pending";
}

let queue: Promise<unknown> = Promise.resolve();
function update<T>(fn: (doc: Doc) => T): Promise<T> {
  const run = queue.then(async () => {
    const rec = await getDoc(PATH);
    const doc: Doc = rec && typeof rec.data === "object" && rec.data && Array.isArray((rec.data as Doc).orders) ? (rec.data as Doc) : { orders: [] };
    const out = fn(doc);
    doc.orders = doc.orders.slice(0, KEEP);
    await setDoc(PATH, doc);
    return out;
  });
  queue = run.catch(() => {});
  return run;
}

export async function getOrder(invoice: string): Promise<Order | null> {
  const rec = await getDoc(PATH);
  return ((rec?.data as Doc | undefined)?.orders ?? []).find((o) => o.invoice === invoice) ?? null;
}

export const addOrder = (o: Order) => update((doc) => void doc.orders.unshift(o));

/** Changes fields of an order (the checkout page once DOKU made it, or a failure note). */
export const patchOrder = (invoice: string, patch: Partial<Order>, event: string, note?: string) =>
  update((doc) => {
    const o = doc.orders.find((x) => x.invoice === invoice);
    if (!o) return null;
    const now = new Date().toISOString();
    Object.assign(o, patch, { updated_at: now });
    o.log.push({ at: now, event, ...(note ? { note } : {}) });
    return o;
  });

/**
 * Applies a status from DOKU (a notification or a status check). A paid order stays paid: a late or repeated
 * message never turns it back. Returns the order, or null if the invoice is unknown.
 */
export const applyStatus = (invoice: string, dokuStatus: string, event: string, extra: { channel?: string; date?: string } = {}) =>
  update((doc) => {
    const o = doc.orders.find((x) => x.invoice === invoice);
    if (!o) return null;
    const now = new Date().toISOString();
    const next = fromDoku(dokuStatus);
    if (o.status !== "paid") {
      o.status = next;
      o.doku_status = dokuStatus;
      if (next === "paid") o.paid_at = extra.date || now;
      if (extra.channel) o.channel = extra.channel;
    }
    o.updated_at = now;
    o.log.push({ at: now, event, note: dokuStatus });
    return o;
  });
