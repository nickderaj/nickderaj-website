import type { Project } from '@/types/content.ts';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export type ProjectCardProps = {
  project: Project;
};

/**
 * A single project grid card (PLAN §2.3). Restrained — hover state is a subtle border/accent
 * shift, no lift-and-shadow theatrics. The whole card is one link to the detail view.
 */
export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group border-border hover:border-accent focus-visible:outline-accent bg-surface flex h-full flex-col justify-between gap-4 rounded border p-6 no-underline transition-colors"
    >
      <div className="flex flex-col gap-3">
        <div className="text-muted flex items-baseline justify-between gap-3 font-mono text-xs">
          <span>{project.period}</span>
        </div>
        <h3 className="group-hover:text-accent text-text text-xl font-semibold transition-colors">
          {project.title}
        </h3>
        <p className="text-text/90 text-sm leading-relaxed">{project.thesis}</p>
      </div>

      <div className="flex flex-col gap-3">
        <ul className="flex flex-wrap gap-2 font-mono text-xs" aria-label="Technologies">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="border-border text-muted rounded border px-2 py-0.5 uppercase tracking-wide"
            >
              {tag}
            </li>
          ))}
        </ul>

        <span className="text-accent inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wide">
          View project
          <ArrowRight aria-hidden="true" size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
