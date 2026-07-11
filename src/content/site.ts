export const site = {
  name: 'Boomich',
  description: 'Senior engineering for the hard parts.',
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
} as const;
