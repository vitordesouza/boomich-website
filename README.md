# Boomich

Boomich is an independent software studio for the hard parts of product engineering: realtime systems, cross-platform mobile, and applied AI.

## The brand

Boomich is load-bearing: the member between product intent and production reality that holds when weight is applied. The site demonstrates that idea as a calibrated structural test, not as construction imagery. [PRODUCT.md](PRODUCT.md) defines the concept and voice; [DESIGN.md](DESIGN.md) is the binding visual and interaction system.

## The instrument

The hero is **The Net**, a dependency-free full-bleed canvas lattice suspended behind the headline.

- Verlet integration advances each free node while its perimeter remains pinned.
- A single distance-constraint pass deliberately keeps the net compliant and visibly deformable.
- Hover applies a 30% local field; mouse drag, horizontal touch movement, and a touch hold apply full strength without taking over vertical scrolling.
- Three tie members attach the copy to nearby nodes; the copy follows their mean displacement by a bounded, spring-smoothed amount.
- Only strained members move from Ink toward calibration amber. The status line stays Ink Faint and provides the accessible state announcement.
- The render loop uses fixed typed-array buffers; pure net geometry, stepping, strain, and energy have Vitest coverage.

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

## Colophon

The site is Astro and TypeScript with self-hosted type. The instrument is dependency-free vanilla TypeScript; Lenis provides the optional smooth scroll and Motion supplies the vanilla `scroll()` and `inView()` choreography utilities. Those enhancements are disabled for reduced-motion users.

## License

Code is available under the [MIT License](LICENSE). The Boomich name, mark, visual identity, and brand assets are reserved.
