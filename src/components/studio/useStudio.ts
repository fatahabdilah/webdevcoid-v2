"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentsConfig, Board, InboxItem, Me, RunnerStatus, Sales } from "./model";
import type { Payments } from "./payments";

/*
 * The Studio's live data: board/state, board/sales, the agents' settings, the DOKU payments and the inbox from /admin/api, re-read every 5 seconds (and when
 * the tab comes back). Decisions go to the inbox in the old page's exact shape ({type, status:"new", at, by, ...}),
 * after a 5-second window in which they can be undone; until the team picks one up it shows as "sent".
 */

const POLL = 5000;
const UNDO_MS = 5000;

type Load<T> = { data: T | null; at: string | null; state: "loading" | "ok" | "missing" | "error" };
export type Queued = { id: string; type: string; payload: Record<string, unknown>; label: string; until: number };

async function api(path: string, init?: RequestInit) {
  const r = await fetch(`/admin/api/${path}`, { credentials: "same-origin", cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (r.status === 401) {
    // signed out (or the session expired): a full load of the login page, so no stale state survives
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    location.href = "/admin/login";
    throw new Error("signed out");
  }
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(body.message || r.statusText), { status: r.status, code: body.code });
  return body;
}

export function useStudio(me: Me) {
  const [board, setBoard] = useState<Load<Board>>({ data: null, at: null, state: "loading" });
  const [sales, setSales] = useState<Load<Sales>>({ data: null, at: null, state: "loading" });
  const [agents, setAgents] = useState<Load<AgentsConfig>>({ data: null, at: null, state: "loading" });
  const [runner, setRunner] = useState<Load<RunnerStatus>>({ data: null, at: null, state: "loading" });
  const [payments, setPayments] = useState<Load<Payments>>({ data: null, at: null, state: "loading" });
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [queued, setQueued] = useState<Queued[]>([]);
  const [toast, setToast] = useState<{ text: string; undo?: string; tone?: "bad" } | null>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, []);

  const refresh = useCallback(async () => {
    if (document.hidden) return;
    async function doc<T>(path: string, set: (f: (s: Load<T>) => Load<T>) => void) {
      try {
        const d = await api(`doc?path=${encodeURIComponent(path)}`);
        set((s) => (d.exists ? (s.at === d.at ? s : { data: d.data as T, at: d.at, state: "ok" }) : { data: null, at: null, state: "missing" }));
      } catch {
        set((s) => (s.state === "ok" ? s : { ...s, state: "error" }));
      }
    }
    await Promise.all([
      doc<Board>("board/state", setBoard),
      doc<Sales>("board/sales", setSales),
      doc<AgentsConfig>("agents/config", setAgents),
      doc<RunnerStatus>("runner/status", setRunner),
      doc<Payments>("payments/orders", setPayments),
      api("inbox?limit=200")
        .then((d) => setInbox(d.items))
        .catch(() => {}),
    ]);
  }, []);

  useEffect(() => {
    void refresh();
    const t = setInterval(refresh, POLL);
    const onVis = () => !document.hidden && refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  const flush = useCallback(
    async (q: Queued) => {
      timers.current.delete(q.id);
      try {
        await api("inbox", { method: "POST", body: JSON.stringify({ type: q.type, status: "new", at: new Date().toISOString(), by: me.email, ...q.payload }) });
        await refresh();
        setQueued((all) => all.filter((x) => x.id !== q.id));
      } catch (e) {
        setQueued((all) => all.filter((x) => x.id !== q.id));
        const code = (e as { code?: string }).code;
        setToast({ tone: "bad", text: code === "not_granted" ? "Akunmu hanya bisa melihat, tidak bisa mengirim keputusan." : code === "quota_exceeded" ? "Inbox tim penuh. Minta tim merapikannya dulu." : "Gagal mengirim. Cek koneksi, lalu coba lagi." });
      }
    },
    [me.email, refresh],
  );

  /** Send a decision to the team (after an undo window). */
  const send = useCallback(
    (type: string, payload: Record<string, unknown>, label: string) => {
      const q: Queued = { id: Math.random().toString(36).slice(2), type, payload, label, until: Date.now() + UNDO_MS };
      setQueued((all) => [...all, q]);
      setToast({ text: label, undo: q.id });
      timers.current.set(q.id, setTimeout(() => flush(q), UNDO_MS));
    },
    [flush],
  );
  const undo = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setQueued((all) => all.filter((x) => x.id !== id));
    setToast({ text: "Dibatalkan, tidak ada yang dikirim." });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.undo ? UNDO_MS : 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // what the page treats as "already sent": the server's new items plus the ones still in their undo window
  const all: InboxItem[] = [...inbox, ...queued.map((q) => ({ id: q.id, type: q.type, status: "new", ...(q.payload as object) }))];

  /** Replace a whole settings document (owner only), then re-read. */
  const saveDoc = useCallback(
    async (path: string, data: unknown) => {
      await api(`doc?path=${encodeURIComponent(path)}`, { method: "PUT", body: JSON.stringify(data) });
      await refresh();
    },
    [refresh],
  );

  return { board, sales, agents, runner, payments, inbox: all, history: inbox, send, undo, toast, setToast, refresh, now, saveDoc };
}
