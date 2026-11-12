import { expect, test, type Locator } from '@playwright/test';
import { random } from '../../src/lib/math';
const signature = (canvas: Locator) =>
  canvas.evaluate(async (c: HTMLCanvasElement) => {
    const data = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(c.toDataURL()));
    return Array.from(new Uint8Array(data)).join(',');
  });
test.describe('living homepage', () => {
  test.use({ reducedMotion: 'reduce' });
  for (const kind of ['hero', 'stars', 'light', 'puzzle', 'break', 'calm']) {
    test(`${kind} is playable by keyboard and pauses`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto('/');
      const surface = page.locator(`[data-playground=${kind}]`),
        canvas = surface.locator('canvas');
      await canvas.scrollIntoViewIfNeeded();
      await canvas.focus();
      await page.waitForTimeout(100);
      const before = await signature(canvas);
      await page.keyboard.press('Enter');
      if (kind === 'stars') await page.keyboard.press('Enter');
      await expect.poll(() => signature(canvas)).not.toBe(before);
      await surface.locator('.play-pause').click();
      await page.waitForTimeout(60);
      const paused = await signature(canvas);
      await page.waitForTimeout(180);
      expect(await signature(canvas)).toBe(paused);
      await expect(surface.locator('.play-controls button').first()).toBeDisabled();
      await surface.locator('.play-pause').click();
      if (kind !== 'hero') {
        await surface.locator('.play-reset').click();
        await expect(surface.getByRole('status')).toContainText('fresh');
      }
      expect(errors).toEqual([]);
    });
  }
  test('headline activates the core; calm toggle preserves static art and navigation', async ({
    page,
  }) => {
    await page.goto('/');
    const canvas = page.locator('[data-playground=hero] canvas');
    await canvas.waitFor();
    await page.waitForTimeout(100);
    const before = await signature(canvas);
    await page.getByRole('button', { name: 'escape: stir the universe' }).click();
    await expect.poll(() => signature(canvas)).not.toBe(before);
    await page.getByRole('button', { name: 'Calm mode', exact: true }).click();
    await expect(page.locator('.living-home')).toHaveClass(/is-calm/);
    await page.getByRole('button', { name: 'Playful mode', exact: true }).click();
    await expect(page.locator('.living-home')).not.toHaveClass(/is-calm/);
    await page.getByRole('link', { name: 'Enter the Universe', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/universe');
  });
  test('stars and puzzle support real touch dragging; light supports drawing', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    const cdp = await context.newCDPSession(page);
    for (const kind of ['stars', 'light', 'puzzle']) {
      const canvas = page.locator(`[data-playground=${kind}] canvas`);
      await canvas.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      const b = (await canvas.boundingBox())!;
      let x = 0.75,
        y = 0.5;
      if (kind === 'stars') {
        const r = random(829);
        for (let i = 0; i < 520; i++) r();
        x = 0.15 + r() * 0.7;
        y = 0.17 + r() * 0.65;
      }
      const before = await signature(canvas);
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: b.x + x * b.width, y: b.y + y * b.height }],
      });
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: b.x + (x - 0.1) * b.width, y: b.y + (y + 0.08) * b.height }],
      });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await expect.poll(() => signature(canvas)).not.toBe(before);
    }
    expect(errors).toEqual([]);
    await context.close();
  });
  test('offscreen and paused canvases stop rendering', async ({ page }) => {
    await page.addInitScript(() => {
      const counts: Record<string, number> = {};
      Object.assign(window, { __homeDraws: counts });
      const original = CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect = function (
        ...args: Parameters<typeof original>
      ) {
        const kind = this.canvas.closest('[data-playground]')?.getAttribute('data-playground');
        if (kind) counts[kind] = (counts[kind] ?? 0) + 1;
        return original.apply(this, args);
      };
    });
    await page.goto('/');
    await page.waitForTimeout(800);
    const counts = () =>
      page.evaluate(
        () => (window as unknown as { __homeDraws: Record<string, number> }).__homeDraws,
      );
    const before = await counts();
    await page.waitForTimeout(250);
    expect((await counts()).puzzle).toBe(before.puzzle);
    await page.getByRole('button', { name: 'Pause Living aurora core' }).click();
    await page.waitForTimeout(100);
    const held = await counts();
    await page.waitForTimeout(200);
    expect((await counts()).hero).toBe(held.hero);
  });
});
test('rich-motion homepage and card hover remain usable', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const canvas = page.locator('[data-playground=hero] canvas');
  await canvas.waitFor();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'full');
  await page.waitForTimeout(300);
  const before = await signature(canvas);
  await page.waitForTimeout(180);
  expect(await signature(canvas)).not.toBe(before);
  for (const surface of await page.locator('[data-playground] canvas').all()) {
    await surface.scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(100);
  await page.screenshot({ path: testInfo.outputPath('living-home-desktop.png'), fullPage: true });
  await page.locator('.play-portal').first().hover();
  await expect(page.locator('.play-portal').first()).toHaveAttribute('href', '/worlds/particles');
});
test('scattered fragments reform automatically without a reset', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const surface = page.locator('[data-playground=break]');
  await surface.scrollIntoViewIfNeeded();
  await surface.getByRole('button', { name: 'Break & reform', exact: true }).click();
  await expect(surface.getByRole('status')).toContainText('Light scattered');
  await expect(surface.getByRole('status')).toContainText('Back together', { timeout: 12000 });
});
