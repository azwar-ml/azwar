import { clamp, gravityStep, initialBudget, random, type Quality } from '@/lib/math';
import { palettes, type Palette, type WorldId } from '@/lib/worlds';
import type { Mark } from '@/lib/storage';
export type Config = {
  mode: string;
  palette: Palette;
  intensity: number;
  density: number;
  size: number;
  speed: number;
  calm: number;
  trails: number;
  brush: number;
  lineStyle: string;
  rain: boolean;
  shooting: boolean;
  pace: number;
  moving: boolean;
  ambient: boolean;
  quality: Quality;
  feedback: number;
};
export const initialConfig = (id: WorldId): Config => ({
  mode:
    id === 'particles'
      ? 'Attract'
      : id === 'liquid'
        ? 'Jelly'
        : id === 'zen-garden'
          ? 'Rake'
          : id === 'gravity'
            ? 'Attract'
            : id === 'breathing'
              ? 'Free / Manual'
              : 'Play',
  palette: id === 'ocean' ? 'Moonlight' : 'Aurora',
  intensity: 1,
  density: id === 'bubbles' ? 18 : id === 'dream-sky' ? 36 : 32,
  size: 35,
  speed: 1,
  calm: 0.7,
  trails: 0.65,
  brush: 10,
  lineStyle: 'Fine rake',
  rain: false,
  shooting: false,
  pace: 5,
  moving: false,
  ambient: true,
  quality: 'auto',
  feedback: 0.65,
});
type Point = { x: number; y: number };
type Body = Point & { vx: number; vy: number; r: number; age: number; hue: number };
type Ring = Point & { age: number; strength: number };
type SoftBody = Point & { home: Point; vx: number; vy: number; stretch: number; angle: number };
export type Metrics = {
  fps: number;
  dpr: number;
  count: number;
  quality: string;
  width: number;
  height: number;
};
export class Scene {
  private ctx: CanvasRenderingContext2D;
  config: Config;
  paused = false;
  private width = 1;
  private height = 1;
  private dpr = 1;
  private time = 0;
  private frame = 0;
  private last = 0;
  private visible = true;
  private dirty = true;
  private activeUntil = 0;
  private rng = random(404);
  private particles: Body[] = [];
  private rings: Ring[] = [];
  private stars: Point[] = [];
  private soft: SoftBody[] = [];
  private cursor: Point = { x: 0.5, y: 0.5 };
  private down = false;
  private selected = -1;
  private dragStone = -1;
  private dragWell = false;
  private well = { x: 0.5, y: 0.5 };
  private stroke: Mark | null = null;
  private marks: Mark[] = [];
  private redoMarks: Mark[][] = [];
  private undoMarks: Mark[][] = [];
  private lastStar = -1;
  private budget = 300;
  private slow = 0;
  private sampleTime = 0;
  private sampleFrames = 0;
  private reducedUntil = 0;
  private observer: ResizeObserver;
  private intersection: IntersectionObserver;
  private lastTrail = 0;
  private announcedPhase = '';
  private degraded = false;
  constructor(
    private canvas: HTMLCanvasElement,
    readonly id: WorldId,
    config: Config,
    private announce: (text: string) => void,
    private metric: (m: Metrics) => void,
    private chime: (frequency?: number) => void,
  ) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw Error('Canvas 2D is unavailable. Try another browser.');
    this.ctx = ctx;
    this.config = config;
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(canvas);
    this.intersection = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      this.last = 0;
      this.dirty = true;
    });
    this.intersection.observe(canvas);
    document.addEventListener('visibilitychange', this.visibility);
    this.reset();
    this.resize();
    this.frame = requestAnimationFrame(this.tick);
  }
  private visibility = () => {
    this.last = 0;
    this.dirty = true;
  };
  private resize = () => {
    const b = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, b.width);
    this.height = Math.max(1, b.height);
    this.dpr = Math.min(
      devicePixelRatio || 1,
      this.config.quality === 'battery' || this.degraded
        ? 1
        : this.config.quality === 'ultra'
          ? 2
          : 1.5,
    );
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.dirty = true;
  };
  private initialBudget() {
    const n = navigator as Navigator & { connection?: { saveData?: boolean } };
    return initialBudget(
      this.config.quality,
      n.hardwareConcurrency || 4,
      matchMedia('(pointer: coarse)').matches,
      n.connection?.saveData === true,
    );
  }
  setConfig(c: Config) {
    const old = this.config;
    this.config = c;
    if (old.quality !== c.quality) {
      this.degraded = false;
      this.budget = this.initialBudget();
      this.resize();
    }
    if (old.density !== c.density) {
      if (this.id === 'dream-sky') {
        this.makeStars();
      }
      if (this.id === 'bubbles' || this.id === 'gravity') {
        while (this.particles.length < c.density) this.particles.push(this.body());
        this.particles.length = c.density;
      }
    }
    this.dirty = true;
  }
  setPaused(value: boolean) {
    this.paused = value;
    this.last = 0;
    this.dirty = true;
    this.announce(value ? 'World paused.' : 'World resumed.');
  }
  private body(): Body {
    return {
      x: 0.1 + this.rng() * 0.8,
      y: 0.1 + this.rng() * 0.8,
      vx: (this.rng() - 0.5) * 0.06,
      vy: (this.rng() - 0.5) * 0.06,
      r: 0.5 + this.rng(),
      age: 0,
      hue: this.rng(),
    };
  }
  reset() {
    this.rng = random(404);
    this.time = 0;
    this.well = { x: 0.5, y: 0.5 };
    this.budget = this.initialBudget();
    const n =
      this.id === 'particles'
        ? 1000
        : this.id === 'bubbles' || this.id === 'gravity'
          ? this.config.density
          : 0;
    this.particles = Array.from({ length: n }, () => this.body());
    this.rings = [];
    this.makeStars();
    this.marks = [];
    this.undoMarks = [];
    this.redoMarks = [];
    this.lastStar = -1;
    this.selected = -1;
    this.soft = [0.34, 0.68].map((x, i) => ({
      x,
      y: 0.48 + i * 0.06,
      home: { x, y: 0.48 + i * 0.06 },
      vx: 0,
      vy: 0,
      stretch: 0,
      angle: 0,
    }));
    if (this.id === 'zen-garden') {
      const points = Array.from({ length: 100 }, (_, i) => ({
        x: 0.15 + i / 140,
        y: 0.52 + Math.sin(i / 15) * 0.12,
      }));
      this.marks = [
        { tool: 'Rake', points, width: 11 },
        { tool: 'Stone', points: [{ x: 0.66, y: 0.37 }], width: 25 },
      ];
    }
    this.dirty = true;
    this.activeUntil = this.time + 1;
    this.announce('A fresh beginning.');
  }
  private makeStars() {
    const r = random(71);
    this.lastStar = -1;
    this.stars = Array.from({ length: this.config.density }, () => ({
      x: 0.08 + r() * 0.84,
      y: 0.1 + r() * 0.8,
    }));
  }
  private history() {
    this.undoMarks.push(structuredClone(this.marks));
    if (this.undoMarks.length > 40) this.undoMarks.shift();
    this.redoMarks = [];
  }
  undo() {
    if (!this.undoMarks.length) {
      this.announce('Nothing to undo.');
      return;
    }
    this.redoMarks.push(structuredClone(this.marks));
    this.marks = this.undoMarks.pop()!;
    this.lastStar = -1;
    this.selected = -1;
    this.dirty = true;
    this.announce('Last change undone.');
  }
  redo() {
    if (!this.redoMarks.length) {
      this.announce('Nothing to redo.');
      return;
    }
    this.undoMarks.push(structuredClone(this.marks));
    this.marks = this.redoMarks.pop()!;
    this.lastStar = -1;
    this.selected = -1;
    this.dirty = true;
    this.announce('Change restored.');
  }
  clear() {
    this.history();
    this.marks = [];
    this.rings = [];
    this.particles = [];
    this.lastStar = -1;
    this.selected = -1;
    this.dirty = true;
    this.announce('Scene cleared.');
  }
  getMarks() {
    return structuredClone(this.marks);
  }
  load(marks: Mark[]) {
    this.history();
    this.marks = structuredClone(marks).slice(-180);
    this.lastStar = -1;
    this.dirty = true;
    this.announce('Creation restored.');
  }
  preview() {
    this.render(0, false);
    const small = document.createElement('canvas');
    small.width = 480;
    small.height = Math.round((480 * this.height) / this.width);
    small.getContext('2d')?.drawImage(this.canvas, 0, 0, small.width, small.height);
    return small.toDataURL('image/png');
  }
  export() {
    this.canvas.toBlob((blob) => {
      if (!blob) {
        this.announce('Image export is unavailable.');
        return;
      }
      const url = URL.createObjectURL(blob),
        a = document.createElement('a');
      a.download = `azwarism-${this.id}.png`;
      a.href = url;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.announce('PNG exported.');
    }, 'image/png');
  }
  pointer(type: 'down' | 'move' | 'up', p: Point, pressure = 0.5) {
    this.cursor = p;
    this.dirty = true;
    if (type === 'up') {
      if (this.stroke && this.stroke.points.length < 2)
        this.stroke.points.push({ x: clamp(p.x + 0.002, 0, 1), y: p.y });
      this.down = false;
      this.stroke = null;
      this.dragStone = -1;
      this.dragWell = false;
      return;
    }
    if (this.paused) return;
    this.activeUntil = this.time + 1.6;
    this.reducedUntil = performance.now() + 700;
    if (type === 'down') {
      this.down = true;
      switch (this.id) {
        case 'bubbles': {
          const i = this.particles.findIndex(
            (b) =>
              Math.hypot((b.x - p.x) * this.width, (b.y - p.y) * this.height) <
              b.r * this.config.size,
          );
          if (i >= 0) {
            const b = this.particles[i];
            this.particles.splice(i, 1);
            this.addRing(b);
            this.chime(420 + b.hue * 400);
            this.announce('Bubble released into light.');
          } else {
            this.particles.push({ ...this.body(), ...p });
            if (this.particles.length > 70) this.particles.shift();
            this.announce('Bubble created.');
          }
          break;
        }
        case 'ocean':
          this.addRing(p);
          this.chime(160);
          this.announce('A ripple across the water.');
          break;
        case 'zen-garden': {
          this.history();
          if (this.config.mode === 'Stone') {
            const i = this.marks.findIndex(
              (m) =>
                m.tool === 'Stone' &&
                Math.hypot(
                  (m.points[0].x - p.x) * this.width,
                  (m.points[0].y - p.y) * this.height,
                ) <
                  m.width + 15,
            );
            if (i >= 0) {
              this.dragStone = i;
              this.selected = i;
            } else {
              this.marks.push({ tool: 'Stone', width: this.config.brush * 1.5 + 10, points: [p] });
              this.dragStone = this.marks.length - 1;
              this.selected = this.dragStone;
            }
            this.announce('Stone selected. Arrow keys nudge; Delete removes it.');
          } else if (this.config.mode === 'Erase') this.erase(p);
          else {
            this.stroke = {
              tool: this.config.lineStyle,
              width: this.config.brush * (0.65 + pressure * 0.7),
              points: [p],
            };
            this.marks.push(this.stroke);
            if (this.marks.length > 180) this.marks.shift();
          }
          break;
        }
        case 'dream-sky': {
          let near = -1,
            dist = 28;
          this.stars.forEach((s, i) => {
            const d = Math.hypot((s.x - p.x) * this.width, (s.y - p.y) * this.height);
            if (d < dist) {
              near = i;
              dist = d;
            }
          });
          if (near >= 0) this.connect(near);
          break;
        }
        case 'gravity':
          if (Math.hypot((p.x - this.well.x) * this.width, (p.y - this.well.y) * this.height) < 42)
            this.dragWell = true;
          else {
            this.particles.push({ ...this.body(), ...p, vx: 0.1, vy: -0.06 });
            if (this.particles.length > 70) this.particles.shift();
            this.announce('Orb released.');
          }
          break;
        case 'liquid':
          this.selected = this.soft.reduce(
            (best, b, i, all) =>
              Math.hypot(b.x - p.x, b.y - p.y) < Math.hypot(all[best].x - p.x, all[best].y - p.y)
                ? i
                : best,
            0,
          );
          this.announce('Liquid form held.');
          break;
        case 'breathing':
          this.time += this.config.pace;
          this.announce(this.phase());
          break;
      }
    }
    if (type === 'move' && this.down) {
      if (this.id === 'ocean' && this.time - this.lastTrail > 0.06) {
        this.addRing(p);
        this.lastTrail = this.time;
      }
      if (this.id === 'zen-garden') {
        if (this.dragStone >= 0) this.marks[this.dragStone].points[0] = p;
        else if (this.config.mode === 'Erase') this.erase(p);
        else if (this.stroke && this.stroke.points.length < 600) this.stroke.points.push(p);
      }
      if (this.id === 'gravity' && this.dragWell) this.well = p;
      if (this.id === 'dream-sky') {
        const i = this.stars.findIndex(
          (s) => Math.hypot((s.x - p.x) * this.width, (s.y - p.y) * this.height) < 20,
        );
        if (i >= 0 && i !== this.lastStar) this.connect(i);
      }
    }
  }
  private erase(p: Point) {
    this.marks = this.marks.filter(
      (m) =>
        !m.points.some(
          (q) =>
            Math.hypot((q.x - p.x) * this.width, (q.y - p.y) * this.height) < this.config.brush * 2,
        ),
    );
  }
  private connect(i: number) {
    if (this.lastStar >= 0 && i !== this.lastStar) {
      this.history();
      this.marks.push({
        tool: 'Link',
        width: 1,
        points: [this.stars[this.lastStar], this.stars[i]],
      });
      if (this.marks.length > 180) this.marks.shift();
      this.announce(`${this.marks.length} star connections.`);
      this.chime(330 + i * 12);
    } else this.announce(`Star ${i + 1} selected. Select another to connect.`);
    this.lastStar = i;
  }
  private addRing(p: Point) {
    this.rings.push({ ...p, age: 0, strength: this.config.intensity });
    if (this.rings.length > 70) this.rings.shift();
  }
  action() {
    if (this.paused) {
      this.announce('Resume the world before interacting.');
      return;
    }
    if (this.id === 'dream-sky') {
      this.connect((this.lastStar + 7 + this.stars.length) % this.stars.length);
      this.dirty = true;
      return;
    }
    if (this.id === 'zen-garden' && this.config.mode !== 'Stone' && this.config.mode !== 'Erase') {
      this.history();
      this.marks.push({
        tool: this.config.lineStyle,
        width: this.config.brush,
        points: Array.from({ length: 70 }, (_, i) => ({
          x: 0.12 + i / 95,
          y: 0.35 + this.rng() * 0.01 + Math.sin(i / 16) * 0.17,
        })),
      });
      if (this.marks.length > 180) this.marks.shift();
      this.dirty = true;
      this.announce('A flowing rake pattern added.');
      return;
    }
    if (this.id === 'liquid') {
      this.soft[0].vx = 0.8 * this.config.intensity;
      this.soft[0].vy = -0.4;
      this.activeUntil = this.time + 1.6;
      this.reducedUntil = performance.now() + 700;
      this.dirty = true;
      this.announce('A gentle push.');
      return;
    }
    const p = { x: 0.25 + this.rng() * 0.5, y: 0.25 + this.rng() * 0.5 };
    this.pointer('down', p);
    this.pointer('up', p);
    this.announce(
      this.id === 'particles'
        ? 'Light stirred around a new point.'
        : this.id === 'breathing'
          ? this.phase()
          : 'A small moment, made by you.',
    );
  }
  nudge(dx: number, dy: number) {
    if (this.paused) return;
    if (
      this.id === 'zen-garden' &&
      this.selected >= 0 &&
      this.marks[this.selected]?.tool === 'Stone'
    ) {
      this.history();
      const p = this.marks[this.selected].points[0];
      p.x = clamp(p.x + dx, 0.02, 0.98);
      p.y = clamp(p.y + dy, 0.02, 0.98);
    } else if (this.id === 'gravity') {
      this.well.x = clamp(this.well.x + dx, 0.05, 0.95);
      this.well.y = clamp(this.well.y + dy, 0.05, 0.95);
    } else {
      this.cursor.x = clamp(this.cursor.x + dx, 0.05, 0.95);
      this.cursor.y = clamp(this.cursor.y + dy, 0.05, 0.95);
      this.activeUntil = this.time + 1.6;
      this.reducedUntil = performance.now() + 700;
    }
    this.dirty = true;
  }
  removeStone() {
    if (this.id === 'zen-garden' && this.selected >= 0 && !this.paused) {
      this.history();
      this.marks.splice(this.selected, 1);
      this.selected = -1;
      this.dirty = true;
      this.announce('Stone removed.');
    }
  }
  phase() {
    return Math.floor(this.time / this.config.pace) % 2 === 0
      ? 'Breathe in, if comfortable'
      : 'Breathe out, at your own pace';
  }
  skip() {
    this.time += this.config.pace;
    this.dirty = true;
    this.announce(this.phase());
  }
  private tick = (now: number) => {
    this.frame = requestAnimationFrame(this.tick);
    const elapsed = this.last ? Math.max(0, (now - this.last) / 1000) : 0;
    const dt = clamp(elapsed, 0, 0.033);
    this.last = now;
    if (document.hidden || !this.visible) return;
    const automatic = this.config.moving && this.config.ambient;
    const active =
      !this.paused &&
      (this.id === 'breathing'
        ? this.config.mode === 'Gentle Guide'
        : automatic || (!this.config.moving && now < this.reducedUntil));
    if (!active && !this.dirty) return;
    if (active) this.time += dt;
    if (this.id === 'breathing' && this.config.mode === 'Gentle Guide' && !this.paused) {
      const phase = this.phase();
      if (phase !== this.announcedPhase) {
        this.announcedPhase = phase;
        this.announce(phase);
      } else if (!this.config.moving && !this.dirty) return;
    }
    this.render(active ? dt : 0, automatic);
    this.dirty = false;
    if (active) {
      this.sampleTime += elapsed;
      this.sampleFrames++;
      if (this.sampleTime >= 1.5) {
        const fps = this.sampleFrames / this.sampleTime;
        if (this.config.quality === 'auto' && fps < 38) this.slow++;
        else this.slow = 0;
        if (this.slow >= 2 && this.budget > 120) {
          this.budget = Math.max(120, Math.round(this.budget * 0.65));
          this.degraded = true;
          this.resize();
          this.slow = 0;
        }
        this.metric({
          fps: Math.round(fps),
          dpr: this.dpr,
          count:
            this.id === 'particles'
              ? Math.min(this.budget, this.particles.length)
              : this.particles.length || this.stars.length,
          quality: `${this.config.quality} (${this.budget})`,
          width: Math.round(this.width),
          height: Math.round(this.height),
        });
        this.sampleTime = 0;
        this.sampleFrames = 0;
      }
    }
  };
  private background(color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, Math.ceil(this.width) + 1, Math.ceil(this.height) + 1);
  }
  private render(dt: number, automatic: boolean) {
    const c = this.ctx,
      w = this.width,
      h = this.height;
    const colors = palettes[this.config.palette];
    this.background(this.id === 'zen-garden' ? '#b9a580' : '#070b1c');
    const wash = c.createRadialGradient(w * 0.5, h * 0.48, 0, w * 0.5, h * 0.5, w * 0.65);
    wash.addColorStop(0, this.id === 'zen-garden' ? '#e8d9b622' : colors[0] + '12');
    wash.addColorStop(1, '#00000000');
    c.fillStyle = wash;
    c.fillRect(0, 0, w, h);
    switch (this.id) {
      case 'particles':
        this.drawParticles(dt, colors);
        break;
      case 'liquid':
        this.drawLiquid(dt, colors);
        break;
      case 'bubbles':
        this.drawBubbles(dt, colors);
        break;
      case 'zen-garden':
        this.drawSand();
        break;
      case 'ocean':
        this.drawOcean(dt, colors, automatic);
        break;
      case 'dream-sky':
        this.drawSky(colors, automatic);
        break;
      case 'gravity':
        this.drawGravity(dt, colors);
        break;
      case 'breathing':
        this.drawBreathing(colors);
        break;
    }
  }
  private drawParticles(dt: number, colors: string[]) {
    const c = this.ctx,
      w = this.width,
      h = this.height,
      k = this.config;
    const n = Math.min(this.budget, this.particles.length);
    let prev: Body | null = null;
    for (let i = 0; i < n; i++) {
      const p = this.particles[i],
        dx = this.cursor.x - p.x,
        dy = this.cursor.y - p.y,
        d = Math.max(0.018, Math.hypot(dx, dy));
      if (this.time < this.activeUntil && d < 0.55 && dt) {
        const f = (0.55 - d) * k.intensity * 0.22;
        if (k.mode === 'Swirl') {
          p.vx += (-dy / d) * f * dt;
          p.vy += (dx / d) * f * dt;
        } else {
          const sign = k.mode === 'Repel' ? -1 : 1;
          p.vx += (dx / d) * f * dt * sign;
          p.vy += (dy / d) * f * dt * sign;
        }
      }
      p.vx = clamp(p.vx * 0.99, -0.25, 0.25);
      p.vy = clamp(p.vy * 0.99, -0.25, 0.25);
      if (dt) {
        p.x = (p.x + p.vx * dt + 1) % 1;
        p.y = (p.y + p.vy * dt + 1) % 1;
      }
      c.fillStyle = colors[i % 3];
      c.globalAlpha = 0.45 + p.r * 0.3;
      if (k.mode === 'Draw / Trail' && this.time < this.activeUntil && i % 3 === 0 && dt) {
        p.x += (this.cursor.x - p.x) * dt * 0.9;
        p.y += (this.cursor.y - p.y) * dt * 0.9;
      }
      c.beginPath();
      c.arc(p.x * w, p.y * h, p.r * 1.25, 0, 7);
      c.fill();
      if (
        this.budget > 300 &&
        prev &&
        i % 3 === 0 &&
        Math.hypot(prev.x - p.x, prev.y - p.y) < 0.07
      ) {
        c.globalAlpha = 0.1 * k.feedback;
        c.beginPath();
        c.moveTo(prev.x * w, prev.y * h);
        c.lineTo(p.x * w, p.y * h);
        c.strokeStyle = colors[0];
        c.stroke();
      }
      prev = p;
    }
    c.globalAlpha = 1;
  }
  private drawLiquid(dt: number, colors: string[]) {
    const c = this.ctx,
      w = this.width,
      h = this.height;
    this.soft.forEach((b, i) => {
      if (dt) {
        const target =
          this.down && this.selected === i
            ? this.cursor
            : this.config.mode === 'Flow'
              ? {
                  x: b.home.x + Math.sin(this.time * 0.3 + i * 2) * 0.09,
                  y: b.home.y + Math.cos(this.time * 0.4 + i) * 0.08,
                }
              : b.home;
        const force = this.down && this.selected === i ? 24 * this.config.intensity : 6;
        b.vx += (target.x - b.x) * force * dt;
        b.vy += (target.y - b.y) * force * dt;
        b.vx *= Math.exp(-4 * dt);
        b.vy *= Math.exp(-4 * dt);
        b.x = clamp(b.x + b.vx * dt, 0.12, 0.88);
        b.y = clamp(b.y + b.vy * dt, 0.15, 0.85);
        b.stretch +=
          (Math.min(0.7, Math.hypot(b.vx, b.vy) * 0.8) - b.stretch) * Math.min(1, dt * 8);
        b.angle = Math.atan2(b.vy, b.vx);
      }
      const r = Math.min(w * 0.17, h * 0.24),
        x = b.x * w,
        y = b.y * h;
      c.save();
      c.translate(x, y);
      c.rotate(b.angle * b.stretch);
      c.scale(1 + b.stretch, 1 - b.stretch * 0.35);
      c.beginPath();
      for (let j = 0; j <= 90; j++) {
        const a = (j / 90) * Math.PI * 2,
          morph = this.config.mode === 'Morph' ? 0.2 : this.config.mode === 'Flow' ? 0.14 : 0.045;
        const radius =
          r *
          (1 +
            Math.sin(a * 3 + this.time * 0.65 + i * 3) * morph +
            Math.cos(a * 2 - this.time * 0.4) * 0.055);
        const xx = Math.cos(a) * radius,
          yy = Math.sin(a) * radius;
        if (!j) c.moveTo(xx, yy);
        else c.lineTo(xx, yy);
      }
      c.closePath();
      const g = c.createLinearGradient(-r, -r, r, r);
      g.addColorStop(0, '#f2fae9d0');
      g.addColorStop(0.17, colors[i] + '99');
      g.addColorStop(0.5, '#38448099');
      g.addColorStop(0.8, colors[2] + '88');
      g.addColorStop(1, colors[i] + 'cc');
      c.fillStyle = g;
      c.fill();
      c.strokeStyle = colors[i] + 'cc';
      c.lineWidth = 1.4;
      c.stroke();
      c.beginPath();
      c.ellipse(-r * 0.23, -r * 0.37, r * 0.32, r * 0.12, -0.5, 0, 7);
      const shine = c.createRadialGradient(-r * 0.23, -r * 0.37, 0, -r * 0.23, -r * 0.37, r * 0.34);
      shine.addColorStop(0, '#ffffff55');
      shine.addColorStop(1, '#ffffff00');
      c.fillStyle = shine;
      c.fill();
      c.restore();
    });
  }
  private drawBubbles(dt: number, colors: string[]) {
    const c = this.ctx,
      w = this.width,
      h = this.height;
    for (const b of this.particles) {
      if (dt) {
        const dx = b.x - this.cursor.x,
          dy = b.y - this.cursor.y,
          d = Math.max(0.025, Math.hypot(dx, dy));
        if (this.time < this.activeUntil && d < 0.18) {
          b.vx += (dx / d) * 0.08 * dt;
          b.vy += (dy / d) * 0.08 * dt;
        }
        b.x += (b.vx + Math.sin(this.time * 0.5 + b.hue * 10) * 0.006) * dt * this.config.speed;
        b.y -= (0.016 + Math.abs(b.vy)) * dt * this.config.speed;
        if (b.y < -0.1) b.y = 1.1;
        if (b.x < -0.1) b.x = 1.1;
        if (b.x > 1.1) b.x = -0.1;
      }
      const x = b.x * w,
        y = b.y * h,
        r = b.r * this.config.size;
      const g = c.createRadialGradient(x - r * 0.4, y - r * 0.5, 0, x, y, r);
      g.addColorStop(0, '#ffffff22');
      g.addColorStop(0.7, colors[Math.floor(b.hue * 3)] + '06');
      g.addColorStop(0.95, colors[2] + '33');
      g.addColorStop(1, colors[0] + '88');
      c.fillStyle = g;
      c.beginPath();
      c.arc(x, y, r, 0, 7);
      c.fill();
      c.strokeStyle = colors[Math.floor(b.hue * 3)] + '77';
      c.lineWidth = 0.8;
      c.stroke();
      c.beginPath();
      c.ellipse(x - r * 0.3, y - r * 0.45, r * 0.17, r * 0.08, -0.5, 0, 7);
      c.fillStyle = '#ffffff77';
      c.fill();
    }
    this.drawRings(dt, colors, true);
  }
  private drawSand() {
    const c = this.ctx,
      w = this.width,
      h = this.height;
    const rng = random(99);
    c.fillStyle = '#5c4b3818';
    for (let i = 0; i < 1600; i++) c.fillRect(rng() * w, rng() * h, 1, 1);
    for (const [index, m] of this.marks.entries()) {
      if (!m.points.length) continue;
      if (m.tool === 'Stone') {
        const p = m.points[0],
          x = p.x * w,
          y = p.y * h,
          r = m.width;
        c.save();
        c.translate(x, y);
        c.rotate(-0.3);
        c.shadowColor = '#332b3355';
        c.shadowBlur = 10;
        c.shadowOffsetY = 8;
        const g = c.createLinearGradient(-r, -r, r, r);
        g.addColorStop(0, '#a4a49e');
        g.addColorStop(0.4, '#767d78');
        g.addColorStop(1, '#384440');
        c.fillStyle = g;
        c.beginPath();
        c.ellipse(0, 0, r, r * 0.7, 0, 0, 7);
        c.fill();
        c.shadowColor = 'transparent';
        if (index === this.selected) {
          c.strokeStyle = '#fff2bc';
          c.lineWidth = 2;
          c.stroke();
        }
        c.restore();
      } else {
        const lines = m.tool === 'Single line' ? 1 : 5;
        for (let j = 0; j < lines; j++) {
          const offset = (j - (lines - 1) / 2) * m.width * 0.42;
          c.beginPath();
          m.points.forEach((p, i) => {
            const x = p.x * w + offset,
              y = p.y * h;
            if (i === 0) c.moveTo(x, y);
            else c.lineTo(x, y);
          });
          c.lineCap = 'round';
          c.lineJoin = 'round';
          c.strokeStyle = '#6b5b3f66';
          c.lineWidth = m.tool === 'Wide groove' ? 2.5 : 1.2;
          c.stroke();
          c.save();
          c.translate(1, 1.2);
          c.strokeStyle = '#f7e5ba66';
          c.lineWidth = 0.8;
          c.stroke();
          c.restore();
        }
      }
    }
  }
  private drawOcean(dt: number, colors: string[], automatic: boolean) {
    const c = this.ctx,
      w = this.width,
      h = this.height;
    const reflection = c.createRadialGradient(w * 0.5, h * 0.25, 0, w * 0.5, h * 0.3, h * 0.6);
    reflection.addColorStop(0, colors[1] + '25');
    reflection.addColorStop(1, '#00000000');
    c.fillStyle = reflection;
    c.fillRect(0, 0, w, h);
    c.lineWidth = 0.6;
    for (let i = 0; i < this.config.density; i++) {
      const y = ((i + 1) / (this.config.density + 1)) * h;
      c.beginPath();
      for (let x = 0; x <= w; x += 15) {
        const yy = y + Math.sin(x / 90 + this.time * (1 - this.config.calm) + i) * 2;
        if (!x) c.moveTo(x, yy);
        else c.lineTo(x, yy);
      }
      c.strokeStyle = colors[i % 3] + '17';
      c.stroke();
    }
    if (this.config.rain && automatic && dt && this.rng() < dt * 4)
      this.addRing({ x: this.rng(), y: this.rng() });
    this.drawRings(dt * (0.5 + (1 - this.config.calm)), colors, false);
  }
  private drawRings(dt: number, colors: string[], popping: boolean) {
    const c = this.ctx,
      w = this.width,
      h = this.height;
    for (let j = this.rings.length - 1; j >= 0; j--) {
      const r = this.rings[j];
      r.age += dt;
      if (r.age > 5) {
        this.rings.splice(j, 1);
        continue;
      }
      for (let i = 0; i < (popping ? 1 : 4); i++) {
        const radius = 4 + r.age * (popping ? 40 : 36) + i * 8;
        c.beginPath();
        c.ellipse(r.x * w, r.y * h, radius, radius * (popping ? 1 : 0.48), 0, 0, 7);
        c.strokeStyle = colors[i % 3];
        c.globalAlpha = Math.max(0, 1 - r.age / 5) * 0.4 * r.strength * this.config.feedback;
        c.lineWidth = 0.8;
        c.stroke();
      }
    }
    c.globalAlpha = 1;
  }
  private drawSky(colors: string[], automatic: boolean) {
    const c = this.ctx,
      w = this.width,
      h = this.height;
    for (const m of this.marks) {
      c.beginPath();
      m.points.forEach((p, i) => (i ? c.lineTo(p.x * w, p.y * h) : c.moveTo(p.x * w, p.y * h)));
      c.strokeStyle = colors[0] + 'b0';
      c.lineWidth = 1;
      c.stroke();
    }
    this.stars.forEach((s, i) => {
      const x = s.x * w,
        y = s.y * h,
        selected = this.lastStar === i;
      c.beginPath();
      c.arc(x, y, selected ? 5 : 2 + (i % 3) * 0.4, 0, 7);
      c.fillStyle = colors[i % 3];
      c.fill();
      if (selected || i % 7 === 0) {
        c.beginPath();
        c.moveTo(x - 9, y);
        c.lineTo(x + 9, y);
        c.moveTo(x, y - 9);
        c.lineTo(x, y + 9);
        c.strokeStyle = colors[i % 3] + '66';
        c.lineWidth = 0.6;
        c.stroke();
      }
    });
    if (this.config.shooting && automatic && this.time % 16 < 1.5) {
      const x = ((this.time % 16) / 1.5) * w;
      c.beginPath();
      c.moveTo(x - 45, h * 0.15 - 15);
      c.lineTo(x, h * 0.15);
      c.strokeStyle = colors[1] + '66';
      c.stroke();
    }
  }
  private drawGravity(dt: number, colors: string[]) {
    const c = this.ctx,
      w = this.width,
      h = this.height;
    for (const [i, b] of this.particles.entries()) {
      const ox = b.x,
        oy = b.y;
      if (dt)
        gravityStep(
          b,
          this.well,
          dt * this.config.speed,
          this.config.intensity * (this.config.mode === 'Repel' ? -0.08 : 0.08),
        );
      c.beginPath();
      c.moveTo(b.x * w, b.y * h);
      c.lineTo((b.x - b.vx * this.config.trails) * w, (b.y - b.vy * this.config.trails) * h);
      c.strokeStyle = colors[i % 3] + '44';
      c.lineWidth = 1;
      c.stroke();
      c.beginPath();
      c.arc(b.x * w, b.y * h, b.r * 3, 0, 7);
      c.fillStyle = colors[i % 3];
      c.fill();
      if (!Number.isFinite(b.x)) {
        b.x = ox;
        b.y = oy;
        b.vx = 0;
        b.vy = 0;
      }
    }
    c.strokeStyle = colors[0] + '99';
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.ellipse(this.well.x * w, this.well.y * h, 15 + i * 9, 15 + i * 9, 0, 0, 7);
      c.stroke();
    }
    c.fillStyle = colors[1];
    c.beginPath();
    c.arc(this.well.x * w, this.well.y * h, 5, 0, 7);
    c.fill();
  }
  private drawBreathing(colors: string[]) {
    const c = this.ctx,
      w = this.width,
      h = this.height,
      k = this.config;
    const cycle = (this.time % (k.pace * 2)) / (k.pace * 2),
      scale = k.moving ? 0.78 + (0.22 * (1 - Math.cos(cycle * Math.PI * 2))) / 2 : 0.85;
    const r = Math.min(w * 0.29, h * 0.32) * scale;
    for (let i = 14; i >= 0; i--) {
      c.beginPath();
      for (let j = 0; j <= 100; j++) {
        const a = (j / 100) * Math.PI * 2,
          rr =
            r *
            (1 +
              i * 0.018 +
              Math.sin(a * 6 + this.time * (k.moving ? 0.05 : 0) + i * 0.15) * 0.035);
        const x = w / 2 + Math.cos(a) * rr,
          y = h * 0.46 + Math.sin(a) * rr;
        if (!j) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.strokeStyle = colors[i % 3] + (i === 0 ? 'aa' : '25');
      c.lineWidth = 0.8;
      c.stroke();
    }
    c.textAlign = 'center';
    c.font = `${Math.min(20, w / 22)}px Georgia`;
    c.fillStyle = '#f5f6ff';
    c.fillText(this.paused ? 'Rest here.' : this.phase(), w / 2, h * 0.46);
    c.font = '10px Arial';
    c.fillStyle = '#b9c1da';
    c.fillText(
      k.mode === 'Gentle Guide'
        ? 'YOUR PACE IS ALWAYS THE RIGHT PACE'
        : 'PRESS NEXT BREATH WHEN YOU FEEL LIKE IT',
      w / 2,
      h * 0.46 + 30,
    );
  }
  destroy() {
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.intersection.disconnect();
    document.removeEventListener('visibilitychange', this.visibility);
    this.particles = [];
    this.rings = [];
    this.marks = [];
    this.undoMarks = [];
    this.redoMarks = [];
  }
}
