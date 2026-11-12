import { clamp, localPoint, random } from '@/lib/math';

export type PlaygroundKind = 'hero' | 'stars' | 'light' | 'puzzle' | 'break' | 'calm';
export type PlaygroundOptions = {
  moving: boolean;
  ambient: boolean;
  battery: boolean;
  feedback: number;
  paused: boolean;
};
type Dot = {
  x: number;
  y: number;
  hx: number;
  hy: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
};
type Trail = { x: number; y: number; age: number; hue: number };
type Vertex = { x: number; y: number; z: number; sin: number; cos: number };
type Mesh = { bands: Vertex[][]; cross: Vertex[][] };
const TAU = Math.PI * 2;
const colors = ['#a78bff', '#76edff', '#ff9bd6', '#8affd7'];

/** Small, bounded 2D scenes with projected 3D geometry. All coordinates stay local to the canvas. */
export class Playground {
  private ctx: CanvasRenderingContext2D;
  private backdrop = document.createElement('canvas');
  private meshes = new Map<boolean, Mesh>();
  private width = 1;
  private height = 1;
  private frame = 0;
  private last = 0;
  private time = 0;
  private active = true;
  private dirty = true;
  private settle = 0;
  private observer: ResizeObserver;
  private intersection: IntersectionObserver;
  private dots: Dot[] = [];
  private homes: { x: number; y: number }[] = [];
  private stars: Dot[] = [];
  private trails: Trail[] = [];
  private rings: Trail[] = [];
  private links: [number, number][] = [];
  private selected = -1;
  private next = 0;
  private held = false;
  private dragged = -1;
  private pointer = { x: 0.5, y: 0.5 };
  private rotation = { x: 0, y: 0, vx: 0, vy: 0 };
  private burst = 0;
  private reforming = false;
  private breathe = false;
  private breathStart = 0;
  private phase = false;
  private low = false;
  private sample = 0;
  private frames = 0;
  private slow = 0;
  constructor(
    private canvas: HTMLCanvasElement,
    readonly kind: PlaygroundKind,
    private options: PlaygroundOptions,
    private announce: (s: string) => void,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx)
      throw Error('This browser cannot draw the scene. Use the world links below to explore.');
    this.ctx = ctx;
    const rng = random(829);
    this.stars = Array.from({ length: 130 }, () =>
      this.dot(rng(), rng(), rng() * 1.3 + 0.4, rng() * 360),
    );
    const count = kind === 'stars' ? 9 : kind === 'puzzle' ? 7 : 22;
    this.dots = Array.from({ length: count }, (_, i) => {
      const a = (i / count) * TAU;
      const x =
        kind === 'stars'
          ? 0.15 + rng() * 0.7
          : kind === 'puzzle'
            ? 0.5 + Math.cos(a) * 0.25
            : 0.5 + Math.cos(a) * 0.33;
      const y = kind === 'stars' ? 0.17 + rng() * 0.65 : 0.5 + Math.sin(a) * 0.31;
      return this.dot(x, y, 8 + rng() * 10, 250 + (i / count) * 120);
    });
    this.homes = this.dots.map((d) => ({ x: d.x, y: d.y }));
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(canvas);
    this.intersection = new IntersectionObserver(
      ([entry]) => {
        this.active = entry.isIntersecting;
        this.last = 0;
        this.invalidate();
      },
      { rootMargin: '60px' },
    );
    this.intersection.observe(canvas);
    document.addEventListener('visibilitychange', this.visibility);
    canvas.addEventListener('pointerdown', this.down);
    canvas.addEventListener('pointermove', this.move);
    canvas.addEventListener('pointerup', this.up);
    canvas.addEventListener('pointercancel', this.cancel);
    canvas.addEventListener('lostpointercapture', this.cancel);
    this.resize();
    this.invalidate();
  }
  private dot(x: number, y: number, size: number, hue: number): Dot {
    return { x, y, hx: x, hy: y, vx: 0, vy: 0, size, hue };
  }
  private resize = () => {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    const dpr = Math.min(devicePixelRatio || 1, this.options.battery || this.low ? 1 : 1.5);
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.backdrop.width = Math.ceil(this.width);
    this.backdrop.height = Math.ceil(this.height);
    const wash = this.backdrop.getContext('2d');
    if (wash) {
      const hero = this.kind === 'hero',
        w = this.width,
        h = this.height;
      this.glow(w * 0.4, h * 0.44, w * 0.48, '#773cff', hero ? 0.52 : 0.16, wash);
      this.glow(w * 0.7, h * 0.57, w * 0.32, '#00d9ed', hero ? 0.32 : 0.13, wash);
      if (hero) {
        this.glow(w * 0.46, h * 0.62, w * 0.33, '#ed5ba7', 0.28, wash);
        this.glow(w * 0.5, h * 0.49, Math.min(w * 0.31, h * 0.31) * 1.55, '#8854ff', 0.7, wash);
      }
    }
    this.invalidate();
  };
  private visibility = () => {
    this.last = 0;
    this.invalidate();
  };
  private invalidate() {
    this.dirty = true;
    if (!this.frame) this.frame = requestAnimationFrame(this.tick);
  }
  configure(options: PlaygroundOptions) {
    const resize = options.battery !== this.options.battery;
    this.options = options;
    this.last = 0;
    if (resize) this.resize();
    this.invalidate();
  }
  private point(e: PointerEvent) {
    return localPoint(e.clientX, e.clientY, this.canvas.getBoundingClientRect());
  }
  private down = (e: PointerEvent) => {
    if (this.options.paused || !e.isPrimary) return;
    this.canvas.focus({ preventScroll: true });
    this.canvas.setPointerCapture(e.pointerId);
    this.pointer = this.point(e);
    this.held = true;
    this.settle = 2;
    if (this.kind === 'stars' || this.kind === 'puzzle') {
      let best = 44;
      this.dots.forEach((d, i) => {
        const distance = Math.hypot(
          (d.x - this.pointer.x) * this.width,
          (d.y - this.pointer.y) * this.height,
        );
        if (distance < best) {
          best = distance;
          this.dragged = i;
        }
      });
      if (this.kind === 'stars' && this.dragged >= 0) this.connect(this.dragged);
    } else if (this.kind === 'light') this.paint();
    else if (this.kind === 'calm') this.breath();
    else this.scatter();
    this.invalidate();
  };
  private move = (e: PointerEvent) => {
    if (this.options.paused || !e.isPrimary) return;
    const point = this.point(e),
      dx = point.x - this.pointer.x,
      dy = point.y - this.pointer.y;
    this.pointer = point;
    if (this.held) {
      this.settle = 1.5;
      if (this.dragged >= 0) {
        const d = this.dots[this.dragged];
        d.x = point.x;
        d.y = point.y;
      }
      if (this.kind === 'hero') {
        this.rotation.vx += dx * 3;
        this.rotation.vy += dy * 3;
      }
    }
    if (this.kind === 'light' && (this.held || e.pointerType === 'mouse')) {
      this.paint();
      this.settle = 1.5;
    }
    this.invalidate();
  };
  private up = (e: PointerEvent) => {
    if (this.kind === 'puzzle' && this.dragged >= 0) {
      const d = this.dots[this.dragged],
        target = this.target(this.dragged);
      if (Math.hypot((d.x - target.x) * this.width, (d.y - target.y) * this.height) < 65) {
        d.hx = target.x;
        d.hy = target.y;
        this.announce('A fragment found its place.');
      } else {
        d.hx = d.x;
        d.hy = d.y;
        this.announce('Fragment placed. Move it closer to the glowing outline to snap.');
      }
    }
    if (this.kind === 'stars' && this.dragged >= 0) {
      const d = this.dots[this.dragged];
      d.hx = d.x;
      d.hy = d.y;
      this.announce('Star placed. Your constellation moves with it.');
    }
    this.held = false;
    this.dragged = -1;
    this.settle = 2;
    if (this.canvas.hasPointerCapture(e.pointerId)) this.canvas.releasePointerCapture(e.pointerId);
    this.invalidate();
  };
  private cancel = () => {
    this.held = false;
    this.dragged = -1;
    this.invalidate();
  };
  private target(i: number) {
    const a = (i / this.dots.length) * TAU;
    return { x: 0.5 + Math.cos(a) * 0.14, y: 0.5 + Math.sin(a) * 0.18 };
  }
  private connect(i: number) {
    if (this.selected >= 0 && this.selected !== i) {
      this.links.push([this.selected, i]);
      this.links = this.links.slice(-24);
      this.announce(`${this.links.length} constellation connections. Drag a star to reshape them.`);
    } else this.announce(`Star ${i + 1} selected. Choose another to connect.`);
    this.selected = i;
  }
  private paint() {
    this.trails.push({ ...this.pointer, age: 0, hue: 260 + ((this.time * 12) % 100) });
    if (this.trails.length > 100) this.trails.shift();
  }
  private scatter() {
    this.burst = 1;
    this.reforming = this.options.moving;
    this.dots.forEach((d, i) => {
      const a = (i / this.dots.length) * TAU;
      d.vx += Math.cos(a) * 0.55;
      d.vy += Math.sin(a) * 0.55;
    });
    this.rings.push({ ...this.pointer, age: 0, hue: 280 });
    this.rings = this.rings.slice(-4);
    this.settle = 3;
    this.announce(
      this.options.moving
        ? 'Light scattered. Watch the fragments find their way home.'
        : 'A quiet light burst. Fragments stay still with reduced motion.',
    );
  }
  private breath() {
    this.phase = !this.phase;
    this.settle = 1;
    this.announce(
      this.phase ? 'Breathe in, at your own pace.' : 'Breathe out, whenever you are ready.',
    );
  }
  action() {
    if (this.options.paused) return;
    if (this.kind === 'stars') {
      this.connect(this.next++ % this.dots.length);
    } else if (this.kind === 'puzzle') {
      const i = this.next++ % this.dots.length,
        d = this.dots[i],
        t = this.target(i);
      d.hx = t.x;
      d.hy = t.y;
      this.announce(`Fragment ${i + 1} snapped into place.`);
    } else if (this.kind === 'light') {
      for (let i = 0; i < 50; i++)
        this.trails.push({
          x: 0.12 + i / 65,
          y: 0.5 + Math.sin(i / 9 + this.next) * 0.2,
          age: 0,
          hue: 245 + i * 1.5,
        });
      this.trails = this.trails.slice(-100);
      this.next++;
      this.announce('A ribbon of light, made by you.');
    } else if (this.kind === 'calm') this.breath();
    else this.scatter();
    this.settle = 3;
    this.invalidate();
  }
  reset() {
    this.links = [];
    this.selected = -1;
    this.next = 0;
    this.trails = [];
    this.rings = [];
    this.burst = 0;
    this.reforming = false;
    this.breathe = false;
    this.phase = false;
    this.dots.forEach((d, i) => {
      d.hx = this.homes[i].x;
      d.hy = this.homes[i].y;
      d.x = d.hx;
      d.y = d.hy;
      d.vx = 0;
      d.vy = 0;
    });
    this.announce('A fresh little beginning.');
    this.invalidate();
  }
  guide(enabled: boolean) {
    this.breathe = enabled;
    this.breathStart = this.time;
    this.announce(
      enabled
        ? 'Gentle guide started. Follow your own comfortable pace.'
        : 'Guide stopped. Take your time.',
    );
    this.invalidate();
  }
  nudge(dx: number, dy: number) {
    if (this.options.paused) return;
    const d =
      this.dots[
        this.selected >= 0 ? this.selected : (this.next - 1 + this.dots.length) % this.dots.length
      ];
    d.hx = clamp(d.hx + dx, 0.05, 0.95);
    d.hy = clamp(d.hy + dy, 0.08, 0.92);
    if (!this.options.moving) {
      d.x = d.hx;
      d.y = d.hy;
    }
    this.pointer.x = clamp(this.pointer.x + dx, 0, 1);
    this.pointer.y = clamp(this.pointer.y + dy, 0, 1);
    this.settle = 1;
    this.invalidate();
  }
  private tick = (now: number) => {
    this.frame = 0;
    if (!this.active || document.hidden) {
      this.last = 0;
      return;
    }
    const elapsed = this.last ? (now - this.last) / 1000 : 0,
      dt = Math.min(elapsed, 0.033);
    this.last = now;
    const auto = this.options.moving && this.options.ambient && !this.options.paused;
    const active = !this.options.paused && (auto || this.held || this.settle > 0 || this.breathe);
    if (active) this.time += dt;
    if (active && !this.options.moving) {
      this.dots.forEach((d) => {
        d.x = d.hx;
        d.y = d.hy;
      });
      this.burst = 0;
    } else if (active) {
      this.rotation.x += this.rotation.vx * dt;
      this.rotation.y += this.rotation.vy * dt;
      this.rotation.vx *= Math.exp(-4 * dt);
      this.rotation.vy *= Math.exp(-4 * dt);
      this.dots.forEach((d, i) => {
        if (this.held && i === this.dragged) return;
        d.vx += (d.hx - d.x) * 18 * dt;
        d.vy += (d.hy - d.y) * 18 * dt;
        d.vx *= Math.exp(-5 * dt);
        d.vy *= Math.exp(-5 * dt);
        d.x += d.vx * dt;
        d.y += d.vy * dt;
      });
      this.burst *= Math.exp(-2 * dt);
      if (this.reforming && this.burst < 0.01) {
        this.reforming = false;
        this.announce('Back together. Ready for another little burst.');
      }
    }
    let phaseChanged = false;
    if (this.breathe) {
      const phase = Math.floor((this.time - this.breathStart) / 5) % 2 === 0;
      if (phase !== this.phase) {
        this.phase = phase;
        phaseChanged = true;
        this.announce(
          phase ? 'Breathe in, at your own pace.' : 'Breathe out, whenever you are ready.',
        );
      }
    }
    const stillGuide = this.kind === 'calm' && !this.options.moving && this.breathe;
    if ((active || this.dirty) && (!stillGuide || this.dirty || phaseChanged))
      this.render(active ? dt : 0, auto);
    this.dirty = false;
    this.settle = Math.max(0, this.settle - dt);
    if (auto && elapsed > 0) {
      this.sample += elapsed;
      this.frames++;
      if (this.sample > 1.5) {
        if (this.frames / this.sample < 38) this.slow++;
        else this.slow = 0;
        if (this.slow >= 2 && !this.low) {
          this.low = true;
          this.resize();
        }
        this.sample = 0;
        this.frames = 0;
      }
    }
    if (active && !this.frame) this.frame = requestAnimationFrame(this.tick);
    if (!active) this.last = 0;
  };
  private glow(x: number, y: number, r: number, color: string, alpha = 1, c = this.ctx) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(
      0,
      color +
        Math.round(alpha * 80)
          .toString(16)
          .padStart(2, '0'),
    );
    g.addColorStop(1, color + '00');
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  private render(dt: number, auto: boolean) {
    const c = this.ctx,
      w = this.width,
      h = this.height,
      hero = this.kind === 'hero';
    c.clearRect(0, 0, Math.ceil(w) + 1, Math.ceil(h) + 1);
    const px = this.pointer.x - 0.5,
      py = this.pointer.y - 0.5;
    c.drawImage(this.backdrop, px * w * 0.035, py * h * 0.035);
    const starCount = this.low || this.options.battery ? 45 : hero ? 130 : 35;
    for (let i = 0; i < starCount; i++) {
      const s = this.stars[i],
        parallax = this.options.moving ? ((i % 3) + 1) * 7 : 0;
      const drift = auto ? Math.sin(this.time * 0.13 + i) * 3 : 0;
      const x = s.x * w + px * parallax,
        y = s.y * h + py * parallax + drift;
      c.globalAlpha = 0.25 + s.size * 0.3;
      c.fillStyle = colors[i % 4];
      c.beginPath();
      c.arc(x, y, s.size, 0, TAU);
      c.fill();
      if (i % 13 === 0) {
        c.strokeStyle = colors[i % 4];
        c.lineWidth = 0.6;
        c.beginPath();
        c.moveTo(x - 4, y);
        c.lineTo(x + 4, y);
        c.moveTo(x, y - 4);
        c.lineTo(x, y + 4);
        c.stroke();
      }
    }
    c.globalAlpha = 1;
    if (hero) this.core(auto);
    else if (this.kind === 'stars') this.constellation();
    else if (this.kind === 'puzzle' || this.kind === 'break') this.fragments(auto);
    else if (this.kind === 'calm') this.calm();
    this.trails.forEach((t) => (t.age += dt));
    if (dt) this.trails = this.trails.filter((t) => t.age < 5);
    for (let i = 1; i < this.trails.length; i++) {
      const a = this.trails[i - 1],
        b = this.trails[i];
      if (Math.hypot(a.x - b.x, a.y - b.y) > 0.18) continue;
      c.globalAlpha = Math.max(0, 1 - b.age / 5);
      c.lineCap = 'round';
      c.lineWidth = 8;
      c.strokeStyle = `hsla(${b.hue},100%,65%,.09)`;
      c.beginPath();
      c.moveTo(a.x * w, a.y * h);
      c.lineTo(b.x * w, b.y * h);
      c.stroke();
      c.lineWidth = 1.8;
      c.strokeStyle = `hsla(${b.hue},100%,80%,.9)`;
      c.stroke();
    }
    c.globalAlpha = 1;
    if (this.kind === 'light' && !this.trails.length) {
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        for (let j = 0; j <= 80; j++) {
          const x = (j / 80) * w,
            y = h * 0.5 + Math.sin(j / 11 + i * 0.4 + this.time * 0.3) * h * 0.14 + i * 7;
          if (j) c.lineTo(x, y);
          else c.moveTo(x, y);
        }
        c.strokeStyle = colors[i] + 'aa';
        c.lineWidth = 1.5;
        c.stroke();
      }
    }
    this.rings.forEach((r) => {
      r.age += dt;
      c.beginPath();
      c.arc(r.x * w, r.y * h, 10 + r.age * 130, 0, TAU);
      c.strokeStyle = `rgba(196,162,255,${Math.max(0, 0.35 - r.age * 0.25) * this.options.feedback})`;
      c.lineWidth = 1;
      c.stroke();
    });
    this.rings = this.rings.filter((r) => r.age < 1.5);
  }
  private core(auto: boolean) {
    const time = this.options.moving ? this.time : 0;
    const c = this.ctx,
      w = this.width,
      h = this.height,
      r = Math.min(w * 0.31, h * 0.31) * (1 + Math.sin(time * 0.5) * 0.025),
      cx = w * 0.5,
      cy = h * 0.49;
    const turn =
      (auto ? time * 0.075 : 0) +
      this.rotation.x +
      (this.options.moving ? (this.pointer.x - 0.5) * 0.22 : 0);
    const tilt = 0.7 + Math.sin(time * 0.15) * 0.12 + this.rotation.y * 0.4;
    const ct = Math.cos(turn),
      st = Math.sin(turn),
      cp = Math.cos(tilt),
      sp = Math.sin(tilt),
      waveC = Math.cos(time * 0.23),
      waveS = Math.sin(time * 0.23);
    const project = (v: Vertex) => {
      const ripple = 1 + (v.sin * waveC + v.cos * waveS) * 0.075;
      const x = v.x * r * ripple,
        y = v.y * r * ripple,
        z = v.z * r;
      const xx = x * ct - y * st,
        yy = x * st + y * ct;
      return {
        x: cx + xx,
        y: cy + yy * cp - z * sp,
      };
    };
    const mesh = this.mesh(this.low || this.options.battery),
      bands = mesh.bands.length;
    for (let i = 0; i < bands; i++) {
      const b = (i / bands) * TAU;
      c.beginPath();
      for (let j = 0; j < mesh.bands[i].length; j++) {
        const p = project(mesh.bands[i][j]);
        if (j) c.lineTo(p.x, p.y);
        else c.moveTo(p.x, p.y);
      }
      if (i % 2 === 0) {
        const ribbon = new Path2D();
        mesh.bands[i].forEach((v, j) => {
          const p = project(v);
          if (j) ribbon.lineTo(p.x, p.y);
          else ribbon.moveTo(p.x, p.y);
        });
        const next = mesh.bands[(i + 1) % bands];
        for (let j = next.length - 1; j >= 0; j--) {
          const p = project(next[j]);
          ribbon.lineTo(p.x, p.y);
        }
        ribbon.closePath();
        c.fillStyle = `hsla(${245 + Math.sin(b) * 65},100%,65%,.055)`;
        c.fill(ribbon);
      }
      c.strokeStyle = `hsla(${245 + Math.sin(b) * 65},100%,${65 + Math.sin(b) * 10}%,${0.4 + Math.cos(b) * 0.2})`;
      c.lineWidth = i % 5 === 0 ? 1.8 : 0.8;
      c.stroke();
    }
    for (let i = 0; i < mesh.cross.length; i++) {
      c.beginPath();
      for (let j = 0; j < mesh.cross[i].length; j++) {
        const p = project(mesh.cross[i][j]);
        if (j) c.lineTo(p.x, p.y);
        else c.moveTo(p.x, p.y);
      }
      c.strokeStyle = colors[i % 4] + '40';
      c.lineWidth = 0.6;
      c.stroke();
    }
    c.save();
    c.translate(cx, cy);
    c.rotate(-0.4);
    c.beginPath();
    c.ellipse(0, 0, r * 1.42, r * 0.38, 0, 0, TAU);
    c.strokeStyle = '#b6a2ff40';
    c.lineWidth = 0.7;
    c.stroke();
    c.restore();
    this.dots.forEach((d, i) => {
      const a = (i / this.dots.length) * TAU + (auto ? time * 0.06 : 0),
        radius = r * (1.22 + (i % 3) * 0.12),
        x = cx + Math.cos(a) * radius + (d.x - d.hx) * w,
        y = cy + Math.sin(a) * radius * 0.66 + (d.y - d.hy) * h;
      const dx = x - this.pointer.x * w,
        dy = y - this.pointer.y * h,
        distance = Math.max(1, Math.hypot(dx, dy));
      const push = this.options.moving ? Math.max(0, 1 - distance / 100) * 12 : 0;
      this.shard(
        x + (dx / distance) * push,
        y + (dy / distance) * push,
        d.size * (w < 450 ? 0.6 : 1),
        a + time * 0.05,
        colors[i % 4],
        i,
      );
    });
    for (let i = 0; i < (this.low ? 30 : 70); i++) {
      const a = i * 0.33 + time * 0.12;
      const rr = r * (1.08 + (i % 9) * 0.055) + this.burst * (i % 5) * 12;
      const x = cx + Math.cos(a) * rr,
        y = cy + Math.sin(a) * rr * 0.7;
      c.fillStyle = colors[i % 4];
      c.globalAlpha = 0.3 + (i % 3) * 0.2;
      c.beginPath();
      c.arc(x, y, i % 7 === 0 ? 2.1 : 1, 0, TAU);
      c.fill();
      if (i % 7 === 0 && auto) {
        c.strokeStyle = colors[i % 4] + '55';
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(cx + Math.cos(a - 0.12) * rr, cy + Math.sin(a - 0.12) * rr * 0.7);
        c.stroke();
      }
    }
    c.globalAlpha = 1;
  }
  private mesh(low: boolean): Mesh {
    const cached = this.meshes.get(low);
    if (cached) return cached;
    const vertex = (a: number, b: number): Vertex => ({
      x: Math.cos(a) * (0.7 + 0.23 * Math.cos(b)),
      y: Math.sin(a) * (0.7 + 0.23 * Math.cos(b)),
      z: Math.sin(b) * 0.28,
      sin: Math.sin(a * 3 + b * 2),
      cos: Math.cos(a * 3 + b * 2),
    });
    const bands = low ? 12 : 24,
      steps = low ? 36 : 56,
      cross = low ? 8 : 12,
      segments = low ? 12 : 18;
    const mesh = {
      bands: Array.from({ length: bands }, (_, i) =>
        Array.from({ length: steps + 1 }, (_, j) => vertex((j / steps) * TAU, (i / bands) * TAU)),
      ),
      cross: Array.from({ length: cross }, (_, i) =>
        Array.from({ length: segments + 1 }, (_, j) =>
          vertex((i / cross) * TAU, (j / segments) * TAU),
        ),
      ),
    };
    this.meshes.set(low, mesh);
    return mesh;
  }
  private shard(x: number, y: number, size: number, angle: number, color: string, i: number) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    const g = c.createLinearGradient(-size, -size, size, size);
    g.addColorStop(0, color + 'cc');
    g.addColorStop(0.5, color + '35');
    g.addColorStop(1, '#ffffff18');
    c.fillStyle = g;
    c.strokeStyle = color;
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(-size, -size * 0.45);
    c.lineTo(size * 0.7, -size * 0.8);
    c.lineTo(size, size * 0.25);
    c.lineTo(-size * 0.4, size * (i % 2 ? 0.85 : 0.5));
    c.closePath();
    c.fill();
    c.stroke();
    c.beginPath();
    c.moveTo(-size, -size * 0.45);
    c.lineTo(size, size * 0.25);
    c.strokeStyle = '#ffffff55';
    c.stroke();
    c.restore();
  }
  private constellation() {
    const c = this.ctx,
      w = this.width,
      h = this.height;
    this.links.forEach(([a, b]) => {
      c.beginPath();
      c.moveTo(this.dots[a].x * w, this.dots[a].y * h);
      c.lineTo(this.dots[b].x * w, this.dots[b].y * h);
      c.strokeStyle = '#bba8ffbb';
      c.lineWidth = 1.2;
      c.stroke();
    });
    this.dots.forEach((d, i) => {
      const x = d.x * w,
        y = d.y * h;
      this.glow(x, y, 25, colors[i % 4], i === this.selected ? 0.8 : 0.4);
      c.fillStyle = colors[i % 4];
      c.beginPath();
      c.arc(x, y, i === this.selected ? 5 : 3.5, 0, TAU);
      c.fill();
      c.strokeStyle = colors[i % 4] + '99';
      c.beginPath();
      c.moveTo(x - 10, y);
      c.lineTo(x + 10, y);
      c.moveTo(x, y - 10);
      c.lineTo(x, y + 10);
      c.stroke();
      if (i === this.selected) {
        c.beginPath();
        c.arc(x, y, 18, 0, TAU);
        c.stroke();
      }
    });
  }
  private fragments(auto: boolean) {
    const w = this.width,
      h = this.height,
      c = this.ctx;
    this.dots.forEach((d, i) => {
      if (this.kind === 'puzzle') {
        const t = this.target(i);
        c.save();
        c.setLineDash([3, 6]);
        c.strokeStyle = colors[i % 4] + '55';
        c.beginPath();
        c.arc(t.x * w, t.y * h, 18, 0, TAU);
        c.stroke();
        c.restore();
      }
      const wobble = auto ? Math.sin(this.time * 0.6 + i) * 4 : 0;
      this.shard(
        d.x * w,
        d.y * h + wobble,
        this.kind === 'break' ? Math.min(w * 0.07, 23) : Math.min(w * 0.07, 28),
        i * 0.85 + (auto ? Math.sin(this.time * 0.3 + i) * 0.12 : 0),
        colors[i % 4],
        i,
      );
    });
  }
  private calm() {
    const w = this.width,
      h = this.height,
      c = this.ctx;
    const progress = this.breathe
      ? (1 - Math.cos(((this.time - this.breathStart) / 10) * TAU)) / 2
      : this.phase
        ? 1
        : 0;
    const scale = this.options.moving ? 0.78 + progress * 0.22 : 0.85;
    for (let i = 0; i < 7; i++) {
      c.beginPath();
      c.ellipse(
        w * 0.5,
        h * 0.48,
        Math.min(w * 0.25, h * 0.31) * scale + i * 5,
        Math.min(w * 0.25, h * 0.31) * scale + i * 5,
        0,
        0,
        TAU,
      );
      c.strokeStyle = colors[i % 4] + (i === 0 ? 'cc' : '33');
      c.lineWidth = i === 0 ? 1.5 : 0.7;
      c.stroke();
    }
    this.glow(w * 0.5, h * 0.48, h * 0.28, '#94e4ce', 0.25);
    c.font = 'italic 22px Georgia';
    c.textAlign = 'center';
    c.fillStyle = '#f5f6ff';
    c.fillText(this.phase ? 'Breathe in.' : 'Let it go.', w * 0.5, h * 0.49);
  }
  destroy() {
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.intersection.disconnect();
    document.removeEventListener('visibilitychange', this.visibility);
    this.canvas.removeEventListener('pointerdown', this.down);
    this.canvas.removeEventListener('pointermove', this.move);
    this.canvas.removeEventListener('pointerup', this.up);
    this.canvas.removeEventListener('pointercancel', this.cancel);
    this.canvas.removeEventListener('lostpointercapture', this.cancel);
  }
}
