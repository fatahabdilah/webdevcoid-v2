#!/usr/bin/env node
// node tools/gemini-image.mjs --prompt "..." --out work/P05/img-1.png [--aspect 4:5]
// Darno's image generator: Gemini (Google AI Studio API) → a PNG. Reads GEMINI_API_KEY (and optional
// GEMINI_IMAGE_MODEL) from the environment; the key is never printed or written.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const prompt = arg("prompt");
const out = arg("out");
const aspect = arg("aspect", "4:5");
if (!prompt || !out) {
  console.error('Pakai: node tools/gemini-image.mjs --prompt "..." --out work/<id>/img.png [--aspect 4:5]');
  process.exit(2);
}
if (!/^work\//.test(out) || out.includes("..")) {
  console.error("--out harus di dalam folder work/");
  process.exit(2);
}
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error("GEMINI_API_KEY belum diisi di komputer tim.");
  process.exit(1);
}
const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const brand = "Palette strictly black, navy #011F6C, blue #0346D6, light blue #236EF3 and white. Dark, cinematic, one focal point, lots of negative space, soft blue light. No text, no letters, no logos, no watermarks.";
const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
  method: "POST",
  headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: `${prompt}\n\n${brand}` }] }],
    generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspect } },
  }),
});
const body = await r.json().catch(() => ({}));
if (!r.ok) {
  console.error(`Gemini menolak (HTTP ${r.status}): ${body.error?.message || ""}`.slice(0, 300));
  process.exit(1);
}
const part = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
if (!part) {
  console.error("Gemini tidak mengirim gambar (mungkin diblokir filter). Ubah prompt-nya.");
  process.exit(1);
}
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(part.inlineData.data, "base64"));
console.log(out);
