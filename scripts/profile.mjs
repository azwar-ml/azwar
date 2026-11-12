import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const server = spawn(
  process.execPath,
  [require.resolve('next/dist/bin/next'), 'start', '--port', '3200', '--hostname', '127.0.0.1'],
  { stdio: 'ignore', windowsHide: true },
);
let browser;
try {
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch('http://127.0.0.1:3200')).ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  browser = await chromium.launch();
  const results = [];
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 768 },
      deviceScaleFactor: mobile ? 3 : 1,
      hasTouch: mobile,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    if (mobile) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await cdp.send('Network.enable');
      await cdp.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 150,
        downloadThroughput: 200000,
        uploadThroughput: 90000,
      });
    }
    await page.addInitScript(() => {
      window.__qa = { lcp: 0, cls: 0, longTasks: 0, draws: {} };
      const clear = CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect = function (...args) {
        const kind = this.canvas.closest('[data-playground]')?.getAttribute('data-playground');
        if (kind) {
          const now = performance.now();
          const sample = window.__qa.draws[kind] ?? { count: 0, first: now, last: now };
          sample.count++;
          sample.last = now;
          window.__qa.draws[kind] = sample;
        }
        return clear.apply(this, args);
      };
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) window.__qa.lcp = e.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__qa.cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver((l) => {
        window.__qa.longTasks += l.getEntries().length;
      }).observe({ type: 'longtask', buffered: true });
    });
    await page.goto('http://127.0.0.1:3200/');
    await page.locator('[data-playground=hero] canvas').waitFor();
    await page.waitForFunction(() => (window.__qa.draws.hero?.count ?? 0) >= 3);
    await page.evaluate(() => {
      window.__qa.sceneReadyMs = window.__qa.draws.hero.first;
    });
    await page.waitForTimeout(2500);
    await page.evaluate(() => {
      window.__qa.draws = {};
    });
    await page.waitForTimeout(3000);
    const home = await page.evaluate(() => ({
      ...window.__qa,
      resources: performance
        .getEntriesByType('resource')
        .filter((e) => e.initiatorType === 'script')
        .map((e) => ({ name: e.name.split('/').pop(), encodedBytes: e.encodedBodySize })),
      heap: performance.memory?.usedJSHeapSize,
    }));
    await page.goto('http://127.0.0.1:3200/worlds/particles?debug=1');
    await page.locator('.stage canvas').waitFor();
    await page.waitForTimeout(4500);
    const debug = await page.locator('.debug').innerText();
    // Repeat world navigation to catch lifecycle errors; heap is diagnostic, not a leak proof.
    for (const id of ['liquid', 'ocean', 'gravity', 'particles']) {
      await page.goto(`http://127.0.0.1:3200/worlds/${id}`);
      await page.locator('.stage canvas').waitFor();
    }
    const after = await page.evaluate(() => performance.memory?.usedJSHeapSize);
    results.push({
      profile: mobile
        ? 'Chromium phone emulation DPR 3, CPU 4x, 1.6 Mbps, 150ms latency'
        : 'Chromium laptop, unthrottled',
      home,
      particles: JSON.parse(debug),
      afterNavigationHeap: after,
      errors,
    });
    await context.close();
  }
  await mkdir('docs/qa', { recursive: true });
  await writeFile(
    'docs/qa/performance.json',
    JSON.stringify(
      {
        note: 'Local single-run lab samples; mobile uses CPU/network emulation. Not field CWV or physical-device results. No guaranteed FPS. Heap values may be privacy-rounded and are not a leak proof.',
        results,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser?.close();
  server.kill();
}
