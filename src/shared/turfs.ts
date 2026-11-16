export type PitchTurfId =
  | 'classic'
  | 'checker'
  | 'street'
  | 'neon'
  | 'beach'
  | 'futsal'
  | 'clay'
  | 'lava'
  | 'frost'
  | 'sakura'
  | 'imperial'
  | 'galaxy';

export type PitchPatternStyle =
  | 'stripes'
  | 'checker'
  | 'asphalt'
  | 'neon'
  | 'sand'
  | 'parquet'
  | 'clay'
  | 'magma'
  | 'frost'
  | 'sakura'
  | 'royal'
  | 'galaxy';

export interface PitchTurfDefinition {
  id: PitchTurfId;
  price: number;
  pattern: PitchPatternStyle;
  backdropColor: string;
  apronColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  lineColor: string;
  centerDotColor: string;
  previewGradient: string;
  badgeEmoji: string;
}

export const PITCH_TURFS: PitchTurfDefinition[] = [
  {
    id: 'classic',
    price: 0,
    pattern: 'stripes',
    backdropColor: '#0D191E',
    apronColor: '#0E3F27',
    primaryColor: '#14532D',
    secondaryColor: '#166534',
    accentColor: 'rgba(255,255,255,0.04)',
    lineColor: 'rgba(248, 250, 252, 0.78)',
    centerDotColor: 'rgba(248, 250, 252, 0.85)',
    previewGradient: 'linear-gradient(135deg, #14532D 0%, #166534 50%, #14532D 100%)',
    badgeEmoji: '🌿',
  },
  {
    id: 'checker',
    price: 100,
    pattern: 'checker',
    backdropColor: '#0A1612',
    apronColor: '#0B462B',
    primaryColor: '#15803D',
    secondaryColor: '#115E34',
    accentColor: 'rgba(167,243,208,0.08)',
    lineColor: 'rgba(248, 250, 252, 0.84)',
    centerDotColor: '#FDE047',
    previewGradient:
      'repeating-conic-gradient(#15803D 0% 25%, #115E34 0% 50%) 50% / 24px 24px',
    badgeEmoji: '🏁',
  },
  {
    id: 'neon',
    price: 180,
    pattern: 'neon',
    backdropColor: '#050814',
    apronColor: '#091128',
    primaryColor: '#0D1734',
    secondaryColor: '#11224B',
    accentColor: 'rgba(34, 211, 238, 0.16)',
    lineColor: 'rgba(56, 189, 248, 0.92)',
    centerDotColor: '#34D399',
    previewGradient: 'linear-gradient(135deg, #091128 0%, #11224B 50%, #0D3B5E 100%)',
    badgeEmoji: '⚡',
  },
  {
    id: 'futsal',
    price: 260,
    pattern: 'parquet',
    backdropColor: '#18100A',
    apronColor: '#4A2C16',
    primaryColor: '#B4763E',
    secondaryColor: '#9C6231',
    accentColor: 'rgba(254, 243, 199, 0.12)',
    lineColor: 'rgba(255, 251, 235, 0.88)',
    centerDotColor: '#FBBF24',
    previewGradient: 'linear-gradient(135deg, #9C6231 0%, #B4763E 50%, #844E23 100%)',
    badgeEmoji: '🪵',
  },
  {
    id: 'clay',
    price: 340,
    pattern: 'clay',
    backdropColor: '#1A0E0A',
    apronColor: '#5B2617',
    primaryColor: '#9A4326',
    secondaryColor: '#86381F',
    accentColor: 'rgba(253, 186, 116, 0.1)',
    lineColor: 'rgba(255, 247, 237, 0.86)',
    centerDotColor: '#FDBA74',
    previewGradient: 'linear-gradient(135deg, #86381F 0%, #9A4326 50%, #742D17 100%)',
    badgeEmoji: '🧱',
  },
  {
    id: 'frost',
    price: 450,
    pattern: 'frost',
    backdropColor: '#081724',
    apronColor: '#0E334D',
    primaryColor: '#164E63',
    secondaryColor: '#1E5F78',
    accentColor: 'rgba(186, 230, 253, 0.18)',
    lineColor: 'rgba(224, 242, 254, 0.92)',
    centerDotColor: '#38BDF8',
    previewGradient: 'linear-gradient(135deg, #0E334D 0%, #1E5F78 55%, #164E63 100%)',
    badgeEmoji: '❄️',
  },
  {
    id: 'imperial',
    price: 650,
    pattern: 'royal',
    backdropColor: '#0D0C14',
    apronColor: '#1E1B2E',
    primaryColor: '#113A2F',
    secondaryColor: '#0C2D24',
    accentColor: 'rgba(250, 204, 21, 0.18)',
    lineColor: 'rgba(253, 224, 71, 0.88)',
    centerDotColor: '#FDE047',
    previewGradient: 'linear-gradient(135deg, #1E1B2E 0%, #113A2F 55%, #3B2F13 100%)',
    badgeEmoji: '👑',
  },
  {
    id: 'street',
    price: 150,
    pattern: 'asphalt',
    backdropColor: '#0F1115',
    apronColor: '#1E232B',
    primaryColor: '#2B313B',
    secondaryColor: '#232830',
    accentColor: 'rgba(250, 204, 21, 0.16)',
    lineColor: 'rgba(250, 204, 21, 0.88)',
    centerDotColor: '#FACC15',
    previewGradient: 'linear-gradient(135deg, #1E232B 0%, #2B313B 55%, #3A3F4B 100%)',
    badgeEmoji: '🛣️',
  },
  {
    id: 'beach',
    price: 220,
    pattern: 'sand',
    backdropColor: '#1C160C',
    apronColor: '#0C4A6E',
    primaryColor: '#D9AE68',
    secondaryColor: '#C89B54',
    accentColor: 'rgba(254, 243, 199, 0.24)',
    lineColor: 'rgba(255, 255, 255, 0.9)',
    centerDotColor: '#38BDF8',
    previewGradient: 'linear-gradient(135deg, #C89B54 0%, #E0BA78 55%, #B88B44 100%)',
    badgeEmoji: '🏖️',
  },
  {
    id: 'lava',
    price: 420,
    pattern: 'magma',
    backdropColor: '#120605',
    apronColor: '#2B0D08',
    primaryColor: '#261414',
    secondaryColor: '#1B0E0E',
    accentColor: 'rgba(249, 115, 22, 0.55)',
    lineColor: 'rgba(251, 146, 60, 0.9)',
    centerDotColor: '#EF4444',
    previewGradient: 'linear-gradient(135deg, #1B0E0E 0%, #431407 55%, #9A3412 100%)',
    badgeEmoji: '🌋',
  },
  {
    id: 'sakura',
    price: 500,
    pattern: 'sakura',
    backdropColor: '#170E18',
    apronColor: '#3B1B31',
    primaryColor: '#1B3B36',
    secondaryColor: '#17322E',
    accentColor: 'rgba(249, 168, 212, 0.35)',
    lineColor: 'rgba(251, 207, 232, 0.9)',
    centerDotColor: '#F472B6',
    previewGradient: 'linear-gradient(135deg, #1B3B36 0%, #3B1B31 60%, #831843 100%)',
    badgeEmoji: '🌸',
  },
  {
    id: 'galaxy',
    price: 780,
    pattern: 'galaxy',
    backdropColor: '#05040D',
    apronColor: '#130D2E',
    primaryColor: '#0E0A26',
    secondaryColor: '#18113B',
    accentColor: 'rgba(192, 132, 252, 0.35)',
    lineColor: 'rgba(196, 181, 253, 0.92)',
    centerDotColor: '#E879F9',
    previewGradient: 'linear-gradient(135deg, #0E0A26 0%, #2E1065 55%, #4C1D95 100%)',
    badgeEmoji: '🌌',
  },
];

export const ALL_TURF_IDS: PitchTurfId[] = PITCH_TURFS.map((t) => t.id);

export function isValidTurfId(val: unknown): val is PitchTurfId {
  return typeof val === 'string' && ALL_TURF_IDS.includes(val as PitchTurfId);
}

export function getTurfById(id: PitchTurfId | string | undefined | null): PitchTurfDefinition {
  return PITCH_TURFS.find((t) => t.id === id) ?? PITCH_TURFS[0];
}

export function calculateMultiplayerCoins(
  result: 'win' | 'loss' | 'draw',
  goalsFor: number,
  isRanked: boolean
): number {
  const base = result === 'win' ? 60 : result === 'draw' ? 35 : 20;
  const goalBonus = Math.min(25, Math.max(0, Math.floor(goalsFor)) * 5);
  const rankedBonus = isRanked ? 15 : 0;
  return base + goalBonus + rankedBonus;
}
