import type {
  BallState,
  GameEvent,
  GameState,
  MatchParticipantStat,
  MatchPhase,
  MatchWinner,
  PlayerState,
  SkillFieldObject,
  Team,
} from './gameEngine.ts';
import type { SkillId } from './skills.ts';

export type CompactPlayerTuple = [
  string, // 0: id
  number, // 1: x
  number, // 2: y
  number, // 3: vx
  number, // 4: vy
  number, // 5: facingAngle
  number, // 6: aimX
  number, // 7: aimY
  number, // 8: stamina
  number, // 9: bitmask (1:isAI, 2:staminaExhausted, 4:isSprinting, 8:isChargingShoot)
  number, // 10: shootCharge
  number, // 11: dribbleCooldown
  number, // 12: dribbleTimer
  number, // 13: lungeTimer
  number, // 14: stealImmunity
  number, // 15: pickupLockout
  number, // 16: gkHoldTimer
  SkillId | null, // 17: activeSkill
  number, // 18: activeSkillTimer
  number, // 19: skillCooldowns[0]
  number, // 20: skillCooldowns[1]
];

export type CompactBallTuple = [
  number, // 0: x
  number, // 1: y
  number, // 2: vx
  number, // 3: vy
  string | null, // 4: possessorId
  Team | null, // 5: lastTouchTeam
  number, // 6: spin
  number, // 7: curveSpin
  number, // 8: accelBoost
  SkillId | null, // 9: shotSkillTag
];

export interface CompactStatePacket {
  type: 'gs';
  k: number; // tick
  p: MatchPhase;
  pt: number; // phaseTimer
  tr: number; // timeRemaining
  ot: number; // overtimeCount
  sb: number; // blue score
  sr: number; // red score
  lt: Team | null;
  ln: string | null;
  og?: 1;
  w: MatchWinner;
  cm: Record<string, string>;
  hs?: string[];
  b: CompactBallTuple;
  pl: CompactPlayerTuple[];
  so?: SkillFieldObject[];
  ev?: GameEvent[];
  ms?: Record<string, MatchParticipantStat>;
  sc?: number; // spectatorCount
  st?: number; // serverTime
}

const r1 = (n: number): number => Math.round(n * 10) / 10;
const r2 = (n: number): number => Math.round(n * 100) / 100;

export function encodeCompactState(
  state: GameState,
  options?: {
    spectatorCount?: number;
    serverTime?: number;
    includeHumanSlots?: boolean;
  }
): CompactStatePacket {
  const b = state.ball;
  const ballTuple: CompactBallTuple = [
    r1(b.x),
    r1(b.y),
    r1(b.vx),
    r1(b.vy),
    b.possessorId,
    b.lastTouchTeam,
    r2(b.spin),
    r2(b.curveSpin),
    r2(b.accelBoost),
    b.shotSkillTag,
  ];

  const players: CompactPlayerTuple[] = new Array(state.players.length);
  for (let i = 0; i < state.players.length; i++) {
    const p = state.players[i];
    const flags =
      (p.isAI ? 1 : 0) |
      (p.staminaExhausted ? 2 : 0) |
      (p.isSprinting ? 4 : 0) |
      (p.isChargingShoot ? 8 : 0);
    players[i] = [
      p.id,
      r1(p.x),
      r1(p.y),
      r1(p.vx),
      r1(p.vy),
      r2(p.facingAngle),
      r2(p.aimX),
      r2(p.aimY),
      r1(p.stamina),
      flags,
      r2(p.shootCharge),
      r2(p.dribbleCooldown),
      r2(p.dribbleTimer),
      r2(p.lungeTimer),
      r2(p.stealImmunity),
      r2(p.pickupLockout),
      r2(p.gkHoldTimer),
      p.activeSkill,
      r2(p.activeSkillTimer),
      r2(p.skillCooldowns[0] ?? 0),
      r2(p.skillCooldowns[1] ?? 0),
    ];
  }

  const pkt: CompactStatePacket = {
    type: 'gs',
    k: state.tick,
    p: state.phase,
    pt: r2(state.phaseTimer),
    tr: r1(state.timeRemaining),
    ot: state.overtimeCount,
    sb: state.score.blue,
    sr: state.score.red,
    lt: state.lastScorerTeam,
    ln: state.lastScorerName,
    w: state.winner,
    cm: state.controlMap,
    b: ballTuple,
    pl: players,
  };

  if (state.lastGoalOwnGoal) pkt.og = 1;
  if (options?.includeHumanSlots) pkt.hs = state.humanSlots;
  if (state.skillObjects.length > 0) pkt.so = state.skillObjects;
  if (state.events.length > 0) pkt.ev = state.events;
  if (state.phase === 'FINISHED' && state.matchStats) pkt.ms = state.matchStats;
  if (options?.spectatorCount !== undefined) pkt.sc = options.spectatorCount;
  if (options?.serverTime !== undefined) pkt.st = options.serverTime;

  return pkt;
}

export function applyCompactState(
  prev: GameState,
  pkt: CompactStatePacket
): GameState {
  const prevById = new Map<string, PlayerState>();
  for (let i = 0; i < prev.players.length; i++) {
    prevById.set(prev.players[i].id, prev.players[i]);
  }

  const nextPlayers: PlayerState[] = new Array(pkt.pl.length);
  for (let i = 0; i < pkt.pl.length; i++) {
    const tuple = pkt.pl[i];
    const base = prevById.get(tuple[0]);
    const flags = tuple[9];
    const isAI = (flags & 1) !== 0;
    const staminaExhausted = (flags & 2) !== 0;
    const isSprinting = (flags & 4) !== 0;
    const isChargingShoot = (flags & 8) !== 0;

    if (base) {
      nextPlayers[i] = {
        ...base,
        x: tuple[1],
        y: tuple[2],
        vx: tuple[3],
        vy: tuple[4],
        facingAngle: tuple[5],
        aimX: tuple[6],
        aimY: tuple[7],
        stamina: tuple[8],
        isAI,
        staminaExhausted,
        isSprinting,
        isChargingShoot,
        shootCharge: tuple[10],
        dribbleCooldown: tuple[11],
        dribbleTimer: tuple[12],
        lungeTimer: tuple[13],
        stealImmunity: tuple[14],
        pickupLockout: tuple[15],
        gkHoldTimer: tuple[16],
        activeSkill: tuple[17],
        activeSkillTimer: tuple[18],
        skillCooldowns: [tuple[19], tuple[20]],
      };
    } else {
      const team: Team = tuple[0].startsWith('red') ? 'red' : 'blue';
      nextPlayers[i] = {
        id: tuple[0],
        name: tuple[0],
        baseName: tuple[0],
        team,
        number: 1,
        role: 'MID',
        isGoalkeeper: false,
        isAI,
        x: tuple[1],
        y: tuple[2],
        vx: tuple[3],
        vy: tuple[4],
        facingAngle: tuple[5],
        aimX: tuple[6],
        aimY: tuple[7],
        dribbleTimer: tuple[12],
        dribbleCooldown: tuple[11],
        lungeTimer: tuple[13],
        pickupLockout: tuple[15],
        stealImmunity: tuple[14],
        gkHoldTimer: tuple[16],
        stamina: tuple[8],
        staminaExhausted,
        isSprinting,
        shootCharge: tuple[10],
        isChargingShoot,
        prevShoot: false,
        prevDribble: false,
        prevPass: false,
        prevSwitchPlayer: false,
        prevSkill1: false,
        prevSkill2: false,
        equippedSkills: [],
        skillCooldowns: [tuple[19], tuple[20]],
        activeSkill: tuple[17],
        activeSkillTimer: tuple[18],
      };
    }
  }

  const bt = pkt.b;
  const nextBall: BallState = {
    ...prev.ball,
    x: bt[0],
    y: bt[1],
    vx: bt[2],
    vy: bt[3],
    possessorId: bt[4],
    lastTouchTeam: bt[5],
    spin: bt[6],
    curveSpin: bt[7],
    accelBoost: bt[8],
    shotSkillTag: bt[9],
  };

  return {
    ...prev,
    tick: pkt.k,
    phase: pkt.p,
    phaseTimer: pkt.pt,
    timeRemaining: pkt.tr,
    overtimeCount: pkt.ot,
    score: { blue: pkt.sb, red: pkt.sr },
    lastScorerTeam: pkt.lt,
    lastScorerName: pkt.ln,
    lastGoalOwnGoal: Boolean(pkt.og),
    winner: pkt.w,
    controlMap: pkt.cm,
    humanSlots: pkt.hs ?? prev.humanSlots,
    players: nextPlayers,
    ball: nextBall,
    skillObjects: pkt.so ?? [],
    events: pkt.ev ?? [],
    matchStats: pkt.ms ?? prev.matchStats,
  };
}
