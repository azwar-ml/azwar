# Implementation decisions

## Architecture

- Next.js App Router, React and strict TypeScript. Pages are prerendered, including all eight world IDs. Unknown IDs use the actual 404. One browser-only, dynamically imported scene bundle is shared by world routes; the home route does not import scene physics or Web Audio.
- Plain CSS with semantic custom properties instead of Tailwind. This avoids a styling runtime/toolchain for a small original component system. No motion or 3D library: CSS and Canvas 2D cover the art and interactions with less startup cost. These are deliberate alternatives to the preferred stack, not missing GPU fallbacks.
- Canvas 2D is the primary renderer, so no WebGL context loss path is necessary. Canvas failure surfaces a navigation fallback. It cannot preserve visual play without Canvas support.
- Registry metadata, shared SceneShell UI, normalized Pointer Events, stable clock/physics, performance budgets, audio manager and versioned local store are separate modules. Scene implementations share a lifecycle to keep pause, cleanup and resize behavior consistent. Eight draw/update functions retain distinct interactions.
- Initial rendering is deterministic. Browser preferences hydrate after mount; nonessential motion starts disabled until the OS preference is known. Two scoped lint exceptions permit legitimate effect synchronization with external canvas/audio and browser storage; core hook and type rules remain enabled.

## Art and interaction

- Art direction: an observatory of small wonders. An original topographic light torus serves as the home sculpture and evolving hub core. Eight code-generated materials identify the portals. Sand, liquid, bubbles and stars use distinct geometry and physical behavior.
- Georgia and Arial use installed fonts; no network fonts or license ambiguity. This trades exact cross-platform letterforms for instant text and privacy.
- Liquid is a damped spring/deformation system, not a fluid solver. Gravity uses bounded softened forces. Ocean uses perspective rings, not a GPU water simulation. These retain tactile intent at modest cost.
- Discovery adds color and light to the hub. All atmosphere themes are available immediately, avoiding artificial unlock gates. There are no visit timestamps, streaks, scores or accounts.
- Buttons supply meaningful alternatives to free spatial gestures. They do not pretend to provide a full nonvisual editor. Accessibility caveats are explicit.

## Storage, audio and launch

- Local storage `azwarism:v1`: validated preferences, distinct visited flags, up to 12 recent creations. History: 40 undo snapshots, 180 marks, 600 points per stroke. Normalized coordinates redraw after resize. Storage failures keep the app usable and show a warning; they do not falsely promise durable saves.
- Local snapshots replace the oldest after 12, with visible disclosure. Export is the durable backup. No remote storage or synchronization.
- Original sine pad and quiet tonal effects use Web Audio after explicit activation, with one volume control. They are intentionally simpler than a sampled ocean/wind soundtrack. No audio resumes automatically on route entry.
- Vercel is the specified release target. No Site hosting identity is created: the repository and Next.js/Vercel workflow are the requested deliverables, and the owner’s Vercel/domain access is not present. No credentials or DNS values are invented.
- Dependencies were queried through npm, installed, then pinned with a lockfile. jsdom 29.1.1 was chosen over 31 because the installed Node 24.13 does not satisfy jsdom 31's engine range. Development dependency advisory details are in KNOWN_ISSUES.
