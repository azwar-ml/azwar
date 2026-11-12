'use client';
/* eslint-disable react-hooks/set-state-in-effect -- Hydrate browser-only storage after SSR and report storage write failures. */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  defaults,
  emptyState,
  parseStored,
  writeStored,
  KEY,
  type Stored,
  type Preferences,
  type Creation,
} from '@/lib/storage';
import { motionAllowed } from '@/lib/math';
import type { WorldId } from '@/lib/worlds';
type Store = {
  state: Stored;
  ready: boolean;
  moving: boolean;
  warning: string;
  update: (p: Partial<Preferences>) => void;
  visit: (id: WorldId) => void;
  save: (c: Creation) => void;
  remove: (id: string) => void;
  clear: () => void;
};
const Context = createContext<Store | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(emptyState),
    [ready, setReady] = useState(false),
    [systemReduced, setReduced] = useState(true),
    [warning, setWarning] = useState('');
  useEffect(() => {
    try {
      setState(parseStored(localStorage.getItem(KEY)));
    } catch {
      setWarning('Storage is unavailable. Your session works, but changes may not be saved.');
    }
    setReady(true);
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const change = () => setReduced(query.matches);
    query.addEventListener('change', change);
    const sync = (e: StorageEvent) => {
      if (e.key === KEY) setState(parseStored(e.newValue));
    };
    window.addEventListener('storage', sync);
    return () => {
      query.removeEventListener('change', change);
      window.removeEventListener('storage', sync);
    };
  }, []);
  useEffect(() => {
    if (ready && !writeStored(state))
      setWarning(
        'Device storage is full or blocked. Export creations before leaving; new changes may not persist.',
      );
  }, [state, ready]);
  useEffect(() => {
    document.documentElement.dataset.contrast = String(state.preferences.contrast);
    document.documentElement.dataset.theme = state.preferences.theme;
    document.documentElement.dataset.motion =
      motionAllowed(state.preferences.motion, systemReduced) && state.preferences.ambient
        ? 'full'
        : 'reduced';
  }, [state.preferences, systemReduced]);
  const update = useCallback(
    (p: Partial<Preferences>) =>
      setState((s) => ({ ...s, preferences: { ...s.preferences, ...p } })),
    [],
  );
  const visit = useCallback(
    (id: WorldId) =>
      setState((s) => (s.visited.includes(id) ? s : { ...s, visited: [...s.visited, id] })),
    [],
  );
  const save = useCallback(
    (c: Creation) => setState((s) => ({ ...s, creations: [...s.creations, c].slice(-12) })),
    [],
  );
  const remove = useCallback(
    (id: string) => setState((s) => ({ ...s, creations: s.creations.filter((c) => c.id !== id) })),
    [],
  );
  const clear = useCallback(() => setState({ ...emptyState(), preferences: { ...defaults } }), []);
  return (
    <Context.Provider
      value={{
        state,
        ready,
        moving: ready && motionAllowed(state.preferences.motion, systemReduced),
        warning,
        update,
        visit,
        save,
        remove,
        clear,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useUniverse() {
  const c = useContext(Context);
  if (!c) throw Error('Universe provider missing');
  return c;
}
