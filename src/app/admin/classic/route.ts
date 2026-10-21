import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, adminHeaders, readSession, type Who } from "@/lib/admin/auth";

/*
 * /admin: the owner's Content Studio (studio.html, the claude.ai artifact as it was exported), served only to a
 * signed-in admin. The page talks to `window.claude.use("db" | "user")`; the shim injected below answers those
 * from this site's own API (/admin/api/*) instead, so the page itself stays unchanged:
 *   db.doc("board/state" | "board/sales").onSnapshot(cb)          → polls GET /admin/api/doc
 *   db.collection("inbox").add(obj)                                → POST /admin/api/inbox
 *   db.collection("inbox").orderBy(..).limit(n).onSnapshot(cb)     → polls GET /admin/api/inbox
 *   user.id() / user.can("data.write")                             → the signed-in email / owner or not (team is read-only)
 */

const STUDIO = path.join(process.cwd(), "src", "app", "admin", "classic", "studio.html");

const shim = (me: Who) => {
  const email = JSON.stringify(me.email).replace(/</g, "\\u003c");
  const owner = me.role === "owner";
  return `<script>
/* webdev.co.id: window.claude for the Studio, backed by /admin/api (see src/app/admin/route.ts). */
(() => {
  const POLL = 5000;
  const api = async (p, init) => {
    const r = await fetch("/admin/api/" + p, { credentials: "same-origin", cache: "no-store", ...init,
      headers: { "Content-Type": "application/json", ...(init && init.headers) } });
    if (r.status === 401) { location.href = "/admin/login"; throw Object.assign(new Error("signed out"), { code: "unauthenticated" }); }
    const body = await r.json().catch(() => ({}));
    // 403 = a read-only (team) account: the Studio reads "invalid_argument" as "this account can only view"
    if (!r.ok) throw Object.assign(new Error(body.message || r.statusText), { code: r.status === 403 ? "invalid_argument" : body.code || "unavailable" });
    return body;
  };
  const refreshers = new Set();
  const refreshAll = () => refreshers.forEach((f) => f());
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshAll(); });
  // a polling listener: calls cb only when the server's copy changed
  const listen = (load, cb, err) => {
    let last = null, stop = false;
    const run = async () => {
      if (stop || document.hidden) return;
      try { const { snap, stamp } = await load(); if (stamp !== last) { last = stamp; cb(snap); } }
      catch (e) { if (err) err(e); }
    };
    refreshers.add(run); run(); const t = setInterval(run, POLL);
    return () => { stop = true; clearInterval(t); refreshers.delete(run); };
  };
  const doc = (p) => ({
    onSnapshot: (cb, err) => listen(async () => {
      const d = await api("doc?path=" + encodeURIComponent(p));
      return { stamp: d.exists ? d.at : "none", snap: { exists: !!d.exists, data: () => d.data } };
    }, cb, err),
  });
  const query = (name, limit) => ({
    orderBy: () => query(name, limit),
    limit: (n) => query(name, n),
    onSnapshot: (cb, err) => listen(async () => {
      const d = await api(name + "?limit=" + (limit || 200));
      const docs = d.items.map((x) => { const { id, ...rest } = x; return { id, data: () => rest }; });
      return { stamp: JSON.stringify(d.items.map((x) => x.id + ":" + (x.status || ""))), snap: { docs } };
    }, cb, err),
  });
  const collection = (name) => ({
    ...query(name, 200),
    add: async (obj) => { const d = await api(name, { method: "POST", body: JSON.stringify(obj) }); refreshAll(); return { id: d.id }; },
  });
  const db = { doc, collection };
  const user = { id: async () => ${email}, can: async () => ${owner} };
  window.claude = { use: async (ns) => (ns === "db" ? db : ns === "user" ? user : null) };

  // sign out, at the foot of the sidebar
  const foot = document.querySelector(".side-foot");
  if (foot) {
    const f = document.createElement("form");
    f.method = "post"; f.action = "/admin/logout"; f.style.margin = "0";
    f.innerHTML = '<button class="btn sm ghost" type="submit" style="width:100%" title="Keluar dari Studio">Keluar · ' + ${email}.replace(/[&<>"]/g, "") + ${owner ? '""' : '" (tim)"'} + "</button>";
    foot.appendChild(f);
  }
  // …and in the phone topbar, where the sidebar is hidden (Lucide's log-out, as the Studio's other icons)
  const bar = document.querySelector(".topbar");
  if (bar) {
    const f = document.createElement("form");
    f.method = "post"; f.action = "/admin/logout"; f.style.margin = "0";
    f.innerHTML = '<button class="icon-btn" type="submit" aria-label="Keluar" title="Keluar"><svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg></button>';
    bar.appendChild(f);
  }
})();
</script>
`;
};

export async function GET(request: NextRequest) {
  const me = readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!me) return NextResponse.redirect(new URL("/admin/login", request.url), 303);

  const html = await readFile(STUDIO, "utf8");
  const at = html.lastIndexOf("<script>\n(() => {");
  const page = at < 0 ? html : html.slice(0, at) + shim(me) + html.slice(at);
  return new Response(page.replace(/<title>[^<]*<\/title>/, "<title>webdev Studio</title>"), {
    headers: { ...adminHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
}
