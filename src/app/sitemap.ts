import type { MetadataRoute } from 'next';
import { worlds } from '@/lib/worlds';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    '/',
    '/universe',
    '/discover',
    '/about',
    '/privacy',
    '/accessibility',
    ...worlds.map((w) => `/worlds/${w.id}`),
  ].map((path) => ({ url: `https://azwarism.com${path}` }));
}
