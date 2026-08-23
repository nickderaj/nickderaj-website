import { Footer } from '@/components/layout/Footer.tsx';
import { Header } from '@/components/layout/Header.tsx';
import Contact from '@/sections/Contact.tsx';
import DataPage from '@/sections/DataPage.tsx';
import Hero from '@/sections/Hero.tsx';
import ProjectDetail from '@/sections/ProjectDetail.tsx';
import Projects from '@/sections/Projects.tsx';
import Timeline from '@/sections/Timeline.tsx';
import Toolkit from '@/sections/Toolkit.tsx';
import { useEffect } from 'react';
import { Link, NavigationType, Route, Routes, useLocation, useNavigationType } from 'react-router';

/**
 * Scroll behaviour for the router (task 2): a same-document `<Link>` navigation with a hash
 * (e.g. the project-detail back link to `/#projects`) scrolls that section into view once the
 * destination route has rendered; a navigation to a fresh path with no hash (e.g. opening a
 * project detail page) starts at the top. Back/forward (`POP`) navigation is left to the browser's
 * own scroll restoration rather than fought — it already does the right thing for same-document
 * history entries.
 */
function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1);
      const frame = window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    if (navigationType !== NavigationType.Pop) {
      window.scrollTo(0, 0);
    }
    return undefined;
  }, [location.pathname, location.hash, navigationType]);

  return null;
}

function HomePage() {
  return (
    <main id="main">
      <Hero />
      <Timeline />
      <Projects />
      <Toolkit />
      <Contact />
    </main>
  );
}

function NotFoundPage() {
  return (
    <main id="main" className="bg-grid-paper flex min-h-[calc(100dvh-3.5rem)] items-center">
      <div className="mx-auto w-full max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="text-accent font-mono text-xs tracking-[0.2em] uppercase">404</p>
        <h1 className="text-text mt-4 text-3xl font-semibold sm:text-4xl">Page not found</h1>
        <p className="text-muted mt-4">There&rsquo;s nothing plotted at this coordinate.</p>
        <Link
          to="/"
          className="text-accent mt-8 inline-flex min-h-11 items-center font-mono text-sm underline decoration-1 underline-offset-4"
        >
          Back to nickderaj.com
        </Link>
      </div>
    </main>
  );
}

function App() {
  return (
    <>
      <ScrollManager />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/projects/:slug"
          element={
            <main id="main">
              <ProjectDetail />
            </main>
          }
        />
        <Route
          path="/data"
          element={
            <main id="main">
              <DataPage />
            </main>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
