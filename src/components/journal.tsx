'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useUniverse } from './provider';
import { worlds } from '@/lib/worlds';
import { WorldCard } from './world-card';
import { Confirm } from './dialog';
export function Journal() {
  const { state, remove, warning, update } = useUniverse();
  const [deleting, setDeleting] = useState<string | null>(null);
  return (
    <main id="main">
      <section className="journal-head section">
        <p className="eyebrow">A FEW THINGS TO TAKE WITH YOU</p>
        <h1>
          Your little
          <br />
          <em>discoveries.</em>
        </h1>
        <p>
          No milestones to chase. Just a record of the places you’ve wandered
          <br />
          and the moments you’ve made. Saved only on this device.
        </p>
        {warning && <p role="status">{warning}</p>}
      </section>
      <section className="section journal-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR CREATIONS</p>
            <h2>Quietly, you made this.</h2>
          </div>
          <p>
            Up to 12 recent creations. Export a PNG
            <br />
            to keep a copy outside this browser.
          </p>
        </div>
        {!state.creations.length ? (
          <div className="empty-state">
            <span aria-hidden="true">⌁</span>
            <h3>A little room for something yours.</h3>
            <p>
              Draw a pattern in the sand, or join a few stars.
              <br />
              Save it there and find it here.
            </p>
            <div className="actions">
              <Link className="button" href="/worlds/zen-garden">
                Visit Zen Garden ↗
              </Link>
              <Link className="button" href="/worlds/dream-sky">
                Visit Dream Sky ↗
              </Link>
            </div>
          </div>
        ) : (
          <div className="creation-grid">
            {state.creations.map((c) => (
              <article key={c.id} className="creation-card">
                <Image
                  unoptimized
                  src={c.image}
                  width={480}
                  height={320}
                  alt={`${c.world === 'zen-garden' ? 'Sand drawing' : 'Constellation'}: ${c.name}`}
                />
                <div className="card-info">
                  <p className="eyebrow">
                    {c.world === 'zen-garden' ? 'ZEN GARDEN' : 'DREAM SKY'} / LOCAL CREATION
                  </p>
                  <h3>{c.name}</h3>
                  <p>
                    {c.marks.length}{' '}
                    {c.world === 'zen-garden' ? 'marks and stones' : 'star connections'}
                  </p>
                  <div className="actions">
                    <a className="button" download={`azwarism-${c.world}.png`} href={c.image}>
                      Export PNG ↓
                    </a>
                    <Link className="button" href={`/worlds/${c.world}`}>
                      Restore in world ↗
                    </Link>
                    <button aria-label={`Delete ${c.name}`} onClick={() => setDeleting(c.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="section journal-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">PLACES YOU’VE WANDERED</p>
            <h2>Familiar little worlds.</h2>
          </div>
          <p>
            {state.visited.length
              ? 'Your visits add new lights to the Universe.'
              : 'Your first world is waiting whenever you are.'}
          </p>
        </div>
        <div className="world-grid">
          {worlds
            .filter((w) => state.visited.includes(w.id))
            .map((w) => (
              <WorldCard key={w.id} world={w} visited />
            ))}
        </div>
        {!state.visited.length && (
          <Link className="button" href="/universe">
            Find a world ↗
          </Link>
        )}
      </section>
      <section className="section journal-section">
        <p className="eyebrow">ATMOSPHERES TO KEEP</p>
        <h2>A different kind of light.</h2>
        <p>Always available. No unlocking needed.</p>
        <div className="theme-options">
          {[
            ['cosmic', 'Cosmic', '#b5a0ff'],
            ['tide', 'Tide', '#8de3d8'],
            ['rose', 'Afterglow', '#edaed6'],
          ].map(([id, label, color]) => (
            <button
              key={id}
              aria-pressed={state.preferences.theme === id}
              onClick={() => update({ theme: id as 'cosmic' | 'tide' | 'rose' })}
            >
              <span style={{ background: color }} /> {label}
            </button>
          ))}
        </div>
      </section>
      {deleting && (
        <Confirm
          title="Delete this creation?"
          onClose={() => setDeleting(null)}
          onConfirm={() => remove(deleting)}
        />
      )}
    </main>
  );
}
