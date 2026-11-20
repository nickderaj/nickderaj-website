import { Markdown } from '@/components/blog/Markdown.tsx';
import { formatDate, getPost } from '@/lib/posts.ts';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';
import NotFound from './NotFound.tsx';
import { useDocumentMeta } from './useDocumentMeta.ts';

export default function BlogPost() {
  const { slug = '' } = useParams();
  const post = getPost(slug);
  useDocumentMeta(post ? `${post.title} — Nick de Raj` : 'Post not found', post?.description ?? '');

  if (!post) {
    return <NotFound />;
  }

  return (
    <main id="main" className="mx-auto max-w-3xl px-6 pt-12">
      <Link
        to="/blog"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono text-xs"
      >
        <ArrowLeft className="h-3 w-3" /> blog
      </Link>
      <header className="border-border mt-8 border-b pb-8">
        <div className="text-muted-foreground font-mono text-xs">
          {formatDate(post.date)} · {post.readTime} min read
        </div>
        <h1 className="mt-3 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <p className="text-muted-foreground mt-3">{post.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span
              key={t}
              className="border-border text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-[11px]"
            >
              {t}
            </span>
          ))}
        </div>
      </header>
      <article className="prose mt-8">
        <Markdown content={post.content} postSlug={post.slug} />
      </article>
    </main>
  );
}
