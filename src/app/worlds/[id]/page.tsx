import { notFound } from 'next/navigation';
import { isWorldId, worlds } from '@/lib/worlds';
import { WorldLoader } from '@/components/world-loader';
import type { Metadata } from 'next';
export function generateStaticParams() {
  return worlds.map((w) => ({ id: w.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const w = worlds.find((w) => w.id === id);
  return {
    title: w?.name ?? 'World not found',
    description: w?.description,
    alternates: { canonical: `/worlds/${id}` },
  };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isWorldId(id)) notFound();
  return <WorldLoader id={id} />;
}
