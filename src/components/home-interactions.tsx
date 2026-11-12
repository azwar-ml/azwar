'use client';
import Link from 'next/link';
import { springTo, useSpringTarget, warmSprings } from './home-springs';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { Playground, type PlaygroundKind, type PlaygroundOptions } from '@/engine/playground';
import { useUniverse } from './provider';
import { worlds } from '@/lib/worlds';
const HomeMotion = createContext(false);

function MagneticLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  const moving = useContext(HomeMotion);
  const target = useSpringTarget<HTMLSpanElement>(moving);
  const [burst, setBurst] = useState(0);
  return (
    <span
      ref={target}
      className="magnetic-wrap"
      onPointerEnter={() => {
        if (moving) void warmSprings().catch(() => {});
      }}
      onPointerMove={(e) => {
        if (!moving || e.pointerType !== 'mouse') return;
        const b = e.currentTarget.getBoundingClientRect();
        void springTo(target.current, {
          x: (e.clientX - b.left - b.width / 2) * 0.09,
          y: (e.clientY - b.top - b.height / 2) * 0.12,
        });
      }}
      onPointerLeave={() => {
        void springTo(target.current, { x: 0, y: 0 });
      }}
    >
      <Link
        href={href}
        className={`button ${primary ? 'primary' : 'home-secondary'}`}
        onPointerDown={() => setBurst((v) => v + 1)}
      >
        {children}
        {burst > 0 && <span key={burst} className="button-burst" aria-hidden="true" />}
      </Link>
    </span>
  );
}
function LivingWord({ text, onActivate }: { text: string; onActivate: () => void }) {
  const moving = useContext(HomeMotion),
    [press, setPress] = useState(0);
  const target = useSpringTarget<HTMLButtonElement>(moving);
  const react = (active: boolean) => {
    if (!moving) return;
    target.current?.querySelectorAll<HTMLElement>('.spring-letter').forEach((letter, i) => {
      void springTo(
        letter,
        active
          ? { y: i % 2 ? -3 : 3, rotate: i % 2 ? 3 : -3, x: (i - (text.length - 1) / 2) * 0.7 }
          : { y: 0, rotate: 0, x: 0 },
        i * 0.025,
      );
    });
  };
  return (
    <button
      ref={target}
      className={`living-word word-${text}`}
      aria-label={`${text}: stir the universe`}
      onPointerEnter={() => react(true)}
      onPointerLeave={() => react(false)}
      onFocus={() => react(true)}
      onBlur={() => react(false)}
      onClick={() => {
        setPress((v) => v + 1);
        onActivate();
      }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split('').map((letter, i) => (
          <span key={i} className="spring-letter">
            {letter}
          </span>
        ))}
      </span>
      {press > 0 && <span key={press} className="word-glow" aria-hidden="true" />}
    </button>
  );
}
export function PlaySurface({
  kind,
  calm,
  pulse = 0,
  hero = false,
}: {
  kind: PlaygroundKind;
  calm: boolean;
  pulse?: number;
  hero?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    engine = useRef<Playground | null>(null);
  const {
    moving,
    state: { preferences: p },
  } = useUniverse();
  const [paused, setPaused] = useState(false),
    [sceneReady, setSceneReady] = useState(false),
    [guided, setGuided] = useState(false),
    [status, setStatus] = useState(''),
    [error, setError] = useState('');
  const initial = useRef<PlaygroundOptions>({
    moving: false,
    ambient: false,
    battery: true,
    feedback: 0.65,
    paused: false,
  });
  useEffect(() => {
    if (!canvas.current) return;
    let readyFrame = 0;
    try {
      engine.current = new Playground(canvas.current, kind, initial.current, setStatus);
      readyFrame = requestAnimationFrame(() => setSceneReady(true));
    } catch (e) {
      queueMicrotask(() =>
        setError(e instanceof Error ? e.message : 'Scene unavailable. Explore the worlds below.'),
      );
    }
    return () => {
      cancelAnimationFrame(readyFrame);
      engine.current?.destroy();
      engine.current = null;
    };
  }, [kind]);
  useEffect(() => {
    engine.current?.configure({
      moving: moving && !calm,
      ambient: p.ambient && !calm,
      battery:
        p.quality === 'battery' ||
        (p.quality === 'auto' && matchMedia('(pointer: coarse)').matches),
      feedback: p.feedback,
      paused,
    });
  }, [moving, p.ambient, p.quality, p.feedback, paused, calm]);
  useEffect(() => {
    if (pulse > 0) engine.current?.action();
  }, [pulse]);
  const data = {
    hero: {
      action: 'Scatter the universe',
      instruction: 'Drag to turn. Tap to scatter. Everything finds its way back.',
      title: 'Living aurora core',
    },
    stars: {
      action: 'Connect next star',
      instruction: 'Drag the stars. Select two to connect them.',
      title: 'Touch the Stars',
    },
    light: {
      action: 'Paint a light ribbon',
      instruction: 'Move or drag to leave a little light behind.',
      title: 'Shape the Light',
    },
    puzzle: {
      action: 'Snap next fragment',
      instruction: 'Drag a fragment to a glowing outline. Feel it find its place.',
      title: 'Puzzle Mind',
    },
    break: {
      action: 'Break & reform',
      instruction: 'Tap to scatter the pieces. Watch them return, softly.',
      title: 'Break the Silence',
    },
    calm: {
      action: 'Next comfortable breath',
      instruction: 'Follow your own comfortable pace. Stop whenever you like.',
      title: 'A softer orbit',
    },
  }[kind];
  return (
    <div className={`play-surface surface-${kind}`} data-playground={kind}>
      <div className={`play-canvas-wrap ${sceneReady ? 'scene-ready' : ''}`}>
        {hero && (
          <svg className="core-fallback" viewBox="0 0 600 600" aria-hidden="true">
            <defs>
              <radialGradient id="first-core-light">
                <stop stopColor="#a778ff" stopOpacity=".25" />
                <stop offset="1" stopColor="#7b38ff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="300" cy="300" r="270" fill="url(#first-core-light)" />
            <g transform="translate(300 300) rotate(-25)">
              {Array.from({ length: 18 }, (_, i) => (
                <ellipse
                  key={i}
                  rx={190 - i * 3.6}
                  ry={140 - i * 4.1}
                  fill="none"
                  stroke={`hsl(${190 + i * 6},90%,75%)`}
                  strokeOpacity=".45"
                  strokeWidth={i % 5 === 0 ? 1.7 : 0.8}
                />
              ))}
            </g>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <path
                  key={i}
                  d="M-8 -10 L9 -7 L6 10 L-7 6Z"
                  fill={i % 2 ? '#a77bff33' : '#76edff33'}
                  stroke={i % 2 ? '#d69cff' : '#76edff'}
                  strokeWidth=".8"
                  transform={`translate(${300 + Math.cos(a) * 225} ${300 + Math.sin(a) * 170}) rotate(${i * 28})`}
                />
              );
            })}
          </svg>
        )}
        <canvas
          ref={canvas}
          tabIndex={0}
          aria-label={`${data.title}. ${data.instruction} Enter or Space: ${data.action}. Arrows move the selected star or fragment. P pauses.`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              engine.current?.action();
            } else if (e.key.toLowerCase() === 'p') {
              e.preventDefault();
              setPaused((v) => !v);
            } else if (e.key.startsWith('Arrow')) {
              e.preventDefault();
              engine.current?.nudge(
                e.key === 'ArrowLeft' ? -0.025 : e.key === 'ArrowRight' ? 0.025 : 0,
                e.key === 'ArrowUp' ? -0.025 : e.key === 'ArrowDown' ? 0.025 : 0,
              );
            }
          }}
        />
        {hero && (
          <>
            <span className="core-tag core-tag-one">01 / AURORA CORE</span>
            <span className="core-tag core-tag-two">
              <i /> LIVE · RESPONSIVE TO YOU
            </span>
            <span className="core-axis" aria-hidden="true">
              ＋
            </span>
          </>
        )}
        {error && (
          <p className="play-fallback" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="play-controls">
        <button
          className={hero ? 'core-action' : 'play-action'}
          onClick={() => engine.current?.action()}
          disabled={paused}
        >
          {data.action}
          <span aria-hidden="true">{hero ? '✳' : '↗'}</span>
        </button>
        <button
          className="play-pause"
          aria-label={`${paused ? 'Resume' : 'Pause'} ${data.title}`}
          aria-pressed={paused}
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? '▶' : 'Ⅱ'}
        </button>
        {!hero && (
          <button
            className="play-reset"
            aria-label={`Reset ${data.title}`}
            onClick={() => {
              engine.current?.reset();
              setGuided(false);
            }}
          >
            ↺
          </button>
        )}
        {kind === 'calm' && (
          <button
            className="play-guide"
            aria-pressed={guided}
            onClick={() => {
              engine.current?.guide(!guided);
              setGuided((v) => !v);
            }}
          >
            {guided ? 'Stop guide' : 'Gentle guide'}
          </button>
        )}
      </div>
      <p className="play-instruction">{data.instruction}</p>
      <p className="play-status sr-only" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
function PortalCard({ world, index }: { world: (typeof worlds)[number]; index: number }) {
  const moving = useContext(HomeMotion);
  const target = useSpringTarget<HTMLDivElement>(moving);
  return (
    <div
      ref={target}
      className="play-portal-wrap"
      onPointerEnter={() => {
        if (moving) void warmSprings().catch(() => {});
      }}
      onPointerMove={(e) => {
        if (!moving || e.pointerType !== 'mouse') return;
        const b = e.currentTarget.getBoundingClientRect();
        void springTo(target.current, {
          rotateX: (0.5 - (e.clientY - b.top) / b.height) * 7,
          rotateY: ((e.clientX - b.left) / b.width - 0.5) * 7,
        });
      }}
      onPointerLeave={() => {
        void springTo(target.current, { rotateX: 0, rotateY: 0 });
      }}
    >
      <Link
        className="play-portal"
        href={`/worlds/${world.id}`}
        style={{ '--world': world.color } as CSSProperties}
      >
        <div className="portal-card-top">
          <span>
            0{index + 1} / {world.kind}
          </span>
          <span aria-hidden="true">↗</span>
        </div>
        <div className="card-art">
          <div className={`portal-art art-${world.id}`} />
        </div>
        <h3>{world.name}</h3>
        <p>{world.verb}</p>
      </Link>
    </div>
  );
}
const rooms: {
  kind: PlaygroundKind;
  index: string;
  title: string;
  copy: string;
  tag: string;
  color: string;
}[] = [
  {
    kind: 'stars',
    index: '01',
    title: 'Touch the Stars',
    copy: 'A sky with no right answers. Move a star. Make a connection. Leave a shape that feels like you.',
    tag: 'DRAG · CONNECT · WANDER',
    color: '#a78bff',
  },
  {
    kind: 'light',
    index: '02',
    title: 'Shape the Light',
    copy: 'Your smallest movement, made luminous. Draw a little energy into the dark and watch it dissolve.',
    tag: 'MOVE · PAINT · LET GO',
    color: '#76edff',
  },
  {
    kind: 'puzzle',
    index: '03',
    title: 'Puzzle Mind',
    copy: 'Some things just click. Bring the wandering fragments together, one satisfying little moment at a time.',
    tag: 'DRAG · SNAP · REARRANGE',
    color: '#ff9bd6',
  },
  {
    kind: 'break',
    index: '04',
    title: 'Break the Silence',
    copy: 'A little beautiful chaos. Scatter the pieces, then let them find their way back. Nothing here stays broken.',
    tag: 'TAP · SCATTER · REFORM',
    color: '#ab94ff',
  },
];
export function HomePlayground() {
  const {
    moving,
    state: { preferences: p },
  } = useUniverse();
  const [calm, setCalm] = useState(false),
    [pulse, setPulse] = useState(0);
  const animate = moving && p.ambient && !calm;
  return (
    <HomeMotion.Provider value={animate}>
      <main id="main" className={`living-home ${calm ? 'is-calm' : ''}`}>
        <section className="living-hero" aria-label="An interactive little universe">
          <div className="hero-copy-new">
            <p className="eyebrow">YOUR LITTLE ESCAPE IS ALIVE</p>
            <h1>
              <span className="headline-line">
                <span>A little </span>
                <LivingWord text="escape" onActivate={() => setPulse((v) => v + 1)} />
              </span>
              <span className="headline-line">
                <span>from the </span>
                <LivingWord text="noise" onActivate={() => setPulse((v) => v + 1)} />
                <span className="headline-dot">.</span>
              </span>
            </h1>
            <p className="hero-description">
              Move something. Make a little magic.
              <br />
              An entire universe, waiting to play with you.
            </p>
            <div className="actions hero-entry">
              <MagneticLink primary href="/universe">
                Enter the Universe <span aria-hidden="true">↗</span>
              </MagneticLink>
              <MagneticLink href="#play">
                Try a little magic <span aria-hidden="true">↓</span>
              </MagneticLink>
            </div>
            <div className="home-presence">
              <span className="presence-orbit" aria-hidden="true">
                ✧
              </span>
              <span>NO ACCOUNTS. NO SCORES. NO RIGHT WAY.</span>
            </div>
          </div>
          <div className="hero-live-art">
            <PlaySurface kind="hero" calm={calm} pulse={pulse} hero />
          </div>
          <div className="hero-live-bottom">
            <span>
              MOVE. FEEL. BREATHE. <b>PLAY.</b>
            </span>
            <button className="calm-toggle" aria-pressed={calm} onClick={() => setCalm((v) => !v)}>
              <span aria-hidden="true">{calm ? '◒' : '✳'}</span>
              {calm ? 'Playful mode' : 'Calm mode'}
              <i />
            </button>
            <a href="#play">
              THERE’S MORE TO TOUCH <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>
        <div className="play-ribbon" aria-hidden="true">
          <span>A LITTLE CURIOSITY</span>
          <i>✧</i>
          <span>A LITTLE CHAOS</span>
          <i>✧</i>
          <span>A LITTLE COLOR</span>
          <i>✧</i>
          <span>A LITTLE YOU</span>
        </div>
        <section id="play" className="home-play-section">
          <div className="home-section-title">
            <div>
              <p className="eyebrow">THIS ISN’T A SPECTATOR SPORT</p>
              <h2>
                Don’t just look.
                <br />
                <em>Make something happen.</em>
              </h2>
            </div>
            <p>
              No tutorial. No finish line.
              <br />
              Just follow that little “what if?”
            </p>
          </div>
          <div className="play-rooms">
            {rooms.map((room) => (
              <article
                className={`play-room room-${room.kind}`}
                key={room.kind}
                style={{ '--room': room.color } as CSSProperties}
              >
                <div className="room-heading">
                  <p className="room-index">
                    EXPERIMENT {room.index}
                    <span>{room.tag}</span>
                  </p>
                  <h3>{room.title}</h3>
                  <p>{room.copy}</p>
                </div>
                <PlaySurface kind={room.kind} calm={calm} />
              </article>
            ))}
          </div>
        </section>
        <section className="home-calm-zone">
          <div className="calm-copy">
            <p className="eyebrow">OR, JUST BE HERE</p>
            <h2>
              A softer
              <br />
              <em>kind of wonder.</em>
            </h2>
            <p>
              Even a universe needs a quiet corner.
              <br />
              Nothing to follow. Nothing to get right.
            </p>
            <button className="button" aria-pressed={calm} onClick={() => setCalm((v) => !v)}>
              {calm ? 'Return to playful mode' : 'Soften this playground'}
              <span aria-hidden="true">◒</span>
            </button>
          </div>
          <PlaySurface kind="calm" calm={calm} />
        </section>
        <section className="home-worlds" id="worlds">
          <div className="home-section-title">
            <div>
              <p className="eyebrow">GO A LITTLE DEEPER</p>
              <h2>
                Eight worlds.
                <br />
                <em>Endless little possibilities.</em>
              </h2>
            </div>
            <Link className="text-link" href="/universe">
              Explore the whole universe <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="play-world-grid">
            {worlds.map((world, i) => (
              <PortalCard key={world.id} world={world} index={i} />
            ))}
          </div>
        </section>
        <section className="home-last-call">
          <span className="last-sigil" aria-hidden="true">
            ✳
          </span>
          <p className="eyebrow">SOMETHING BEAUTIFUL HAPPENS WHEN YOU PLAY</p>
          <h2>
            Leave the noise.
            <br />
            <em>Keep the wonder.</em>
          </h2>
          <MagneticLink primary href="/universe">
            Your universe is open <span aria-hidden="true">↗</span>
          </MagneticLink>
          <p>Stay a minute. Stay curious. Leave whenever you like.</p>
        </section>
      </main>
    </HomeMotion.Provider>
  );
}
