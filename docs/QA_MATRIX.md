# QA matrix

Execution date: November 12, 2026. Host: Windows, Node 24.13.0. Browser: Playwright Chromium 158 (headless). Tests run against a separate **production** server on port 3100; the development preview on port 3000 is not reused.

## Automated gates

| Gate                        | Result                                                                |
| --------------------------- | --------------------------------------------------------------------- |
| ESLint                      | Passed                                                                |
| TypeScript strict typecheck | Passed                                                                |
| Vitest unit/components      | 14 passed                                                             |
| Production Next.js build    | Passed; home, hub, journal, content and eight world IDs prerendered   |
| Chromium E2E                | 42 passed, covering navigation, scenes, persistence and responsive QA |
| Production dependency audit | 0 vulnerabilities                                                     |
| Full dependency audit       | 7 moderate tooling entries; see KNOWN_ISSUES                          |

Final executed outcomes are recorded in VERIFICATION.md. The GitHub CI workflow is supplied but has not been claimed as executed remotely.

## Viewport coverage

For every size below, E2E captures home, hub, liquid, sand and journal, and asserts no horizontal overflow. Additional desktop screenshots cover all eight worlds.

| Viewport  | Input emulation | Coverage                                            |
| --------- | --------------- | --------------------------------------------------- |
| 320×640   | Touch-capable   | Narrow phone layout, world panels, page flow        |
| 390×844   | Touch-capable   | Modern phone, native taps/drags in all eight worlds |
| 430×932   | Touch-capable   | Large phone layout                                  |
| 768×1024  | Touch-capable   | Tablet portrait                                     |
| 1024×768  | Touch-capable   | Tablet landscape                                    |
| 1366×768  | Mouse/keyboard  | Laptop, all eight worlds and focus flows            |
| 1920×1080 | Mouse/keyboard  | Desktop composition                                 |

Orientation changes 390×844 → 844×390 are checked. A 640px layout with doubled root text is checked as a zoom-related approximation, not a claim of true OS text/pinch testing.

## Functional checks

- Every world: real pixels change from keyboard and touch input, pause holds a stable canvas image, resume/reset/help/back navigation work and page errors are captured.
- Sand: undo/redo restores the exact scene; insert/nudge/remove stones; canceled reset preserves work.
- Sky: connection after changing density from a selected high index does not fail.
- Journal: name/save two creation kinds, reload, restore structured data, PNG download, confirmed delete.
- Settings: persistent reduced motion/contrast, native dialog focus restoration, OS reduced motion, sound opt-in/mute and storage quota failure warning.
- Home keyboard entry, all public routes, unknown-path 404, phone menu and control expansion.
- Production profiling repeats world navigation and records local errors; this is a lifecycle smoke check, not a sustained memory-leak proof.

## Visual review and evidence

Generated screenshots live under `test-results/universe-responsive-visual-QA-<width>x<height>/`. Representative reviewed copies are retained in `docs/qa/`. Review found and corrected phone hub ornament overflow, excessive small control text and a fractional-pixel sand redraw edge. Full-page desktop and phone home/hub images, tablet layout and world stages were visually inspected. No automated pixel-baseline approval is implied.

## Owner's real-device release checklist — not executed here

- [ ] iOS Safari, Android Chrome: native taps/drags, browser scrolling outside stage, rotation, pinch zoom, low-power mode, sound resume and PNG download.
- [ ] Desktop Chrome, Firefox and Safari: all routes, keyboard, tab visibility, no console errors, save/export.
- [ ] NVDA and VoiceOver: navigation, labels, dialog focus and status messages.
- [ ] 200%/400% browser zoom, OS large text, forced colors and landscape dialogs.
- [ ] Representative mid-range phone: 5+ minutes of scene use, repeat navigation, thermal/battery behavior.
- [ ] Deployed HTTPS preview: cold loading, resource caching, social metadata, real canonical domain and storage behavior.
