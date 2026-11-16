import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Move, RotateCcw, Sliders, X } from 'lucide-react';
import type { TranslationDict } from '../i18n/translations.ts';
import {
  computeSinglePlayerHudPlacements,
  createDefaultHudConfig,
  HUD_PREVIEW_HEIGHT,
  HUD_PREVIEW_WIDTH,
  type HudConfig,
  type HudControlId,
} from '../utils/hudLayout.ts';

interface HudCustomizerModalProps {
  open: boolean;
  onClose: () => void;
  t: TranslationDict;
  config: HudConfig;
  onChange: (next: HudConfig) => void;
}

export const HudCustomizerModal: React.FC<HudCustomizerModalProps> = ({
  open,
  onClose,
  t,
  config,
  onChange,
}) => {
  const previewBoxRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(1);

  const dragStateRef = useRef<{
    id: HudControlId;
    startClientX: number;
    startClientY: number;
    origOffsetX: number;
    origOffsetY: number;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    const el = previewBoxRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 20) {
        setPreviewScale(rect.width / HUD_PREVIEW_WIDTH);
      }
    };
    measure();

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => measure())
        : null;
    ro?.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const placements = computeSinglePlayerHudPlacements(
    config,
    HUD_PREVIEW_WIDTH,
    HUD_PREVIEW_HEIGHT
  );

  const startDrag = (
    id: HudControlId,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStateRef.current = {
      id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origOffsetX: config.offsets[id].x,
      origOffsetY: config.offsets[id].y,
    };
  };

  const moveDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    e.preventDefault();
    const safeScale = Math.max(0.25, previewScale);
    const dx = Math.round((e.clientX - drag.startClientX) / safeScale);
    const dy = Math.round((e.clientY - drag.startClientY) / safeScale);
    const nextX = Math.max(-150, Math.min(150, drag.origOffsetX + dx));
    const nextY = Math.max(-150, Math.min(150, drag.origOffsetY + dy));
    onChange({
      ...config,
      offsets: {
        ...config.offsets,
        [drag.id]: { x: nextX, y: nextY },
      },
    });
  };

  const endDrag = () => {
    dragStateRef.current = null;
  };

  const controlVisualMeta: Record<
    HudControlId,
    { label: string; bg: string; border: string }
  > = {
    joystick: {
      label: 'Joy',
      bg: 'bg-blue-600/75',
      border: 'border-blue-200/80',
    },
    sprint: {
      label: t.actionSprint,
      bg: 'bg-sky-500/80',
      border: 'border-sky-200/85',
    },
    dribble: {
      label: t.actionDribble,
      bg: 'bg-amber-500/80',
      border: 'border-amber-200/85',
    },
    pass: {
      label: t.actionPass,
      bg: 'bg-emerald-500/80',
      border: 'border-emerald-200/85',
    },
    shoot: {
      label: t.actionShoot,
      bg: 'bg-blue-600/85',
      border: 'border-blue-200/90',
    },
    switch: {
      label: t.actionSwitch,
      bg: 'bg-violet-500/85',
      border: 'border-violet-200/90',
    },
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-modal-backdrop">
      <div className="w-full max-w-5xl max-h-[95dvh] bg-[#111C21] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-modal-enter">
        {/* Compact Header */}
        <div className="px-3.5 py-2.5 sm:px-5 sm:py-3 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-lg sm:text-2xl font-extrabold text-white truncate leading-tight">
                {t.customizerTitle}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {t.customizerSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onChange(createDefaultHudConfig())}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] sm:text-xs font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetHudBtn}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Workspace: Left (Preview + compact Layout & Joystick controls below), Right (Sliders) */}
        <div className="p-3 sm:p-4 flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-[1.45fr_1fr] gap-3 sm:gap-4 items-start">
            {/* Left: Exact 16:9 WYSIWYG Interactive Field Preview */}
            <div className="flex flex-col gap-1.5 min-w-0 w-full">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-300 truncate">
                  <Move className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{t.dragHint}</span>
                </span>
                <span className="font-mono-num text-[10px] text-slate-400 shrink-0 pl-2">
                  16:9
                </span>
              </div>

              <div
                ref={previewBoxRef}
                className="relative w-full aspect-video max-h-[50dvh] mx-auto rounded-xl sm:rounded-2xl border border-white/15 overflow-hidden bg-gradient-to-b from-[#14532D] to-[#0D3B21] select-none touch-none shadow-inner"
              >
                <div
                  style={{
                    width: HUD_PREVIEW_WIDTH,
                    height: HUD_PREVIEW_HEIGHT,
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                  }}
                  className="relative"
                >
                  {/* Mock 16:9 pitch markings */}
                  <div className="pointer-events-none absolute inset-4 border-2 border-white/30">
                    <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/30" />
                    <div className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-32 border-r-2 border-y-2 border-white/25" />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-32 border-l-2 border-y-2 border-white/25" />
                  </div>

                  {/* Mock floating scoreboard */}
                  <div className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-[#0B1215]/70 border border-white/15 text-[11px] font-bold text-slate-200 flex items-center gap-2">
                    <span className="text-blue-400">0</span>
                    <span className="font-mono-num text-white">03:00</span>
                    <span className="text-red-400">0</span>
                  </div>

                  {/* Mock stamina/power bars showing exact real HUD side */}
                  <div
                    className={`pointer-events-none absolute bottom-2.5 w-24 px-2 py-1 rounded-lg bg-[#0B1215]/55 border border-white/10 text-[9px] text-slate-300 space-y-1 ${
                      config.layoutMode === 'split'
                        ? 'left-1/2 -translate-x-1/2'
                        : config.handedness === 'right-joy'
                        ? 'left-2.5'
                        : 'right-2.5'
                    }`}
                  >
                    <div className="h-1 rounded-full bg-sky-400/80 w-4/5" />
                    <div className="h-1 rounded-full bg-emerald-400/80 w-3/5" />
                  </div>

                  {(Object.keys(placements) as HudControlId[])
                    .filter((id) => id !== 'switch' || config.showSwitchButton)
                    .map((id) => {
                    const p = placements[id];
                    const meta = controlVisualMeta[id];
                    const posStyle: React.CSSProperties = {
                      width: p.size,
                      height: p.size,
                      bottom: Math.round(10 + p.bottomY - p.size / 2),
                      opacity: config.opacity,
                      ...(p.anchor === 'left'
                        ? { left: Math.round(p.centerX - p.size / 2) }
                        : { right: Math.round(p.centerX - p.size / 2) }),
                    };

                    return (
                      <div
                        key={id}
                        onPointerDown={(e) => startDrag(id, e)}
                        onPointerMove={moveDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                        onLostPointerCapture={endDrag}
                        style={posStyle}
                        className={`absolute rounded-full border-2 ${meta.bg} ${meta.border} shadow-lg flex items-center justify-center text-[10px] font-extrabold text-white cursor-grab active:cursor-grabbing touch-none ring-2 ring-white/20 hover:ring-amber-300`}
                      >
                        <span className="pointer-events-none text-center leading-tight px-1">
                          {meta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Compact squeezed Layout Style & Joystick Position right below the illustration */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-1.5 sm:p-2 rounded-lg bg-[#0B1215] border border-white/10 space-y-1 min-w-0">
                  <div className="text-[10px] font-bold text-slate-300 leading-none truncate">
                    {t.layoutModeLabel}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...config,
                          layoutMode: 'radial',
                          offsets: createDefaultHudConfig().offsets,
                        })
                      }
                      className={`py-1 px-1.5 rounded-md border text-[10px] font-bold cursor-pointer whitespace-nowrap truncate ${
                        config.layoutMode === 'radial'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                          : 'bg-[#111C21] border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {t.layoutRadial}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...config,
                          layoutMode: 'split',
                          offsets: createDefaultHudConfig().offsets,
                        })
                      }
                      className={`py-1 px-1.5 rounded-md border text-[10px] font-bold cursor-pointer whitespace-nowrap truncate ${
                        config.layoutMode === 'split'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                          : 'bg-[#111C21] border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {t.layoutSplit}
                    </button>
                  </div>
                </div>

                <div className="p-1.5 sm:p-2 rounded-lg bg-[#0B1215] border border-white/10 space-y-1 min-w-0">
                  <div className="text-[10px] font-bold text-slate-300 leading-none truncate">
                    {t.handednessLabel}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => onChange({ ...config, handedness: 'left-joy' })}
                      className={`py-1 px-1.5 rounded-md border text-[10px] font-bold cursor-pointer whitespace-nowrap truncate ${
                        config.handedness === 'left-joy'
                          ? 'bg-sky-500 text-slate-950 border-sky-300'
                          : 'bg-[#111C21] border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {t.leftJoy}
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange({ ...config, handedness: 'right-joy' })}
                      className={`py-1 px-1.5 rounded-md border text-[10px] font-bold cursor-pointer whitespace-nowrap truncate ${
                        config.handedness === 'right-joy'
                          ? 'bg-sky-500 text-slate-950 border-sky-300'
                          : 'bg-[#111C21] border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {t.rightJoy}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Sliders (Button Scale, Joystick Scale, Opacity) */}
            <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#0B1215] border border-white/10 space-y-3 min-w-0">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-200">{t.buttonScaleLabel}</span>
                  <span className="font-mono-num text-emerald-300">
                    {Math.round(config.buttonScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.45"
                  step="0.05"
                  value={config.buttonScale}
                  onChange={(e) =>
                    onChange({ ...config, buttonScale: Number(e.target.value) })
                  }
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-200">{t.joystickScaleLabel}</span>
                  <span className="font-mono-num text-sky-300">
                    {Math.round(config.joystickScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.45"
                  step="0.05"
                  value={config.joystickScale}
                  onChange={(e) =>
                    onChange({ ...config, joystickScale: Number(e.target.value) })
                  }
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-200">{t.joystickSensitivityLabel}</span>
                  <span className="font-mono-num text-violet-300">
                    {Math.round(config.joystickSensitivity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={config.joystickSensitivity}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      joystickSensitivity: Number(e.target.value),
                    })
                  }
                  className="w-full accent-violet-400 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-200">{t.diagonalToleranceLabel}</span>
                  <span className="font-mono-num text-cyan-300">
                    {Math.round(config.diagonalTolerance ?? 200)} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  step="10"
                  value={config.diagonalTolerance ?? 200}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      diagonalTolerance: Number(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 leading-snug">
                  {t.diagonalToleranceHint}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-200">{t.opacityLabel}</span>
                  <span className="font-mono-num text-amber-300">
                    {Math.round(config.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.35"
                  max="1.0"
                  step="0.05"
                  value={config.opacity}
                  onChange={(e) =>
                    onChange({ ...config, opacity: Number(e.target.value) })
                  }
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              <div className="pt-1.5 border-t border-white/10 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-200">
                  {t.switchBtnToggleLabel}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onChange({ ...config, showSwitchButton: true })}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                      config.showSwitchButton
                        ? 'bg-violet-500 text-white border-violet-300'
                        : 'bg-[#111C21] border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.switchBtnOn}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ ...config, showSwitchButton: false })}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold cursor-pointer ${
                      !config.showSwitchButton
                        ? 'bg-rose-500 text-white border-rose-300'
                        : 'bg-[#111C21] border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    {t.switchBtnOff}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
