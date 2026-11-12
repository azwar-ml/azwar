'use client';
import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import { worlds } from '@/lib/worlds';
import { CosmicArt } from './cosmic-art';
import { WorldCard } from './world-card';
import { useUniverse } from './provider';
export function Hub() {
  const { state } = useUniverse();
  const [view, setView] = useState<'map' | 'directory'>('map');
  return (
    <main id="main" className="hub">
      <div className="hub-heading">
        <div>
          <p className="eyebrow">YOUR OWN SMALL COSMOS</p>
          <h1>Where will you wander?</h1>
          <p>Every world responds to you. Explore in any order.</p>
        </div>
        <div className="segmented" aria-label="Universe view">
          <button aria-pressed={view === 'map'} onClick={() => setView('map')}>
            Orbit map
          </button>
          <button aria-pressed={view === 'directory'} onClick={() => setView('directory')}>
            Directory
          </button>
        </div>
      </div>
      {view === 'map' && (
        <div className="universe-map">
          <CosmicArt evolved={state.visited.length} />
          <div className="core-caption">
            <span>THE UNIVERSE IS YOURS</span>
            <small>
              {state.visited.length
                ? 'A little more luminous with every visit.'
                : 'Begin anywhere.'}
            </small>
          </div>
          {worlds.map((w, i) => {
            const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
            return (
              <Link
                className="map-portal"
                key={w.id}
                href={`/worlds/${w.id}`}
                style={
                  {
                    '--world': w.color,
                    left: `${50 + Math.cos(a) * 37}%`,
                    top: `${47 + Math.sin(a) * 38}%`,
                  } as CSSProperties
                }
              >
                <div className={`portal-art art-${w.id}`} />
                <span>{w.name}</span>
                <small>{state.visited.includes(w.id) ? '✧ Visited · return' : w.verb + ' ↗'}</small>
              </Link>
            );
          })}
        </div>
      )}
      <section
        className={`section directory ${view === 'map' ? 'map-directory' : ''}`}
        aria-label="World directory"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">A DOOR IS ALWAYS OPEN</p>
            <h2>Choose a world.</h2>
          </div>
          <Link href="/discover" className="text-link">
            Your discoveries ↗
          </Link>
        </div>
        <div className="world-grid">
          {worlds.map((w) => (
            <WorldCard key={w.id} world={w} visited={state.visited.includes(w.id)} />
          ))}
        </div>
      </section>
      <p className="local-note">
        ✧ Your universe evolves gently as you explore. No order, no finish line.
      </p>
    </main>
  );
}
