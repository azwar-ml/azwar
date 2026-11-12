'use client';
import { useState } from 'react';
import { Dialog, Confirm } from './dialog';
import { useUniverse } from './provider';
import type { Preferences } from '@/lib/storage';
export function Settings({ onClose }: { onClose: () => void }) {
  const {
    state: { preferences: p },
    update,
    clear,
    warning,
  } = useUniverse();
  const [confirm, setConfirm] = useState(false);
  return (
    <Dialog title="Make yourself at home" onClose={onClose}>
      <p className="muted">
        A little less motion. A different atmosphere. Your universe, your pace.
      </p>
      <label className="field">
        Motion
        <select
          value={p.motion}
          onChange={(e) => update({ motion: e.target.value as Preferences['motion'] })}
        >
          <option value="system">Follow device preference</option>
          <option value="reduced">Reduced · minimal animation</option>
          <option value="full">Full · gentle animation</option>
        </select>
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={p.ambient}
          onChange={(e) => update({ ambient: e.target.checked })}
        />{' '}
        Ambient movement
      </label>
      <label className="field">
        Visual quality
        <select
          value={p.quality}
          onChange={(e) => update({ quality: e.target.value as Preferences['quality'] })}
        >
          {['auto', 'ultra', 'high', 'balanced', 'battery'].map((v) => (
            <option key={v} value={v}>
              {v === 'auto'
                ? 'Auto · adapts to your device'
                : v === 'battery'
                  ? 'Battery saver'
                  : v[0].toUpperCase() + v.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Interaction glow · {Math.round(p.feedback * 100)}%
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={p.feedback}
          onChange={(e) => update({ feedback: +e.target.value })}
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          checked={p.contrast}
          onChange={(e) => update({ contrast: e.target.checked })}
        />{' '}
        Higher contrast
      </label>
      <label className="field">
        Atmosphere
        <select
          value={p.theme}
          onChange={(e) => update({ theme: e.target.value as Preferences['theme'] })}
        >
          <option value="cosmic">Cosmic · indigo</option>
          <option value="tide">Tide · deep teal</option>
          <option value="rose">Afterglow · plum</option>
        </select>
      </label>
      <p>
        Sound starts only from the “Enable sound” control in a world. It always stops when you leave
        or pause.
      </p>
      <label className="field">
        Sound volume · {Math.round(p.volume * 100)}%
        <input
          type="range"
          min="0"
          max="0.7"
          step="0.05"
          value={p.volume}
          onChange={(e) => update({ volume: +e.target.value })}
        />
      </label>
      {warning && <p role="status">{warning}</p>}
      <hr />
      <p className="muted">
        Everything is saved only in this browser. Clearing removes preferences, discoveries and all
        saved creations.
      </p>
      <button className="danger" onClick={() => setConfirm(true)}>
        Clear all local data
      </button>
      {confirm && (
        <Confirm
          title="Clear your local universe?"
          onClose={() => setConfirm(false)}
          onConfirm={clear}
        />
      )}
    </Dialog>
  );
}
