import "server-only";
import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

/*
 * Admin auth for /admin: accounts from the environment, a signed session cookie. Two roles:
 * - owner: everything (the Studio's decisions, syncing the board).
 *     ADMIN_EMAIL, ADMIN_PASSWORD_HASH, optional ADMIN_NAME (how the Studio greets them, and who "mine" is in the
 *     board's checklist; defaults to the part of the email before @)
 * - team: read-only (sees the boards, can't send decisions). Optional.
 *     ADMIN_TEAM_EMAIL, ADMIN_TEAM_PASSWORD_HASH, optional ADMIN_TEAM_NAME
 * - ADMIN_SESSION_SECRET  32+ random bytes (hex) that sign the cookie
 * - ADMIN_API_TOKEN       optional bearer token (owner rights) so a script or agent can sync the board
 * Hashes are "scrypt:<salt hex>:<hash hex>" (colons, not $: Next expands $ in .env files). All of these live in
 * .env.local (ignored by git; `npm run admin:setup` writes them); the repo is public, so never in code.
 */

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export type Role = "owner" | "team";
export type Who = { email: string; role: Role; name: string };
export const SESSION_COOKIE = "wd_admin";
const SESSION_DAYS = 7;

const lower = (s?: string) => (s || "").trim().toLowerCase();
const nameOf = (email: string, set?: string) => {
  const n = (set || "").trim() || email.split("@")[0].replace(/[._-]+/g, " ");
  return n.charAt(0).toUpperCase() + n.slice(1);
};
const accounts = () =>
  [
    { email: lower(process.env.ADMIN_EMAIL), hash: process.env.ADMIN_PASSWORD_HASH || "", role: "owner" as Role, name: process.env.ADMIN_NAME },
    { email: lower(process.env.ADMIN_TEAM_EMAIL), hash: process.env.ADMIN_TEAM_PASSWORD_HASH || "", role: "team" as Role, name: process.env.ADMIN_TEAM_NAME },
  ]
    .filter((a) => a.email && a.hash.startsWith("scrypt:"))
    .map((a) => ({ ...a, name: nameOf(a.email, a.name) }));
const secret = () => process.env.ADMIN_SESSION_SECRET || "";
const apiToken = () => process.env.ADMIN_API_TOKEN || "";

/** True when the owner is set up; without it every admin route answers "not configured" instead of guessing. */
export function adminConfigured() {
  return accounts().some((a) => a.role === "owner") && secret().length >= 32;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, 64);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

const safeEqual = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

/** Checks an email and password; returns the account's role, or null. Always runs one scrypt, so timing doesn't tell which emails exist. */
export async function checkLogin(email: string, password: string): Promise<Who | null> {
  if (!adminConfigured()) return null;
  const want = lower(email);
  const all = accounts();
  const acc = all.find((a) => a.email === want) || all[0];
  const [, saltHex, keyHex] = acc.hash.split(":");
  const key = await scryptAsync(password, Buffer.from(saltHex, "hex"), 64);
  const ok = safeEqual(key, Buffer.from(keyHex, "hex")) && acc.email === want;
  return ok ? { email: acc.email, role: acc.role, name: acc.name } : null;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

/** A session cookie value: base64url(JSON {sub, role, exp}) + "." + HMAC. */
export function createSession(who: Who) {
  const payload = Buffer.from(JSON.stringify({ sub: who.email, role: who.role, exp: Date.now() + SESSION_DAYS * 864e5 })).toString("base64url");
  return { value: `${payload}.${sign(payload)}`, maxAge: SESSION_DAYS * 86400 };
}

/** The signed-in account, or null. The account must still exist with the same role (removing it from env signs it out). */
export function readSession(value: string | undefined): Who | null {
  if (!value || !adminConfigured()) return null;
  const [payload, mac] = value.split(".");
  if (!payload || !mac || !safeEqual(Buffer.from(mac), Buffer.from(sign(payload)))) return null;
  try {
    const { sub, role, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof sub !== "string" || typeof exp !== "number" || exp < Date.now()) return null;
    const acc = accounts().find((a) => a.email === sub && a.role === role);
    return acc ? { email: acc.email, role: acc.role, name: acc.name } : null;
  } catch {
    return null;
  }
}

type Req = Request & { cookies?: { get(name: string): { value: string } | undefined } };

/** Who is calling: the signed-in account (cookie), the API token (as owner), or null. */
export function whoIs(request: Req): Who | null {
  const fromCookie = readSession(request.cookies?.get(SESSION_COOKIE)?.value);
  if (fromCookie) return fromCookie;
  const token = apiToken();
  const auth = request.headers.get("authorization") || "";
  if (token.length >= 32 && auth.startsWith("Bearer ") && safeEqual(Buffer.from(auth.slice(7)), Buffer.from(token))) return { email: "api", role: "owner", name: "API" };
  return null;
}

/* Responses: JSON, never cached, errors as {code, message} (the Creative Terminal convention). */
export const send = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: adminHeaders });
export const fail = (status: number, code: string, message: string) => send({ code, message }, status);

/** Guard for API routes: the caller, or the error response to return. Writes need the owner role. */
export function requireRole(request: Req, need: Role = "team"): { who: Who; error?: undefined } | { who?: undefined; error: NextResponse } {
  const who = whoIs(request);
  if (!who) return { error: fail(401, "not_granted", "Belum login.") };
  if (need === "owner" && who.role !== "owner") return { error: fail(403, "not_granted", "Akun tim hanya bisa melihat board.") };
  if (need === "owner" && !sameOrigin(request)) return { error: fail(403, "not_granted", "Asal permintaan ditolak.") };
  return { who };
}

/** Same-origin check for cookie-authenticated writes (SameSite=Lax already blocks most cross-site posts). */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin form posts and non-browser clients may omit it; the cookie/token still has to be valid
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

/* Login throttle: per IP, 5 tries per 15 minutes. In memory, so per server instance and reset on restart. */
const tries = new Map<string, { n: number; until: number }>();
export function throttled(ip: string) {
  const t = tries.get(ip);
  return Boolean(t && t.n >= 5 && t.until > Date.now());
}
export function noteFailure(ip: string) {
  const t = tries.get(ip);
  if (!t || t.until < Date.now()) tries.set(ip, { n: 1, until: Date.now() + 15 * 60e3 });
  else t.n++;
}
export function clearFailures(ip: string) {
  tries.delete(ip);
}

/** Headers every admin response carries: never cached, never indexed, never framed. */
export const adminHeaders = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "same-origin",
  "X-Content-Type-Options": "nosniff",
};
