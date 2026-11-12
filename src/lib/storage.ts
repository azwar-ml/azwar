import { isWorldId, type WorldId } from './worlds';
import type { Quality } from './math';
export type Preferences = { motion: 'system' | 'reduced' | 'full'; quality: Quality; contrast: boolean; volume: number; sound: boolean; theme: 'cosmic' | 'tide' | 'rose'; ambient: boolean; feedback: number };
export type Mark = { points: { x: number; y: number }[]; width: number; tool: string };
export type Creation = { id: string; world: 'zen-garden' | 'dream-sky'; name: string; marks: Mark[]; image: string };
export type Stored = { version: 1; preferences: Preferences; visited: WorldId[]; creations: Creation[] };
export const KEY = 'azwarism:v1';
export const defaults: Preferences = { motion: 'system', quality: 'auto', contrast: false, volume: 0.25, sound: false, theme: 'cosmic', ambient: true, feedback: 0.65 };
export const emptyState = (): Stored => ({ version: 1, preferences: { ...defaults }, visited: [], creations: [] });
export function parseStored(raw: string | null): Stored {
  const state = emptyState(); if (!raw) return state;
  try { const data = JSON.parse(raw); if (data?.version !== 1) return state;
    const p = data.preferences ?? {};
    if (['system', 'reduced', 'full'].includes(p.motion)) state.preferences.motion = p.motion;
    if (['auto', 'ultra', 'high', 'balanced', 'battery'].includes(p.quality)) state.preferences.quality = p.quality;
    if (['cosmic', 'tide', 'rose'].includes(p.theme)) state.preferences.theme = p.theme;
    for (const key of ['contrast', 'sound', 'ambient'] as const) if (typeof p[key] === 'boolean') state.preferences[key] = p[key];
    for (const key of ['volume', 'feedback'] as const) if (typeof p[key] === 'number' && Number.isFinite(p[key])) state.preferences[key] = Math.min(1, Math.max(0, p[key]));
    if (Array.isArray(data.visited)) state.visited = [...new Set<WorldId>(data.visited.filter(isWorldId))];
    if (Array.isArray(data.creations)) state.creations = data.creations.filter(validCreation).slice(-12);
  } catch { /* Damaged or obsolete storage is safely ignored. */ }
  return state;
}
function validCreation(v: unknown): v is Creation {
  if (!v || typeof v !== 'object') return false;
  const c = v as Creation;
  return typeof c.id === 'string' && c.id.length <= 100 && ['zen-garden', 'dream-sky'].includes(c.world) && typeof c.name === 'string' && c.name.length <= 80 && typeof c.image === 'string' && c.image.startsWith('data:image/png;base64,') && c.image.length < 220000 && Array.isArray(c.marks) && c.marks.length <= 180 && c.marks.every(m => typeof m.tool === 'string' && m.tool.length < 30 && Number.isFinite(m.width) && Array.isArray(m.points) && m.points.length <= 600 && m.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1));
}
export function writeStored(state: Stored): boolean { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch { return false; } }
