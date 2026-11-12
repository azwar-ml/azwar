import Link from 'next/link';
import type { CSSProperties } from 'react';
import { worlds } from '@/lib/worlds';
export function WorldCard({
  world: w,
  visited = false,
}: {
  world: (typeof worlds)[number];
  visited?: boolean;
}) {
  return (
    <Link
      href={`/worlds/${w.id}`}
      className="world-card"
      style={{ '--world': w.color } as CSSProperties}
    >
      <div className="card-art">
        <div className={`portal-art art-${w.id}`} />
        <span className="card-arrow" aria-hidden="true">
          ↗
        </span>
      </div>
      <div className="card-info">
        <p className="eyebrow">
          {w.kind}
          {visited ? ' / VISITED' : ' / OPEN TO EXPLORE'}
        </p>
        <h3>{w.name}</h3>
        <p>{w.description}</p>
      </div>
    </Link>
  );
}
