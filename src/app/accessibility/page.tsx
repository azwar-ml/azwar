import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Accessibility',
  alternates: { canonical: '/accessibility' },
};
export default function Page() {
  return (
    <main id="main" className="text-page">
      <p className="eyebrow">EXPLORE YOUR WAY</p>
      <h1>
        A universe with
        <br />
        room for you.
      </h1>
      <p>
        The navigation and interface aim for WCAG 2.2 AA. The visual artwork has practical
        limitations: it is not fully represented as a textual spatial map, and this is not a
        certification of conformance.
      </p>
      <h2>Keyboard and assistive technology</h2>
      <p>
        Use Tab and Shift+Tab to move between links and controls. Enter and Space activate buttons.
        The Universe directory offers the same worlds as the orbit map. Dialogs keep focus inside,
        close with Escape, and return focus to the opening control.
      </p>
      <p>
        Focus a world’s stage to use arrow keys to move your influence point, selected stone or
        gravity well. Space or Enter performs the world’s primary action. P pauses and resumes; R
        opens reset confirmation. In Zen Garden, Delete removes the selected stone and
        Ctrl/Command+Z undoes a change. Visible controls provide alternatives to dragging, including
        adding a rake pattern, placing and nudging stones, connecting the next star and making a
        ripple.
      </p>
      <h2>Motion, contrast and sound</h2>
      <p>
        Motion follows your device preference by default. Settings offer reduced motion, an ambient
        movement toggle, interaction glow intensity, higher contrast and battery saver quality.
        Reduced motion keeps scenes still until interaction, with brief gentle feedback. Guided
        breathing has a stationary shape and text phases in reduced motion; manual mode has no
        running timer.
      </p>
      <p>
        Sound is off until you deliberately enable it in a world. It stops when you pause, leave the
        world or switch tabs. There are no audio-only instructions. Global settings include volume.
        Browser zoom and text resizing are supported; do not disable device zoom.
      </p>
      <h2>Touch and pointer</h2>
      <p>
        Touch, mouse and stylus share the same stage input. Drawing uses stylus pressure when
        available. Scrolling is disabled only within the play surface while gestures are used there.
        All controls are also reachable outside the canvas. On phones, expand “Shape this world” for
        the full control panel.
      </p>
      <h2>Known limits</h2>
      <p>
        Canvas scenes require Canvas 2D support. Exact freehand drawing and free selection of visual
        stars remain primarily spatial interactions; buttons provide preset patterns and sequential
        star connections. Saved images include a name and mark count but not a full description of
        the art. Browser and device behavior can vary; see the repository QA matrix for tested
        coverage.
      </p>
    </main>
  );
}
