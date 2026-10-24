"use client";

import { useState, type FormEvent } from "react";

const field = "t-body-m h-12 w-full rounded-xl border border-grey-07 bg-white px-4 text-grey-01 outline-none transition-colors placeholder:text-grey-04 focus:border-holo-50";

/** Name, email and (optional) phone, then off to DOKU's checkout page. */
export function CheckoutForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/payments/doku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.get("name"), email: form.get("email"), phone: form.get("phone") }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok || !body.url) throw new Error(body.message || "Gagal membuat pembayaran.");
      location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pembayaran.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="t-body-s text-grey-03">Nama</span>
        <input name="name" required minLength={2} maxLength={80} autoComplete="name" className={field} placeholder="Nama lengkap" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="t-body-s text-grey-03">Email</span>
        <input name="email" type="email" required maxLength={120} autoComplete="email" className={field} placeholder="nama@email.com" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="t-body-s text-grey-03">No. WhatsApp (opsional)</span>
        <input name="phone" type="tel" maxLength={16} autoComplete="tel" inputMode="tel" className={field} placeholder="08xxxxxxxxxx" />
      </label>
      {error && (
        <p role="alert" className="t-body-s font-medium text-grey-01">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="t-button mt-3 h-13.25 cursor-pointer rounded-full bg-black text-white transition-opacity disabled:cursor-wait disabled:opacity-60">
        {busy ? "Membuka DOKU…" : "Bayar sekarang"}
      </button>
      <p className="t-body-s text-center text-grey-04">Kamu akan diarahkan ke halaman pembayaran DOKU.</p>
    </form>
  );
}
