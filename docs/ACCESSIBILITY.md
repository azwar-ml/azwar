# Accessibility implementation and verification

The interface targets WCAG 2.2 AA; this is not a conformance certification. The artwork is spatial and has intentionally simplified nonvisual alternatives.

## Implemented

- Semantic header, navigation, main and footer; real route links, page metadata, headings and skip link.
- Visible focus rings and native buttons, selects, ranges and checkboxes. Range values are exposed through native semantics; redundant visual values are not separate live regions.
- Native modal dialogs manage focus containment. Escape closes; focus returns to the opener. Destructive local-data deletion and scene resets require confirmation. Mobile navigation also closes on Escape.
- Permanent directory equivalent to all orbit portals; no action requires hover. Art never replaces the pointer.
- Pointer Events normalize canvas-local coordinates and capture drags. Touch scrolling is intercepted only on the stage. Stylus pressure affects rake width.
- Every scene supplies a primary keyboard/button action. Sand offers preset rake patterns, insert/select/remove stone and directional nudges. Stars can be connected sequentially by button. Gravity wells can be moved with arrows/buttons.
- Focused canvas: arrows move influence/selected stone/well; Space/Enter activates; P pauses; R requests reset; Delete removes selected sand stone; Ctrl/Command+Z undoes.
- OS reduced-motion is the default policy, with no nonessential animation before hydration. CSS motion is disabled under reduced-motion media queries from the first frame. Settings additionally control ambient movement and quality.
- Sound is off until explicit activation in each world. Pause/visibility suspend it. Route cleanup closes audio. No meaning is communicated only through sound.
- Reduced-motion guide has a stationary breathing outline and readable phase text, including selective live announcements. Manual mode has no running guide. No breath holds, health inference or medical claims.
- Higher contrast and forced-colors rules; normal document zoom is not disabled. Primary interactive targets have a 44px minimum height.

## Verified here

Unit/component tests cover preference changes, native confirmation semantics and menu state. Chromium E2E covers keyboard entry, dialog Escape/focus return, all eight keyboard actions changing pixels, all eight native touch-emulated scenes, mobile control expansion, pause/reset/help, reduced-motion persistence and large-text/narrow-layout checks. The final responsive matrix and screenshots are in QA_MATRIX.

## Limits and manual audit

No real screen-reader session or full independent WCAG audit was available. Art is not exposed as a complete editable nonvisual coordinate map. Exact freehand drawing and arbitrary visual star selection remain spatial; presets and sequential selection provide alternative creative experiences. The zoom test combines a narrowed layout and root text scaling; real browser zoom, OS font scaling and pinch behavior require the manual checks below.

Before public launch, test NVDA/Chrome and VoiceOver/Safari, OS high contrast, 200%/400% browser zoom, iOS large text, keyboard-only mobile menu, and touch exploration on real devices. Inspect each dialog at 320px and short landscape heights. Confirm exported names and creation summaries are understandable without images.
