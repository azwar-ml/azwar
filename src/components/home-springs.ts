'use client';
import { useEffect, useRef } from 'react';
import type { DOMKeyframesDefinition, AnimationPlaybackControls } from 'motion';
let library: Promise<typeof import('motion')> | undefined;
const animations = new WeakMap<HTMLElement, AnimationPlaybackControls>();
export function warmSprings() {
  library ??= import('motion');
  return library;
}
export async function springTo(
  element: HTMLElement | null,
  values: DOMKeyframesDefinition,
  delay = 0,
) {
  if (!element) return;
  try {
    const { animate } = await warmSprings();
    if (
      !element.isConnected ||
      document.documentElement.dataset.motion !== 'full' ||
      element.closest('.is-calm')
    )
      return;
    animations.set(
      element,
      animate(element, values, { type: 'spring', stiffness: 180, damping: 18, delay }),
    );
  } catch {
    /* Direct play remains usable if the optional animation chunk fails. */
  }
}
export function useSpringTarget<T extends HTMLElement>(enabled: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    const stop = () => {
      if (!element) return;
      for (const node of [element, ...element.querySelectorAll<HTMLElement>('.spring-letter')]) {
        animations.get(node)?.stop();
        node.style.transform = 'none';
      }
    };
    if (!enabled) stop();
    return stop;
  }, [enabled]);
  return ref;
}
