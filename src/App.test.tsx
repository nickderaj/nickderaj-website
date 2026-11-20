import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import App from './App.tsx';
import { posts } from './lib/posts.ts';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routing', () => {
  it('renders the CV home page', () => {
    renderAt('/');
    expect(screen.getByRole('heading', { level: 1, name: 'Nick de Raj' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /recent writing/i })).toBeInTheDocument();
  });

  it('lists every Ceres post on /blog', () => {
    renderAt('/blog');
    expect(posts.length).toBeGreaterThanOrEqual(22);
    expect(screen.getByRole('heading', { name: 'Writing' })).toBeInTheDocument();
  });

  it('renders a post', () => {
    const first = posts[0];
    if (!first) {
      throw new Error('no posts loaded');
    }
    renderAt(`/blog/${first.slug}`);
    expect(screen.getByRole('heading', { level: 1, name: first.title })).toBeInTheDocument();
  });

  it('shows 404 for unknown posts', () => {
    renderAt('/blog/nope');
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });
});
