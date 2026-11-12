import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/*?debug=1'] },
    sitemap: 'https://azwarism.com/sitemap.xml',
  };
}
