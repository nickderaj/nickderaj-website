import Carousel from '@/components/carousel/Carousel.tsx';
import { projects } from '@/content/projects/index.ts';
import type { ProjectBlock } from '@/types/content.ts';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Link, useParams } from 'react-router';

/**
 * The project detail view (PLAN §2.3), rendered at `/projects/:slug`. Looks the project up in
 * the content barrel; an unknown slug renders 404-ish content rather than throwing.
 */
export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((candidate) => candidate.slug === slug);

  if (!project) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-24">
        <p className="text-accent font-mono text-xs tracking-widest uppercase">404</p>
        <h1 className="text-text mt-2 text-3xl font-semibold">Project not found</h1>
        <p className="text-muted mt-4">
          {slug === undefined
            ? 'No project was specified.'
            : `There is no project with the slug “${slug}.”`}
        </p>
        <BackLink />
      </section>
    );
  }

  const parentProject = project.spunOutOf
    ? projects.find((candidate) => candidate.slug === project.spunOutOf)
    : undefined;

  return (
    <section className="bg-grid-paper mx-auto max-w-4xl px-6 py-24">
      <BackLink />

      <header className="mt-8 flex flex-col gap-3">
        <p className="text-muted font-mono text-xs tracking-widest uppercase">{project.period}</p>
        <h1 className="text-text text-4xl font-semibold">{project.title}</h1>
        <p className="text-text/90 text-lg leading-relaxed">{project.thesis}</p>

        {parentProject && (
          <p className="text-accent font-mono text-xs tracking-widest uppercase">
            Spun out of{' '}
            <Link to={`/projects/${parentProject.slug}`} className="underline underline-offset-2">
              {parentProject.title}
            </Link>
          </p>
        )}

        <ul className="mt-2 flex flex-wrap gap-2 font-mono text-xs" aria-label="Technologies">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="border-border text-muted rounded border px-2 py-0.5 tracking-wide uppercase"
            >
              {tag}
            </li>
          ))}
        </ul>

        {project.links.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-4" aria-label="Links">
            {project.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent inline-flex items-center gap-1 font-mono text-sm underline underline-offset-2"
                >
                  {link.label}
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      {project.screenshots.length > 0 && (
        <div className="mt-12">
          <Carousel screenshots={project.screenshots} label={project.title} />
        </div>
      )}

      <div className="mt-12 flex flex-col gap-6">
        {groupBodyBlocks(project.body).map((group, index) =>
          // Groups are derived from the static body array by position; index is a stable key.
          group.kind === 'stats' ? (
            <StatStrip key={index} stats={group.blocks} />
          ) : (
            <ProjectBlockView key={index} block={group.block} />
          ),
        )}
      </div>
    </section>
  );
}

type StatBlock = Extract<ProjectBlock, { kind: 'stat' }>;
type BodyGroup = { kind: 'single'; block: ProjectBlock } | { kind: 'stats'; blocks: StatBlock[] };

/**
 * Consecutive `stat` blocks are rendered together as one mono stat strip rather than as separate
 * full-width boxes - a stat strip is meant to be scanned in one glance.
 */
function groupBodyBlocks(blocks: ProjectBlock[]): BodyGroup[] {
  const groups: BodyGroup[] = [];
  for (const block of blocks) {
    if (block.kind === 'stat') {
      const last = groups.at(-1);
      if (last?.kind === 'stats') {
        last.blocks.push(block);
        continue;
      }
      groups.push({ kind: 'stats', blocks: [block] });
    } else {
      groups.push({ kind: 'single', block });
    }
  }
  return groups;
}

type StatStripProps = {
  stats: StatBlock[];
};

function StatStrip({ stats }: StatStripProps) {
  return (
    <dl className="flex flex-wrap gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="border-border flex min-w-40 flex-1 flex-col gap-1 rounded border px-4 py-3 font-mono"
        >
          <dt className="text-muted text-xs tracking-wide uppercase">{stat.label}</dt>
          <dd className="text-accent m-0 text-2xl">{stat.value}</dd>
          {stat.note !== undefined && <dd className="text-muted m-0 text-xs">{stat.note}</dd>}
        </div>
      ))}
    </dl>
  );
}

function BackLink() {
  return (
    <Link
      to="/#projects"
      className="text-muted hover:text-accent inline-flex items-center gap-1.5 font-mono text-sm tracking-wide uppercase transition-colors"
    >
      <ArrowLeft aria-hidden="true" size={14} />
      Back to projects
    </Link>
  );
}

type ProjectBlockViewProps = {
  block: ProjectBlock;
};

function ProjectBlockView({ block }: ProjectBlockViewProps) {
  switch (block.kind) {
    case 'heading': {
      const Heading = block.level === 2 ? 'h2' : 'h3';
      return (
        <Heading
          className={
            block.level === 2
              ? 'text-text text-2xl font-semibold'
              : 'text-text text-xl font-semibold'
          }
        >
          {block.text}
        </Heading>
      );
    }
    case 'paragraph':
      return <p className="text-text/90 leading-relaxed">{block.text}</p>;
    case 'list': {
      const ListTag = block.ordered === true ? 'ol' : 'ul';
      return (
        <ListTag
          className={`text-text/90 flex flex-col gap-2 pl-5 leading-relaxed ${
            block.ordered === true ? 'list-decimal' : 'list-disc'
          }`}
        >
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      );
    }
    case 'stat':
      return (
        <div className="border-border flex flex-col gap-1 rounded border px-4 py-3 font-mono">
          <span className="text-muted text-xs tracking-wide uppercase">{block.label}</span>
          <span className="text-accent text-2xl">{block.value}</span>
          {block.note !== undefined && <span className="text-muted text-xs">{block.note}</span>}
        </div>
      );
    default: {
      const exhaustiveCheck: never = block;
      return exhaustiveCheck;
    }
  }
}
