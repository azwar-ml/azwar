# Design system

## Material and color

| Token        | Default   | Purpose            |
| ------------ | --------- | ------------------ |
| `--bg`       | `#050714` | Deep space         |
| `--mid`      | `#0b1028` | Atmospheric depth  |
| `--surface`  | `#111733` | Controls and cards |
| `--elevated` | `#1a2042` | Elevated surfaces  |
| `--text`     | `#f5f6ff` | Primary content    |
| `--muted`    | `#b9c1da` | Secondary content  |
| `--accent`   | `#b5a0ff` | Lavender light     |
| `--cyan`     | `#8de3d8` | Quiet presence     |
| `--focus`    | `#d9f7ff` | Keyboard focus     |

Tide and Afterglow change the ambient background and accent. Higher contrast raises secondary text and border contrast. World accents derive from the registry. Text, labels and pressed states supplement color.

## Type and space

Georgia display headings use fluid `clamp()` sizes, normal weight and tight spacing; italic phrases provide softer emphasis. Arial handles navigation, instructions and controls. Main body is 15px, world controls 12px, decorative figure captions smaller. Body line height is 1.65. No downloaded fonts.

The desktop shell uses 4.5–7% page gutters. A narrow article caps at 900px. World cards use four columns, two on tablets/phones. World stages reserve their dimensions before drawing. Controls move below the stage on phones with a persistent expand button. The layout uses safe document flow rather than a scroll trap.

## Components and motion

Pill controls, outlined secondary actions, lavender primary actions, restrained 14–20px surface corners. Focus rings remain visible and distinct from hover. Dialogs use native modal semantics, Escape handling and focus restoration. Touch controls target at least 44px.

Ambient motion is slow and optional. Pointer feedback never removes or replaces the native cursor. Reduced motion disables CSS transitions and ambient sculpture motion, and limits scene responses to brief interaction feedback. Breathing can remain stationary with text phases or completely manual. No flashing or aggressive camera transitions.

The original orbit/petal sigil, SVG source social card, PNG social card and Apple icon are in `public/`. Art is code-generated; no stock or generated raster artwork is needed.
