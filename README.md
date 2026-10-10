# Conicorn

A hand-built Next.js version of the Conicorn Framer template: same content, layout, breakpoints and animations, running locally without Framer.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

For a production build: `npm run build && npm start`.

## Structure

The site is a single page: `src/app/(site)/page.tsx`, with the fixed navbar and the footer in `src/app/(site)/layout.tsx`. The only other route is the 404 page (`src/app/not-found.tsx`). The navbar and footer links scroll to sections on the page (`#about`, `#project`, `#pricing`, `#contact`).

Some sections are hidden for now (commented out in `page.tsx`): Team, Integrations ("Semua kami urus") and Testimonials ("Untuk siapa").

## Where things live

- `src/content/` – all text and data (home sections, case studies, contact details). Edit content here.
- `src/components/home/` – one component per home page section.
- `src/components/motion.tsx` – reveal-on-scroll and word-by-word text animations (uses [Motion](https://motion.dev)). `ANIMATIONS_ENABLED` there switches every site animation and the smooth scroll on or off.
- `src/components/PlaygroundBg.tsx` – the hero's animated ASCII background (WebGL).
- `src/components/ui/cursor-driven-particle-typography.tsx` – the hero headline drawn as particles that move away from the cursor (WebGL).
- `src/components/LiquidMetal.tsx` – the liquid metal effect on the primary buttons (WebGL 2), used by `Button.tsx`.
- `src/components/Ticker.tsx` – infinite marquees.
- `src/components/icons.tsx` – SVG icons exported from the Framer project.
- `src/app/globals.css` – color tokens, breakpoints and the text styles (`t-h2`, `t-body-m`, …).
- `public/framer/` – images and videos downloaded from the Framer project.

Breakpoints match Framer: phone below 800px, tablet (`md`) from 800px, desktop (`lg`) from 1200px.

## Performance notes

The WebGL effects only render while they are on screen. The headline particles stop once they have settled and wake on pointer movement; the button effect redraws only its outline, at 30fps, while nobody is hovering it. Keep that in mind when adding effects: anything that animates continuously should pause off screen.
