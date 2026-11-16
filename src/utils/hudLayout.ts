export type HudControlId = 'joystick' | 'sprint' | 'dribble' | 'pass' | 'shoot' | 'switch';

export type HudLayoutMode = 'radial' | 'split';
export type HudHandedness = 'left-joy' | 'right-joy';

export interface HudOffset {
  x: number;
  y: number;
}

export interface HudConfig {
  layoutMode: HudLayoutMode;
  handedness: HudHandedness;
  showSwitchButton: boolean;
  buttonScale: number;
  joystickScale: number;
  joystickSensitivity: number;
  diagonalTolerance: number;
  opacity: number;
  offsets: Record<HudControlId, HudOffset>;
}

export const HUD_CONTROL_IDS: HudControlId[] = [
  'joystick',
  'sprint',
  'dribble',
  'pass',
  'shoot',
  'switch',
];

export function createDefaultHudConfig(): HudConfig {
  return {
    layoutMode: 'radial',
    handedness: 'left-joy',
    showSwitchButton: true,
    buttonScale: 1,
    joystickScale: 1,
    joystickSensitivity: 1,
    diagonalTolerance: 200,
    opacity: 0.9,
    offsets: {
      joystick: { x: 0, y: 0 },
      sprint: { x: 0, y: 0 },
      dribble: { x: 0, y: 0 },
      pass: { x: 0, y: 0 },
      shoot: { x: 0, y: 0 },
      switch: { x: 0, y: 0 },
    },
  };
}

function clampNum(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n * 100) / 100));
}

function clampOffset(raw: unknown): HudOffset {
  if (!raw || typeof raw !== 'object') return { x: 0, y: 0 };
  const rec = raw as Record<string, unknown>;
  return {
    x: Math.round(clampNum(rec.x, -150, 150, 0)),
    y: Math.round(clampNum(rec.y, -150, 150, 0)),
  };
}

export function sanitizeHudConfig(raw: unknown): HudConfig {
  const def = createDefaultHudConfig();
  if (!raw || typeof raw !== 'object') return def;
  const rec = raw as Record<string, unknown>;
  const rawOffsets =
    rec.offsets && typeof rec.offsets === 'object'
      ? (rec.offsets as Record<string, unknown>)
      : {};

  return {
    layoutMode: rec.layoutMode === 'split' ? 'split' : 'radial',
    handedness: rec.handedness === 'right-joy' ? 'right-joy' : 'left-joy',
    showSwitchButton: rec.showSwitchButton !== false,
    buttonScale: clampNum(rec.buttonScale, 0.75, 1.45, 1),
    joystickScale: clampNum(rec.joystickScale, 0.75, 1.45, 1),
    joystickSensitivity: clampNum(rec.joystickSensitivity, 0.5, 2.0, 1),
    diagonalTolerance: Math.round(clampNum(rec.diagonalTolerance, 0, 400, 200)),
    opacity: clampNum(rec.opacity, 0.35, 1, 0.9),
    offsets: {
      joystick: clampOffset(rawOffsets.joystick),
      sprint: clampOffset(rawOffsets.sprint),
      dribble: clampOffset(rawOffsets.dribble),
      pass: clampOffset(rawOffsets.pass),
      shoot: clampOffset(rawOffsets.shoot),
      switch: clampOffset(rawOffsets.switch),
    },
  };
}

export const HUD_PREVIEW_WIDTH = 640;
export const HUD_PREVIEW_HEIGHT = 360;

export interface ComputedControlPlacement {
  id: HudControlId;
  centerX: number; // distance from horizontal edge (left if anchor='left', right if anchor='right')
  anchor: 'left' | 'right';
  bottomY: number; // center distance from bottom (px above safe-area bottom)
  size: number;
}

function clampPlacement(
  p: ComputedControlPlacement,
  stageW = HUD_PREVIEW_WIDTH,
  stageH = HUD_PREVIEW_HEIGHT
): ComputedControlPlacement {
  const half = p.size / 2;
  const minCenterX = half + 6;
  const maxCenterX = stageW - half - 6;
  const minBottomY = half + 4;
  const maxBottomY = stageH - half - 18;
  return {
    ...p,
    centerX: Math.round(clampNum(p.centerX, minCenterX, maxCenterX, p.centerX)),
    bottomY: Math.round(clampNum(p.bottomY, minBottomY, maxBottomY, p.bottomY)),
  };
}

export function computeSinglePlayerHudPlacements(
  cfg: HudConfig,
  stageW = HUD_PREVIEW_WIDTH,
  stageH = HUD_PREVIEW_HEIGHT
): Record<HudControlId, ComputedControlPlacement> {
  const joySize = Math.round(92 * cfg.joystickScale);
  const btnSprintSize = Math.round(46 * cfg.buttonScale);
  const btnDribbleSize = Math.round(48 * cfg.buttonScale);
  const btnPassSize = Math.round(50 * cfg.buttonScale);
  const btnShootSize = Math.round(56 * cfg.buttonScale);
  const btnSwitchSize = Math.round(44 * cfg.buttonScale);

  const joyOnLeft = cfg.handedness === 'left-joy';
  const joyAnchor: 'left' | 'right' = joyOnLeft ? 'left' : 'right';
  const sign = joyOnLeft ? 1 : -1;

  if (cfg.layoutMode === 'split') {
    const btnAnchor: 'left' | 'right' = joyOnLeft ? 'right' : 'left';
    const bSign = btnAnchor === 'left' ? 1 : -1;

    // Joystick comfortably in bottom corner; 4 buttons in diamond cluster on opposite side
    const joyBaseX = 62;
    const joyBaseY = 62;

    const shootBaseX = 48;
    const shootBaseY = 56;
    const passBaseX = 110;
    const passBaseY = 44;
    const dribbleBaseX = 96;
    const dribbleBaseY = 104;
    const sprintBaseX = 42;
    const sprintBaseY = 118;
    const switchBaseX = 148;
    const switchBaseY = 96;

    return {
      joystick: clampPlacement(
        {
          id: 'joystick',
          anchor: joyAnchor,
          centerX: joyBaseX + cfg.offsets.joystick.x * sign,
          bottomY: joyBaseY - cfg.offsets.joystick.y,
          size: joySize,
        },
        stageW,
        stageH
      ),
      shoot: clampPlacement(
        {
          id: 'shoot',
          anchor: btnAnchor,
          centerX: shootBaseX + cfg.offsets.shoot.x * bSign,
          bottomY: shootBaseY - cfg.offsets.shoot.y,
          size: btnShootSize,
        },
        stageW,
        stageH
      ),
      pass: clampPlacement(
        {
          id: 'pass',
          anchor: btnAnchor,
          centerX: passBaseX + cfg.offsets.pass.x * bSign,
          bottomY: passBaseY - cfg.offsets.pass.y,
          size: btnPassSize,
        },
        stageW,
        stageH
      ),
      dribble: clampPlacement(
        {
          id: 'dribble',
          anchor: btnAnchor,
          centerX: dribbleBaseX + cfg.offsets.dribble.x * bSign,
          bottomY: dribbleBaseY - cfg.offsets.dribble.y,
          size: btnDribbleSize,
        },
        stageW,
        stageH
      ),
      sprint: clampPlacement(
        {
          id: 'sprint',
          anchor: btnAnchor,
          centerX: sprintBaseX + cfg.offsets.sprint.x * bSign,
          bottomY: sprintBaseY - cfg.offsets.sprint.y,
          size: btnSprintSize,
        },
        stageW,
        stageH
      ),
      switch: clampPlacement(
        {
          id: 'switch',
          anchor: btnAnchor,
          centerX: switchBaseX + cfg.offsets.switch.x * bSign,
          bottomY: switchBaseY - cfg.offsets.switch.y,
          size: btnSwitchSize,
        },
        stageW,
        stageH
      ),
    };
  }

  // Radial arc around the joystick (matches original ergonomics + custom offsets/scales)
  return {
    joystick: clampPlacement(
      {
        id: 'joystick',
        anchor: joyAnchor,
        centerX: 62 + cfg.offsets.joystick.x * sign,
        bottomY: 62 - cfg.offsets.joystick.y,
        size: joySize,
      },
      stageW,
      stageH
    ),
    sprint: clampPlacement(
      {
        id: 'sprint',
        anchor: joyAnchor,
        centerX: 65 + cfg.offsets.sprint.x * sign,
        bottomY: 156 - cfg.offsets.sprint.y,
        size: btnSprintSize,
      },
      stageW,
      stageH
    ),
    dribble: clampPlacement(
      {
        id: 'dribble',
        anchor: joyAnchor,
        centerX: 117 + cfg.offsets.dribble.x * sign,
        bottomY: 138 - cfg.offsets.dribble.y,
        size: btnDribbleSize,
      },
      stageW,
      stageH
    ),
    pass: clampPlacement(
      {
        id: 'pass',
        anchor: joyAnchor,
        centerX: 152 + cfg.offsets.pass.x * sign,
        bottomY: 100 - cfg.offsets.pass.y,
        size: btnPassSize,
      },
      stageW,
      stageH
    ),
    shoot: clampPlacement(
      {
        id: 'shoot',
        anchor: joyAnchor,
        centerX: 164 + cfg.offsets.shoot.x * sign,
        bottomY: 40 - cfg.offsets.shoot.y,
        size: btnShootSize,
      },
      stageW,
      stageH
    ),
    switch: clampPlacement(
      {
        id: 'switch',
        anchor: joyAnchor,
        centerX: 168 + cfg.offsets.switch.x * sign,
        bottomY: 160 - cfg.offsets.switch.y,
        size: btnSwitchSize,
      },
      stageW,
      stageH
    ),
  };
}

export interface TwoPlayerHudPlacements {
  p1: Record<HudControlId, ComputedControlPlacement>;
  p2: Record<HudControlId, ComputedControlPlacement>;
}

function clampHalfStagePlacement(
  p: ComputedControlPlacement,
  stageW: number,
  stageH: number
): ComputedControlPlacement {
  const half = p.size / 2;
  const minCenterX = half + 6;
  const maxCenterX = Math.max(minCenterX, stageW * 0.48 - half - 4);
  const minBottomY = half + 4;
  const maxBottomY = Math.max(minBottomY, stageH - half - 18);
  return {
    ...p,
    centerX: Math.round(clampNum(p.centerX, minCenterX, maxCenterX, p.centerX)),
    bottomY: Math.round(clampNum(p.bottomY, minBottomY, maxBottomY, p.bottomY)),
  };
}

export function computeTwoPlayerHudPlacements(
  cfg: HudConfig,
  stageW = HUD_PREVIEW_WIDTH,
  stageH = HUD_PREVIEW_HEIGHT
): TwoPlayerHudPlacements {
  const joySize = Math.round(68 * cfg.joystickScale);
  const btnSize = Math.round(44 * cfg.buttonScale);
  const switchSize = Math.round(40 * cfg.buttonScale);
  const p1Anchor: 'left' | 'right' = cfg.handedness === 'right-joy' ? 'right' : 'left';
  const p2Anchor: 'left' | 'right' = p1Anchor === 'left' ? 'right' : 'left';
  const sign = p1Anchor === 'left' ? 1 : -1;

  const p1: Record<HudControlId, ComputedControlPlacement> = {
    joystick: clampHalfStagePlacement(
      {
        id: 'joystick',
        anchor: p1Anchor,
        centerX: 46 + cfg.offsets.joystick.x * sign,
        bottomY: 46 - cfg.offsets.joystick.y,
        size: joySize,
      },
      stageW,
      stageH
    ),
    sprint: clampHalfStagePlacement(
      {
        id: 'sprint',
        anchor: p1Anchor,
        centerX: 34 + cfg.offsets.sprint.x * sign,
        bottomY: 124 - cfg.offsets.sprint.y,
        size: btnSize,
      },
      stageW,
      stageH
    ),
    dribble: clampHalfStagePlacement(
      {
        id: 'dribble',
        anchor: p1Anchor,
        centerX: 84 + cfg.offsets.dribble.x * sign,
        bottomY: 112 - cfg.offsets.dribble.y,
        size: btnSize,
      },
      stageW,
      stageH
    ),
    pass: clampHalfStagePlacement(
      {
        id: 'pass',
        anchor: p1Anchor,
        centerX: 118 + cfg.offsets.pass.x * sign,
        bottomY: 78 - cfg.offsets.pass.y,
        size: btnSize,
      },
      stageW,
      stageH
    ),
    shoot: clampHalfStagePlacement(
      {
        id: 'shoot',
        anchor: p1Anchor,
        centerX: 128 + cfg.offsets.shoot.x * sign,
        bottomY: 30 - cfg.offsets.shoot.y,
        size: btnSize,
      },
      stageW,
      stageH
    ),
    switch: clampHalfStagePlacement(
      {
        id: 'switch',
        anchor: p1Anchor,
        centerX: 136 + cfg.offsets.switch.x * sign,
        bottomY: 134 - cfg.offsets.switch.y,
        size: switchSize,
      },
      stageW,
      stageH
    ),
  };

  const p2: Record<HudControlId, ComputedControlPlacement> = {
    joystick: { ...p1.joystick, anchor: p2Anchor },
    sprint: { ...p1.sprint, anchor: p2Anchor },
    dribble: { ...p1.dribble, anchor: p2Anchor },
    pass: { ...p1.pass, anchor: p2Anchor },
    shoot: { ...p1.shoot, anchor: p2Anchor },
    switch: { ...p1.switch, anchor: p2Anchor },
  };

  return { p1, p2 };
}

