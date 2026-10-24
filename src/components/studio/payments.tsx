"use client";

import { useMemo, useState } from "react";
import { ago, fmtDay } from "./model";
import { Empty } from "./ui";

/* ---------------------------------------------------------------- Pembayaran */

/** One order from `payments/orders` (written by the DOKU payment routes; see src/lib/payments/orders.ts). */
export type PaymentOrder = {
  invoice: string;
  item: string;
  amount: number;
  customer: { name: string; email: string; phone?: string };
  status: "pending" | "paid" | "failed" | "expired";
  doku_status?: string;
  channel?: string;
  created_at: string;
  paid_at?: string;
  env: "sandbox" | "production";
};
export type Payments = { orders: PaymentOrder[] };

const STATUS: Record<PaymentOrder["status"], { label: string; tag: string }> = {
  paid: { label: "Lunas", tag: "ok" },
  pending: { label: "Menunggu bayar", tag: "you" },
  failed: { label: "Gagal", tag: "bad" },
  expired: { label: "Kedaluwarsa", tag: "" },
};
const rp = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
/** DOKU channel ids in plain words: VIRTUAL_ACCOUNT_BCA → Virtual Account BCA. */
const channel = (c?: string) => (c ? c.toLowerCase().split("_").map((w) => (w.length <= 3 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))).join(" ") : "");

/** The payments made on /testing (and later the real checkout), newest first, with what was paid in total. */
export function PaymentsView({ data }: { data: Payments | null }) {
  const [show, setShow] = useState<"all" | PaymentOrder["status"]>("all");
  const orders = useMemo(() => data?.orders ?? [], [data]);
  const paid = orders.filter((o) => o.status === "paid");
  const list = show === "all" ? orders : orders.filter((o) => o.status === show);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-px border border-[var(--line)] bg-[var(--line)]">
        {[
          ["Diterima", rp(paid.reduce((t, o) => t + o.amount, 0))],
          ["Lunas", String(paid.length)],
          ["Menunggu", String(orders.filter((o) => o.status === "pending").length)],
        ].map(([l, v]) => (
          <div key={l} className="bg-[var(--surface)] px-4 py-4 md:px-5">
            <p className="lbl mb-1">{l}</p>
            <p className="text-[20px] font-semibold tracking-tight md:text-[24px]">{v}</p>
          </div>
        ))}
      </div>

      <section className="panel">
        <header className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] px-5 py-4">
          <h2 className="mr-auto text-[17px] font-semibold">Transaksi</h2>
          {(
            [
              ["all", "Semua"],
              ["paid", "Lunas"],
              ["pending", "Menunggu"],
              ["failed", "Gagal"],
              ["expired", "Kedaluwarsa"],
            ] as const
          ).map(([k, l]) => (
            <button key={k} type="button" className="chip" aria-pressed={show === k} onClick={() => setShow(k)}>
              {l}
            </button>
          ))}
        </header>
        {list.length ? (
          <ul>
            {list.map((o) => {
              const s = STATUS[o.status];
              return (
                <li key={o.invoice} className="grid gap-x-4 gap-y-1 border-t border-[var(--line)] px-5 py-4 first:border-t-0 md:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <b className="text-[15px] font-medium">{o.customer.name}</b>
                      <span className={`tag ${s.tag}`}>{s.label}</span>
                      {o.env === "sandbox" && <span className="tag info">Sandbox</span>}
                    </p>
                    <p className="mt-1 truncate text-[13px] text-[var(--ink-3)]">
                      {o.customer.email}
                      {o.customer.phone ? ` · ${o.customer.phone}` : ""}
                    </p>
                    <p className="mt-1 text-[13px] text-[var(--ink-2)]">
                      <span className="mono text-[12px] text-[var(--accent-text)]">{o.invoice}</span> {o.item}
                      {o.channel ? ` · ${channel(o.channel)}` : ""}
                    </p>
                  </div>
                  <div className="md:text-right">
                    <p className="text-[17px] font-semibold tracking-tight">{rp(o.amount)}</p>
                    <p className="mono text-[12px] text-[var(--ink-3)]">{o.paid_at ? `Dibayar ${fmtDay(o.paid_at)}` : `Dibuat ${ago(o.created_at)}`}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty
            title={orders.length ? "Tidak ada yang cocok." : "Belum ada pembayaran."}
            text={orders.length ? undefined : "Pembayaran dari halaman webdev.co.id/testing akan muncul di sini, lengkap dengan statusnya dari DOKU."}
          />
        )}
      </section>
    </div>
  );
}
