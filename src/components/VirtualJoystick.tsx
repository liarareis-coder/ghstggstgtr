import React, { useRef, useState } from 'react';
import type { Team } from '../shared/gameEngine.ts';

interface VirtualJoystickProps {
  team: Team;
  label: string;
  keyHint?: string;
  externalVector?: { x: number; y: number };
  onChange: (vec: { x: number; y: number }) => void;
  size?: number;
  sensitivity?: number;
  floating?: boolean;
  hideLabel?: boolean;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  team,
  label,
  keyHint,
  externalVector,
  onChange,
  size = 112,
  sensitivity = 1,
  floating = false,
  hideLabel = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activePointerId = useRef<number | null>(null);
  const [stickPos, setStickPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const maxRadius = size * 0.34;
  const safeSens = Math.max(0.5, Math.min(2.0, sensitivity));

  const updateFromPointer = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const visualX = dist > 2 ? Math.cos(angle) * clampedDist : 0;
    const visualY = dist > 2 ? Math.sin(angle) * clampedDist : 0;
    setStickPos({ x: visualX, y: visualY });

    const deadzone = Math.max(2, 4 / Math.sqrt(safeSens));
    if (dist < deadzone) {
      onChange({ x: 0, y: 0 });
    } else {
      const norm = Math.min(1, (dist / maxRadius) * safeSens);
      onChange({
        x: Math.cos(angle) * norm,
        y: Math.sin(angle) * norm,
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    setIsDragging(true);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    e.preventDefault();
    updateFromPointer(e.clientX, e.clientY);
  };

  const releasePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    activePointerId.current = null;
    setIsDragging(false);
    setStickPos({ x: 0, y: 0 });
    onChange({ x: 0, y: 0 });
  };

  const displayX = isDragging
    ? stickPos.x
    : (externalVector?.x ?? 0) * maxRadius;
  const displayY = isDragging
    ? stickPos.y
    : (externalVector?.y ?? 0) * maxRadius;

  const isBlue = team === 'blue';
  const ringBorder = floating
    ? isBlue
      ? 'border-blue-400/55'
      : 'border-red-400/55'
    : isBlue
    ? 'border-blue-500/45'
    : 'border-red-500/45';
  const ringBg = floating
    ? 'bg-[#0B1215]/35 backdrop-blur-xs shadow-[0_6px_24px_rgba(0,0,0,0.38)]'
    : 'bg-[#111C21]/90';
  const puckStyle = isBlue
    ? floating
      ? 'bg-blue-600/80 border-blue-200/85 shadow-[0_4px_16px_rgba(37,99,235,0.45)]'
      : 'bg-blue-600 border-blue-300/80 shadow-[0_4px_16px_rgba(37,99,235,0.45)]'
    : floating
    ? 'bg-red-600/80 border-red-200/85 shadow-[0_4px_16px_rgba(220,38,38,0.45)]'
    : 'bg-red-600 border-red-300/80 shadow-[0_4px_16px_rgba(220,38,38,0.45)]';
  const activeGlow = isBlue ? 'bg-blue-500/20' : 'bg-red-500/20';

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div
        ref={containerRef}
        role="application"
        aria-label={`Joystick ${label}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={releasePointer}
        onPointerCancel={releasePointer}
        onLostPointerCapture={releasePointer}
        style={{ width: size, height: size }}
        className={`relative rounded-full border-2 ${ringBorder} ${ringBg} ${
          isDragging ? activeGlow : ''
        } touch-none cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors duration-150`}
      >
        {/* Crosshair ticks */}
        <div className="pointer-events-none absolute inset-3 rounded-full border border-white/15" />
        <div className="pointer-events-none absolute top-1.5 w-1 h-2 rounded-full bg-white/30" />
        <div className="pointer-events-none absolute bottom-1.5 w-1 h-2 rounded-full bg-white/30" />
        <div className="pointer-events-none absolute left-1.5 h-1 w-2 rounded-full bg-white/30" />
        <div className="pointer-events-none absolute right-1.5 h-1 w-2 rounded-full bg-white/30" />

        {/* Thumbstick puck */}
        <div
          style={{
            transform: `translate3d(${displayX}px, ${displayY}px, 0)`,
            width: size * 0.42,
            height: size * 0.42,
          }}
          className={`pointer-events-none rounded-full border-2 ${puckStyle} flex items-center justify-center ${
            isDragging ? '' : 'transition-transform duration-75 ease-out'
          }`}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-white/85" />
        </div>
      </div>

      {!hideLabel && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 whitespace-nowrap drop-shadow">
          <span>{label}</span>
          {keyHint && (
            <>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="font-mono-num text-[10px] text-slate-400">{keyHint}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
