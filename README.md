# Comfort — Premium Architectural Interiors


Enterprise-grade multilingual website for [Comfort](https://comfort.am): baseboards, 3D wall panels, moldings, and profiles.

## Stack

- Next.js 15+ (App Router) · React 19 · TypeScript · Tailwind CSS 4
- Framer Motion · GSAP · Three.js · React Three Fiber · Drei
- TanStack Query · Zustand · next-intl (AM / RU / EN)
- Lenis · Swiper · React Hook Form · Zod · Lucide · Radix / shadcn-style UI

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — middleware redirects to `/en`.

```bash
npm run build
npm start
```

## Locales

| Path | Language |
|------|----------|
| `/am` | Armenian |
| `/ru` | Russian |
| `/en` | English |

Language switcher lives in the header. Messages: `messages/{am,ru,en}.json`.

## Key routes

| Route | Description |
|-------|-------------|
| `/[locale]` | Cinematic home |
| `/[locale]/products` | Catalog |
| `/[locale]/products/[slug]` | Product PDP + 3D viewer |
| `/[locale]/collections` | Collections + filters |
| `/[locale]/configurator` | Live product configurator |
| `/[locale]/visualizer` | Room visualizer |
| `/[locale]/calculator` | Smart material calculator |
| `/[locale]/ar` | WebXR / QR AR entry |
| `/[locale]/projects` | Portfolio |
| `/[locale]/about` | Company |
| `/[locale]/downloads` | CAD / BIM / PDF center |
| `/[locale]/blog` | Journal |
| `/[locale]/contact` | Contact + form |
| `/[locale]/admin` | CMS dashboard |

## Admin

1. Visit `/en/admin/login`
2. Demo: `admin@comfort.am` / `admin`
3. Roles: admin, manager, editor, translator, dealer (inferred from email substring)

## Architecture

```
src/
  app/[locale]/     # Locale-scoped routes + admin
  components/       # Atomic UI (atoms / molecules / organisms)
  features/         # Home, viewer, configurator, calculator, visualizer, AR, admin, CMS UI
  data/             # Localized helpers and site images
  i18n/             # next-intl routing + request config
  stores/           # Zustand (UI, auth, viewer, calculator, visualizer)
  lib/              # Utils + calculator engine
  types/            # Shared TypeScript models
messages/           # am / ru / en dictionaries
```

## Design system

- Primary `#2C3333` · Secondary `#ACB9C0` · Accent `#203E4B`
- Dark mode via `next-themes`
- Glassmorphism utilities: `.glass`, `.shadow-soft`, `.display`
- Fonts: Manrope (body) · Syne (display)

## SEO & performance

- Per-locale metadata, Open Graph, alternates
- `sitemap.ts` · `robots.ts`
- Image optimization (AVIF/WebP) · dynamic 3D bundle · Lenis smooth scroll

## Notes

Catalog, CMS, and media persist in MySQL through the Express API (`npm run dev:api`).
