import { expect, test } from '@playwright/test';
import { random } from '../../src/lib/math';
test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  reducedMotion: 'reduce',
});
for (const id of [
  'particles',
  'liquid',
  'bubbles',
  'zen-garden',
  'ocean',
  'dream-sky',
  'gravity',
  'breathing',
])
  test(`${id} accepts touch gestures and mobile controls`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`/worlds/${id}`);
    const canvas = page.locator('.stage canvas');
    await expect(canvas).toBeVisible();
    const box = (await canvas.boundingBox())!;
    await page.waitForTimeout(100);
    const hash = () =>
      canvas.evaluate(async (c: HTMLCanvasElement) =>
        Array.from(
          new Uint8Array(
            await crypto.subtle.digest('SHA-256', new TextEncoder().encode(c.toDataURL())),
          ),
        ).join(','),
      );
    const before = await hash();
    if (id === 'dream-sky') {
      const rng = random(71);
      for (let i = 0; i < 2; i++)
        await page.touchscreen.tap(
          box.x + (0.08 + rng() * 0.84) * box.width,
          box.y + (0.1 + rng() * 0.8) * box.height,
        );
    } else if (id === 'liquid' || id === 'zen-garden' || id === 'particles' || id === 'gravity') {
      const cdp = await page.context().newCDPSession(page);
      const emit = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number, y: number) =>
        cdp.send('Input.dispatchTouchEvent', {
          type,
          touchPoints:
            type === 'touchEnd'
              ? []
              : [{ x: box.x + x * box.width, y: box.y + y * box.height, force: 0.5 }],
        });
      await emit('touchStart', 0.34, 0.48);
      await page.waitForTimeout(100);
      await emit('touchMove', 0.55, 0.6);
      await page.waitForTimeout(160);
      await emit('touchEnd', 0.55, 0.6);
    } else await page.touchscreen.tap(box.x + box.width * 0.3, box.y + box.height * 0.4);
    await page.waitForTimeout(120);
    expect(await hash()).not.toBe(before);
    await page.getByRole('button', { name: 'Shape this world' }).click();
    await expect(page.getByRole('complementary', { name: 'World controls' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close controls' })).toBeVisible();
    expect(errors).toEqual([]);
  });
test('phone creation controls save and export a local garden', async ({ page }) => {
  await page.goto('/worlds/zen-garden');
  await expect(page.locator('.stage canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Shape this world' }).click();
  await page.getByRole('button', { name: 'Add a rake pattern' }).click();
  await page.getByLabel('Creation name').fill('Pocket garden');
  await page.getByRole('button', { name: 'Save to journal' }).click();
  await expect(page.getByRole('status')).toContainText('Saved to your journal');
  await page.goto('/discover');
  await expect(page.getByRole('heading', { name: 'Pocket garden' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Export PNG' }).click();
  expect((await download).suggestedFilename()).toBe('azwarism-zen-garden.png');
});
