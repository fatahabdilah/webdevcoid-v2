import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { requireRole, send } from "@/lib/admin/auth";

/**
 * GET /admin/api/agents/defaults: the starting .md settings for each agent (agents/defaults/*.md in the repo), which
 * the Studio's Settings page installs into agents/config the first time. "_aturan-tim.md" holds the rules all
 * agents share.
 */
const DIR = path.join(process.cwd(), "agents", "defaults");

export async function GET(request: NextRequest) {
  const auth = await requireRole(request);
  if (auth.error) return auth.error;
  const files = (await readdir(DIR).catch(() => [] as string[])).filter((f) => f.endsWith(".md")).sort();
  const agents = await Promise.all(files.map(async (f) => ({ key: f.replace(/\.md$/, ""), md: await readFile(path.join(DIR, f), "utf8") })));
  return send({ agents });
}
