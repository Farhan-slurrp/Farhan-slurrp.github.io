# FAN // terminal portfolio

A deliberately compact, terminal/TUI-inspired portfolio. It is a static, vanilla TypeScript + Vite application: no React, framework, backend, external runtime assets, or invented personal details.

## Setup

```sh
npm install
npm run dev
```

Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, and `npm test -- --run`.

## Controls and accessibility

Use the follow-up options at the bottom of the transcript or open the section picker with `Cmd/Ctrl + K`. Content is presented as an agent-style streamed transcript, with semantic landmarks, a skip link, visible focus states, reduced-motion support, a noscript summary, and mobile-friendly touch targets. The follow-up prompt remains docked below the transcript on desktop, tablet, and mobile.

## Personalization

Profile and menu data live in `src/content.yaml`; rendering and command behavior are in `src/main.ts`; visual design is in `src/style.css`. Blocks default to `text`; declare `type: codeblock` when a section should render a code block. The contact view intentionally says details are not connected. Add verified, real links to the YAML only when available—do not replace it with guessed email, social, location, metrics, dates, or resume URLs.

## Deployment

Run `npm run build` and deploy the generated `dist/` directory to any static host (GitHub Pages, Netlify, Vercel static output, S3, or similar). No server is required.
