import type { Project } from '@/types/content.ts';

export const ceres = {
  id: 'ceres',
  slug: 'ceres',
  title: 'Ceres — technical blog',
  thesis:
    'A personal blog documenting topics I’m learning, in public, for as long as I keep learning them.',
  period: '2023 — present',
  tags: ['React', 'Vite', 'MDX', 'Interactive visuals', 'Print-to-PDF'],
  links: [{ label: 'Site', href: 'https://ceres.my' }],
  screenshots: [
    {
      src: '/screenshots/ceres/maths-post.png',
      alt: 'A Ceres blog post on partial derivatives and multiple integrals, showing a rendered mathematical derivation alongside an interactive plot.',
      caption: 'A first-principles maths post with a rendered derivation and interactive plot.',
    },
    {
      src: '/screenshots/ceres/interactive-map.png',
      alt: 'An interactive map on Ceres showing global precious-metals or oil-reserve data by region, with hover tooltips.',
      caption: 'One of the interactive precious-metals / oil-reserve maps.',
    },
  ],
  body: [
    { kind: 'heading', level: 2, text: 'Problem' },
    {
      kind: 'paragraph',
      text: 'Self-directed study is easy to claim and hard to evidence. I wanted a public, dated record of what I was actually learning — quant mathematics from first principles, markets, and engineering — that would hold up to someone actually reading it, not just listing it on a CV.',
    },
    { kind: 'heading', level: 2, text: 'Approach' },
    {
      kind: 'paragraph',
      text: 'Built and self-hosted with React and Vite, with an MDX-style content directory so a new post is a new file, not a new deploy pipeline. Posts are long-form and include interactive visuals where a static image would undersell the idea — plots you can perturb, maps you can hover, derivations you can step through.',
    },
    {
      kind: 'list',
      items: [
        'Quant maths from first principles: limits and derivatives, integration, partial derivatives and multiple integrals, ODEs, root-finding, probability, combinatorial analysis',
        'Markets: mean-reversion pairs trading, commodity price analysis, moving averages, MACD, derivatives fundamentals, strategy surveys, interactive precious-metals and oil-reserve maps',
        'Engineering: Java virtual threads, building micrograd from zero, a Python conversion course',
      ],
    },
    { kind: 'heading', level: 2, text: 'Result' },
    {
      kind: 'paragraph',
      text: 'Around 19 long-form posts published across three strands, each with working interactive components and a print-to-PDF path for offline reading. It is the clearest evidence on the CV that the quant-maths and markets material in the other two projects is not a one-off — it is a sustained habit with a public paper trail.',
    },
    { kind: 'stat', label: 'Posts published', value: '~19', note: '2023–present' },
    { kind: 'stat', label: 'Content strands', value: '3', note: 'maths · markets · engineering' },
    { kind: 'heading', level: 2, text: "What I'd change" },
    {
      kind: 'paragraph',
      text: 'The content pipeline is hand-rolled and has drifted slightly from this site’s own typed-content approach — worth unifying so a post’s interactive components and this site’s project write-ups share one rendering model instead of two.',
    },
  ],
} as const satisfies Project;
