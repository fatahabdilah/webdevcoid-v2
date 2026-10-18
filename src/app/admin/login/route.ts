import { NextResponse, type NextRequest } from "next/server";
import { LOGO_MARK_D, LOGO_WORDMARK_D } from "@/lib/logoPaths";
import {
  SESSION_COOKIE,
  adminConfigured,
  adminHeaders,
  checkLogin,
  clearFailures,
  createSession,
  noteFailure,
  readSession,
  sameOrigin,
  throttled,
} from "@/lib/admin/auth";

/*
 * /admin/login: a plain HTML page (outside the site's layout, so no intro, smooth scroll or custom cursor) with
 * one form. POST checks the email and password, sets the session cookie and goes on to /admin.
 */

const ERRORS: Record<string, string> = {
  "1": "Email atau password salah.",
  "2": "Terlalu banyak percobaan. Coba lagi dalam 15 menit.",
  "3": "Admin belum diatur di server. Jalankan npm run admin:setup, lalu restart server.",
  out: "Kamu sudah keluar.",
};

const ip = (req: NextRequest) => (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function page(note?: string, bad = true) {
  const lockup = `<svg class="lockup" viewBox="0 0 599 125" aria-label="webdev.co.id" role="img"><path d="${LOGO_MARK_D}" fill-rule="evenodd"/><path d="${LOGO_WORDMARK_D}"/></svg>`;
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Masuk · webdev Studio</title>
<link rel="icon" href="/icon.svg" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" />
<style>
  :root {
    --bg: #050507; --surface: #0d0e13; --line: rgba(255,255,255,.09); --line-2: rgba(255,255,255,.18);
    --ink: #f3f3f5; --ink-2: rgba(236,236,242,.66); --ink-3: rgba(220,220,232,.44);
    --navy: #011f6c; --blue: #0346d6; --light: #236ef3; --bad: #ff8895;
    --f-sans: "Geist", system-ui, sans-serif; --f-mono: "Geist Mono", ui-monospace, Menlo, monospace;
    color-scheme: dark;
  }
  * { box-sizing: border-box; margin: 0; }
  html, body { min-height: 100%; }
  body {
    min-height: 100svh; display: grid; place-items: center; padding: 24px 16px;
    font: 15px/1.5 var(--f-sans); color: var(--ink); -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(60% 45% at 50% 0%, color-mix(in srgb, var(--blue) 26%, transparent), transparent 70%),
      radial-gradient(circle, rgba(226,230,242,.09) 1px, transparent 1.2px) 0 0 / 22px 22px,
      var(--bg);
  }
  .card {
    position: relative; width: 100%; max-width: 400px; padding: 36px 32px 30px;
    background: color-mix(in srgb, var(--surface) 92%, transparent); border: 1px solid var(--line);
    box-shadow: 0 30px 80px -24px rgba(0,0,0,.8);
  }
  /* corner ticks, as the studio's modules */
  .card::before, .card::after { content: ""; position: absolute; width: 10px; height: 10px; border: 1px solid var(--line-2); }
  .card::before { top: -1px; left: -1px; border-right: 0; border-bottom: 0; }
  .card::after { bottom: -1px; right: -1px; border-left: 0; border-top: 0; }
  .lockup { display: block; height: 22px; width: auto; fill: var(--ink); margin-bottom: 28px; }
  .lbl { font: 500 11px/1 var(--f-mono); letter-spacing: .08em; text-transform: uppercase; color: var(--ink-3); }
  h1 { font-size: 24px; font-weight: 600; letter-spacing: -.02em; margin: 10px 0 6px; }
  .lede { color: var(--ink-2); font-size: 14px; margin-bottom: 24px; }
  form { display: grid; gap: 16px; }
  label { display: grid; gap: 8px; }
  input {
    width: 100%; height: 46px; padding: 0 14px; font: inherit; color: var(--ink);
    background: #08090d; border: 1px solid var(--line-2); border-radius: 2px; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  input:focus { border-color: var(--light); box-shadow: 0 0 0 3px color-mix(in srgb, var(--light) 25%, transparent); }
  button {
    height: 48px; margin-top: 6px; border: 0; border-radius: 999px; cursor: pointer;
    font: 600 15px var(--f-sans); letter-spacing: -.01em; color: #fff;
    background: linear-gradient(180deg, var(--light), var(--blue) 55%, var(--navy));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 10px 24px -10px color-mix(in srgb, var(--blue) 70%, transparent);
    transition: filter .2s, transform .1s;
  }
  button:hover { filter: brightness(1.08); }
  button:active { transform: translateY(1px); }
  button:focus-visible { outline: 2px solid var(--light); outline-offset: 3px; }
  .note { font-size: 13px; padding: 10px 12px; border: 1px solid var(--line); margin-bottom: 4px; }
  .note.bad { color: var(--bad); border-color: color-mix(in srgb, var(--bad) 35%, transparent); background: color-mix(in srgb, var(--bad) 8%, transparent); }
  .note.ok { color: var(--ink-2); }
  .foot { margin-top: 22px; color: var(--ink-3); font: 12px var(--f-mono); }
</style>
</head>
<body>
  <main class="card">
    ${lockup}
    <span class="lbl">Studio · admin</span>
    <h1>Masuk ke Studio</h1>
    <p class="lede">Khusus tim webdev.co.id.</p>
    <form method="post" action="/admin/login">
      ${note ? `<p class="note ${bad ? "bad" : "ok"}" role="alert">${esc(note)}</p>` : ""}
      <label><span class="lbl">Email</span><input name="email" type="email" autocomplete="username" required autofocus /></label>
      <label><span class="lbl">Password</span><input name="password" type="password" autocomplete="current-password" required /></label>
      <button type="submit">Masuk</button>
    </form>
    <p class="foot">Sesi berlaku 7 hari.</p>
  </main>
</body>
</html>`;
}

const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { ...adminHeaders, "Content-Type": "text/html; charset=utf-8" } });

export async function GET(request: NextRequest) {
  if (readSession(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.redirect(new URL("/admin", request.url), 303);
  const e = request.nextUrl.searchParams.get("e") || (adminConfigured() ? "" : "3");
  return html(page(ERRORS[e], e !== "out"));
}

export async function POST(request: NextRequest) {
  const back = (e: string) => NextResponse.redirect(new URL(`/admin/login?e=${e}`, request.url), 303);
  if (!adminConfigured()) return back("3");
  if (!sameOrigin(request)) return back("1");
  const client = ip(request);
  if (throttled(client)) return back("2");

  const form = await request.formData().catch(() => null);
  const email = String(form?.get("email") || "").slice(0, 200);
  const password = String(form?.get("password") || "").slice(0, 500);
  const who = await checkLogin(email, password);
  if (!who) {
    noteFailure(client);
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return back(throttled(client) ? "2" : "1");
  }

  clearFailures(client);
  const s = createSession(who);
  const res = NextResponse.redirect(new URL("/admin", request.url), 303);
  res.cookies.set(SESSION_COOKIE, s.value, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/admin",
    maxAge: s.maxAge,
  });
  return res;
}
