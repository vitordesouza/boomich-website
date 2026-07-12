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
    instrumentCaption: 'Cantilever test article. Drag the load hook.',
  },
  capabilities: {
    heading: 'What we build',
    items: [
      {
        title: 'Cross-platform mobile',
        body: 'React Native and Expo apps that hold up in production. Background tasks, session state, native modules where JS abstractions break.',
        tags: ['React Native', 'Expo', 'iOS + Android'],
      },
      {
        title: 'Realtime and AI systems',
        body: 'Streaming pipelines, WebSockets, transcription, AI provider integrations under production load. Built around explicit state machines so failure modes are visible.',
        tags: ['WebSockets', 'Streaming audio', 'Provider fallbacks'],
      },
      {
        title: 'Frontend architecture',
        body: "Greenfield architecture, legacy migrations, monorepo setup, team conventions. The work that determines whether your codebase ages well or doesn't.",
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
      },
      {
        domain: 'Enterprise · Scale',
        statement:
          'Workforce optimization platform used by major airlines and global retailers',
      },
      {
        domain: 'Compliance · Global',
        statement: 'B2B compliance platform scaled across 90 countries',
      },
    ],
    footnote:
      'Engagements anonymized under NDA. Stated as domain and scale; the work speaks for itself.',
  },
  studio: {
    heading: 'Built by someone who ships',
    lead: 'Boomich is the independent studio of João Vitor de Souza, a senior TypeScript engineer based in Caldas da Rainha, Portugal.',
    detail:
      'Thirteen years shipping production-grade web and mobile products across startups, scale-ups, and enterprise. Currently leading frontend on a healthcare AI app running in live clinical environments: owning the realtime audio pipeline, session lifecycle, and the recovery flows that keep it working through the messy realities of mobile use.',
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
    readout: 'EST 2026 · CALDAS DA RAINHA, PT',
  },
  contact: {
    heading: 'Bring us the hard part.',
    body: "Realtime state, cross-platform behavior, AI integration, architecture debt. Send the context. We'll tell you what is tractable.",
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
