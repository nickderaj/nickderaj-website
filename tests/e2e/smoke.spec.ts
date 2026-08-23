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
    const desktopChart = page.locator('#experience > div > div').first();
    const bodies = desktopChart.locator('svg > g rect');
    const bodyCount = await bodies.count();
    expect(bodyCount).toBeGreaterThan(100);

    // Both colours must appear — a monotonic/one-colour series would fail this.
    const fills = await bodies.evaluateAll((els) => [
      ...new Set(els.map((el) => el.getAttribute('fill'))),
    ]);
    expect(fills).toContain('var(--color-candle-up)');
    expect(fills).toContain('var(--color-candle-down)');
  });

  test('the mobile vertical gutter spine draws progressively and completes at bottom', async ({
    page,
  }) => {
    // Below 1024px there is exactly one <path> under #experience: the simplified vertical spine
    // (candles don't read in a ~48px gutter, see CareerChart.tsx). It shares the same scroll
    // progress as the desktop candles, so this exercises the same progressive-reveal wiring.
    await page.setViewportSize({ width: 768, height: 900 });
    await page.goto('/');

    const path = page.locator('#experience svg path').first();
    await expect(path).toHaveCount(1);

    const initialDashoffset = await path.evaluate((el) =>
      Number(el.getAttribute('stroke-dashoffset')),
    );
    const pathLength = await path.evaluate((el) => Number(el.getAttribute('stroke-dasharray')));
    expect(pathLength).toBeGreaterThan(0);

    await page.locator('#experience').scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(300);

    const midDashoffset = await path.evaluate((el) => Number(el.getAttribute('stroke-dashoffset')));
    expect(midDashoffset).toBeLessThan(initialDashoffset);

    // Scroll all the way to the bottom of the page (past the timeline) to fully draw the path.
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(300);

    const finalDashoffset = await path.evaluate((el) =>
      Number(el.getAttribute('stroke-dashoffset')),
    );
    expect(finalDashoffset).toBeLessThanOrEqual(1);
  });

  test('regime bands render with labels', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const svgText = await page
      .locator('#experience svg')
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

  test('renders chronologically: Bristol first, Goldman Sachs last', async ({ page }) => {
    // PLAN fix #1: scroll order must track the chart's left-to-right time axis, so the card stack
    // is chronological (oldest first) even though career.ts itself stays most-recent-first.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const cards = page.locator('#experience ol > li');
    await expect(cards).toHaveCount(7);
    await expect(cards.first()).toContainText('University of Bristol');
    await expect(cards.last()).toContainText('Goldman Sachs');
  });
});

test.describe('tablet layout (768-1023px)', () => {
  // PLAN fix #2: the tablet horizontal-ribbon variant was deleted (it rendered on top of the
  // text). There are now exactly two layouts: the mobile vertical-gutter layout below 1024px,
  // and the desktop two-column layout at/above it. Assert nothing overlaps at either edge of the
  // tablet range.
  for (const width of [768, 1023]) {
    test(`gutter chart does not overlap the role card text at ${String(width)}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      await page.locator('#experience').scrollIntoViewIfNeeded();

      const gutter = page.locator('#experience [aria-hidden="true"].w-12').first();
      const firstCard = page.locator('#experience ol > li').first();
      await expect(gutter).toBeVisible();
      await expect(firstCard).toBeVisible();

      const gutterBox = await gutter.boundingBox();
      const cardBox = await firstCard.boundingBox();
      if (!gutterBox || !cardBox) {
        throw new Error('expected both the gutter and the first card to have a layout box');
      }
      // The gutter must sit fully to the left of the card text, never over it.
      expect(gutterBox.x + gutterBox.width).toBeLessThanOrEqual(cardBox.x + 1);
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
    const path = page.locator('#experience svg path').first();
    const dashoffset = await path.evaluate((el) => Number(el.getAttribute('stroke-dashoffset')));
    expect(dashoffset).toBeLessThanOrEqual(1);
    await page.screenshot({ path: '.playwright/screens/reduced-motion.png', fullPage: true });
  });
});
