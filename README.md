# Boomich

Boomich is an independent software studio for the hard parts of product engineering.

The brand concept and binding design system live in [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md).

## Quick start

```sh
pnpm install
pnpm dev
```

| Command                                 | Purpose                                                       |
| --------------------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                              | Start the local development server.                           |
| `pnpm build`                            | Produce the static site in `dist/`.                           |
| `pnpm preview`                          | Serve the built site locally.                                 |
| `pnpm test`                             | Run Vitest unit tests.                                        |
| `pnpm test:e2e`                         | Run Playwright smoke and accessibility checks.                |
| `pnpm lint`                             | Run ESLint.                                                   |
| `pnpm format:check`                     | Check Prettier formatting.                                    |
| `pnpm check`                            | Run the CI quality gate.                                      |
| `node scripts/shoot.mjs [route] [name]` | Capture desktop and mobile screenshots from a running server. |

## License

The code is available under the [MIT License](LICENSE). Boomich brand assets, name, marks, visual identity, and brand documentation are reserved and are not included in that license.
