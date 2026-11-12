export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
export function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function localPoint(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
) {
  return {
    x: clamp((clientX - rect.left) / Math.max(1, rect.width), 0, 1),
    y: clamp((clientY - rect.top) / Math.max(1, rect.height), 0, 1),
  };
}
export function gravityStep(
  p: { x: number; y: number; vx: number; vy: number },
  well: { x: number; y: number },
  dt: number,
  force: number,
) {
  dt = clamp(dt, 0, 0.033);
  const dx = well.x - p.x,
    dy = well.y - p.y,
    d = Math.max(0.025, Math.hypot(dx, dy));
  p.vx = clamp((p.vx + ((dx / d) * force * dt) / (0.2 + d)) * 0.998, -0.35, 0.35);
  p.vy = clamp((p.vy + ((dy / d) * force * dt) / (0.2 + d)) * 0.998, -0.35, 0.35);
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  if (p.x < 0.02 || p.x > 0.98) {
    p.x = clamp(p.x, 0.02, 0.98);
    p.vx *= -0.8;
  }
  if (p.y < 0.02 || p.y > 0.98) {
    p.y = clamp(p.y, 0.02, 0.98);
    p.vy *= -0.8;
  }
}
export type Quality = 'auto' | 'ultra' | 'high' | 'balanced' | 'battery';
export const qualityBudget = (q: Quality, cores = 4) =>
  q === 'battery'
    ? 120
    : q === 'balanced'
      ? 300
      : q === 'high'
        ? 650
        : q === 'ultra'
          ? 1000
          : cores <= 4
            ? 300
            : 650;
export const initialBudget = (q: Quality, cores: number, coarse: boolean, saveData: boolean) =>
  q === 'auto' && saveData ? 120 : qualityBudget(q, coarse ? Math.min(cores, 4) : cores);
export const motionAllowed = (setting: 'system' | 'reduced' | 'full', systemReduced: boolean) =>
  setting === 'full' || (setting === 'system' && !systemReduced);
