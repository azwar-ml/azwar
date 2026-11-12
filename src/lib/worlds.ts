export const worlds = [
  { id: 'particles', name: 'Particle Nebula', verb: 'Shape the light', description: 'A thousand little lights, drawn into your orbit.', color: '#b5a0ff', glyph: '✧', kind: 'PLAY', instruction: 'Move or drag to bend the particles. Try attract, repel, swirl or draw.' },
  { id: 'liquid', name: 'Liquid Playground', verb: 'Go with the flow', description: 'Stretch something soft. Watch it find its way back.', color: '#8de3d8', glyph: '◒', kind: 'PLAY', instruction: 'Press and drag a liquid form. Release to let it settle.' },
  { id: 'bubbles', name: 'Bubble Garden', verb: 'Let a little go', description: 'Release a bubble into the quiet. Or let it pop.', color: '#edaed6', glyph: '○', kind: 'PLAY', instruction: 'Tap empty space to release bubbles. Tap a bubble to pop it; move to gently push.' },
  { id: 'zen-garden', name: 'Zen Garden', verb: 'Leave a gentle trace', description: 'Rake your own rhythm into a little patch of sand.', color: '#dfc69b', glyph: '≋', kind: 'CREATE', instruction: 'Drag to rake the sand. Select Stone to place or move a stone; Erase removes nearby marks.' },
  { id: 'ocean', name: 'Ocean Ripples', verb: 'Make a small wave', description: 'A moonlit surface. An endlessly new beginning.', color: '#8ac8f2', glyph: '◎', kind: 'UNWIND', instruction: 'Tap the water to make rings. Drag slowly to leave a trail of ripples.' },
  { id: 'dream-sky', name: 'Dream Sky', verb: 'Connect your stars', description: 'Find a shape in the stars that only you can see.', color: '#c5b6f5', glyph: '⌁', kind: 'CREATE', instruction: 'Select stars in sequence to connect them. Use Next star for a keyboard constellation.' },
  { id: 'gravity', name: 'Gravity Lab', verb: 'Find your orbit', description: 'Tiny wandering worlds, held by invisible threads.', color: '#f4b594', glyph: '⊙', kind: 'PLAY', instruction: 'Tap to release an orb. Drag the bright gravity well to move it.' },
  { id: 'breathing', name: 'Breathing Sanctuary', verb: 'Come back to now', description: 'A soft space to follow your own comfortable pace.', color: '#abd8b9', glyph: '❋', kind: 'UNWIND', instruction: 'Follow at your own comfortable pace; you can stop anytime. No need to match the guide.' },
] as const;
export type WorldId = typeof worlds[number]['id'];
export const isWorldId = (id: unknown): id is WorldId => worlds.some(w => w.id === id);
export const palettes = { Aurora: ['#b5a0ff', '#82e8dd', '#f0b6db'], Starlight: ['#f5f1de', '#a6c9ef', '#ffffff'], 'Rose Nebula': ['#ee9ccb', '#ba9eff', '#ffcdac'], 'Ocean Mist': ['#80c6e7', '#a2e4d1', '#d0edff'], Daylight: ['#72d1d2', '#bcefe3', '#fff1c4'], Twilight: ['#ae9ddd', '#f3bbad', '#9acbea'], Moonlight: ['#82b5da', '#c3d4ff', '#a999e7'] };
export type Palette = keyof typeof palettes;
