import type { Metadata } from 'next';
import { Journal } from '@/components/journal';
export const metadata: Metadata = { title: 'Your Journal', alternates: { canonical: '/discover' } };
export default function Page() {
  return <Journal />;
}
