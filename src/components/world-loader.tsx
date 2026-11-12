'use client';
import dynamic from 'next/dynamic';
import type { WorldId } from '@/lib/worlds';
const World = dynamic(() => import('./world'), {
  ssr: false,
  loading: () => (
    <div className="text-page" role="status">
      <p className="eyebrow">FINDING YOUR ORBIT</p>
      <h2>A small world is taking shape.</h2>
    </div>
  ),
});
export function WorldLoader({ id }: { id: WorldId }) {
  return <World key={id} id={id} />;
}
