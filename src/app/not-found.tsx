import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" className="text-page">
      <p className="eyebrow">404 / A LITTLE OFF ORBIT</p>
      <h1>
        There’s still
        <br />a way home.
      </h1>
      <p>This corner of the universe hasn’t been mapped. Find a familiar world, or begin again.</p>
      <div className="actions">
        <Link className="button primary" href="/universe">
          Back to the Universe ↗
        </Link>
        <Link className="button" href="/">
          Home
        </Link>
      </div>
    </main>
  );
}
