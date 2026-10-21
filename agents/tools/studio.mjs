#!/usr/bin/env node
// node tools/studio.mjs upload work/P05/slide-1.png
// Uploads a slide preview to the Studio and prints its path (/_blob/<hash>) for task.previews.
// Reads STUDIO_BASE and ADMIN_API_TOKEN from the environment (set by the runner); never prints the token.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const [cmd, file] = process.argv.slice(2);
if (cmd !== "upload" || !file) {
  console.error("Pakai: node tools/studio.mjs upload work/<id>/slide-<n>.png");
  process.exit(2);
}
if (!/^work\//.test(file) || file.includes("..")) {
  console.error("File harus di dalam folder work/");
  process.exit(2);
}
const type = file.endsWith(".png") ? "image/png" : /\.jpe?g$/.test(file) ? "image/jpeg" : file.endsWith(".webp") ? "image/webp" : "";
if (!type) {
  console.error("Hanya PNG, JPEG, atau WebP.");
  process.exit(2);
}
const bytes = readFileSync(file);
const name = createHash("sha256").update(bytes).digest("hex").slice(0, 32);
const r = await fetch(`${(process.env.STUDIO_BASE || "http://localhost:3000").replace(/\/$/, "")}/admin/api/blob/${name}`, {
  method: "PUT",
  headers: { Authorization: `Bearer ${process.env.ADMIN_API_TOKEN}`, "Content-Type": type },
  body: bytes,
});
const body = await r.json().catch(() => ({}));
if (!r.ok) {
  console.error(`Gagal mengunggah (HTTP ${r.status}): ${body.message || ""}`);
  process.exit(1);
}
console.log(body.path);
