#!/usr/bin/env node
// npm run agents: the agent runner, on the team's computer. It connects the Studio (/admin) to Claude Code, which runs on
// the owner's Claude subscription (no API key; Claude Code must be logged in once with `claude`).
//
// Every few minutes (the Studio's Settings → "Periksa inbox setiap"):
//   1. reports what is connected (Claude, Gemini, Figma) to runner/status, so the Settings page shows it;
//   2. if the Studio's switch is on and the inbox has new items: builds a workspace (agents/.workspace/<team>) from the
//      agents' .md in agents/config (the lead's rules as CLAUDE.md, other active agents as Claude Code subagents), the
//      boards and the new inbox items, runs the lead (now: Agent Riset for prospect requests) with `claude -p`, then sends the
//      updated board back and marks the inbox items done with the lead's one-line replies.
//
// Env (from .env.local or the shell): ADMIN_API_TOKEN (required), STUDIO_BASE (default http://localhost:3000),
// GEMINI_API_KEY (Darno's images), GEMINI_IMAGE_MODEL (optional). Nothing secret is written to the workspace.
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Runs a command with a hard time limit. Claude Code starts helper processes (MCP servers) that can keep the output
// pipe open long after it exits, so the whole process group is killed at the limit and the result is taken on exit.
function run(cmd, args, { timeout = 60e3, cwd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, detached: true, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "", killed = false;
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    const timer = setTimeout(() => {
      killed = true;
      try { process.kill(-child.pid, "SIGKILL"); } catch {}
    }, timeout);
    child.on("error", (e) => (clearTimeout(timer), reject(e)));
    child.on("exit", (code) => {
      clearTimeout(timer);
      if (code === 0 && !killed) return resolve({ stdout, stderr });
      reject(Object.assign(new Error(`${cmd} ${args[0]}: ${(stderr || stdout).slice(-200)}`), { killed, code }));
    });
  });
}
// Research needs only web search, so its Claude runs without the owner's MCP servers (faster, nothing to hang on).
const NO_MCP = ["--strict-mcp-config", "--mcp-config", '{"mcpServers":{}}'];
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const WS = path.join(HERE, ".workspace");
const LOCK = path.join(WS, ".lock");

// ---------------------------------------------------------------- env
for (const line of existsSync(path.join(ROOT, ".env.local")) ? readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n") : []) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const BASE = (process.env.STUDIO_BASE || "http://localhost:3000").replace(/\/$/, "");
const TOKEN = process.env.ADMIN_API_TOKEN || "";
if (TOKEN.length < 32) {
  console.error("ADMIN_API_TOKEN belum ada. Jalankan `npm run admin:setup` dulu.");
  process.exit(1);
}
const ONCE = process.argv.includes("--once");
const log = (...a) => console.log(new Date().toLocaleTimeString("id-ID"), ...a);

// ---------------------------------------------------------------- Studio API
async function api(p, init = {}) {
  const r = await fetch(`${BASE}/admin/api/${p}`, { ...init, headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json", ...init.headers } });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${init.method || "GET"} ${p}: HTTP ${r.status} ${body.code || ""} ${body.message || ""}`.trim());
  return body;
}
const getDoc = async (p) => (await api(`doc?path=${encodeURIComponent(p)}`)).data ?? null;
const putDoc = (p, data) => api(`doc?path=${encodeURIComponent(p)}`, { method: "PUT", body: JSON.stringify(data) });

// ---------------------------------------------------------------- connections
let claudeCheck = { at: 0, value: null };
async function checkClaude() {
  // a good result is trusted for an hour; a failed one is checked again on the next tick
  if (Date.now() - claudeCheck.at < 60 * 60e3 && claudeCheck.value?.ok) return claudeCheck.value;
  let value;
  try {
    const { stdout: v } = await run("claude", ["--version"], { timeout: 20e3 });
    // a tiny round trip proves the subscription login works (once an hour)
    const { stdout } = await run("claude", ["-p", "Balas hanya: OK", "--output-format", "json", "--max-turns", "1", ...NO_MCP], { timeout: 120e3, cwd: os.tmpdir() });
    const out = JSON.parse(stdout);
    value = out.is_error ? { ok: false, detail: String(out.result || "Claude Code menolak").slice(0, 160) } : { ok: true, detail: v.trim() };
  } catch (e) {
    const err = String(e);
    value = {
      ok: false,
      detail: /ENOENT/.test(err) ? "Claude Code belum terpasang"
        : e.killed || /ETIMEDOUT|timed out/i.test(err) ? "Claude tidak merespons (internet putus atau laptop tidur?)"
        : /log ?in|auth|credential/i.test(err) ? "Belum login: jalankan `claude` sekali"
        : `Claude gagal: ${err.slice(0, 120)}`,
    };
  }
  claudeCheck = { at: Date.now(), value };
  return value;
}
async function checkGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, detail: "GEMINI_API_KEY belum diisi" };
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", { headers: { "x-goog-api-key": key } });
    return r.ok ? { ok: true, detail: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image" } : { ok: false, detail: `Key ditolak (HTTP ${r.status})` };
  } catch {
    return { ok: false, detail: "Tidak bisa menghubungi Google" };
  }
}
async function checkFigma(needed) {
  // `claude mcp list` waits for every MCP server and can take many minutes, so it only runs when an active agent uses Figma
  if (!needed) return { ok: false, detail: "Belum dipakai (agent desain segera hadir)" };
  try {
    const { stdout } = await run("claude", ["mcp", "list"], { timeout: 60e3 });
    const line = stdout.split("\n").find((l) => /figma/i.test(l));
    if (!line) return { ok: false, detail: "Konektor Figma belum ada di Claude Code" };
    return /✓|connected/i.test(line) && !/fail|needs auth|✗/i.test(line) ? { ok: true, detail: line.trim().slice(0, 120) } : { ok: false, detail: line.trim().slice(0, 120) };
  } catch {
    return { ok: false, detail: "Tidak bisa membaca daftar MCP" };
  }
}

// ---------------------------------------------------------------- one team's turn
// Which agent handles which inbox items. Only agents whose .md says `status: aktif` run; the rest are "Segera hadir"
// and their items wait in the inbox.
const TEAMS = {
  // research is long (many searches per business), so riset gets one request per turn
  riset: { lead: "riset", doc: "board/sales", file: "sales.json", items: (m) => m.type === "sales_cmd", oneByOne: true, mcp: false },
};
const active = (md) => /^status:\s*aktif/m.test(String(md || "").split("\n---")[0]);
const ALLOWED = [
  "Read", "Edit", "Write", "Glob", "Grep", "Task", "WebSearch", "WebFetch",
  "Bash(node tools/gemini-image.mjs:*)", "Bash(node tools/studio.mjs:*)",
  // Figma, whichever way it is connected in Claude Code: the Figma plugin, or the claude.ai connector
  "mcp__plugin_figma_figma", "mcp__claude_ai_Figma",
];
const body = (md) => md.replace(/^---\n[\s\S]*?\n---\n?/, "");
const isLead = (md) => /^lead:\s*true/m.test(md.split("\n---")[0]);
const isActive = (md) => /^status:\s*aktif/m.test(md.split("\n---")[0]);

async function turn(name, team, cfg, items) {
  const dir = path.join(WS, name);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(path.join(dir, ".claude", "agents"), { recursive: true });
  mkdirSync(path.join(dir, "work"), { recursive: true });
  cpSync(path.join(HERE, "tools"), path.join(dir, "tools"), { recursive: true });
  const agents = cfg.agents || {};
  const lead = agents[team.lead]?.md;
  if (!lead) throw new Error(`Pengaturan ${team.lead} belum ada di Studio`);
  // the lead's rules + the team rules as CLAUDE.md; every other (non-lead) agent as a Claude Code subagent
  writeFileSync(path.join(dir, "CLAUDE.md"), `${agents["_aturan-tim"]?.md || ""}\n\n---\n\n${body(lead)}`);
  for (const [k, a] of Object.entries(agents)) if (!k.startsWith("_") && !isLead(a.md) && isActive(a.md)) writeFileSync(path.join(dir, ".claude", "agents", `${k}.md`), a.md);

  const [board, sales] = await Promise.all([getDoc("board/state"), getDoc("board/sales")]);
  writeFileSync(path.join(dir, "board.json"), JSON.stringify(board ?? { tasks: [], log: [] }, null, 1));
  writeFileSync(path.join(dir, "sales.json"), JSON.stringify(sales ?? { pipeline: [], approval: [], kirim_hari_ini: [] }, null, 1));
  writeFileSync(path.join(dir, "inbox.json"), JSON.stringify(items, null, 1));
  writeFileSync(path.join(dir, "replies.json"), "{}\n");
  const before = readFileSync(path.join(dir, team.file), "utf8");

  const prompt = `Giliran baru. Ada ${items.length} item di inbox.json dari pemilik (lewat Studio). Kerjakan sesuai peranmu di CLAUDE.md: terapkan setiap item ke ${team.file}, delegasikan ke subagent kalau perlu, lalu tulis ringkasan satu kalimat per item (kunci = id item) di replies.json. Simpan hasil ke ${team.file} sedikit demi sedikit (misalnya tiap 3–5 temuan), jangan menunggu akhir, karena giliran bisa terhenti. Hanya ubah file di folder ini.`;
  log(`${name}: menjalankan ${team.lead} untuk ${items.length} item`);
  // a turn that stops early (time limit, sleep, error) still hands back what it already saved
  let failure = null;
  const out = await new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p", prompt, "--output-format", "json", "--permission-mode", "acceptEdits", "--allowedTools", ALLOWED.join(","), "--max-turns", "150", ...(team.mcp === false ? NO_MCP : [])], {
      cwd: dir,
      env: { ...process.env, STUDIO_BASE: BASE },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let so = "", se = "";
    child.stdout.on("data", (d) => (so += d));
    child.stderr.on("data", (d) => (se += d));
    const kill = setTimeout(() => child.kill("SIGTERM"), 30 * 60e3);
    child.on("close", (code) => {
      clearTimeout(kill);
      try {
        resolve(JSON.parse(so));
      } catch {
        reject(new Error(`claude keluar (kode ${code}): ${(se || so).slice(-300)}`));
      }
    });
  }).catch((e) => ((failure = e), {}));
  if (out.is_error) failure = new Error(`Claude: ${String(out.result).slice(0, 300)}`);
  if (out.subtype && out.subtype !== "success") log(`${name}: berhenti lebih awal (${out.subtype}, ${out.num_turns ?? "?"} langkah)`);

  // the updated document goes back to the Studio (only if it is still a valid object of the right shape)
  const after = readFileSync(path.join(dir, team.file), "utf8");
  if (after !== before) {
    const data = JSON.parse(after);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error(`${team.file} rusak, tidak dikirim`);
    data.synced_at = new Date().toISOString();
    await putDoc(team.doc, data);
  }
  if (failure) throw failure;
  const replies = JSON.parse(readFileSync(path.join(dir, "replies.json"), "utf8") || "{}");
  let done = 0;
  for (const m of items) {
    const reply = replies[m.id];
    if (!reply) continue;
    await api(`inbox?id=${encodeURIComponent(m.id)}`, { method: "PATCH", body: JSON.stringify({ status: "done", reply: String(reply).slice(0, 500), done_at: new Date().toISOString() }) });
    done++;
  }
  // nothing answered: keep the agent's own last words, so the reason is visible in the log
  if (!done && out.result) log(`${name}: agent bilang: ${String(out.result).replace(/\s+/g, " ").slice(0, 300)}`);
  return `${name}: ${done}/${items.length} item selesai`;
}

// ---------------------------------------------------------------- "Sudah kuDM", without AI
const NEXT_STATUS = { sapaan: "terkirim", followup_1: "followup_1", followup_2: "followup_2", jawaban: "ngobrol" };
async function recordSent(items) {
  const sales = (await getDoc("board/sales")) || {};
  const pipe = sales.pipeline || [];
  const today = new Date().toISOString().slice(0, 10);
  sales.funnel = sales.funnel || {};
  sales.log = sales.log || [];
  let n = 0;
  for (const m of items) {
    for (const id of [].concat(m.prospek || [])) {
      const p = pipe.find((x) => x.id === id);
      if (!p) continue;
      p.status = NEXT_STATUS[m.jenis] || "terkirim";
      p.next_action = p.status === "terkirim" ? "Tunggu balasan, follow-up 3 hari lagi" : p.next_action;
      p.next_date = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
      if (m.jenis === "sapaan" || !m.jenis) sales.funnel.sapa = (sales.funnel.sapa || 0) + 1;
      sales.log.push({ id, tanggal: today, at: new Date().toISOString(), oleh: "fatah", kejadian: "terkirim", catatan: `${m.jenis || "sapaan"} dikirim manual`, kampanye: p.kampanye, kanal: p.kanal });
      n++;
    }
  }
  sales.synced_at = new Date().toISOString();
  await putDoc("board/sales", sales);
  for (const m of items) await api(`inbox?id=${encodeURIComponent(m.id)}`, { method: "PATCH", body: JSON.stringify({ status: "done", reply: "Dicatat sebagai terkirim.", done_at: new Date().toISOString() }) });
  return `${n} DM dicatat`;
}

// ---------------------------------------------------------------- the loop
async function tick() {
  const status = { at: new Date().toISOString(), host: os.hostname().replace(/\.local$/, ""), busy: false };
  const [cfg, prev] = await Promise.all([getDoc("agents/config"), getDoc("runner/status").catch(() => null)]);
  Object.assign(status, { enabled: !!cfg?.enabled, interval_min: cfg?.interval_min || 5, last_run: prev?.last_run });
  const usesFigma = Object.entries(cfg?.agents || {}).some(([, a]) => isActive(String(a?.md || "")) && /figma/i.test(String(a?.md || "").split("\n---")[0]));
  const [claude, gemini, figma] = await Promise.all([checkClaude(), checkGemini(), checkFigma(usesFigma)]);
  Object.assign(status, { claude, gemini, figma });
  await putDoc("runner/status", status);
  if (!cfg?.enabled) return status.interval_min;

  const fresh = (await api("inbox?limit=500")).items.filter((m) => m.status === "new").sort((a, b) => String(a.at).localeCompare(String(b.at)));
  if (!fresh.length) return status.interval_min;
  status.busy = true;
  await putDoc("runner/status", status);
  const notes = [];
  let ok = true, error = "";
  // "Sudah kuDM" (sales_sent) needs no AI: the runner records it on the prospect directly
  const sent = fresh.filter((m) => m.type === "sales_sent");
  if (sent.length) {
    try {
      notes.push(await recordSent(sent));
    } catch (e) {
      ok = false;
      error = String(e.message || e).slice(0, 300);
    }
  }
  for (const [name, team] of Object.entries(TEAMS)) {
    const items = fresh.filter(team.items);
    if (!items.length || !active(cfg.agents?.[team.lead]?.md)) continue;
    if (!claude.ok) {
      ok = false;
      error = `Claude belum siap: ${claude.detail}`;
      continue;
    }
    for (const batch of team.oneByOne ? items.map((m) => [m]) : [items]) {
      try {
        notes.push(await turn(name, team, cfg, batch));
      } catch (e) {
        ok = false;
        error = String(e.message || e).slice(0, 300);
        log("GAGAL", error);
      }
    }
  }
  status.busy = false;
  status.at = new Date().toISOString();
  status.last_run = { at: status.at, ok, items: fresh.length, summary: notes.join(" · "), ...(ok ? {} : { error }) };
  await putDoc("runner/status", status);
  log(notes.join(" · ") || error);
  return status.interval_min;
}

mkdirSync(WS, { recursive: true });
if (existsSync(LOCK)) {
  const pid = Number(readFileSync(LOCK, "utf8"));
  try {
    process.kill(pid, 0);
    console.error(`Runner sudah jalan (pid ${pid}). Hentikan dulu yang itu.`);
    process.exit(1);
  } catch {}
}
writeFileSync(LOCK, String(process.pid));
const cleanup = () => {
  try {
    rmSync(LOCK);
  } catch {}
  process.exit(0);
};
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

log(`Runner agent webdev.co.id → ${BASE} (hash token ${createHash("sha256").update(TOKEN).digest("hex").slice(0, 8)})`);
for (;;) {
  let wait = 5;
  try {
    wait = await tick();
  } catch (e) {
    log("Tidak bisa menghubungi Studio:", e.message || e);
  }
  if (ONCE) cleanup();
  await new Promise((r) => setTimeout(r, wait * 60e3));
}
