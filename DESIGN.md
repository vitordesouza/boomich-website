---
name: Boomich
description: Load-bearing brand system for Boomich. Deep mineral olive instrument housing, warm light ink, calibration amber reserved for live measurement.
colors:
  ground: 'oklch(0.24 0.030 130)'
  ground-raised: 'oklch(0.285 0.036 128)'
  ground-recessed: 'oklch(0.205 0.026 131)'
  ink: 'oklch(0.95 0.010 100)'
  ink-secondary: 'oklch(0.77 0.018 115)'
  ink-faint: 'oklch(0.63 0.020 120)'
  amber: 'oklch(0.82 0.140 76)'
  amber-deep: 'oklch(0.72 0.150 70)'
  line: 'oklch(0.95 0.010 100 / 0.16)'
  line-soft: 'oklch(0.95 0.010 100 / 0.08)'
typography:
  display:
    fontFamily: 'Panchang, system-ui, sans-serif'
    fontSize: 'clamp(2.5rem, 6.5vw, 5.25rem)'
    fontWeight: 600
    lineHeight: 1.03
    letterSpacing: '-0.015em'
  headline:
    fontFamily: 'Panchang, system-ui, sans-serif'
    fontSize: 'clamp(1.55rem, 3.2vw, 2.5rem)'
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: '-0.01em'
  body:
    fontFamily: 'Switzer, system-ui, sans-serif'
    fontSize: 'clamp(16px, calc(15px + 0.3vw), 19px)'
    fontWeight: 400
    lineHeight: 1.6
  readout:
    fontFamily: 'Martian Mono, ui-monospace, monospace'
    fontSize: '12.5px'
    fontWeight: 450
    letterSpacing: '0.05em'
rounded:
  chamfer: '7px 45° corner cut (clip-path), the machined edge break'
  tick: '1px'
spacing:
  gutter: 'clamp(20px, 5vw, 64px)'
  section: 'clamp(88px, 12vw, 176px)'
  maxw: '1180px'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.ground}'
    typography: 'Switzer 500, 15px'
    shape: 'rectangular, 7px chamfered corners'
    padding: '14px 24px'
  button-ghost:
    backgroundColor: 'transparent'
    border: '1px {colors.line}'
    textColor: '{colors.ink}'
    shape: 'rectangular, 7px chamfered corners'
    padding: '14px 24px'
---

# Design System: Boomich

## 1. Overview

**Creative North Star: "The Calibrated Instrument"**

The site is a precision instrument in a deep mineral-olive housing. Everything on it behaves like the front panel of well-made test equipment: engraved hairlines, machined chamfers, markings that correspond to real values, one amber signal that only ever means "live measurement". The hero is a working structural instrument: a full-bleed lattice the visitor loads with their finger. It visibly deforms, settles, and holds the suspended message.

Explicitly rejected: the AI-default dev-portfolio formula (dark hero, heavy grotesque, red accent, mono eyebrows, numbered sections, warm paper), the editorial-serif lane, terminal cosplay, construction decor, shadows, gradients, glassmorphism, cards, stock photography. See PRODUCT.md anti-references.

**Key characteristics:**

- One environment: the whole page lives in the olive housing. Tone steps (raised / recessed) do the spatial work.
- One signal: calibration amber, only on live values, stressed members, active states of the instrument. Never on links, buttons, dividers, or brand moments.
- Machined geometry: flush edges, mitered joins, 7px chamfered corners on interactive elements. No border radius curves elsewhere.
- Type: Panchang (wide, squared, display only, two levels), Switzer (calm body), Martian Mono (readouts only).
- The mark: the Truss B. A load-bearing letterform, stroke-drawn, currentColor.
- Motion: physical and settling (the artifact), or fast and dry (UI). Ambient cycles are allowed only when they demonstrate the system depicted.

## 2. Colors

### Environment (the housing)

- **Ground** `oklch(0.24 0.030 130)`: the page. Deep mineral olive, near-black with material warmth.
- **Ground Raised** `oklch(0.285 0.036 128)`: raised panels: the instrument bed, spec rows on hover.
- **Ground Recessed** `oklch(0.205 0.026 131)`: the contact close and footer. The page ends deeper.

### Ink

- **Ink** `oklch(0.95 0.010 100)`: headlines, body, the mark, primary button fill.
- **Ink Secondary** `oklch(0.77 0.018 115)`: supporting copy. Passes 4.5:1 on Ground.
- **Ink Faint** `oklch(0.63 0.020 120)`: meta only, never essential copy.
- **Line** ink at 16% / **Line Soft** at 8%: engraved hairline rules and tick strips.

### Signal

- **Amber** `oklch(0.82 0.140 76)` and **Amber Deep** `oklch(0.72 0.150 70)`.

### Named Rules

**The Calibration Rule.** Amber appears only where something is being measured or is changing state: strained net members, live readout values, active states of the instrument, an in-flight form submission. If it is static decoration, it cannot be amber. There is no other accent color, ever.

**The One Environment Rule.** No section leaves the olive housing. No white sections, no paper, no cream. Spatial contrast comes from Raised and Recessed tones plus engraved lines.

**The Toned Extremes Rule.** No pure #fff or #000 anywhere. Ink is warm light, grounds are warm dark.

## 3. Typography

- **Panchang** (600, display): wide, squared, machined. Display and section headlines only. Two levels, nothing smaller. Never in UI labels, never in long text. Sentence case.
- **Switzer** (400/500/600, body): calm Swiss neutral. All prose, UI labels, buttons, nav.
- **Martian Mono** (450, readouts): the instrument voice. Only for measured values, units, and status words inside readout contexts. Uppercase permitted here only. Never as section eyebrows, never as decorative labels.

Fonts are self-hosted woff2 (Fontshare: Panchang, Switzer; Google: Martian Mono). Subset to latin. `font-display: swap`, preload the two files used above the fold.

**The Readout Rule.** Mono text must be attached to a real value the page is actually computing or stating (load, deflection, status, year, location). If no value, no mono.

**The Two Shouts Rule.** Panchang appears at exactly two scales (display, headline). Everything else is Switzer. The page whispers except where it is rated to shout.

## 4. Surfaces, depth, and the machined language

- No shadows. No gradients. No blur (a single exception: sticky nav may use a subtle backdrop saturate/darken, no visible frost).
- Depth = tone steps between the three grounds + engraved hairlines (1px Line / Line Soft).
- **Chamfer**: interactive elements (buttons, the readout panel, form fields) get 7px 45° corner cuts via clip-path: the machined edge break. Non-interactive surfaces are square.
- **Tick strips**: short 1px calibration ticks may run along section boundaries only where they measure something real (e.g. scroll progress in nav, artifact scale). Decorative tick strips are banned.

## 5. The Mark: the Truss B

`assets/mark.svg` (master) and `assets/mark-small.svg` (thickened, for sizes at or under 24px). Stroke-drawn with currentColor: ink on ground, ground on ink surfaces. Never amber.

A lowercase-b/rune-adjacent form built from a mast and two triangulated bays: a letter that is also a load path. Clear space: half the mark's width on all sides. Lockup: mark at optical height ~1.18× the wordmark cap height, gap ~0.45× mark width, wordmark "Boomich" in Panchang 600, letter-spacing -0.01em, never customized.

Favicon: mark-small, ink on ground, in SVG + 32px PNG.

## 6. The Hero Instrument (signature component)

**The Net** is a full-bleed, fully braced lattice rendered behind the hero copy. Only its four corners are hard anchors; every other node, edges included, is free and held by a graded spring toward rest (stiffest near the supports, loosest in the middle), so the whole surface responds to load. The copy block rides the fabric: it follows the mean displacement of the nodes above it by a restrained, clamped amount, so the message reads as part of the structure without any literal attachment drawn. Members are 1px Ink, nodes are square.

- Physics: dependency-free verlet integration with one distance-constraint pass per frame, corner anchors plus graded rest springs, damping 0.985, and a bounded local displacement. It is deliberately compliant: the net must visibly deform before it recovers, at the borders as much as the center. Pure TypeScript physics is unit-tested.
- Interaction: pointer hover applies a local 30% field; a mouse drag, horizontal touch movement, or touch hold applies 100%. A vertical touch scroll still receives the 30% passing field and must keep normal page scrolling. The radius is 200px. The field couples pointer velocity at 1.2 and pulls position at 0.16.
- Status line: Switzer small in Ink Faint, directly below the CTAs. It says `Push anywhere. It holds.` (or `Press anywhere. It holds.` on touch devices), then crossfades to `Still holding.` while the net carries meaningful energy. It is the polite, throttled accessible state announcement; wording and crossfade communicate state, never amber.
- Amber rule: amber is reserved for strained members only, ramping from the 0.3 Ink member base toward Amber by `strain / 0.07`. The status line, buttons, and static lattice never use amber.
- Idle: a nearly imperceptible 0.05 wave keeps the unloaded net alive. Under reduced motion the settled net renders once, the copy does not translate, and no animation loop runs.
- Performance: DPR is capped at 2; rAF pauses offscreen and when the tab is hidden; resize refits are debounced; the frame path allocates no simulation buffers. The first settled canvas frame is painted before fonts finish loading.

## 7. Components

- **Buttons**: chamfered rectangles. Primary: Ink fill, Ground text; hover raises brightness a step and translates -1px; press returns. Ghost: 1px Line border, Ink text; hover border to Ink. Focus: 2px Ink outline offset 2px. Never amber.
- **Nav**: sticky, Ground at 92% opacity, hairline bottom rule appears on scroll. Mark + wordmark left. Links: Switzer 500, Ink Secondary to Ink. CTA: ghost button. Mobile: links collapse into a full-screen Ground overlay with display-scale links.
- **Spec rows** (capabilities, engagements): full-width engraved rows separated by Line. Row = title (Switzer 600) + description (Ink Secondary) + rated tags (small Switzer 500 chips with 1px Line border, square). Hover: Ground Raised field bleeds to full row width. No cards, no icons, no numbers.
- **Readout panel**: chamfered Ground Raised panel housing the instrument's live values.
- **Forms** (contact): chamfered fields, Ground Recessed wells, 1px Line borders, Ink text; focus ring per buttons. Submission in flight is a legitimate amber state.
- **Footer**: Ground Recessed, hairline top rule, colophon line, GitHub link, LDA registration line.
- **Figures**: engraved technical illustrations in capability rows. Use hairline ink strokes, with exactly one amber load element per figure: the subject being carried, measured, or transferred. Mono labels are permitted only for real semantics such as IN/OUT. Structure draws on reveal; one slow ambient load cycle may run while the figure is onscreen.

### Photography exception

Photography is banned except for the principal's real portrait in the Studio section. It is cropped tightly, duotoned into the Ground-to-Ink brand ramp, and framed with a 1px Line rule. Stock and generated imagery remain banned.

## 8. Motion

- UI: fast and dry. 160ms hovers, 420ms structural transitions, easing `cubic-bezier(0.16, 1, 0.3, 1)`. No bounce outside the physics artifact.
- Entrances: content is visible by default; reveals are enhancement only (translateY 14px + opacity, 500ms, staggered within a group, triggered on scroll intent). Never gate visibility on JS.
- The artifact owns all springy motion. UI chrome never bounces.
- Ambient motion is sanctioned only where it demonstrates the system it depicts: the Net's idle wave and each figure's load cycle. These cycles pause offscreen and all die under reduced motion.
- `prefers-reduced-motion: reduce`: all entrances instant, artifact static, no ambient cycle.

## 9. Do / Don't

### Do

- Keep amber scarce and semantic. One glance at the page should find it only where something moved or measured.
- Chamfer interactive corners; keep everything else square and flush.
- Separate sections with engraved hairlines and tone steps; vary rhythm with generous-then-tight spacing.
- Use real units and real values in readouts; clamp to the envelope honestly.
- Test the headline at 320px wide. Panchang is wide; copy must be short.

### Don't

- No second accent, no red, no gradient, no shadow, no glassmorphism, no cards, no icon set, no emoji.
- No mono eyebrows, no numbered section scaffolding, no uppercase outside readouts.
- No photography beyond the principal's treated Studio portrait, no decorative geometry, no fake precision (invented report IDs, fake coordinates, fake specs).
- No auto-looping decoration; ambient motion is permitted only for the Net's idle wave and figure load cycles, and dies under reduced motion.
- Never scale Panchang below the headline level; never use it for UI.
