import { Link } from 'react-router';

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <Link
          to="/"
          className="bg-primary text-primary-foreground mt-6 inline-flex rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
