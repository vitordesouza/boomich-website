# AGENTS.md

Marketing site + brand system for Boomich (independent software studio). This repo is public and is itself part of the pitch: engineers and recruiters will read this code.

## Read first

- `PRODUCT.md`: brand concept (LOAD-BEARING), audience, anti-references. Binding.
- `DESIGN.md`: the full design system: tokens, rules, components, the hero instrument spec. Binding. The named rules (Calibration Rule, One Environment Rule, Readout Rule, Two Shouts Rule) are hard constraints, not suggestions.

## Stack

- Astro 5 + TypeScript (strict). Static output. No React/Vue/etc.
- Interactive code (the hero instrument) is dependency-free vanilla TS mounted as an Astro island. Zero JS shipped except islands.
- Styling: plain CSS with custom properties (design tokens in `src/styles/tokens.css`), no Tailwind, no CSS-in-JS. OKLCH colors only.
- Fonts: self-hosted woff2 in `public/fonts/` (Panchang, Switzer, Martian Mono), latin subset, `font-display: swap`.
- Tests: Vitest (unit: physics, utils), Playwright (smoke + axe a11y).
- Tooling: pnpm, ESLint (flat config), Prettier, GitHub Actions CI.

## Commands

- `pnpm dev` / `pnpm build` / `pnpm preview`
- `pnpm test` (Vitest), `pnpm test:e2e` (Playwright)
- `pnpm lint`, `pnpm format:check`, `pnpm check` (runs everything CI runs)
- `node scripts/shoot.mjs [route] [name]`: builds nothing; screenshots the running dev/preview server to `shots/` at desktop (1440) and mobile (390). Use it to verify visual work.

## Conventions

- Small, focused components in `src/components/`, one concern each. Site copy lives in `src/content/site.ts`, never inline in components.
- No `any`, no non-null assertions without a comment stating the invariant.
- The frame loop of the instrument allocates nothing. Physics is pure and unit-tested (`src/instrument/`).
- Accessibility is not optional: focus states per DESIGN.md, reduced-motion behavior per DESIGN.md §8, axe must pass in CI.
- Commits: imperative, present tense, scoped ("hero: clamp drag to envelope").

## Quality bar

Every visual change must be verified against DESIGN.md by screenshot before it is done. If a detail conflicts with DESIGN.md, DESIGN.md wins; if you believe DESIGN.md is wrong, stop and say so instead of deviating silently.
