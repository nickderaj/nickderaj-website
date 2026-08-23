import type { ProjectScreenshot } from '@/types/content.ts';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type CarouselProps = {
  /** Screenshots to render, in order. */
  screenshots: ProjectScreenshot[];
  /** Used to build accessible names, e.g. the project title. */
  label: string;
};

/**
 * A screenshot carousel per PLAN §2.3.
 *
 * Base layer is CSS scroll-snap so it works with zero JS and swipes natively on touch. JS adds
 * prev/next buttons, dot indicators driven by IntersectionObserver, arrow-key navigation, and a
 * click-to-open lightbox built on the native <dialog> element.
 */
function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export default function Carousel({ screenshots, label }: CarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const slideCount = screenshots.length;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex: number | undefined;
        let bestRatio = 0;
        for (const entry of entries) {
          const indexAttr = entry.target.getAttribute('data-index');
          if (indexAttr === null) {
            continue;
          }
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = Number(indexAttr);
          }
        }
        if (bestIndex !== undefined) {
          setActiveIndex(bestIndex);
        }
      },
      { root: scroller, threshold: [0.25, 0.5, 0.75, 1] },
    );

    const slides = scroller.querySelectorAll('[data-index]');
    slides.forEach((slide) => {
      observer.observe(slide);
    });

    return () => {
      observer.disconnect();
    };
  }, [slideCount]);

  const scrollToIndex = (index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller || slideCount === 0) {
      return;
    }
    const clamped = Math.max(0, Math.min(index, slideCount - 1));
    const slide = scroller.querySelector(`[data-index="${String(clamped)}"]`);
    if (slide instanceof HTMLElement) {
      slide.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        inline: 'center',
        block: 'nearest',
      });
      setActiveIndex(clamped);
    }
  };

  const handleScrollerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToIndex(activeIndex + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToIndex(activeIndex - 1);
    }
  };

  const openLightbox = (index: number, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setLightboxIndex(index);
    const dialog = dialogRef.current;
    if (dialog && typeof dialog.showModal === 'function' && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        // Environments without full <dialog> support (older browsers, some test runners) fall
        // back to the carousel remaining usable without the lightbox.
      }
    }
  };

  const closeLightbox = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
    }
  };

  const handleDialogClose = () => {
    setLightboxIndex(null);
    triggerRef.current?.focus();
  };

  const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    // A click that lands on the <dialog> element itself (not its content) is a click on the
    // backdrop — close on click-outside.
    if (event.target === dialogRef.current) {
      closeLightbox();
    }
  };

  if (slideCount === 0) {
    return null;
  }

  const activeShot = lightboxIndex === null ? undefined : screenshots[lightboxIndex];

  return (
    <section aria-label={`${label} screenshots`} className="w-full">
      {/* This is the W3C APG "scrolling region" pattern: a focusable (tabIndex=0), labelled
          container that owns ArrowLeft/ArrowRight keyboard scrolling. It is intentionally not an
          interactive-role element — it is a scrollable group of slides, not a single control —
          so the non-interactive-tabindex / non-interactive-interactions rules don't apply here. */}
      {/* eslint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={scrollerRef}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${label} screenshot carousel, ${String(slideCount)} slides`}
        onKeyDown={handleScrollerKeyDown}
        className="border-border flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth rounded border pb-1 motion-reduce:scroll-auto"
      >
        {screenshots.map((shot, index) => (
          <div
            key={shot.src}
            data-index={index}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${String(index + 1)} of ${String(slideCount)}`}
            className="w-full shrink-0 snap-center snap-always p-3"
          >
            <button
              type="button"
              onClick={(event) => {
                openLightbox(index, event.currentTarget);
              }}
              aria-label={`Open larger view: ${shot.alt}`}
              className="focus-visible:outline-accent block w-full cursor-zoom-in rounded"
            >
              <img
                src={shot.src}
                alt={shot.alt}
                width={1600}
                height={1000}
                loading="lazy"
                decoding="async"
                className="border-border h-auto w-full rounded border"
              />
            </button>
            {shot.caption !== undefined && (
              <p className="text-muted mt-2 font-mono text-sm">{shot.caption}</p>
            )}
          </div>
        ))}
      </div>
      {/* eslint-enable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions */}

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => {
            scrollToIndex(activeIndex - 1);
          }}
          aria-label="Previous screenshot"
          className="border-border-strong text-text hover:border-accent hover:text-accent rounded border p-1.5 transition-colors"
        >
          <ChevronLeft aria-hidden="true" size={18} />
        </button>

        <div role="tablist" aria-label="Screenshots" className="flex items-center gap-2">
          {screenshots.map((shot, index) => (
            <button
              key={shot.src}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to slide ${String(index + 1)} of ${String(slideCount)}`}
              onClick={() => {
                scrollToIndex(index);
              }}
              className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                index === activeIndex
                  ? 'bg-accent border-accent'
                  : 'border-border-strong hover:border-accent bg-transparent'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            scrollToIndex(activeIndex + 1);
          }}
          aria-label="Next screenshot"
          className="border-border-strong text-text hover:border-accent hover:text-accent rounded border p-1.5 transition-colors"
        >
          <ChevronRight aria-hidden="true" size={18} />
        </button>
      </div>

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events --
          the click handler only detects clicks on the dialog backdrop itself, to implement
          click-outside close as a mouse/touch enhancement. Escape already closes the dialog via
          the native <dialog> `cancel` event, and every focusable/interactive element inside
          (close button, image link) is a real button — no keyboard user depends on this handler. */}
      <dialog
        ref={dialogRef}
        onClose={handleDialogClose}
        onClick={handleDialogClick}
        aria-label={activeShot === undefined ? 'Screenshot preview' : activeShot.alt}
        className="bg-surface text-text border-border max-w-[95vw] rounded border p-0 backdrop:bg-black/80"
      >
        {activeShot !== undefined && (
          <div className="relative max-w-[90vw] p-4">
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close"
              className="border-border-strong bg-surface text-text hover:border-accent hover:text-accent absolute top-2 right-2 rounded border p-1.5 transition-colors"
            >
              <X aria-hidden="true" size={18} />
            </button>
            <img
              src={activeShot.src}
              alt={activeShot.alt}
              width={1600}
              height={1000}
              decoding="async"
              className="h-auto max-h-[80vh] w-auto max-w-full rounded"
            />
            {activeShot.caption !== undefined && (
              <p className="text-muted mt-2 font-mono text-sm">{activeShot.caption}</p>
            )}
          </div>
        )}
      </dialog>
    </section>
  );
}
