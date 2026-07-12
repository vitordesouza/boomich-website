export const site = {
  name: 'Boomich',
  description: 'Senior engineering for the hard parts.',
  metaDescription:
    'Independent software studio. Senior engineering for the hard parts: realtime systems, cross-platform mobile, applied AI.',
  navigation: [
    { label: 'What we build', href: '#capabilities' },
    { label: 'Shipped', href: '#work' },
    { label: 'Studio', href: '#studio' },
    { label: 'Contact', href: '#contact' },
  ],
  navCta: { label: "Tell us what you're building", href: '#contact' },
  hero: {
    title: 'Senior engineering for the hard parts.',
    summary:
      'Realtime product systems, cross-platform mobile, applied AI. For teams carrying complexity they cannot ship around.',
    primaryCta: { label: "Tell us what you're building", href: '#contact' },
    secondaryCta: { label: 'What we build', href: '#capabilities' },
    restingStatus: 'Push anywhere. It holds.',
    loadControlLabel: 'Load the structure',
  },
  capabilities: {
    heading: 'What we build',
    items: [
      {
        title: 'Cross-platform mobile',
        body: 'React Native and Expo apps that hold up in production. Background audio, session state, native Kotlin and Swift where JS abstractions break.',
        tags: ['React Native', 'Expo', 'iOS + Android'],
      },
      {
        title: 'Realtime and AI systems',
        body: 'Streaming and transcription pipelines that survive hours-long sessions, backgrounding, and network loss. Explicit state machines, so the system reasons about failure instead of experiencing it.',
        tags: ['WebSockets', 'Streaming audio', 'Provider fallbacks'],
      },
      {
        title: 'Frontend architecture',
        body: 'Greenfield architecture, legacy migrations, monorepo structure, team conventions. Every significant decision documented with its trade-offs and defended in writing.',
        tags: ['TypeScript', 'React / Next.js', 'Tooling'],
      },
    ],
  },
  work: {
    heading: "Where we've shipped",
    items: [
      {
        domain: 'Healthcare · Realtime',
        statement: 'Healthcare AI app running in live clinical environments',
        detail:
          'Sole senior engineer owning the technical direction of both mobile platforms: the realtime audio pipeline, and a session lifecycle that survives hours-long recordings through backgrounding and network loss.',
      },
      {
        domain: 'Enterprise · Scale',
        statement:
          'Workforce optimization platform used by major airlines and global retailers',
        detail:
          'Shift optimization under labor law, union agreements, and operational constraints. Owned the rebuild of the configuration surface that feeds the optimization engine.',
      },
      {
        domain: 'Compliance · Global',
        statement: 'B2B compliance platform scaled across 90 countries',
        detail:
          'Authored the greenfield frontend architecture end to end: framework, API contract, testing, and internationalization with RTL as a day-one constraint.',
      },
    ],
    footnote:
      'Engagements anonymized under NDA. Stated as domain and scale; the work speaks for itself.',
  },
  studio: {
    heading: 'Built by someone who ships',
    lead: 'Boomich is the independent studio of João Vitor de Souza, a senior TypeScript engineer based in Caldas da Rainha, Portugal.',
    detail:
      'Thirteen years shipping production web and mobile across startups, scale-ups, and enterprise. Most recently the sole senior engineer directing a healthcare AI mobile platform: architecture, team direction, AI integrations, and a realtime pipeline where reliability is not optional.',
    second:
      'Boomich works where complexity is the product: realtime state, cross-platform behavior, mobile lifecycle, AI integrations, multi-team coordination.',
    stack: [
      {
        label: 'Primary',
        tags: ['TypeScript', 'React Native / Expo', 'React / Next.js'],
      },
      {
        label: 'Secondary',
        tags: ['Vue', 'Nuxt', 'Node', 'Express', 'Hono', 'PHP'],
      },
      {
        label: 'Supporting',
        tags: ['Vercel', 'Convex', 'AWS', 'Azure', 'Firebase', 'Supabase'],
      },
    ],
    readout: 'EST 2026 · CALDAS DA RAINHA, PT · REMOTE, UTC±1',
  },
  contact: {
    heading: 'Bring us the hard part.',
    body: "Realtime state, cross-platform behavior, AI integration, architecture debt. Send the context. We'll tell you what is tractable.",
    capacity: { label: 'CAPACITY', value: 'OPEN' },
    email: 'joaovitor@boomich.pt',
    copyLabel: 'Copy address',
    copiedLabel: 'Copied',
    primaryCta: {
      label: "Tell us what you're building",
      href: 'mailto:joaovitor@boomich.pt?subject=Project%20inquiry',
    },
  },
  footer: {
    registration: 'Boomich LDA · Caldas da Rainha, Portugal',
    source: { label: 'Source on GitHub', href: 'https://github.com/boomich' },
    backToTop: { label: 'Back to top', href: '#top' },
    colophon:
      'Designed and built as one system. Astro, TypeScript, hand-rolled physics. No templates.',
  },
  notFound: {
    heading: 'Nothing at this address.',
    body: 'The load path ends here. Head back to solid ground.',
    cta: { label: 'Back to the studio', href: '/' },
  },
} as const;
