# AI context: webdev.co.id

Handoff notes for an AI assistant picking up this project. They sum up the decisions and preferences from the build sessions so far, so you don't re-ask settled questions or undo choices the owner made on purpose. Read this together with `README.md`, which covers structure and setup.

Last updated: 2026-10-14.

---

## 1. The project

- **What:** the marketing site for **webdev.co.id**, a website studio in Indonesia that builds company profiles, landing pages, online stores and custom web apps. It has a single page plus a 404 page.
- **Stack:** Next.js 16.4 (App Router, Turbopack, `cacheComponents`), React 19.3, Tailwind CSS v4, `motion` (Motion for React), `lenis` (smooth scroll), `gsap` (preloader only), TypeScript.
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
- **Stale CSS:** the dev server sometimes serves old CSS. A trivial comment edit in `globals.css` forces a rebuild. Some file-convention changes (e.g. a new `icon.svg`) need a dev server restart.

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

### Buttons and calls to action

- Every **consultation / "Konsultasi Gratis" button carries the WhatsApp icon**, including the one in the navbar.
- "Kunjungi situs"-type contact uses WhatsApp, not phone.
- The **hero has a single button:** "Lihat Harga →".

### Layout

- **Single page only:** no new routes.
- **About section image:** keeps the ▶ play icon, because a video will replace the photo later.
- **Footer:**
  - The closing line "Siap bawa bisnismu online?" sits over plain icon + text contacts, with no boxes and no WhatsApp background.
  - The contacts are Instagram @webdev.co.id, email webdevcoid.official@gmail.com, and WhatsApp 0822 5809 6886.
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

### Intro / preloader (`src/components/preloader/`)

- **Sequence:** the logo writes on over a dither field. A scripted cursor then clicks the logo (a press only, no ring effect). The logo becomes a window, and the page zooms through it.
- **Zoom implementation:** the zoom uses Web Animations on `[data-intro-zoom]` (the hero). It is pre-promoted in CSS via `html:has(.intro-root) [data-intro-zoom]`, which avoids hydration mismatches. Never set inline styles on the hero during the intro.
- **Logo size:** the finished logo framing is `WIDE_SCALE = 0.7` in `runIntro.ts` (made smaller on request).
- **Intro phases:** `src/lib/intro.ts` provides `introPhase()`, `markIntroDone()` and `useIntroDone()`.

### Services (`Services.tsx` → `ServiceBento.tsx` + `ServiceArt.tsx`)

The bento grid:

- **Order:** Company Profile (wide), Landing Page, Web App (Custom), Toko Online (wide).
- **Layout:** desktop `1 1 2 / 3 4 4`, tablet `1 1 / 2 3 / 4 4`, stacked on phones.
- **Card content:** each card shows only the title, one line of text and a live illustration. There are **no price labels and no CTA link** (both removed on request).
- **Device mock-ups only in two cards:** top-left (Company Profile, MacBook-style laptop) and bottom-right (Toko Online, three stacked iPhone-style phones).
- **The demo cursor appears only in the Company Profile card,** and is always the site's own arrow.

Each illustration plays a short story:

- **Company Profile:** Google search → the clinic site.
- **Landing Page:** promo → order counter.
- **Web App:** dashboard + automated jobs.
- **Toko Online:** catalogue → cart → WhatsApp.

**Only one story plays at a time:**

- On desktop, the hovered card plays; otherwise the cards take turns via `onLoop`.
- On touch screens, the card crossing the middle of the screen plays.

Stories pause off screen (`useStory` uses an IntersectionObserver).

### "Butuhnya bukan website baru?" (`ExistingSite.tsx`)

Two WhatsApp cards; one tilted preview screen is up at a time (hover hands it over). After them come "Yang selalu kamu dapat", the CTA card and the included-features card.

### Photos

`public/images/stock/` holds Unsplash photos that show no brand logos (credits in the README).

### Performance

Everything that animates continuously must pause off screen.

---

## 5. Social media content (`social/`, local only)

See `social/README.md` for how to open and re-render.

### Instagram Story (`social/story/`)

- **Format:** 1080×1920, 13.5 s, 30 fps.
- **Composition:**
  - The webdev mark sits on a gradient tile hanging from a cord.
  - The tile drops in and swings like a pendulum.
  - **The cord is a wipe:** one side shows "BUTUH / WEBSITE?", the other "YUK, / NGOBROL."
  - The first line is blue (`#0346D6`) and the second black; the owner tried "question black, answer blue" and reverted it.
  - The swing is wide enough to clear the text at both ends, while the tile stays inside the frame.
- **Type:**
  - Headline: Geist 700, 128 px. Weight 900 was too heavy.
  - Top: the official lockup (`social/brand/webdev-lockup.svg`) **in black**.
  - Bottom: one hashtag, **#jasawebsite**, in a single colour (navy). Not #webdevcoid.
- **Layout:** the space under the hashtag is left for Instagram's WhatsApp sticker.

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

- **Format:** landscape 1920×1080, 30 fps. The page runs 10 s (all times below are page times); the video is rendered slower, **13.1 s**, because the owner found parts too fast to read. The warp is `0-5.3:1.25,5.3-5.83:2.4,5.83-10:1.25`: 1.25× everywhere, and 2.4× while the customer's last message is up in scene 3 (it was on screen too briefly; it also lands earlier now, `LINE2 = 4.9`), so it shows for about 1.4 s. `tools/slowshot.mjs` renders the frames on that warp and `tools/stretch.swift` slows the reference audio on the same warp with the pitch kept, so the beats still land on the cuts.
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
  2. Glowing tube rings with **generic** app-style icons (no brand logos) around "Tokonya rapi, infonya lengkap, / gampang dipercaya" (what the competitor has).
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
