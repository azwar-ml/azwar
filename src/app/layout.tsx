import type { Metadata, Viewport } from 'next';
import { Provider } from '@/components/provider';
import { Navigation, Footer } from '@/components/navigation';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://azwarism.com'),
  title: {
    default: 'AZWARISM UNIVERSE — A little escape from the noise',
    template: '%s · AZWARISM UNIVERSE',
  },
  description:
    'Touch the stars. Shape the light. Eight interactive worlds for playful, creative moments at your own pace. No accounts. No rush.',
  openGraph: {
    title: 'AZWARISM UNIVERSE',
    description: 'Move. Feel. Breathe. Play. A little escape from the noise.',
    images: [
      {
        url: '/social.png',
        width: 1200,
        height: 630,
        alt: 'AZWARISM UNIVERSE — A little escape from the noise.',
      },
    ],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/social.png'] },
  icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#050714' };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-motion="reduced">
      <body>
        <Provider>
          <Navigation />
          {children}
          <Footer />
        </Provider>
      </body>
    </html>
  );
}
