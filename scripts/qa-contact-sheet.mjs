import sharp from 'sharp';
import { readdir, copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const ids = [
  'particles',
  'liquid',
  'bubbles',
  'zen-garden',
  'ocean',
  'dream-sky',
  'gravity',
  'breathing',
];
await mkdir('docs/qa', { recursive: true });
const files = await readdir('test-results', { recursive: true });
const images = await Promise.all(
  ids.map(async (id, i) => {
    const file = files.find((f) => path.basename(f) === `${id}.png`);
    if (!file) throw Error(`Missing screenshot for ${id}`);
    const input = await sharp(path.join('test-results', file))
      .resize({ width: 640, height: 490, fit: 'contain', background: '#050714' })
      .toBuffer();
    return { input, left: (i % 2) * 640, top: Math.floor(i / 2) * 490 };
  }),
);
await sharp({ create: { width: 1280, height: 1960, channels: 3, background: '#050714' } })
  .composite(images)
  .jpeg({ quality: 85 })
  .toFile('docs/qa/worlds-overview.jpg');
for (const [from, to] of [
  ['1366x768/_.png', 'home-desktop.png'],
  ['390x844/_.png', 'home-phone.png'],
  ['320x640/_universe.png', 'hub-small-phone.png'],
  ['768x1024/_worlds_liquid.png', 'liquid-tablet.png'],
  ['1366x768/_universe.png', 'hub-desktop.png'],
])
  await copyFile(`test-results/universe-responsive-visual-QA-${from}`, `docs/qa/${to}`);
console.log('Retained five responsive screenshots and all-world overview.');
