# AZWARISM UNIVERSE
## Complete Product, Design, Engineering & Launch Blueprint — Codex Implementation Contract

**Working domain:** `azwarism.com`  
**Product:** AZWARISM UNIVERSE — An immersive, interactive, calming digital playground  
**Implementation target:** Production-ready responsive web application (mobile, tablet, desktop, touch, mouse, keyboard)  
**Primary instruction:** Implement a complete, cohesive product, not a static concept, demo page, or collection of disconnected proof-of-concepts.

---

# 0. THE CODEX MISSION (READ FIRST)

You are Codex acting as a principal creative technologist, product designer, frontend architect, accessibility specialist, motion engineer, quality engineer, and release engineer.

Build **AZWARISM UNIVERSE**, a premium and original interactive website that fuses:

1. **An evolving cosmic universe** with discoveries, visual progression, and pleasant surprises.
2. **Calming interactive activities** (Zen Garden, Ocean Ripples, Breathing Sanctuary, Dream Sky).
3. **Satisfying playful physics** (Particle Nebula, Liquid Playground, Bubble Garden, Gravity Lab).
4. **A highly polished brand website** with a remarkable first impression, superb responsiveness, and usable navigation.

The result should feel like a world-class interactive digital experience—beautiful, tactile, smooth, memorable, and technically excellent. It should also be *genuinely usable*. Every visible button works; every core activity is playable; each screen has working navigation and state; mobile is a first-class citizen. Avoid a typical template landing page, gimmicky excessive animations, clutter, aggressive gamification, and poor-performance particle storms.

**Product philosophy:** “Move. Feel. Breathe. Play.”  
**Emotional promise:** Visitors can explore freely, make tiny beautiful things happen, and leave feeling a little lighter. No promises to treat anxiety, no diagnosis, no pressure to remain online.  
**Secondary concept:** “A little escape from the noise.”  
**Brand ownership:** AZWARISM. Footer should be appropriate for a creator-owned experience and avoid inventing business claims or partners.

## Required execution behavior

- Inspect the repository before making changes. If it is empty, scaffold the app; if it exists, preserve useful configuration and avoid destructive rewrites without a compelling reason.
- Follow the whole specification, but choose technically sound alternatives when justified. Record important decisions in `docs/DECISIONS.md`.
- **Implement, test, fix, and iterate.** Do not stop after writing a plan or generating a landing page.
- Do not ask repeated questions. Choose excellent defaults and document them. Request user-provided secrets and account actions only when genuinely necessary.
- Do not commit secrets, domain registrar credentials, personal details, fake testimonials, fake usage numbers, fake reviews, or unlicensed assets.
- Respect any existing coding standards, linting rules, or repo instructions unless they conflict with safety or functional requirements.
- Use the freshest compatible *stable* versions available in the repository environment; avoid arbitrary hardcoded dependency versions, beta releases, and compatibility-breaking packages. Confirm package versions through the package manager before installation.
- Prioritize correctness, quality, smoothness, accessibility, maintainability, and performance ahead of raw visual complexity.
- When the desired visual effect threatens responsiveness, automatically reduce quality while preserving the aesthetic.
- If scope is too large for a single pass, build vertically complete increments and keep going until the checklist is done; never leave knowingly broken placeholder routes. Clearly log truly unfinished items.

---

# 1. PRODUCT POSITIONING & USER EXPERIENCE

## Audience

- Anyone who enjoys satisfying interactive web art, calming digital play, creative exploration, beautiful visuals, or simple tactile activities.
- Users arriving from social media who will judge the experience in the first five seconds.
- Mobile users on ordinary mid-range phones, including slower networks.
- Desktop/laptop visitors expecting richer cursor and keyboard interactions.
- People with motion sensitivity, photosensitivity, visual differences, hearing differences, and different input methods.

## Emotional experience sequence

1. **Arrive:** A memorable, atmospheric, fast first frame; a brand mark and a clear “Enter Universe” call to action.
2. **Understand:** One concise instruction appropriate to the input device: “Move to play” (pointer) or “Touch to play” (touch). Avoid overwhelming onboarding.
3. **Discover:** An immersive central hub with accessible portals/cards for each experience.
4. **Interact:** Immediate sensory feedback from input (visual, optional sound, optional haptic if safely available and enabled).
5. **Transform:** The central universe subtly evolves as distinct worlds are explored, without scores, streaks, manipulative unlock gates, or punishment.
6. **Return or leave:** Save preferences and non-sensitive progress locally; provide a clear exit, pause, reset, and mute option. Never trap visitors in a flow.

## Non-negotiable principles

- No account required for core experiences.
- No default autoplay audio.
- No flashing/strobing; avoid aggressive high-contrast pulses.
- Reduced-motion support from the first render.
- No social comparison, leaderboards, competitive points, arbitrary scarcity, streaks, or dark patterns.
- Never frame this website as medical treatment. Copy must be respectful and accurate.
- All meaningful actions also work without hover. Keyboard and touch alternatives are essential.
- First render must be credible on modest devices and when WebGL is unavailable.

---

# 2. REQUIRED SITE MAP AND ROUTES

Implement the following routes (use actual route definitions and navigable links):

| Route | Experience | Requirements |
|---|---|---|
| `/` | Cinematic home / entry | Hero, product identity, interactive ambient backdrop, Enter Universe CTA, Explore Worlds, settings entry, SEO |
| `/universe` | Universe Hub | Central evolving cosmic map, portals for all worlds, discovery indicators, world selection, mobile navigation |
| `/worlds/particles` | Particle Nebula | Attract, repel, swirl, paint trails, multiple palettes, performance adaptive |
| `/worlds/liquid` | Liquid Playground | Responsive liquid/jelly-like interactions with physically plausible easing; fallback if advanced fluid simulation is too costly |
| `/worlds/bubbles` | Bubble Garden | Tap/pop bubbles, float/release bubbles, gentle color and sound variation, regenerate |
| `/worlds/zen-garden` | Zen Garden | Draw in sand, place stones, rake patterns, undo/reset, save/share image where supported |
| `/worlds/ocean` | Ocean Ripples | Touch/click ripple pools, optional ambient ocean sound, hue/time-of-day settings |
| `/worlds/dream-sky` | Dream Sky | Connect stars, create constellations, calm celestial motion, save/clear constellations |
| `/worlds/gravity` | Gravity Lab | Small playful objects orbit/attract/repel, adjustable gravity intensity, pause/reset |
| `/worlds/breathing` | Breathing Sanctuary | Optional simple guided breathing animation with comfortable default pace, stop and manual modes |
| `/discover` | Discovery Journal | Visual record of visited worlds, saved creations and unlocked atmosphere themes; no forced completion |
| `/about` | About AZWARISM | Brand concept and how the experience works, without fabricated founder story |
| `/privacy` | Privacy | Accurate explanation of local preferences, analytics (if none, say none), storage, third parties |
| `/accessibility` | Accessibility | Motion, audio, device, keyboard, accessibility settings and known limitations |
| not-found | Friendly 404 | Beautiful accessible error with working return home/universe links |

**Scope note:** This is a full build. The architecture may share common components and generic scene systems, but each world must have distinctive, actually working interaction logic. Never create fake portals leading to blank placeholder pages.

---

# 3. VISUAL & BRAND DESIGN SYSTEM

## Art direction

Aim for a combination of *cosmic sanctuary + premium experimental digital art + tactile organic simulation*. Rich midnight backgrounds, iridescent indigo/lavender/cyan accents, subtle pearl highlights, soft gradients, deep spatial layers, carefully restrained glassmorphism, abstract living forms, painterly glow and atmospheric particles.

Use original, generated-in-code visuals (canvas, CSS, WebGL, SVG) wherever possible. Avoid copyrighted music/art, stock-photo-looking sections, generic AI hero art, or borrowed layouts. Make the identity feel designed, not assembled from a component template.

## Palette (starting tokens; refine for legibility)

- `--bg-deep: #050714`
- `--bg-mid: #0B1028`
- `--surface: #111733`
- `--surface-elevated: #1A2042`
- `--text-primary: #F5F6FF`
- `--text-secondary: #B9C1DA`
- `--accent-lavender: #A58CFF`
- `--accent-cyan: #75E6FF`
- `--accent-rose: #F4A8D7`
- `--accent-mint: #A6F4D0`
- `--focus: #D9F7FF`

Apply semantic tokens for contrast, high-contrast accessibility settings and theme variants. Do not rely on color alone to indicate controls or progress.

## Typography

- Refined, highly legible display font with a distinct character (properly licensed/hosted); reliable system-font fallback.
- Body typography optimized for reading on small screens; avoid ultra-thin text and tiny labels.
- Responsive fluid type using `clamp()` and conservative line widths.
- Wordmark: custom typographic “AZWARISM” with a restrained luminous symbol/sigil inspired by orbit/ripple/petal forms.

## Composition

- Home: immersive hero with unusually good typography, live responsive background, small unobtrusive header, intentional whitespace, CTA and subtle scroll/entry cue.
- Universe: genuinely explorable orbiting nodes with a clear list/grid equivalent for touch, reduced motion and assistive tech.
- Worlds: primary playable stage fills available viewport; minimal transparent controls, but navigation and instruction never hidden.
- Journal: beautiful gallery-like summaries; saved creations and themes.
- Overall: deliberately *less* UI chrome; maximize the actual experience.

## Motion language

- Calming, organic movement with physics-inspired easing; fine microfeedback on hover, press, drag and release.
- Respect user motion preferences; allow independent control over ambient animation and feedback strength.
- No forced camera spins, seizure-like flashing, extreme parallax, or surprise large jumps.
- Use transform/opacity for UI transitions; avoid layout thrashing and unbounded animation loops.
- Hover effects are an enhancement only: each affordance must be visibly interactive without hover.

## UI details to polish

- Magnetic buttons: subtle only, within reachable clickable target; never move away from the pointer.
- Soft 3D tilt on cards using pointer-relative calculations, disabled on touch and reduced-motion mode.
- Interactive highlight/spotlight following pointer within cards (opt-in based on motion setting).
- Gorgeous focus states and pressed states.
- Optional cursor aura on fine-pointer devices, never replace native cursor in ways that hide usability.
- Scene-to-scene transitions that are smooth but brief and can be skipped.
- Little tactile responses (ripples, light blooming, dust trails) that never distract from content.
- Cohesive polished empty states, errors, no-WebGL states and loading indicators.

---

# 4. USER INPUT & DEVICE SUPPORT

## Inputs

- **Mouse/trackpad:** pointermove, click, press, drag, multi-click where useful, wheel only for normal scrolling or explicitly signposted stage zoom.
- **Touch:** one-finger drawing/dragging, taps, optional pinch zoom only where necessary; no dependency on hover. Proper `touch-action` on play surface and preservation of browser scrolling elsewhere.
- **Keyboard:** Tab navigation, Enter/Space activation, Escape to close modals/menus, arrow controls when meaningful, usable alternative buttons for canvas-only actions, pause and reset shortcuts listed in help.
- **Stylus:** Pointer Events with pressure sensitivity as a progressive enhancement for drawings.
- **Screen readers:** meaningful headings, labels, status feedback, accessible non-canvas controls, descriptive text alternatives.

## Responsive breakpoints and behavior

Design mobile-first without treating phones as compressed desktops. Support at minimum:

- Narrow mobile: 320–390 CSS px.
- Large mobile: 391–767 CSS px.
- Tablet: 768–1023 CSS px, portrait and landscape.
- Laptop: 1024–1439 CSS px.
- Desktop/large monitors: 1440–2560+ CSS px.

Handle modern mobile dynamic viewport (`100dvh` with safe fallbacks), notches and safe area insets, orientation changes, zoom and font scaling, touch targets >= 44×44 CSS px where feasible. Avoid horizontal scrolling. Use device-pixel-ratio caps on canvas and update dimensions on resize. Respect battery saver and low-performance conditions by reducing effects, not blocking access.

## Input patterns

- A **consistent world toolbar**: Back to Universe, Help, Settings, Sound, Pause/Resume, Reset, and controls specific to the world.
- Bottom sheet for mobile control panels; elegant side panel/popover for desktop.
- Persistent visible title and short instruction on first entry; dismissible and reopenable help.
- Keyboard fallback for continuous-pointer experiences: toggles/preset interactions, e.g. buttons to spawn ripples or add a star.

---

# 5. INDIVIDUAL WORLD SPECIFICATIONS

Each world requires its own design personality, usable controls, feedback, reset mechanism, persistence choices, reduced-motion pathway, mobile optimization and clear empty/help state.

## 5.1 Particle Nebula — `/worlds/particles`

**Feeling:** Immersive galaxy dust that responds gracefully to a visitor's presence.

Required:
- Render hundreds/thousands of tiny points according to capability (not an invariant high count).
- Cursor/finger influences nearby particles with smooth falloff.
- Modes: Attract, Repel, Swirl, and Draw/Trail.
- At least 4 color palettes: Aurora, Starlight, Rose Nebula, Ocean Mist.
- Intensity slider, pause, reset, quality setting.
- Connection lines or glowing trails as a conditional high-quality effect.
- A “surprise me” button for a beautifully animated safe preset.
- Clearly visible mobile mode buttons.

Engineering:
- Prefer Canvas 2D for graceful fallback; use lightweight WebGL only if demonstrated materially better.
- Frame delta handling and stable physics.
- Pointer interaction based on canvas bounding box, never raw viewport coordinates.
- Adaptive point count/DPR using measured frame time; pause when hidden.

## 5.2 Liquid Playground — `/worlds/liquid`

**Feeling:** Soft, elastic, translucent, iridescent forms that can be pushed and stretched.

Required:
- At least two responsive liquid-like shapes/forms and a flowing mode.
- Push, drag, stretch, release with satisfying inertia.
- Modes: Jelly, Flow, Morph.
- Color themes, sensitivity slider, reset.
- Lighting/iridescence and gentle highlight behavior.

Engineering:
- Prefer a robust performant approach (soft-body mesh deformation, spring network, shader-based displacement or metaball approximation). Avoid shipping fragile GPU-heavy full-fluid solvers that crash on mobile.
- Build a canvas/CSS fallback retaining the core push/stretch interaction.
- Minimize GPU shader complexity and allocations during animation.

## 5.3 Bubble Garden — `/worlds/bubbles`

**Feeling:** Luminous floating soap bubbles you can gently release or pop.

Required:
- Tap/click to create bubble; touch/hover to push; tap bubbles to pop with gentle particles.
- Adjustable density and size; optional bubble drift speed.
- Soft floating physics, no endless clutter.
- Color themes, clear/reset, optional original subtle sounds.
- Simple visible counter only if it adds delight; **never convert into a score or competition**.

Engineering:
- Robust hit testing, pooled objects, capped total bubble count, reduced-motion mode.

## 5.4 Zen Garden — `/worlds/zen-garden`

**Feeling:** Draw subtle curved lines in a minimalist soft sand surface.

Required:
- Rake/draw on an interactive surface using finger, mouse or stylus.
- Place, select, move and remove stones; optional leaf or light accent.
- Tools: Rake, Stone, Erase; undo/redo; clear with confirmation.
- Brush size and line style controls.
- Save current creation in local storage (bounded; provide clear delete) and export as PNG using standard client APIs if supported.
- Attractive starting composition, rather than a terrifying blank page.

Engineering:
- Store drawing strokes as structured data for undo/redo and responsive redraws.
- Limit history/memory; consider save quotas and graceful failure.
- Accessible alternative to drag: stone insertion buttons and positional nudges.

## 5.5 Ocean Ripples — `/worlds/ocean`

**Feeling:** A moonlit reflective pond/ocean responds with ripples.

Required:
- Tap/click to produce multiple expanding rings with physically pleasing falloff.
- Pointer drag to trail gentle ripples.
- Daylight, Twilight, Moonlight palettes.
- Density, ripple strength and calmness controls.
- Optional rain mode (light, non-flashing, controllable) and original ambient sound.
- One-click reset and pause.

Engineering:
- Avoid excessive fragment shaders on low-power devices. Optimize blend layers; gracefully fallback to Canvas rings.

## 5.6 Dream Sky — `/worlds/dream-sky`

**Feeling:** Create your own tiny sky map by joining stars.

Required:
- Beautiful fixed or procedurally generated field of stars (seeded per scene).
- Tap/click stars to draw connections; drag where appropriate.
- Create, name (optional local-only), save and delete constellations.
- Clear undo and reset actions; reversible edits.
- Adjustable sky colors, star density and subtle shooting stars toggle.
- Journal thumbnails/previews where feasible.

Engineering:
- Precise star hit targets on mobile (hit region larger than displayed dot).
- Avoid making important information purely visual; expose a small textual summary of saved designs.

## 5.7 Gravity Lab — `/worlds/gravity`

**Feeling:** Play with glowing pebbles orbiting soft gravity wells.

Required:
- Drag to place/move attractors; tap to spawn objects.
- Adjustable gravity level, trail length, speed, number of objects.
- Mode switch attract/repel; pause, restart, clear.
- Preserve stable behavior across very different frame rates.
- Use soft boundaries and mild forces to prevent chaotic runaway.

Engineering:
- Stable integrator, timestep clamp, velocities capped, object count limited, zero-distance edge cases handled.
- No violent imagery or destructive aesthetics.

## 5.8 Breathing Sanctuary — `/worlds/breathing`

**Feeling:** Optional, gentle breathing visual rather than a clinical feature.

Required:
- A soft luminous shape expands/contracts at comfortable, configurable pacing.
- Modes: Free/Manual, Gentle Guide.
- Pause, skip, stop, no time pressure.
- Clearly state “Follow at your own comfortable pace; you can stop anytime.”
- Always allow animation-free or minimal-motion mode with text instructions.
- No claims of treating anxiety or medical outcomes.
- Do not infer a user's health or collect biometric data.

Engineering:
- No audio instructions by default; optional sound only after deliberate activation.
- Handle background tab and resume without sudden jump.

---

# 6. THE EVOLVING UNIVERSE HUB

This is the central differentiator of the product, not a static link grid.

## Scene architecture

- A central luminous AZWARISM core/orb that pulses calmly.
- Eight distinct world portals orbit or inhabit the scene with signature colors and geometries.
- Background nebula fields, subtle dust, atmospheric light, pleasant depth, layered motion.
- Each portal has a descriptive name and interaction cue.
- Visitors should be able to explore by pointer/touch and via a permanently accessible world directory.
- As worlds are visited, the hub gradually gains subtle visual details (new colors, constellations, light petals or trails) without gating access to other worlds.
- Smooth entry/exit transition, with robust behavior on back/forward navigation.

## Progress without pressure

Save locally:
- Visited worlds and last-visited date only if truly useful (prefer simply visited flag).
- Currently selected theme, volume/mute, motion/quality preferences.
- Journal creations (small bounded local saves).
- Optional unlocked ambient themes as light noncompetitive discoveries.

Do **not** build compulsory accounts, social leaderboards, daily streaks, badges with pressure, dopamine-driven notifications, or excessive tracking.

## Discover Journal

- Summary of visited worlds with attractive world art.
- Saved Zen Garden sketches and constellations.
- Atmosphere/palette collection.
- Clear explanation that everything is local to this browser/device.
- Export a shareable creation image when available; no user data upload required.
- Clear all saved progress behind an explicit confirmation dialog.

---

# 7. SHARED SYSTEMS & ENGINEERING ARCHITECTURE

## Preferred stack

- **Next.js App Router** with TypeScript and React.
- **Tailwind CSS** with cohesive design tokens and CSS variables.
- **Motion** (modern motion library for React) for UI transitions only where justified.
- **Three.js + React Three Fiber** selectively for rich 3D hub or scenes; avoid forcing a large 3D runtime on every route.
- **Canvas 2D** and SVG for most interactive worlds where best for performance, deterministic input and fallback.
- **Zustand or React Context** for minimal shared app state; prefer local component state for scene-only controls.
- **Zod** only where validation actually helps.
- **Vitest + React Testing Library** for unit/component tests.
- **Playwright** for E2E and cross-viewport testing.
- **ESLint + TypeScript typechecking + formatting**; use available repository conventions.
- **Vercel** as default deployment target, with portable build commands.

Avoid adding a backend, database, auth, external AI API, unnecessary libraries or analytics until truly needed. This is initially a privacy-first client-side creative experience.

## Proposed project structure (adjust to repo)

```text
src/
  app/
    layout.tsx
    page.tsx
    universe/page.tsx
    worlds/
      particles/page.tsx
      liquid/page.tsx
      bubbles/page.tsx
      zen-garden/page.tsx
      ocean/page.tsx
      dream-sky/page.tsx
      gravity/page.tsx
      breathing/page.tsx
    discover/page.tsx
    about/page.tsx
    privacy/page.tsx
    accessibility/page.tsx
    not-found.tsx
  components/
    brand/
    navigation/
    layout/
    controls/
    feedback/
    accessibility/
    overlays/
    world/
  experiences/
    particles/
    liquid/
    bubbles/
    zen-garden/
    ocean/
    dream-sky/
    gravity/
    breathing/
  engine/
    canvas/
    pointer/
    animation/
    performance/
    sound/
    physics/
    persistence/
  hooks/
  lib/
  styles/
  types/
public/
  icons/
  textures/
  audio/                  # only original or properly licensed assets
  social/
docs/
  DECISIONS.md
  DESIGN_SYSTEM.md
  PERFORMANCE.md
  ACCESSIBILITY.md
  RELEASE.md
  QA_MATRIX.md
  KNOWN_ISSUES.md
```

## Reusable shared systems

Implement reusable, well-typed systems:

1. `SceneShell`: navigation, immersive stage, tool panel, sound/motion controls, help overlay, pause and reset.
2. `InputController`: normalize pointer/touch/stylus and keyboard; handle capture and coordinate transforms.
3. `AnimationClock`: requestAnimationFrame, delta-time capping, pause on hidden tab, cleanup.
4. `AdaptiveQuality`: initial device heuristics + measured frame rates, quality ladder, DPR and particle caps.
5. `AudioManager`: explicit consent activation, volume, mute, clean suspend/resume, original generative audio if used.
6. `PreferenceStore`: versioned browser storage, validation, hydration-safe initialization, graceful unavailable-storage handling.
7. `CreationStore`: bounded saves of small user creations; export/delete.
8. `WorldRegistry`: typed world metadata including name, description, route, theme and supported controls.
9. `A11ySettings`: reduced motion, contrast support, audio off, animation intensity, visual complexity.
10. `ErrorBoundary`/fallback: helpful error messages, recovery navigation, no broken blank screens.

## React / rendering correctness

- Isolate browser-only canvas/WebGL code in client components and safely import heavy stages dynamically.
- Avoid hydration mismatch from `window`, randomness, locale-sensitive values or local storage during SSR.
- Use deterministic seeds for first render; only initialize browser-specific state in effects.
- Clean up observers, listeners, rAF loops, Web Audio nodes and GPU resources on unmount.
- No memory leaks after changing worlds repeatedly.
- Respect React strict-mode effect lifecycles.
- Type all world modes/config and validate persisted state shape after app upgrades.

## Security and privacy

- No third-party trackers by default, no unneeded cookies, no credential collection.
- No storing user text in a remote service.
- Treat saved constellation names as plain text; escape properly and avoid XSS.
- Do not embed API secrets in browser code.
- Only use reliable dependencies; follow basic content security principles compatible with app features.
- Privacy text must match actual behavior, including local storage and any CDN-hosted fonts/audio/assets.
- Optional visitor analytics only after explicit project decision, with privacy-preserving configuration and updated disclosures.

---

# 8. PERFORMANCE: NON-NEGOTIABLE

## Goals

- Fast first meaningful display, even when interactive scenes still load lazily.
- Responsiveness and smoothness prioritized on low/mid-range Android and iOS phones.
- Aim for **60 FPS** on capable devices and a stable **~30 FPS minimum target** on modest devices during ordinary interactions. Do not falsely claim guaranteed FPS across all hardware.
- Aim for Core Web Vitals **LCP <= 2.5 seconds, INP <= 200 ms, CLS <= 0.1** at the 75th percentile under representative conditions. Validate via actual tools rather than assumption.
- Route chunks and textures/audio must be lazy-loaded; do not import every world engine into the home route.

## Required optimizations

- Scene visibility via IntersectionObserver and page visibility events.
- Stop idle animation when user switches tabs; resume gracefully.
- Adaptive quality ladder: ultra / high / balanced / battery saver; auto default.
- Limit DPR on GPU/canvas scenes according to quality tier.
- Use object pooling where particles and bubbles are frequent.
- Avoid excessive per-frame allocations, `setState` calls or layout reads.
- Compress/resample textures and avoid oversized images.
- Defer non-essential audio, 3D packages and secondary effects.
- Prevent main-thread stalls during startup with code splitting / modest particle counts / optional workers if proven beneficial.
- Handle WebGL context loss and recovery; provide 2D visual fallback.
- Avoid unbounded storage usage and infinite scene accumulation.
- Provide a visible low-motion/low-effects option inside settings.
- Check performance on both portrait and landscape and at high device pixel ratios.

## Performance instrumentation

During development provide optional `?debug=1` overlay with frame rate estimate, DPR, object count, quality tier, render dimensions, and WebGL mode if active. Not visible by default and not a privacy-tracking system.

---

# 9. ACCESSIBILITY & INCLUSIVE INTERACTION

Target **WCAG 2.2 AA** for interface controls, navigation, information and settings wherever applicable. Canvas art can be visually rich without making core navigation exclusively graphical.

Mandatory:

- Semantic headings/landmarks and descriptive page titles.
- Skip-to-content navigation.
- Clear keyboard focus indicator; predictable focus order.
- All dialogs and sheets: focus management, Esc close, focus return.
- Sufficient text contrast and independent high-contrast setting where appropriate.
- `prefers-reduced-motion` support + settings toggle to reduce/disable nonessential motion.
- No autoplay audio; full mute and level controls, audio cannot be sole communication channel.
- Avoid rapid flashing; don't introduce photosensitive flicker effects.
- Touch targets generous and well spaced.
- Buttons have explicit labels; slider values announced.
- Status changes announced selectively (not thousands of ARIA live updates per second).
- Non-pointer fallback for creation experiences.
- Text remains usable at 200% zoom and large OS font settings.
- No hover-only disclosure; tooltips must also be available on focus/click.
- Support `forced-colors` where practical.

Add an Accessibility page explaining exact controls and caveats truthfully.

---

# 10. SOUND & ATMOSPHERE

- Off/muted on first visit.
- Sound only activates from explicit user gesture (e.g. Enable Sound).
- Optional soundscapes: gentle wind, distant rain, soft ocean, original airy pad.
- Interaction sounds: quiet bubble pop, subtle shimmer, gentle droplet; tasteful, never harsh.
- Shared independent soundscape/effects volumes or a simple clear global volume if complexity demands.
- Persist mute preference locally.
- Pause/suspend audio when tab hidden or user pauses.
- Avoid importing copyrighted commercial music and avoid surprise sounds.
- Prefer lightweight generated/original sound or explicitly licensed assets with attribution.

---

# 11. ONBOARDING, CONTENT & MICROCOPY

Tone: poetic but direct, confident, calm and premium. Avoid paragraphs of generic marketing fluff or exaggerated wellness promises.

Suggested copy:

- Hero eyebrow: `WELCOME TO YOUR LITTLE UNIVERSE`
- H1: `A little escape from the noise.`
- Subhead: `Touch the stars. Shape the light. Make a moment your own.`
- CTA: `Enter the Universe`
- Secondary: `Explore the Worlds`
- Brand tagline: `Move. Feel. Breathe. Play.`
- Hub helper: `Every world responds to you. Explore in any order.`
- Sound toggle: `Sound off` / `Enable sound`
- Pause toggle: `Pause motion` / `Resume motion`
- Reset: `Reset this world`
- Discover: `Your little discoveries, saved on this device.`
- Breathing: `Follow your own comfortable pace. Stop whenever you like.`

Build short, actual on-screen tooltips and first-visit instructions for mouse and touch. Hide after use and allow reopening.

---

# 12. SEO, SOCIAL SHARING & BRAND PROFESSIONALISM

- Unique metadata, canonical URLs and structured basics for meaningful content pages.
- Site title and description appropriate to an interactive art experience.
- Good Open Graph and social card graphics (original, code-generated or properly licensed).
- Favicon, Apple touch icon and clean wordmark icon.
- Responsive installable behavior is optional; a reliable standard web app is first priority.
- Appropriate `robots.txt` and sitemap for public routes; avoid indexing meaningless internal/debug paths.
- Good link previews on social platforms.
- Consistent header/footer: About, Privacy, Accessibility, Explore.
- No fake awards, press logos, user totals, testimonials, client brands, or inflated claims.
- Nice 404 and error boundaries.

---

# 13. TEST PLAN & RELEASE QUALITY GATES

Create tests *and execute them*, fixing failures. Do not simply report that tests would be useful.

## Automated quality gates

- Install dependencies with lockfile.
- Lint passes.
- Typecheck passes without `any` shortcuts in core scene engine.
- Production build passes.
- Unit tests for math/physics/helpers, coordinate transforms, persistence validation, world registry, progress saving, and audio/motion preference logic.
- Component tests for nav, settings panel, pause/reset behavior, keyboard flows, mobile controls and confirmations.
- Playwright smoke tests for every route, primary portal navigation, hub entry, menu behavior and responsive controls.
- Tests for reduced-motion setting and persisted settings.

## E2E device matrix

At minimum test representative viewports:

| Device profile | Viewport | Input |
|---|---:|---|
| Small phone | 320×640 | Touch emulation |
| Modern phone | 390×844 | Touch emulation |
| Large phone | 430×932 | Touch emulation |
| Tablet portrait | 768×1024 | Touch |
| Tablet landscape | 1024×768 | Touch |
| Laptop | 1366×768 | Mouse + keyboard |
| Desktop | 1920×1080 | Mouse + keyboard |

Also test orientation changes, keyboard-only entry, pinch/browser zoom behavior, narrow viewport and reduced motion. When true real-device testing cannot be run, clearly state simulated coverage and provide a manual real-device checklist for iOS Safari, Android Chrome, desktop Chrome, Firefox and Safari.

## Functional verification (per world)

- World loads without runtime console errors.
- Primary touch/click/drag interaction actually affects scene.
- Controls change behavior immediately and accurately.
- Pause freezes active simulation and resumes without a jump.
- Reset brings world into a coherent initial state.
- Back link returns to Universe.
- No significant memory/performance degradation after visiting world repeatedly.
- Reduced-motion mode is usable and visibly calmer.
- Escape, Tab, Enter and Space work where expected.
- The same action can be achieved on a phone without hover.
- Sound preference behaves properly.

## Visual QA

Use screenshots at mobile, tablet and desktop sizes to inspect and refine:

- First impression and typography.
- Missing/overflowing text, clipped buttons or off-screen dialogs.
- Consistent control spacing, touch targets, responsive UI placement.
- Contrast, focus rings and readable labels.
- Smooth visual consistency between pages.
- Low-effects mode aesthetics.

## Acceptance threshold

The app is **not done** if it consists only of a dramatic hero, mock cards, nonfunctional toggles, or three rooms with the other routes blank. Every world listed above must have real playable interaction at a quality that supports launch. Only mark tasks complete after verification.

---

# 14. IMPLEMENTATION ORDER (BUILD IN COMPLETE VERTICAL SLICES)

Follow this order and keep each stage runnable:

## Stage A — Repository & system foundation

1. Inspect repo, package manager and working branch.
2. Scaffold Next.js + TypeScript + styling if necessary.
3. Implement tokens, fonts, icons, global layout, metadata, 404.
4. Implement shared navigation, responsive menu, settings, reduced motion, persisted preferences.
5. Implement SceneShell, InputController, AnimationClock, AdaptiveQuality, audio base and storage.
6. Add lint/typecheck/tests/build scripts and initial smoke tests.

**Gate:** Site runs, navigates and remains legible at 320 px; no hydration errors.

## Stage B — Signature experience & hub

1. Create iconic cinematic homepage with optimized live visual backdrop.
2. Build responsive Universe Hub with unique portal art and directory fallback.
3. Implement world registry, visited-world progress and return transitions.
4. Add settings (sound, animation, quality, contrast as appropriate).
5. Test desktop and mobile flows.

**Gate:** User can enter Universe, navigate with mouse, touch or keyboard, and open/return from world routes.

## Stage C — Core tactile worlds

Implement fully, one at a time:

1. Particle Nebula.
2. Bubble Garden.
3. Ocean Ripples.
4. Zen Garden.

For each: actual interaction, controls, pause, reset, accessibility, responsive behavior, tests, visual QA.

**Gate:** Four polished worlds usable on mobile and desktop.

## Stage D — Advanced worlds

1. Liquid Playground.
2. Gravity Lab.
3. Dream Sky.
4. Breathing Sanctuary.

Prioritize stable elegant simulations over unstable flashy effects; add fallbacks where appropriate.

**Gate:** All eight worlds playable and consistent.

## Stage E — Progress, persistence, content

1. Discovery Journal.
2. Saved creations and deletion/export.
3. Additional environmental themes and subtle hub evolution.
4. About, Privacy, Accessibility pages.
5. SEO/social previews, favicon and metadata.

**Gate:** Local preferences and creations are reliable and truthful; all public routes complete.

## Stage F — Final production polish

1. Audit and optimize per-route bundle size and animation loops.
2. Test all responsive profiles and accessibility features.
3. Fix mobile layout, browser quirks, broken gestures, leaks and console warnings.
4. Complete docs and release checklist.
5. Production build and preview deployment verification.

**Gate:** App meets acceptance checklist and is genuinely launch-ready.

---

# 15. REQUIRED SCRIPTS, DOCUMENTATION & DELIVERABLES

Provide convenient package scripts (according to project conventions):

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "check": "npm run lint && npm run typecheck && npm run test && npm run build"
  }
}
```

Adjust package-manager syntax appropriately; do not blindly overwrite existing working scripts.

Required documentation:

- `README.md`: product intro, setup, commands, routes, controls, local development and limitations.
- `docs/DECISIONS.md`: important architecture/visual/performance tradeoffs.
- `docs/DESIGN_SYSTEM.md`: colors, type, motion, components.
- `docs/PERFORMANCE.md`: quality ladder, target metrics, how to profile and actual measured results.
- `docs/ACCESSIBILITY.md`: keyboard interactions, motion and audio settings, testing and limitations.
- `docs/QA_MATRIX.md`: tested browsers/viewports and results, including explicit gaps.
- `docs/RELEASE.md`: Vercel/domain deployment, env vars (if any), verification and rollback.
- `docs/KNOWN_ISSUES.md`: real remaining bugs/risks (not imaginary perfect coverage).

## Codex final delivery report

At end of implementation, respond with:

1. What was actually built (route by route, short).
2. Main creative/engineering decisions.
3. Verification commands run and pass/fail outcomes (never claim tests you did not run).
4. Screenshot or preview evidence paths when available.
5. Remaining issues, if any, honestly labeled.
6. Exact development/run/deploy steps.
7. Required user-only tasks (e.g. sign in to Vercel or update DNS).

---

# 16. DEPLOYMENT: VERCEL + AZWARISM.COM

Do **not** assume the domain is already owned, configured, or pointing to Vercel. Do not ask for registrar passwords or embed DNS credentials in repository files.

1. Ensure `npm run build` (or matching package manager) succeeds locally.
2. Push to the owner's Git repository if remote access is already authorized; otherwise provide exact git commands.
3. Create/import a Vercel project using the user-authorized account; otherwise provide clear manual dashboard steps.
4. Configure production branch, framework detection and any required environment settings (ideally none initially).
5. Attach `azwarism.com` and optionally `www.azwarism.com` using Vercel's current domain dashboard instructions.
6. Copy the **actual DNS records provided by Vercel** into the registrar; do **not** guess IP addresses or CNAME values in this document.
7. Decide preferred canonical domain and set redirect appropriately.
8. Verify HTTPS, canonical metadata, mobile behavior, all routes, images/fonts, sound opt-in, no production console errors, 404, caching and error states.
9. Keep a rollback path via previous successful deployment.

A preview deploy should happen before switching live DNS. Do not claim the site is deployed or domain connected without verifying the actual outcome.

---

# 17. DEFINITION OF DONE — MASTER CHECKLIST

## Product

- [ ] Home is visually distinctive, performant and has real working entry/navigation.
- [ ] Universe Hub is beautiful, actually interactive, accessible and responsive.
- [ ] All eight worlds implemented with distinct interactions and usable controls.
- [ ] Each world has help, pause/reset, working navigation, mobile and keyboard alternatives.
- [ ] Discover Journal tracks visited worlds and manages saved creations locally.
- [ ] Settings genuinely affect motion, visual quality, sound and relevant preferences.
- [ ] No fake placeholders, broken links, meaningless sliders or decorative nonfunctional buttons.

## Design

- [ ] Original cohesive AZWARISM brand identity.
- [ ] Delightful yet restrained hover, touch, press and drag feedback.
- [ ] Beautiful responsive mobile layout, tablet and wide-screen composition.
- [ ] Excellent typography and contrast.
- [ ] No jank, overflowing UI, uncomfortable motion or overwhelming clutter.

## Engineering

- [ ] TypeScript/ESLint checks pass.
- [ ] Production build passes.
- [ ] Important unit/component and E2E tests pass.
- [ ] Canvas/WebGL lifecycle cleanup works.
- [ ] No critical console errors, hydration warnings or memory leaks.
- [ ] Adaptive quality and reduced-motion are implemented and tested.
- [ ] No unnecessary secrets, trackers, user accounts or backends.

## Accessibility, privacy & honesty

- [ ] Mouse, touch, stylus progressive enhancement, and keyboard supported.
- [ ] No hover-only essential actions.
- [ ] Clear accessible focus states, dialog semantics, labels and control instructions.
- [ ] Sound defaults off and can always be muted.
- [ ] No strobing; reduced-motion pathway is genuinely useful.
- [ ] Privacy page accurately reflects real storage and external calls.
- [ ] No claims to medically treat anxiety; no fabricated achievements or reviews.

## Launch

- [ ] All public routes render in production.
- [ ] Social preview, SEO metadata and favicons configured.
- [ ] Manual QA matrix completed or remaining gaps explicitly documented.
- [ ] Deployment steps accurate and reproducible.
- [ ] Custom domain connection verified when authorization/access is available.

---

# 18. EXTRA CREATIVE STRETCH GOALS (AFTER ALL CORE REQUIREMENTS WORK)

Explore only if performance and accessibility remain excellent:

- A **living title** that responds like a soft magnetic field.
- A **portal transition** that visually transforms one world into another without long blocking loaders.
- Gentle **microdiscoveries** hidden in gestures but never required for navigation.
- A **generative postcard maker**: visitors create and save an original PNG from scenes.
- An **ambient scene composer**: combine chosen colors, shapes, particle layers and optional audio.
- Thoughtful seasonal skies or locally selected themes, without location tracking.
- Optional PWA offline support for previously visited lightweight worlds.
- Simple localization architecture so Urdu and additional languages can be added later without rewriting UI.

Stretch goals must not be used as an excuse to leave the eight core worlds unfinished.

---

# 19. SINGLE MASTER PROMPT TO START CODEX

> Read the entire `AZWARISM_UNIVERSE_CODEX_MASTER_PLAN.md` as the authoritative product and engineering specification. Inspect this repository, then implement the entire AZWARISM UNIVERSE production web app. Do not stop at planning or a mocked landing page. Build the design system, cinematic home, evolving responsive Universe Hub, all eight fully interactive playable worlds, journal, settings, accessibility/privacy content, persistence, adaptive performance, tests and deploy documentation. Make the visual experience original and unusually polished while preserving performance on normal phones. Make every feature function on mouse, touch and keyboard; use reduced-motion and sound-off defaults appropriately. Work in complete vertical slices, testing each one, then run lint, typecheck, unit tests, E2E tests, production build and responsive visual QA. Fix issues you find. Document decisions and known limitations. If you do not have access to deploy or connect the domain, prepare and explain the exact safe remaining user actions; never invent success. Conclude with a factual implementation and verification report. Prioritize a working complete product over superficial complexity.

---

## FINAL STANDARD

This must not look or behave like “an AI-generated website with a particle background.” It should feel like an **original interactive digital universe**, with deliberate artistry, meaningful sensory interactions, gentle optional relaxation, robust responsive engineering, and consistent finishing details. The site should be rewarding to explore for a few minutes **without** pressuring visitors to keep using it.
