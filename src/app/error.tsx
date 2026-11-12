'use client';
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="text-page">
      <p className="eyebrow">A MOMENT OUT OF ORBIT</p>
      <h1>Let’s try again.</h1>
      <p>Something interrupted this scene. Your saved creations should still be on this device.</p>
      <div className="actions">
        <button onClick={reset}>Try again</button>
        <Link className="button" href="/universe">
          Back to the Universe
        </Link>
      </div>
    </main>
  );
}
