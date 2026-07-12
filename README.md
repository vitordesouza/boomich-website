# Boomich

Boomich is an independent software studio for the hard parts of product engineering: realtime systems, cross-platform mobile, and applied AI.

## The brand

Boomich is load-bearing: the member between product intent and production reality that holds when weight is applied. The site demonstrates that idea as a calibrated structural test, not as construction imagery. [PRODUCT.md](PRODUCT.md) defines the concept and voice; [DESIGN.md](DESIGN.md) is the binding visual and interaction system.

## The instrument

The hero is a dependency-free canvas truss.

- Verlet integration advances each free node.
- Distance constraints hold the member lengths across four iterations per frame.
- Fixed anchors and a damped load hook define the test article.
- The hook displacement is clamped to a rated envelope.
- Strain and deflection drive the live readout and member state.
- The render loop allocates nothing; its physics and clamp behavior have Vitest coverage.

## Architecture

- `src/pages/` contains the static routes, including the Open Graph card and 404.
- `src/components/` contains small Astro components; site copy lives in `src/content/site.ts`.
- `src/instrument/` contains pure physics, envelope clamping, canvas rendering, and the mounted controller.
- `src/styles/` contains the token, font, base, and shared-component layers.
- `public/` holds self-hosted fonts, icons, generated Open Graph image, and crawler directives.

## Commands

| Command                                 | Purpose                                                       |
| --------------------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                              | Start the local development server.                           |
| `pnpm build`                            | Produce the static site in `dist/`.                           |
| `pnpm preview`                          | Serve the built site locally.                                 |
| `pnpm icons:generate`                   | Generate the Apple touch icon from the favicon source.        |
| `pnpm og:generate`                      | Build, preview, and capture `/og` as `public/og.png`.         |
| `pnpm test`                             | Run physics and utility tests.                                |
| `pnpm test:e2e`                         | Run browser smoke and accessibility checks.                   |
| `pnpm lint`                             | Run ESLint.                                                   |
| `pnpm format:check`                     | Check Prettier formatting.                                    |
| `pnpm check`                            | Run the CI quality gate.                                      |
| `node scripts/shoot.mjs [route] [name]` | Capture desktop and mobile screenshots from a running server. |

## Deploy

The site is static. Vercel can deploy the build output with the cache rules in `vercel.json`.

## License

Code is available under the [MIT License](LICENSE). The Boomich name, mark, visual identity, and brand assets are reserved.
