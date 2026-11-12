# Known limitations and remaining release work

## Release boundary

- No Vercel deployment or `azwarism.com` DNS/HTTPS verification has been performed. Owner account and registrar steps are in RELEASE.md. A successful local build is not a live deployment.
- Real iOS Safari, Android hardware, desktop Firefox/Safari and screen-reader sessions have not been tested. Chromium emulation covers input and layout, not all physical-device behavior.
- Core Web Vitals targets are goals, not measured field percentiles. Lab samples are in `qa/performance.json`. INP needs representative real interactions/field measurement. Heap counters were privacy-rounded and do not prove absence of leaks.

## Product tradeoffs

- Canvas 2D is required for visual play; an unavailable context shows a return/navigation fallback. There is no text-only equivalent of arbitrary freehand/spatial editing. Presets and visible buttons offer keyboard alternatives.
- Liquid is a spring-based elastic approximation, not a full fluid solver. Ocean is layered ring art. Audio is a local original sine pad plus tones, not recorded environmental soundscapes. These are deliberate performance/privacy choices.
- Local saves are device/browser-specific. Clearing browser data removes them; private modes or quotas may prevent saves. Failures are surfaced. Up to 12 recent creations are retained; the oldest is replaced after that. Export important work.
- A journal PNG export uses its bounded preview; use the scene's Export PNG before leaving for the current stage resolution. Restoring structured marks redraws to the current aspect ratio, so wide/narrow compositions may stretch.
- Drawing history is bounded to 40 changes, 180 marks, 600 points per stroke. Sand eraser removes intersected strokes or stones, rather than pixel erasure. Star density changes preserve existing connections and reset the active selection.
- Sound always needs a fresh enable gesture after route entry; a remembered opt-in does not bypass browser consent. Themes are immediately available, with no gated unlock mechanics.

## Dependency advisory

The production-only npm audit reported **0 vulnerabilities**. The full audit reported **7 moderate development-toolchain entries** tracing to the same minimatch glob amplification advisory, GHSA-g3hv-75wg-m249, through typescript-eslint 8.72.2. `npm audit fix` was attempted and did not resolve it within the compatible dependency range. The latest compatible minimatch 10.2.6 remained flagged; blindly forcing a major transitive override was avoided. These packages are lint tooling and are not shipped to the browser. Recheck npm audit and update the lint toolchain when an upstream compatible fix is available. Do not lint untrusted enormous pattern inputs in the meantime.
