import ProjectCard from '@/components/projects/ProjectCard.tsx';
import { projects } from '@/content/projects/index.ts';
import { Fragment } from 'react';

/**
 * The projects grid (PLAN §2.3). Uses `repeat(auto-fit, minmax(...))` so a fourth project drops
 * in with no layout work — it is purely a function of `src/content/projects`.
 *
 * The lineage between `quant-trading-labs` and `commodity-stat-arb` (`spunOutOf`) is drawn as an
 * explicit full-width connector row between their cards, rather than encoded only in prose — it
 * is plain mono text plus a rule, so it degrades to readable text at every breakpoint including
 * mobile.
 */
export default function Projects() {
  return (
    <section id="projects" className="bg-grid-paper mx-auto max-w-6xl px-6 py-24">
      <header className="mb-12 flex flex-col gap-2">
        <p className="text-accent font-mono text-xs tracking-widest uppercase">Projects</p>
        <h2 className="text-text text-3xl font-semibold">
          Research, the strategy it produced, and the public record
        </h2>
      </header>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
        {projects.map((project, index) => {
          const nextProject = projects[index + 1];

          return (
            <Fragment key={project.id}>
              <ProjectCard project={project} />
              {nextProject?.spunOutOf === project.slug && (
                <ProjectLineageConnector fromTitle={project.title} toTitle={nextProject.title} />
              )}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}

type ProjectLineageConnectorProps = {
  fromTitle: string;
  toTitle: string;
};

/**
 * A full-width row inserted between two grid cards, drawing an explicit connection between a
 * project and the one spun out of it. Being a full-width text-plus-rule element, it reads
 * identically (and correctly) at every breakpoint — no separate mobile fallback is needed.
 */
function ProjectLineageConnector({ fromTitle, toTitle }: ProjectLineageConnectorProps) {
  return (
    <div
      className="text-accent col-span-full flex items-center gap-3 py-1 font-mono text-xs tracking-widest uppercase"
      aria-hidden="false"
    >
      <span className="bg-border h-px flex-1" />
      <span>
        {toTitle} spun out of {fromTitle} →
      </span>
      <span className="bg-border h-px flex-1" />
    </div>
  );
}
