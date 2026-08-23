import { projects } from '@/content/projects/index.ts';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import ProjectDetail from './ProjectDetail.tsx';

function renderAtSlug(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/projects/${slug}`]}>
      <Routes>
        <Route path="/projects/:slug" element={<ProjectDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProjectDetail', () => {
  it('renders the matching project for a known slug', () => {
    const [firstProject] = projects;
    if (!firstProject) {
      throw new Error('Expected at least one project in the content barrel.');
    }

    renderAtSlug(firstProject.slug);

    expect(screen.getByRole('heading', { level: 1, name: firstProject.title })).toBeInTheDocument();
    expect(screen.getByText(firstProject.thesis)).toBeInTheDocument();
  });

  it('renders 404-ish content instead of throwing for an unknown slug', () => {
    renderAtSlug('this-project-does-not-exist');

    expect(screen.getByText('Project not found')).toBeInTheDocument();
    expect(screen.getByText(/this-project-does-not-exist/)).toBeInTheDocument();
  });

  it('links the spun-out project back to the project it came from', () => {
    const child = projects.find((project) => project.spunOutOf !== undefined);
    if (!child?.spunOutOf) {
      throw new Error('Expected a project with spunOutOf set in the content barrel.');
    }
    const parent = projects.find((project) => project.slug === child.spunOutOf);
    if (!parent) {
      throw new Error('Expected the spunOutOf slug to resolve to a real project.');
    }

    renderAtSlug(child.slug);

    expect(screen.getByRole('link', { name: parent.title })).toHaveAttribute(
      'href',
      `/projects/${parent.slug}`,
    );
  });
});
