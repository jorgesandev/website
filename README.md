# jorgesandoval.dev

Source for [jorgesandoval.dev](https://jorgesandoval.dev), Jorge Sandoval’s professional portfolio. The site presents selected fullstack and applied-AI work, professional experience, services, a public résumé, and direct contact options.

## Highlights

- Evidence-led project case studies with contributions, decisions, outcomes, and limitations.
- Responsive, keyboard-accessible interface with reduced-motion support.
- Dark sage light and dark themes, with a natural-color portrait. A header control offers System (default), Light, and Dark; manual choices are remembered locally and applied before the page paints.
- Server-rendered content with a small client boundary for mobile navigation.
- Progressive-enhancement contact form backed by Formspree.
- Metadata, sitemap, robots configuration, and a focused privacy page.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Bundled IBM Plex Sans and IBM Plex Mono through `next/font/local`
- Node.js native test runner

## Local development

Requirements: [Bun](https://bun.sh/) 1.3.14+ and Node.js 22.18+ (22.x).

```sh
bun install --frozen-lockfile
cp .env.example .env.local
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Font files and their licenses live in `app/fonts/`. Builds use these local assets without fetching Google Fonts. Vercel uses Node.js 22.x, constrained by `package.json` to avoid automatic major-version upgrades.

The contact form is disabled by default. To enable it locally, set the following values in `.env.local`:

```dotenv
CONTACT_FORM_ENABLED=true
FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
```

`FORMSPREE_ENDPOINT` is a public form action, not a secret. The application accepts only HTTPS endpoints under `formspree.io/f/`. When the configuration is absent or invalid, the page shows a direct email action instead of a broken form.

## Quality checks

```sh
bun run format:check
bun run lint
bun run typecheck
bun run test
bun run build
```

## Structure

```text
app/
  components/    Page sections and interactive navigation
  lib/           Project data and contact configuration validation
  privacy/       Contact-form privacy information
public/          Portrait and downloadable résumé
tests/           Contact configuration tests
```

Professional links and contact details are available at [jorgesandoval.dev](https://jorgesandoval.dev).

## Résumé downloads

The home page offers one-page PDFs in [English](public/Jorge_Alejandro_Sandoval_Resume_EN.pdf) and [Spanish](public/Jorge_Alejandro_Sandoval_Resume_ES.pdf). Both use `jorge@jorgesandoval.dev`. Keep the two versions factually aligned when updating experience, education, credentials, or projects. The original `/Jorge_Alejandro_Sandoval_Resume.pdf` URL remains an English copy for existing links.

## Recent changes

- October 22, 2026: Applied the dark sage palette in light and dark themes using CSS system preference, updated browser theme colors and interactive states, and restored the portrait's natural color. Printed pages retain light styling.
- October 20, 2026: Changed the website and résumé contact address to `jorge@jorgesandoval.dev`; removed the PingPong route, camera/PWA assets, dependencies, tests, and build configuration while preserving Git history. Added English and Spanish résumé downloads.

## License

Copyright © Jorge Sandoval. All rights reserved.
