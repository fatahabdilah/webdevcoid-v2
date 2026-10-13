# webdev.co.id

Marketing site for webdev.co.id, a website studio in Indonesia. Single page, built with Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4 and Motion.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Production: `npm run build && npm start`. Set `NEXT_PUBLIC_SITE_URL` if the site is not served from `https://webdev.co.id` (it is used for metadata, the sitemap and robots.txt).

## Structure

The site is one page: `src/app/(site)/page.tsx`, with the fixed navbar and the footer in `src/app/(site)/layout.tsx`. The only other route is the 404 page (`src/app/not-found.tsx`). Every section has an id (`#about`, `#values`, `#services`, `#process`, `#portfolio`, `#pricing`, `#faq`, `#contact`), and the navbar and footer links scroll to them.

## Where things live

- `src/content/` – all text and data. Edit content here.
  - `home.ts` – section copy, services, process steps, plans and FAQ
  - `portfolio.ts` – projects shown in the portfolio slider
  - `site.ts` – site URL, contact details and the WhatsApp link helper
- `src/components/home/` – one component per section (Hero, About, Values, Services, Process, Portfolio, Pricing, Faq).
- `src/components/` – shared pieces:
  - `Button.tsx` – pill buttons (liquid metal primary, muted, inverted, outline)
  - `LineIcon.tsx` – the line icons used in buttons
  - `motion.tsx` – reveal-on-scroll and word-by-word text animations. `ANIMATIONS_ENABLED` switches every animation and the smooth scroll on or off.
  - `AsciiBackground.tsx` – the hero's animated ASCII background (WebGL)
  - `ParticleText.tsx` – the hero headline drawn as particles that move away from the cursor (WebGL)
  - `LiquidMetal.tsx` – the liquid metal effect on primary buttons (WebGL 2)
  - `DitherDots.tsx` – the dithered dots in the pricing ambient (WebGL)
  - `preloader/` – the intro animation
- `src/lib/` – brand colours (`brand.ts`), logo and cursor paths, intro state and text helpers.
- `src/app/globals.css` – colour tokens, breakpoints and text styles (`t-h2`, `t-body-m`, …).
- `src/app/` – favicon, app icons, Open Graph image, `robots.ts` and `sitemap.ts`.
- `public/images/`, `public/videos/` – images and the footer video.

Brand colours: `#000000`, `#012685`, `#0450F0`, `#56A1F7`, `#FFFFFF` (the `--color-holo-*` tokens in `globals.css`, and `src/lib/brand.ts` for canvas and WebGL code).

Breakpoints: phone below 800px, tablet (`md`) from 800px, desktop (`lg`) from 1200px.

## Performance notes

The WebGL effects only render while they are on screen. The headline particles stop once they have settled and wake on pointer movement; the button effect redraws at 30fps while nobody is hovering it; the pricing dots are created on first use and stop when switched off. The footer video downloads only near the viewport and pauses off screen. Anything new that animates continuously should pause off screen too.

## Photo credits

Photos in `public/images/stock/` are from Unsplash, free under the [Unsplash License](https://unsplash.com/license) (no attribution required; listed here for the record). None shows a brand.

- `kaos.jpg` – [white t-shirt on a wooden hanger](https://unsplash.com/photos/a-plain-white-t-shirt-hangs-on-a-wooden-hanger-8ACmRoleM24), Avtar Singh
- `klinik.jpg` – [dental room with a purple chair](https://unsplash.com/photos/a-dental-room-with-a-purple-chair-and-a-white-desk-0gI0IXURDgo)
- `lilin.jpg` – [candle in a glass jar](https://unsplash.com/photos/a-candle-in-a-glass-jar-7JxP1pYYIUo)
- `cangkir.jpg` – [white ceramic mug on a white surface](https://unsplash.com/photos/white-ceramic-mug-on-white-surface-oJ9CgpidOco)
- `tanaman.jpg` – [plant in a white ceramic pot](https://unsplash.com/photos/green-plant-on-white-ceramic-pot-SVRKkENpalg)
