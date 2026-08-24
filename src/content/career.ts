import type { CareerEntry } from '@/types/content.ts';

/**
 * Single source of truth for the career timeline (PLAN §4, §10). The chart, the role cards, the
 * command palette, the print CV, and `/data` all derive from this array. Adding a job means
 * editing this file only. Sorted most-recent-first.
 */
export const career = [
  {
    id: 'gs',
    start: '2024-05',
    end: 'present',
    role: 'Full Stack Developer',
    org: 'Goldman Sachs',
    location: 'London, UK',
    kind: 'work',
    regime: 'quant',
    scope: 0.95,
    stack: ['Java', 'Kafka', 'Elasticsearch', 'PostgreSQL'],
    teamSize: 4,
    summary:
      'Built AI-driven document processing for client onboarding and led a real-time ETL pipeline moving trade flow onto low-latency, scalable infrastructure.',
    highlights: [
      'Automated field extraction and validation against corporate documents, cutting manual review time in client onboarding',
      'Led 4 engineers building a real-time ETL pipeline moving flows from Postgres into Kafka and Elasticsearch',
      'Used Claude Code to build automated agent skills that fix code quality across all 40 repos in our stack continuously in parallel.',
    ],
  },
  {
    id: 'tokka',
    start: '2024-01',
    end: '2024-04',
    role: 'Quant Developer',
    org: 'Tokka Labs',
    location: 'Singapore',
    kind: 'work',
    regime: 'quant',
    scope: 0.8,
    stack: ['TypeScript', 'NestJS', 'Solidity'],
    summary:
      'Built a crypto market maker from scratch, publishing orderbooks to aggregated on-chain venues across major and small-cap tokens. The closest role to a trading seat on the CV.',
    highlights: [
      'Took a microservice monorepo market maker from zero to live in 2 months',
      'First mainnet trade shipped within the build window, quoting BTC, ETH, SOL and small-cap tokens on Uniswap and other aggregated venues',
      'Scaled to 30+ tokens and millions of dollars in volume within the following month',
    ],
  },
  {
    id: 'cake',
    start: '2023-09',
    end: '2023-12',
    role: 'Full Stack Developer',
    org: 'Cake DeFi',
    location: 'Singapore',
    kind: 'work',
    regime: 'software',
    scope: 0.65,
    stack: ['Solidity'],
    summary:
      'Led an ERC-1167 minimal-proxy rewrite of the multi-sig wallet business across five EVM chains.',
    highlights: [
      'Shipped ERC-1167 minimal-proxy wallets across Ethereum, Polygon, Avalanche, Tron and others',
      'Cut per-wallet deployment cost by roughly 60%',
    ],
  },
  {
    id: 'ethlas',
    start: '2022-09',
    end: '2023-09',
    role: 'Tech Lead',
    org: 'Ethlas',
    location: 'Singapore',
    kind: 'work',
    regime: 'software',
    scope: 0.85,
    stack: ['React Native', 'Node.js', 'GCP'],
    summary:
      'Led engineering, product and design to take a mobile game from build to scaled production launch.',
    highlights: [
      'Shipped to 100k users in under 3 months of launch',
      'Released simultaneously on iOS and Google Play',
      'Owned the engineering roadmap while coordinating directly with PM and design',
    ],
  },
  {
    id: 'supa',
    start: '2021-08',
    end: '2022-09',
    role: 'Full Stack Developer',
    org: 'Supa',
    location: 'Malaysia',
    kind: 'work',
    regime: 'software',
    scope: 0.55,
    stack: ['Next.js', 'TypeScript', 'Ruby on Rails', 'AWS'],
    summary:
      'Built Next.js/TypeScript applications from scratch to production against serverless Node and Rails microservices powering ML data-labelling ingestion.',
    highlights: [
      'Shipped multiple production apps end-to-end against serverless Node and Rails services on AWS',
      'Supported data-labelling pipelines feeding ML ingestion',
    ],
  },
  {
    id: 'gryphon',
    start: '2017-04',
    end: '2020-09',
    role: 'Deputy CEO',
    org: 'Gryphon Energy',
    location: 'Malaysia',
    kind: 'work',
    regime: 'commodities',
    scope: 0.9,
    stack: ['Physical commodity trading', 'Forward contracting', 'P&L ownership'],
    summary:
      'Ran the German Power Division (Gaea Power GmbH, co-founded then folded into the group): P&L and operations for eight palm-oil CHP units, plus physical palm-oil procurement on forward contracts.',
    highlights: [
      'Owned P&L and O&M for 8 palm-oil combined-heat-and-power units supplying heat to greenhouses and power to the grid',
      'Locked physical palm oil on forward contracts and took delivery into the plants, managing fuel cost against heat and power offtake',
      'Supported the wider group’s oil & gas asset-leasing book',
    ],
  },
  {
    id: 'bristol',
    start: '2013-09',
    end: '2016-06',
    role: 'BSc Economics & Maths (2:1 Hons)',
    org: 'University of Bristol',
    location: 'Bristol, UK',
    kind: 'education',
    regime: null,
    scope: 0.4,
    stack: [],
    summary: 'BSc Economics and Mathematics, 2:1 Honours.',
    highlights: [],
  },
] as const satisfies CareerEntry[];
