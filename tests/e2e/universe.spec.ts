import { expect, test } from '@playwright/test';
const worlds = [
  'particles',
  'liquid',
  'bubbles',
  'zen-garden',
  'ocean',
  'dream-sky',
  'gravity',
  'breathing',
];
test('home to hub, keyboard entry, settings and dialog focus', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A little escape');
  await page.getByRole('link', { name: 'Enter the Universe' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/universe');
  await page.getByRole('button', { name: 'Directory', exact: true }).click();
  await expect(page.locator('.world-grid .world-card')).toHaveCount(8);
  const settings = page.getByRole('button', { name: 'Open settings' });
  await settings.click();
  await page.getByRole('combobox', { name: 'Motion', exact: true }).selectOption('reduced');
  await page.getByLabel('Higher contrast').check();
  await page.keyboard.press('Escape');
  await expect(settings).toBeFocused();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'true');
  expect(errors).toEqual([]);
});
for (const world of worlds)
  test(`${world}: input, pause, reset, help, navigation`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`/worlds/${world}`);
    const canvas = page.locator('.stage canvas');
    await expect(canvas).toBeVisible();
    await canvas.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowRight');
    await page.getByRole('button', { name: 'Ⅱ Pause', exact: true }).click();
    const before = await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL());
    await page.waitForTimeout(200);
    expect(await canvas.evaluate((el: HTMLCanvasElement) => el.toDataURL())).toBe(before);
    await page.getByRole('button', { name: '▶ Resume', exact: true }).click();
    await page.getByRole('button', { name: 'Reset', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm clear' }).click();
    await page.getByRole('button', { name: 'Help', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath(`${world}.png`), fullPage: true });
    await page.getByRole('link', { name: '← Universe', exact: true }).click();
    await expect(page).toHaveURL('/universe');
    expect(errors).toEqual([]);
  });
test('saved sand and constellation survive reload, restore, export and delete', async ({
  page,
}) => {
  await page.goto('/worlds/zen-garden');
  await page.getByRole('button', { name: 'Add a rake pattern' }).click();
  await page.getByLabel('Creation name').fill('My quiet garden');
  await page.getByRole('button', { name: 'Save to journal' }).click();
  await expect(page.getByRole('status')).toContainText('Saved to your journal');
  await page.goto('/worlds/dream-sky');
  await page.getByRole('button', { name: 'Next star' }).click();
  await page.getByRole('button', { name: 'Next star' }).click();
  await page.getByLabel('Creation name').fill('A gentle shape');
  await page.getByRole('button', { name: 'Save to journal' }).click();
  await page.goto('/discover');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'My quiet garden' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'A gentle shape' })).toBeVisible();
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Export PNG' }).first().click();
  expect((await download).suggestedFilename()).toContain('.png');
  await page.getByRole('button', { name: 'Delete My quiet garden' }).click();
  await page.getByRole('button', { name: 'Confirm clear' }).click();
  await expect(page.getByRole('heading', { name: 'My quiet garden' })).toHaveCount(0);
  await page.goto('/worlds/dream-sky');
  await page.getByLabel('Restore a saved creation').selectOption({ label: 'A gentle shape' });
  await expect(page.getByRole('status')).toContainText('restored');
});
test('all public pages and friendly 404 render without errors', async ({ page }) => {
  for (const path of ['/discover', '/about', '/privacy', '/accessibility', '/not-a-world']) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
  }
  await expect(page.locator('main')).toContainText('way home');
});
test('reduced motion follows device, touch drawing, menu and orientation', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('link', { name: 'The Universe', exact: true }).click();
  await expect(page).toHaveURL('/universe');
  await page.goto('/worlds/ocean');
  const c = page.locator('.stage canvas');
  await expect(c).toBeVisible();
  const box = (await c.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByRole('status')).toContainText('ripple');
  await page.getByRole('button', { name: 'Shape this world' }).click();
  await expect(page.getByLabel('Calmness')).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
for (const [width, height] of [
  [320, 640],
  [390, 844],
  [430, 932],
  [768, 1024],
  [1024, 768],
  [1366, 768],
  [1920, 1080],
])
  test(`responsive visual QA ${width}x${height}`, async ({ browser }, testInfo) => {
    const context = await browser.newContext({
      viewport: { width, height },
      hasTouch: width <= 1024,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    for (const route of ['/', '/universe', '/worlds/liquid', '/worlds/zen-garden', '/discover']) {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      if (route.includes('/worlds/')) await expect(page.locator('.stage canvas')).toBeVisible();
      await page.screenshot({
        path: testInfo.outputPath(`${route.replaceAll('/', '_') || 'home'}.png`),
        fullPage: true,
      });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
    }
    await context.close();
  });
