import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ChevronRight,
  Film,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react';
import { createInitialGameState, type GameState } from '../shared/gameEngine.ts';
import type { PitchTurfId } from '../shared/turfs.ts';
import type { TranslationDict } from '../i18n/translations.ts';
import {
  cloneGameStateSnapshot,
  type HighlightClip,
  type HighlightKind,
  type SavedMatchHighlights,
} from '../utils/replaySystem.ts';
import { GameCanvas, type GameCanvasLabels } from './GameCanvas.tsx';

interface ReplayModalProps {
  open: boolean;
  onClose: () => void;
  t: TranslationDict;
  initialReplay: SavedMatchHighlights | null;
  savedReplays: SavedMatchHighlights[];
  onDeleteReplay?: (id: string) => void;
  turfId: PitchTurfId;
  canvasLabels: GameCanvasLabels;
}

function formatClock(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function clipKindIcon(kind: HighlightKind): string {
  if (kind === 'goal') return '⚽';
  if (kind === 'post') return '🥅';
  if (kind === 'skill') return '⚡';
  return '🛡️';
}

function clipKindLabel(kind: HighlightKind, t: TranslationDict): string {
  if (kind === 'goal') return t.replayMomentGoal;
  if (kind === 'post') return t.replayMomentPost;
  if (kind === 'skill') return t.replayMomentSkill;
  return t.replayMomentSave;
}

export const ReplayModal: React.FC<ReplayModalProps> = ({
  open,
  onClose,
  t,
  initialReplay,
  savedReplays,
  onDeleteReplay,
  turfId,
  canvasLabels,
}) => {
  const allReels = useMemo(() => {
    const map = new Map<string, SavedMatchHighlights>();
    if (initialReplay && initialReplay.clips.length > 0) {
      map.set(initialReplay.id, initialReplay);
    }
    for (const r of savedReplays) {
      if (r.clips.length > 0 && !map.has(r.id)) {
        map.set(r.id, r);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
  }, [initialReplay, savedReplays]);

  const [selectedReelId, setSelectedReelId] = useState<string>('');
  const [clipIdx, setClipIdx] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [loopClip, setLoopClip] = useState(true);
  const [speed, setSpeed] = useState<0.5 | 1 | 1.5 | 2>(1);
  const [cameraTarget, setCameraTarget] = useState<string>('ball');

  const activeReel = useMemo(() => {
    if (allReels.length === 0) return null;
    return allReels.find((r) => r.id === selectedReelId) ?? allReels[0];
  }, [allReels, selectedReelId]);

  const activeClip: HighlightClip | null =
    activeReel && activeReel.clips.length > 0
      ? activeReel.clips[Math.min(clipIdx, activeReel.clips.length - 1)]
      : null;

  const fallbackState = useMemo(() => createInitialGameState({ mode: '1p', teamSize: 1 }), []);
  const replayStateRef = useRef<GameState>(cloneGameStateSnapshot(fallbackState));

  const frameFloatRef = useRef(0);
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const loopRef = useRef(loopClip);
  loopRef.current = loopClip;

  // Reset to initialReplay whenever opened
  useEffect(() => {
    if (!open) return;
    if (initialReplay && initialReplay.clips.length > 0) {
      setSelectedReelId(initialReplay.id);
    } else if (allReels[0]) {
      setSelectedReelId(allReels[0].id);
    }
    setClipIdx(0);
    setFrameIdx(0);
    frameFloatRef.current = 0;
    setCameraTarget('ball');
    setPlaying(true);
  }, [open, initialReplay, allReels]);

  // Sync initial frame whenever activeClip changes
  useEffect(() => {
    if (!open || !activeClip || activeClip.frames.length === 0) return;
    frameFloatRef.current = 0;
    setFrameIdx(0);
    replayStateRef.current = cloneGameStateSnapshot(activeClip.frames[0]);
    setPlaying(true);
  }, [open, activeClip]);

  // Playback loop at 30 * speed fps
  useEffect(() => {
    if (!open || !activeClip || activeClip.frames.length === 0) return;
    const total = activeClip.frames.length;
    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (playingRef.current) {
        let next = frameFloatRef.current + dt * 30 * speedRef.current;
        if (next >= total) {
          if (loopRef.current) {
            next = 0;
          } else {
            next = total - 1;
            setPlaying(false);
          }
        }
        frameFloatRef.current = next;
        const idx = Math.min(total - 1, Math.max(0, Math.floor(next)));
        replayStateRef.current = cloneGameStateSnapshot(activeClip.frames[idx]);
        setFrameIdx(idx);
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [open, activeClip]);

  if (!open || typeof document === 'undefined') return null;

  const handleScrub = (nextIdx: number) => {
    if (!activeClip || activeClip.frames.length === 0) return;
    const clamped = Math.max(0, Math.min(activeClip.frames.length - 1, nextIdx));
    frameFloatRef.current = clamped;
    setFrameIdx(clamped);
    replayStateRef.current = cloneGameStateSnapshot(activeClip.frames[clamped]);
  };

  const totalFrames = activeClip?.frames.length ?? 0;
  const elapsedSec = frameIdx / 30;
  const totalSec = totalFrames / 30;
  const currentPlayers = activeClip?.frames[0]?.players ?? [];

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-modal-backdrop">
      <div className="w-full max-w-4xl max-h-[95dvh] overflow-y-auto rounded-2xl bg-[#111C21] border border-white/15 p-3.5 sm:p-5 space-y-3.5 shadow-2xl animate-modal-enter">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-emerald-400 shrink-0" />
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white truncate">
                {t.replayModalTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{t.replayModalSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!activeReel || !activeClip ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm text-slate-300">{t.noReplaysYet}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        ) : (
          <>
            {/* Saved Matches Selector if archive has multiple 1P/2P matches */}
            {allReels.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                  {t.replaySavedMatchesLabel}:
                </span>
                {allReels.map((reel) => {
                  const selected = reel.id === activeReel.id;
                  return (
                    <div
                      key={reel.id}
                      className={`flex items-center gap-1 rounded-lg border shrink-0 transition-colors ${
                        selected
                          ? 'bg-emerald-500/20 border-emerald-400 text-white'
                          : 'bg-[#0B1215] border-white/10 text-slate-300 hover:border-white/25'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReelId(reel.id);
                          setClipIdx(0);
                          setCameraTarget('ball');
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="uppercase font-mono-num text-[10px] text-emerald-300">
                          {reel.mode}
                        </span>
                        <span>
                          {reel.blueName} {reel.blueScore}×{reel.redScore} {reel.redName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({reel.clips.length})
                        </span>
                      </button>
                      {onDeleteReplay && allReels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteReplay(reel.id)}
                          aria-label="Excluir replay"
                          className="pr-2 py-1 text-slate-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Replay Viewport Canvas */}
            <div className="relative w-full aspect-video max-h-[50dvh] rounded-xl overflow-hidden border border-white/15 bg-[#0D191E]">
              <GameCanvas
                stateRef={replayStateRef}
                localPlayerId="spectator"
                spectateTargetId={cameraTarget}
                labels={canvasLabels}
                turfId={turfId}
              />

              {/* Top-left Highlight Banner */}
              <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-[#0B1215]/80 border border-white/15 backdrop-blur-xs flex items-center gap-2 text-xs">
                <span>{clipKindIcon(activeClip.kind)}</span>
                <span className="font-bold text-white">{activeClip.title}</span>
                <span className="text-slate-400">·</span>
                <span className="font-mono-num text-emerald-300 font-semibold">
                  {formatClock(activeClip.matchTimeSeconds)}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-mono-num font-bold text-slate-200">
                  {activeClip.scoreAtMoment.blue} × {activeClip.scoreAtMoment.red}
                </span>
              </div>
            </div>

            {/* Playback & Scrubber Controls */}
            <div className="p-3 rounded-xl bg-[#0B1215] border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    if (frameIdx >= totalFrames - 1 && !playing) {
                      handleScrub(0);
                      setPlaying(true);
                    } else {
                      setPlaying((p) => !p);
                    }
                  }}
                  aria-label={playing ? t.replayPause : t.replayPlay}
                  className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold cursor-pointer shrink-0"
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleScrub(0);
                    setPlaying(true);
                  }}
                  aria-label="Reiniciar clipe"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min={0}
                  max={Math.max(0, totalFrames - 1)}
                  value={frameIdx}
                  onChange={(e) => {
                    setPlaying(false);
                    handleScrub(Number(e.target.value));
                  }}
                  className="flex-1 accent-emerald-400 cursor-pointer"
                />

                <span className="font-mono-num text-xs text-slate-300 shrink-0 w-20 text-right">
                  {elapsedSec.toFixed(1)}s / {totalSec.toFixed(1)}s
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Speed + Loop */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {t.replaySpeedLabel}:
                  </span>
                  {([0.5, 1, 1.5, 2] as const).map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setSpeed(sp)}
                      className={`px-2 py-1 rounded-md font-mono-num text-xs font-bold cursor-pointer transition-colors ${
                        speed === sp
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {sp}x
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLoopClip((v) => !v)}
                    title="Repetir clipe"
                    className={`ml-1 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                      loopClip
                        ? 'bg-sky-500/25 text-sky-300 border border-sky-400/40'
                        : 'bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Camera Target + Prev/Next Moment */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCameraTarget('ball')}
                    className={`px-2 py-1 rounded-md text-xs font-bold cursor-pointer ${
                      cameraTarget === 'ball'
                        ? 'bg-sky-500 text-slate-950'
                        : 'bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    ⚽ {t.followBall}
                  </button>
                  {currentPlayers
                    .filter((p) => !p.isAI || activeReel.teamSize === 1)
                    .slice(0, 4)
                    .map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setCameraTarget(p.id)}
                        className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                          cameraTarget === p.id
                            ? p.team === 'blue'
                              ? 'bg-blue-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}

                  <div className="flex items-center gap-1 ml-1">
                    <button
                      type="button"
                      disabled={clipIdx <= 0}
                      onClick={() => setClipIdx((i) => Math.max(0, i - 1))}
                      aria-label={t.replayPrev}
                      className="p-1.5 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-35 text-white cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={clipIdx >= activeReel.clips.length - 1}
                      onClick={() =>
                        setClipIdx((i) => Math.min(activeReel.clips.length - 1, i + 1))
                      }
                      aria-label={t.replayNext}
                      className="p-1.5 rounded-md bg-white/10 hover:bg-white/15 disabled:opacity-35 text-white cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Moments Clip Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeReel.clips.map((clip, idx) => {
                const isSelected = idx === clipIdx;
                return (
                  <button
                    key={clip.id}
                    type="button"
                    onClick={() => setClipIdx(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-400 text-white'
                        : 'bg-[#0B1215] border-white/10 text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <span className="font-bold truncate">
                        {clipKindIcon(clip.kind)} {clipKindLabel(clip.kind, t)}
                      </span>
                      <span className="font-mono-num text-[11px] text-emerald-300 shrink-0">
                        {formatClock(clip.matchTimeSeconds)}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white truncate mt-1">
                      {clip.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono-num mt-0.5">
                      {clip.scoreAtMoment.blue} × {clip.scoreAtMoment.red} ·{' '}
                      {(clip.frames.length / 30).toFixed(1)}s
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};
