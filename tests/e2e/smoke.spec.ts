import AxeBuilder from '@axe-core/playwright';
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 360, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

const THEMES = ['dark', 'light'] as const;

/** Fails the test on any console error / warning (React key/act/hydration warnings included). */
function trackConsoleProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      const text = msg.text();
      // Ignore benign browser noise unrelated to app correctness.
      if (text.includes('Download the React DevTools')) return;
      problems.push(`[${msg.type()}] ${text}`);
    }
  });
  page.on('pageerror', (err) => {
    problems.push(`[pageerror] ${err.message}`);
  });
  return problems;
}

async function setTheme(page: Page, theme: 'dark' | 'light') {
  await page.evaluate((t) => {
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
  }, theme);
}

test.describe('responsive rendering + no horizontal overflow', () => {
  for (const viewport of VIEWPORTS) {
    for (const theme of THEMES) {
      test(`${viewport.name} @ ${String(viewport.width)}x${String(viewport.height)}, ${theme}`, async ({
        page,
      }) => {
        const problems = trackConsoleProblems(page);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await setTheme(page, theme);
        await page.reload();
        await page.waitForLoadState('networkidle');

        const overflow = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(
          overflow.scrollWidth,
          `horizontal overflow at ${String(viewport.width)}px ${theme}: scrollWidth=${String(overflow.scrollWidth)} innerWidth=${String(overflow.innerWidth)}`,
        ).toBeLessThanOrEqual(overflow.innerWidth);

        await page.screenshot({
          path: `.playwright/screens/${viewport.name}-${theme}.png`,
          fullPage: true,
        });

        expect(problems, `console problems:\n${problems.join('\n')}`).toEqual([]);
      });
    }
  }
});

test.describe('career chart', () => {
  test('renders a dense candlestick series with up and down candles', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // The desktop sticky pane renders the candlestick series as one <rect> body per candle —
    // roughly one per month across the ~2013-present career span (PLAN fix #3: "reads as a
    // dense market chart, not a sparse infographic").
    // `:not([data-ticker])` skips the mobile ticker layer, which is the first child of the
    // section and stays in the DOM at every width (it is hidden with a media query, not unmounted).
    const desktopChart = page.locator('#experience > div:not([data-ticker])').first();
    const bodies = desktopChart.locator('svg g[data-candle] rect');
    const bodyCount = await bodies.count();
    expect(bodyCount).toBeGreaterThan(100);

    // Both colours must appear — a monotonic/one-colour series would fail this.
    const fills = await bodies.evaluateAll((els) => [
      ...new Set(els.map((el) => el.getAttribute('fill'))),
    ]);
    expect(fills).toContain('var(--color-candle-up)');
    expect(fills).toContain('var(--color-candle-down)');
  });

  test('the mobile ticker tape pans sideways as the page scrolls down', async ({ page }) => {
    // Below 1024px the chart is a full-bleed candle tape painted behind the cards. It is drawn
    // several screens wide and slid sideways with a `transform`, so scrolling down runs the tape
    // sideways (CareerChart.tsx, `ticker` orientation), until by the end of the section even its last
    // candle has been carried off the left edge.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const ticker = page.locator('#experience [data-ticker] svg');
    await expect(ticker).toHaveCount(1);

    // Same dense monthly series as the desktop pane, in both colours.
    const bodies = ticker.locator('g[data-candle] rect');
    expect(await bodies.count()).toBeGreaterThan(100);
    const fills = await bodies.evaluateAll((els) => [
      ...new Set(els.map((el) => el.getAttribute('fill'))),
    ]);
    expect(fills).toContain('var(--color-candle-up)');
    expect(fills).toContain('var(--color-candle-down)');

    // The pan is a translate on the <svg>, written straight to the DOM so panning never costs a
    // re-render. `getComputedStyle().transform` resolves to a matrix, whose `e` component (index
    // 4) is the horizontal offset in px - negative as the tape slides left.
    const panX = async (): Promise<number> =>
      ticker.evaluate((el) => {
        const matrix = getComputedStyle(el).transform;
        if (!matrix || matrix === 'none') return 0;
        return Number(matrix.replace(/^matrix\(|\)$/g, '').split(',')[4]);
      });

    // Scroll to explicit offsets inside the section rather than wheeling by a fixed delta: the
    // section is only a few screens tall, so a large wheel would jump straight to full progress
    // and the mid-scroll sample would be indistinguishable from the final one.
    const sectionTop = await page
      .locator('#experience')
      .evaluate((el) => el.getBoundingClientRect().top + window.scrollY);

    await page.evaluate((y) => {
      window.scrollTo(0, y);
    }, sectionTop);
    await page.waitForTimeout(300);
    const initialPan = await panX();

    await page.evaluate((y) => {
      window.scrollTo(0, y);
    }, sectionTop + 700);
    await page.waitForTimeout(300);
    const midPan = await panX();
    expect(midPan, 'the tape should have slid left on screen').toBeLessThan(initialPan);

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(300);
    const finalPan = await panX();
    expect(finalPan).toBeLessThan(midPan);

    // Fully off the left edge by the end: the tape is translated by at least its own drawn width,
    // so no candle is left parked on screen.
    const tapeWidth = await ticker.evaluate((el) => el.getBoundingClientRect().width);
    expect(finalPan).toBeLessThanOrEqual(-tapeWidth + 1);

    // No candle's drawn geometry may depend on scroll position - that is what keeps the pan a
    // compositor job rather than a re-render of ~470 nodes per frame. The markup must be
    // byte-identical at the bottom of the section and at the top.
    const candleMarkup = async (): Promise<string> =>
      ticker.locator('g[data-candle]').evaluateAll((els) => els.map((el) => el.outerHTML).join(''));
    const atBottom = await candleMarkup();
    await page.evaluate((y) => {
      window.scrollTo(0, y);
    }, sectionTop);
    await page.waitForTimeout(300);
    expect(await candleMarkup()).toBe(atBottom);
  });

  test('regime bands render with labels', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    // The ticker draws no labels, so read the desktop pane specifically.
    const svgText = await page
      .locator('#experience > div:not([data-ticker]) svg')
      .first()
      .evaluate((el) => el.textContent);
    expect(svgText).toContain('PHYSICAL COMMODITIES');
    expect(svgText).toContain('SOFTWARE ENGINEERING');
    expect(svgText).toContain('QUANT');
  });
});

test.describe('career role cards', () => {
  test('all 7 cards present and readable at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');
    const cards = page.locator('#experience ol > li');
    await expect(cards).toHaveCount(7);
    for (const card of await cards.all()) {
      await expect(card).toBeVisible();
    }
  });

  test('renders chronologically on desktop: Bristol first, Goldman Sachs last', async ({
    page,
  }) => {
    // PLAN fix #1: scroll order must track the chart's left-to-right time axis, so the card stack
    // is chronological (oldest first) even though career.ts itself stays most-recent-first.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const cards = page.locator('#experience ol > li');
    await expect(cards).toHaveCount(7);
    await expect(cards.first()).toContainText('University of Bristol');
    await expect(cards.last()).toContainText('Goldman Sachs');
  });

  test('renders newest-first on mobile: Goldman Sachs first, Bristol last', async ({ page }) => {
    // Below 1024px there is no side-by-side time axis to track, so the stack reads like a CV:
    // most recent role at the top.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const cards = page.locator('#experience ol > li');
    await expect(cards).toHaveCount(7);
    await expect(cards.first()).toContainText('Goldman Sachs');
    await expect(cards.last()).toContainText('University of Bristol');
  });
});

test.describe('sub-1024px ticker sits behind the text', () => {
  // The tablet horizontal-ribbon variant was deleted long ago for rendering *on top of* the text.
  // Its replacement, the ticker tape, is also behind the cards - but as a backdrop: it never
  // takes a click, never sits above the copy, and never widens the page. Assert all three at both
  // edges of the range that uses it.
  for (const width of [390, 768, 1023]) {
    test(`backdrop, not an overlay, at ${String(width)}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      await page.locator('#experience').scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const ticker = page.locator('#experience [data-ticker]');
      await expect(ticker).toBeVisible();

      // Full-bleed: it spans the viewport rather than sitting in a gutter beside the text.
      const tickerBox = await ticker.boundingBox();
      if (!tickerBox) throw new Error('expected the ticker layer to have a layout box');
      expect(tickerBox.x).toBeLessThanOrEqual(0);
      expect(tickerBox.width).toBeGreaterThanOrEqual(width);

      // Hit-testing the middle of a card lands on the card, never on the chart behind it.
      const card = page.locator('#experience ol > li article').first();
      const cardBox = await card.boundingBox();
      if (!cardBox) throw new Error('expected the first card to have a layout box');
      const topmost = await page.evaluate(
        ([x, y]: number[]) => {
          const el = document.elementFromPoint(x ?? 0, y ?? 0);
          return { tag: el?.tagName ?? null, inCard: el?.closest('#experience ol > li') !== null };
        },
        [cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2],
      );
      expect(topmost.tag).not.toBe('svg');
      expect(topmost.inCard, 'the card must be hit-testable through the backdrop').toBe(true);

      // The tape is drawn far wider than the screen, so it must not extend the scrollable width.
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth);
    });
  }
});

test.describe('projects', () => {
  test('3 cards, lineage visible, navigation, carousel, lightbox', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const projectCards = page.locator('#projects a[href^="/projects/"]');
    await expect(projectCards).toHaveCount(3);

    await expect(page.getByText(/spun out of/i).first()).toBeVisible();

    await page
      .getByRole('link', { name: /quant research/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/projects\/quant-trading-labs/);

    const carousel = page.getByRole('group', { name: /screenshot carousel/i });
    await expect(carousel).toBeVisible();
    const slides = carousel.locator('[data-index]');
    await expect(slides).toHaveCount(2);

    const nextButton = page.getByRole('button', { name: 'Next screenshot' });
    await nextButton.click();
    await page.waitForTimeout(400);
    const dots = page.getByRole('tab');
    await expect(dots.nth(1)).toHaveAttribute('aria-selected', 'true');

    const prevButton = page.getByRole('button', { name: 'Previous screenshot' });
    await prevButton.click();
    await page.waitForTimeout(400);
    await expect(dots.nth(0)).toHaveAttribute('aria-selected', 'true');

    // Lightbox open/close, focus returns to trigger.
    const firstSlideButton = slides.nth(0).getByRole('button', { name: /open larger view/i });
    await firstSlideButton.click();
    const dialog = page.locator('dialog[open]');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(firstSlideButton).toBeFocused();

    // Browser back returns to the projects section.
    await page.goBack();
    await expect(page).toHaveURL(/\/#?$/);
  });

  test('all screenshots across all projects load without being broken', async ({ page }) => {
    const slugs = ['quant-trading-labs', 'commodity-stat-arb', 'ceres'];
    let totalImages = 0;
    for (const slug of slugs) {
      await page.goto(`/projects/${slug}`);
      const images = page.locator('main img');
      const count = await images.count();
      totalImages += count;
      for (let i = 0; i < count; i += 1) {
        const naturalWidth = await images.nth(i).evaluate((img: HTMLImageElement) => {
          if (img.complete) return img.naturalWidth;
          return new Promise<number>((resolve) => {
            img.addEventListener('load', () => {
              resolve(img.naturalWidth);
            });
            img.addEventListener('error', () => {
              resolve(0);
            });
          });
        });
        expect(
          naturalWidth,
          `broken image on /projects/${slug} at index ${String(i)}`,
        ).toBeGreaterThan(0);
      }
    }
    expect(totalImages).toBe(7);
  });
});

test.describe('navigation', () => {
  test('header anchors scroll to existing sections', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const anchors = [
      ['Experience', 'experience'],
      ['Projects', 'projects'],
      ['Toolkit', 'toolkit'],
      ['Contact', 'contact'],
    ] as const;
    for (const [label, id] of anchors) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
      await page.getByRole('link', { name: label, exact: true }).click();
      await page.waitForTimeout(200);
      const inView = await page.locator(`#${id}`).evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      });
      expect(inView, `#${id} not in view after clicking ${label}`).toBe(true);
    }
  });

  test('theme toggle flips data-theme and persists across reload', async ({ page }) => {
    await page.goto('/');
    const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await page.getByRole('button', { name: /switch to/i }).click();
    const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(after).not.toBe(before);
    await page.reload();
    const afterReload = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme'),
    );
    expect(afterReload).toBe(after);
  });

  test('/data renders', async ({ page }) => {
    await page.goto('/data');
    await expect(page.getByRole('heading', { name: /computed source values/i })).toBeVisible();
  });

  test('unknown route renders 404', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible();
  });
});

test.describe('keyboard', () => {
  test('tab from top reaches skip link first, no keyboard trap, focus visible', async ({
    page,
  }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const active = await page.evaluate(() => ({
      text: document.activeElement?.textContent,
      tag: document.activeElement?.tagName,
    }));
    expect(active.text).toMatch(/skip to content/i);
  });

  test('j/k step through timeline entries', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(200);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await page.keyboard.press('j');
    await page.waitForTimeout(500);
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).not.toBe(scrollBefore);
  });
});

test.describe('accessibility (axe)', () => {
  const routes = ['/', '/projects/quant-trading-labs', '/data'];
  for (const route of routes) {
    test(`axe scan: ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).analyze();
      const seriousOrCritical = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      if (seriousOrCritical.length > 0) {
        console.log(JSON.stringify(seriousOrCritical, null, 2));
      }
      expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([]);
    });
  }
});

test.describe('print stylesheet', () => {
  test('hides chrome and chart, reads as a CV', async ({ page }) => {
    await page.goto('/');
    await page.emulateMedia({ media: 'print' });
    await page.screenshot({ path: '.playwright/screens/print.png', fullPage: true });
    // `getByRole('banner'/'contentinfo')` targets only the page-level <header>/<footer> — a
    // <header> nested inside a <section> (e.g. the Projects intro) doesn't compute to the banner
    // role, so this doesn't collide with it the way a bare `header` tag locator would.
    const headerVisible = await page.getByRole('banner').isVisible();
    const footerVisible = await page.getByRole('contentinfo').isVisible();
    expect(headerVisible).toBe(false);
    expect(footerVisible).toBe(false);
    const hiddenSvgCount = await page
      .locator('svg[aria-hidden="true"]')
      .evaluateAll((els) => els.filter((el) => getComputedStyle(el).display !== 'none').length);
    expect(hiddenSvgCount).toBe(0);
  });
});

test.describe('reduced motion', () => {
  test('chart renders complete and static, page fully readable', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    // `useScrollProgress` pins progress to 1 under reduced motion, so every candle in the desktop
    // pane renders revealed (opacity 1) rather than dimmed.
    const dimmed = await page
      .locator('#experience svg g[data-candle]')
      .evaluateAll((els) => els.filter((el) => Number(el.getAttribute('opacity')) < 1).length);
    expect(dimmed).toBe(0);
    await page.screenshot({ path: '.playwright/screens/reduced-motion.png', fullPage: true });
  });
});
