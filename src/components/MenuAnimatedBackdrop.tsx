import React, { useEffect, useRef } from 'react';
import {
  ANIMATION_CATALOG,
  type GoalAnimationId,
  type TrailAnimationId,
} from '../shared/animations.ts';

interface MenuAnimatedBackdropProps {
  enabled: boolean;
  minimal?: boolean;
  trailAnimation: TrailAnimationId;
  goalAnimation: GoalAnimationId;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  color: string;
}

function getAccentColors(trail: TrailAnimationId, goal: GoalAnimationId): [string, string] {
  const trailItem = ANIMATION_CATALOG.find((a) => a.kind === 'trail' && a.value === trail);
  const goalItem = ANIMATION_CATALOG.find((a) => a.kind === 'goal' && a.value === goal);
  return [trailItem?.accentColor ?? '#38BDF8', goalItem?.accentColor ?? '#10B981'];
}

export const MenuAnimatedBackdrop: React.FC<MenuAnimatedBackdropProps> = ({
  enabled,
  minimal = false,
  trailAnimation,
  goalAnimation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const shouldAnimate = enabled && !prefersReduced;

    const [primaryColor, secondaryColor] = getAccentColors(trailAnimation, goalAnimation);
    const palette = [primaryColor, secondaryColor, '#34D399', '#F8FAFC'];

    const sparks: Spark[] = [];
    const sparkCount = minimal ? 16 : 28;
    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.016,
        vy: -(0.012 + Math.random() * 0.025),
        size: 1.4 + Math.random() * 2.4,
        alpha: 0.2 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        color: palette[i % palette.length],
      });
    }

    let width = 1280;
    let height = 720;
    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      width = Math.max(320, w);
      height = Math.max(240, h);
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (ro && canvas.parentElement) ro.observe(canvas.parentElement);

    const drawFrame = (tSec: number, dt: number) => {
      ctx.clearRect(0, 0, width, height);

      // Subtle animated stadium floodlight beams from upper corners
      if (!minimal) {
        const leftSweep = Math.sin(tSec * 0.55) * width * 0.07;
        const rightSweep = Math.cos(tSec * 0.48) * width * 0.07;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        const leftBeam = ctx.createLinearGradient(width * 0.1, 0, width * 0.42 + leftSweep, height * 0.85);
        leftBeam.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
        leftBeam.addColorStop(0.55, 'rgba(16, 185, 129, 0.05)');
        leftBeam.addColorStop(1, 'rgba(11, 18, 21, 0)');
        ctx.fillStyle = leftBeam;
        ctx.beginPath();
        ctx.moveTo(width * 0.06, -10);
        ctx.lineTo(width * 0.16, -10);
        ctx.lineTo(width * 0.54 + leftSweep, height * 0.92);
        ctx.lineTo(width * 0.22 + leftSweep, height * 0.92);
        ctx.closePath();
        ctx.fill();

        const rightBeam = ctx.createLinearGradient(width * 0.9, 0, width * 0.58 + rightSweep, height * 0.85);
        rightBeam.addColorStop(0, 'rgba(16, 185, 129, 0.16)');
        rightBeam.addColorStop(0.55, 'rgba(245, 158, 11, 0.05)');
        rightBeam.addColorStop(1, 'rgba(11, 18, 21, 0)');
        ctx.fillStyle = rightBeam;
        ctx.beginPath();
        ctx.moveTo(width * 0.84, -10);
        ctx.lineTo(width * 0.94, -10);
        ctx.lineTo(width * 0.78 + rightSweep, height * 0.92);
        ctx.lineTo(width * 0.46 + rightSweep, height * 0.92);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Subtle glowing pitch arc & center ring watermark
      const ringPulse = 0.08 + (shouldAnimate ? (Math.sin(tSec * 1.4) + 1) * 0.035 : 0.03);
      ctx.save();
      ctx.strokeStyle = `rgba(52, 211, 153, ${ringPulse.toFixed(3)})`;
      ctx.lineWidth = 1.5;
      const cx = width * 0.5;
      const cy = height * 0.86;
      const r = Math.min(width, height) * 0.28;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.35, r * 0.46, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - r * 2.1, cy);
      ctx.lineTo(cx + r * 2.1, cy);
      ctx.stroke();
      ctx.restore();

      // Floating stadium sparks themed to equipped animations
      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        if (dt > 0) {
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          if (s.y < -0.04) {
            s.y = 1.04;
            s.x = Math.random();
          }
          if (s.x < -0.04) s.x = 1.04;
          else if (s.x > 1.04) s.x = -0.04;
        }
        const px = s.x * width;
        const py = s.y * height;
        const twinkle = shouldAnimate ? 0.65 + 0.35 * Math.sin(tSec * 2.6 + s.phase) : 0.75;
        ctx.save();
        ctx.globalAlpha = s.alpha * twinkle;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    if (!shouldAnimate) {
      drawFrame(0, 0);
      return () => {
        ro?.disconnect();
      };
    }

    let rafId = 0;
    let lastDraw = performance.now();
    const minFrameMs = 28; // ~36fps cap keeps GPU/CPU super light on mobile & laptops

    const loop = (now: number) => {
      rafId = requestAnimationFrame(loop);
      if (typeof document !== 'undefined' && document.hidden) {
        lastDraw = now;
        return;
      }
      const elapsed = now - lastDraw;
      if (elapsed < minFrameMs) return;
      const dt = Math.min(0.1, elapsed / 1000);
      lastDraw = now;
      drawFrame(now / 1000, dt);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
    };
  }, [enabled, minimal, trailAnimation, goalAnimation]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full"
    />
  );
};
