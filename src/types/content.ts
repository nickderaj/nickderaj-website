/**
 * Content contracts (PLAN §4). These are the single source of truth for the timeline chart,
 * role cards, project grid/detail views, the print CV, and the `/data` route - every downstream
 * consumer derives from these shapes rather than duplicating data.
 */

/** One role, degree, or milestone plotted on the career chart. */
export type CareerEntry = {
  id: string;
  /** ISO 'YYYY-MM' */
  start: string;
  end: string | 'present';
  role: string;
  org: string;
  location: string;
  kind: 'work' | 'education' | 'milestone';
  /** Drives the chart's background regime bands (PLAN §1.3 item 1). Non-career entries use null. */
  regime: 'commodities' | 'software' | 'quant' | null;
  /** 0–1. Drives marker radius only - never a plotted axis value (PLAN §1.1). */
  scope: number;
  stack: string[];
  teamSize?: number;
  summary: string;
  /** Outcome lines, numbers preferred. */
  highlights: string[];
  links?: { label: string; href: string }[];
};

export type ProjectLink = {
  label: string;
  href: string;
};

export type ProjectScreenshot = {
  src: string;
  alt: string;
  caption?: string;
};

/**
 * Structured content blocks for a project write-up. No MDX - content is rendered from typed
 * data so the whole write-up can be introspected (e.g. for the print stylesheet or `/data`).
 */
export type ProjectBlock =
  | { kind: 'heading'; level: 2 | 3; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[]; ordered?: boolean }
  | { kind: 'stat'; label: string; value: string; note?: string };

export type Project = {
  id: string;
  slug: string;
  title: string;
  /** One line. */
  thesis: string;
  period: string;
  tags: string[];
  links: ProjectLink[];
  screenshots: ProjectScreenshot[];
  body: ProjectBlock[];
  /** Slug of the project this one was spun out of, if any (PLAN §2.3). */
  spunOutOf?: string;
};
