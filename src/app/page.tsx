import Link from 'next/link';
import { CosmicArt } from '@/components/cosmic-art';
import { WorldCard } from '@/components/world-card';
import { worlds } from '@/lib/worlds';
import type { Metadata } from 'next';
export const metadata: Metadata = { alternates: { canonical: '/' } };
export default function Home() {
  return (
    <main id="main">
      <section className="hero">
        <div className="hero-art">
          <CosmicArt />
          <span className="orbit-label label-one">FIG. 001 — A UNIVERSE IN YOU</span>
          <span className="orbit-label label-two">∞ POSSIBILITIES / ZERO EXPECTATIONS</span>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">WELCOME TO YOUR LITTLE UNIVERSE</p>
          <h1>
            A little escape
            <br />
            from the <em>noise.</em>
          </h1>
          <p className="hero-sub">
            Touch the stars. Shape the light.
            <br />
            Make a moment your own.
          </p>
          <div className="actions">
            <Link className="button primary" href="/universe">
              Enter the Universe <span>↗</span>
            </Link>
            <a className="text-link" href="#worlds">
              Explore the worlds <span>↓</span>
            </a>
          </div>
          <div className="hero-note">
            <span className="little-star">✧</span> No accounts. No rush. Just you.
          </div>
        </div>
        <div className="hero-bottom">
          <span>MOVE. FEEL. BREATHE. PLAY.</span>
          <span className="pointer-copy">
            Move or touch to play <span>↗</span>
          </span>
          <span>SCROLL TO WANDER ↓</span>
        </div>
      </section>
      <section className="intro-strip">
        <span>
          NOT ANOTHER FEED.
          <br />
          <strong>A space to feel.</strong>
        </span>
        <p>
          Somewhere between a playground and a daydream.
          <br />
          Eight small worlds that respond to you.
          <br />
          Nothing to win. Nowhere you have to be.
        </p>
        <span className="intro-sigil" aria-hidden="true">
          ✳
        </span>
      </section>
      <section className="section" id="worlds">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EIGHT WAYS TO WANDER</p>
            <h2>Follow your curiosity.</h2>
          </div>
          <p>
            Each world is a different kind of quiet.
            <br />
            Start wherever you feel like.
          </p>
        </div>
        <div className="world-grid">
          {worlds.map((w) => (
            <WorldCard key={w.id} world={w} />
          ))}
        </div>
      </section>
      <section className="closing">
        <p className="eyebrow">A MOMENT, MADE YOURS</p>
        <h2>
          The world can wait
          <br />
          <em>a little.</em>
        </h2>
        <Link href="/universe" className="button primary">
          Find your first world ↗
        </Link>
        <p>Leave whenever you like. Come back as you are.</p>
      </section>
    </main>
  );
}
