'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Settings } from './settings';
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="AZWARISM home">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <ellipse cx="20" cy="20" rx="8" ry="18" transform="rotate(45 20 20)" />
        <ellipse cx="20" cy="20" rx="8" ry="18" transform="rotate(-45 20 20)" />
        <circle cx="20" cy="20" r="3" />
      </svg>
      <span>
        AZWARISM<small>U N I V E R S E</small>
      </span>
    </Link>
  );
}
export function Navigation() {
  const path = usePathname();
  const [settings, setSettings] = useState(false),
    [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        document.querySelector<HTMLButtonElement>('.menu-button')?.focus();
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [menu]);
  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <header className="header">
        <Brand />
        <nav id="mobile-menu" aria-label="Main navigation" className={menu ? 'nav open' : 'nav'}>
          {[
            ['/universe', 'The Universe'],
            ['/discover', 'Your Journal'],
            ['/about', 'The idea'],
          ].map(([url, name]) => (
            <Link
              key={url}
              href={url}
              aria-current={path === url ? 'page' : undefined}
              onClick={() => setMenu(false)}
            >
              {name}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label="Open settings"
            onClick={() => setSettings(true)}
          >
            ⚙
          </button>
          <button
            className="menu-button"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => setMenu(!menu)}
          >
            {menu ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>
      {menu && (
        <button
          className="menu-dismiss"
          tabIndex={-1}
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      {settings && <Settings onClose={() => setSettings(false)} />}
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <span>
        © AZWARISM <span className="footer-tag"> / Move. Feel. Breathe. Play.</span>
      </span>
      <nav aria-label="Footer">
        <Link href="/about">About</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/accessibility">Accessibility</Link>
      </nav>
      <span className="quiet-dot">A little less noise.</span>
    </footer>
  );
}
