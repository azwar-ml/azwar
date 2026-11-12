import { describe, expect, it } from 'vitest';
import {
  clamp,
  gravityStep,
  initialBudget,
  localPoint,
  motionAllowed,
  qualityBudget,
  random,
} from '@/lib/math';
import { emptyState, parseStored, writeStored, KEY } from '@/lib/storage';
import { worlds, isWorldId } from '@/lib/worlds';
describe('world registry', () => {
  it('provides eight unique navigable worlds', () => {
    expect(worlds).toHaveLength(8);
    expect(new Set(worlds.map((w) => w.id)).size).toBe(8);
    expect(isWorldId('dream-sky')).toBe(true);
    expect(isWorldId('../missing')).toBe(false);
  });
});
describe('input and stable physics', () => {
  it('normalizes coordinates relative to the stage and clamps outside drags', () => {
    expect(localPoint(250, 350, { left: 50, top: 150, width: 400, height: 400 })).toEqual({
      x: 0.5,
      y: 0.5,
    });
    expect(localPoint(-50, 999, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 0, y: 1 });
  });
  it('keeps zero-distance and long-frame integration finite and bounded', () => {
    const p = { x: 0.5, y: 0.5, vx: 0, vy: 0 };
    for (let i = 0; i < 3000; i++) gravityStep(p, { x: 0.5, y: 0.5 }, 100, -0.2);
    expect(Number.isFinite(p.x + p.y)).toBe(true);
    expect(p.x).toBeGreaterThanOrEqual(0.02);
    expect(p.x).toBeLessThanOrEqual(0.98);
  });
  it('caps velocity at boundaries', () => {
    const p = { x: 0.99, y: 0.99, vx: 1000, vy: 1000 };
    gravityStep(p, { x: 0, y: 0 }, 1, 1);
    expect(Math.abs(p.vx)).toBeLessThanOrEqual(0.35);
    expect(p.x).toBeLessThanOrEqual(0.98);
  });
  it('is deterministic and caps quality budgets', () => {
    const a = random(20),
      b = random(20);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(qualityBudget('auto', 2)).toBe(300);
    expect(qualityBudget('battery', 16)).toBe(120);
    expect(clamp(99, 0, 1)).toBe(1);
  });
});
describe('motion preferences', () => {
  it('respects the system unless explicitly overridden', () => {
    expect(motionAllowed('system', true)).toBe(false);
    expect(motionAllowed('reduced', false)).toBe(false);
    expect(motionAllowed('full', true)).toBe(true);
  });
});
it('starts touch devices conservatively, honors data saver and explicit quality', () => {
  expect(initialBudget('auto', 16, true, false)).toBe(300);
  expect(initialBudget('auto', 16, false, true)).toBe(120);
  expect(initialBudget('ultra', 16, true, true)).toBe(1000);
});
describe('versioned persistence', () => {
  it('survives corrupt and older data', () => {
    expect(parseStored('{oops')).toEqual(emptyState());
    expect(parseStored('{"version":2}')).toEqual(emptyState());
  });
  it('validates flags, bounds volume, deduplicates progress and rejects malformed saves', () => {
    const data = parseStored(
      JSON.stringify({
        version: 1,
        visited: ['ocean', 'ocean', 'missing', 12],
        preferences: { volume: 99, motion: 'reduced', sound: 'yes', quality: 'fake' },
        creations: [{ id: 'bad' }],
      }),
    );
    expect(data.visited).toEqual(['ocean']);
    expect(data.preferences.volume).toBe(1);
    expect(data.preferences.sound).toBe(false);
    expect(data.preferences.quality).toBe('auto');
    expect(data.creations).toEqual([]);
  });
  it('round trips preferences and visited worlds', () => {
    const data = emptyState();
    data.visited = ['bubbles'];
    data.preferences.contrast = true;
    expect(writeStored(data)).toBe(true);
    expect(parseStored(localStorage.getItem(KEY))).toEqual(data);
  });
});
