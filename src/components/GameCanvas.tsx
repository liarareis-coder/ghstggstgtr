import React, { useEffect, useRef } from 'react';
import {
  BALL_RADIUS,
  getPitchBounds,
  GOAL_CELEBRATION_SECONDS,
  GOAL_DEPTH,
  GOAL_POST_RADIUS,
  GOALKEEPER_HOLD_SECONDS,
  MAX_OVERTIMES,
  PLAYER_RADIUS,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type ActiveEmote,
  type GameState,
  type PlayerState,
  type Team,
  type TeamSize,
} from '../shared/gameEngine.ts';
import type { AnimationConfig, GoalAnimationId } from '../shared/animations.ts';
import type { CharacterConfig } from '../shared/character.ts';
import { getSkillById } from '../shared/skills.ts';
import { getTurfById, type PitchTurfDefinition, type PitchTurfId } from '../shared/turfs.ts';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  color: string;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  w: number;
  h: number;
  life: number;
  maxLife: number;
  color: string;
}

interface ShockwaveRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface GameCanvasLabels {
  goalTitle: string;
  prepareTitle: string;
  prepareSub: string;
  overtimeTitle: string;
  overtimeSub: string;
  pausedClock: string;
  scoredFor: string;
  ownGoalScoredFor?: string;
  blueTeam: string;
  redTeam: string;
}

const DEFAULT_CANVAS_LABELS: GameCanvasLabels = {
  goalTitle: 'GOOOL!',
  prepareTitle: 'PREPARE-SE',
  prepareSub: 'Leve a bola ao gol adversário!',
  overtimeTitle: 'EMPATE! +30s',
  overtimeSub: 'Prorrogação {cur}/{max} — Quem fizer mais pontos vence',
  pausedClock: 'Relógio pausado durante a comemoração',
  scoredFor: '{scorer} marcou para o {team}',
  ownGoalScoredFor: '{otherTeam} fez ponto pro time adversário ({team})',
  blueTeam: 'Time Azul',
  redTeam: 'Time Vermelho',
};

interface GameCanvasProps {
  stateRef: React.MutableRefObject<GameState>;
  localPlayerId?: string | null;
  spectateTargetId?: string | null;
  emotesRef?: React.MutableRefObject<ActiveEmote[]>;
  labels?: GameCanvasLabels;
  turfId?: PitchTurfId;
  animationConfig?: AnimationConfig;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function buildTurfPattern(
  ctx: CanvasRenderingContext2D,
  turf: PitchTurfDefinition
): CanvasPattern | null {
  if (typeof document === 'undefined') return null;
  const tile = document.createElement('canvas');
  const size = turf.pattern === 'checker' ? 120 : turf.pattern === 'parquet' ? 128 : 96;
  tile.width = size;
  tile.height = size;
  const tctx = tile.getContext('2d');
  if (!tctx) return null;

  tctx.fillStyle = turf.primaryColor;
  tctx.fillRect(0, 0, size, size);

  if (turf.pattern === 'checker') {
    const half = size / 2;
    tctx.fillStyle = turf.secondaryColor;
    tctx.fillRect(half, 0, half, half);
    tctx.fillRect(0, half, half, half);
    tctx.fillStyle = turf.accentColor;
    tctx.fillRect(0, 0, size, 1);
  } else if (turf.pattern === 'neon') {
    tctx.fillStyle = turf.secondaryColor;
    tctx.fillRect(0, 0, size / 2, size);
    tctx.strokeStyle = turf.accentColor;
    tctx.lineWidth = 1.4;
    tctx.strokeRect(0.5, 0.5, size / 2 - 1, size - 1);
    tctx.strokeRect(size / 2 + 0.5, 0.5, size / 2 - 1, size - 1);
    tctx.beginPath();
    tctx.moveTo(0, size / 2);
    tctx.lineTo(size, size / 2);
    tctx.stroke();
  } else if (turf.pattern === 'parquet') {
    const plankW = 32;
    const plankH = 16;
    for (let y = 0; y < size; y += plankH) {
      const rowOffset = ((y / plankH) % 2) * (plankW / 2);
      for (let x = -plankW; x < size + plankW; x += plankW) {
        const isAlt = ((Math.floor((x + rowOffset) / plankW) + Math.floor(y / plankH)) & 1) === 0;
        tctx.fillStyle = isAlt ? turf.primaryColor : turf.secondaryColor;
        tctx.fillRect(x + rowOffset, y, plankW - 1, plankH - 1);
        tctx.fillStyle = turf.accentColor;
        tctx.fillRect(x + rowOffset, y + plankH * 0.45, plankW - 2, 1);
      }
    }
  } else if (turf.pattern === 'clay') {
    tctx.fillStyle = turf.secondaryColor;
    for (let i = 0; i < 38; i++) {
      const px = ((i * 53) % size);
      const py = ((i * 37) % size);
      tctx.fillRect(px, py, (i % 3) + 2, (i % 2) + 2);
    }
    tctx.fillStyle = turf.accentColor;
    for (let i = 0; i < 20; i++) {
      const px = ((i * 71 + 11) % size);
      const py = ((i * 43 + 7) % size);
      tctx.fillRect(px, py, 2, 2);
    }
  } else if (turf.pattern === 'frost') {
    tctx.fillStyle = turf.secondaryColor;
    tctx.beginPath();
    tctx.moveTo(0, 0);
    tctx.lineTo(size, size * 0.35);
    tctx.lineTo(size, size);
    tctx.lineTo(0, size * 0.65);
    tctx.closePath();
    tctx.fill();
    tctx.strokeStyle = turf.accentColor;
    tctx.lineWidth = 1.2;
    tctx.beginPath();
    tctx.moveTo(0, size * 0.3);
    tctx.lineTo(size, size * 0.65);
    tctx.moveTo(size * 0.25, 0);
    tctx.lineTo(size * 0.75, size);
    tctx.stroke();
  } else if (turf.pattern === 'royal') {
    const half = size / 2;
    tctx.fillStyle = turf.secondaryColor;
    tctx.fillRect(0, 0, half, size);
    tctx.strokeStyle = turf.accentColor;
    tctx.lineWidth = 1;
    tctx.beginPath();
    tctx.moveTo(0, 0);
    tctx.lineTo(size, size);
    tctx.moveTo(size, 0);
    tctx.lineTo(0, size);
    tctx.stroke();
  } else if (turf.pattern === 'asphalt') {
    for (let i = 0; i < 65; i++) {
      const px = (i * 37 + 13) % size;
      const py = (i * 59 + 7) % size;
      tctx.fillStyle = i % 3 === 0 ? turf.accentColor : turf.secondaryColor;
      tctx.fillRect(px, py, (i % 2) + 1.5, (i % 2) + 1.5);
    }
    tctx.strokeStyle = 'rgba(255,255,255,0.04)';
    tctx.lineWidth = 1;
    tctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  } else if (turf.pattern === 'sand') {
    tctx.strokeStyle = turf.secondaryColor;
    tctx.lineWidth = 4;
    for (let y = 10; y < size; y += 24) {
      tctx.beginPath();
      tctx.moveTo(0, y);
      tctx.quadraticCurveTo(size * 0.25, y - 5, size * 0.5, y);
      tctx.quadraticCurveTo(size * 0.75, y + 5, size, y);
      tctx.stroke();
    }
    tctx.fillStyle = turf.accentColor;
    for (let i = 0; i < 32; i++) {
      tctx.fillRect((i * 41 + 5) % size, (i * 29 + 3) % size, 2, 2);
    }
  } else if (turf.pattern === 'magma') {
    tctx.fillStyle = turf.secondaryColor;
    tctx.fillRect(0, 0, size * 0.5, size * 0.5);
    tctx.fillRect(size * 0.5, size * 0.5, size * 0.5, size * 0.5);
    tctx.strokeStyle = turf.accentColor;
    tctx.lineWidth = 1.6;
    tctx.beginPath();
    tctx.moveTo(0, size * 0.25);
    tctx.lineTo(size * 0.35, size * 0.42);
    tctx.lineTo(size * 0.72, size * 0.18);
    tctx.lineTo(size, size * 0.35);
    tctx.moveTo(size * 0.18, size);
    tctx.lineTo(size * 0.48, size * 0.65);
    tctx.lineTo(size * 0.85, size * 0.82);
    tctx.stroke();
  } else if (turf.pattern === 'sakura') {
    tctx.fillStyle = turf.secondaryColor;
    tctx.fillRect(0, 0, size / 2, size);
    tctx.fillStyle = turf.accentColor;
    for (let i = 0; i < 14; i++) {
      const px = (i * 47 + 9) % size;
      const py = (i * 31 + 17) % size;
      tctx.save();
      tctx.translate(px, py);
      tctx.rotate((i * 0.7) % Math.PI);
      tctx.beginPath();
      tctx.ellipse(0, 0, 3.5, 1.8, 0, 0, Math.PI * 2);
      tctx.fill();
      tctx.restore();
    }
  } else if (turf.pattern === 'galaxy') {
    tctx.fillStyle = turf.secondaryColor;
    tctx.beginPath();
    tctx.arc(size * 0.5, size * 0.5, size * 0.42, 0, Math.PI * 2);
    tctx.fill();
    tctx.strokeStyle = 'rgba(167, 139, 250, 0.12)';
    tctx.lineWidth = 1;
    tctx.strokeRect(0.5, 0.5, size - 1, size - 1);
    for (let i = 0; i < 26; i++) {
      tctx.fillStyle = i % 3 === 0 ? '#E879F9' : i % 2 === 0 ? '#93C5FD' : '#F8FAFC';
      const r = i % 5 === 0 ? 1.6 : 1;
      tctx.beginPath();
      tctx.arc((i * 53 + 11) % size, (i * 37 + 19) % size, r, 0, Math.PI * 2);
      tctx.fill();
    }
  }

  return ctx.createPattern(tile, 'repeat');
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  stateRef,
  localPlayerId,
  spectateTargetId,
  emotesRef,
  labels,
  turfId = 'classic',
  animationConfig,
}) => {
  const labelsRef = useRef<GameCanvasLabels>(labels ?? DEFAULT_CANVAS_LABELS);
  labelsRef.current = labels ?? DEFAULT_CANVAS_LABELS;
  const spectateTargetRef = useRef<string | null | undefined>(spectateTargetId);
  spectateTargetRef.current = spectateTargetId;
  const turfIdRef = useRef<PitchTurfId>(turfId);
  turfIdRef.current = turfId;
  const animConfigRef = useRef<AnimationConfig | undefined>(animationConfig);
  animConfigRef.current = animationConfig;
  const patternCacheRef = useRef<Partial<Record<PitchTurfId, CanvasPattern | null>>>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const confettiRef = useRef<ConfettiPiece[]>([]);
  const ringsRef = useRef<ShockwaveRing[]>([]);
  const goalFxRef = useRef<{
    kind: GoalAnimationId;
    x: number;
    y: number;
    team: Team;
    ttl: number;
    maxTtl: number;
  } | null>(null);
  const lastEventTickRef = useRef<number>(-1);
  const netShakeRef = useRef<{ left: number; right: number }>({ left: 0, right: 0 });
  const goalFlashRef = useRef<{ alpha: number; team: Team }>({ alpha: 0, team: 'blue' });
  const screenShakeRef = useRef<number>(0);
  const cssSizeRef = useRef<{ width: number; height: number }>({
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
  });
  const viewSizeRef = useRef<{ width: number; height: number }>({
    width: VIEW_WIDTH,
    height: VIEW_HEIGHT,
  });
  const initialBounds = getPitchBounds(stateRef.current.teamSize);
  const cameraRef = useRef<{ x: number; y: number; zoom: number }>({
    x: initialBounds.centerX,
    y: initialBounds.centerY,
    zoom: stateRef.current.teamSize === 16 ? 0.86 : 1,
  });
  const lastTeamSizeRef = useRef<TeamSize>(stateRef.current.teamSize);
  const smoothOnlineRef = useRef<{
    players: Map<
      string,
      { x: number; y: number; facingAngle: number; aimX: number; aimY: number }
    >;
    ball: { x: number; y: number } | null;
  }>({
    players: new Map(),
    ball: null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCssSize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 10 && rect.height > 10) {
        cssSizeRef.current = { width: rect.width, height: rect.height };
      }
    };
    updateCssSize();
    const resizeObs =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updateCssSize())
        : null;
    resizeObs?.observe(canvas);
    window.addEventListener('resize', updateCssSize);

    let animId = 0;
    let lastTime = performance.now();

    const spawnParticles = (
      x: number,
      y: number,
      count: number,
      color: string,
      speed = 180,
      durScale = 1
    ) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const mag = speed * (0.35 + Math.random() * 0.75);
        const maxLife = (0.42 + Math.random() * 0.34) * durScale;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * mag,
          vy: Math.sin(angle) * mag,
          life: maxLife,
          maxLife,
          radius: 2.5 + Math.random() * 2.8,
          color,
        });
      }
    };

    const spawnGoalConfetti = (team: Team, durScale = 1, customPalette?: string[]) => {
      const palette =
        customPalette ??
        (team === 'blue'
          ? ['#60A5FA', '#3B82F6', '#93C5FD', '#FBBF24', '#F8FAFC']
          : ['#F87171', '#EF4444', '#FCA5A5', '#FBBF24', '#F8FAFC']);
      const curViewW = viewSizeRef.current.width;
      const curViewH = viewSizeRef.current.height;
      const spreadX = Math.min(240, curViewW * 0.35);
      for (let i = 0; i < 95; i++) {
        const fromLeft = i % 2 === 0;
        const startX = fromLeft ? Math.random() * spreadX : curViewW - Math.random() * spreadX;
        const angle = fromLeft
          ? -Math.PI * 0.38 + (Math.random() - 0.5) * 0.65
          : -Math.PI * 0.62 + (Math.random() - 0.5) * 0.65;
        const speed = 260 + Math.random() * 440;
        const life = (1.5 + Math.random() * 0.8) * durScale;
        confettiRef.current.push({
          x: startX,
          y: curViewH * (0.3 + Math.random() * 0.5),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 80,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 14,
          w: 6 + Math.random() * 6,
          h: 3.5 + Math.random() * 4.5,
          life,
          maxLife: Math.max(life, 0.2),
          color: palette[i % palette.length],
        });
      }
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const cssW = Math.max(1, cssSizeRef.current.width || VIEW_WIDTH);
      const cssH = Math.max(1, cssSizeRef.current.height || VIEW_HEIGHT);
      const aspect = cssW / cssH;

      const state = stateRef.current;
      const bounds = getPitchBounds(state.teamSize);

      if (lastTeamSizeRef.current !== state.teamSize) {
        lastTeamSizeRef.current = state.teamSize;
        cameraRef.current.x = bounds.centerX;
        cameraRef.current.y = bounds.centerY;
        cameraRef.current.zoom = state.teamSize === 16 ? 0.86 : 1;
      }

      let viewW: number;
      let viewH: number;
      if (aspect < 1) {
        viewH = 920;
        viewW = Math.max(320, Math.round(viewH * aspect));
      } else {
        viewH = VIEW_HEIGHT;
        viewW = clamp(Math.round(viewH * aspect), VIEW_HEIGHT, bounds.worldWidth - 40);
        viewH = Math.max(320, Math.round(viewW / aspect));
      }
      viewSizeRef.current = { width: viewW, height: viewH };

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.max(1, Math.round(cssW * dpr));
      const targetH = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      // Smooth predictive interpolation for online multiplayer (eliminates mobile network jitter)
      let renderPlayers = state.players;
      let renderBall = state.ball;
      if (state.mode === 'online') {
        const smoothCache = smoothOnlineRef.current;
        const posBlend = 1 - Math.exp(-28 * dt);
        const angleBlend = 1 - Math.exp(-26 * dt);
        const ballBlend = 1 - Math.exp(-32 * dt);
        const activeIds = new Set<string>();
        const authById = new Map<string, PlayerState>();
        const smoothedById = new Map<string, PlayerState>();

        renderPlayers = state.players.map((p) => {
          activeIds.add(p.id);
          authById.set(p.id, p);
          let entry = smoothCache.players.get(p.id);
          if (!entry) {
            entry = {
              x: p.x,
              y: p.y,
              facingAngle: p.facingAngle,
              aimX: p.aimX,
              aimY: p.aimY,
            };
            smoothCache.players.set(p.id, entry);
          } else {
            const predX = entry.x + p.vx * dt * 0.86;
            const predY = entry.y + p.vy * dt * 0.86;
            const dist = Math.hypot(p.x - predX, p.y - predY);
            if (dist > 160) {
              entry.x = p.x;
              entry.y = p.y;
              entry.facingAngle = p.facingAngle;
              entry.aimX = p.aimX;
              entry.aimY = p.aimY;
            } else {
              entry.x = predX + (p.x - predX) * posBlend;
              entry.y = predY + (p.y - predY) * posBlend;
              let diff = p.facingAngle - entry.facingAngle;
              while (diff > Math.PI) diff -= Math.PI * 2;
              while (diff < -Math.PI) diff += Math.PI * 2;
              entry.facingAngle += diff * angleBlend;
              entry.aimX += (p.aimX - entry.aimX) * angleBlend;
              entry.aimY += (p.aimY - entry.aimY) * angleBlend;
            }
          }
          const smoothedPlayer: PlayerState = {
            ...p,
            x: entry.x,
            y: entry.y,
            facingAngle: entry.facingAngle,
            aimX: entry.aimX,
            aimY: entry.aimY,
          };
          smoothedById.set(p.id, smoothedPlayer);
          return smoothedPlayer;
        });

        for (const existingId of smoothCache.players.keys()) {
          if (!activeIds.has(existingId)) {
            smoothCache.players.delete(existingId);
          }
        }

        const carrierId = state.ball.possessorId;
        if (carrierId && smoothedById.has(carrierId) && authById.has(carrierId)) {
          const sp = smoothedById.get(carrierId)!;
          const ap = authById.get(carrierId)!;
          const bx = sp.x + (state.ball.x - ap.x);
          const by = sp.y + (state.ball.y - ap.y);
          smoothCache.ball = { x: bx, y: by };
          renderBall = { ...state.ball, x: bx, y: by };
        } else {
          let sb = smoothCache.ball;
          if (!sb) {
            sb = { x: state.ball.x, y: state.ball.y };
            smoothCache.ball = sb;
          } else {
            const predBx = sb.x + state.ball.vx * dt * 0.9;
            const predBy = sb.y + state.ball.vy * dt * 0.9;
            const bDist = Math.hypot(state.ball.x - predBx, state.ball.y - predBy);
            if (bDist > 210) {
              sb.x = state.ball.x;
              sb.y = state.ball.y;
            } else {
              sb.x = predBx + (state.ball.x - predBx) * ballBlend;
              sb.y = predBy + (state.ball.y - predBy) * ballBlend;
            }
          }
          renderBall = { ...state.ball, x: sb.x, y: sb.y };
        }
      } else {
        smoothOnlineRef.current.players.clear();
        smoothOnlineRef.current.ball = null;
      }

      // Resolve dynamic active player IDs (always tracks who the human currently controls)
      const activeBlueId = state.controlMap?.['blue-1'] ?? 'blue-1';
      const activeRedId = state.controlMap?.['red-1'] ?? 'red-1';
      const activeLocalId =
        localPlayerId && state.controlMap?.[localPlayerId]
          ? state.controlMap[localPlayerId]
          : localPlayerId ?? activeBlueId;

      const activeAnimCfg = animConfigRef.current;
      const fieldDurScale = clamp((activeAnimCfg?.fieldAnimDurationMs ?? 1800) / 1800, 0.35, 2.2);
      const selectedGoalAnim: GoalAnimationId = activeAnimCfg?.goalAnimation ?? 'classic';
      const selectedTrailAnim = activeAnimCfg?.trailAnimation ?? 'standard';

      // Trigger particle/goal effects for newly observed events
      if (state.tick !== lastEventTickRef.current) {
        lastEventTickRef.current = state.tick;
        for (const ev of state.events) {
          if (ev.type === 'kick' && ev.x !== undefined && ev.y !== undefined) {
            const kickColor =
              selectedTrailAnim === 'flame-dash'
                ? '#FB923C'
                : selectedTrailAnim === 'frost-nova'
                ? '#67E8F9'
                : selectedTrailAnim === 'shadow-echo'
                ? '#A78BFA'
                : selectedTrailAnim === 'gold-aura'
                ? '#FBBF24'
                : '#F8FAFC';
            spawnParticles(ev.x, ev.y, 12, kickColor, 165, fieldDurScale);
            ringsRef.current.push({
              x: ev.x,
              y: ev.y,
              radius: 10,
              maxRadius: 52,
              life: 0.24 * fieldDurScale,
              maxLife: 0.24 * fieldDurScale,
              color: kickColor,
            });
          } else if (ev.type === 'pass' && ev.x !== undefined && ev.y !== undefined) {
            spawnParticles(ev.x, ev.y, 9, '#34D399', 130, fieldDurScale);
            ringsRef.current.push({
              x: ev.x,
              y: ev.y,
              radius: 8,
              maxRadius: 36,
              life: 0.2 * fieldDurScale,
              maxLife: 0.2 * fieldDurScale,
              color: '#34D399',
            });
          } else if (ev.type === 'dribble' && ev.x !== undefined && ev.y !== undefined) {
            const drColor =
              selectedTrailAnim === 'flame-dash'
                ? '#F97316'
                : selectedTrailAnim === 'frost-nova'
                ? '#22D3EE'
                : selectedTrailAnim === 'shadow-echo'
                ? '#8B5CF6'
                : selectedTrailAnim === 'gold-aura'
                ? '#FDE047'
                : '#F59E0B';
            spawnParticles(ev.x, ev.y, 10, drColor, 130, fieldDurScale);
          } else if (ev.type === 'steal' && ev.x !== undefined && ev.y !== undefined) {
            spawnParticles(ev.x, ev.y, 12, '#38BDF8', 160, fieldDurScale);
          } else if (ev.type === 'post' && ev.x !== undefined && ev.y !== undefined) {
            spawnParticles(ev.x, ev.y, 10, '#FBBF24', 190, fieldDurScale);
          } else if (ev.type === 'skill' && ev.x !== undefined && ev.y !== undefined) {
            const sk = ev.skillId ? getSkillById(ev.skillId) : undefined;
            const col = sk?.color ?? '#38BDF8';
            spawnParticles(ev.x, ev.y, 22, col, 240, fieldDurScale);
            ringsRef.current.push({
              x: ev.x,
              y: ev.y,
              radius: 14,
              maxRadius: 110,
              life: 0.42 * fieldDurScale,
              maxLife: 0.42 * fieldDurScale,
              color: col,
            });
          } else if (ev.type === 'goal') {
            const scoringTeam: Team = ev.team ?? 'blue';
            const gx = scoringTeam === 'blue' ? bounds.pitchRight + 20 : bounds.pitchLeft - 20;
            const gy = ev.y ?? bounds.centerY;
            if (scoringTeam === 'blue') netShakeRef.current.right = 1.3;
            else netShakeRef.current.left = 1.3;

            goalFlashRef.current = { alpha: 0.55, team: scoringTeam };
            screenShakeRef.current = selectedGoalAnim === 'supernova' || selectedGoalAnim === 'lightning' ? 16 : 12;
            const fxDur = 1.65 * fieldDurScale;
            goalFxRef.current = {
              kind: selectedGoalAnim,
              x: gx,
              y: gy,
              team: scoringTeam,
              ttl: fxDur,
              maxTtl: fxDur,
            };

            ringsRef.current.push(
              {
                x: gx,
                y: gy,
                radius: 18,
                maxRadius: selectedGoalAnim === 'supernova' ? 460 : 340,
                life: 0.75 * fieldDurScale,
                maxLife: 0.75 * fieldDurScale,
                color:
                  selectedGoalAnim === 'matrix'
                    ? '#10B981'
                    : selectedGoalAnim === 'lightning'
                    ? '#38BDF8'
                    : selectedGoalAnim === 'supernova'
                    ? '#EC4899'
                    : scoringTeam === 'blue'
                    ? '#60A5FA'
                    : '#F87171',
              },
              {
                x: gx,
                y: gy,
                radius: 10,
                maxRadius: 230,
                life: 0.55 * fieldDurScale,
                maxLife: 0.55 * fieldDurScale,
                color: selectedGoalAnim === 'matrix' ? '#34D399' : '#FBBF24',
              }
            );

            if (selectedGoalAnim === 'fireworks') {
              spawnParticles(gx, gy - 70, 32, '#F59E0B', 340, fieldDurScale);
              spawnParticles(gx, gy + 70, 32, '#EC4899', 340, fieldDurScale);
              spawnParticles(gx, gy, 34, '#38BDF8', 290, fieldDurScale);
              spawnGoalConfetti(scoringTeam, fieldDurScale, ['#FBBF24', '#F97316', '#EC4899', '#38BDF8', '#F8FAFC']);
            } else if (selectedGoalAnim === 'lightning') {
              spawnParticles(gx, gy, 55, '#38BDF8', 380, fieldDurScale);
              spawnParticles(gx, gy, 30, '#FDE047', 280, fieldDurScale);
              spawnGoalConfetti(scoringTeam, fieldDurScale, ['#38BDF8', '#7DD3FC', '#FDE047', '#F8FAFC']);
            } else if (selectedGoalAnim === 'supernova') {
              spawnParticles(gx, gy, 72, '#EC4899', 420, fieldDurScale);
              spawnParticles(gx, gy, 36, '#FBBF24', 280, fieldDurScale);
              spawnGoalConfetti(scoringTeam, fieldDurScale, ['#EC4899', '#A855F7', '#FBBF24', '#F8FAFC']);
            } else if (selectedGoalAnim === 'matrix') {
              spawnParticles(gx, gy, 60, '#10B981', 310, fieldDurScale);
              spawnParticles(gx, gy, 24, '#A7F3D0', 220, fieldDurScale);
              spawnGoalConfetti(scoringTeam, fieldDurScale, ['#10B981', '#34D399', '#6EE7B7', '#059669']);
            } else {
              spawnParticles(
                gx,
                gy,
                52,
                scoringTeam === 'blue' ? '#60A5FA' : '#F87171',
                320,
                fieldDurScale
              );
              spawnParticles(gx, gy, 24, '#FBBF24', 240, fieldDurScale);
              spawnGoalConfetti(scoringTeam, fieldDurScale);
            }
          }
        }
      }

      if (goalFxRef.current) {
        goalFxRef.current.ttl -= dt;
        if (goalFxRef.current.ttl <= 0) {
          goalFxRef.current = null;
        }
      }

      netShakeRef.current.left = Math.max(0, netShakeRef.current.left - dt * 1.9);
      netShakeRef.current.right = Math.max(0, netShakeRef.current.right - dt * 1.9);
      goalFlashRef.current.alpha = Math.max(0, goalFlashRef.current.alpha - dt * (0.9 / Math.max(0.5, fieldDurScale)));
      screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 28);

      const nextParticles: Particle[] = [];
      for (const p of particlesRef.current) {
        p.life -= dt;
        if (p.life > 0) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vx *= 0.92;
          p.vy *= 0.92;
          nextParticles.push(p);
        }
      }
      particlesRef.current = nextParticles;

      const nextRings: ShockwaveRing[] = [];
      for (const r of ringsRef.current) {
        r.life -= dt;
        if (r.life > 0) {
          const progress = 1 - r.life / r.maxLife;
          r.radius = 16 + (r.maxRadius - 16) * (1 - Math.pow(1 - progress, 2));
          nextRings.push(r);
        }
      }
      ringsRef.current = nextRings;

      const nextConfetti: ConfettiPiece[] = [];
      for (const c of confettiRef.current) {
        c.life -= dt;
        if (c.life > 0) {
          c.vy += 420 * dt;
          c.vx *= 0.985;
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.rot += c.vRot * dt;
          nextConfetti.push(c);
        }
      }
      confettiRef.current = nextConfetti;

      // ---- CAMERA FOLLOW LOGIC (9:16 & Desktop Safe) ----
      const minSafeZoom = Math.max(viewW / bounds.worldWidth, viewH / bounds.worldHeight);
      const baseDefaultZoom = state.teamSize === 16 ? 0.86 : 1;
      let desiredX = bounds.centerX;
      let desiredY = bounds.centerY;
      let desiredZoom = Math.max(baseDefaultZoom, minSafeZoom);

      if (state.phase === 'GOAL') {
        desiredX = renderBall.x;
        desiredY = renderBall.y;
        desiredZoom = Math.max(state.teamSize === 16 ? 0.96 : 1.08, minSafeZoom);
      } else if (localPlayerId === 'spectator') {
        const specTarget = spectateTargetRef.current;
        if (specTarget && specTarget !== 'ball') {
          const tracked =
            renderPlayers.find((p) => p.id === specTarget) ?? renderPlayers[0];
          if (tracked) {
            desiredX = tracked.x * 0.78 + renderBall.x * 0.22;
            desiredY = tracked.y * 0.78 + renderBall.y * 0.22;
          } else {
            desiredX = renderBall.x;
            desiredY = renderBall.y;
          }
        } else {
          desiredX = renderBall.x;
          desiredY = renderBall.y;
        }
        const compactZoom =
          viewH < 520 ? clamp(viewH / 560, minSafeZoom, baseDefaultZoom) : baseDefaultZoom;
        desiredZoom = Math.max(compactZoom, minSafeZoom);
      } else if (state.mode === '2p') {
        const p1 = renderPlayers.find((p) => p.id === activeBlueId) ?? renderPlayers[0];
        const p2 = renderPlayers.find((p) => p.id === activeRedId) ?? renderPlayers[1];
        if (p1 && p2) {
          const midX = (p1.x + p2.x) * 0.5;
          const midY = (p1.y + p2.y) * 0.5;
          desiredX = midX * 0.8 + renderBall.x * 0.2;
          desiredY = midY * 0.8 + renderBall.y * 0.2;

          const spanX = Math.abs(p1.x - p2.x) + 320;
          const spanY = Math.abs(p1.y - p2.y) + 260;
          const fitZoomX = viewW / spanX;
          const fitZoomY = viewH / spanY;
          const baseMinZoom = Math.max(state.teamSize === 16 ? 0.28 : 0.39, minSafeZoom);
          desiredZoom = clamp(Math.min(baseDefaultZoom, fitZoomX, fitZoomY), baseMinZoom, Math.max(baseDefaultZoom, baseMinZoom));
        }
      } else {
        const tracked =
          renderPlayers.find((p) => p.id === activeLocalId) ?? renderPlayers[0];
        if (tracked) {
          const offsetX = clamp((renderBall.x - tracked.x) * 0.24, -180, 180);
          const offsetY = clamp((renderBall.y - tracked.y) * 0.24, -100, 100);
          desiredX = tracked.x + offsetX;
          desiredY = tracked.y + offsetY;
          const compactLandscapeZoom =
            viewH < 520 ? clamp(viewH / 540, minSafeZoom, baseDefaultZoom) : baseDefaultZoom;
          desiredZoom = Math.max(compactLandscapeZoom, minSafeZoom);
        }
      }

      const cam = cameraRef.current;
      const smooth = 1 - Math.exp(-8.5 * dt);
      cam.x += (desiredX - cam.x) * smooth;
      cam.y += (desiredY - cam.y) * smooth;
      cam.zoom = clamp(cam.zoom + (desiredZoom - cam.zoom) * smooth, minSafeZoom, 1.4);

      const halfViewW = viewW / (2 * cam.zoom);
      const halfViewH = viewH / (2 * cam.zoom);
      cam.x =
        halfViewW >= bounds.worldWidth / 2
          ? bounds.centerX
          : clamp(cam.x, halfViewW, bounds.worldWidth - halfViewW);
      cam.y =
        halfViewH >= bounds.worldHeight / 2
          ? bounds.centerY
          : clamp(cam.y, halfViewH, bounds.worldHeight - halfViewH);

      const shakeX =
        screenShakeRef.current > 0.2
          ? (Math.random() - 0.5) * screenShakeRef.current
          : 0;
      const shakeY =
        screenShakeRef.current > 0.2
          ? (Math.random() - 0.5) * screenShakeRef.current
          : 0;

      const activeTurf = getTurfById(turfIdRef.current);

      ctx.save();
      ctx.scale(targetW / viewW, targetH / viewH);

      ctx.fillStyle = activeTurf.backdropColor;
      ctx.fillRect(0, 0, viewW, viewH);

      // Apply camera transform + goal impact shake
      ctx.save();
      ctx.translate(viewW / 2 + shakeX, viewH / 2 + shakeY);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cam.x, -cam.y);

      const pitchW = bounds.pitchWidth;
      const pitchH = bounds.pitchHeight;
      const scale = bounds.scale;

      // 1. Stadium apron & textured turf
      ctx.fillStyle = activeTurf.backdropColor;
      ctx.fillRect(0, 0, bounds.worldWidth, bounds.worldHeight);

      ctx.fillStyle = activeTurf.apronColor;
      ctx.fillRect(bounds.pitchLeft - 24, bounds.pitchTop - 24, pitchW + 48, pitchH + 48);

      if (activeTurf.pattern === 'stripes' || activeTurf.pattern === 'royal') {
        const stripeCount = state.teamSize === 16 ? 32 : 22;
        const stripeW = pitchW / stripeCount;
        for (let i = 0; i < stripeCount; i++) {
          ctx.fillStyle =
            i % 2 === 0 ? activeTurf.primaryColor : activeTurf.secondaryColor;
          ctx.fillRect(bounds.pitchLeft + i * stripeW, bounds.pitchTop, stripeW + 0.6, pitchH);
        }
        if (activeTurf.pattern === 'royal') {
          let pat = patternCacheRef.current[activeTurf.id];
          if (pat === undefined) {
            pat = buildTurfPattern(ctx, activeTurf);
            patternCacheRef.current[activeTurf.id] = pat;
          }
          if (pat) {
            ctx.save();
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = pat;
            ctx.fillRect(bounds.pitchLeft, bounds.pitchTop, pitchW, pitchH);
            ctx.restore();
          }
        }
      } else {
        let pat = patternCacheRef.current[activeTurf.id];
        if (pat === undefined) {
          pat = buildTurfPattern(ctx, activeTurf);
          patternCacheRef.current[activeTurf.id] = pat;
        }
        ctx.fillStyle = pat ?? activeTurf.primaryColor;
        ctx.fillRect(bounds.pitchLeft, bounds.pitchTop, pitchW, pitchH);
      }

      const vignette = ctx.createRadialGradient(
        bounds.centerX,
        bounds.centerY,
        pitchW * 0.18,
        bounds.centerX,
        bounds.centerY,
        pitchW * 0.72
      );
      vignette.addColorStop(0, 'rgba(255,255,255,0.05)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.24)');
      ctx.fillStyle = vignette;
      ctx.fillRect(bounds.pitchLeft, bounds.pitchTop, pitchW, pitchH);

      // 2. Pitch Markings
      ctx.strokeStyle = activeTurf.lineColor;
      ctx.lineWidth = scale === 2 ? 3.5 : 3;
      ctx.strokeRect(bounds.pitchLeft, bounds.pitchTop, pitchW, pitchH);

      ctx.beginPath();
      ctx.moveTo(bounds.centerX, bounds.pitchTop);
      ctx.lineTo(bounds.centerX, bounds.pitchBottom);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(bounds.centerX, bounds.centerY, 118 * scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = activeTurf.centerDotColor;
      ctx.beginPath();
      ctx.arc(bounds.centerX, bounds.centerY, 6 * (scale >= 2 ? 1.35 : 1.15), 0, Math.PI * 2);
      ctx.fill();

      const boxW = 220 * scale;
      const boxH = 440 * scale;
      const boxTop = bounds.centerY - boxH / 2;
      ctx.strokeRect(bounds.pitchLeft, boxTop, boxW, boxH);
      ctx.strokeRect(bounds.pitchRight - boxW, boxTop, boxW, boxH);

      const smallBoxW = 84 * scale;
      const smallBoxH = state.teamSize === 16 ? 400 : 330;
      const smallBoxTop = bounds.centerY - smallBoxH / 2;
      ctx.strokeRect(bounds.pitchLeft, smallBoxTop, smallBoxW, smallBoxH);
      ctx.strokeRect(bounds.pitchRight - smallBoxW, smallBoxTop, smallBoxW, smallBoxH);

      const penSpotDist = 165 * scale;
      ctx.beginPath();
      ctx.arc(bounds.pitchLeft + penSpotDist, bounds.centerY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bounds.pitchRight - penSpotDist, bounds.centerY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bounds.pitchLeft + penSpotDist, bounds.centerY, 85 * scale, -0.82, 0.82);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bounds.pitchRight - penSpotDist, bounds.centerY, 85 * scale, Math.PI - 0.82, Math.PI + 0.82);
      ctx.stroke();

      const cornerR = 24 * scale;
      ctx.beginPath();
      ctx.arc(bounds.pitchLeft, bounds.pitchTop, cornerR, 0, Math.PI / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bounds.pitchRight, bounds.pitchTop, cornerR, Math.PI / 2, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bounds.pitchRight, bounds.pitchBottom, cornerR, Math.PI, Math.PI * 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(bounds.pitchLeft, bounds.pitchBottom, cornerR, Math.PI * 1.5, Math.PI * 2);
      ctx.stroke();

      // Animated corner flags
      const corners = [
        { x: bounds.pitchLeft, y: bounds.pitchTop, dir: 1 },
        { x: bounds.pitchRight, y: bounds.pitchTop, dir: -1 },
        { x: bounds.pitchRight, y: bounds.pitchBottom, dir: -1 },
        { x: bounds.pitchLeft, y: bounds.pitchBottom, dir: 1 },
      ];
      corners.forEach((c, idx) => {
        const wave = Math.sin(now * 0.007 + idx * 1.7) * 3.5;
        ctx.save();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x, c.y - 16);
        ctx.stroke();

        ctx.fillStyle = c.dir > 0 ? '#3B82F6' : '#EF4444';
        ctx.beginPath();
        ctx.moveTo(c.x, c.y - 16);
        ctx.lineTo(c.x + c.dir * 12, c.y - 12 + wave * 0.6);
        ctx.lineTo(c.x, c.y - 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // Training Mode dedicated pitch markers: corner goal targets & shooting arc cones
      if (state.mode === 'training') {
        ctx.save();
        const targetZones = [
          { x: bounds.pitchRight - 10, y: bounds.goalTop + 26 },
          { x: bounds.pitchRight - 10, y: bounds.goalBottom - 26 },
        ];
        for (const tz of targetZones) {
          const pulseR = 16 + Math.sin(now * 0.005) * 2;
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.72)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(tz.x, tz.y, pulseR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
          ctx.beginPath();
          ctx.arc(tz.x, tz.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }

        const coneX = bounds.pitchRight - boxW - 34;
        for (const coneY of [bounds.centerY - 190, bounds.centerY, bounds.centerY + 190]) {
          ctx.fillStyle = 'rgba(249, 115, 22, 0.85)';
          ctx.beginPath();
          ctx.moveTo(coneX, coneY - 9);
          ctx.lineTo(coneX - 7, coneY + 6);
          ctx.lineTo(coneX + 7, coneY + 6);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#FED7AA';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. Goals & Net Mesh
      drawGoal(
        ctx,
        'left',
        bounds.pitchLeft - GOAL_DEPTH,
        bounds.goalTop,
        GOAL_DEPTH,
        bounds.goalBottom - bounds.goalTop,
        netShakeRef.current.left
      );
      drawGoal(
        ctx,
        'right',
        bounds.pitchRight,
        bounds.goalTop,
        GOAL_DEPTH,
        bounds.goalBottom - bounds.goalTop,
        netShakeRef.current.right
      );

      // 4. Shockwave Rings & Particles
      for (const r of ringsRef.current) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, r.life / r.maxLife) * 0.85;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      for (const p of particlesRef.current) {
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 4.2 Custom Goal Celebration FX (Lightning, Supernova, Fireworks, Matrix)
      if (goalFxRef.current) {
        const gfx = goalFxRef.current;
        const ratio = clamp(gfx.ttl / Math.max(0.1, gfx.maxTtl), 0, 1);
        ctx.save();
        if (gfx.kind === 'lightning') {
          ctx.strokeStyle = '#7DD3FC';
          ctx.lineWidth = 3.5;
          ctx.globalAlpha = ratio;
          for (let b = 0; b < 5; b++) {
            const ang = (b * Math.PI * 2) / 5 + Math.sin(now * 0.02 + b) * 0.4;
            ctx.beginPath();
            ctx.moveTo(gfx.x, gfx.y);
            let cx = gfx.x;
            let cy = gfx.y;
            for (let s = 1; s <= 4; s++) {
              const stepR = s * 46;
              const jitter = Math.sin(now * 0.04 + b * 7 + s * 3) * 24;
              cx = gfx.x + Math.cos(ang) * stepR - Math.sin(ang) * jitter;
              cy = gfx.y + Math.sin(ang) * stepR + Math.cos(ang) * jitter;
              ctx.lineTo(cx, cy);
            }
            ctx.stroke();
          }
        } else if (gfx.kind === 'supernova') {
          const rad = 40 + (1 - ratio) * 240;
          const g = ctx.createRadialGradient(gfx.x, gfx.y, 4, gfx.x, gfx.y, rad);
          g.addColorStop(0, `rgba(253, 224, 71, ${0.65 * ratio})`);
          g.addColorStop(0.5, `rgba(236, 72, 153, ${0.42 * ratio})`);
          g.addColorStop(1, 'rgba(236, 72, 153, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(gfx.x, gfx.y, rad, 0, Math.PI * 2);
          ctx.fill();
        } else if (gfx.kind === 'matrix') {
          ctx.fillStyle = '#34D399';
          ctx.globalAlpha = ratio * 0.78;
          for (let m = 0; m < 18; m++) {
            const mx = gfx.x + ((m * 37) % 240) - 120;
            const my = gfx.y - 130 + (((now * 0.25 + m * 43) % 260));
            ctx.fillRect(mx, my, 4, 14);
          }
        } else if (gfx.kind === 'fireworks') {
          ctx.globalAlpha = ratio * 0.9;
          for (let r = 0; r < 12; r++) {
            const ang = (r * Math.PI * 2) / 12 + now * 0.002;
            const dist = (1 - ratio) * 185;
            ctx.strokeStyle = r % 2 === 0 ? '#FBBF24' : '#EC4899';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(gfx.x + Math.cos(ang) * (dist * 0.55), gfx.y + Math.sin(ang) * (dist * 0.55));
            ctx.lineTo(gfx.x + Math.cos(ang) * dist, gfx.y + Math.sin(ang) * dist);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // Active emotes lookup (one newest per player)
      const nowMs = Date.now();
      const playerEmoteMap = new Map<string, ActiveEmote>();
      if (emotesRef) {
        for (const em of emotesRef.current) {
          if (nowMs - em.createdAt < 2600) {
            playerEmoteMap.set(em.playerId, em);
          }
        }
      }

      // 4.5 Skill Field Objects (Iron Wall barriers & Clone Feint decoys)
      if (state.skillObjects && state.skillObjects.length > 0) {
        for (const obj of state.skillObjects) {
          const alphaRatio = clamp(obj.ttl / Math.max(0.1, obj.maxTtl), 0.15, 1);
          if (obj.kind === 'wall') {
            const tx = -obj.ny;
            const ty = obj.nx;
            const x1 = obj.x - tx * obj.halfLen;
            const y1 = obj.y - ty * obj.halfLen;
            const x2 = obj.x + tx * obj.halfLen;
            const y2 = obj.y + ty * obj.halfLen;
            ctx.save();
            ctx.globalAlpha = 0.85 * alphaRatio;
            ctx.strokeStyle = obj.team === 'blue' ? '#38BDF8' : '#F43F5E';
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.strokeStyle = '#E2E8F0';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.restore();
          } else if (obj.kind === 'clone') {
            ctx.save();
            ctx.globalAlpha = 0.55 * alphaRatio;
            drawPlayerCircle(
              ctx,
              obj.x,
              obj.y,
              obj.team,
              obj.number,
              Math.atan2(obj.vy, obj.vx),
              false,
              false,
              obj.appearance
            );
            ctx.restore();
          }
        }
      }

      // 5. Players
      for (const player of renderPlayers) {
        const isCarrier = renderBall.possessorId === player.id;
        const isDribbling = player.dribbleTimer > 0;
        const isLocalHighlight =
          localPlayerId === 'spectator'
            ? false
            : state.mode === '2p'
            ? player.id === activeBlueId || player.id === activeRedId
            : player.id === activeLocalId;
        const activeSkillDef = player.activeSkill ? getSkillById(player.activeSkill) : undefined;

        // Predator Vision tactical lanes & goal lines
        if (player.activeSkill === 'predator-vision') {
          const enemyGoalX = player.team === 'blue' ? bounds.pitchRight : bounds.pitchLeft;
          ctx.save();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.32)';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          for (const targetY of [bounds.goalTop + 26, bounds.goalBottom - 26]) {
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(enemyGoalX, targetY);
            ctx.stroke();
          }
          for (const enemy of renderPlayers) {
            if (enemy.team === player.team) continue;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, PLAYER_RADIUS + 14, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }

        if (isCarrier) {
          // Training Mode shot trajectory guide
          if (state.mode === 'training' && player.team === 'blue') {
            const guideLen = 190 + (player.isChargingShoot ? player.shootCharge * 190 : 0);
            ctx.save();
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.36)';
            ctx.lineWidth = 2;
            ctx.setLineDash([7, 7]);
            ctx.beginPath();
            ctx.moveTo(player.x, player.y);
            ctx.lineTo(player.x + player.aimX * guideLen, player.y + player.aimY * guideLen);
            ctx.stroke();
            ctx.restore();
          }

          const aimDist = PLAYER_RADIUS + BALL_RADIUS + 36 + (player.isChargingShoot ? player.shootCharge * 28 : 0);
          const ax = player.x + player.aimX * aimDist;
          const ay = player.y + player.aimY * aimDist;

          ctx.save();
          ctx.strokeStyle = player.isChargingShoot
            ? player.shootCharge > 0.78
              ? 'rgba(239, 68, 68, 0.95)'
              : player.shootCharge > 0.45
              ? 'rgba(245, 158, 11, 0.95)'
              : 'rgba(52, 211, 153, 0.95)'
            : player.team === 'blue'
            ? 'rgba(96, 165, 250, 0.92)'
            : 'rgba(248, 113, 113, 0.92)';
          ctx.lineWidth = player.isChargingShoot ? 3.8 : 3;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(
            player.x + player.aimX * (PLAYER_RADIUS + 6),
            player.y + player.aimY * (PLAYER_RADIUS + 6)
          );
          ctx.lineTo(ax, ay);
          ctx.stroke();
          ctx.setLineDash([]);

          const angle = Math.atan2(player.aimY, player.aimX);
          ctx.fillStyle = player.isChargingShoot
            ? player.shootCharge > 0.78
              ? '#EF4444'
              : player.shootCharge > 0.45
              ? '#F59E0B'
              : '#34D399'
            : player.team === 'blue'
            ? '#60A5FA'
            : '#F87171';
          ctx.beginPath();
          ctx.moveTo(ax + Math.cos(angle) * 7, ay + Math.sin(angle) * 7);
          ctx.lineTo(ax + Math.cos(angle + 2.4) * 7, ay + Math.sin(angle + 2.4) * 7);
          ctx.lineTo(ax + Math.cos(angle - 2.4) * 7, ay + Math.sin(angle - 2.4) * 7);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        // Equipped character Aura Trail
        const auraId = player.appearance?.auraTrail ?? 'none';
        if (auraId !== 'none') {
          const auraColor =
            auraId === 'flame'
              ? 'rgba(249, 115, 22, 0.5)'
              : auraId === 'frost'
              ? 'rgba(103, 232, 249, 0.5)'
              : auraId === 'shadow'
              ? 'rgba(139, 92, 246, 0.52)'
              : auraId === 'ego'
              ? 'rgba(244, 63, 94, 0.62)'
              : 'rgba(56, 189, 248, 0.45)';
          const pulse = 1 + Math.sin(now * 0.008 + player.number) * 0.14;
          ctx.save();
          ctx.strokeStyle = auraColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(player.x, player.y, (PLAYER_RADIUS + 9) * pulse, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Active Skill Ring & Whirlwind FX
        if (activeSkillDef && player.activeSkillTimer > 0) {
          ctx.save();
          ctx.strokeStyle = activeSkillDef.color;
          ctx.lineWidth = 3.2;
          if (player.activeSkill === 'cyclone-dribble') {
            ctx.globalAlpha = 0.55;
            ctx.setLineDash([12, 8]);
            ctx.beginPath();
            ctx.arc(player.x, player.y, 108, now * 0.01, now * 0.01 + Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.arc(player.x, player.y, PLAYER_RADIUS + 12, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        }

        const isTrailSubject =
          localPlayerId !== 'spectator' &&
          (player.id === activeLocalId || (state.mode === '2p' && player.id === activeBlueId));
        if (player.isSprinting || (isTrailSubject && isDribbling && selectedTrailAnim !== 'standard')) {
          ctx.save();
          const backAngle = player.facingAngle + Math.PI;
          const trailKind = isTrailSubject ? selectedTrailAnim : 'standard';
          if (trailKind === 'flame-dash') {
            for (let fi = 0; fi < 4; fi++) {
              const dist = PLAYER_RADIUS + 8 + fi * 10 + Math.sin(now * 0.04 + fi) * 3;
              const px = player.x + Math.cos(backAngle) * dist;
              const py = player.y + Math.sin(backAngle) * dist;
              ctx.fillStyle = fi % 2 === 0 ? 'rgba(249, 115, 22, 0.78)' : 'rgba(251, 191, 36, 0.72)';
              ctx.beginPath();
              ctx.arc(px, py, Math.max(3, 9 - fi * 1.6), 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (trailKind === 'frost-nova') {
            ctx.strokeStyle = 'rgba(103, 232, 249, 0.85)';
            ctx.lineWidth = 2;
            for (let fi = 0; fi < 3; fi++) {
              const dist = PLAYER_RADIUS + 10 + fi * 12;
              const px = player.x + Math.cos(backAngle) * dist;
              const py = player.y + Math.sin(backAngle) * dist;
              ctx.beginPath();
              ctx.moveTo(px, py - 6);
              ctx.lineTo(px + 6, py);
              ctx.lineTo(px, py + 6);
              ctx.lineTo(px - 6, py);
              ctx.closePath();
              ctx.stroke();
            }
          } else if (trailKind === 'shadow-echo') {
            for (let fi = 1; fi <= 3; fi++) {
              const dist = fi * 14;
              ctx.globalAlpha = 0.34 / fi;
              ctx.fillStyle = '#8B5CF6';
              ctx.beginPath();
              ctx.arc(
                player.x + Math.cos(backAngle) * dist,
                player.y + Math.sin(backAngle) * dist,
                PLAYER_RADIUS * 0.9,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
          } else if (trailKind === 'gold-aura') {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
            for (let fi = 0; fi < 5; fi++) {
              const ang = now * 0.012 + (fi * Math.PI * 2) / 5;
              const ox = player.x + Math.cos(ang) * (PLAYER_RADIUS + 11);
              const oy = player.y + Math.sin(ang) * (PLAYER_RADIUS + 11);
              ctx.beginPath();
              ctx.arc(ox, oy, 3.2, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.72)';
            ctx.lineWidth = 2.2;
            for (const offset of [-8, 0, 8]) {
              const px = player.x + Math.cos(backAngle + Math.PI / 2) * offset;
              const py = player.y + Math.sin(backAngle + Math.PI / 2) * offset;
              ctx.beginPath();
              ctx.moveTo(px + Math.cos(backAngle) * (PLAYER_RADIUS + 4), py + Math.sin(backAngle) * (PLAYER_RADIUS + 4));
              ctx.lineTo(px + Math.cos(backAngle) * (PLAYER_RADIUS + 18), py + Math.sin(backAngle) * (PLAYER_RADIUS + 18));
              ctx.stroke();
            }
          }
          ctx.restore();
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.34)';
        ctx.beginPath();
        ctx.ellipse(player.x, player.y + PLAYER_RADIUS - 2, PLAYER_RADIUS * 0.92, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated stride cleats when running
        const pSpeed = Math.hypot(player.vx, player.vy);
        if (pSpeed > 25) {
          const stride = Math.sin(now * (player.isSprinting ? 0.028 : 0.018) + player.number) * 6;
          const fx = Math.cos(player.facingAngle);
          const fy = Math.sin(player.facingAngle);
          const sx = -fy;
          const sy = fx;
          ctx.save();
          ctx.fillStyle = player.appearance?.cleatColor ?? '#F8FAFC';
          for (const side of [-1, 1]) {
            const footX = player.x + sx * (side * 8) + fx * (side * stride);
            const footY = player.y + PLAYER_RADIUS - 4 + sy * (side * 8) + fy * (side * stride * 0.5);
            ctx.beginPath();
            ctx.ellipse(footX, footY, 4.2, 2.7, player.facingAngle, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        if (player.isGoalkeeper) {
          ctx.save();
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.92)';
          ctx.lineWidth = 2.4;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.arc(player.x, player.y, PLAYER_RADIUS + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          if (player.gkHoldTimer > 0) {
            const holdRatio = Math.max(
              0,
              Math.min(1, player.gkHoldTimer / GOALKEEPER_HOLD_SECONDS)
            );
            ctx.strokeStyle = '#FACC15';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(
              player.x,
              player.y,
              PLAYER_RADIUS + 12.5,
              -Math.PI / 2,
              -Math.PI / 2 + Math.PI * 2 * holdRatio
            );
            ctx.stroke();
          }
          ctx.restore();
        }

        if (isDribbling) {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(player.x, player.y, PLAYER_RADIUS + 6, 0, Math.PI * 2);
          ctx.stroke();
        } else if (player.isSprinting) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.arc(player.x, player.y, PLAYER_RADIUS + 6, 0, Math.PI * 2);
          ctx.stroke();
        } else if (isLocalHighlight) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(player.x, player.y, PLAYER_RADIUS + 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        drawPlayerCircle(
          ctx,
          player.x,
          player.y,
          player.team,
          player.number,
          player.facingAngle,
          isCarrier,
          player.isGoalkeeper,
          player.appearance
        );

        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = isLocalHighlight ? '#FFFFFF' : 'rgba(248, 250, 252, 0.86)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const skillPrefix = activeSkillDef ? `${activeSkillDef.icon} ` : '';
        const displayName = `${skillPrefix}${player.isGoalkeeper ? `🧤 ${player.name}` : player.name}`;
        ctx.fillText(displayName, player.x, player.y - PLAYER_RADIUS - 13);

        // Stamina bar (for highlighted player or anyone recovering stamina)
        if (isLocalHighlight || player.stamina < 99.5) {
          const sw = 36;
          const sh = 4;
          const sx = player.x - sw / 2;
          const sy = player.y + PLAYER_RADIUS + 7;
          const pct = clamp(player.stamina / 100, 0, 1);

          ctx.fillStyle = 'rgba(11, 18, 21, 0.82)';
          ctx.fillRect(sx - 0.5, sy - 0.5, sw + 1, sh + 1);
          ctx.fillStyle = player.staminaExhausted
            ? '#F59E0B'
            : player.isSprinting
            ? '#38BDF8'
            : '#34D399';
          ctx.fillRect(sx, sy, sw * pct, sh);
        }

        // Shot Power Bar when holding Shoot
        if (player.isChargingShoot) {
          const pw = 42;
          const ph = 5.5;
          const px = player.x - pw / 2;
          const py = player.y + PLAYER_RADIUS + 14;
          const cpct = clamp(player.shootCharge, 0, 1);

          ctx.fillStyle = 'rgba(11, 18, 21, 0.9)';
          ctx.fillRect(px - 1, py - 1, pw + 2, ph + 2);
          ctx.fillStyle =
            cpct > 0.78 ? '#EF4444' : cpct > 0.45 ? '#F59E0B' : '#10B981';
          ctx.fillRect(px, py, pw * cpct, ph);
          ctx.strokeStyle = 'rgba(255,255,255,0.45)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(px - 1, py - 1, pw + 2, ph + 2);
        }

        const activeEmote = playerEmoteMap.get(player.id);
        if (activeEmote) {
          drawEmoteBubble(
            ctx,
            player.x,
            player.y - PLAYER_RADIUS - 38,
            `${activeEmote.emoji} ${activeEmote.label}`,
            nowMs - activeEmote.createdAt,
            player.team
          );
        }
      }

      // 6. Football + Speed / Skill Shot Trail
      const ball = renderBall;
      const ballSpeed = Math.hypot(ball.vx, ball.vy);
      if (ball.possessorId === null && (ball.shotSkillTag || ballSpeed > 480)) {
        const bSkill = ball.shotSkillTag ? getSkillById(ball.shotSkillTag) : undefined;
        const trailColor = bSkill?.color ?? (ballSpeed > 820 ? '#FBBF24' : '#E2E8F0');
        ctx.save();
        const trailGrad = ctx.createLinearGradient(
          ball.x,
          ball.y,
          ball.x - ball.vx * 0.065,
          ball.y - ball.vy * 0.065
        );
        trailGrad.addColorStop(0, trailColor);
        trailGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = trailGrad;
        ctx.globalAlpha = bSkill ? 0.78 : Math.min(0.6, (ballSpeed - 460) / 700);
        ctx.lineWidth = bSkill ? 9 : 6.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.x - ball.vx * 0.065, ball.y - ball.vy * 0.065);
        ctx.stroke();
        ctx.restore();
      }

      ctx.fillStyle = 'rgba(0,0,0,0.38)';
      ctx.beginPath();
      ctx.ellipse(ball.x + 1, ball.y + BALL_RADIUS - 1, BALL_RADIUS * 0.95, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.rotate(ball.spin);

      const ballGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, BALL_RADIUS);
      ballGrad.addColorStop(0, '#FFFFFF');
      ballGrad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = Math.cos(a) * 4.4;
        const py = Math.sin(a) * 4.4;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * (BALL_RADIUS - 1.5), Math.sin(a) * (BALL_RADIUS - 1.5), 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 7. Goal Posts
      const posts = [
        { x: bounds.pitchLeft, y: bounds.goalTop },
        { x: bounds.pitchLeft, y: bounds.goalBottom },
        { x: bounds.pitchRight, y: bounds.goalTop },
        { x: bounds.pitchRight, y: bounds.goalBottom },
      ];
      for (const post of posts) {
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(post.x, post.y, GOAL_POST_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore(); // End Camera Transform

      // 8. Screen-space Goal Stadium Flash & Confetti
      if (goalFlashRef.current.alpha > 0.01) {
        const flashColor =
          goalFlashRef.current.team === 'blue'
            ? `rgba(59, 130, 246, ${goalFlashRef.current.alpha * 0.45})`
            : `rgba(239, 68, 68, ${goalFlashRef.current.alpha * 0.45})`;
        const flashGrad = ctx.createRadialGradient(
          viewW / 2,
          viewH / 2,
          Math.min(viewW, viewH) * 0.14,
          viewW / 2,
          viewH / 2,
          Math.max(viewW, viewH) * 0.65
        );
        flashGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
        flashGrad.addColorStop(1, flashColor);
        ctx.fillStyle = flashGrad;
        ctx.fillRect(0, 0, viewW, viewH);
      }

      for (const c of confettiRef.current) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, c.life / 0.45);
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }

      // 9. Screen-space Tactical Minimap
      drawMinimap(ctx, state, cam, activeLocalId, viewW, viewH);

      // 10. Screen-space Phase Banners
      const activeLabels = labelsRef.current;
      if (state.phase === 'GOAL') {
        const elapsed = Math.max(0, GOAL_CELEBRATION_SECONDS - state.phaseTimer);
        const popScale =
          elapsed < 0.22 ? 0.72 + (elapsed / 0.22) * 0.34 : elapsed < 0.32 ? 1.06 - ((elapsed - 0.22) / 0.1) * 0.06 : 1;
        drawGoalBanner(
          ctx,
          state.lastScorerName ?? '',
          state.lastScorerTeam ?? 'blue',
          popScale,
          activeLabels,
          viewW,
          viewH,
          Boolean(state.lastGoalOwnGoal)
        );
      } else if (state.phase === 'OVERTIME') {
        drawCenterBanner(
          ctx,
          activeLabels.overtimeTitle,
          activeLabels.overtimeSub
            .replace('{cur}', String(state.overtimeCount))
            .replace('{max}', String(MAX_OVERTIMES)),
          '#D97706',
          viewW,
          viewH
        );
      } else if (state.phase === 'KICKOFF') {
        drawCenterBanner(
          ctx,
          activeLabels.prepareTitle,
          activeLabels.prepareSub,
          '#059669',
          viewW,
          viewH
        );
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      resizeObs?.disconnect();
      window.removeEventListener('resize', updateCssSize);
    };
  }, [stateRef, localPlayerId, emotesRef]);

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full bg-[#0D191E]"
    />
  );
};

export function drawPlayerCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  team: Team,
  number: number,
  facingAngle: number,
  isCarrier: boolean,
  isGoalkeeper: boolean,
  appearance?: CharacterConfig
) {
  const grad = ctx.createRadialGradient(x - 5, y - 6, 3, x, y, PLAYER_RADIUS);
  if (team === 'blue') {
    grad.addColorStop(0, '#60A5FA');
    grad.addColorStop(1, '#1D4ED8');
  } else {
    grad.addColorStop(0, '#F87171');
    grad.addColorStop(1, '#B91C1C');
  }

  ctx.save();
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Jersey Pattern clipped inside body circle
  const pat = appearance?.jerseyPattern ?? 'solid';
  if (pat !== 'solid') {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, PLAYER_RADIUS - 1, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    if (pat === 'stripe') {
      ctx.fillRect(x - 5, y - PLAYER_RADIUS, 10, PLAYER_RADIUS * 2);
    } else if (pat === 'sash') {
      ctx.beginPath();
      ctx.moveTo(x - PLAYER_RADIUS, y - PLAYER_RADIUS * 0.4);
      ctx.lineTo(x + PLAYER_RADIUS, y + PLAYER_RADIUS * 0.9);
      ctx.lineTo(x + PLAYER_RADIUS, y + PLAYER_RADIUS * 0.35);
      ctx.lineTo(x - PLAYER_RADIUS, y - PLAYER_RADIUS * 0.95);
      ctx.closePath();
      ctx.fill();
    } else if (pat === 'star') {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 11 : 5;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        const sx = x + Math.cos(a) * r;
        const sy = y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.closePath();
      ctx.fill();
    } else if (pat === 'flame') {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.38)';
      ctx.beginPath();
      ctx.moveTo(x - PLAYER_RADIUS, y + PLAYER_RADIUS);
      ctx.quadraticCurveTo(x - 6, y - 2, x, y - PLAYER_RADIUS * 0.7);
      ctx.quadraticCurveTo(x + 6, y - 2, x + PLAYER_RADIUS, y + PLAYER_RADIUS);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Rim / Cleats Color
  ctx.strokeStyle = isCarrier
    ? '#FBBF24'
    : isGoalkeeper
    ? '#FCD34D'
    : appearance?.cleatColor ?? '#F8FAFC';
  ctx.lineWidth = isCarrier ? 2.8 : 2.3;
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.stroke();

  // Facing direction notch
  const notchX = x + Math.cos(facingAngle) * (PLAYER_RADIUS - 2);
  const notchY = y + Math.sin(facingAngle) * (PLAYER_RADIUS - 2);
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.arc(notchX, notchY, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // Jersey Number
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 13px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), x, y + 0.5);

  // Hair / Headwear Style above rim
  const hair = appearance?.hairStyle ?? 'none';
  const hColor = appearance?.hairColor ?? '#0F172A';
  if (hair === 'spiky') {
    ctx.fillStyle = hColor;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 13);
    ctx.lineTo(x - 9, y - 25);
    ctx.lineTo(x - 3, y - 18);
    ctx.lineTo(x, y - 28);
    ctx.lineTo(x + 4, y - 18);
    ctx.lineTo(x + 10, y - 25);
    ctx.lineTo(x + 12, y - 13);
    ctx.closePath();
    ctx.fill();
  } else if (hair === 'headband') {
    ctx.fillStyle = hColor;
    ctx.fillRect(x - PLAYER_RADIUS + 2, y - 13, (PLAYER_RADIUS - 2) * 2, 4.5);
  } else if (hair === 'afro') {
    ctx.fillStyle = hColor;
    ctx.beginPath();
    ctx.arc(x, y - 15, 11, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
  } else if (hair === 'mohawk') {
    ctx.fillStyle = hColor;
    ctx.fillRect(x - 3.2, y - 27, 6.4, 15);
  } else if (hair === 'horns') {
    ctx.fillStyle = hColor;
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + dir * 7, y - 14);
      ctx.quadraticCurveTo(x + dir * 16, y - 22, x + dir * 12, y - 29);
      ctx.quadraticCurveTo(x + dir * 9, y - 21, x + dir * 13, y - 14);
      ctx.fill();
    }
  } else if (hair === 'halo') {
    ctx.strokeStyle = hColor === '#0F172A' ? '#FDE047' : hColor;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.ellipse(x, y - 23, 12, 4.2, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (hair === 'crown') {
    ctx.fillStyle = hColor === '#0F172A' ? '#FBBF24' : hColor;
    ctx.beginPath();
    ctx.moveTo(x - 10, y - 14);
    ctx.lineTo(x - 10, y - 24);
    ctx.lineTo(x - 4, y - 19);
    ctx.lineTo(x, y - 27);
    ctx.lineTo(x + 4, y - 19);
    ctx.lineTo(x + 10, y - 24);
    ctx.lineTo(x + 10, y - 14);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawEmoteBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  ageMs: number,
  team: Team
) {
  const alpha = ageMs < 180 ? ageMs / 180 : ageMs > 2200 ? Math.max(0, (2600 - ageMs) / 400) : 1;
  const floatOffset = Math.min(8, ageMs * 0.012);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
  const tw = ctx.measureText(text).width;
  const bw = tw + 18;
  const bh = 26;
  const bx = x - bw / 2;
  const by = y - bh - floatOffset;

  ctx.fillStyle = 'rgba(11, 18, 21, 0.92)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 8);
  ctx.fill();

  ctx.strokeStyle = team === 'blue' ? '#60A5FA' : '#F87171';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Tail
  ctx.fillStyle = 'rgba(11, 18, 21, 0.92)';
  ctx.beginPath();
  ctx.moveTo(x - 5, by + bh);
  ctx.lineTo(x + 5, by + bh);
  ctx.lineTo(x, by + bh + 5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, by + bh / 2 + 0.5);
  ctx.restore();
}

function drawMinimap(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  cam: { x: number; y: number; zoom: number },
  localPlayerId: string | null | undefined,
  viewW: number,
  viewH: number
) {
  const bounds = getPitchBounds(state.teamSize);
  const isCompact = viewW < 680 || viewH < 480;
  const mw = isCompact ? 88 : 136;
  const mh = isCompact ? 50 : 76;
  const mx =
    state.mode === '2p'
      ? viewW < 540
        ? 10
        : (viewW - mw) / 2
      : viewW - mw - (isCompact ? 10 : 14);
  const my =
    state.mode === '2p'
      ? viewW < 540
        ? 10
        : viewH - mh - 10
      : isCompact
      ? 48
      : viewH - mh - 58;
  const sx = mw / bounds.worldWidth;
  const sy = mh / bounds.worldHeight;

  ctx.save();
  ctx.fillStyle = isCompact ? 'rgba(11, 18, 21, 0.65)' : 'rgba(11, 18, 21, 0.78)';
  ctx.beginPath();
  ctx.roundRect(mx, my, mw, mh, 8);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.strokeRect(
    mx + bounds.pitchLeft * sx,
    my + bounds.pitchTop * sy,
    bounds.pitchWidth * sx,
    bounds.pitchHeight * sy
  );
  ctx.beginPath();
  ctx.moveTo(mx + bounds.centerX * sx, my + bounds.pitchTop * sy);
  ctx.lineTo(mx + bounds.centerX * sx, my + bounds.pitchBottom * sy);
  ctx.stroke();

  const camViewW = viewW / cam.zoom;
  const camViewH = viewH / cam.zoom;
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(
    mx + (cam.x - camViewW / 2) * sx,
    my + (cam.y - camViewH / 2) * sy,
    camViewW * sx,
    camViewH * sy
  );

  for (const p of state.players) {
    const isLocal = p.id === localPlayerId;
    ctx.fillStyle = p.team === 'blue' ? '#60A5FA' : '#F87171';
    ctx.beginPath();
    const dotR = isLocal
      ? state.teamSize === 16
        ? 3.0
        : 3.5
      : state.teamSize === 16
      ? 1.8
      : 2.4;
    ctx.arc(mx + p.x * sx, my + p.y * sy, dotR, 0, Math.PI * 2);
    ctx.fill();
    if (isLocal) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(mx + state.ball.x * sx, my + state.ball.y * sy, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGoal(
  ctx: CanvasRenderingContext2D,
  side: 'left' | 'right',
  x: number,
  y: number,
  w: number,
  h: number,
  shake: number
) {
  const wobble = shake > 0 ? Math.sin(performance.now() * 0.045) * shake * 6 : 0;

  ctx.save();
  ctx.fillStyle =
    side === 'left' ? 'rgba(37, 99, 235, 0.14)' : 'rgba(220, 38, 38, 0.14)';
  ctx.fillRect(x + (side === 'left' ? wobble : 0), y, w + (side === 'right' ? wobble : 0), h);

  ctx.strokeStyle = 'rgba(248, 250, 252, 0.25)';
  ctx.lineWidth = 1;
  const step = 14;
  for (let gx = x; gx <= x + w; gx += step) {
    ctx.beginPath();
    ctx.moveTo(gx + wobble * 0.5, y);
    ctx.lineTo(gx + wobble * 0.5, y + h);
    ctx.stroke();
  }
  for (let gy = y; gy <= y + h; gy += step) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w + wobble, gy);
    ctx.stroke();
  }

  ctx.strokeStyle = side === 'left' ? '#60A5FA' : '#F87171';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  if (side === 'left') {
    ctx.moveTo(x + w, y);
    ctx.lineTo(x + wobble, y);
    ctx.lineTo(x + wobble, y + h);
    ctx.lineTo(x + w, y + h);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w + wobble, y);
    ctx.lineTo(x + w + wobble, y + h);
    ctx.lineTo(x, y + h);
  }
  ctx.stroke();
  ctx.restore();
}

function drawGoalBanner(
  ctx: CanvasRenderingContext2D,
  scorerName: string,
  team: Team,
  scale: number,
  labels: GameCanvasLabels,
  viewW: number,
  viewH: number,
  isOwnGoal = false
) {
  const accent = team === 'blue' ? '#3B82F6' : '#EF4444';
  const teamLabel = team === 'blue' ? labels.blueTeam : labels.redTeam;
  const fit = Math.min(1, (viewW - 24) / 490);
  ctx.save();
  ctx.translate(viewW / 2, viewH / 2);
  ctx.scale(scale * fit, scale * fit);

  const boxW = 490;
  const boxH = 122;
  ctx.fillStyle = 'rgba(11, 18, 21, 0.93)';
  ctx.beginPath();
  ctx.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, 16);
  ctx.fill();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();

  const titleText = isOwnGoal ? 'GOL CONTRA KKKKKKKKKKKKK' : labels.goalTitle;
  ctx.fillStyle = isOwnGoal ? '#FDE047' : '#F8FAFC';
  ctx.font = isOwnGoal
    ? '800 35px "Barlow Condensed", sans-serif'
    : '800 50px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(titleText, 0, -22, boxW - 32);

  const otherTeamLabel = team === 'blue' ? labels.redTeam : labels.blueTeam;
  const subText = isOwnGoal
    ? (labels.ownGoalScoredFor ?? DEFAULT_CANVAS_LABELS.ownGoalScoredFor!)
        .replace('{otherTeam}', otherTeamLabel)
        .replace('{team}', teamLabel)
    : labels.scoredFor.replace('{scorer}', scorerName).replace('{team}', teamLabel);

  ctx.fillStyle = team === 'blue' ? '#93C5FD' : '#FCA5A5';
  ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subText, 0, 17, boxW - 32);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(labels.pausedClock, 0, 41);
  ctx.restore();
}

function drawCenterBanner(
  ctx: CanvasRenderingContext2D,
  title: string,
  subtitle: string,
  accentColor: string,
  viewW: number,
  viewH: number
) {
  const fit = Math.min(1, (viewW - 24) / 470);
  ctx.save();
  ctx.translate(viewW / 2, viewH / 2);
  ctx.scale(fit, fit);

  const boxW = 470;
  const boxH = 98;
  const bx = -boxW / 2;
  const by = -boxH / 2;

  ctx.fillStyle = 'rgba(11, 18, 21, 0.9)';
  ctx.beginPath();
  ctx.roundRect(bx, by, boxW, boxH, 14);
  ctx.fill();

  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '800 42px "Barlow Condensed", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 0, -14);

  ctx.fillStyle = '#CBD5E1';
  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(subtitle, 0, 24);
  ctx.restore();
}
