import { expect, test } from '@playwright/test';
test.use({ reducedMotion: 'reduce' });
const signature = async (page: import('@playwright/test').Page) =>
  page.locator('.stage canvas').evaluate(async (c: HTMLCanvasElement) => {
    const bytes = new TextEncoder().encode(c.toDataURL());
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, '0')).join('');
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
  test(`${id} changes actual pixels with keyboard input`, async ({ page }) => {
    await page.goto(`/worlds/${id}`);
    const canvas = page.locator('.stage canvas');
    await expect(canvas).toBeVisible();
    await canvas.focus();
    await page.waitForTimeout(120);
    const before = await signature(page);
    await page.keyboard.press('Enter');
    if (id === 'dream-sky') await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    expect(await signature(page)).not.toBe(before);
  });
test('sand history, moving/removing stones and reset cancellation', async ({ page }) => {
  await page.goto('/worlds/zen-garden');
  const canvas = page.locator('.stage canvas');
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(100);
  const original = await signature(page);
  await page.getByRole('button', { name: 'Add a rake pattern' }).click();
  await page.waitForTimeout(60);
  const drawn = await signature(page);
  expect(drawn).not.toBe(original);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await page.waitForTimeout(60);
  expect(await signature(page)).toBe(original);
  await page.getByRole('button', { name: 'Redo', exact: true }).click();
  await page.waitForTimeout(60);
  expect(await signature(page)).toBe(drawn);
  await page.getByRole('button', { name: 'Add / select a stone', exact: true }).click();
  await page.waitForTimeout(60);
  const stone = await signature(page);
  await page.getByRole('button', { name: 'Nudge stone →', exact: true }).click();
  await page.waitForTimeout(60);
  expect(await signature(page)).not.toBe(stone);
  await page.getByRole('button', { name: 'Remove selected stone', exact: true }).click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('button', { name: 'Keep it', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('star density remains safe after a high-index star was selected', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/worlds/dream-sky');
  await expect(page.locator('.stage canvas')).toBeVisible();
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: /^Next star/ }).click();
  const density = page.getByRole('slider', { name: 'Star density' });
  await density.focus();
  await page.keyboard.press('Home');
  await expect(density).toHaveValue('8');
  await page.getByRole('button', { name: /^Next star/ }).click();
  await page.getByRole('button', { name: /^Next star/ }).click();
  await expect(page.getByRole('status')).toContainText('connections');
  expect(errors).toEqual([]);
});
test('audio is opt-in and can always be muted', async ({ page }) => {
  await page.goto('/worlds/bubbles');
  await expect(page.getByRole('button', { name: 'Enable sound' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Enable sound' }).click();
  await expect(page.getByRole('button', { name: 'Mute sound' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Mute sound' }).click();
  await expect(page.getByRole('button', { name: 'Enable sound' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.reload();
  await expect(page.getByRole('button', { name: 'Enable sound' })).toBeVisible();
});
test('unavailable local storage remains playable with an honest warning', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  });
  await page.goto('/worlds/ocean');
  await expect(page.locator('.stage canvas')).toBeVisible();
  await expect(
    page.getByText('Device storage is full or blocked.', { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Make a ripple' }).click();
});
test('200 percent equivalent text scaling keeps controls within the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 480 });
  await page.goto('/worlds/ocean');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await expect(page.locator('.stage canvas')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});
test('breathing guide has working phases, skip and stop in reduced motion', async ({ page }) => {
  await page.goto('/worlds/breathing');
  await expect(page.locator('.stage canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Gentle Guide', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Breathe in');
  await page.getByRole('button', { name: 'Skip this phase', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Breathe out');
  await page.getByRole('button', { name: 'Stop guide', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Free / Manual', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: '▶ Resume' })).toBeVisible();
});
