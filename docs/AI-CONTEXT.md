# AI context: webdev.co.id

Handoff notes for an AI assistant picking up this project. They sum up the decisions and preferences from the build sessions so far, so you don't re-ask settled questions or undo choices the owner made on purpose. Read this together with `README.md`, which covers structure and setup.

Last updated: 2026-10-14.

---

## 1. The project

- **What:** the marketing site for **webdev.co.id**, a website studio in Indonesia that builds company profiles, landing pages, online stores and custom web apps. It has a single page plus a 404 page.
- **Stack:** Next.js 16.4 (App Router, Turbopack, `cacheComponents`), React 19.3, Tailwind CSS v4, `motion` (Motion for React), `lenis` (smooth scroll) TypeScript.
- **Repo:** `git@github.com:fatahabdilah/webdevcoid-v2.git`, branch `main`. **The repo is public.**
- **Language:** all site copy is Indonesian. The owner writes to you in casual Indonesian, often with typos. Reply in Indonesian.

> Next.js 16 differs from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next-specific code (see `AGENTS.md`).

---

## 2. Working with the owner

- **Act directly.** Short instructions like "hapus ini", "kecilin", "tambah jarak bawah" mean: do it, check it visually, then report. Ask only when a choice is really theirs to make.
- **"back"** means revert the last change.
- **Never commit or push unless asked.** The owner says **"tolong push"**. When they do:
  - Commit everything relevant with `git -c user.name="fatahabdilah" commit …`.
  - End the commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (or whatever attribution your tool requires).
  - Push `main`.
- **Never commit secrets.** The owner's personal email is for identity only. The site's public business email (below) is fine.
- **Keep local-only files out of git** (all already gitignored):
  - `.agents/`, `.claude/`, `skills-lock.json`
  - root-level `*.mov`, `*.mp4`, `*.html` (design references)
  - `social/`
- **Root stays clean.** Only config files belong at the root. Put new working files somewhere sensible (e.g. `social/`). Don't use `public/`, since everything in it ships with the site and lands in the public repo.
- **Check changes visually** with headless Chrome screenshots (desktop 1440, tablet ~1024, phone 390), and check mobile for every UI change. Run `npx tsc --noEmit -p .`, `npx eslint src`, and `npx next build` before saying something works.
- **Dev server port varies.** Other local projects often hold ports 3000/3001, and webdev has run on 3002. Find the right one with `lsof -nP -iTCP -sTCP:LISTEN` plus each page's `<title>`.
- **Stale CSS:** the dev server sometimes serves old CSS. A trivial comment edit in `globals.css` forces a rebuild. Some file-convention changes (e.g. a new `icon.svg`) need a dev server restart. New rules added to `globals.css` were sometimes not served at all, even after a touch. **Cause found (2026-10-21): an apostrophe (`'`) in a top-level `/* … */` comment in `globals.css` drops the rule right after it from the served CSS**; keep apostrophes out of those comments (write "the story length", not "the story's length"). If a rule still goes missing, give the section its own co-located CSS file (e.g. `src/components/preloader/preloader.css`) and verify on a production build (`next build && next start -p 3005`).

---

## 3. Brand and design rules (decided, don't revisit without being asked)

### Colours

The palette, from 2026-10-11 on:

| Token | Hex |
|---|---|
| black | `#000000` |
| navy | `#011F6C` |
| blue | `#0346D6` |
| light blue | `#236EF3` |
| white | `#FFFFFF` |

- In CSS these are the `--color-holo-*` tokens in `globals.css`. Canvas and WebGL code uses `src/lib/brand.ts`.
- The brand gradient runs navy → blue → light blue.

### Type and style

- **Font:** Geist everywhere.
- **Style:** the webdev style — light cards, brand blues, Geist. When borrowing ideas from other sites (Hostinger, contentrewards.com), adapt them to this style rather than copying theirs.

### Copy rules

- Never use the word **"UMKM"**.
- Plan names are **Company Profile**, **Landing Page** and **Custom**. Write **"SEO"**.

### Icons

- **Every icon is Remix Icon** (`@remixicon/react`, remixicon.com), on the owner's request; the only exception is the webdev logo itself (`LogoMark`/`LogoWordmark` in `icons.tsx`, and the emblem). Remix's license allows use in a website's UI for free; it forbids selling the icons as a pack or using one as a logo, and brand glyphs (WhatsApp, Instagram) may only stand for their own brand.
- Shared ones live in `src/components/icons.tsx` (WhatsApp, Instagram, Mail, Check, Badge, Play, the Process glyphs) and `LineIcon.tsx` (plus and arrows, thickened with a 1-unit stroke to sit with the pills). Section-specific sets sit next to their section (values, plan tiles, the included-in-every-price icons, the Layanan visuals in `ServiceVisuals.tsx`).
- Style: **Fill** for glyphs inside a shape (tiles, discs, badges, the Process glass illustrations, the WhatsApp glyph in the CTA avatar bubble); **Line** for icons beside text (the Process stage details, the footer contacts, including WhatsApp there via `WhatsAppLine`) and small UI marks (arrows, checks, search bars). Icons with the same role in one row or list share one style. The Layanan visuals mix both, like the app UIs they draw. Pick new icons from Remix, never draw or pull from another set.

### Buttons and calls to action

- **No WhatsApp icon on the "Konsultasi Gratis" buttons** (the owner removed it, 2026-10-21). They and "Kunjungi Situs" are `ArrowButton` (`src/components/ArrowButton.tsx`, after the Framer "Button Hover Effect" the owner picked): on hover the pill tightens and a circle springs out of its right end, with the **WhatsApp glyph (fill) for the consultation buttons** and **↗ for Kunjungi Situs** (the owner's call, 2026-10-21: the pill stays clean, the circle says where it goes). Dark tone = the liquid metal pill + a liquid metal circle (Layanan, Harga); light = the navbar's pale pill; outline = the portfolio cards. The circle's slot keeps a fixed height and the dark button keeps its footprint (negative right margin), so nothing around it moves or bobs.
- **Two button sizes, everywhere:** large **53px tall, 26px sides** (Lihat Harga, Konsultasi Gratis in Layanan and Harga, the plan buttons) and small **48px tall, 20px sides, border included** (the navbar's Konsultasi, Kunjungi Situs); both Geist 16px semibold (phones: the navbar's label is tighter, and below 390px only its WhatsApp circle shows).
- "Kunjungi situs"-type contact uses WhatsApp, not phone.
- The **hero has a single button:** "Lihat Harga →".

- **Loader performance (2026-10-21):** the loader animates only transform, opacity and filter (compositor), never clip-path, so it stays smooth while React hydrates underneath. Each liquid metal button is its own WebGL context (100+ ms to set up), so `LiquidMetal` starts only after the intro is done, once the button is within 400px of the screen, when the browser is idle; until then its CSS plate shows. Measured at 4× CPU throttle: frames in the first 2 s went from 16 to 77 on desktop.

### Layout

- **One spacing system (checked 2026-10-21):** sections pad 100px top and bottom on desktop, 64px on phones (Harga 140/180 for its aurora), 80px / 20px at the sides; the section header sits 80 / 64 / 48px above its content; cards in a grid are 8px apart.
- **Two content widths:** 1280px for wide sections (Hero, About, Layanan, Cara kerja, Portfolio) and 1040px for reading ones (Kenapa kami, Harga, FAQ, and the text grid under the Cara kerja card).
- **Three corner radii:** large section cards 24px (`rounded-3xl`: Kenapa kami, the Layanan card and both cards under it, the Cara kerja card, Portfolio, Harga, About); cards inside them 16px (`rounded-2xl`: the plan cards, the Kenapa kami tiles, FAQ items, the portfolio image), concentric with their inset; chips, badges and small marks 12px. Drawn illustrations keep their own radii.
- **Text:** section titles 72px / 40px; feature-card titles (the Layanan slide, Portfolio) 24px on phones and 32px from 640px; card titles 24px; body 18px or 16px.

- **Single page only:** no new routes.
- **About section image:** keeps the ▶ play icon, because a video will replace the photo later.
- **Footer:**
  - The closing line "Siap bawa bisnismu online?" sits over plain icon + text contacts, with no boxes and no WhatsApp background.
  - The contacts are Instagram @webdev.co.id, email halo@webdev.co.id (since 2026-10-24; before that webdevcoid.official@gmail.com), and WhatsApp 0822 5809 6886.
  - There is more space above the closing line than under the contacts (deliberate).
  - The sign-off line reads © · logo · tagline "Studio web lokal, standar global."

### Cursor

- A custom spring arrow cursor that morphs into a circle over links/buttons and hands over to the system I-beam over text fields.
- There is no ↗ badge on external links (removed on purpose).
- The cursor appears only after the intro finishes, and fades when the mouse leaves the window.

### Favicon

- Round: `src/app/icon.svg` (the gradient circle with the white mark), plus a round `favicon.ico` (16/32/48).
- `apple-icon.png` stays a full-bleed square, because iOS rounds it itself and would fill transparent corners with black.

---

## 4. Sections and notable pieces

All copy lives in `src/content/` (`home.ts`, `portfolio.ts`, `site.ts`). Section order is Hero, About, Values, Services, Process, Portfolio, Pricing, FAQ, then the footer/contact.

### Loader (`src/components/preloader/`)

- **Since 2026-10-16** a simple, fast loader (the owner asked for "lebih simple dan/atau cepat"), about **1.4 s**: on black, the webdev mark builds itself (its three bars grow up one after another, then the bracket closes in from the left); at 0.8 s the camera **zooms through it** (0.6 s): the mark rushes towards us (to 22×) as the black fades, and the hero zooms out from 1.12 to 1 behind it. The owner wants a zoom here, **not** a slide ("ngezoom jangan naik").
- **Tried and replaced:** a plain fade (the mark focusing in over a filling line, then the veil fading out), archived in `social/archive/loader-v2-simple-fade/`; then the same build-up with the black lifting like a curtain (rejected: zoom, don't slide up).
- **How it runs:** all CSS (`preloader.css`), so it plays from the first paint even before hydration. `Preloader.tsx` only follows the veil's CSS animation (`getAnimations()`) to call `markIntroEntered()` when it starts to lift and `markIntroDone()` when it's gone. Skipped with reduced motion.
- **Intro state** (`src/lib/intro.ts`): `introPhase()`, `useIntroEntered()`, `useIntroDone()` are unchanged; the navbar, cursor, smooth scroll, entrance animations and the animated backgrounds still wait on them. `[data-intro-zoom]` on the hero is what settles.
- **The old intro** (logo write-on over a dither field, a scripted cursor click, a zoom out through the logo) is archived in `social/archive/intro-v1/` with a README on how to restore it (`git checkout 760477c -- src/components/preloader src/lib/intro.ts`). `tsconfig.json` excludes `social/` so the archive isn't type-checked.

### Payments (DOKU Checkout, `/testing`, added 2026-10-24)

- **`/testing`** (outside the site layout, noindex, disallowed in robots): one fixed product, "Pembayaran uji webdev.co.id", **Rp10.000** (`src/lib/payments/products.ts`; the price is never taken from the browser). Name, email, optional WhatsApp → `POST /api/payments/doku` creates the order and a DOKU checkout page, and the browser goes there. DOKU sends the customer back to **`/testing/selesai?invoice=…`**, which polls `GET /api/payments/doku/status` (store first; while pending it also asks DOKU's Check Status API, at most every 15 s per invoice).
- **Notifications:** `POST /api/payments/doku/notify`, accepted only with a valid DOKU Signature (Request-Target = that path). A paid order never goes back (late or repeated notices are safe). On a public https host the checkout request overrides the notification URL to this route; on localhost DOKU can't reach us, so the status check keeps the order up to date.
- **Data:** the admin store document **`payments/orders`** (`src/lib/payments/orders.ts`: invoice `WD` + yymmdd + 8 hex, status pending / paid / failed / expired, DOKU status, channel, customer, a small event log; newest first, 500 kept; writes queued per server instance). Shown in the Studio under **Pembayaran** (`src/components/studio/payments.tsx`: totals, filters, each order with its status and channel).
- **Env:** `DOKU_CLIENT_ID`, `DOKU_SECRET_KEY` (DOKU Back Office → Integration → API Keys), `DOKU_ENV` = `sandbox` (default) or `production`. `DOKU_API_BASE` only points the calls at a mock, for tests. Without the keys the pay button answers "Pembayaran belum diatur di server".
- **Tested 2026-10-24 against a local DOKU mock that checks signatures** (POST with Digest, GET without): bad email 400, foreign origin 403, a browser-sent price ignored, forged notification 401, valid one → paid, repeated → fine, late FAILED after SUCCESS → stays paid, bad invoice 400. Not yet against the real DOKU sandbox (no keys yet). The library is in `src/lib/payments/doku.ts`.

### Admin (`/admin`, login required)

**Accounts (2026-10-24):** from env (`ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`, optional team pair) **and** from the Supabase table **`admin_users`** (email, password_hash `scrypt:<salt>:<hash>`, role owner/team, name), re-read at most every 30 s; an email in both accepts either password. This lets an account be added on the live site without touching Vercel's env (only `ADMIN_SESSION_SECRET`, 32+ chars, must be set there). Seeded: the owner's own email (as in ADMIN_EMAIL), owner, name Fatah. To add or reset one, upsert a row with a hash made like `scripts/admin-setup.mjs` does (scrypt, 16-byte salt, 64-byte key); never store a password. **Supabase setup notes:** project `zpmgtohdpaiuelcfhddi` (pooler `aws-0-ap-northeast-1`); `supabase/admin.sql` now also grants the tables to `service_role`, because newer Supabase projects don't grant API roles by default ("permission denied" otherwise). The local admin data was migrated into Supabase on 2026-10-24 (`data/admin/` kept as a backup). With Supabase set, the local dev server reads and writes the same data as the live site.

**The Studio is rebuilt (2026-10-20) in Next/React** (`src/components/studio/`, page `src/app/admin/page.tsx`), in the original Content Studio's look (dark panel, hairline modules with corner ticks, dot grid; Geist + Geist Mono), with the UX redone so anyone understands it. The original artifact page stays at **`/admin/classic`** (`src/app/admin/classic/route.ts` + `classic/studio.html`).
- **Four places** (side nav on desktop, bottom tabs on phones; the view is the URL hash): **Tugasku** (one list of everything waiting on a person, most urgent first: send a message, approve a post, approve a message, publish an approved post, prepare a material; filter chips per kind; "what the team is doing" and "next publish dates" beside it), **Konten** (all posts and jobs in four plain steps: *Sedang dibuat tim / Perlu persetujuanmu / Siap tayang / Sudah tayang*, each with a "?" explanation; documents say *Selesai* instead of *Siap tayang*), **Prospek** (funnel numbers and prospects in plain statuses: *Disiapkan tim / Menunggu balasan / Tertarik / Perlu kamu / Jadi klien / Selesai*), **Riwayat** (team logs in everyday words, file-path lines hidden, plus the decisions sent).
- **Details open in a side sheet** (full screen on phones): a post shows its schedule, what's happening now and who, open notes, slide previews, a Figma link, and the team's documents as tabs (*Isi post, Catatan cek kualitas, Catatan desain, Riset, Brief*); a message shows "they wrote", the text and a 3-step send flow (*Salin pesan → Buka Instagram / salin email → Sudah kukirim*); a prospect lets you paste their reply for the sales team. **Minta ke tim** sends a free request to the content team (Michael, `command`) or sales (Bagas, `sales_cmd`), with example chips.
- **Every decision has a 5-second "Batalkan"** before it is POSTed; until the team processes it, the item shows *Terkirim ke tim*. Revisions offer quick-reason chips. Read-only (team) accounts see everything with the actions disabled and a one-line note. A first-visit guide (3 steps) shows until closed (localStorage). A warning appears when the team hasn't synced for 36 h.
- **Data and inbox unchanged:** the same `board/state`, `board/sales` and inbox item shapes as the old page (`approve {task, note, force, from_stage}`, `revise`, `publish`, `check {item, done, note}`, `command`, `sales_approve {prospek, decision, note}`, `sales_sent {prospek, jenis}`, `sales_reply`, `sales_cmd`), so the agents need no change. Logic is pure in `model.ts`; polling and the undo queue in `useStudio.ts`.
- **Names:** accounts carry a display name (`ADMIN_NAME` / `ADMIN_TEAM_NAME`, asked by `npm run admin:setup`; default from the email). It greets the person and decides which checklist items are "Untukmu" (checklist owners are names like `fatah`, `mic`).
- The site's loader, smooth scroll and custom cursor moved from the root layout to `(site)/layout.tsx`, so /admin has none of them. `src/proxy.ts` sends a request without a session cookie straight to the login page (the real check stays on the server).

The owner's **Content Studio** (their claude.ai artifact: Design and Sales boards, approvals, schedule, activity), served behind a login, after the pattern of the owner's other dashboard ("Creative Terminal", its HANDOFF-API.md): the artifact's HTML untouched, `window.claude` answered by a shim over the site's own API. Nothing in the public site changes; robots.txt disallows `/admin` and every admin response is `no-store`, `noindex`, `X-Frame-Options: DENY`.
- **Files:** `src/app/admin/classic/studio.html` (the artifact exactly as exported; edit it there), `src/app/admin/classic/route.ts` (serves it at `/admin/classic` to a signed-in account and injects the shim), `src/app/admin/page.tsx` + `layout.tsx` and `src/components/studio/` (the rebuilt Studio), `src/app/admin/api/{agents/defaults,blob/[name]}/route.ts`, `src/app/%5Fblob/[name]/route.ts` (public `/_blob/…` images), `src/proxy.ts` (cookie check), `src/app/admin/login/route.ts` (plain HTML login page, outside the site layout so no intro/cursor/smooth scroll), `src/app/admin/logout/route.ts`, `src/app/admin/api/{doc,inbox}/route.ts`, `src/lib/admin/{auth,store,blobs}.ts`, `supabase/admin.sql`, `scripts/admin-setup.mjs`.
- **The shim:** the Studio only calls `db.doc("board/state"|"board/sales").onSnapshot`, `db.collection("inbox").add` / `.orderBy().limit().onSnapshot`, and `user.id()` / `user.can()`. The shim answers these from `/admin/api` and polls every 5 s (and on tab focus). A 403 is passed to the Studio as `invalid_argument`, which it shows as "this account can only view".
- **Accounts and roles:** `owner` (everything) = `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`; optional read-only `team` = `ADMIN_TEAM_EMAIL` + `ADMIN_TEAM_PASSWORD_HASH`; `ADMIN_SESSION_SECRET` signs the cookie; `ADMIN_API_TOKEN` (bearer, owner rights) lets an agent sync without a browser. Hashes are `scrypt:<salt>:<hash>` (colons: Next expands `$` in .env files). `npm run admin:setup` (owner + Supabase) and `npm run admin:setup -- team` write `.env.local` (git-ignored). Session: HMAC-signed, HttpOnly, SameSite=Lax cookie on `/admin`, 7 days; removing an account from env signs it out. Logins throttled 5 failures / IP / 15 min (in memory). Errors are `{code, message}` (codes as in the handoff: `not_granted`, `bad_request`, `quota_exceeded`, `unavailable`).
- **Data: Supabase** when `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (an `sb_secret_…` key, or a legacy `service_role` JWT) are set: tables `admin_docs` and `admin_inbox` from `supabase/admin.sql` (run once in the SQL Editor), RLS on with no policies so only the server's secret key reaches them, called over Supabase's REST API with plain fetch (no SDK). Without those env vars it falls back to JSON files in `data/admin/` (local only; they would not survive serverless hosting). Tested against a mock of the REST API; not yet against a live project.
- **Filling the board:** the agent PUTs the whole document: `curl -X PUT -H "Authorization: Bearer $ADMIN_API_TOKEN" -H "Content-Type: application/json" --data @state.json "https://webdev.co.id/admin/api/doc?path=board/state"` (same for `board/sales`). Until then the Studio shows its own "Board belum dikirim". Inbox: `GET /admin/api/inbox`, mark handled with `PATCH /admin/api/inbox?id=…` (`{"status":"done"}`). The old board lives in the claude.ai artifact's own database, on another claude.ai account than the one connected on 2026-10-18; migrating it needs that artifact's link.
- **Migrated 2026-10-20** from the owner's friend's handoff (`migrasi-admin.zip`, artifact RbFWKqrsLMSsrSG8CmpYJU): `studio.html` replaced with the artifact's latest page (same `window.claude` interface; the route now replaces any `<title>`), `board/state` (24 tasks, 111 log) and `board/sales` (0 prospects) PUT into the local store (`data/admin/`); the 3 inbox items were all `done`, so not moved. Re-run the same two PUTs against production once it is deployed (or the friend's `import-to-admin.sh`, which is safe to repeat).
- **Images** (slide previews): tasks reference `/_blob/<name>` (the artifact's asset paths, kept so the data moves unchanged). `PUT /admin/api/blob/<name>` (owner/token; png, jpeg, webp, gif; 8 MB) stores one; `GET /_blob/<name>` serves it to a signed-in account only (404 otherwise). Stored in the private Supabase Storage bucket `admin-blobs` (created by `supabase/admin.sql`) or `data/admin/blobs/`. The route folder is `src/app/%5Fblob` because Next treats `_` folders as private. S01's 11 previews still need uploading from the friend's laptop (`content/S01/export/`, under the same hash names).
- The session cookie is on path `/` (so `/_blob` images get it); logout also clears the old `/admin`-path cookie.
- The friend's agents (Michael for `board/state`, Bagas for `board/sales`) run in Claude Code on the friend's MacBook and sync with their `tools/admin-api.sh`, reading `BASE` and `ADMIN_API_TOKEN` from env. They need the production URL live and the token handed over out of band.
- The repo is public, so `studio.html` (team names, workflow) is visible on GitHub once pushed; the board data and credentials are not.

### Agents (`agents/`, run on the team's computer)

Principle (the owner's plan): **agents prepare, people decide and send.** Never automate DMs/WhatsApp; prices, final designs and publishing are human calls; every agent reads the same rules (`agents/defaults/_aturan-tim.md`).
- **Eight agents along the pipeline** (`agents/defaults/*.md`, Claude Code subagent format with `name, role, description, status, lead, tools`): **riset** (Riset prospek, `status: aktif`), and *Segera hadir* (`status: segera`, shown with a lock in Settings, not run): pesan, mockup, penawaran, developer, qa, konten, admin. The earlier Michael/Adrian/Supri/Darno/Bagas/Joko/Laras set was replaced (2026-10-20); the content-team inbox items (approve, revise, publish, check, command) are not processed by this runner, they wait (the friend's agents may handle them).
- **The agents run on a computer with Claude Code logged in on the owner's subscription** (this laptop for now; Vercel can't, a subscription only works through a logged-in Claude Code). `npm run agents` (= `agents/runner.mjs`, `--once` for one tick).
- **Settings in the Studio (Pengaturan):** each agent's .md in `agents/config` (last 10 versions), the switch (*Agent bekerja / dijeda*), the interval, and what the runner reports in `runner/status` (Claude / Gemini / Figma). Gemini and Figma are marked *Segera hadir* (for Mockup/Konten). A Gemini app subscription can't be used by programs; the only programmatic route is a Google AI Studio API key (image generation is billed); `agents/tools/gemini-image.mjs` is kept for that.
- **Prospect research** (the active agent): Studio → Prospek → **Cari prospek** (kategori, kota, jumlah, catatan) sends `sales_cmd` with a `riset` object; the runner gives every `sales_cmd` to the riset agent (`claude -p` with WebSearch/WebFetch, from public pages only, never logging into Instagram), which adds prospects to `board/sales` `pipeline[]` with the extra fields `skor, website, website_status (tidak_ada|rusak|kuno|lambat), alasan, bukti, ditemukan, ig_url`, plus a log line and its reply. Tested: 12 interior businesses in Tangerang Selatan in ~6 min, each with an Instagram link, score, reason and source.
- **"Sudah kuDM"** on a prospect sends `sales_sent`; the runner records it **without AI** (status → terkirim, follow-up date +3 days, funnel.sapa +1, log) and marks the item done. Tugasku shows "N usaha siap kamu DM" while prospects wait.
- Runner details: workspace `agents/.workspace/<team>/` (git-ignored) with `CLAUDE.md` = team rules + the lead's .md, other active agents as `.claude/agents/*.md`, `board.json`, `sales.json`, `inbox.json`, `replies.json`, `tools/`; `claude -p` with acceptEdits, a fixed tool allow-list, 150 turns, 30-minute cap, research requests one per turn (several at once ran out of turns before saving anything); the changed document is PUT back, items PATCHed done with the reply. One runner at a time (lock file). Env: `ADMIN_API_TOKEN`, `STUDIO_BASE` (default `http://localhost:3000`), `GEMINI_API_KEY`.
- Only one computer should run agents. While this runner is on, the friend's laptop must not also process the same inbox.

### Kenapa kami (`Values.tsx`)

**Three value cards**, set like the Layanan cards (2026-10-24, the owner called this the one weak section): the shared `bentoCard` surface with a soft blue glow top right, a large animated visual on top whose edges fade into the card (BriefVisual: picking the website type, pages and colours with a cursor; WorkVisual: a marquee of page designs fading at both sides; GrowthVisual: performance, visitors and chats panels; all in `ValueVisuals.tsx` + `values-visuals.css`), then a t-title-m title and a t-body-m grey line, centred, close under the visual, no number (the owner, 2026-10-24; cardTitle / cardWords from surfaces.ts). Header: centred, "Kenapa webdev.co.id?" and "Website yang bukan cuma bagus dilihat, tapi cepat dan mendukung tujuan bisnismu."
- The list + diagram version (loading line 1 → 2 → 3, the webdev emblem with the chrome mark from Figma 1390:2858, value nodes and keywords) is archived locally in `social/archive/kenapa-kami-system/` with a README on bringing it back; `short` and `keywords` stay on each value in `home.ts` for it. The chrome mark render also lives at `social/story/bg/mark-chrome.png`.

### Services (`Services.tsx` → `ServiceBento.tsx` + `ScreenCompare.tsx`)

**Bento after the Figma "Bento Grid Template" the owner picked (2026-10-24; slide 25), on their grid "1 1 2 / 3 4 4 / 5 6 6":** 1 Custom (wide), 2 Landing Page, 3 Company Profile, 4 Redesign, maintenance & migrasi (wide, one card for sites that already exist), then 5 the blue consultation card and 6 "Sudah termasuk di setiap harga" (wide), both in `Services.tsx`. Data: `services` in `home.ts` (`key, title, text, wide`).
- **Style (2026-10-24, after the owner pointed at contentrewards.com "The best by design."):** light cards (`bentoCard`), 400px tall on desktop like the row under them. **One reading pattern on every card:** a big title (30–34px, semibold) and a larger grey line (18–20px) at the top left, no label; small product UI floats in the rest. Custom = the owner Figma (Brand Hub 1472:9036 layout, 1472:10024 card insides: glyph in a round, 22px name + 11px line, white panels skewed ±10° and tilted ±5° like cards on a table, no fade, cut by the card foot; a big skewed "?" on the black one): words centred on the left (207px wide), four 217×310 playing cards at the Figma spots on the 851×400 card, leaning -6/-2/0/5° and rising to the right, running past the foot, white hairline, inset sheen, long soft shadow (not on the back grey one), two blurred blue glows in the top right corner, Figma colours (grey, brand-blue Dashboard (was teal, the owner changed it), black, orange on the right; an exception to the palette the owner asked for); Toko online / Dashboard / Sistem each with glyph + uppercase name and a fading white panel (products, omzet bars, stock), the black middle card "Ide kamu?" (Custom kamu? was hidden under the orange card) with a "?" glyph and a big faint "?" in the middle (no dot patterns, the owner said); each card rises on its own on hover. The words on every Layanan card (bento and the row under it) follow the other sections, not the Figma 42px (the owner, 2026-10-24: "section ini yang menyesuaikan"): t-title-m title, 8px, t-body-m grey line, border grey-07, padding 32px / 40px on desktop; cardTitle / cardWords in surfaces.ts; Landing Page = the owner Figma "Article" 1462:6014: a white-to-blue card with our real client page arifsyauqi.com (public/images/portfolio/arifsyauqi-page.jpg, a full-page capture at 792px) shown 264px wide, scrolling down forever (two stacked copies, 70s, pauses on hover), a white fade and blue glows at the foot, and the words at the bottom left; Company Profile = the owner Figma "Article" 1462:6052: hands holding a tablet with a company site (public/images/services/company-tablet.png, from the Figma) on the plain light card (owner dropped the blue), fading into the card over the words, at the bottom left (the owner, 2026-10-24); Redesign, maintenance & migrasi (title changed from "Sudah punya website?", which now opens the line) = the owner Figma "Article" 1480:2044: words centred on the left, a monitor on a desk (public/images/services/existing-monitor.png) whose screen is covered by a flat 330×206 layer: this Layanan section itself (public/images/services/existing-after.jpg, a 1440px capture of its top, under a dark browser bar) as the "after", and a grey wireframe of the same layout as the "before" laid onto the four screen corners with one matrix3d; the visitor drags the divider by hand (the owner did not want it automatic), the pointer mapped back onto the flat screen with the inverse matrix (ScreenCompare.tsx, client). All in `ServiceBento.tsx` + `service-bento.css` (CSS only, transform/opacity, still with reduced motion). Shadows are soft navy, not black.
- Devices are CSS frames (`Phone`, `Laptop`, `Browser` in `ServiceVisuals.tsx`); their screens are small HTML pages in Geist and brand blues with stock photos from `public/images/stock/`.
- Earlier versions (tabs, slides, SVG storyboards `ServiceArt.tsx`, floating light UI, dark glass tiles) are gone; see git history.
- **No prices in Layanan** (the owner's call, 2026-10-18; prices live in Harga), as in the old bento.

### Harga (`Pricing.tsx`)

- Hovering (or, stacked, scrolling to) the premium "Custom" plan opens the **aurora** ambient behind the section (`.aurora` in `globals.css`: a blue gradient with drifting light curtains and shade folds, dots and grain). It uses **brand blues only, no navy or black** (the owner asked twice, 2026-10-18): light blue → blue behind the title → light blue → white, and the shade folds are a faint blue (35%). The ambient reaches **80px above and 200px below the section** (`inset: -80px 0 -200px`, eased fades of 240px top / 300px bottom; reaching 200–320px up read as "ketinggian") and the section pads `pt-24 pb-28 md:pt-28 md:pb-36 lg:pt-[140px] lg:pb-[180px]`, so a white gap follows the Portfolio dots, the blue is full just above the "Harga" pill, to well below the consultation card, fading out before the FAQ heading (the owner asked twice for more reach); it runs behind the Portfolio and FAQ padding, which sit above it (`relative z-[1]`), and the section clips only horizontally (`overflow-x-clip`). The reveal origin is measured against the ambient's own box. While it is on, the whole header turns dark-tone together, the "006 harga" pill included (white text on a translucent pill), and back when it closes. The Custom card itself keeps its dark gradient.

### Cara kerja (`Process.tsx`)

- **Since 2026-10-16** it follows the owner's Figma frame (Brand Hub, node 1175:3827, a "verification layer" section), adapted to webdev, on a **white** background (it used to be a dark scroll-lit timeline).
- **The card:** four stages as a flow, each a small frosted-glass illustration joined by dashed lines, numbered I–IV with a white label: Konsultasi (WhatsApp, struktur, jenis website ticked off), Desain custom (rings round a pen chip), Preview & revisi (three tilted notes), Website tayang ("Online · namabisnismu.com"). On desktop the card is white at the top and melts into the brand blues behind the labels (a wide blurred gradient, as in the design); on tablets it's a 2 × 2 grid and on phones a column, both on a fully blue card so the white labels stay readable (label contrast measured about 5.3:1 on desktop).
- **Keep it like the Figma.** An animated version with new graphics (a chat, a browser filling in, a phone preview, an address bar typing) was tried and rejected by the owner ("back, buat kaya yang di figma"); only the reveal-on-scroll remains.
- **The grid under it** spells each stage out (bold lead + grey text). Copy: `stages` in `src/content/home.ts` (it replaced the five `steps`).
- The reference's third-party logos (TikTok, Instagram, YouTube) and its serif numerals were not carried over: webdev icons and Geist instead.

### Photos

`public/images/stock/` holds Unsplash photos that show no brand logos (credits in the README).

### Performance

Everything that animates continuously must pause off screen.

Optimised on 2026-10-16 (Lighthouse, production build, local): mobile performance 64 → about 88 (median of five runs; TBT 750 → ~220 ms, LCP 4.4 → ~3.1 s, DOM 2,040 → 1,366 elements, CLS 0), desktop 99 (LCP 0.7 s); accessibility, best practices and SEO 100. What did it, so keep it that way:
- **Decorative SVG illustrations mount near the screen, not at load:** (historical: the old service SVG storyboards; the Layanan visuals are now light HTML, so nothing there needs deferring). They were about half the page's DOM, and their layout and hydration dominated the load.
- **Scroll reveals don't listen to the intro:** `Reveal`/`Words` subscribe to the intro state only when `onMount` (`useIntroEnteredIf`), so they don't all re-render when the loader opens.
- **The hero's ASCII field runs at 30 fps** unless the pointer's ripple is live.
- **`gsap` was removed** (only the archived intro used it).
- The WebGL pieces (ASCII field, liquid metal buttons, particle text) were already lean: off-screen pauses, capped pixel ratios, sleeping when settled. The remaining long task is React hydrating the rest of the page; LCP is the hero heading, which waits for the loader by design.

---

## 5. Social media content (`social/`, local only)

See `social/README.md` for how to open and re-render.

### Instagram Story (`social/story/`)

- **Format:** 1080×1920, 11.6 s, 30 fps (render with `node social/tools/render.mjs <abs html> <framesDir> 11.6 30`, then `encode.swift`).
- **Composition:**
  - The webdev mark sits on a gradient tile hanging from a cord.
  - The tile drops in and swings like a pendulum.
  - **The cord is a wipe:** one side shows "BUTUH / WEBSITE?", the other "YUK, / NGOBROL."
  - The headline is **one gradient across both lines** (owner: "satu kesatuan", not one gradient per line): navy at the top of the first line → blue → light at the bottom of the second, the Brand Hub post's colours (Figma 1387:2841). Set per letter (each paints its slice of a two-line-tall gradient) so the rise-in keeps it; tracking −0.02em as in the post. It is the file's fill style "GRADIENT FIXX LASTT", and the post's type also has an **inner shadow** (black 25%, y 3.93, blur 3.93 at 83 px = 0.0473em), reproduced as the SVG filter `#type-inner` (y 6.05, stdDeviation 3.03 at 128 px) on both headlines. (Earlier: first line blue, second black.)
  - The hanging tile is **brand blue**, deeper than the headline (navy → blue, no light blue), with the plain **white mark**. Tried and reverted: a black tile with the white mark ("jelek kalo item"), and the chromatic-metal mark (Figma 1390:2858, cut to `story/bg/mark-chrome.png`, kept on disk) on blue and then on black.
  - If the chrome mark is wanted again: `story/bg/mark-chrome.png` is Figma's shader render cut with `social/tools/cutmark.cjs` (vector shape ∩ flood fill of the export's flat grey #444, un-premultiplied so no fringe): `NODE_PATH=$PWD/node_modules node social/tools/cutmark.cjs <export.png> <vector.svg> <out.png> 68`.
  - **One black** (`--ink: #00040f`, the CTA plate's navy-black) for the lockup, the cord, the button plate and the cursor body.
  - Colour logic: monochrome brand blue plus neutrals, roughly 60% neutral (white wall, grain, light) / 30% blue (headline, tile) / 10% ink (lockup, cord, CTA); the CTA is the strongest contrast on screen and lights blue on hover.
  - Background as in the post: white, Figma's grey grain (`story/bg/light-2.png`, 40%, quarter-turned and flipped) and window-light shadows (`story/bg/light-1.png`), the post's boxes scaled ×1920/1350. It replaced the bluish wall gradient.
  - The swing is wide enough to clear the text at both ends, while the tile stays inside the frame.
- **Type:**
  - Headline: Geist 700, 128 px. Weight 900 was too heavy.
  - Top: the official lockup (`social/brand/webdev-lockup.svg`) **in black**, 230 px wide (mark ~47 px tall) and centred on the frame's middle, the same as the Brand Hub Instagram posts (Figma 1387:2841: lockup at x 425–655 of 1080, 75 px from the top).
  - Bottom: the site's **black liquid-metal button** ("Klik link di bio" + arrow, 2.4× the site's pill), replacing the old #jasawebsite hashtag. The WebGL effect is the site's own: `social/tools/build-lm.mjs` transpiles `LiquidMetal.tsx` and `cursorShape.ts` into `social/story/liquid-metal.js` (re-run it after changing either). At 7.0 s the site's cursor comes in from the bottom right, morphs into the circle on the button's right end (clear of the label) at 8.3 s, the metal lights; it clicks at 9.7 s (ripple), and the video ends at 11.6 s. Rejected on the way: a blue gradient pill with a shine sweep ("gausa berkilau") and a white link-sticker pill.
- **Layout:** the space under the button is left for Instagram's WhatsApp sticker.

### Reel (`social/reel/`)

- **Format:** 1080×1920, 9.47 s, 30 fps.
- **Model:** kinetic typography after a reference reel by @advibeup ("we don't just edit. we create … repeat.").
- **Cuts:** all 22 cuts land on the reference's exact frames:
  0, .733, 1.4, 2.0, 2.533, 3.033, 3.5, 3.967, 4.367, 4.733, 5.167, 5.533, 5.9, 6.233, 6.567, 6.9, 7.2, 7.5, 7.8, 8.033, 8.333, 8.6, 8.9 s.
  The final logo appears at 9.167.
- **Background:** alternates navy `#011F6C` / pale blue `#DCE8FF` on every cut.
- **Copy:**
  > kami / bukan · cuma / bikin / website. · KAMI · bangun · desain · strategi · identitas · presisi · kecepatan · kepercayaan · SEO · konten · interaksi · konversi · penjualan · web → webde → webdev. → webdev.co.id · mark
- **Owner's rules for the reel:**
  - **One word per beat.** Stacks are fine ("kami / bukan", "cuma / bikin / website."), but each word must arrive on its own beat. Never two words at once, and never a word arriving mid-shot.
  - Words already on screen stay exactly where they are; a repeated "kami" must not jump.
  - Don't say the name twice at the end. "webdev.co.id" melts into the **mark only**, not the full lockup.
  - Use the fancy effects sparingly. They are ports of componentry.fun's `text-morph` and `kinetic-text-reveal` (same constants, frame-deterministic), used at only three moments:
    - the first "kami" reveal;
    - "bangun" → "desain" morph;
    - name → mark morph.
  - Everything else is a hard cut with a "punch": the word lands ~1.22× and eases to 1× by the next cut, as in the reference.
- **Files:**
  - `webdev-reel.mp4` has no audio.
  - `webdev-reel-sound.mp4` carries the reference reel's audio, for preview only (copyright belongs to @advibeup).
  - Advise uploading the silent version and attaching the sound with Instagram's "Use audio".

### Cursor logo reveal (`social/reveal/`)

- **Format:** landscape 1920×1080, 11.13 s, 30 fps.
- **Model:** a reference logo reveal ("the CREATORS STUDIO."), where a spotlight was tossed in. Timings were measured frame by frame, and the panel changes land within a frame of it.
- **Owner's changes:**
  - The spotlight was replaced by **the site's own arrow cursor**.
  - The motion must not stutter. It now runs on a monotone cubic through the measured poses, so there is no stop-and-go at each pose.
  - The logo is **"generated"** at the end.
- **Sequence:**
  1. The cursor is tossed up, tumbles, and catches itself in the middle.
  2. It **clicks** (presses to 72% and springs back), and a light comes on from the arrow's tip.
  3. The light is a window onto the final brand gradient, so the white lockup only shows where it falls.
  4. The cursor whips around, then slides out to the right.
  5. Panels sweep in: **WEB** (blue, from the right), **DEV** (white, from the top), **.CO.ID** (blue, from the left).
  6. The last panel drops onto the gradient, and the lockup is generated:
     - the mark's bars grow in, then the bracket;
     - the wordmark's letters lock in left to right behind flickering random characters;
     - a caret leads and then blinks.
- **Files:**
  - `webdev-reveal.mp4` has no audio.
  - `webdev-reveal-sound.mp4` carries the reference's audio, for preview only.
  - Template build: `social/tools/buildreveal.js`.

### Promo film (`social/promo/`)

- **Format:** landscape 1920×1080, 30 fps. The page runs 10 s (all times below are page times); the video is re-paced to **13.2 s**, because the owner found parts too fast to read (and asked to also speed up what could be faster). The warp, in page time, is `0-0.3:1.25,0.3-0.7:3,0.7-0.8:1.25,0.8-1.83:1,1.83-4.1:1.1,4.1-5.3:1.25,5.3-5.83:2.4,5.83-5.93:1.25,5.93-6.36:1,6.36-8:1.3,8-10:1.25`:
  - 0.3–0.7 at 3×: the opening question holds still and whole for about 1.2 s (its words now land at 0.03/0.14/0.25/0.36 and the line only speeds off from 0.66);
  - 0.8–1.83 at 1×: the punch-in on "kompetitor?" was held too long;
  - the rings at 1.1×; the empty ring before the search bar (5.93–6.36) at 1×, the typing at 1.3×;
  - 5.3–5.83 at 2.4×: the customer's last message (which also lands earlier, `LINE2 = 4.9`) shows for about 1.4 s;
  - everything else at 1.25×.
  `tools/slowshot.mjs` renders the frames on that warp and `tools/stretch.swift` slows the reference audio on the same warp with the pitch kept, so the beats still land on the cuts (checked with `analyze.swift`).
- **Model:** a ClickUp ad. The owner wants it **"sama persis"**: the same moves, nothing extra.
- **Copy ("alur 4", chosen 2026-10-14 from four question-led flows):** competitor question → what the competitor has → "Tokomu belum kelihatan." → search "jasa bikin website bisnis" → logo. The previous "ribet" version's template is kept as `promo.tpl.ribet.html` in the session scratchpad only.
- **How the motion is matched:** every camera move is measured off the reference frame by frame, then fed through monotone curves. Check it side by side with the reference at the same timestamps before rendering.
- **Smooth curves:** scene 1's moves are smooth easing curves that follow the measured shape. Interpolating every measured point made the text shake, because the measurements carry blur noise.
- **What was measured:**
  - **Scene 1:**
    - before the cut, the line drifts right/up;
    - a hard punch-in cut lands at 0.80 s;
    - the shot settles, then pulls back to the left into the cut.
  - **Scene 2:**
    - the rings stay centred, with radii 1 : 1.66 : 2.37;
    - the inner radius follows a measured curve (491 px → 125 px);
    - icons orbit at about 77°/s (inner ring) to 34°/s (outer ring) and shrink with the rings.
  - **Scene 3:**
    - the words stay level and shrink from 1.76× to 1×;
    - the box of 4 phones starts off to the upper left, squares up by about 4.45–4.87 s, then holds its screen size while turning clockwise.
  - **Scene 4:**
    - the ring turns face-on → edge-on → face-on left → diagonal;
    - the bar opens out of the shrinking button, holds in the middle, and rises from 7.55 s.
  - **Scene 5:**
    - the planet rises (8.0–8.7 s) and the light climbs (to about 8.93 s);
    - the name clears from grey to white by 9.0 s, then everything holds.
- **Scenes:**
  1. "Kenapa pembeli pilih **kompetitor**?" focuses in word by word; the copy opens with a question (the owner rejected "Jualan kamu masih ribet"). An editor-style selection grows out of "kompetitor". The line is 82 px so the longer question fits, and the punch-in is capped so the long word isn't cut off on the left.
  2. Glowing tube rings with **generic** app-style icons (no brand logos) around "Tokonya rapi, infonya lengkap, / gampang dipercaya" (what the competitor has; 22/33 px). No icons ride the inner ring, which frames the words; icons there ran over them.
  3. "Tokomu belum kelihatan." (72 px) between **two wheels of customer messages** asking trust questions ("Ini toko resmi?", "Ada website-nya?", "Kok ga ada di Google?") that keep rolling in, built with componentry.fun motion (its catalogue is at https://componentry.dev/r/registry.json, and each item is at https://componentry.dev/r/<name>.json, copyable code):
     - wheel-carousel: each message rides an arc (x = R(1 − cos θ), y = R sin θ), tilted by θ, fading by cos, shrinking with distance;
     - spiral-3d-slider's distance blur;
     - letter-cascade for "kelihatan.";
     - a soft breathing gradient behind (grain-gradient).
     When the line lands, the wheels fade and the customer's last message, "Aku beli di toko yang ada websitenya aja kak", lands sharp under the words.
     - The owner rejected hand-drawn strokes or circles on the words; they wanted the message visuals improved.
  4. A very soft torus of light that is **almost still**: a few degrees of lean, a small drift, slow streaks. The owner found the reference's flips, and even a softened version, too harsh. It is a heavily blurred conic gradient with the blur on a wrapper outside the mask, plus a second copy set back in depth for the double edge). An Apple-style frosted-glass search bar (backdrop blur, bright rim, top sheen) types "jasa bikin website bisnis", like a real search; the next shot (the logo) is the answer.
  5. The white lockup over a rising blue planet. The light is a curved bell (wide at the horizon, curving in to a column that fades upwards) with a brighter core, as in the reference.
     - The ending isn't static (the owner asked for moving light): from about 8.6 s the light breathes (the column swells and narrows a touch, the core pulses) and thin shafts drift inside it.
     - A glint (blue bloom, white core, thin flare) glides once along the horizon from left to right and fades by the end.
- **Files:**
  - `webdev-promo.mp4` has no audio.
  - `webdev-promo-sound.mp4` carries the reference audio, for preview only.
  - `webdev-promo-music.mp4` is the version to post: the reference audio up to the punch-in on "kompetitor?", then **"Far Beyond" by Ikoliks** (the owner's mp3, in Downloads) from 49.72 s, placed at 2.686 s so its biggest drop (57.72 s, 120 BPM) lands on the logo cut (10.69 s); the song's breakdown falls on the search bar, and the cuts to scenes 3 and 4 land on its beats. Built with `tools/splice.swift` (music gain 0.55: the song is far denser than the reference, RMS 0.31 vs 0.09), then AAC and `mux.swift`.
  - The owner then asked for something with a "dek-jetak" tick. Three trap beats by Arulo from **Mixkit** (Mixkit Stock Music Free License: free for commercial and social use, no attribution) were picked by measuring tick regularity and hi-hat content, each spliced the same way with its drop on the logo cut: `webdev-promo-trapanomics.mp4` ("Trapanomics", 80 BPM, from 13.00 s, drop 21.00), `webdev-promo-wakafloka.mp4` ("Waka Floka Type", 130 BPM, from 49.00 s: quiet over the rings, the beat comes in on the cut to scene 3, drop 57.00), `webdev-promo-complicated.mp4` ("Complicated", from 16.25 s: a low build, then the drop at 24.25). Pixabay was tried first but its pages sit behind a bot check, so nothing was downloaded from there.
- **CSS gotchas:**
  - Load every Geist weight explicitly before measuring text. A hidden scene's font isn't fetched until it shows.
  - Put blur filters on a wrapper outside any CSS mask; the mask cuts the blur back.

### Sound design (`social/tools/sfx.mjs`)

- **Requirement:** the owner wanted sound like the reference videos, but **free and safe**. So nothing was installed: the technique was read from AbubakrChan/product-launch-motion's notes, and the synth was written here.
- **How it works:** `sfx.mjs` synthesises every sound from scratch in plain Node, with no samples and no services:
  - tick, key, click, pop, thump, boom, whoosh, shimmer, riser, chime, pad.
  - Each is placed on the film's measured frames:
    - word ticks: 0.03 / 0.2 / 0.4 / 0.57 s;
    - punch-in: 0.8 s;
    - whoosh into the rings, a soft impact and sparkle: 1.83 s;
    - a whoosh to white: 4.1 s;
    - one pop per chat message: 4.16–5.34 s, ending on a falling two-note "notification";
    - whoosh into a thump: 5.93 s;
    - a glass sheen, typed keys and an enter: 6.38–6.98 s;
    - a riser into a boom and a ringing chord: 8.0 s;
    - the glint's sparkle: 8.85–9.9 s.
  - Every tonal sound is in D major pentatonic.
  - The mix uses one static gain to about 0.93 peak, with no limiter.
- **Output:** none any more. The owner found the synthesised sound poor ("sound kamu masih jelek"), so the SFX version was removed. The promo ships silent or with the reference audio. Don't add synthesised SFX again unless asked.
- **Checking it:** read back with `analyze.swift`; the onsets land on those cues. Claude can't hear it, so ask the owner for feedback by timestamp.

### Agency reel with voice (`social/reel2/`)

- **Format:** landscape 1920×1080, 17.5 s, 30 fps.
- **Models:** a mix of two references: an SDS agency reel (style) and a TWS narrated ad (voice-led structure).
- **Voice-over:** edge-tts `id-ID-ArdiNeural`; the owner can switch to Gadis or macOS Damayanti.
  - Each line is its own file, placed at `START` in `tools/build-reel2.js`.
  - Word boundaries drive the kinetic type, so every word appears as it is said.
  - The script: "Website itu etalase toko kamu, / yang buka dua puluh empat jam. / Kami bantu bikin semuanya, / dari desain, sampai tayang. / Ini beberapa karya kami. / Siap bawa bisnismu online? / webdev dot co dot id."
- **Scenes:**
  1. A flowing brand-blue backdrop; the type appears word by word ("24" lands on "dua"), and icons burst out of "24 jam".
  2. "Kami bantu bikin / dari desain, sampai tayang." with a 3D-tilted services list rolling past a lit centre item.
  3. A 3D carousel of 12 cards made from screenshots of the live site and the two client portfolios.
  4. "Siap bawa bisnismu online?"
  5. The screen dips to dark; the 3 bars drop and bounce, the bracket swings shut, the wordmark opens on "webdev", and the tagline appears.
- **Soundtrack** (`tools/reel2-audio.mjs`, all synthesised except the voice):
  - Music: 100 BPM, D–Bm–G–A, with pad, arp, bass and drums from 4.4 s, a break with risers into the logo, then a boom and chord.
  - Sound design on every cut.
  - The music ducks under the voice.
- **Caveat:** edge-tts uses Microsoft's online voice unofficially. It's free with no key, but there is a small terms risk for paid ads.

### Reel 3 (`social/reel3/`)

- **Brief:** "make one interesting piece" in the look the owner picked (see the video-style notes: dark navy, soft blue light, one focal point, type focusing in from blur, one light-blue accent word). Motion ideas learned from the TWS ad (punch words, a glass card rising in 3D, a closing line under light), not copied from it.
- **Format:** vertical 1080×1920 (Reels), 14.4 s, 30 fps. Cuts sit on the beat grid of **"Infinity" by Arulo (Mixkit, free licence)**, 75 BPM, played from 48.0 s, so the hit after its silence (60.0 s) lands on the lockup at 12.0 s. Scenes change on whole beats (0.8 s), punch words on half beats.
- **Scenes:**
  1. Punch words, Geist 800 caps filled white → blue: "BANYAK / YANG / BILANG / IG / AJA / CUKUP." (0–2.4)
  2. "Padahal pembeli / cari yang **meyakinkan**." (2.4–4.8)
  3. A glass card (the site's hero screenshot, with a soft reflection and a light sheen) rises from below, tipped back, and turns to face the camera over a blue bloom; "Website bikin tokomu / **kelihatan serius**." (4.8–7.2)
  4. A 3D carousel turns past real work (arifsyauqi, michaelutomo) and stops on the "+ Bisnismu, berikutnya." card; "Desain custom, / dari **nol**." Then the camera **zooms into that card** (owner's request): its holo gradient grows to fill the frame. (7.2–10.4)
  5. On the same holo gradient (white glow top left → blue → navy), "Saatnya bisnismu / **online**.", then the lockup lands on the hit with a glow and a band of light. **No tagline** (removed on request). (10.4–14.4)
- Scenes leave and arrive with a short vertical whip (motion blur).
- **Sound:** the owner found the earlier sound very poor, so it is now a real music bed plus **recorded** sound effects from Mixkit (free licence), laid with `tools/mix.swift` from `reel3/audio/mix.json`: quick zoom impacts on the punch words, whooshes on the cuts, a flying swoosh as the card rises, a riser and an air-zoom into the card, and a movie logo impact (its peak on 12.0) with a light sparkle. Nothing synthesised.
- **Files:** `reel3.tpl.html` (template; build with `tools/buildreveal.js`), `webdev-reel3.html`, `webdev-reel3.mp4` (no audio), `webdev-reel3-sound.mp4` (with the mix), `audio/` (the music, the effects and `mix.json`).

### Render pipeline

1. Pages expose a deterministic clock: `window.__render(t)` for the reel, or a virtual `performance.now`/rAF for the story.
2. Headless Chrome captures each frame over CDP.
3. `encode.swift` (AVFoundation, H.264) turns the frames into MP4.
4. `mux.swift` adds an audio track.

`analyze.swift` measures cut times, type size and audio onsets of any video. There is no ffmpeg or Homebrew on this machine; Swift and Chrome are available.

---

## 6. History (commits on `main`)

| Commit | What it did |
|---|---|
| `6f08779` | Built the single-page site |
| `52eb122` | Launch prep: SEO metadata, mobile polish |
| `83c0e4c` | Illustrations matching the services; email contact |
| `b0a4621` | Mobile viewport fixes (black canvas, `svh` heights) |
| `0931a80` | Smooth intro zoom with the hero moving |
| `5897906` | New brand palette |
| `ec8c25e` | Service illustrations after Hostinger's compositions, in the webdev style |
| `3c1738a` | Copy audit, existing-site cards, consistency pass, footer close |
| `8fe6e4e` | Live service bento with device mock-ups, brand-free photos |
| `064a137` | Round favicon, smaller intro logo, footer spacing |
| `62e4ca0` | `/social/` gitignored |

---

## 7. Open items

- The About image is a placeholder for a video (keep the ▶ icon until it arrives).
