import type { Project } from '@/types/content.ts';

export const ceres = {
  id: 'ceres',
  slug: 'ceres',
  title: 'Ceres - technical blog',
  thesis:
    'A personal blog documenting topics I’m learning, in public, for as long as I keep learning them.',
  period: '2023 - present',
  tags: ['React', 'Vite', 'MDX', 'Interactive visuals', 'Print-to-PDF'],
  links: [{ label: 'Site', href: 'https://ceres.my' }],
  screenshots: [
    {
      src: '/screenshots/ceres/maths-post.png',
      alt: 'A Ceres post on derivatives fundamentals, showing rendered payoff formulas comparing a forward against a call option.',
      caption: 'Derivatives fundamentals, with rendered payoff maths.',
    },
    {
      src: '/screenshots/ceres/interactive-map.png',
      alt: 'The Ceres world precious-metals reserves map: a choropleth of gold reserves by country with active-mine markers, a metal picker for gold, silver, palladium, platinum, ruthenium and iridium, and a reserves legend.',
      caption: 'The interactive world precious-metals reserves map.',
    },
  ],
  body: [
    { kind: 'heading', level: 2, text: 'Problem' },
    {
      kind: 'paragraph',
      text: 'Self-directed study is easy to claim and hard to evidence. I wanted a public, dated record of what I was actually learning - quant mathematics from first principles, markets, and engineering - that would hold up to someone actually reading it, not just listing it on a CV.',
    },
    { kind: 'heading', level: 2, text: 'Approach' },
    {
      kind: 'paragraph',
      text: 'Built and self-hosted with React and Vite, with an MDX-style content directory so a new post is a new file, not a new deploy pipeline. Posts are long-form and include interactive visuals where a static image would undersell the idea - plots you can perturb, maps you can hover, derivations you can step through.',
    },
    {
      kind: 'list',
      items: [
        'Quant maths from first principles: limits and derivatives, integration, partial derivatives and multiple integrals, ODEs, root-finding, probability, combinatorial analysis',
        'Markets: mean-reversion pairs trading, commodity price analysis, moving averages, MACD, derivatives fundamentals, strategy surveys, interactive precious-metals and oil-reserve maps',
        'Engineering: Java virtual threads, building micrograd from zero, a Python conversion course',
      ],
    },
  ],
} as const satisfies Project;
