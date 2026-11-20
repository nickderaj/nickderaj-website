import { career } from '@/content/career.ts';
import { projects } from '@/content/projects/index.ts';

export const GROUPS = ['Languages', 'Quant & Data', 'Infra'] as const;
export type Group = (typeof GROUPS)[number];

/**
 * Small typed map from a normalized skill/tag name to its display group. This is the only
 * hand-authored list here - the *set* of skills themselves is derived from `career.ts` stacks and
 * project tags below, not duplicated. A skill absent from this map (e.g. Gryphon's "Forward
 * contracting" or Ceres's "Print-to-PDF" - domain experience and project features, not tools)
 * is silently dropped rather than mis-bucketed.
 */
const SKILL_CATEGORY: Record<string, Group> = {
  Java: 'Languages',
  TypeScript: 'Languages',
  Solidity: 'Languages',
  Python: 'Languages',

  Kafka: 'Quant & Data',
  Elasticsearch: 'Quant & Data',
  PostgreSQL: 'Quant & Data',
  Statistics: 'Quant & Data',
  'Risk Management': 'Quant & Data',
  'Deflated Sharpe': 'Quant & Data',
  GARCH: 'Quant & Data',
  EVT: 'Quant & Data',
  Cointegration: 'Quant & Data',
  Databento: 'Quant & Data',
  'Plotly Dash': 'Quant & Data',

  NestJS: 'Infra',
  'React Native': 'Infra',
  'Node.js': 'Infra',
  GCP: 'Infra',
  'Next.js': 'Infra',
  'Ruby on Rails': 'Infra',
  AWS: 'Infra',
  React: 'Infra',
  Vite: 'Infra',
  MDX: 'Infra',
  Docker: 'Infra',
  Alembic: 'Infra',
  uv: 'Infra',
  ruff: 'Infra',
  mypy: 'Infra',
  pytest: 'Infra',
};

/** Strips a trailing version number, e.g. "Python 3.11" / "PostgreSQL 16" -> "Python" / "PostgreSQL". */
function normalizeSkillName(rawName: string): string {
  return rawName.replace(/\s+v?\d[\d.]*$/i, '').trim();
}

function collectSkillNames(): string[] {
  const names = new Set<string>();
  for (const entry of career) {
    for (const stackItem of entry.stack) {
      names.add(normalizeSkillName(stackItem));
    }
  }
  for (const project of projects) {
    for (const tag of project.tags) {
      names.add(normalizeSkillName(tag));
    }
  }
  return [...names];
}

export function deriveToolkitGroups(): Record<Group, string[]> {
  const groups: Record<Group, string[]> = { Languages: [], 'Quant & Data': [], Infra: [] };
  for (const name of collectSkillNames()) {
    const category = SKILL_CATEGORY[name];
    if (category !== undefined) {
      groups[category].push(name);
    }
  }
  for (const group of GROUPS) {
    groups[group].sort((a, b) => a.localeCompare(b));
  }
  return groups;
}
