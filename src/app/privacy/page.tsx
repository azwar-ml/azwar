import Link from 'next/link';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Privacy', alternates: { canonical: '/privacy' } };
export default function Page() {
  return (
    <main id="main" className="text-page">
      <p className="eyebrow">A SMALL, LOCAL UNIVERSE</p>
      <h1>
        Your moments
        <br />
        belong to you.
      </h1>
      <p>Privacy information · November 12, 2026</p>
      <h2>What stays in your browser</h2>
      <p>
        AZWARISM uses local storage under the key <code>azwarism:v1</code> to remember your visited
        worlds, motion, quality, contrast, atmosphere, interaction glow, volume and sound
        preference. It also stores up to 12 saved sand drawings or constellations, their optional
        names, structured marks and small PNG previews.
      </p>
      <p>
        No account is required. We do not request your location, camera, microphone, health
        information, or contact details. The app includes no analytics, advertising, third-party
        trackers, or application cookies.
      </p>
      <h2>What leaves your device</h2>
      <p>
        Your creations and their names are not uploaded by the app. PNG exports download directly
        from your browser. Scripts, styles and other site files are requested from the hosting
        provider when you visit; the provider may process ordinary connection information such as IP
        address and request logs under its own policies. This is separate from the local-only
        creation system.
      </p>
      <p>
        Fonts use your system’s installed fonts. All scene art and sound are generated locally;
        there are no external art, music, font, or AI services embedded in the app.
      </p>
      <h2>Your controls</h2>
      <p>
        Delete individual creations in <Link href="/discover">Your Journal</Link>. To remove all app
        data, open Settings and choose “Clear all local data,” then confirm. You can also clear site
        data in your browser. Data is not synchronized across devices and may disappear when browser
        storage is cleared or unavailable. Export anything you want to keep.
      </p>
      <h2>Changes</h2>
      <p>
        If remote storage, analytics, or other services are added, this page must be updated before
        those features are enabled.
      </p>
    </main>
  );
}
