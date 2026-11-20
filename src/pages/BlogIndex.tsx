import { PostList } from '@/components/PostList.tsx';
import { allTags, posts } from '@/lib/posts.ts';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useDocumentMeta } from './useDocumentMeta.ts';

const DESCRIPTION =
  'Notes on quantitative finance, commodities, mathematics and software engineering.';

export default function BlogIndex() {
  useDocumentMeta('Blog — Nick de Raj', DESCRIPTION);
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const filtered = posts.filter(
    (p) =>
      (!tag || p.tags.includes(tag)) &&
      (!query || (p.title + p.description).toLowerCase().includes(query.toLowerCase())),
  );
  const chip = (active: boolean) =>
    `rounded-md border px-2.5 py-1 font-mono text-xs transition-colors ${active ? 'border-primary text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`;

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 pt-16">
      <h1 className="text-3xl font-semibold tracking-tight">Writing</h1>
      <p className="text-muted-foreground mt-2">{DESCRIPTION}</p>
      <div className="relative mt-8">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder="Search posts…"
          aria-label="Search posts"
          className="border-border focus:border-primary w-full rounded-md border bg-transparent py-2 pr-3 pl-9 text-sm outline-none"
        />
      </div>
      <div className="mt-4 mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          className={chip(!tag)}
          onClick={() => {
            setTag(null);
          }}
        >
          All
        </button>
        {allTags.map((t) => (
          <button
            key={t}
            type="button"
            className={chip(tag === t)}
            onClick={() => {
              setTag(t);
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {filtered.length ? (
        <PostList posts={filtered} />
      ) : (
        <p className="text-muted-foreground text-sm">No posts match.</p>
      )}
    </main>
  );
}
