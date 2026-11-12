import { HomePlayground } from '@/components/home-interactions';
import type { Metadata } from 'next';
import './home.css';
export const metadata: Metadata = { alternates: { canonical: '/' } };
export default function Home() {
  return <HomePlayground />;
}
