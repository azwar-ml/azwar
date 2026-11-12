'use client';
/* eslint-disable react-hooks/set-state-in-effect -- Synchronize the imperative canvas/audio lifecycle with React and surface initialization errors. */
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { worlds, type WorldId, type Palette } from '@/lib/worlds';
import { localPoint } from '@/lib/math';
import { initialConfig, Scene, type Config, type Metrics } from '@/engine/scene';
import { AudioManager } from '@/engine/audio';
import { useUniverse } from './provider';
import { Dialog, Confirm } from './dialog';
import { Settings } from './settings';
const modes: Partial<Record<WorldId, string[]>> = {
  particles: ['Attract', 'Repel', 'Swirl', 'Draw / Trail'],
  liquid: ['Jelly', 'Flow', 'Morph'],
  'zen-garden': ['Rake', 'Stone', 'Erase'],
  gravity: ['Attract', 'Repel'],
  breathing: ['Free / Manual', 'Gentle Guide'],
};
const actionNames: Record<WorldId, string> = {
  particles: 'Stir the light',
  liquid: 'Give a gentle push',
  bubbles: 'Release / pop a bubble',
  'zen-garden': 'Add a rake pattern',
  ocean: 'Make a ripple',
  'dream-sky': 'Next star',
  gravity: 'Release an orb',
  breathing: 'Next breath',
};
export default function World({ id }: { id: WorldId }) {
  const w = worlds.find((w) => w.id === id)!;
  const store = useUniverse();
  const { state, ready, visit, moving } = store;
  const canvas = useRef<HTMLCanvasElement>(null),
    scene = useRef<Scene | null>(null),
    audio = useRef<AudioManager | null>(null);
  const [config, setConfig] = useState(() => initialConfig(id));
  const [paused, setPaused] = useState(false),
    [help, setHelp] = useState(false),
    [settings, setSettings] = useState(false),
    [clear, setClear] = useState(false),
    [status, setStatus] = useState('Your world is ready. Make a small moment.'),
    [error, setError] = useState(''),
    [name, setName] = useState(''),
    [sound, setSound] = useState(false),
    [debug, setDebug] = useState(false),
    [metrics, setMetrics] = useState<Metrics | null>(null),
    [controls, setControls] = useState(false);
  const [eraseAll, setEraseAll] = useState(false);
  const fullConfig = {
    ...config,
    moving,
    ambient: state.preferences.ambient,
    quality: state.preferences.quality,
    feedback: state.preferences.feedback,
  };
  const configRef = useRef(fullConfig);
  useEffect(() => {
    configRef.current = fullConfig;
  });
  const set = <K extends keyof Config>(key: K, value: Config[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));
  useEffect(() => {
    if (ready) visit(id);
  }, [ready, visit, id]);
  useEffect(() => {
    if (!canvas.current) return;
    setDebug(new URLSearchParams(location.search).get('debug') === '1');
    try {
      scene.current = new Scene(
        canvas.current,
        id,
        configRef.current,
        setStatus,
        setMetrics,
        (frequency) => audio.current?.chime(frequency),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'This browser could not open the drawing surface.');
    }
    return () => {
      scene.current?.destroy();
      scene.current = null;
      void audio.current?.destroy();
      audio.current = null;
    };
  }, [id]);
  useEffect(() => {
    scene.current?.setConfig(fullConfig);
  });
  useEffect(() => {
    scene.current?.setPaused(paused);
    if (paused) audio.current?.suspend();
    else if (sound && !document.hidden) audio.current?.resume();
  }, [paused, sound]);
  useEffect(() => {
    audio.current?.volume(state.preferences.volume);
  }, [state.preferences.volume]);
  useEffect(() => {
    if (!state.preferences.sound && sound) {
      audio.current?.suspend();
      setSound(false);
    }
  }, [state.preferences.sound, sound]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) audio.current?.suspend();
      else if (sound && !paused) audio.current?.resume();
    };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [sound, paused]);
  const toggleSound = async () => {
    if (sound) {
      audio.current?.suspend();
      setSound(false);
      store.update({ sound: false });
    } else {
      try {
        audio.current ??= new AudioManager();
        await audio.current.enable(state.preferences.volume);
        if (paused) audio.current.suspend();
        setSound(true);
        store.update({ sound: true });
      } catch {
        setStatus('Sound is unavailable in this browser. You can still play.');
      }
    }
  };
  const save = () => {
    if (!scene.current || (id !== 'zen-garden' && id !== 'dream-sky')) return;
    const image = scene.current.preview();
    if (image.length > 220000) {
      setStatus('This preview is too large to save. Please export a PNG instead.');
      return;
    }
    store.save({
      id: crypto.randomUUID(),
      world: id,
      name:
        name.trim().slice(0, 80) ||
        (id === 'zen-garden' ? 'A small patch of quiet' : 'My little constellation'),
      marks: scene.current.getMarks(),
      image,
    });
    setStatus('Saved to your journal on this device. Up to 12 recent creations are kept.');
  };
  const pointer = (type: 'down' | 'move' | 'up', e: React.PointerEvent<HTMLCanvasElement>) => {
    if (type === 'down') {
      e.currentTarget.focus({ preventScroll: true });
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    scene.current?.pointer(
      type,
      localPoint(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect()),
      e.pressure || 0.5,
    );
    if (type === 'up' && e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const keyboard = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (e.key.startsWith('Arrow')) {
      e.preventDefault();
      scene.current?.nudge(
        e.key === 'ArrowLeft' ? -0.025 : e.key === 'ArrowRight' ? 0.025 : 0,
        e.key === 'ArrowUp' ? -0.025 : e.key === 'ArrowDown' ? 0.025 : 0,
      );
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      scene.current?.action();
    } else if (e.key.toLowerCase() === 'p') setPaused((v) => !v);
    else if (e.key.toLowerCase() === 'r') setClear(true);
    else if (e.key === 'Delete') scene.current?.removeStone();
    else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      scene.current?.undo();
    }
  };
  const range = (
    key: 'intensity' | 'density' | 'size' | 'speed' | 'calm' | 'trails' | 'brush' | 'pace',
    label: string,
    min: number,
    max: number,
    step = 1,
  ) => (
    <label className="field" key={key}>
      {label}{' '}
      <span aria-hidden="true" className="range-value">
        {config[key]}
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={config[key]}
        onChange={(e) => set(key, +e.target.value)}
      />
    </label>
  );
  return (
    <main
      id="main"
      className={`world-page world-${id}`}
      style={{ '--world': w.color } as React.CSSProperties}
    >
      <div className="world-heading">
        <Link href="/universe" className="back-link">
          ← Universe
        </Link>
        <div>
          <p className="eyebrow">
            {w.kind} / {String(worlds.indexOf(w) + 1).padStart(2, '0')}
          </p>
          <h1>{w.name}</h1>
        </div>
        <p>
          {w.verb}.<br />
          <span>Stay for a moment. Leave whenever.</span>
        </p>
      </div>
      <div className="scene-layout">
        <section className="stage" aria-label={`${w.name} interactive stage`}>
          <canvas
            ref={canvas}
            tabIndex={0}
            aria-label={`${w.name}. ${w.instruction} Space or Enter: ${actionNames[id]}. Arrow keys move the interaction point. P pauses. R resets.`}
            aria-describedby="scene-instruction"
            onPointerDown={(e) => pointer('down', e)}
            onPointerMove={(e) => pointer('move', e)}
            onPointerUp={(e) => pointer('up', e)}
            onPointerCancel={(e) => pointer('up', e)}
            onLostPointerCapture={(e) =>
              scene.current?.pointer(
                'up',
                localPoint(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect()),
              )
            }
            onKeyDown={keyboard}
          />
          <div className="stage-caption">
            <span>AZ / {w.glyph}</span>
            <span>
              {paused
                ? 'PAUSED · TAKE YOUR TIME'
                : !moving
                  ? 'MINIMAL MOTION · STILL YOURS TO PLAY'
                  : 'A MOMENT, MADE BY YOU'}
            </span>
          </div>
          {error && (
            <div className="scene-error" role="alert">
              <h2>A quieter fallback.</h2>
              <p>{error}</p>
              <Link className="button" href="/universe">
                Back to the Universe
              </Link>
            </div>
          )}
          {id === 'breathing' && (
            <div className="breath-text">
              <p>{w.instruction}</p>
              <span>
                {config.mode === 'Gentle Guide'
                  ? `${config.pace} seconds in / ${config.pace} seconds out. No holds.`
                  : 'Manual mode. No timer to follow.'}
              </span>
            </div>
          )}
          {debug && (
            <pre className="debug">
              {JSON.stringify({ ...metrics, mode: 'Canvas 2D', paused, moving }, null, 2)}
            </pre>
          )}
        </section>
        <aside
          className={`world-controls ${controls ? 'expanded' : ''}`}
          aria-label="World controls"
        >
          <button
            className="controls-toggle"
            aria-expanded={controls}
            onClick={() => setControls(!controls)}
          >
            {controls ? 'Close controls ↓' : 'Shape this world ↑'}
          </button>
          <div className="controls-body">
            <p className="eyebrow">MAKE IT YOUR OWN</p>
            {modes[id] && (
              <div className="mode-group" aria-label="Interaction mode">
                {modes[id]!.map((m) => (
                  <button key={m} aria-pressed={config.mode === m} onClick={() => set('mode', m)}>
                    {m}
                  </button>
                ))}
              </div>
            )}
            {id !== 'zen-garden' && (
              <label className="field">
                Palette
                <select
                  value={config.palette}
                  onChange={(e) => set('palette', e.target.value as Palette)}
                >
                  {(id === 'ocean'
                    ? ['Daylight', 'Twilight', 'Moonlight']
                    : ['Aurora', 'Starlight', 'Rose Nebula', 'Ocean Mist']
                  ).map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
            )}
            {['particles', 'liquid', 'ocean', 'gravity'].includes(id) &&
              range(
                'intensity',
                id === 'gravity'
                  ? 'Gravity strength'
                  : id === 'liquid'
                    ? 'Sensitivity'
                    : 'Intensity',
                0.2,
                2,
                0.1,
              )}
            {['bubbles', 'ocean', 'dream-sky', 'gravity'].includes(id) &&
              range(
                'density',
                id === 'gravity' ? 'Object count' : id === 'dream-sky' ? 'Star density' : 'Density',
                8,
                64,
              )}
            {id === 'bubbles' && range('size', 'Bubble size', 15, 65)}
            {['bubbles', 'gravity'].includes(id) && range('speed', 'Drift speed', 0.2, 2, 0.1)}
            {id === 'gravity' && range('trails', 'Trail length', 0, 1, 0.05)}
            {id === 'ocean' && (
              <>
                {range('calm', 'Calmness', 0, 1, 0.1)}
                <label className="check">
                  <input
                    type="checkbox"
                    checked={config.rain}
                    onChange={(e) => set('rain', e.target.checked)}
                  />{' '}
                  Gentle rain
                </label>
              </>
            )}
            {id === 'dream-sky' && (
              <label className="check">
                <input
                  type="checkbox"
                  checked={config.shooting}
                  onChange={(e) => set('shooting', e.target.checked)}
                />{' '}
                Shooting stars
              </label>
            )}
            {id === 'zen-garden' && (
              <>
                {range('brush', 'Brush / stone size', 3, 25)}
                <label className="field">
                  Line style
                  <select
                    value={config.lineStyle}
                    onChange={(e) => set('lineStyle', e.target.value)}
                  >
                    {['Fine rake', 'Wide groove', 'Single line'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <button
                  onClick={() => {
                    set('mode', 'Stone');
                    scene.current?.setConfig({ ...fullConfig, mode: 'Stone' });
                    scene.current?.action();
                  }}
                >
                  Add / select a stone
                </button>
                <div className="nudge-group" aria-label="Move selected stone">
                  {[
                    ['←', -0.025, 0],
                    ['↑', 0, -0.025],
                    ['↓', 0, 0.025],
                    ['→', 0.025, 0],
                  ].map(([label, x, y]) => (
                    <button
                      key={label}
                      aria-label={`Nudge stone ${label}`}
                      onClick={() => scene.current?.nudge(+x, +y)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button onClick={() => scene.current?.removeStone()}>Remove selected stone</button>
              </>
            )}
            {id === 'gravity' && (
              <div className="nudge-group" aria-label="Move gravity well">
                {[
                  ['←', -0.04, 0],
                  ['↑', 0, -0.04],
                  ['↓', 0, 0.04],
                  ['→', 0.04, 0],
                ].map(([label, x, y]) => (
                  <button
                    key={label}
                    aria-label={`Move well ${label}`}
                    onClick={() => scene.current?.nudge(+x, +y)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {id === 'breathing' && (
              <>
                {range('pace', 'Seconds per breath phase', 3, 8)}
                <button onClick={() => scene.current?.skip()}>Skip this phase</button>
                <button
                  onClick={() => {
                    set('mode', 'Free / Manual');
                    setPaused(true);
                    setStatus('Guide stopped. Rest for as long as you like.');
                  }}
                >
                  Stop guide
                </button>
              </>
            )}
            <button
              className="primary scene-action"
              onClick={() => scene.current?.action()}
              disabled={paused}
            >
              {id === 'zen-garden' && config.mode === 'Stone'
                ? 'Place / select a stone'
                : actionNames[id]}{' '}
              <span>✧</span>
            </button>
            {['bubbles', 'gravity'].includes(id) && (
              <button onClick={() => scene.current?.clear()}>
                Clear {id === 'bubbles' ? 'bubbles' : 'objects'}
              </button>
            )}
            {['zen-garden', 'dream-sky'].includes(id) && (
              <button onClick={() => setEraseAll(true)}>Clear creation</button>
            )}
            {id === 'particles' && (
              <button
                onClick={() => {
                  const choices = modes.particles!;
                  setConfig((c) => ({
                    ...c,
                    mode: choices[(choices.indexOf(c.mode) + 1) % choices.length],
                    palette: c.palette === 'Aurora' ? 'Rose Nebula' : 'Aurora',
                    intensity: 1.4,
                  }));
                  scene.current?.action();
                  setStatus('A new arrangement of light.');
                }}
              >
                Surprise me ↗
              </button>
            )}
            {['zen-garden', 'dream-sky'].includes(id) && (
              <>
                <div className="actions history">
                  <button onClick={() => scene.current?.undo()}>Undo</button>
                  <button onClick={() => scene.current?.redo()}>Redo</button>
                </div>
                <label className="field">
                  Creation name · optional
                  <input
                    type="text"
                    maxLength={80}
                    value={name}
                    placeholder="A small moment"
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <button onClick={save}>Save to journal ↗</button>
                <button onClick={() => scene.current?.export()}>Export PNG ↓</button>
                {state.creations.filter((c) => c.world === id).length > 0 && (
                  <label className="field">
                    Restore a saved creation
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const c = state.creations.find((c) => c.id === e.target.value);
                        if (c) {
                          scene.current?.load(c.marks);
                          setName(c.name);
                        }
                        e.target.value = '';
                      }}
                    >
                      <option value="" disabled>
                        Choose a creation…
                      </option>
                      {state.creations
                        .filter((c) => c.world === id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
              </>
            )}
            <p className="controls-foot">No right way to play.</p>
          </div>
        </aside>
      </div>
      <div className="world-toolbar" aria-label="Scene toolbar">
        <div className="actions">
          <button onClick={() => setPaused((v) => !v)}>{paused ? '▶ Resume' : 'Ⅱ Pause'}</button>
          <button onClick={() => setClear(true)}>Reset</button>
          <button onClick={() => setHelp(true)}>Help</button>
        </div>
        <div className="actions">
          <button onClick={toggleSound} aria-pressed={sound}>
            {sound ? 'Mute sound' : 'Enable sound'}
          </button>
          <button aria-label="World settings" onClick={() => setSettings(true)}>
            Settings
          </button>
        </div>
      </div>
      <div className="scene-info">
        <p id="scene-instruction">{w.instruction}</p>
        <p className="scene-status" role="status" aria-live="polite">
          {status}
        </p>
        {store.warning && <p role="status">{store.warning}</p>}
      </div>
      {help && (
        <Dialog title={`A little guide to ${w.name}`} onClose={() => setHelp(false)}>
          <p>{w.instruction}</p>
          <p>
            Touch or click and drag inside the stage. Outside the stage, scrolling works normally.
          </p>
          <p>
            Keyboard: focus the stage, use arrow keys to move your influence or selected stone.
            Space / Enter: {actionNames[id]}. P: pause / resume. R: reset confirmation. All actions
            also have visible buttons.
          </p>
          <p>
            {['zen-garden', 'dream-sky'].includes(id)
              ? 'Undo and redo preserve your last 40 changes. Saved creations can be restored here or exported and deleted in your journal. Up to 12 recent creations are kept locally.'
              : 'Pause gives you a still scene. Reset starts fresh. Settings include reduced motion and battery saver.'}
          </p>
          {id === 'breathing' && (
            <p>
              This is optional creative play, not medical care. Breathe normally if following a
              guide feels uncomfortable.
            </p>
          )}
        </Dialog>
      )}
      {settings && <Settings onClose={() => setSettings(false)} />}
      {clear && (
        <Confirm
          title="A fresh beginning?"
          onClose={() => setClear(false)}
          onConfirm={() => {
            scene.current?.reset();
            setPaused(false);
          }}
        />
      )}
      {eraseAll && (
        <Confirm
          title="Clear the current creation?"
          onClose={() => setEraseAll(false)}
          onConfirm={() => scene.current?.clear()}
        />
      )}
    </main>
  );
}
