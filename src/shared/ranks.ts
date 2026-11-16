export type RankId =
  | 'bronze'
  | 'prata'
  | 'ouro'
  | 'diamante'
  | 'platina'
  | 'titanio'
  | 'legend'
  | 'supersonic-legend'
  | 'champion'
  | 'supersonic-champion';

export type SubLevel = 1 | 2 | 3;
export type SubLevelRoman = 'I' | 'II' | 'III';

export const SUB_LEVEL_ROMANS: Record<SubLevel, SubLevelRoman> = {
  1: 'I',
  2: 'II',
  3: 'III',
};

export interface RankTier {
  id: RankId;
  name: string;
  shortName: string;
  minExp: number;
  color: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  icon: string;
}

export const RANK_TIERS: RankTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    shortName: 'Bronze',
    minExp: 0,
    color: '#CD7F32',
    bgClass: 'bg-amber-900/35',
    borderClass: 'border-amber-700/60',
    textClass: 'text-amber-400',
    icon: '🥉',
  },
  {
    id: 'prata',
    name: 'Prata',
    shortName: 'Prata',
    minExp: 200,
    color: '#CBD5E1',
    bgClass: 'bg-slate-400/15',
    borderClass: 'border-slate-300/45',
    textClass: 'text-slate-200',
    icon: '🥈',
  },
  {
    id: 'ouro',
    name: 'Ouro',
    shortName: 'Ouro',
    minExp: 450,
    color: '#FBBF24',
    bgClass: 'bg-yellow-500/20',
    borderClass: 'border-yellow-400/55',
    textClass: 'text-yellow-300',
    icon: '🥇',
  },
  {
    id: 'diamante',
    name: 'Diamante',
    shortName: 'Diamante',
    minExp: 800,
    color: '#38BDF8',
    bgClass: 'bg-sky-500/20',
    borderClass: 'border-sky-400/55',
    textClass: 'text-sky-300',
    icon: '💎',
  },
  {
    id: 'platina',
    name: 'Platina',
    shortName: 'Platina',
    minExp: 1250,
    color: '#2DD4BF',
    bgClass: 'bg-teal-500/20',
    borderClass: 'border-teal-300/55',
    textClass: 'text-teal-200',
    icon: '💠',
  },
  {
    id: 'titanio',
    name: 'Titânio',
    shortName: 'Titânio',
    minExp: 1800,
    color: '#A78BFA',
    bgClass: 'bg-violet-500/20',
    borderClass: 'border-violet-400/55',
    textClass: 'text-violet-200',
    icon: '🛡️',
  },
  {
    id: 'legend',
    name: 'Legend',
    shortName: 'Legend',
    minExp: 2500,
    color: '#FB7185',
    bgClass: 'bg-rose-500/20',
    borderClass: 'border-rose-400/55',
    textClass: 'text-rose-300',
    icon: '🔥',
  },
  {
    id: 'supersonic-legend',
    name: 'Supersonic Legend',
    shortName: 'S. Legend',
    minExp: 3400,
    color: '#F472B6',
    bgClass: 'bg-fuchsia-500/20',
    borderClass: 'border-fuchsia-400/60',
    textClass: 'text-fuchsia-200',
    icon: '⚡',
  },
  {
    id: 'champion',
    name: 'Champion',
    shortName: 'Champion',
    minExp: 4500,
    color: '#F97316',
    bgClass: 'bg-orange-500/20',
    borderClass: 'border-orange-400/60',
    textClass: 'text-orange-300',
    icon: '👑',
  },
  {
    id: 'supersonic-champion',
    name: 'Supersonic Champion',
    shortName: 'S. Champion',
    minExp: 5800,
    color: '#FDE047',
    bgClass: 'bg-amber-400/25',
    borderClass: 'border-yellow-300/75',
    textClass: 'text-yellow-200',
    icon: '🏆',
  },
];

export const TOP_TIER_SUB_STEP = 450;

export function getTierSubThresholds(tierIndex: number): [number, number, number] {
  const safeIdx = Math.max(0, Math.min(RANK_TIERS.length - 1, tierIndex));
  const tier = RANK_TIERS[safeIdx];
  const nextTier = safeIdx < RANK_TIERS.length - 1 ? RANK_TIERS[safeIdx + 1] : null;
  if (!nextTier) {
    return [
      tier.minExp,
      tier.minExp + TOP_TIER_SUB_STEP,
      tier.minExp + TOP_TIER_SUB_STEP * 2,
    ];
  }
  const span = nextTier.minExp - tier.minExp;
  return [
    tier.minExp,
    tier.minExp + Math.round(span / 3),
    tier.minExp + Math.round((span * 2) / 3),
  ];
}

export function formatRankWithSubLevel(tierName: string, subLevel: SubLevel): string {
  return `${tierName} ${SUB_LEVEL_ROMANS[subLevel]}`;
}

export interface RankProgressInfo {
  tier: RankTier;
  tierIndex: number;
  nextTier: RankTier | null;
  subLevel: SubLevel;
  subLevelRoman: SubLevelRoman;
  globalDivision: number; // 1..30 (3 sub-levels per rank tier)
  exp: number;
  expInTier: number;
  expForNextTier: number;
  progressPercent: number;
  subMinExp: number;
  nextSubMinExp: number | null;
  expForNextSub: number;
  subProgressPercent: number;
}

export function getRankInfo(rawExp: number): RankProgressInfo {
  const exp = Math.max(0, Math.floor(rawExp || 0));
  let tierIndex = 0;
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (exp >= RANK_TIERS[i].minExp) {
      tierIndex = i;
      break;
    }
  }
  const tier = RANK_TIERS[tierIndex];
  const nextTier = tierIndex < RANK_TIERS.length - 1 ? RANK_TIERS[tierIndex + 1] : null;
  const [t1, t2, t3] = getTierSubThresholds(tierIndex);

  let subLevel: SubLevel = 1;
  if (exp >= t3) subLevel = 3;
  else if (exp >= t2) subLevel = 2;
  else subLevel = 1;

  const subMinExp = subLevel === 1 ? t1 : subLevel === 2 ? t2 : t3;
  const nextSubMinExp =
    subLevel === 1
      ? t2
      : subLevel === 2
      ? t3
      : nextTier
      ? nextTier.minExp
      : null;

  const subProgressPercent =
    nextSubMinExp === null
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            Math.round(((exp - subMinExp) / Math.max(1, nextSubMinExp - subMinExp)) * 100)
          )
        );
  const expForNextSub = nextSubMinExp === null ? 0 : Math.max(0, nextSubMinExp - exp);
  const globalDivision = tierIndex * 3 + subLevel;

  if (!nextTier) {
    const topSpan = TOP_TIER_SUB_STEP * 3;
    const inTier = Math.max(0, exp - tier.minExp);
    return {
      tier,
      tierIndex,
      nextTier: null,
      subLevel,
      subLevelRoman: SUB_LEVEL_ROMANS[subLevel],
      globalDivision,
      exp,
      expInTier: inTier,
      expForNextTier: 0,
      progressPercent: Math.min(100, Math.round((inTier / topSpan) * 100)),
      subMinExp,
      nextSubMinExp,
      expForNextSub,
      subProgressPercent,
    };
  }

  const span = Math.max(1, nextTier.minExp - tier.minExp);
  const inTier = Math.max(0, exp - tier.minExp);
  return {
    tier,
    tierIndex,
    nextTier,
    subLevel,
    subLevelRoman: SUB_LEVEL_ROMANS[subLevel],
    globalDivision,
    exp,
    expInTier: inTier,
    expForNextTier: nextTier.minExp - exp,
    progressPercent: Math.min(100, Math.round((inTier / span) * 100)),
    subMinExp,
    nextSubMinExp,
    expForNextSub,
    subProgressPercent,
  };
}

export function calculateRankedExpDelta(
  result: 'win' | 'loss' | 'draw',
  goalsFor: number,
  goalsAgainst: number,
  currentExp: number
): {
  expDelta: number;
  nextExp: number;
  prevRank: RankTier;
  nextRank: RankTier;
  prevSubLevel: SubLevel;
  nextSubLevel: SubLevel;
  promoted: boolean;
  tierPromoted: boolean;
} {
  const safeExp = Math.max(0, Math.floor(currentExp || 0));
  const prevInfo = getRankInfo(safeExp);
  const goalBonus = Math.min(40, Math.max(0, goalsFor) * 8);
  const cleanSheetBonus = goalsAgainst === 0 && result === 'win' ? 15 : 0;

  let delta = 0;
  if (result === 'win') {
    delta = 65 + goalBonus + cleanSheetBonus;
  } else if (result === 'draw') {
    delta = 25 + Math.min(20, Math.max(0, goalsFor) * 5);
  } else {
    const basePenalty = prevInfo.tierIndex >= 5 ? -28 : prevInfo.tierIndex >= 2 ? -18 : -10;
    const goalOffset = Math.min(15, Math.max(0, goalsFor) * 4);
    delta = Math.min(-4, basePenalty + goalOffset);
  }

  const nextExp = Math.max(0, safeExp + delta);
  const actualDelta = nextExp - safeExp;
  const nextInfo = getRankInfo(nextExp);

  return {
    expDelta: actualDelta,
    nextExp,
    prevRank: prevInfo.tier,
    nextRank: nextInfo.tier,
    prevSubLevel: prevInfo.subLevel,
    nextSubLevel: nextInfo.subLevel,
    promoted: nextInfo.globalDivision > prevInfo.globalDivision,
    tierPromoted: nextInfo.tierIndex > prevInfo.tierIndex,
  };
}

export const SEASON_DURATION_DAYS = 21; // 3 semanas
export const SEASON_DURATION_MS = SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000;
export const SEASON_ANCHOR_MS = Date.UTC(2026, 10, 15, 20, 0, 0);

export interface SeasonTimerInfo {
  seasonNumber: number;
  seasonStartMs: number;
  seasonEndMs: number;
  remainingMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progressPercent: number;
}

export function getCurrentSeasonInfo(nowMs: number = Date.now()): SeasonTimerInfo {
  const safeNow = Math.max(SEASON_ANCHOR_MS, Math.floor(nowMs));
  const elapsed = safeNow - SEASON_ANCHOR_MS;
  const seasonNumber = Math.floor(elapsed / SEASON_DURATION_MS) + 1;
  const seasonStartMs = SEASON_ANCHOR_MS + (seasonNumber - 1) * SEASON_DURATION_MS;
  const seasonEndMs = seasonStartMs + SEASON_DURATION_MS;
  const remainingMs = Math.max(0, seasonEndMs - safeNow);
  const totalSec = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((safeNow - seasonStartMs) / SEASON_DURATION_MS) * 100))
  );
  return {
    seasonNumber,
    seasonStartMs,
    seasonEndMs,
    remainingMs,
    days,
    hours,
    minutes,
    seconds,
    progressPercent,
  };
}

export function formatSeasonCountdown(info: SeasonTimerInfo): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${info.days}d ${pad(info.hours)}h ${pad(info.minutes)}m ${pad(info.seconds)}s`;
}

