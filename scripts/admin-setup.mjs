// npm run admin:setup            → the owner account (full access) + the Supabase connection
// npm run admin:setup -- team    → the team account (read-only)
// Writes .env.local (ignored by git). Asks for an email and a password (hidden) and stores only a scrypt hash of
// it; generates the session secret and an API token once. Run it again to change a password; other values stay.
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import readline from "node:readline";

const FILE = new URL("../.env.local", import.meta.url);
const team = process.argv[2] === "team";

function ask(q, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) rl._writeToOutput = (s) => rl.output.write(s.includes(q) ? s : "");
    rl.question(q, (a) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(a.trim());
    });
  });
}

const lines = existsSync(FILE) ? readFileSync(FILE, "utf8").split("\n") : [];
const has = (k) => lines.some((l) => l.startsWith(k + "=") && l.length > k.length + 1);
const set = (k, v, keep = false) => {
  const i = lines.findIndex((l) => l.startsWith(k + "="));
  if (i >= 0 && keep) return;
  if (i >= 0) lines[i] = `${k}=${v}`;
  else lines.push(`${k}=${v}`);
};

console.log(team ? "Akun TIM (hanya bisa melihat board)" : "Akun OWNER (akses penuh)");
const email = (await ask("Email: ")).toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email tidak valid.");
const pw = await ask("Password (min. 12 karakter): ", true);
if (pw.length < 12) throw new Error("Password minimal 12 karakter.");
if (pw !== (await ask("Ulangi password: ", true))) throw new Error("Password tidak sama.");
const salt = randomBytes(16);
const hash = `scrypt:${salt.toString("hex")}:${scryptSync(pw, salt, 64).toString("hex")}`;

set(team ? "ADMIN_TEAM_EMAIL" : "ADMIN_EMAIL", email);
const name = await ask("Nama panggilan (mis. Fatah, Mic; Enter = dari email): ");
if (name) set(team ? "ADMIN_TEAM_NAME" : "ADMIN_NAME", name);
set(team ? "ADMIN_TEAM_PASSWORD_HASH" : "ADMIN_PASSWORD_HASH", hash);
set("ADMIN_SESSION_SECRET", randomBytes(32).toString("hex"), true);
set("ADMIN_API_TOKEN", randomBytes(32).toString("hex"), true);

if (!team) {
  console.log("\nSupabase (Project Settings → Data API / API Keys). Enter untuk lewati / tetap pakai yang lama.");
  const url = await ask(`Project URL${has("SUPABASE_URL") ? " (sudah ada)" : ""}: `);
  if (url) {
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url)) throw new Error("URL harus seperti https://xxxx.supabase.co");
    set("SUPABASE_URL", url.replace(/\/$/, ""));
  }
  const key = await ask(`Secret key (sb_secret_… atau service_role)${has("SUPABASE_SECRET_KEY") ? " (sudah ada)" : ""}: `, true);
  if (key) set("SUPABASE_SECRET_KEY", key);
}

writeFileSync(FILE, lines.filter((l, i, a) => l || i < a.length - 1).join("\n") + "\n", { mode: 0o600 });
console.log("\nTersimpan di .env.local. Restart server (npm run dev / npm start), lalu buka /admin.");
