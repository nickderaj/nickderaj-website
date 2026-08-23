import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { career } from '@/content/career.ts';
import { projects } from '@/content/projects/index.ts';
import Toolkit from './Toolkit.tsx';

describe('Toolkit', () => {
  it('renders skills pulled from career.ts stacks, not a hardcoded second list', () => {
    render(<Toolkit />);

    // Kafka only ever appears in career.ts (the Goldman Sachs stack) — if it renders, the
    // section is reading from content rather than from a separately hand-typed skill list.
    expect(screen.getByText('Kafka')).toBeInTheDocument();
    expect(screen.getByText('Solidity')).toBeInTheDocument();
  });

  it('renders tags pulled from project content', () => {
    render(<Toolkit />);
    expect(screen.getByText('GARCH')).toBeInTheDocument();
    expect(screen.getByText('Cointegration')).toBeInTheDocument();
  });

  it('dedupes a skill that appears in multiple career entries', () => {
    render(<Toolkit />);
    // TypeScript appears in both the Tokka Labs and Supa stacks in career.ts.
    expect(career.some((entry) => (entry.stack as readonly string[]).includes('TypeScript'))).toBe(
      true,
    );
    expect(screen.getAllByText('TypeScript')).toHaveLength(1);
  });

  it('normalizes a versioned tag to the same entry as its unversioned form elsewhere', () => {
    render(<Toolkit />);
    // "Python" (quant-trading-labs) and "Python 3.11" (commodity-stat-arb) must collapse to one.
    const hasVersionedPython = projects.some((project) => project.tags.includes('Python 3.11'));
    expect(hasVersionedPython).toBe(true);
    expect(screen.getAllByText('Python')).toHaveLength(1);
    expect(screen.queryByText('Python 3.11')).not.toBeInTheDocument();
  });

  it('excludes non-tool career/project entries entirely', () => {
    render(<Toolkit />);
    expect(screen.queryByText(/Physical commodity trading/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Forward contracting/i)).not.toBeInTheDocument();
  });

  it('never renders a star rating or percentage bar', () => {
    const { container } = render(<Toolkit />);
    expect(container.textContent).not.toMatch(/★|%/);
    expect(container.querySelector('progress')).toBeNull();
  });
});
