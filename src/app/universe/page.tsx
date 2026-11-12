import { Hub } from '@/components/hub';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'The Universe', alternates: { canonical: '/universe' } };
export default function Page() {
  return <Hub />;
}
