'use client';
import { useEffect, useRef } from 'react';
import { useUniverse } from './provider';
import { random } from '@/lib/math';
export function CosmicArt({ evolved = 0 }: { evolved?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const {
    moving,
    state: { preferences: p },
  } = useUniverse();
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    let width = 1,
      height = 1,
      frame = 0,
      time = 0,
      last = 0,
      visible = true,
      dirty = true;
    const pointer = { x: 0, y: 0 };
    const seed = random(1998);
    const stars = Array.from({ length: p.quality === 'battery' ? 70 : 170 }, () => ({
      x: seed(),
      y: seed(),
      r: seed() * 1.3,
      a: seed() * 0.65 + 0.15,
    }));
    const resize = () => {
      const b = c.getBoundingClientRect();
      width = b.width;
      height = b.height;
      const dpr = Math.min(devicePixelRatio, 1.5);
      c.width = width * dpr;
      c.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(c);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      dirty = true;
    });
    intersection.observe(c);
    const point = (e: PointerEvent) => {
      const b = c.getBoundingClientRect();
      pointer.x = (e.clientX - b.left) / b.width - 0.5;
      pointer.y = (e.clientY - b.top) / b.height - 0.5;
      dirty = true;
    };
    c.addEventListener('pointermove', point);
    function render(now: number) {
      frame = requestAnimationFrame(render);
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      if (!visible || document.hidden) return;
      if (!moving || !p.ambient) {
        if (!dirty) return;
      } else time += dt;
      dirty = false;
      ctx!.clearRect(0, 0, width, height);
      for (const s of stars) {
        ctx!.fillStyle = `rgba(213,216,246,${s.a})`;
        ctx!.beginPath();
        ctx!.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      const cx = width * 0.53 + pointer.x * (moving ? 10 : 0),
        cy = height * 0.49 + pointer.y * (moving ? 10 : 0),
        radius = Math.min(width * 0.31, height * 0.34);
      const glow = ctx!.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius * 1.8);
      glow.addColorStop(0, '#bca1ff12');
      glow.addColorStop(0.5, '#6669b518');
      glow.addColorStop(1, '#05071400');
      ctx!.fillStyle = glow;
      ctx!.fillRect(0, 0, width, height);
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(-0.38);
      ctx!.scale(1, 0.74);
      const count = p.quality === 'battery' ? 40 : 95;
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const r = radius * (0.4 + t * 0.66);
        ctx!.beginPath();
        for (let j = 0; j <= 160; j++) {
          const a = (j / 160) * Math.PI * 2;
          const wave =
            Math.sin(a * 3 + t * 5 + time * 0.13) * radius * 0.09 * Math.sin(t * Math.PI);
          const x = Math.cos(a) * (r + wave),
            y = Math.sin(a) * (r + wave) + Math.sin(a * 2 + t * 6 + time * 0.09) * radius * 0.12;
          if (!j) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.closePath();
        ctx!.strokeStyle = `hsla(${235 + t * 48 + evolved * 4},${30 + t * 30}%,${62 + t * 22}%,${0.12 + Math.sin(t * Math.PI) * 0.32})`;
        ctx!.lineWidth = 0.65;
        ctx!.stroke();
      }
      ctx!.restore();
      ctx!.beginPath();
      ctx!.ellipse(cx, cy, radius * 1.35, radius * 0.27, -0.38, 0, Math.PI * 2);
      ctx!.strokeStyle = '#b9a4e230';
      ctx!.lineWidth = 0.7;
      ctx!.stroke();
      for (let i = 0; i < evolved; i++) {
        const a = (i * Math.PI) / 4 - 0.4;
        ctx!.beginPath();
        ctx!.arc(cx + Math.cos(a) * radius * 1.22, cy + Math.sin(a) * radius * 0.7, 2.5, 0, 7);
        ctx!.fillStyle = '#d5c2ff';
        ctx!.fill();
      }
    }
    resize();
    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      c.removeEventListener('pointermove', point);
    };
  }, [moving, p.ambient, p.quality, evolved]);
  return <canvas ref={canvas} className="cosmic-canvas" aria-hidden="true" />;
}
