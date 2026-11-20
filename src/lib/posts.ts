export type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readTime: number;
  content: string;
};

const files = import.meta.glob<string>('/src/content/posts/*/index.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function stripQuotes(value: string): string {
  return value.replace(/^["']|["']$/g, '');
}

function parse(path: string, raw: string): Post {
  const slug = /\/posts\/([^/]+)\/index\.md$/.exec(path)?.[1] ?? path;
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw);
  const meta: Record<string, string> = {};
  const content = (match?.[2] ?? raw).trim();
  for (const line of (match?.[1] ?? '').split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) {
      meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  const tags = (meta.tags ?? '')
    .replace(/[[\]]/g, '')
    .split(',')
    .map((tag) => stripQuotes(tag.trim()))
    .filter(Boolean);
  const words = content.split(/\s+/).length;
  return {
    slug,
    title: stripQuotes(meta.title ?? slug),
    date: stripQuotes(meta.date ?? ''),
    description: stripQuotes(meta.description ?? ''),
    tags,
    readTime: Math.max(1, Math.round(words / 220)),
    content,
  };
}

export const posts: Post[] = Object.entries(files)
  .map(([path, raw]) => parse(path, raw))
  .sort((a, b) => b.date.localeCompare(a.date));

export const getPost = (slug: string): Post | undefined => posts.find((p) => p.slug === slug);

export const allTags: string[] = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

export const formatDate = (date: string): string =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
