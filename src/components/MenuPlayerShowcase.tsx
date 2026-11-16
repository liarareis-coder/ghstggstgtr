import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { drawPlayerCircle } from './GameCanvas.tsx';
import {
  ANIMATION_CATALOG,
  type GoalAnimationId,
  type TrailAnimationId,
} from '../shared/animations.ts';
import type { CharacterConfig } from '../shared/character.ts';
import { getTurfById, type PitchTurfId } from '../shared/turfs.ts';

interface MenuPlayerShowcaseProps {
  characterConfig: CharacterConfig;
  turfId: PitchTurfId;
  trailAnimation: TrailAnimationId;
  goalAnimation: GoalAnimationId;
  enabled: boolean;
  onOpenShop: () => void;
  tapHintLabel: string;
}

interface MiniParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export const MenuPlayerShowcase: React.FC<MenuPlayerShowcaseProps> = ({
  characterConfig,
  turfId,
  trailAnimation,
  goalAnimation,
  enabled,
  onOpenShop,
  tapHintLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const turf = getTurfById(turfId);
  const trailMeta = ANIMATION_CATALOG.find(
    (a) => a.kind === 'trail' && a.value === trailAnimation
  );
  const goalMeta = ANIMATION_CATALOG.find(
    (a) => a.kind === 'goal' && a.value === goalAnimation
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const shouldAnimate = enabled && !prefersReduced;

    const particles: MiniParticle[] = [];
    const trailColor = trailMeta?.accentColor ?? '#38BDF8';
    const goalColor = goalMeta?.accentColor ?? '#10B981';

    let width = 460;
    let height = 84;
    const syncSize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(260, Math.round(rect.width || 420));
      height = Math.max(76, Math.round(rect.height || 84));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    syncSize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(syncSize) : null;
    ro?.observe(canvas);

    const CYCLE_SEC = 4.0;
    let lastBurstCycle = -1;
    let goalFlash = 0;

    const spawnGoalBurst = (gx: number, gy: number) => {
      const burstColors =
        goalAnimation === 'matrix'
          ? ['#34D399', '#10B981', '#A7F3D0']
          : goalAnimation === 'lightning'
          ? ['#38BDF8', '#E0F2FE', '#FDE047']
          : goalAnimation === 'supernova'
          ? ['#EC4899', '#A855F7', '#FDE047']
          : goalAnimation === 'fireworks'
          ? ['#F59E0B', '#F43F5E', '#38BDF8']
          : ['#10B981', '#FBBF24', '#F8FAFC'];
      for (let i = 0; i < 20; i++) {
        const ang = (Math.PI * 2 * i) / 20 + (Math.random() - 0.5) * 0.25;
        const spd = 45 + Math.random() * 95;
        particles.push({
          x: gx,
          y: gy,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0.72,
          maxLife: 0.72,
          size: 2 + Math.random() * 2.5,
          color: burstColors[i % burstColors.length],
        });
      }
    };

    const drawShowcase = (elapsedSec: number, dt: number) => {
      // Striped pitch background
      ctx.fillStyle = turf.primaryColor;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = turf.secondaryColor;
      const stripeW = width / 8;
      for (let i = 0; i < 8; i += 2) {
        ctx.fillRect(i * stripeW, 0, stripeW, height);
      }

      // Pitch lines
      ctx.strokeStyle = turf.lineColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(10, 6, width - 24, height - 12);
      ctx.beginPath();
      ctx.moveTo(width * 0.45, 6);
      ctx.lineTo(width * 0.45, height - 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(width * 0.45, height * 0.5, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Right mini goal box
      const goalX = width - 16;
      const goalTop = height * 0.5 - 22;
      const goalH = 44;
      ctx.fillStyle = goalFlash > 0 ? 'rgba(16, 185, 129, 0.28)' : 'rgba(239, 68, 68, 0.14)';
      ctx.fillRect(goalX - 6, goalTop, 12, goalH);
      ctx.strokeStyle = goalFlash > 0 ? '#34D399' : '#F87171';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(goalX - 6, goalTop);
      ctx.lineTo(goalX + 6, goalTop);
      ctx.lineTo(goalX + 6, goalTop + goalH);
      ctx.lineTo(goalX - 6, goalTop + goalH);
      ctx.stroke();

      const cy = height * 0.5;
      const cycleIdx = Math.floor(elapsedSec / CYCLE_SEC);
      const t = shouldAnimate ? (elapsedSec % CYCLE_SEC) / CYCLE_SEC : 0.38;

      let px: number;
      let py: number;
      let bx: number;
      let by: number;
      let facing = 0;

      if (t < 0.52) {
        // Player dribbling smoothly forward across the showcase
        const u = t / 0.52;
        px = 42 + u * (width * 0.56);
        py = cy + Math.sin(u * Math.PI * 3) * 11;
        facing = Math.cos(u * Math.PI * 3) * 0.25;
        bx = px + 24;
        by = py + Math.sin(u * Math.PI * 6) * 2;
      } else if (t < 0.72) {
        // Strike! Player follows through, ball rockets into net
        const u = (t - 0.52) / 0.2;
        px = 42 + width * 0.56 + u * 18;
        py = cy;
        bx = px + 24 + u * (goalX - (px + 24));
        by = cy - Math.sin(u * Math.PI) * 8;
        if (u > 0.85 && lastBurstCycle !== cycleIdx) {
          lastBurstCycle = cycleIdx;
          goalFlash = 1;
          spawnGoalBurst(goalX, cy);
        }
      } else {
        // Celebration spin & reset fade
        const u = (t - 0.72) / 0.28;
        px = 42 + width * 0.56 + 18;
        py = cy - Math.sin(u * Math.PI) * 9;
        facing = u * Math.PI * 2;
        bx = goalX;
        by = cy;
      }

      if (shouldAnimate && t < 0.65 && Math.random() < 0.75) {
        particles.push({
          x: px - 14 + (Math.random() - 0.5) * 6,
          y: py + (Math.random() - 0.5) * 12,
          vx: -35 - Math.random() * 25,
          vy: (Math.random() - 0.5) * 20,
          life: 0.42,
          maxLife: 0.42,
          size: 2.2 + Math.random() * 2,
          color: trailColor,
        });
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        if (dt > 0) {
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.life -= dt;
        }
        if (pt.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife) * 0.88;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (goalFlash > 0 && dt > 0) {
        goalFlash = Math.max(0, goalFlash - dt * 1.4);
      }

      // Draw customized player scaled neatly inside mini strip
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(0.84, 0.84);
      drawPlayerCircle(
        ctx,
        0,
        0,
        'blue',
        characterConfig.jerseyNumber,
        facing,
        t < 0.52,
        false,
        characterConfig
      );
      ctx.restore();

      // Draw mini football
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(bx, by, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Mini goal celebration label
      if (goalFlash > 0.15) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, goalFlash * 1.4);
        ctx.font = '800 18px "Barlow Condensed", sans-serif';
        ctx.fillStyle = goalColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GOL!', goalX - 36, 20);
        ctx.restore();
      }
    };

    if (!shouldAnimate) {
      drawShowcase(1.2, 0);
      return () => {
        ro?.disconnect();
      };
    }

    let rafId = 0;
    let lastNow = performance.now();
    const startNow = lastNow;

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      if (typeof document !== 'undefined' && document.hidden) {
        lastNow = now;
        return;
      }
      const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
      lastNow = now;
      drawShowcase((now - startNow) / 1000, dt);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro?.disconnect();
    };
  }, [characterConfig, turf, trailMeta, goalMeta, trailAnimation, goalAnimation, enabled]);

  return (
    <button
      type="button"
      onClick={onOpenShop}
      className="group relative w-full h-[84px] rounded-xl overflow-hidden border border-white/15 hover:border-emerald-400/60 bg-[#0B1215] shadow-lg cursor-pointer text-left"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="pointer-events-none absolute top-1.5 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#0B1215]/75 border border-white/10 text-[10px] font-bold text-slate-100">
        <span>#{characterConfig.jerseyNumber}</span>
        <span>{trailMeta?.icon ?? '💨'}</span>
        <span>{goalMeta?.icon ?? '🎉'}</span>
      </div>
      <div className="pointer-events-none absolute bottom-1.5 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#0B1215]/80 border border-white/10 text-[10px] font-bold text-emerald-300 group-hover:text-emerald-200 whitespace-nowrap">
        <Sparkles className="w-3 h-3" />
        <span>{tapHintLabel}</span>
      </div>
    </button>
  );
};
