"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { rupiah } from "@/lib/payments/products";

type Result = { invoice: string; status: "pending" | "paid" | "failed" | "expired"; amount: number; item: string; paid_at: string | null };

const COPY: Record<Result["status"], { title: string; text: string; tone: string }> = {
  paid: { title: "Pembayaran berhasil", text: "Terima kasih. Pembayaranmu sudah kami terima.", tone: "text-holo-50" },
  pending: { title: "Menunggu pembayaran", text: "Kalau kamu sudah membayar, status di sini berubah sendiri dalam beberapa detik.", tone: "text-grey-01" },
  failed: { title: "Pembayaran gagal", text: "Pembayaran tidak berhasil. Silakan coba lagi.", tone: "text-grey-01" },
  expired: { title: "Waktu pembayaran habis", text: "Halaman pembayaran sudah kedaluwarsa. Silakan buat pembayaran baru.", tone: "text-grey-01" },
};

/** Reads the order's status, and re-reads every 5 s while it is still pending. */
export function PaymentResult() {
  const invoice = useSearchParams().get("invoice") || "";
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!invoice) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const r = await fetch(`/api/payments/doku/status?invoice=${encodeURIComponent(invoice)}`, { cache: "no-store" });
        const body = await r.json();
        if (!r.ok) throw new Error(body.message || "Status tidak bisa dibaca.");
        if (stop) return;
        setResult(body);
        setError("");
        if (body.status === "pending") timer = setTimeout(load, 5000);
      } catch (e) {
        if (stop) return;
        setError(e instanceof Error ? e.message : "Status tidak bisa dibaca.");
        timer = setTimeout(load, 10000);
      }
    };
    void load();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [invoice]);

  if (!invoice) return <p className="t-body-m text-grey-03">Tidak ada invoice di alamat ini.</p>;
  if (!result) return <p className="t-body-m text-grey-03">{error || "Memeriksa pembayaran…"}</p>;
  const c = COPY[result.status];
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="t-body-s text-grey-04">{result.invoice}</p>
      <h1 className={`t-title-m ${c.tone}`}>{c.title}</h1>
      <p className="t-body-m text-grey-03">{c.text}</p>
      <p className="t-body-m mt-2 text-grey-01">
        {result.item} · {rupiah(result.amount)}
      </p>
      {result.status !== "paid" && result.status !== "pending" && (
        <Link href="/testing" className="t-button mt-4 flex h-13.25 items-center rounded-full bg-black px-[26px] text-white">
          Coba lagi
        </Link>
      )}
    </div>
  );
}
