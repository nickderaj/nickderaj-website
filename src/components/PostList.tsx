import { formatDate, type Post } from '@/lib/posts.ts';
import { Link } from 'react-router';

export function PostList({ posts }: { posts: Post[] }) {
  return (
    <ul className="divide-border border-border divide-y border-y">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link to={`/blog/${p.slug}`} className="group block py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="group-hover:text-primary font-medium">{p.title}</h3>
              <span className="text-muted-foreground font-mono text-xs">
                {formatDate(p.date)} · {p.readTime} min
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{p.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="border-border text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[11px]"
                >
                  {t}
                </span>
              ))}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
