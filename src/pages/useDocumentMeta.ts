import { useEffect } from 'react';

/** Sets the document title and meta description for the current page (SPA, no SSR). */
export function useDocumentMeta(title: string, description: string): void {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    const previous = meta?.getAttribute('content') ?? null;
    meta?.setAttribute('content', description);
    return () => {
      if (meta && previous !== null) {
        meta.setAttribute('content', previous);
      }
    };
  }, [title, description]);
}
