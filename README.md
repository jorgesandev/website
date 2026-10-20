# jorgesandoval.dev

Source for [jorgesandoval.dev](https://jorgesandoval.dev), Jorge Sandoval’s professional portfolio. The site presents selected fullstack and applied-AI work, professional experience, services, a public résumé, and direct contact options.

## Highlights

- Evidence-led project case studies with contributions, decisions, outcomes, and limitations.
- Responsive, keyboard-accessible interface with reduced-motion support.
- Server-rendered content with a small client boundary for mobile navigation.
- Progressive-enhancement contact form backed by Formspree.
- Metadata, sitemap, robots configuration, and a focused privacy page.

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- IBM Plex Sans and IBM Plex Mono through `next/font`
- Node.js native test runner

## Local development

Requirements: [Bun](https://bun.sh/) 1.3.14+ and Node.js 22.18+.

```sh
bun install --frozen-lockfile
cp .env.example .env.local
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## License

Copyright © Jorge Sandoval. All rights reserved.
