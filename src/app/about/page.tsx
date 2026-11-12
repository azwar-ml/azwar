import Link from 'next/link';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'The Idea', alternates: { canonical: '/about' } };
export default function Page() {
  return (
    <main id="main" className="text-page">
      <p className="eyebrow">THE IDEA / AZWARISM</p>
      <h1>
        A little more wonder.
        <br />A little less noise.
      </h1>
      <p>
        AZWARISM UNIVERSE is an interactive digital playground. A place to move light, draw in sand,
        make tiny waves, and see what happens when you follow your curiosity.
      </p>
      <h2>Move. Feel. Breathe. Play.</h2>
      <p>
        Eight worlds, each with its own pace. There’s no account to create, no score to keep, and no
        correct order. Every world is open from the beginning. Your visits gently change the light
        in the central universe.
      </p>
      <p>
        The art is generated in your browser. Your saved drawings and constellations stay on this
        device. Sound starts off, and motion can be reduced whenever you like.
      </p>
      <h2>Come as you are.</h2>
      <p>
        You can stay a minute or leave immediately. This is creative play, not medical treatment or
        a promise to change how you feel. Follow your own comfortable pace.
      </p>
      <Link className="button primary" href="/universe">
        Find a little wonder ↗
      </Link>
    </main>
  );
}
