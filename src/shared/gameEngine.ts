import {
  createDefaultCharacterConfig,
  type CharacterConfig,
} from './character.ts';
import { getSkillById, type SkillId } from './skills.ts';

export type Team = 'blue' | 'red';
export type GameMode = '1p' | '2p' | 'training' | 'online';
export type TeamSize = 1 | 2 | 4 | 8 | 16;
export type PlayerRole = 'GK' | 'DEF' | 'LAT' | 'MID' | 'FWD';
export type MatchPhase = 'KICKOFF' | 'PLAYING' | 'GOAL' | 'OVERTIME' | 'FINISHED';
export type MatchWinner = Team | 'draw' | null;

export interface EmoteOption {
  id: string;
  emoji: string;
  label: string;
}

export const EMOTE_OPTIONS: EmoteOption[] = [
  { id: 'gol', emoji: '⚽', label: 'Golaço!' },
  { id: 'fogo', emoji: '🔥', label: 'Voando!' },
  { id: 'aplauso', emoji: '👏', label: 'Boa!' },
  { id: 'risos', emoji: '😂', label: 'Haha!' },
  { id: 'trofeu', emoji: '🏆', label: 'GG!' },
];

export interface ActiveEmote {
  uid: string;
  playerId: string;
  senderName: string;
  team: Team;
  emoji: string;
  label: string;
  createdAt: number;
}

export interface PlayerInput {
  moveX: number;
  moveY: number;
  shoot: boolean;
  dribble: boolean;
  pass: boolean;
  sprint: boolean;
  switchPlayer?: boolean;
  skill1?: boolean;
  skill2?: boolean;
  diagonalToleranceMs?: number;
}

export interface PlayerState {
  id: string;
  name: string;
  baseName: string;
  team: Team;
  number: number;
  role: PlayerRole;
  isGoalkeeper: boolean;
  isAI: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingAngle: number;
  aimX: number;
  aimY: number;
  dribbleTimer: number;
  dribbleCooldown: number;
  lungeTimer: number;
  pickupLockout: number;
  stealImmunity: number;
  gkHoldTimer: number;
  stamina: number;
  staminaExhausted: boolean;
  isSprinting: boolean;
  shootCharge: number;
  isChargingShoot: boolean;
  prevShoot: boolean;
  prevDribble: boolean;
  prevPass: boolean;
  prevSwitchPlayer: boolean;
  prevSkill1: boolean;
  prevSkill2: boolean;
  equippedSkills: SkillId[];
  skillCooldowns: [number, number];
  activeSkill: SkillId | null;
  activeSkillTimer: number;
  diagGraceTimer?: number;
  diagGraceX?: number;
  diagGraceY?: number;
  appearance?: CharacterConfig;
}

export interface MatchParticipantStat {
  id: string;
  name: string;
  team: Team;
  number: number;
  role: PlayerRole;
  isHuman: boolean;
  goals: number;
  assists: number;
  steals: number;
  passes: number;
  saves: number;
  shots: number;
}

export interface MultiplayerMvpParticipant extends MatchParticipantStat {
  mvpScore: number;
  appearance?: CharacterConfig;
}

export interface MultiplayerMvpSummary {
  mvp: MultiplayerMvpParticipant;
  winners: MultiplayerMvpParticipant[];
  allParticipants: MultiplayerMvpParticipant[];
}

export interface BallState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  possessorId: string | null;
  lastTouchTeam: Team | null;
  lastTouchPlayerKey?: string | null;
  prevTouchPlayerKey?: string | null;
  spin: number;
  curveSpin: number;
  accelBoost: number;
  shotSkillTag: SkillId | null;
}

export type SkillFieldObject =
  | {
      kind: 'wall';
      id: string;
      ownerId: string;
      team: Team;
      x: number;
      y: number;
      nx: number;
      ny: number;
      halfLen: number;
      ttl: number;
      maxTtl: number;
    }
  | {
      kind: 'clone';
      id: string;
      ownerId: string;
      team: Team;
      number: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      ttl: number;
      maxTtl: number;
      appearance?: CharacterConfig;
    };

export type GameEventType =
  | 'kick'
  | 'pass'
  | 'dribble'
  | 'steal'
  | 'post'
  | 'goal'
  | 'whistle'
  | 'overtime'
  | 'skill';

export interface GameEvent {
  type: GameEventType;
  x?: number;
  y?: number;
  team?: Team;
  scorerName?: string;
  ownGoal?: boolean;
  skillId?: SkillId;
}

export interface GameState {
  mode: GameMode;
  teamSize: TeamSize;
  phase: MatchPhase;
  phaseTimer: number;
  timeRemaining: number;
  overtimeCount: number;
  score: {
    blue: number;
    red: number;
  };
  lastScorerTeam: Team | null;
  lastScorerName: string | null;
  lastGoalOwnGoal?: boolean;
  winner: MatchWinner;
  humanSlots: string[];
  humanNames: Record<string, string>;
  controlMap: Record<string, string>;
  players: PlayerState[];
  ball: BallState;
  skillObjects: SkillFieldObject[];
  events: GameEvent[];
  matchStats?: Record<string, MatchParticipantStat>;
  tick: number;
}

export const VIEW_WIDTH = 1000;
export const VIEW_HEIGHT = 560;

export const BASE_WORLD_WIDTH = 2000;
export const BASE_WORLD_HEIGHT = 1120;
export const BASE_PITCH_LEFT = 80;
export const BASE_PITCH_RIGHT = 1920;
export const BASE_PITCH_TOP = 60;
export const BASE_PITCH_BOTTOM = 1060;
export const BASE_PITCH_CENTER_X = 1000;
export const BASE_PITCH_CENTER_Y = 560;

export const TRADITIONAL_PITCH_SCALE = 1.4;

export const WORLD_WIDTH = Math.round(BASE_WORLD_WIDTH * TRADITIONAL_PITCH_SCALE);
export const WORLD_HEIGHT = Math.round(BASE_WORLD_HEIGHT * TRADITIONAL_PITCH_SCALE);
export const PITCH_LEFT = Math.round(BASE_PITCH_LEFT * TRADITIONAL_PITCH_SCALE);
export const PITCH_RIGHT = Math.round(BASE_PITCH_RIGHT * TRADITIONAL_PITCH_SCALE);
export const PITCH_TOP = Math.round(BASE_PITCH_TOP * TRADITIONAL_PITCH_SCALE);
export const PITCH_BOTTOM = Math.round(BASE_PITCH_BOTTOM * TRADITIONAL_PITCH_SCALE);
export const PITCH_CENTER_X = Math.round(BASE_PITCH_CENTER_X * TRADITIONAL_PITCH_SCALE);
export const PITCH_CENTER_Y = Math.round(BASE_PITCH_CENTER_Y * TRADITIONAL_PITCH_SCALE);

export const GOAL_HALF_HEIGHT = 126;
export const GOAL_TOP = PITCH_CENTER_Y - GOAL_HALF_HEIGHT;
export const GOAL_BOTTOM = PITCH_CENTER_Y + GOAL_HALF_HEIGHT;
export const GOAL_DEPTH = 48;
export const GOAL_POST_RADIUS = 8;

export interface PitchBounds {
  worldWidth: number;
  worldHeight: number;
  pitchLeft: number;
  pitchRight: number;
  pitchTop: number;
  pitchBottom: number;
  pitchWidth: number;
  pitchHeight: number;
  centerX: number;
  centerY: number;
  goalHalfHeight: number;
  goalTop: number;
  goalBottom: number;
  scale: number;
}

export function getPitchBounds(teamSize: TeamSize): PitchBounds {
  const isLarge = teamSize === 16;
  const scale = isLarge ? 2 : TRADITIONAL_PITCH_SCALE;
  const worldWidth = Math.round(BASE_WORLD_WIDTH * scale);
  const worldHeight = Math.round(BASE_WORLD_HEIGHT * scale);
  const pitchLeft = Math.round(BASE_PITCH_LEFT * scale);
  const pitchRight = Math.round(BASE_PITCH_RIGHT * scale);
  const pitchTop = Math.round(BASE_PITCH_TOP * scale);
  const pitchBottom = Math.round(BASE_PITCH_BOTTOM * scale);
  const centerX = Math.round(BASE_PITCH_CENTER_X * scale);
  const centerY = Math.round(BASE_PITCH_CENTER_Y * scale);
  const goalHalfHeight = isLarge ? 148 : GOAL_HALF_HEIGHT;
  return {
    worldWidth,
    worldHeight,
    pitchLeft,
    pitchRight,
    pitchTop,
    pitchBottom,
    pitchWidth: pitchRight - pitchLeft,
    pitchHeight: pitchBottom - pitchTop,
    centerX,
    centerY,
    goalHalfHeight,
    goalTop: centerY - goalHalfHeight,
    goalBottom: centerY + goalHalfHeight,
    scale,
  };
}

export function parseTeamSize(val: unknown): TeamSize {
  if (val === 16) return 16;
  if (val === 8) return 8;
  if (val === 4) return 4;
  if (val === 2) return 2;
  return 1;
}

export const PLAYER_RADIUS = 19;
export const BALL_RADIUS = 12;

export const BASE_PLAYER_SPEED = 310;
export const SPRINT_SPEED_MULTIPLIER = 1.38;
export const CARRIER_SPEED_FACTOR = 0.93;
export const DRIBBLE_SPEED = 490;
export const DRIBBLE_DURATION = 0.32;
export const DRIBBLE_COOLDOWN = 1.6;
export const LUNGE_SPEED = 450;
export const LUNGE_DURATION = 0.16;

export const MAX_STAMINA = 100;
export const STAMINA_DRAIN_PER_SEC = 34;
export const STAMINA_REGEN_IDLE_PER_SEC = 26;
export const STAMINA_REGEN_MOVING_PER_SEC = 18;
export const STAMINA_RECOVERY_THRESHOLD = 20;

export const KICK_SPEED = 860;
export const MIN_KICK_SPEED = 560;
export const MAX_KICK_SPEED = 1140;
export const DRIBBLE_KICK_BONUS = 90;
export const SHOOT_CHARGE_RATE = 1.45;
export const PASS_SPEED = 640;
export const BALL_FRICTION = 1.9;
export const MATCH_DURATION_SECONDS = 180;
export const OVERTIME_DURATION_SECONDS = 30;
export const MAX_OVERTIMES = 3;
export const GOAL_CELEBRATION_SECONDS = 2.3;
export const GOALKEEPER_HOLD_SECONDS = 0.5;

export const EMPTY_INPUT: PlayerInput = {
  moveX: 0,
  moveY: 0,
  shoot: false,
  dribble: false,
  pass: false,
  sprint: false,
  switchPlayer: false,
  skill1: false,
  skill2: false,
};

export interface DevHacksConfig {
  enabled: boolean;
  playerSpeedMultiplier: number;
  kickPowerMultiplier: number;
  ballFrictionMultiplier: number;
  infiniteStamina: boolean;
  noDribbleCooldown: boolean;
  freezeClock: boolean;
  freezeEnemyAI: boolean;
  ballMagnet: boolean;
  gkAlwaysThrow: boolean;
  devSlot?: string | null;
}

export const DEFAULT_DEV_HACKS: DevHacksConfig = {
  enabled: false,
  playerSpeedMultiplier: 1,
  kickPowerMultiplier: 1,
  ballFrictionMultiplier: 1,
  infiniteStamina: false,
  noDribbleCooldown: false,
  freezeClock: false,
  freezeEnemyAI: false,
  ballMagnet: false,
  gkAlwaysThrow: false,
};

const RANDOM_PARTNER_POOL = [
  'Gabriel',
  'Matheus',
  'Rafael',
  'Bruno',
  'Thiago',
  'Felipe',
  'Gustavo',
  'Pedro',
  'Vitor',
  'Diego',
  'Cauã',
  'Léo',
  'Danilo',
  'Igor',
  'Murilo',
  'Henrique',
  'Caio',
  'André',
  'Renan',
  'Lucas',
  'Vinícius',
  'Rodrigo',
  'Eduardo',
  'Marcos',
  'Leandro',
  'Samuel',
  'Bernardo',
  'Davi',
  'Enzo',
  'Heitor',
  'Arthur',
  'Joaquim',
  'Otávio',
  'Breno',
  'Yuri',
  'Kaio',
];

function drawRandomNames(count: number): string[] {
  const pool = [...RANDOM_PARTNER_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pool[i];
    pool[i] = pool[j];
    pool[j] = tmp;
  }
  return pool.slice(0, count);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function hypot(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy);
}

export interface CreateGameOptions {
  mode: GameMode;
  teamSize: TeamSize;
  blueName?: string;
  redName?: string;
  slotNames?: Record<string, string>;
  humanSlots?: string[];
  slotAppearances?: Record<string, CharacterConfig>;
  slotSkills?: Record<string, SkillId[]>;
}

function makePlayer(
  id: string,
  baseName: string,
  team: Team,
  number: number,
  isAI: boolean,
  x: number,
  y: number,
  role: PlayerRole = 'MID',
  appearance?: CharacterConfig,
  equippedSkills: SkillId[] = []
): PlayerState {
  const facing = team === 'blue' ? 0 : Math.PI;
  return {
    id,
    name: baseName,
    baseName,
    team,
    number: appearance?.jerseyNumber ?? number,
    role,
    isGoalkeeper: role === 'GK',
    isAI,
    x,
    y,
    vx: 0,
    vy: 0,
    facingAngle: facing,
    aimX: Math.cos(facing),
    aimY: Math.sin(facing),
    dribbleTimer: 0,
    dribbleCooldown: 0,
    lungeTimer: 0,
    pickupLockout: 0,
    stealImmunity: 0,
    gkHoldTimer: 0,
    stamina: MAX_STAMINA,
    staminaExhausted: false,
    isSprinting: false,
    shootCharge: 0,
    isChargingShoot: false,
    prevShoot: false,
    prevDribble: false,
    prevPass: false,
    prevSwitchPlayer: false,
    prevSkill1: false,
    prevSkill2: false,
    equippedSkills: equippedSkills.slice(0, 2),
    skillCooldowns: [0, 0],
    activeSkill: null,
    activeSkillTimer: 0,
    diagGraceTimer: 0,
    diagGraceX: 0,
    diagGraceY: 0,
    appearance: appearance ? { ...appearance } : undefined,
  };
}

function resolveDefaultHumanSlots(mode: GameMode, explicit?: string[]): string[] {
  if (explicit && explicit.length > 0) return [...explicit];
  if (mode === '2p') return ['blue-1', 'red-1'];
  return ['blue-1'];
}

function createPlayersForKickoff(
  mode: GameMode,
  teamSize: TeamSize,
  slotNames?: Record<string, string>,
  humanSlots?: string[],
  existingBaseNames?: Record<string, string>
): PlayerState[] {
  const players: PlayerState[] = [];
  const bounds = getPitchBounds(teamSize);
  const activeHumans = resolveDefaultHumanSlots(mode, humanSlots);
  const isHuman = (id: string) => activeHumans.includes(id);

  const randomNames = drawRandomNames(Math.max(18, teamSize * 2));
  let rndIdx = 0;
  const pickBaseName = (id: string) => {
    if (existingBaseNames?.[id]) return existingBaseNames[id];
    if (slotNames?.[id] && (isHuman(id) || id === 'red-1')) return slotNames[id];
    return randomNames[rndIdx++ % randomNames.length];
  };

  // Blue Team Formation
  if (teamSize === 1) {
    players.push(
      makePlayer('blue-1', pickBaseName('blue-1'), 'blue', 10, !isHuman('blue-1'), bounds.centerX - 280, bounds.centerY, 'FWD')
    );
  } else if (teamSize === 2) {
    players.push(
      makePlayer('blue-1', pickBaseName('blue-1'), 'blue', 10, !isHuman('blue-1'), bounds.centerX - 245, bounds.centerY - 150, 'FWD'),
      makePlayer('blue-2', pickBaseName('blue-2'), 'blue', 5, !isHuman('blue-2'), bounds.centerX - 585, bounds.centerY + 170, 'GK')
    );
  } else if (teamSize === 4) {
    players.push(
      makePlayer('blue-1', pickBaseName('blue-1'), 'blue', 10, !isHuman('blue-1'), bounds.centerX - 230, bounds.centerY, 'FWD'),
      makePlayer('blue-2', pickBaseName('blue-2'), 'blue', 7, !isHuman('blue-2'), bounds.centerX - 500, bounds.centerY - 320, 'LAT'),
      makePlayer('blue-3', pickBaseName('blue-3'), 'blue', 8, !isHuman('blue-3'), bounds.centerX - 500, bounds.centerY + 320, 'LAT'),
      makePlayer('blue-4', pickBaseName('blue-4'), 'blue', 1, !isHuman('blue-4'), bounds.pitchLeft + 250, bounds.centerY, 'GK')
    );
  } else if (teamSize === 8) {
    // 8v8: 2 Atacantes (FWD), 1 Meio de Campo (MID), 2 Laterais (LAT), 2 Zagueiros (DEF), 1 Goleiro (GK)
    players.push(
      makePlayer('blue-1', pickBaseName('blue-1'), 'blue', 9, !isHuman('blue-1'), bounds.centerX - 225, bounds.centerY - 175, 'FWD'),
      makePlayer('blue-2', pickBaseName('blue-2'), 'blue', 11, !isHuman('blue-2'), bounds.centerX - 225, bounds.centerY + 175, 'FWD'),
      makePlayer('blue-3', pickBaseName('blue-3'), 'blue', 10, !isHuman('blue-3'), bounds.centerX - 475, bounds.centerY, 'MID'),
      makePlayer('blue-4', pickBaseName('blue-4'), 'blue', 2, !isHuman('blue-4'), bounds.centerX - 710, bounds.centerY - 440, 'LAT'),
      makePlayer('blue-5', pickBaseName('blue-5'), 'blue', 6, !isHuman('blue-5'), bounds.centerX - 710, bounds.centerY + 440, 'LAT'),
      makePlayer('blue-6', pickBaseName('blue-6'), 'blue', 3, !isHuman('blue-6'), bounds.pitchLeft + 355, bounds.centerY - 195, 'DEF'),
      makePlayer('blue-7', pickBaseName('blue-7'), 'blue', 4, !isHuman('blue-7'), bounds.pitchLeft + 355, bounds.centerY + 195, 'DEF'),
      makePlayer('blue-8', pickBaseName('blue-8'), 'blue', 1, !isHuman('blue-8'), bounds.pitchLeft + 68, bounds.centerY, 'GK')
    );
  } else {
    // 16v16 (Campo 2x maior): 3 Atacantes (FWD), 4 Meias (MID), 4 Laterais/Alas (LAT), 4 Zagueiros (DEF), 1 Goleiro (GK)
    players.push(
      makePlayer('blue-1', pickBaseName('blue-1'), 'blue', 9, !isHuman('blue-1'), bounds.centerX - 185, bounds.centerY, 'FWD'),
      makePlayer('blue-2', pickBaseName('blue-2'), 'blue', 11, !isHuman('blue-2'), bounds.centerX - 245, bounds.centerY - 410, 'FWD'),
      makePlayer('blue-3', pickBaseName('blue-3'), 'blue', 7, !isHuman('blue-3'), bounds.centerX - 245, bounds.centerY + 410, 'FWD'),
      makePlayer('blue-4', pickBaseName('blue-4'), 'blue', 10, !isHuman('blue-4'), bounds.centerX - 520, bounds.centerY - 210, 'MID'),
      makePlayer('blue-5', pickBaseName('blue-5'), 'blue', 8, !isHuman('blue-5'), bounds.centerX - 520, bounds.centerY + 210, 'MID'),
      makePlayer('blue-6', pickBaseName('blue-6'), 'blue', 5, !isHuman('blue-6'), bounds.centerX - 800, bounds.centerY - 450, 'MID'),
      makePlayer('blue-7', pickBaseName('blue-7'), 'blue', 14, !isHuman('blue-7'), bounds.centerX - 800, bounds.centerY + 450, 'MID'),
      makePlayer('blue-8', pickBaseName('blue-8'), 'blue', 2, !isHuman('blue-8'), bounds.centerX - 660, bounds.centerY - 780, 'LAT'),
      makePlayer('blue-9', pickBaseName('blue-9'), 'blue', 6, !isHuman('blue-9'), bounds.centerX - 660, bounds.centerY + 780, 'LAT'),
      makePlayer('blue-10', pickBaseName('blue-10'), 'blue', 12, !isHuman('blue-10'), bounds.centerX - 1140, bounds.centerY - 740, 'LAT'),
      makePlayer('blue-11', pickBaseName('blue-11'), 'blue', 13, !isHuman('blue-11'), bounds.centerX - 1140, bounds.centerY + 740, 'LAT'),
      makePlayer('blue-12', pickBaseName('blue-12'), 'blue', 3, !isHuman('blue-12'), bounds.pitchLeft + 460, bounds.centerY - 480, 'DEF'),
      makePlayer('blue-13', pickBaseName('blue-13'), 'blue', 4, !isHuman('blue-13'), bounds.pitchLeft + 460, bounds.centerY - 165, 'DEF'),
      makePlayer('blue-14', pickBaseName('blue-14'), 'blue', 15, !isHuman('blue-14'), bounds.pitchLeft + 460, bounds.centerY + 165, 'DEF'),
      makePlayer('blue-15', pickBaseName('blue-15'), 'blue', 16, !isHuman('blue-15'), bounds.pitchLeft + 460, bounds.centerY + 480, 'DEF'),
      makePlayer('blue-16', pickBaseName('blue-16'), 'blue', 1, !isHuman('blue-16'), bounds.pitchLeft + 74, bounds.centerY, 'GK')
    );
  }

  // Red Team Formation
  if (teamSize === 1) {
    players.push(
      makePlayer('red-1', pickBaseName('red-1'), 'red', 9, !isHuman('red-1'), bounds.centerX + 280, bounds.centerY, 'FWD')
    );
  } else if (teamSize === 2) {
    players.push(
      makePlayer('red-1', pickBaseName('red-1'), 'red', 9, !isHuman('red-1'), bounds.centerX + 245, bounds.centerY + 150, 'FWD'),
      makePlayer('red-2', pickBaseName('red-2'), 'red', 4, !isHuman('red-2'), bounds.centerX + 585, bounds.centerY - 170, 'GK')
    );
  } else if (teamSize === 4) {
    players.push(
      makePlayer('red-1', pickBaseName('red-1'), 'red', 9, !isHuman('red-1'), bounds.centerX + 230, bounds.centerY, 'FWD'),
      makePlayer('red-2', pickBaseName('red-2'), 'red', 11, !isHuman('red-2'), bounds.centerX + 500, bounds.centerY + 320, 'LAT'),
      makePlayer('red-3', pickBaseName('red-3'), 'red', 6, !isHuman('red-3'), bounds.centerX + 500, bounds.centerY - 320, 'LAT'),
      makePlayer('red-4', pickBaseName('red-4'), 'red', 1, !isHuman('red-4'), bounds.pitchRight - 250, bounds.centerY, 'GK')
    );
  } else if (teamSize === 8) {
    // 8v8: 2 Atacantes (FWD), 1 Meio de Campo (MID), 2 Laterais (LAT), 2 Zagueiros (DEF), 1 Goleiro (GK)
    players.push(
      makePlayer('red-1', pickBaseName('red-1'), 'red', 9, !isHuman('red-1'), bounds.centerX + 225, bounds.centerY + 175, 'FWD'),
      makePlayer('red-2', pickBaseName('red-2'), 'red', 11, !isHuman('red-2'), bounds.centerX + 225, bounds.centerY - 175, 'FWD'),
      makePlayer('red-3', pickBaseName('red-3'), 'red', 10, !isHuman('red-3'), bounds.centerX + 475, bounds.centerY, 'MID'),
      makePlayer('red-4', pickBaseName('red-4'), 'red', 2, !isHuman('red-4'), bounds.centerX + 710, bounds.centerY + 440, 'LAT'),
      makePlayer('red-5', pickBaseName('red-5'), 'red', 6, !isHuman('red-5'), bounds.centerX + 710, bounds.centerY - 440, 'LAT'),
      makePlayer('red-6', pickBaseName('red-6'), 'red', 3, !isHuman('red-6'), bounds.pitchRight - 355, bounds.centerY + 195, 'DEF'),
      makePlayer('red-7', pickBaseName('red-7'), 'red', 4, !isHuman('red-7'), bounds.pitchRight - 355, bounds.centerY - 195, 'DEF'),
      makePlayer('red-8', pickBaseName('red-8'), 'red', 1, !isHuman('red-8'), bounds.pitchRight - 68, bounds.centerY, 'GK')
    );
  } else {
    // 16v16 (Campo 2x maior)
    players.push(
      makePlayer('red-1', pickBaseName('red-1'), 'red', 9, !isHuman('red-1'), bounds.centerX + 185, bounds.centerY, 'FWD'),
      makePlayer('red-2', pickBaseName('red-2'), 'red', 11, !isHuman('red-2'), bounds.centerX + 245, bounds.centerY + 410, 'FWD'),
      makePlayer('red-3', pickBaseName('red-3'), 'red', 7, !isHuman('red-3'), bounds.centerX + 245, bounds.centerY - 410, 'FWD'),
      makePlayer('red-4', pickBaseName('red-4'), 'red', 10, !isHuman('red-4'), bounds.centerX + 520, bounds.centerY + 210, 'MID'),
      makePlayer('red-5', pickBaseName('red-5'), 'red', 8, !isHuman('red-5'), bounds.centerX + 520, bounds.centerY - 210, 'MID'),
      makePlayer('red-6', pickBaseName('red-6'), 'red', 5, !isHuman('red-6'), bounds.centerX + 800, bounds.centerY + 450, 'MID'),
      makePlayer('red-7', pickBaseName('red-7'), 'red', 14, !isHuman('red-7'), bounds.centerX + 800, bounds.centerY - 450, 'MID'),
      makePlayer('red-8', pickBaseName('red-8'), 'red', 2, !isHuman('red-8'), bounds.centerX + 660, bounds.centerY + 780, 'LAT'),
      makePlayer('red-9', pickBaseName('red-9'), 'red', 6, !isHuman('red-9'), bounds.centerX + 660, bounds.centerY - 780, 'LAT'),
      makePlayer('red-10', pickBaseName('red-10'), 'red', 12, !isHuman('red-10'), bounds.centerX + 1140, bounds.centerY + 740, 'LAT'),
      makePlayer('red-11', pickBaseName('red-11'), 'red', 13, !isHuman('red-11'), bounds.centerX + 1140, bounds.centerY - 740, 'LAT'),
      makePlayer('red-12', pickBaseName('red-12'), 'red', 3, !isHuman('red-12'), bounds.pitchRight - 460, bounds.centerY + 480, 'DEF'),
      makePlayer('red-13', pickBaseName('red-13'), 'red', 4, !isHuman('red-13'), bounds.pitchRight - 460, bounds.centerY + 165, 'DEF'),
      makePlayer('red-14', pickBaseName('red-14'), 'red', 15, !isHuman('red-14'), bounds.pitchRight - 460, bounds.centerY - 165, 'DEF'),
      makePlayer('red-15', pickBaseName('red-15'), 'red', 16, !isHuman('red-15'), bounds.pitchRight - 460, bounds.centerY - 480, 'DEF'),
      makePlayer('red-16', pickBaseName('red-16'), 'red', 1, !isHuman('red-16'), bounds.pitchRight - 74, bounds.centerY, 'GK')
    );
  }

  return players;
}

function buildInitialControlMap(humanSlots: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const slot of humanSlots) {
    map[slot] = slot;
  }
  return map;
}

export function syncPlayerControlRoles(state: GameState): void {
  const playerToBase = new Map<string, string>();
  for (const [baseSlot, pid] of Object.entries(state.controlMap)) {
    playerToBase.set(pid, baseSlot);
  }

  for (const p of state.players) {
    const ownerBase = playerToBase.get(p.id);
    if (ownerBase) {
      p.isAI = false;
      p.name = state.humanNames[ownerBase] || p.baseName;
    } else {
      p.isAI = true;
      p.name = p.baseName;
    }
  }
}

function switchHumanSlotToPlayer(
  state: GameState,
  baseHumanSlot: string,
  targetPlayer: PlayerState
): void {
  const previousPlayerId = state.controlMap[baseHumanSlot];
  if (previousPlayerId === targetPlayer.id) return;

  const previousPlayer = state.players.find((p) => p.id === previousPlayerId);
  if (previousPlayer) {
    targetPlayer.prevShoot = previousPlayer.prevShoot;
    targetPlayer.prevDribble = previousPlayer.prevDribble;
    targetPlayer.prevPass = previousPlayer.prevPass;
    targetPlayer.prevSwitchPlayer = previousPlayer.prevSwitchPlayer;
    targetPlayer.prevSkill1 = previousPlayer.prevSkill1;
    targetPlayer.prevSkill2 = previousPlayer.prevSkill2;
    targetPlayer.equippedSkills = [...previousPlayer.equippedSkills];
    targetPlayer.skillCooldowns = [...previousPlayer.skillCooldowns] as [number, number];
    targetPlayer.activeSkill = previousPlayer.activeSkill;
    targetPlayer.activeSkillTimer = previousPlayer.activeSkillTimer;
    if (previousPlayer.appearance) {
      targetPlayer.appearance = { ...previousPlayer.appearance };
      targetPlayer.number = previousPlayer.appearance.jerseyNumber;
    }
    previousPlayer.isChargingShoot = false;
    previousPlayer.shootCharge = 0;
    previousPlayer.isSprinting = false;
    previousPlayer.equippedSkills = [];
    previousPlayer.activeSkill = null;
    previousPlayer.activeSkillTimer = 0;
  }
  state.controlMap[baseHumanSlot] = targetPlayer.id;
  syncPlayerControlRoles(state);
}

function ensureCarrierHumanControl(state: GameState): void {
  const possessorId = state.ball.possessorId;
  if (!possessorId) return;

  const carrier = state.players.find((p) => p.id === possessorId);
  if (!carrier) return;

  if (carrier.isGoalkeeper && carrier.gkHoldTimer > 0 && carrier.isAI) {
    return;
  }

  const controlledSet = new Set(Object.values(state.controlMap));
  if (controlledSet.has(carrier.id)) {
    return;
  }

  const teamHumanBases = state.humanSlots.filter((h) => h.startsWith(carrier.team));
  if (teamHumanBases.length === 0) return;

  let chosenBase = teamHumanBases[0];
  let bestDist = Infinity;
  for (const h of teamHumanBases) {
    const cur = state.players.find((p) => p.id === (state.controlMap[h] ?? h));
    if (!cur) continue;
    const d = hypot(cur.x - carrier.x, cur.y - carrier.y);
    if (d < bestDist) {
      bestDist = d;
      chosenBase = h;
    }
  }

  switchHumanSlotToPlayer(state, chosenBase, carrier);
}

export function assignDynamicGoalkeepers(state: GameState): void {
  if (state.teamSize < 2) {
    for (const p of state.players) {
      p.isGoalkeeper = false;
    }
    return;
  }

  const bounds = getPitchBounds(state.teamSize);
  for (const team of ['blue', 'red'] as const) {
    const goalX = team === 'blue' ? bounds.pitchLeft : bounds.pitchRight;
    const goalY = bounds.centerY;
    let closestId: string | null = null;
    let minDist = Infinity;

    for (const p of state.players) {
      if (p.team !== team) continue;
      const d = hypot(p.x - goalX, p.y - goalY);
      if (d < minDist) {
        minDist = d;
        closestId = p.id;
      }
    }

    for (const p of state.players) {
      if (p.team === team) {
        p.isGoalkeeper = p.id === closestId;
      }
    }
  }
}

export function resetPositionsForKickoff(state: GameState): void {
  const existingBaseNames: Record<string, string> = {};
  for (const p of state.players) {
    existingBaseNames[p.id] = p.baseName;
  }

  const fresh = createPlayersForKickoff(
    state.mode,
    state.teamSize,
    undefined,
    state.humanSlots,
    existingBaseNames
  );

  // Restore equippedSkills, skillCooldowns, appearance, and jersey number back to each base human slot
  // before resetting controlMap so skills never disappear after switching players & scoring a goal.
  for (const [baseSlot, activeId] of Object.entries(state.controlMap)) {
    if (!activeId || activeId === baseSlot) continue;
    const basePlayer = state.players.find((p) => p.id === baseSlot);
    const activePlayer = state.players.find((p) => p.id === activeId);
    const activeTemplate = fresh.find((f) => f.id === activeId);
    if (basePlayer && activePlayer) {
      basePlayer.equippedSkills = [...activePlayer.equippedSkills];
      basePlayer.skillCooldowns = [...activePlayer.skillCooldowns] as [number, number];
      if (activePlayer.appearance) {
        basePlayer.appearance = { ...activePlayer.appearance };
        basePlayer.number = activePlayer.appearance.jerseyNumber;
      }
      activePlayer.equippedSkills = [];
      activePlayer.skillCooldowns = [0, 0];
      activePlayer.appearance = undefined;
      if (activeTemplate) {
        activePlayer.number = activeTemplate.number;
      }
    }
  }

  for (let i = 0; i < state.players.length; i++) {
    const template = fresh.find((f) => f.id === state.players[i].id);
    if (template) {
      state.players[i].x = template.x;
      state.players[i].y = template.y;
      state.players[i].vx = 0;
      state.players[i].vy = 0;
      state.players[i].facingAngle = template.facingAngle;
      state.players[i].aimX = template.aimX;
      state.players[i].aimY = template.aimY;
      state.players[i].dribbleTimer = 0;
      state.players[i].dribbleCooldown = 0;
      state.players[i].lungeTimer = 0;
      state.players[i].pickupLockout = 0;
      state.players[i].stealImmunity = 0;
      state.players[i].gkHoldTimer = 0;
      state.players[i].stamina = MAX_STAMINA;
      state.players[i].staminaExhausted = false;
      state.players[i].isSprinting = false;
      state.players[i].shootCharge = 0;
      state.players[i].isChargingShoot = false;
    }
  }

  state.controlMap = buildInitialControlMap(state.humanSlots);
  syncPlayerControlRoles(state);
  assignDynamicGoalkeepers(state);
  state.skillObjects = [];

  for (const p of state.players) {
    p.activeSkill = null;
    p.activeSkillTimer = 0;
    p.skillCooldowns = [
      Math.max(0, p.skillCooldowns[0] * 0.5),
      Math.max(0, p.skillCooldowns[1] * 0.5),
    ];
  }

  state.lastGoalOwnGoal = false;

  const bounds = getPitchBounds(state.teamSize);
  state.ball = {
    x: bounds.centerX,
    y: bounds.centerY,
    vx: 0,
    vy: 0,
    possessorId: null,
    lastTouchTeam: null,
    lastTouchPlayerKey: null,
    prevTouchPlayerKey: null,
    spin: 0,
    curveSpin: 0,
    accelBoost: 0,
    shotSkillTag: null,
  };
}

export function createInitialGameState(options: CreateGameOptions): GameState {
  const humanSlots = resolveDefaultHumanSlots(options.mode, options.humanSlots);
  const controlMap = buildInitialControlMap(humanSlots);
  const humanNames: Record<string, string> = {};
  for (const h of humanSlots) {
    if (options.slotNames?.[h]) {
      humanNames[h] = options.slotNames[h];
    } else if (h === 'blue-1') {
      humanNames[h] = options.blueName || 'Você';
    } else if (h === 'red-1') {
      humanNames[h] = options.redName || 'Jogador 2';
    } else {
      humanNames[h] = 'Jogador';
    }
  }

  const kickoffSlotNames: Record<string, string> = { ...(options.slotNames ?? {}) };
  if (
    options.mode !== 'online' &&
    options.teamSize === 1 &&
    options.redName &&
    !kickoffSlotNames['red-1']
  ) {
    kickoffSlotNames['red-1'] = options.redName;
  }

  const players = createPlayersForKickoff(
    options.mode,
    options.teamSize,
    kickoffSlotNames,
    humanSlots
  );

  for (const p of players) {
    if (options.slotAppearances?.[p.id]) {
      p.appearance = { ...options.slotAppearances[p.id] };
      p.number = p.appearance.jerseyNumber;
    } else if (p.id === 'blue-1' && options.mode !== 'online') {
      p.appearance = createDefaultCharacterConfig();
    }
    if (options.slotSkills?.[p.id]) {
      p.equippedSkills = options.slotSkills[p.id].slice(0, 2);
    }
  }

  const bounds = getPitchBounds(options.teamSize);
  const state: GameState = {
    mode: options.mode,
    teamSize: options.teamSize,
    phase: 'KICKOFF',
    phaseTimer: options.mode === 'training' ? 0.35 : 1.0,
    timeRemaining: MATCH_DURATION_SECONDS,
    overtimeCount: 0,
    score: {
      blue: 0,
      red: 0,
    },
    lastScorerTeam: null,
    lastScorerName: null,
    lastGoalOwnGoal: false,
    winner: null,
    humanSlots,
    humanNames,
    controlMap,
    players,
    ball: {
      x: bounds.centerX,
      y: bounds.centerY,
      vx: 0,
      vy: 0,
      possessorId: null,
      lastTouchTeam: null,
      lastTouchPlayerKey: null,
      prevTouchPlayerKey: null,
      spin: 0,
      curveSpin: 0,
      accelBoost: 0,
      shotSkillTag: null,
    },
    skillObjects: [],
    events: [{ type: 'whistle' }],
    matchStats: {},
    tick: 0,
  };
  syncPlayerControlRoles(state);
  assignDynamicGoalkeepers(state);
  initMatchStats(state);
  return state;
}

function getPlayerStatKey(
  state: GameState,
  player: PlayerState
): { key: string; name: string; isHuman: boolean } {
  for (const [baseSlot, pid] of Object.entries(state.controlMap)) {
    if (pid === player.id) {
      return {
        key: baseSlot,
        name: state.humanNames[baseSlot] || player.name,
        isHuman: true,
      };
    }
  }
  return {
    key: `ai:${player.id}`,
    name: player.baseName || player.name,
    isHuman: false,
  };
}

function initMatchStats(state: GameState): void {
  const stats: Record<string, MatchParticipantStat> = {};
  const controlledIds = new Set(Object.values(state.controlMap));
  for (const baseSlot of state.humanSlots) {
    const pid = state.controlMap[baseSlot] ?? baseSlot;
    const pl = state.players.find((p) => p.id === pid) ?? state.players.find((p) => p.id === baseSlot);
    if (!pl) continue;
    stats[baseSlot] = {
      id: baseSlot,
      name: state.humanNames[baseSlot] || pl.name,
      team: pl.team,
      number: pl.number,
      role: pl.role,
      isHuman: true,
      goals: 0,
      assists: 0,
      steals: 0,
      passes: 0,
      saves: 0,
      shots: 0,
    };
  }
  for (const pl of state.players) {
    if (controlledIds.has(pl.id)) continue;
    const key = `ai:${pl.id}`;
    stats[key] = {
      id: key,
      name: pl.baseName || pl.name,
      team: pl.team,
      number: pl.number,
      role: pl.role,
      isHuman: false,
      goals: 0,
      assists: 0,
      steals: 0,
      passes: 0,
      saves: 0,
      shots: 0,
    };
  }
  state.matchStats = stats;
}

function ensureMatchStatEntry(state: GameState, player: PlayerState): MatchParticipantStat {
  if (!state.matchStats) state.matchStats = {};
  const { key, name, isHuman } = getPlayerStatKey(state, player);
  let entry = state.matchStats[key];
  if (!entry) {
    entry = {
      id: key,
      name,
      team: player.team,
      number: player.number,
      role: player.role,
      isHuman,
      goals: 0,
      assists: 0,
      steals: 0,
      passes: 0,
      saves: 0,
      shots: 0,
    };
    state.matchStats[key] = entry;
  } else {
    entry.name = name;
    entry.number = player.number;
    entry.isHuman = isHuman;
  }
  return entry;
}

function recordPlayerStat(
  state: GameState,
  player: PlayerState,
  stat: 'goals' | 'assists' | 'steals' | 'passes' | 'saves' | 'shots',
  amount = 1
): void {
  const entry = ensureMatchStatEntry(state, player);
  entry[stat] += amount;
}

function registerBallTouch(state: GameState, player: PlayerState): void {
  const { key } = getPlayerStatKey(state, player);
  ensureMatchStatEntry(state, player);
  state.ball.lastTouchTeam = player.team;
  if (state.ball.lastTouchPlayerKey !== key) {
    state.ball.prevTouchPlayerKey = state.ball.lastTouchPlayerKey ?? null;
    state.ball.lastTouchPlayerKey = key;
  }
}

export function computeMvpScore(
  stat: MatchParticipantStat,
  winner: MatchWinner
): number {
  const winBonus = winner && winner !== 'draw' && stat.team === winner ? 40 : 0;
  return (
    stat.goals * 100 +
    stat.assists * 60 +
    stat.saves * 45 +
    stat.steals * 30 +
    stat.passes * 12 +
    stat.shots * 8 +
    winBonus
  );
}

export function computeMultiplayerMvpAndWinners(
  state: GameState
): MultiplayerMvpSummary | null {
  const statsMap = state.matchStats ?? {};
  const resolveAppearance = (stat: MatchParticipantStat): CharacterConfig | undefined => {
    if (stat.isHuman) {
      const pid = state.controlMap?.[stat.id] ?? stat.id;
      return state.players.find((p) => p.id === pid)?.appearance;
    }
    const pid = stat.id.startsWith('ai:') ? stat.id.slice(3) : stat.id;
    return state.players.find((p) => p.id === pid)?.appearance;
  };

  const toParticipant = (stat: MatchParticipantStat): MultiplayerMvpParticipant => ({
    ...stat,
    mvpScore: computeMvpScore(stat, state.winner),
    appearance: resolveAppearance(stat),
  });

  const allMap = new Map<string, MultiplayerMvpParticipant>();
  for (const s of Object.values(statsMap)) {
    allMap.set(s.id, toParticipant(s));
  }
  for (const h of state.humanSlots) {
    if (!allMap.has(h)) {
      const pid = state.controlMap?.[h] ?? h;
      const pl = state.players.find((p) => p.id === pid) ?? state.players.find((p) => p.id === h);
      if (pl) {
        allMap.set(
          h,
          toParticipant({
            id: h,
            name: state.humanNames?.[h] || pl.name,
            team: pl.team,
            number: pl.number,
            role: pl.role,
            isHuman: true,
            goals: 0,
            assists: 0,
            steals: 0,
            passes: 0,
            saves: 0,
            shots: 0,
          })
        );
      }
    }
  }

  const sortParticipants = (a: MultiplayerMvpParticipant, b: MultiplayerMvpParticipant) =>
    b.mvpScore - a.mvpScore ||
    b.goals - a.goals ||
    b.assists - a.assists ||
    b.saves - a.saves ||
    b.steals - a.steals ||
    (b.isHuman ? 1 : 0) - (a.isHuman ? 1 : 0);

  const allParticipants = Array.from(allMap.values()).sort(sortParticipants);
  const mvp = allParticipants[0];
  if (!mvp) return null;

  let winners: MultiplayerMvpParticipant[] = [];
  if (state.winner === 'blue' || state.winner === 'red') {
    const winTeam = state.winner;
    const winnerList: MultiplayerMvpParticipant[] = [];
    const seenIds = new Set<string>();

    for (const h of state.humanSlots) {
      if (!h.startsWith(winTeam)) continue;
      const entry = allMap.get(h);
      if (entry) {
        winnerList.push(entry);
        seenIds.add(entry.id);
      }
    }

    for (const pl of state.players) {
      if (pl.team !== winTeam || !pl.isAI) continue;
      const key = `ai:${pl.id}`;
      if (seenIds.has(key)) continue;
      const existing = allMap.get(key);
      winnerList.push(
        existing ??
          toParticipant({
            id: key,
            name: pl.baseName || pl.name,
            team: pl.team,
            number: pl.number,
            role: pl.role,
            isHuman: false,
            goals: 0,
            assists: 0,
            steals: 0,
            passes: 0,
            saves: 0,
            shots: 0,
          })
      );
      seenIds.add(key);
    }

    winners = winnerList.sort(
      (a, b) => (b.isHuman ? 1 : 0) - (a.isHuman ? 1 : 0) || sortParticipants(a, b)
    );
  } else {
    winners = allParticipants.filter((p) => p.isHuman);
    if (winners.length === 0) {
      winners = allParticipants.slice(0, 4);
    }
  }

  return {
    mvp,
    winners,
    allParticipants,
  };
}

interface AIFrameContext {
  bounds: PitchBounds;
  bluePlayers: PlayerState[];
  redPlayers: PlayerState[];
  carrier: PlayerState | null;
  closestBlueToBallId: string | null;
  closestRedToBallId: string | null;
}

function buildAIFrameContext(state: GameState, bounds: PitchBounds): AIFrameContext {
  const ball = state.ball;
  const bluePlayers: PlayerState[] = [];
  const redPlayers: PlayerState[] = [];
  let carrier: PlayerState | null = null;
  let closestBlueToBallId: string | null = null;
  let closestRedToBallId: string | null = null;
  let minBlueDistSq = Infinity;
  let minRedDistSq = Infinity;

  for (const p of state.players) {
    if (p.id === ball.possessorId) carrier = p;
    const dx = ball.x - p.x;
    const dy = ball.y - p.y;
    const dSq = dx * dx + dy * dy;
    if (p.team === 'blue') {
      bluePlayers.push(p);
      if (dSq < minBlueDistSq) {
        minBlueDistSq = dSq;
        closestBlueToBallId = p.id;
      }
    } else {
      redPlayers.push(p);
      if (dSq < minRedDistSq) {
        minRedDistSq = dSq;
        closestRedToBallId = p.id;
      }
    }
  }

  return {
    bounds,
    bluePlayers,
    redPlayers,
    carrier,
    closestBlueToBallId,
    closestRedToBallId,
  };
}

function getSlotNumberFast(id: string): number {
  const dash = id.indexOf('-');
  if (dash === -1) return 2;
  const n = Number(id.slice(dash + 1));
  return Number.isFinite(n) ? n : 2;
}

function computeAIInput(
  player: PlayerState,
  state: GameState,
  ctx: AIFrameContext
): PlayerInput {
  const ball = state.ball;
  const bounds = ctx.bounds;
  const isBlue = player.team === 'blue';
  const enemyGoalX = isBlue ? bounds.pitchRight + 16 : bounds.pitchLeft - 16;
  const ownGoalX = isBlue ? bounds.pitchLeft : bounds.pitchRight;
  const attackDir = isBlue ? 1 : -1;

  const isTraining = state.mode === 'training';
  const speedScale = isTraining ? 0.56 : 0.68;
  const shootRange = isTraining ? 250 : state.teamSize === 16 ? 390 : 365;
  const reactionBias = isTraining ? 0.22 : 0.42;

  const phaseOffset = player.number * 19;
  const hesitationCycle = (state.tick + phaseOffset) % 100;
  // Never freeze training AI dead on the pitch; only normal AI uses brief off-ball micro-pauses
  if (!isTraining && !player.isGoalkeeper && ctx.carrier?.id !== player.id && hesitationCycle < 12) {
    return { moveX: 0, moveY: 0, shoot: false, dribble: false, pass: false, sprint: false };
  }

  const carrier = ctx.carrier;

  if (carrier && carrier.id === player.id) {
    if (player.isGoalkeeper && player.gkHoldTimer > 0) {
      return { moveX: 0, moveY: 0, shoot: false, dribble: false, pass: false, sprint: false };
    }
    if (player.isGoalkeeper && state.teamSize >= 2) {
      const allyTarget = findBestGoalkeeperPassTarget(player, state);
      if (allyTarget) {
        const dx = allyTarget.x - player.x;
        const dy = allyTarget.y - player.y;
        const d = hypot(dx, dy) || 1;
        return {
          moveX: (dx / d) * 0.25,
          moveY: (dy / d) * 0.25,
          shoot: false,
          dribble: false,
          pass: !player.prevPass,
          sprint: false,
        };
      }
    }

    const opponents = isBlue ? ctx.redPlayers : ctx.bluePlayers;
    let nearestEnemy: PlayerState | null = null;
    let nearestEnemyDistSq = Infinity;
    for (const opp of opponents) {
      const edx = opp.x - player.x;
      const edy = opp.y - player.y;
      const edSq = edx * edx + edy * edy;
      if (edSq < nearestEnemyDistSq) {
        nearestEnemyDistSq = edSq;
        nearestEnemy = opp;
      }
    }

    const aimWobble = isTraining
      ? Math.sin(state.tick * 0.09) * 85
      : Math.sin((state.tick + phaseOffset) * 0.11) * 62;

    const targetGoalY =
      !isTraining && nearestEnemy && Math.abs(nearestEnemy.x - enemyGoalX) < 300
        ? nearestEnemy.y > bounds.centerY
          ? bounds.centerY - 34 + aimWobble * 0.45
          : bounds.centerY + 34 + aimWobble * 0.45
        : bounds.centerY + aimWobble;

    let dirX = enemyGoalX - player.x;
    let dirY = targetGoalY - player.y;
    const distToGoal = hypot(dirX, dirY) || 1;
    dirX /= distToGoal;
    dirY /= distToGoal;

    let wantDribble = false;
    if (nearestEnemy && !isTraining && nearestEnemyDistSq < 78 * 78) {
      const ex = nearestEnemy.x - player.x;
      if (ex * attackDir > 0) {
        const evadeSign = player.y >= nearestEnemy.y ? 1 : -1;
        const safeEvadeSign =
          player.y < bounds.pitchTop + 90 ? 1 : player.y > bounds.pitchBottom - 90 ? -1 : evadeSign;
        dirY += safeEvadeSign * 0.5 * reactionBias;
        const norm = hypot(dirX, dirY) || 1;
        dirX /= norm;
        dirY /= norm;

        if (
          nearestEnemyDistSq < 68 * 68 &&
          player.dribbleCooldown <= 0 &&
          !player.prevDribble &&
          (state.tick + phaseOffset) % 3 === 0
        ) {
          wantDribble = true;
        }
      }
    }

    const clearAngle = Math.abs(player.y - bounds.centerY) < 220 * bounds.scale;
    const inRange = distToGoal < shootRange && clearAngle;
    const readyToShoot = isTraining
      ? (state.tick + phaseOffset) % 18 === 0
      : (state.tick + phaseOffset) % 6 === 0;
    const wantShoot = inRange && readyToShoot && !player.prevShoot;

    return {
      moveX: clamp(dirX * speedScale, -1, 1),
      moveY: clamp(dirY * speedScale, -1, 1),
      shoot: wantShoot,
      dribble: wantDribble,
      pass: false,
      sprint: false,
    };
  }

  const slotNum = getSlotNumberFast(player.id);

  if (carrier && carrier.team === player.team) {
    let targetX = clamp(carrier.x + attackDir * 165, bounds.pitchLeft + 190, bounds.pitchRight - 190);
    let targetY = clamp(
      bounds.centerY + (slotNum === 2 ? -300 : slotNum === 3 ? 300 : 165),
      bounds.pitchTop + 110,
      bounds.pitchBottom - 110
    );

    if (player.isGoalkeeper || player.role === 'GK') {
      targetX = ownGoalX + attackDir * 68;
      targetY = clamp(
        bounds.centerY + (ball.y - bounds.centerY) * 0.22,
        bounds.goalTop + 18,
        bounds.goalBottom - 18
      );
    } else if (state.teamSize === 8) {
      if (player.role === 'DEF') {
        targetX = ownGoalX + attackDir * 440;
        targetY = bounds.centerY + (slotNum % 2 === 0 ? -190 : 190);
      } else if (player.role === 'LAT') {
        targetX = clamp(carrier.x + attackDir * 95, bounds.pitchLeft + 290, bounds.pitchRight - 290);
        targetY = bounds.centerY + (slotNum % 2 === 0 ? -480 : 480);
      } else if (player.role === 'MID') {
        targetX = clamp(carrier.x - attackDir * 150, bounds.pitchLeft + 360, bounds.pitchRight - 360);
        targetY = bounds.centerY + (ball.y > bounds.centerY ? -165 : 165);
      } else {
        targetX = clamp(carrier.x + attackDir * 290, bounds.pitchLeft + 420, bounds.pitchRight - 240);
        targetY = bounds.centerY + (slotNum === 1 ? -215 : 215);
      }
    } else if (state.teamSize === 16) {
      if (player.role === 'DEF') {
        const lane = slotNum - 12;
        const offsets = [-520, -180, 180, 520];
        targetX = clamp(ownGoalX + attackDir * 560, bounds.pitchLeft + 240, bounds.pitchRight - 240);
        targetY = bounds.centerY + (offsets[lane % 4] ?? 0);
      } else if (player.role === 'LAT') {
        const advance = slotNum >= 10 ? -240 : 140;
        targetX = clamp(carrier.x + attackDir * advance, bounds.pitchLeft + 340, bounds.pitchRight - 320);
        targetY = bounds.centerY + (slotNum % 2 === 0 ? -760 : 760);
      } else if (player.role === 'MID') {
        const depth = slotNum >= 6 ? -280 : -70;
        const spread = slotNum >= 6 ? 430 : 210;
        targetX = clamp(carrier.x + attackDir * depth, bounds.pitchLeft + 380, bounds.pitchRight - 360);
        targetY = bounds.centerY + (slotNum % 2 === 0 ? -spread : spread);
      } else {
        targetX = clamp(carrier.x + attackDir * 320, bounds.pitchLeft + 520, bounds.pitchRight - 260);
        targetY = bounds.centerY + (slotNum === 1 ? 0 : slotNum === 2 ? -410 : 410);
      }
    } else if (slotNum === 4) {
      targetX = ownGoalX + attackDir * 330;
      targetY = clamp(
        bounds.centerY + (ball.y - bounds.centerY) * 0.35,
        bounds.goalTop - 50,
        bounds.goalBottom + 50
      );
    }

    const dx = targetX - player.x;
    const dy = targetY - player.y;
    const dSq = dx * dx + dy * dy;
    if (dSq < 36 * 36) {
      return { moveX: 0, moveY: 0, shoot: false, dribble: false, pass: false, sprint: false };
    }
    const d = Math.sqrt(dSq);
    return {
      moveX: (dx / d) * speedScale * 0.72,
      moveY: (dy / d) * speedScale * 0.72,
      shoot: false,
      dribble: false,
      pass: false,
      sprint: false,
    };
  }

  const closestOnTeamId = isBlue ? ctx.closestBlueToBallId : ctx.closestRedToBallId;
  const isClosestOnTeam = closestOnTeamId === player.id;
  const bdx = ball.x - player.x;
  const bdy = ball.y - player.y;
  const ballDistSq = bdx * bdx + bdy * bdy;

  // Dynamic Goalkeeper guarding the goal (or rushing out when shot enters box)
  if (player.isGoalkeeper && state.teamSize >= 2) {
    const gkRushRadius = state.teamSize === 16 ? 260 : 235;
    const ogx = ball.x - ownGoalX;
    const ogy = ball.y - bounds.centerY;
    if (ogx * ogx + ogy * ogy < gkRushRadius * gkRushRadius && (!carrier || carrier.team !== player.team)) {
      const d = Math.sqrt(ballDistSq) || 1;
      return {
        moveX: (bdx / d) * speedScale * 0.9,
        moveY: (bdy / d) * speedScale * 0.9,
        shoot: false,
        dribble: false,
        pass: false,
        sprint: false,
      };
    }

    const guardX = ownGoalX + attackDir * (state.teamSize === 16 ? 68 : 58);
    const guardY = clamp(
      bounds.centerY + (ball.y - bounds.centerY) * 0.28,
      bounds.goalTop + 16,
      bounds.goalBottom - 16
    );
    const dx = guardX - player.x;
    const dy = guardY - player.y;
    const dSq = dx * dx + dy * dy;
    if (dSq < 18 * 18) {
      return { moveX: 0, moveY: 0, shoot: false, dribble: false, pass: false, sprint: false };
    }
    const d = Math.sqrt(dSq);
    return {
      moveX: (dx / d) * speedScale * 0.72,
      moveY: (dy / d) * speedScale * 0.72,
      shoot: false,
      dribble: false,
      pass: false,
      sprint: false,
    };
  }

  if (slotNum === 4 && state.teamSize === 4 && !isClosestOnTeam && ballDistSq > 340 * 340) {
    const guardX = ownGoalX + attackDir * 255;
    const guardY = clamp(
      bounds.centerY + (ball.y - bounds.centerY) * 0.45,
      bounds.goalTop - 35,
      bounds.goalBottom + 35
    );
    const dx = guardX - player.x;
    const dy = guardY - player.y;
    const dSq = dx * dx + dy * dy;
    if (dSq < 28 * 28) {
      return { moveX: 0, moveY: 0, shoot: false, dribble: false, pass: false, sprint: false };
    }
    const d = Math.sqrt(dSq);
    return {
      moveX: (dx / d) * speedScale * 0.75,
      moveY: (dy / d) * speedScale * 0.75,
      shoot: false,
      dribble: false,
      pass: false,
      sprint: false,
    };
  }

  if (!isClosestOnTeam && state.teamSize > 1) {
    let homeX = clamp(ball.x - attackDir * 230, bounds.pitchLeft + 290, bounds.pitchRight - 290);
    let homeY =
      slotNum === 2 ? bounds.centerY - 310 : slotNum === 3 ? bounds.centerY + 310 : bounds.centerY;

    if (state.teamSize === 8) {
      if (player.role === 'DEF') {
        homeX = clamp(ownGoalX + attackDir * 380, bounds.pitchLeft + 230, bounds.pitchRight - 230);
        homeY = bounds.centerY + (slotNum % 2 === 0 ? -195 : 195);
      } else if (player.role === 'LAT') {
        homeX = clamp(ball.x - attackDir * 240, bounds.pitchLeft + 290, bounds.pitchRight - 290);
        homeY = bounds.centerY + (slotNum % 2 === 0 ? -475 : 475);
      } else if (player.role === 'MID') {
        homeX = clamp(ball.x - attackDir * 125, bounds.pitchLeft + 340, bounds.pitchRight - 340);
        homeY = clamp(bounds.centerY + (ball.y - bounds.centerY) * 0.45, bounds.pitchTop + 160, bounds.pitchBottom - 160);
      } else if (player.role === 'FWD') {
        homeX = clamp(ball.x + attackDir * 190, bounds.pitchLeft + 420, bounds.pitchRight - 290);
        homeY = bounds.centerY + (slotNum === 1 ? -200 : 200);
      }
    } else if (state.teamSize === 16) {
      if (player.role === 'DEF') {
        const lane = slotNum - 12;
        const offsets = [-490, -170, 170, 490];
        homeX = clamp(ownGoalX + attackDir * 480, bounds.pitchLeft + 240, bounds.pitchRight - 240);
        homeY = bounds.centerY + (offsets[lane % 4] ?? 0);
      } else if (player.role === 'LAT') {
        const backDist = slotNum >= 10 ? 440 : 190;
        homeX = clamp(ball.x - attackDir * backDist, bounds.pitchLeft + 300, bounds.pitchRight - 300);
        homeY = bounds.centerY + (slotNum % 2 === 0 ? -740 : 740);
      } else if (player.role === 'MID') {
        const backDist = slotNum >= 6 ? 260 : 90;
        const spread = slotNum >= 6 ? 410 : 195;
        homeX = clamp(ball.x - attackDir * backDist, bounds.pitchLeft + 360, bounds.pitchRight - 360);
        homeY = clamp(
          bounds.centerY + (slotNum % 2 === 0 ? -spread : spread) + (ball.y - bounds.centerY) * 0.28,
          bounds.pitchTop + 160,
          bounds.pitchBottom - 160
        );
      } else if (player.role === 'FWD') {
        homeX = clamp(ball.x + attackDir * 220, bounds.pitchLeft + 460, bounds.pitchRight - 260);
        homeY = bounds.centerY + (slotNum === 1 ? 0 : slotNum === 2 ? -390 : 390);
      }
    }

    const dx = homeX - player.x;
    const dy = homeY - player.y;
    const dSq = dx * dx + dy * dy;
    if (dSq < 35 * 35) {
      return { moveX: 0, moveY: 0, shoot: false, dribble: false, pass: false, sprint: false };
    }
    const d = Math.sqrt(dSq);
    return {
      moveX: (dx / d) * speedScale * 0.7,
      moveY: (dy / d) * speedScale * 0.7,
      shoot: false,
      dribble: false,
      pass: false,
      sprint: false,
    };
  }

  let targetX = ball.x;
  let targetY = ball.y;
  if (!carrier && !isTraining) {
    targetX = clamp(ball.x + ball.vx * 0.05, bounds.pitchLeft + 10, bounds.pitchRight - 10);
    targetY = clamp(ball.y + ball.vy * 0.05, bounds.pitchTop + 10, bounds.pitchBottom - 10);
  }

  const dx = targetX - player.x;
  const dy = targetY - player.y;
  const d = hypot(dx, dy) || 1;

  const wantDribble =
    !isTraining &&
    d > 170 &&
    d < 250 &&
    player.dribbleCooldown <= 0 &&
    !player.prevDribble &&
    (state.tick + phaseOffset) % 3 === 0;

  const wantLunge =
    !isTraining &&
    carrier !== null &&
    carrier.team !== player.team &&
    d < PLAYER_RADIUS + BALL_RADIUS + 8 &&
    !player.prevShoot &&
    (state.tick + phaseOffset) % 4 === 0;

  return {
    moveX: (dx / d) * speedScale,
    moveY: (dy / d) * speedScale,
    shoot: wantLunge,
    dribble: wantDribble,
    pass: false,
    sprint: false,
  };
}

function findNearestTeammate(player: PlayerState, state: GameState): PlayerState | null {
  const teammates = state.players.filter(
    (p) => p.team === player.team && p.id !== player.id
  );
  if (teammates.length === 0) return null;

  let nearest = teammates[0];
  let bestDist = hypot(nearest.x - player.x, nearest.y - player.y);
  for (let i = 1; i < teammates.length; i++) {
    const d = hypot(teammates[i].x - player.x, teammates[i].y - player.y);
    if (d < bestDist) {
      bestDist = d;
      nearest = teammates[i];
    }
  }
  return nearest;
}

function pointToSegmentDist(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const vx = bx - ax;
  const vy = by - ay;
  const lenSq = vx * vx + vy * vy;
  if (lenSq < 0.0001) return hypot(px - ax, py - ay);
  const t = clamp(((px - ax) * vx + (py - ay) * vy) / lenSq, 0, 1);
  return hypot(px - (ax + t * vx), py - (ay + t * vy));
}

function findBestGoalkeeperPassTarget(
  gk: PlayerState,
  state: GameState
): PlayerState | null {
  const bounds = getPitchBounds(state.teamSize);
  const teammates = state.players.filter(
    (p) => p.team === gk.team && p.id !== gk.id
  );
  if (teammates.length === 0) return null;

  const opponents = state.players.filter((p) => p.team !== gk.team);
  const attackDir = gk.team === 'blue' ? 1 : -1;

  let bestAlly = teammates[0];
  let bestScore = -Infinity;

  for (const tm of teammates) {
    const passDist = hypot(tm.x - gk.x, tm.y - gk.y);
    let nearestEnemyToTm = Infinity;
    let laneBlockedPenalty = 0;

    for (const opp of opponents) {
      const dToTm = hypot(opp.x - tm.x, opp.y - tm.y);
      if (dToTm < nearestEnemyToTm) nearestEnemyToTm = dToTm;
      const laneDist = pointToSegmentDist(opp.x, opp.y, gk.x, gk.y, tm.x, tm.y);
      if (laneDist < 62) {
        laneBlockedPenalty += (62 - laneDist) * 3.5;
      }
    }

    const opennessScore = clamp(nearestEnemyToTm, 0, 420) * 1.35;
    const forwardBonus = clamp((tm.x - gk.x) * attackDir, -200, 900 * bounds.scale) * 0.25;
    const distancePenalty = passDist * 0.14;
    const score = opennessScore + forwardBonus - laneBlockedPenalty - distancePenalty;

    if (score > bestScore) {
      bestScore = score;
      bestAlly = tm;
    }
  }

  return bestAlly;
}

export function performGoalkeeperDistribution(
  gk: PlayerState,
  state: GameState,
  _rollOverride?: number
): 'throw' | 'rebound' {
  const bounds = getPitchBounds(state.teamSize);
  const ball = state.ball;
  const targetAlly = findBestGoalkeeperPassTarget(gk, state);

  if (targetAlly) {
    // O goleiro sempre manda a bola com segurança para um aliado livre
    const leadX = clamp(
      targetAlly.x + targetAlly.vx * 0.12,
      bounds.pitchLeft + BALL_RADIUS + 8,
      bounds.pitchRight - BALL_RADIUS - 8
    );
    const leadY = clamp(
      targetAlly.y + targetAlly.vy * 0.12,
      bounds.pitchTop + BALL_RADIUS + 8,
      bounds.pitchBottom - BALL_RADIUS - 8
    );
    const dx = leadX - gk.x;
    const dy = leadY - gk.y;
    const dist = hypot(dx, dy) || 1;
    const dirX = dx / dist;
    const dirY = dy / dist;
    const throwSpeed = clamp(520 + dist * 0.65, 550, 820);

    gk.facingAngle = Math.atan2(dirY, dirX);
    gk.aimX = dirX;
    gk.aimY = dirY;
    gk.pickupLockout = 0.36;
    gk.gkHoldTimer = 0;
    gk.isChargingShoot = false;
    gk.shootCharge = 0;

    ball.possessorId = null;
    registerBallTouch(state, gk);
    recordPlayerStat(state, gk, 'passes');
    const startDist = PLAYER_RADIUS + BALL_RADIUS + 6;
    ball.x = clamp(
      gk.x + dirX * startDist,
      bounds.pitchLeft - GOAL_DEPTH + BALL_RADIUS,
      bounds.pitchRight + GOAL_DEPTH - BALL_RADIUS
    );
    ball.y = clamp(gk.y + dirY * startDist, bounds.pitchTop + BALL_RADIUS, bounds.pitchBottom - BALL_RADIUS);
    ball.vx = dirX * throwSpeed;
    ball.vy = dirY * throwSpeed;
    ball.spin = 0;
    ball.curveSpin = 0;
    ball.accelBoost = 0;
    ball.shotSkillTag = null;
    state.events.push({ type: 'pass', x: ball.x, y: ball.y, team: gk.team });
    return 'throw';
  }

  // Fallback exclusivo para 1v1 (não há aliados em campo)
  const attackDir = gk.team === 'blue' ? 1 : -1;
  const sideSign = gk.y >= bounds.centerY ? 1 : -1;
  const rawX = attackDir * 0.86;
  const rawY = sideSign * 0.51;
  const norm = hypot(rawX, rawY) || 1;
  const dirX = rawX / norm;
  const dirY = rawY / norm;
  const reboundSpeed = 620;

  gk.facingAngle = Math.atan2(dirY, dirX);
  gk.aimX = dirX;
  gk.aimY = dirY;
  gk.pickupLockout = 0.36;
  gk.gkHoldTimer = 0;
  gk.isChargingShoot = false;
  gk.shootCharge = 0;

  ball.possessorId = null;
  registerBallTouch(state, gk);
  recordPlayerStat(state, gk, 'shots');
  const startDist = PLAYER_RADIUS + BALL_RADIUS + 6;
  ball.x = clamp(
    gk.x + dirX * startDist,
    bounds.pitchLeft - GOAL_DEPTH + BALL_RADIUS,
    bounds.pitchRight + GOAL_DEPTH - BALL_RADIUS
  );
  ball.y = clamp(gk.y + dirY * startDist, bounds.pitchTop + BALL_RADIUS, bounds.pitchBottom - BALL_RADIUS);
  ball.vx = dirX * reboundSpeed;
  ball.vy = dirY * reboundSpeed;
  ball.spin = sideSign * 4.5;
  ball.curveSpin = 0;
  ball.accelBoost = 0;
  ball.shotSkillTag = null;
  state.events.push({ type: 'kick', x: ball.x, y: ball.y, team: gk.team });
  return 'rebound';
}

function findBestPassTarget(player: PlayerState, state: GameState): PlayerState | null {
  const bounds = getPitchBounds(state.teamSize);
  const teammates = state.players.filter(
    (p) => p.team === player.team && p.id !== player.id
  );
  if (teammates.length === 0) return null;

  let best: PlayerState | null = null;
  let bestScore = -Infinity;

  for (const tm of teammates) {
    const dx = tm.x - player.x;
    const dy = tm.y - player.y;
    const dist = hypot(dx, dy) || 1;
    const dot = (dx / dist) * player.aimX + (dy / dist) * player.aimY;
    const distScore = 1 - clamp(dist / (1200 * bounds.scale), 0, 0.75);
    const score = dot * 2.4 + distScore * 0.8;
    if (score > bestScore) {
      bestScore = score;
      best = tm;
    }
  }

  return best;
}

function fireKick(
  player: PlayerState,
  state: GameState,
  speed: number,
  options?: {
    dirX?: number;
    dirY?: number;
    curveSpin?: number;
    accelBoost?: number;
    shotSkillTag?: SkillId | null;
  }
): void {
  const bounds = getPitchBounds(state.teamSize);
  const ball = state.ball;
  const kickDirX = options?.dirX ?? player.aimX;
  const kickDirY = options?.dirY ?? player.aimY;

  ball.possessorId = null;
  registerBallTouch(state, player);
  recordPlayerStat(state, player, 'shots');
  player.pickupLockout = 0.24;

  const kickStartDist = PLAYER_RADIUS + BALL_RADIUS + 4;
  ball.x = clamp(
    player.x + kickDirX * kickStartDist,
    bounds.pitchLeft - GOAL_DEPTH + BALL_RADIUS,
    bounds.pitchRight + GOAL_DEPTH - BALL_RADIUS
  );
  ball.y = clamp(
    player.y + kickDirY * kickStartDist,
    bounds.pitchTop + BALL_RADIUS,
    bounds.pitchBottom - BALL_RADIUS
  );
  ball.vx = kickDirX * speed + player.vx * 0.15;
  ball.vy = kickDirY * speed + player.vy * 0.15;
  ball.spin = (kickDirX * player.vy - kickDirY * player.vx) * 0.02;
  ball.curveSpin = options?.curveSpin ?? 0;
  ball.accelBoost = options?.accelBoost ?? 0;
  ball.shotSkillTag = options?.shotSkillTag ?? null;

  state.events.push({ type: 'kick', x: ball.x, y: ball.y, team: player.team });
}

function getGoalShotVector(player: PlayerState, state: GameState): { x: number; y: number } {
  const bounds = getPitchBounds(state.teamSize);
  const enemyGoalX = player.team === 'blue' ? bounds.pitchRight : bounds.pitchLeft;
  const topCornerY = bounds.goalTop + 28;
  const bottomCornerY = bounds.goalBottom - 28;
  const enemies = state.players.filter((p) => p.team !== player.team);

  let topDanger = 0;
  let bottomDanger = 0;
  for (const e of enemies) {
    const dtTop = hypot(e.x - enemyGoalX, e.y - topCornerY);
    const dtBot = hypot(e.x - enemyGoalX, e.y - bottomCornerY);
    topDanger += 1 / Math.max(30, dtTop);
    bottomDanger += 1 / Math.max(30, dtBot);
  }
  const targetY = topDanger <= bottomDanger ? topCornerY : bottomCornerY;
  const dx = enemyGoalX - player.x;
  const dy = targetY - player.y;
  const dist = hypot(dx, dy) || 1;
  return { x: dx / dist, y: dy / dist };
}

function activatePlayerSkill(
  player: PlayerState,
  skillId: SkillId,
  slotIdx: 0 | 1,
  state: GameState
): void {
  const bounds = getPitchBounds(state.teamSize);
  const def = getSkillById(skillId);
  const cooldown = def?.cooldown ?? 10;
  const duration = def?.duration ?? 2.0;

  player.skillCooldowns[slotIdx] = cooldown;
  player.activeSkill = skillId;
  player.activeSkillTimer = duration;
  player.isChargingShoot = false;
  player.shootCharge = 0;

  const ball = state.ball;
  const distToBall = hypot(ball.x - player.x, ball.y - player.y);
  const nearBall = ball.possessorId === player.id || (ball.possessorId === null && distToBall <= 72);
  const facingCos = Math.cos(player.facingAngle);
  const facingSin = Math.sin(player.facingAngle);

  state.events.push({
    type: 'skill',
    x: player.x,
    y: player.y,
    team: player.team,
    skillId,
  });

  switch (skillId) {
    case 'phantom-dribble': {
      player.dribbleTimer = Math.max(player.dribbleTimer, 0.55);
      player.stealImmunity = Math.max(player.stealImmunity, 0.7);
      player.x = clamp(player.x + facingCos * 34, bounds.pitchLeft + PLAYER_RADIUS, bounds.pitchRight - PLAYER_RADIUS);
      player.y = clamp(player.y + facingSin * 34, bounds.pitchTop + PLAYER_RADIUS, bounds.pitchBottom - PLAYER_RADIUS);
      break;
    }
    case 'thunder-pass': {
      if (nearBall) {
        const target = findBestPassTarget(player, state);
        let dirX = player.aimX;
        let dirY = player.aimY;
        if (target) {
          const lx = target.x + target.vx * 0.09 - player.x;
          const ly = target.y + target.vy * 0.09 - player.y;
          const ld = hypot(lx, ly) || 1;
          dirX = lx / ld;
          dirY = ly / ld;
        }
        fireKick(player, state, 980, {
          dirX,
          dirY,
          curveSpin: 0,
          accelBoost: 0,
          shotSkillTag: 'thunder-pass',
        });
      } else {
        player.dribbleTimer = 0.25;
      }
      break;
    }
    case 'aerial-dominance': {
      for (const other of state.players) {
        if (other.team === player.team) continue;
        const dx = other.x - player.x;
        const dy = other.y - player.y;
        const d = hypot(dx, dy);
        if (d > 0.1 && d <= 110) {
          other.x = clamp(other.x + (dx / d) * 38, bounds.pitchLeft + PLAYER_RADIUS, bounds.pitchRight - PLAYER_RADIUS);
          other.y = clamp(other.y + (dy / d) * 38, bounds.pitchTop + PLAYER_RADIUS, bounds.pitchBottom - PLAYER_RADIUS);
        }
      }
      break;
    }
    case 'eagle-shot': {
      if (nearBall) {
        const aim = getGoalShotVector(player, state);
        player.facingAngle = Math.atan2(aim.y, aim.x);
        player.aimX = aim.x;
        player.aimY = aim.y;
        fireKick(player, state, 1280, {
          dirX: aim.x,
          dirY: aim.y,
          curveSpin: 0,
          accelBoost: 0,
          shotSkillTag: 'eagle-shot',
        });
      } else {
        player.dribbleTimer = 0.32;
      }
      break;
    }
    case 'godspeed': {
      player.stamina = MAX_STAMINA;
      player.staminaExhausted = false;
      break;
    }
    case 'dragon-curve': {
      if (nearBall) {
        const aim = getGoalShotVector(player, state);
        const curveSign = player.y >= bounds.centerY ? -1 : 1;
        const kickDirX = aim.x;
        const kickDirY = clamp(aim.y - curveSign * 0.28, -0.95, 0.95);
        const norm = hypot(kickDirX, kickDirY) || 1;
        fireKick(player, state, 1060, {
          dirX: kickDirX / norm,
          dirY: kickDirY / norm,
          curveSpin: curveSign * 2.8,
          accelBoost: 0,
          shotSkillTag: 'dragon-curve',
        });
      } else {
        player.dribbleTimer = 0.28;
      }
      break;
    }
    case 'bloodhound': {
      // Active duration triggers auto-intercept pursuit in player loop
      break;
    }
    case 'shadow-step': {
      const blinkDist = 215;
      player.x = clamp(
        player.x + facingCos * blinkDist,
        bounds.pitchLeft + PLAYER_RADIUS,
        bounds.pitchRight - PLAYER_RADIUS
      );
      player.y = clamp(
        player.y + facingSin * blinkDist,
        bounds.pitchTop + PLAYER_RADIUS,
        bounds.pitchBottom - PLAYER_RADIUS
      );
      player.stealImmunity = Math.max(player.stealImmunity, 0.45);
      if (ball.possessorId === player.id) {
        const carryDist = PLAYER_RADIUS + BALL_RADIUS + 3;
        ball.x = clamp(player.x + facingCos * carryDist, bounds.pitchLeft + BALL_RADIUS, bounds.pitchRight - BALL_RADIUS);
        ball.y = clamp(player.y + facingSin * carryDist, bounds.pitchTop + BALL_RADIUS, bounds.pitchBottom - BALL_RADIUS);
      }
      break;
    }
    case 'meteor-strike': {
      if (nearBall) {
        const aim = getGoalShotVector(player, state);
        player.facingAngle = Math.atan2(aim.y, aim.x);
        player.aimX = aim.x;
        player.aimY = aim.y;
        fireKick(player, state, 980, {
          dirX: aim.x,
          dirY: aim.y,
          curveSpin: 0,
          accelBoost: 820,
          shotSkillTag: 'meteor-strike',
        });
      } else {
        player.dribbleTimer = 0.34;
      }
      break;
    }
    case 'steal-master': {
      const carryDist = PLAYER_RADIUS + BALL_RADIUS + 3;
      if (ball.possessorId && ball.possessorId !== player.id) {
        const carrier = state.players.find((p) => p.id === ball.possessorId);
        if (carrier && carrier.team !== player.team && carrier.gkHoldTimer <= 0) {
          const d = hypot(carrier.x - player.x, carrier.y - player.y);
          if (d <= 170) {
            carrier.pickupLockout = 0.55;
            carrier.isChargingShoot = false;
            carrier.shootCharge = 0;
            ball.possessorId = player.id;
            registerBallTouch(state, player);
            recordPlayerStat(state, player, 'steals');
            ball.curveSpin = 0;
            ball.accelBoost = 0;
            ball.shotSkillTag = null;
            player.stealImmunity = Math.max(player.stealImmunity, 0.5);
            ball.x = player.x + facingCos * carryDist;
            ball.y = player.y + facingSin * carryDist;
            state.events.push({ type: 'steal', x: ball.x, y: ball.y, team: player.team });
            ensureCarrierHumanControl(state);
          }
        }
      } else if (ball.possessorId === null && distToBall <= 165) {
        ball.possessorId = player.id;
        registerBallTouch(state, player);
        ball.curveSpin = 0;
        ball.accelBoost = 0;
        ball.shotSkillTag = null;
        player.stealImmunity = Math.max(player.stealImmunity, 0.45);
        ball.x = player.x + facingCos * carryDist;
        ball.y = player.y + facingSin * carryDist;
        ensureCarrierHumanControl(state);
      }
      break;
    }
    case 'cyclone-dribble': {
      player.stealImmunity = Math.max(player.stealImmunity, 2.0);
      break;
    }
    case 'gravity-control': {
      const enemyGoalX = player.team === 'blue' ? bounds.pitchRight : bounds.pitchLeft;
      const targetY = bounds.centerY + (player.y >= bounds.centerY ? -42 : 42);
      if (nearBall) {
        const dx = enemyGoalX - player.x;
        const dy = targetY - player.y;
        const d = hypot(dx, dy) || 1;
        fireKick(player, state, 960, {
          dirX: dx / d,
          dirY: dy / d,
          curveSpin: player.y >= bounds.centerY ? -1.4 : 1.4,
          accelBoost: 240,
          shotSkillTag: 'gravity-control',
        });
      } else if (ball.possessorId === null) {
        const dx = enemyGoalX - ball.x;
        const dy = targetY - ball.y;
        const d = hypot(dx, dy) || 1;
        ball.vx = (dx / d) * 960;
        ball.vy = (dy / d) * 960;
        registerBallTouch(state, player);
        recordPlayerStat(state, player, 'shots');
        ball.curveSpin = ball.y >= bounds.centerY ? -1.2 : 1.2;
        ball.accelBoost = 220;
        ball.shotSkillTag = 'gravity-control';
        state.events.push({ type: 'kick', x: ball.x, y: ball.y, team: player.team });
      }
      break;
    }
    case 'clone-feint': {
      player.stealImmunity = Math.max(player.stealImmunity, 0.65);
      for (const offsetAngle of [-0.62, 0.62]) {
        const ang = player.facingAngle + offsetAngle;
        state.skillObjects.push({
          kind: 'clone',
          id: `clone-${player.id}-${state.tick}-${offsetAngle > 0 ? 1 : 0}`,
          ownerId: player.id,
          team: player.team,
          number: player.number,
          x: player.x,
          y: player.y,
          vx: Math.cos(ang) * 390,
          vy: Math.sin(ang) * 390,
          ttl: duration,
          maxTtl: duration,
          appearance: player.appearance,
        });
      }
      break;
    }
    case 'zero-angle': {
      if (nearBall || distToBall <= 88) {
        const enemyGoalX = player.team === 'blue' ? bounds.pitchRight : bounds.pitchLeft;
        const targetY = bounds.centerY + (player.y > bounds.centerY ? 34 : -34);
        const dx = enemyGoalX - player.x;
        const dy = targetY - player.y;
        const d = hypot(dx, dy) || 1;
        const sign = player.y > bounds.centerY ? -1 : 1;
        fireKick(player, state, 1260, {
          dirX: dx / d,
          dirY: dy / d,
          curveSpin: sign * 1.5,
          accelBoost: 0,
          shotSkillTag: 'zero-angle',
        });
      }
      break;
    }
    case 'devils-touch': {
      player.stealImmunity = Math.max(player.stealImmunity, 2.6);
      player.dribbleTimer = Math.max(player.dribbleTimer, 0.3);
      break;
    }
    case 'kings-awakening': {
      player.stamina = MAX_STAMINA;
      player.staminaExhausted = false;
      break;
    }
    case 'overdrive': {
      player.stamina = MAX_STAMINA;
      player.staminaExhausted = false;
      player.dribbleCooldown = 0;
      break;
    }
    case 'absolute-reflex': {
      const ownGoalX = player.team === 'blue' ? bounds.pitchLeft + 70 : bounds.pitchRight - 70;
      const targetX = ball.possessorId === null ? (ball.x + ownGoalX) * 0.5 : ownGoalX;
      const targetY = ball.possessorId === null ? clamp(ball.y, bounds.goalTop - 40, bounds.goalBottom + 40) : bounds.centerY;
      const dx = targetX - player.x;
      const dy = targetY - player.y;
      const d = hypot(dx, dy) || 1;
      const stepDist = Math.min(d, 130);
      player.x = clamp(player.x + (dx / d) * stepDist, bounds.pitchLeft + PLAYER_RADIUS, bounds.pitchRight - PLAYER_RADIUS);
      player.y = clamp(player.y + (dy / d) * stepDist, bounds.pitchTop + PLAYER_RADIUS, bounds.pitchBottom - PLAYER_RADIUS);
      break;
    }
    case 'iron-wall': {
      const wallX = clamp(
        player.x + facingCos * 64,
        bounds.pitchLeft + 28,
        bounds.pitchRight - 28
      );
      const wallY = clamp(
        player.y + facingSin * 64,
        bounds.pitchTop + 28,
        bounds.pitchBottom - 28
      );
      state.skillObjects.push({
        kind: 'wall',
        id: `wall-${player.id}-${state.tick}`,
        ownerId: player.id,
        team: player.team,
        x: wallX,
        y: wallY,
        nx: facingCos,
        ny: facingSin,
        halfLen: 86,
        ttl: duration,
        maxTtl: duration,
      });
      break;
    }
    case 'predator-vision': {
      // Tactical cone & high kick/speed multiplier active while timer > 0
      break;
    }
  }
}

function resolveCircleCollision(
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number
): { hit: boolean; nx: number; ny: number; overlap: number } {
  const dx = ax - bx;
  const dy = ay - by;
  const dist = hypot(dx, dy);
  const minDist = ar + br;
  if (dist >= minDist) {
    return { hit: false, nx: 0, ny: 0, overlap: 0 };
  }
  if (dist < 0.0001) {
    return { hit: true, nx: 1, ny: 0, overlap: minDist };
  }
  return {
    hit: true,
    nx: dx / dist,
    ny: dy / dist,
    overlap: minDist - dist,
  };
}

export function stepGameState(
  state: GameState,
  inputs: Record<string, PlayerInput>,
  dt: number,
  hacks?: DevHacksConfig
): void {
  const safeDt = Math.min(dt, 0.05);
  state.events = [];
  state.tick += 1;

  if (state.phase === 'FINISHED') {
    return;
  }

  const activeHacks = hacks && hacks.enabled ? hacks : null;

  const bounds = getPitchBounds(state.teamSize);

  // Match clock strictly paused during KICKOFF, GOAL celebration, and OVERTIME (or if Freeze Clock hack is ON)
  if (state.phase === 'KICKOFF' || state.phase === 'GOAL' || state.phase === 'OVERTIME') {
    state.phaseTimer -= safeDt;
    if (state.phase === 'GOAL') {
      state.ball.x += state.ball.vx * safeDt;
      state.ball.y += state.ball.vy * safeDt;
      const decay = Math.exp(-BALL_FRICTION * 1.4 * safeDt);
      state.ball.vx *= decay;
      state.ball.vy *= decay;
      state.ball.y = clamp(state.ball.y, bounds.goalTop + BALL_RADIUS, bounds.goalBottom - BALL_RADIUS);
      state.ball.x = clamp(
        state.ball.x,
        bounds.pitchLeft - GOAL_DEPTH + BALL_RADIUS,
        bounds.pitchRight + GOAL_DEPTH - BALL_RADIUS
      );
    }

    if (state.phaseTimer <= 0) {
      if (state.phase === 'GOAL' || state.phase === 'OVERTIME') {
        resetPositionsForKickoff(state);
      }
      state.phase = 'PLAYING';
      state.phaseTimer = 0;
      state.events.push({ type: 'whistle' });
    }
    return;
  }

  assignDynamicGoalkeepers(state);
  ensureCarrierHumanControl(state);

  const playerToBaseSlot = new Map<string, string>();
  for (const [baseSlot, playerId] of Object.entries(state.controlMap)) {
    playerToBaseSlot.set(playerId, baseSlot);
  }

  if (!activeHacks?.freezeClock) {
    state.timeRemaining -= safeDt;
    if (state.timeRemaining <= 0) {
      state.timeRemaining = 0;
      if (state.score.blue !== state.score.red) {
        state.phase = 'FINISHED';
        state.winner = state.score.blue > state.score.red ? 'blue' : 'red';
        state.events.push({ type: 'whistle' });
        return;
      } else if (state.overtimeCount < MAX_OVERTIMES) {
        state.overtimeCount += 1;
        state.timeRemaining = OVERTIME_DURATION_SECONDS;
        state.phase = 'OVERTIME';
        state.phaseTimer = 1.9;
        state.events.push({ type: 'overtime' });
        return;
      } else {
        state.phase = 'FINISHED';
        state.winner = 'draw';
        state.events.push({ type: 'whistle' });
        return;
      }
    }
  }

  // 1. Update each player's input, movement, sprint/stamina, dribble, pass, and kick/charge
  const aiCtx = buildAIFrameContext(state, bounds);
  const devTeam: Team = activeHacks?.devSlot?.startsWith('red') ? 'red' : 'blue';
  for (const player of state.players) {
    const ownerBaseSlot = playerToBaseSlot.get(player.id);
    const isDevControlled = Boolean(
      ownerBaseSlot && activeHacks && (!activeHacks.devSlot || ownerBaseSlot === activeHacks.devSlot)
    );
    const isFrozenEnemy =
      Boolean(activeHacks?.freezeEnemyAI) && !ownerBaseSlot && player.team !== devTeam;
    const rawInput = ownerBaseSlot
      ? inputs[ownerBaseSlot] ?? EMPTY_INPUT
      : isFrozenEnemy
      ? EMPTY_INPUT
      : computeAIInput(player, state, aiCtx);

    const mag = hypot(rawInput.moveX, rawInput.moveY);
    const normX = mag > 1 ? rawInput.moveX / mag : rawInput.moveX;
    const normY = mag > 1 ? rawInput.moveY / mag : rawInput.moveY;
    const activeMag = Math.min(mag, 1);

    if ((player.diagGraceTimer ?? 0) > 0) {
      player.diagGraceTimer = Math.max(0, (player.diagGraceTimer ?? 0) - safeDt);
    }

    let moveNormX = normX;
    let moveNormY = normY;
    const rawTolMs = rawInput.diagonalToleranceMs;
    const diagGraceSec =
      typeof rawTolMs === 'number' && Number.isFinite(rawTolMs)
        ? clamp(rawTolMs, 0, 400) / 1000
        : 0.2;

    if (diagGraceSec <= 0) {
      player.diagGraceTimer = 0;
    } else if (ownerBaseSlot && activeMag > 0.14) {
      const uX = normX / activeMag;
      const uY = normY / activeMag;
      if (Math.abs(uX) > 0.28 && Math.abs(uY) > 0.28) {
        player.diagGraceTimer = diagGraceSec;
        player.diagGraceX = uX;
        player.diagGraceY = uY;
      } else if ((player.diagGraceTimer ?? 0) > 0) {
        const gx = player.diagGraceX ?? 0;
        const gy = player.diagGraceY ?? 0;
        if (uX * gx < -0.15 || uY * gy < -0.15) {
          player.diagGraceTimer = 0;
        } else if (Math.abs(uX) < 0.2 || Math.abs(uY) < 0.2) {
          moveNormX = gx * activeMag;
          moveNormY = gy * activeMag;
        }
      }
    } else if (activeMag <= 0.14 && (player.diagGraceTimer ?? 0) > 0) {
      // Keep diagonal aim direction cleanly if player released into idle within configured tolerance
      player.aimX = player.diagGraceX ?? player.aimX;
      player.aimY = player.diagGraceY ?? player.aimY;
      player.facingAngle = Math.atan2(player.aimY, player.aimX);
    }

    if (player.dribbleTimer > 0) player.dribbleTimer = Math.max(0, player.dribbleTimer - safeDt);
    if (player.dribbleCooldown > 0) player.dribbleCooldown = Math.max(0, player.dribbleCooldown - safeDt);
    if (player.lungeTimer > 0) player.lungeTimer = Math.max(0, player.lungeTimer - safeDt);
    if (player.pickupLockout > 0) player.pickupLockout = Math.max(0, player.pickupLockout - safeDt);
    if (player.stealImmunity > 0) player.stealImmunity = Math.max(0, player.stealImmunity - safeDt);
    if (player.skillCooldowns[0] > 0) {
      player.skillCooldowns[0] = Math.max(0, player.skillCooldowns[0] - safeDt);
    }
    if (player.skillCooldowns[1] > 0) {
      player.skillCooldowns[1] = Math.max(0, player.skillCooldowns[1] - safeDt);
    }
    if (player.activeSkillTimer > 0) {
      player.activeSkillTimer = Math.max(0, player.activeSkillTimer - safeDt);
      if (player.activeSkillTimer <= 0) {
        player.activeSkill = null;
      }
    }
    if (player.gkHoldTimer > 0) {
      player.gkHoldTimer = Math.max(0, player.gkHoldTimer - safeDt);
      if (player.gkHoldTimer === 0 && state.ball.possessorId === player.id && player.isGoalkeeper && state.teamSize >= 2) {
        performGoalkeeperDistribution(
          player,
          state,
          activeHacks?.gkAlwaysThrow ? 0 : undefined
        );
      }
    }

    if (activeMag > 0.14) {
      player.facingAngle = Math.atan2(moveNormY, moveNormX);
      player.aimX = moveNormX / activeMag;
      player.aimY = moveNormY / activeMag;
    } else if ((player.diagGraceTimer ?? 0) <= 0) {
      player.aimX = Math.cos(player.facingAngle);
      player.aimY = Math.sin(player.facingAngle);
    }

    const shootPressed = rawInput.shoot && !player.prevShoot;
    const dribblePressed = rawInput.dribble && !player.prevDribble;
    const passPressed = rawInput.pass && !player.prevPass;
    const switchPressed = Boolean(rawInput.switchPlayer) && !player.prevSwitchPlayer;
    const skill1Pressed = Boolean(rawInput.skill1) && !player.prevSkill1;
    const skill2Pressed = Boolean(rawInput.skill2) && !player.prevSkill2;
    player.prevShoot = rawInput.shoot;
    player.prevDribble = rawInput.dribble;
    player.prevPass = rawInput.pass;
    player.prevSwitchPlayer = Boolean(rawInput.switchPlayer);
    player.prevSkill1 = Boolean(rawInput.skill1);
    player.prevSkill2 = Boolean(rawInput.skill2);

    if (isDevControlled && activeHacks?.noDribbleCooldown) {
      player.dribbleCooldown = 0;
      player.skillCooldowns[0] = 0;
      player.skillCooldowns[1] = 0;
    }

    if (skill1Pressed && player.equippedSkills[0] && player.skillCooldowns[0] <= 0) {
      activatePlayerSkill(player, player.equippedSkills[0], 0, state);
    } else if (skill2Pressed && player.equippedSkills[1] && player.skillCooldowns[1] <= 0) {
      activatePlayerSkill(player, player.equippedSkills[1], 1, state);
    }

    if (dribblePressed && player.dribbleCooldown <= 0) {
      player.dribbleTimer = DRIBBLE_DURATION;
      player.dribbleCooldown =
        isDevControlled && activeHacks?.noDribbleCooldown ? 0 : DRIBBLE_COOLDOWN;
      if (state.ball.possessorId === player.id) {
        player.stealImmunity = Math.max(player.stealImmunity, 0.22);
      }
      state.events.push({ type: 'dribble', x: player.x, y: player.y, team: player.team });
    }

    const ball = state.ball;
    const distToBall = hypot(ball.x - player.x, ball.y - player.y);
    const skillReachBonus =
      player.activeSkill === 'absolute-reflex'
        ? 68
        : player.activeSkill === 'aerial-dominance'
        ? 42
        : player.activeSkill === 'kings-awakening'
        ? 24
        : player.activeSkill === 'bloodhound'
        ? 18
        : 0;
    const kickReachBonus =
      (isDevControlled && activeHacks?.ballMagnet ? 50 : 0) + skillReachBonus;
    const canKick =
      ball.possessorId === player.id ||
      (ball.possessorId === null && distToBall <= PLAYER_RADIUS + BALL_RADIUS + 18 + kickReachBonus);

    const isSwitchingWithoutBall =
      switchPressed && ownerBaseSlot && state.teamSize > 1 && ball.possessorId !== player.id;

    if (isSwitchingWithoutBall && ownerBaseSlot) {
      player.isChargingShoot = false;
      player.shootCharge = 0;
      const controlledSet = new Set(Object.values(state.controlMap));
      const candidates = state.players.filter(
        (p) => p.team === player.team && p.id !== player.id && !controlledSet.has(p.id)
      );
      if (candidates.length > 0) {
        let closestTm = candidates[0];
        let minD = hypot(closestTm.x - ball.x, closestTm.y - ball.y);
        for (let i = 1; i < candidates.length; i++) {
          const d = hypot(candidates[i].x - ball.x, candidates[i].y - ball.y);
          if (d < minD) {
            minD = d;
            closestTm = candidates[i];
          }
        }
        switchHumanSlotToPlayer(state, ownerBaseSlot, closestTm);
        playerToBaseSlot.delete(player.id);
        playerToBaseSlot.set(closestTm.id, ownerBaseSlot);
      }
    } else if (passPressed) {
      player.isChargingShoot = false;
      player.shootCharge = 0;

      if (canKick) {
        const target = player.isGoalkeeper && state.teamSize >= 2
          ? findBestGoalkeeperPassTarget(player, state) ?? findBestPassTarget(player, state)
          : findBestPassTarget(player, state);
        let passDirX = player.aimX;
        let passDirY = player.aimY;
        let passSpeed = PASS_SPEED * 0.65;

        if (target) {
          const leadX = target.x + target.vx * 0.12 - player.x;
          const leadY = target.y + target.vy * 0.12 - player.y;
          const leadDist = hypot(leadX, leadY) || 1;
          passDirX = leadX / leadDist;
          passDirY = leadY / leadDist;
          passSpeed = clamp(480 + leadDist * 0.65, 520, PASS_SPEED + 120);
        }

        ball.possessorId = null;
        registerBallTouch(state, player);
        recordPlayerStat(state, player, 'passes');
        player.pickupLockout = 0.28;
        player.gkHoldTimer = 0;

        const kickStartDist = PLAYER_RADIUS + BALL_RADIUS + 4;
        ball.x = clamp(
          player.x + passDirX * kickStartDist,
          bounds.pitchLeft - GOAL_DEPTH + BALL_RADIUS,
          bounds.pitchRight + GOAL_DEPTH - BALL_RADIUS
        );
        ball.y = clamp(
          player.y + passDirY * kickStartDist,
          bounds.pitchTop + BALL_RADIUS,
          bounds.pitchBottom - BALL_RADIUS
        );
        ball.vx = passDirX * passSpeed + player.vx * 0.1;
        ball.vy = passDirY * passSpeed + player.vy * 0.1;
        ball.spin = (passDirX * player.vy - passDirY * player.vx) * 0.015;
        ball.curveSpin = 0;
        ball.accelBoost = 0;
        ball.shotSkillTag =
          player.activeSkill === 'thunder-pass' || player.activeSkill === 'devils-touch'
            ? player.activeSkill
            : null;

        state.events.push({ type: 'pass', x: ball.x, y: ball.y, team: player.team });
      }
    } else if (!ownerBaseSlot) {
      // AI kicks immediately without charge delay (no lunge impulse when without the ball)
      if (shootPressed && canKick) {
        const spd = player.dribbleTimer > 0 ? KICK_SPEED + DRIBBLE_KICK_BONUS : KICK_SPEED;
        fireKick(player, state, spd);
      }
    } else {
      // Human holds Shoot to fill the Power Bar, releases to kick (no lunge impulse when without the ball)
      if (rawInput.shoot) {
        if (canKick) {
          player.isChargingShoot = true;
          player.shootCharge = clamp(player.shootCharge + SHOOT_CHARGE_RATE * safeDt, 0, 1);
        } else if (player.isChargingShoot && distToBall > PLAYER_RADIUS + BALL_RADIUS + 28) {
          player.isChargingShoot = false;
          player.shootCharge = 0;
        }
      } else if (player.isChargingShoot) {
        const charge = player.shootCharge;
        player.isChargingShoot = false;
        player.shootCharge = 0;
        if (canKick) {
          const bonus = player.dribbleTimer > 0 ? DRIBBLE_KICK_BONUS : 0;
          const baseSpeed = MIN_KICK_SPEED + (MAX_KICK_SPEED + bonus - MIN_KICK_SPEED) * charge;
          const skillKickMult =
            player.activeSkill === 'kings-awakening'
              ? 1.35
              : player.activeSkill === 'overdrive'
              ? 1.3
              : player.activeSkill === 'predator-vision'
              ? 1.22
              : 1;
          const speed =
            baseSpeed *
            (isDevControlled && activeHacks ? activeHacks.kickPowerMultiplier : 1) *
            skillKickMult;
          fireKick(player, state, speed, {
            shotSkillTag: player.activeSkill,
          });
        }
      }
    }

    // Stamina & Sprint calculation
    const speedHackMult =
      isDevControlled && activeHacks ? activeHacks.playerSpeedMultiplier : 1;
    const skillSpeedMult =
      player.activeSkill === 'godspeed'
        ? 1.65
        : player.activeSkill === 'overdrive'
        ? 1.55
        : player.activeSkill === 'kings-awakening'
        ? 1.45
        : player.activeSkill === 'bloodhound'
        ? 1.42
        : player.activeSkill === 'aerial-dominance'
        ? 1.3
        : player.activeSkill === 'devils-touch'
        ? 1.22
        : player.activeSkill === 'predator-vision'
        ? 1.2
        : 1;
    let moveSpeed = BASE_PLAYER_SPEED * speedHackMult * skillSpeedMult;
    if (state.ball.possessorId === player.id) {
      moveSpeed *= CARRIER_SPEED_FACTOR;
    }

    const freeStaminaFromSkill =
      player.activeSkill === 'godspeed' ||
      player.activeSkill === 'kings-awakening' ||
      player.activeSkill === 'overdrive';

    const wantsSprint =
      rawInput.sprint &&
      activeMag > 0.14 &&
      player.dribbleTimer <= 0 &&
      player.lungeTimer <= 0;

    if ((isDevControlled && activeHacks?.infiniteStamina) || freeStaminaFromSkill) {
      player.stamina = MAX_STAMINA;
      player.staminaExhausted = false;
      if (wantsSprint) {
        player.isSprinting = true;
        moveSpeed *= SPRINT_SPEED_MULTIPLIER;
      } else {
        player.isSprinting = false;
      }
    } else if (wantsSprint && !player.staminaExhausted && player.stamina > 0) {
      player.isSprinting = true;
      player.stamina = Math.max(0, player.stamina - STAMINA_DRAIN_PER_SEC * safeDt);
      if (player.stamina <= 0) {
        player.staminaExhausted = true;
      }
      moveSpeed *= SPRINT_SPEED_MULTIPLIER;
    } else {
      player.isSprinting = false;
      const regen =
        activeMag > 0.14 ? STAMINA_REGEN_MOVING_PER_SEC : STAMINA_REGEN_IDLE_PER_SEC;
      player.stamina = Math.min(MAX_STAMINA, player.stamina + regen * safeDt);
      if (player.staminaExhausted && player.stamina >= STAMINA_RECOVERY_THRESHOLD) {
        player.staminaExhausted = false;
      }
    }

    if (player.activeSkill === 'bloodhound' && ball.possessorId !== player.id) {
      const bdx = ball.x - player.x;
      const bdy = ball.y - player.y;
      const bDist = hypot(bdx, bdy) || 1;
      player.vx = (bdx / bDist) * moveSpeed;
      player.vy = (bdy / bDist) * moveSpeed;
      player.facingAngle = Math.atan2(bdy, bdx);
      player.aimX = bdx / bDist;
      player.aimY = bdy / bDist;
    } else if (player.dribbleTimer > 0) {
      const dirX = activeMag > 0.14 ? moveNormX / activeMag : Math.cos(player.facingAngle);
      const dirY = activeMag > 0.14 ? moveNormY / activeMag : Math.sin(player.facingAngle);
      player.vx = dirX * DRIBBLE_SPEED * speedHackMult;
      player.vy = dirY * DRIBBLE_SPEED * speedHackMult;
    } else if (player.lungeTimer > 0) {
      const dirX = Math.cos(player.facingAngle);
      const dirY = Math.sin(player.facingAngle);
      player.vx = dirX * LUNGE_SPEED * speedHackMult;
      player.vy = dirY * LUNGE_SPEED * speedHackMult;
    } else if (activeMag > 0.06) {
      player.vx = moveNormX * moveSpeed;
      player.vy = moveNormY * moveSpeed;
    } else {
      player.vx = 0;
      player.vy = 0;
    }

    player.x += player.vx * safeDt;
    player.y += player.vy * safeDt;

    player.x = clamp(player.x, bounds.pitchLeft + PLAYER_RADIUS - 4, bounds.pitchRight - PLAYER_RADIUS + 4);
    player.y = clamp(player.y, bounds.pitchTop + PLAYER_RADIUS, bounds.pitchBottom - PLAYER_RADIUS);

    // Cyclone Dribble radial push aura
    if (player.activeSkill === 'cyclone-dribble') {
      for (const other of state.players) {
        if (other.team === player.team) continue;
        const dx = other.x - player.x;
        const dy = other.y - player.y;
        const d = hypot(dx, dy);
        if (d > 0.1 && d < 125) {
          const pushForce = 420 * safeDt;
          other.x = clamp(other.x + (dx / d) * pushForce, bounds.pitchLeft + PLAYER_RADIUS, bounds.pitchRight - PLAYER_RADIUS);
          other.y = clamp(other.y + (dy / d) * pushForce, bounds.pitchTop + PLAYER_RADIUS, bounds.pitchBottom - PLAYER_RADIUS);
        }
      }
    }
  }

  // Update skill field objects (Iron Wall barriers & Clone Feint decoys)
  if (state.skillObjects.length > 0) {
    const nextObjects: SkillFieldObject[] = [];
    for (const obj of state.skillObjects) {
      obj.ttl -= safeDt;
      if (obj.ttl <= 0) continue;
      if (obj.kind === 'clone') {
        obj.x = clamp(obj.x + obj.vx * safeDt, bounds.pitchLeft + PLAYER_RADIUS, bounds.pitchRight - PLAYER_RADIUS);
        obj.y = clamp(obj.y + obj.vy * safeDt, bounds.pitchTop + PLAYER_RADIUS, bounds.pitchBottom - PLAYER_RADIUS);
      } else if (obj.kind === 'wall') {
        // Repel opposing players trying to run through Iron Wall
        for (const p of state.players) {
          if (p.team === obj.team) continue;
          const relX = p.x - obj.x;
          const relY = p.y - obj.y;
          const distAlongNormal = relX * obj.nx + relY * obj.ny;
          const tx = -obj.ny;
          const ty = obj.nx;
          const distAlongTangent = relX * tx + relY * ty;
          if (Math.abs(distAlongNormal) < PLAYER_RADIUS + 10 && Math.abs(distAlongTangent) < obj.halfLen + PLAYER_RADIUS * 0.5) {
            const sign = distAlongNormal >= 0 ? 1 : -1;
            const push = PLAYER_RADIUS + 10 - Math.abs(distAlongNormal);
            p.x = clamp(p.x + obj.nx * sign * push, bounds.pitchLeft + PLAYER_RADIUS, bounds.pitchRight - PLAYER_RADIUS);
            p.y = clamp(p.y + obj.ny * sign * push, bounds.pitchTop + PLAYER_RADIUS, bounds.pitchBottom - PLAYER_RADIUS);
          }
        }
      }
      nextObjects.push(obj);
    }
    state.skillObjects = nextObjects;
  }

  // 2. Player-to-Player collision resolution (fast squared-distance culling)
  const playerMinDist = PLAYER_RADIUS * 2;
  const playerMinDistSq = playerMinDist * playerMinDist;
  for (let i = 0; i < state.players.length; i++) {
    const a = state.players[i];
    for (let j = i + 1; j < state.players.length; j++) {
      const b = state.players[j];
      const cdx = a.x - b.x;
      const cdy = a.y - b.y;
      if (cdx * cdx + cdy * cdy >= playerMinDistSq) continue;
      const col = resolveCircleCollision(a.x, a.y, PLAYER_RADIUS, b.x, b.y, PLAYER_RADIUS);
      if (col.hit) {
        const push = col.overlap * 0.5;
        a.x = clamp(a.x + col.nx * push, bounds.pitchLeft + PLAYER_RADIUS - 4, bounds.pitchRight - PLAYER_RADIUS + 4);
        a.y = clamp(a.y + col.ny * push, bounds.pitchTop + PLAYER_RADIUS, bounds.pitchBottom - PLAYER_RADIUS);
        b.x = clamp(b.x - col.nx * push, bounds.pitchLeft + PLAYER_RADIUS - 4, bounds.pitchRight - PLAYER_RADIUS + 4);
        b.y = clamp(b.y - col.ny * push, bounds.pitchTop + PLAYER_RADIUS, bounds.pitchBottom - PLAYER_RADIUS);
      }
    }
  }

  // 3. Ball possession, attachment on touch, and stealing by passing through the ball
  const ball = state.ball;
  const carryDist = PLAYER_RADIUS + BALL_RADIUS + 3;

  if (ball.possessorId) {
    const carrier = state.players.find((p) => p.id === ball.possessorId);
    if (carrier) {
      ball.x = carrier.x + Math.cos(carrier.facingAngle) * carryDist;
      ball.y = carrier.y + Math.sin(carrier.facingAngle) * carryDist;
      ball.vx = carrier.vx;
      ball.vy = carrier.vy;
      ball.spin += hypot(carrier.vx, carrier.vy) * safeDt * 0.03;

      if (carrier.stealImmunity <= 0) {
        for (const other of state.players) {
          if (other.team === carrier.team) continue;
          if (other.pickupLockout > 0) continue;

          const otherBaseSlot = playerToBaseSlot.get(other.id);
          const isOtherDev = Boolean(
            otherBaseSlot &&
              activeHacks &&
              (!activeHacks.devSlot || otherBaseSlot === activeHacks.devSlot)
          );
          const magnetStealBonus = isOtherDev && activeHacks?.ballMagnet ? 65 : 0;
          const distToBall = hypot(other.x - ball.x, other.y - ball.y);
          if (distToBall <= PLAYER_RADIUS + BALL_RADIUS + 5 + magnetStealBonus) {
            carrier.pickupLockout = 0.42;
            carrier.isChargingShoot = false;
            carrier.shootCharge = 0;
            other.stealImmunity = 0.32;
            ball.possessorId = other.id;
            registerBallTouch(state, other);
            recordPlayerStat(state, other, 'steals');
            ball.x = other.x + Math.cos(other.facingAngle) * carryDist;
            ball.y = other.y + Math.sin(other.facingAngle) * carryDist;
            state.events.push({ type: 'steal', x: ball.x, y: ball.y, team: other.team });
            if (other.isGoalkeeper && state.teamSize >= 2) {
              recordPlayerStat(state, other, 'saves');
              other.gkHoldTimer = GOALKEEPER_HOLD_SECONDS;
              other.stealImmunity = GOALKEEPER_HOLD_SECONDS + 0.15;
              const upfieldAngle = other.team === 'blue' ? 0 : Math.PI;
              other.facingAngle = upfieldAngle;
              other.aimX = Math.cos(upfieldAngle);
              other.aimY = Math.sin(upfieldAngle);
            } else {
              ensureCarrierHumanControl(state);
            }
            break;
          }
        }
      }
    } else {
      ball.possessorId = null;
    }
  } else {
    if (activeHacks?.ballMagnet) {
      const magnetBaseSlot = activeHacks.devSlot || 'blue-1';
      const targetId = state.controlMap?.[magnetBaseSlot] ?? magnetBaseSlot;
      const hero = state.players.find((p) => p.id === targetId);
      if (hero && hero.pickupLockout <= 0) {
        const mdx = hero.x - ball.x;
        const mdy = hero.y - ball.y;
        const md = hypot(mdx, mdy);
        if (md > 1 && md < 260) {
          ball.vx += (mdx / md) * 1400 * safeDt;
          ball.vy += (mdy / md) * 1400 * safeDt;
        }
      }
    }

    // Skill shot physics: curve (Dragon Curve / Zero Angle / Gravity) & air acceleration (Meteor Strike)
    if (ball.curveSpin !== 0) {
      const bSpeed = hypot(ball.vx, ball.vy);
      if (bSpeed > 40) {
        const perpX = -ball.vy / bSpeed;
        const perpY = ball.vx / bSpeed;
        const curveAccel = ball.curveSpin * bSpeed * 1.15;
        ball.vx += perpX * curveAccel * safeDt;
        ball.vy += perpY * curveAccel * safeDt;
      }
    }
    if (ball.accelBoost > 0) {
      const bSpeed = hypot(ball.vx, ball.vy);
      if (bSpeed > 25 && bSpeed < 1620) {
        const nextSpeed = Math.min(1620, bSpeed + ball.accelBoost * safeDt);
        const scale = nextSpeed / bSpeed;
        ball.vx *= scale;
        ball.vy *= scale;
      }
      ball.accelBoost = Math.max(0, ball.accelBoost - 260 * safeDt);
    }

    ball.x += ball.vx * safeDt;
    ball.y += ball.vy * safeDt;

    const frictionMult = activeHacks ? activeHacks.ballFrictionMultiplier : 1;
    const decay = Math.exp(-BALL_FRICTION * frictionMult * safeDt);
    ball.vx *= decay;
    ball.vy *= decay;
    if (hypot(ball.vx, ball.vy) < 8) {
      ball.vx = 0;
      ball.vy = 0;
      ball.curveSpin = 0;
      ball.accelBoost = 0;
      ball.shotSkillTag = null;
    }
    ball.spin += hypot(ball.vx, ball.vy) * safeDt * 0.03;

    // Iron Wall ball deflection (deflects opposing shots cleanly)
    for (const obj of state.skillObjects) {
      if (obj.kind !== 'wall') continue;
      if (ball.lastTouchTeam === obj.team) continue;
      const relX = ball.x - obj.x;
      const relY = ball.y - obj.y;
      const distNormal = relX * obj.nx + relY * obj.ny;
      const tx = -obj.ny;
      const ty = obj.nx;
      const distTangent = relX * tx + relY * ty;
      if (Math.abs(distNormal) < BALL_RADIUS + 8 && Math.abs(distTangent) <= obj.halfLen + BALL_RADIUS) {
        const sign = distNormal >= 0 ? 1 : -1;
        ball.x = obj.x + obj.nx * sign * (BALL_RADIUS + 9) + tx * distTangent;
        ball.y = obj.y + obj.ny * sign * (BALL_RADIUS + 9) + ty * distTangent;
        const dot = ball.vx * obj.nx + ball.vy * obj.ny;
        ball.vx -= 1.85 * dot * obj.nx;
        ball.vy -= 1.85 * dot * obj.ny;
        ball.curveSpin = 0;
        ball.accelBoost = 0;
        ball.lastTouchTeam = obj.team;
        state.events.push({ type: 'post', x: ball.x, y: ball.y });
      }
    }

    const posts = [
      { x: bounds.pitchLeft, y: bounds.goalTop },
      { x: bounds.pitchLeft, y: bounds.goalBottom },
      { x: bounds.pitchRight, y: bounds.goalTop },
      { x: bounds.pitchRight, y: bounds.goalBottom },
    ];
    for (const post of posts) {
      const col = resolveCircleCollision(
        ball.x,
        ball.y,
        BALL_RADIUS,
        post.x,
        post.y,
        GOAL_POST_RADIUS
      );
      if (col.hit) {
        ball.x += col.nx * col.overlap;
        ball.y += col.ny * col.overlap;
        const dot = ball.vx * col.nx + ball.vy * col.ny;
        if (dot < 0) {
          ball.vx -= 1.8 * dot * col.nx;
          ball.vy -= 1.8 * dot * col.ny;
          state.events.push({ type: 'post', x: post.x, y: post.y });
        }
      }
    }

    if (ball.y - BALL_RADIUS < bounds.pitchTop) {
      ball.y = bounds.pitchTop + BALL_RADIUS;
      ball.vy = Math.abs(ball.vy) * 0.78;
    } else if (ball.y + BALL_RADIUS > bounds.pitchBottom) {
      ball.y = bounds.pitchBottom - BALL_RADIUS;
      ball.vy = -Math.abs(ball.vy) * 0.78;
    }

    const inGoalMouthY = ball.y > bounds.goalTop + 2 && ball.y < bounds.goalBottom - 2;
    if (!inGoalMouthY) {
      if (ball.x - BALL_RADIUS < bounds.pitchLeft) {
        ball.x = bounds.pitchLeft + BALL_RADIUS;
        ball.vx = Math.abs(ball.vx) * 0.78;
      } else if (ball.x + BALL_RADIUS > bounds.pitchRight) {
        ball.x = bounds.pitchRight - BALL_RADIUS;
        ball.vx = -Math.abs(ball.vx) * 0.78;
      }
    }

    let closestPlayer: PlayerState | null = null;
    let closestDist = Infinity;
    for (const player of state.players) {
      if (player.pickupLockout > 0) continue;
      const magnetBonus = playerToBaseSlot.has(player.id) && activeHacks?.ballMagnet ? 48 : 0;
      const skillBonus =
        player.activeSkill === 'absolute-reflex'
          ? 62
          : player.activeSkill === 'aerial-dominance'
          ? 34
          : player.activeSkill === 'bloodhound'
          ? 18
          : 0;
      const d = hypot(player.x - ball.x, player.y - ball.y);
      if (d <= PLAYER_RADIUS + BALL_RADIUS + 5 + magnetBonus + skillBonus && d < closestDist) {
        closestDist = d;
        closestPlayer = player;
      }
    }

    if (closestPlayer) {
      const incomingSpeed = hypot(ball.vx, ball.vy);
      const isEnemyShot = ball.lastTouchTeam !== closestPlayer.team;
      ball.curveSpin = 0;
      ball.accelBoost = 0;
      ball.shotSkillTag = null;
      if (
        (closestPlayer.isGoalkeeper || closestPlayer.activeSkill === 'absolute-reflex') &&
        state.teamSize >= 2 &&
        (closestPlayer.isAI || isEnemyShot || incomingSpeed > 160)
      ) {
        if (isEnemyShot && incomingSpeed > 180) {
          recordPlayerStat(state, closestPlayer, 'saves');
        }
        ball.possessorId = closestPlayer.id;
        registerBallTouch(state, closestPlayer);
        closestPlayer.gkHoldTimer = GOALKEEPER_HOLD_SECONDS;
        closestPlayer.stealImmunity = GOALKEEPER_HOLD_SECONDS + 0.15;
        const upfieldAngle = closestPlayer.team === 'blue' ? 0 : Math.PI;
        closestPlayer.facingAngle = upfieldAngle;
        closestPlayer.aimX = Math.cos(upfieldAngle);
        closestPlayer.aimY = Math.sin(upfieldAngle);
        ball.x = closestPlayer.x + Math.cos(closestPlayer.facingAngle) * carryDist;
        ball.y = closestPlayer.y + Math.sin(closestPlayer.facingAngle) * carryDist;
        ball.vx = 0;
        ball.vy = 0;
      } else {
        ball.possessorId = closestPlayer.id;
        registerBallTouch(state, closestPlayer);
        closestPlayer.stealImmunity = 0.16;
        ball.x = closestPlayer.x + Math.cos(closestPlayer.facingAngle) * carryDist;
        ball.y = closestPlayer.y + Math.sin(closestPlayer.facingAngle) * carryDist;
        ensureCarrierHumanControl(state);
      }
    }
  }

  // 4. Goal Detection
  const ballInGoalY = ball.y >= bounds.goalTop + 4 && ball.y <= bounds.goalBottom - 4;
  if (ballInGoalY) {
    if (ball.x < bounds.pitchLeft - 4) {
      scoreGoal(state, 'red');
    } else if (ball.x > bounds.pitchRight + 4) {
      scoreGoal(state, 'blue');
    }
  }
}

function scoreGoal(state: GameState, scoringTeam: Team): void {
  const possessor = state.ball.possessorId
    ? state.players.find((p) => p.id === state.ball.possessorId)
    : null;
  const lastTouchStat = state.ball.lastTouchPlayerKey
    ? state.matchStats?.[state.ball.lastTouchPlayerKey] ?? null
    : null;
  const isOwnGoal = Boolean(
    (possessor && possessor.team !== scoringTeam) ||
      (!possessor &&
        state.ball.lastTouchTeam !== null &&
        state.ball.lastTouchTeam !== scoringTeam)
  );
  const scorerKey =
    possessor && possessor.team === scoringTeam
      ? getPlayerStatKey(state, possessor).key
      : !isOwnGoal && lastTouchStat && lastTouchStat.team === scoringTeam
      ? lastTouchStat.id
      : null;

  if (scorerKey && state.matchStats?.[scorerKey]) {
    state.matchStats[scorerKey].goals += 1;
    const assistKey = state.ball.prevTouchPlayerKey;
    if (
      assistKey &&
      assistKey !== scorerKey &&
      state.matchStats[assistKey] &&
      state.matchStats[assistKey].team === scoringTeam
    ) {
      state.matchStats[assistKey].assists += 1;
    }
  }

  const scorerName =
    possessor && possessor.team === scoringTeam
      ? possessor.name
      : !isOwnGoal && lastTouchStat && lastTouchStat.team === scoringTeam
      ? lastTouchStat.name
      : scoringTeam === 'blue'
      ? 'Time Azul'
      : 'Time Vermelho';

  state.ball.possessorId = null;
  if (scoringTeam === 'blue' && state.ball.vx < 140) {
    state.ball.vx = 180;
  } else if (scoringTeam === 'red' && state.ball.vx > -140) {
    state.ball.vx = -180;
  }

  state.score[scoringTeam] += 1;
  state.lastScorerTeam = scoringTeam;
  state.lastScorerName = scorerName;
  state.lastGoalOwnGoal = isOwnGoal;
  state.phase = 'GOAL';
  state.phaseTimer = GOAL_CELEBRATION_SECONDS;
  state.events.push({
    type: 'goal',
    team: scoringTeam,
    scorerName,
    ownGoal: isOwnGoal,
    x: state.ball.x,
    y: state.ball.y,
  });
}
