import React, { useRef, useState } from 'react';
import { ArrowLeftRight, CornerUpRight, Target, Wind, Zap } from 'lucide-react';
import type { Team } from '../shared/gameEngine.ts';

interface ActionButtonProps {
  variant: 'shoot' | 'dribble' | 'pass' | 'sprint' | 'switch';
  team: Team;
  label?: string;
  keyHint?: string;
  cooldownRatio?: number; // 0 = ready, 1 = full cooldown (dribble)
  chargeRatio?: number; // 0..1 shot charge
  exhausted?: boolean; // stamina exhausted (sprint)
  active?: boolean;
  onPressChange: (pressed: boolean) => void;
  size?: number;
  floating?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant,
  team,
  label: customLabel,
  keyHint,
  cooldownRatio = 0,
  chargeRatio = 0,
  exhausted = false,
  active = false,
  onPressChange,
  size = 76,
  floating = false,
}) => {
  const pointerIdRef = useRef<number | null>(null);
  const [pressed, setPressed] = useState(false);
  const [rippleCount, setRippleCount] = useState(0);

  const isShoot = variant === 'shoot';
  const isPass = variant === 'pass';
  const isDribble = variant === 'dribble';
  const isSprint = variant === 'sprint';
  const isSwitch = variant === 'switch';
  const isCoolingDown = isDribble && cooldownRatio > 0.02;
  const isEngaged = pressed || active;

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    setPressed(true);
    setRippleCount((c) => c + 1);
    onPressChange(true);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerIdRef.current !== e.pointerId) return;
    pointerIdRef.current = null;
    setPressed(false);
    onPressChange(false);
  };

  const label =
    customLabel ??
    (isShoot
      ? 'Chutar'
      : isPass
      ? 'Passar'
      : isSprint
      ? 'Correr'
      : isSwitch
      ? 'Trocar'
      : 'Driblar');

  const baseColor = floating
    ? isShoot
      ? team === 'blue'
        ? 'bg-blue-600/75 backdrop-blur-xs border-blue-200/75 text-white shadow-[0_6px_22px_rgba(37,99,235,0.42)]'
        : 'bg-red-600/75 backdrop-blur-xs border-red-200/75 text-white shadow-[0_6px_22px_rgba(220,38,38,0.42)]'
      : isPass
      ? 'bg-emerald-500/75 backdrop-blur-xs border-emerald-200/80 text-slate-950 shadow-[0_6px_20px_rgba(16,185,129,0.35)]'
      : isSprint
      ? exhausted
        ? 'bg-slate-800/75 backdrop-blur-xs border-slate-500/60 text-slate-300'
        : 'bg-sky-500/75 backdrop-blur-xs border-sky-200/80 text-slate-950 shadow-[0_6px_20px_rgba(14,165,233,0.35)]'
      : isSwitch
      ? 'bg-violet-500/75 backdrop-blur-xs border-violet-200/80 text-white shadow-[0_6px_20px_rgba(139,92,246,0.38)]'
      : isCoolingDown
      ? 'bg-slate-800/75 backdrop-blur-xs border-slate-500/60 text-slate-300'
      : 'bg-amber-500/75 backdrop-blur-xs border-amber-200/80 text-slate-950 shadow-[0_6px_20px_rgba(245,158,11,0.35)]'
    : isShoot
    ? team === 'blue'
      ? 'bg-blue-600 hover:bg-blue-500 border-blue-300/60 text-white shadow-[0_6px_20px_rgba(37,99,235,0.4)]'
      : 'bg-red-600 hover:bg-red-500 border-red-300/60 text-white shadow-[0_6px_20px_rgba(220,38,38,0.4)]'
    : isPass
    ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-200/70 text-slate-950 shadow-[0_6px_20px_rgba(16,185,129,0.35)]'
    : isSprint
    ? exhausted
      ? 'bg-slate-800 border-slate-600/60 text-slate-400'
      : 'bg-sky-500 hover:bg-sky-400 border-sky-200/70 text-slate-950 shadow-[0_6px_20px_rgba(14,165,233,0.35)]'
    : isSwitch
    ? 'bg-violet-500 hover:bg-violet-400 border-violet-200/70 text-white shadow-[0_6px_20px_rgba(139,92,246,0.35)]'
    : isCoolingDown
    ? 'bg-slate-800 border-slate-600/60 text-slate-400'
    : 'bg-amber-500 hover:bg-amber-400 border-amber-200/70 text-slate-950 shadow-[0_6px_20px_rgba(245,158,11,0.35)]';

  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const cdDashOffset = circumference * (1 - Math.min(1, Math.max(0, cooldownRatio)));
  const chargeDashOffset = circumference * (1 - Math.min(1, Math.max(0, chargeRatio)));

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <button
        type="button"
        aria-label={label}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onLostPointerCapture={handlePointerUp}
        style={{ width: size, height: size }}
        className={`btn-game-action relative rounded-full border-2 flex flex-col items-center justify-center gap-0.5 touch-none transition-[transform,filter,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer ${baseColor} ${
          isEngaged
            ? 'scale-[0.88] brightness-125'
            : 'scale-100 hover:scale-[1.07] hover:brightness-110 active:scale-[0.88] active:brightness-125'
        }`}
      >
        {rippleCount > 0 && (
          <span
            key={rippleCount}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-white/75 animate-btn-ripple"
          />
        )}
        {isDribble && isCoolingDown && (
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="pointer-events-none absolute inset-0 -rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(245,158,11,0.75)"
              strokeWidth={3}
              strokeDasharray={circumference}
              strokeDashoffset={cdDashOffset}
              strokeLinecap="round"
            />
          </svg>
        )}
        {isShoot && chargeRatio > 0.01 && (
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="pointer-events-none absolute inset-0 -rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={chargeRatio > 0.78 ? '#EF4444' : chargeRatio > 0.45 ? '#F59E0B' : '#34D399'}
              strokeWidth={4}
              strokeDasharray={circumference}
              strokeDashoffset={chargeDashOffset}
              strokeLinecap="round"
            />
          </svg>
        )}
        {isShoot ? (
          <Target className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" strokeWidth={2.4} />
        ) : isPass ? (
          <CornerUpRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" strokeWidth={2.4} />
        ) : isSprint ? (
          <Wind className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" strokeWidth={2.4} />
        ) : isSwitch ? (
          <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" strokeWidth={2.4} />
        ) : (
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" strokeWidth={2.4} />
        )}
        <span className="text-[10px] sm:text-[11px] font-bold tracking-tight leading-none whitespace-nowrap">
          {label}
        </span>
      </button>
      {keyHint && !floating && (
        <span className="font-mono-num text-[10px] text-slate-400 whitespace-nowrap">
          {keyHint}
        </span>
      )}
    </div>
  );
};
