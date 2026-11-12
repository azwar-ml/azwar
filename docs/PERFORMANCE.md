# Performance

## Budgets and lifecycle

- Canvas 2D throughout; no 3D dependency, remote texture, font fetch or sampled audio file. The home and hub share a lightweight procedural sculpture. World code and audio load through a browser-only route chunk.
- Auto starts at 300 particles on coarse-pointer devices or devices with four or fewer hardware threads; otherwise 650. A browser data-saver hint reduces Auto to 120. Explicit battery/balanced/high/ultra use 120/300/650/1000.
- DPR caps: battery 1, normal 1.5, ultra 2. Two slow 1.5-second frame samples below 38 FPS reduce Auto's object budget by 35%, with a floor of 120, and reduce DPR to 1. Explicit quality selections remain under visitor control. Frame estimates use uncapped elapsed time; physics uses a capped 33ms step.
- Particle arrays have a fixed maximum of 1000; active rendering respects the budget. Bubbles, rings and orbs are bounded at 70. Drawing/history/saves are separately bounded. Rendering uses imperative canvas updates rather than per-frame React state.
- ResizeObserver updates backing buffers; normalized art coordinates remain stable. IntersectionObserver and document visibility suppress offscreen/hidden rendering; hidden-tab time is not replayed on resume. Paused and static scenes skip drawing. Effect cleanup removes observers, listeners, animation callbacks and audio resources.
- Breathing runs only when Gentle Guide is selected. Reduced-motion guidance updates the stationary scene at phase changes, not at animation cadence. Manual mode has no running timer.
- `?debug=1` on a world shows local FPS, DPR, object count, quality, dimensions and Canvas mode. It sends no telemetry.

## Measured locally

Production build, Chromium 158, one local sample per profile on November 12, 2026. See the exact resource/scene results in [qa/performance.json](qa/performance.json). Profiling was performed alongside the browser suite, so shared host load can affect it.

| Profile                                                        | Home LCP | Home CLS | Particle FPS sample | Particle count / DPR |
| -------------------------------------------------------------- | -------: | -------: | ------------------: | -------------------- |
| 1366×768 laptop, unthrottled                                   |    136ms |        0 |                  60 | 650 / 1              |
| 390×844 phone emulation, DPR 3, CPU 4×, 1.6Mbps, 150ms latency |   1252ms |        0 |                  37 | 300 / 1.5            |

The home JavaScript resource sample was approximately 142–149 KiB encoded, including framework runtime and some automatic route prefetching; the JSON lists each resource. There are no fetched fonts or art images for the hero. Neither profile reported a page error during repeated world navigation. Phone startup recorded 12 long tasks in this sample; startup scripting and ambient art remain profiling targets on real hardware.

These are **lab observations**, not guaranteed performance, Lighthouse scores or field Core Web Vitals percentiles. INP was not established by this sample. Heap values were privacy-rounded to 10MB, so they do not demonstrate absence of leaks. Physical mid-range Android/iOS, thermal throttling, battery life and long-session memory remain manual release checks.

## Reproduce and investigate

```powershell
npm run build
node scripts/profile.mjs
```

The script owns port 3200 and shuts down its browser/server. Run it without other heavy local workloads for more isolated samples. For actual investigations, record Chrome Performance traces, emulate a slower CPU/network, interact continuously, change worlds repeatedly, inspect detached canvases/audio nodes and take heap snapshots. Compare Auto and Battery saver at high DPR and portrait/landscape. Validate HTTPS production caching and field LCP/INP/CLS before claiming the master plan's 75th-percentile goals.
