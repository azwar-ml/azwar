# AZWARISM UNIVERSE

An original, privacy-first digital playground: **Move. Feel. Breathe. Play.** Built from the authoritative [master plan](AZWARISM_UNIVERSE_CODEX_MASTER_PLAN.md).

## Run

Use Node 24.13+ (or a supported current Node LTS) and npm. No environment variables, accounts, API keys or database are required.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000. Production:

```powershell
npm run build
npm start
```

## Routes

| Route                                  | What works                                                                                   |
| -------------------------------------- | -------------------------------------------------------------------------------------------- |
| `/`                                    | Responsive procedural sculpture, interactive ambient art, entry and world directory          |
| `/universe`                            | Eight linked portals, directory view, local-visit-driven light evolution                     |
| `/worlds/particles`                    | Attract, repel, swirl, draw/trail, four palettes, intensity, adaptive density                |
| `/worlds/liquid`                       | Two spring-driven elastic forms, push/drag/release, jelly/flow/morph                         |
| `/worlds/bubbles`                      | Create, push and pop, bounded drift, density/size/speed and clear                            |
| `/worlds/zen-garden`                   | Pressure-aware rake, line styles, movable/removable stones, erase, undo/redo, saves and PNG  |
| `/worlds/ocean`                        | Ripples and drag trails, daylight/twilight/moonlight, rain, density/strength/calmness        |
| `/worlds/dream-sky`                    | Seeded stars, connections, naming, density, shooting stars, undo/redo, saves and PNG         |
| `/worlds/gravity`                      | Move well, spawn orbs, attract/repel, intensity, speed, count, trails, clear                 |
| `/worlds/breathing`                    | Manual or gentle guide, 3–8-second phases, pause, skip, stop, stationary reduced-motion mode |
| `/discover`                            | Visited worlds, bounded local creation gallery, export/delete, atmosphere selection          |
| `/about`, `/privacy`, `/accessibility` | Accurate product, storage and input information                                              |
| Any unknown path                       | Friendly 404 with home/universe links                                                        |

## Controls

Mouse, touch and stylus use Pointer Events. Drag only captures scrolling inside the stage. Tab reaches navigation and world controls. Focus a stage and use arrows, Enter/Space (primary action), P (pause), R (reset confirmation). Zen stones have nudge/remove buttons; Dream Sky has a Next star button. On phones expand **Shape this world**. Help explains each world.

Motion follows the OS preference. Sound always needs a fresh explicit gesture in the world, even if a previous opt-in is stored. Settings include motion, ambient animation, quality, contrast, glow, atmosphere and volume. No external art, fonts, sound or trackers.

## Checks

```powershell
npm run lint
npm run format:check
npm run typecheck
npm test
npx playwright install chromium
npm run build
npm run test:e2e
node scripts/profile.mjs
```

E2E owns a production server on port **3100**; profiling owns **3200**, keeping development on 3000 separate. Build before E2E/profile. On a sandboxed Windows host worker processes and browser launch may require execution permission. Screenshots are generated under `test-results/`; the HTML report is in `playwright-report/`.

`npm run assets:brand` regenerates the original PNG social card and Apple icon from repository SVGs. The committed PNGs mean deployment needs no asset generator step.

See [decisions](docs/DECISIONS.md), [design system](docs/DESIGN_SYSTEM.md), [performance](docs/PERFORMANCE.md), [accessibility](docs/ACCESSIBILITY.md), [QA](docs/QA_MATRIX.md), [release instructions](docs/RELEASE.md), and [limitations](docs/KNOWN_ISSUES.md). Deployment and real hardware validation are separate release steps; local success is not a claim of a live domain.
