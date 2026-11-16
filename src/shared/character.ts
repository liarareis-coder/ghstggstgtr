export type HairStyleId =
  | 'none'
  | 'spiky'
  | 'afro'
  | 'mohawk'
  | 'headband'
  | 'crown'
  | 'halo'
  | 'horns';

export type JerseyPatternId = 'solid' | 'stripe' | 'sash' | 'star' | 'flame';

export type AuraTrailId = 'none' | 'spark' | 'flame' | 'shadow' | 'frost' | 'ego';

export interface CharacterConfig {
  hairStyle: HairStyleId;
  hairColor: string;
  jerseyPattern: JerseyPatternId;
  auraTrail: AuraTrailId;
  cleatColor: string;
  jerseyNumber: number;
}

export type CosmeticCategory = 'hair' | 'color' | 'pattern' | 'aura' | 'cleat';

export interface CosmeticItem {
  id: string;
  category: CosmeticCategory;
  value: string;
  price: number;
  previewHex?: string;
}

export const HAIR_COLOR_OPTIONS: Array<{ id: string; hex: string; price: number }> = [
  { id: 'color:dark', hex: '#0F172A', price: 0 },
  { id: 'color:gold', hex: '#FACC15', price: 45 },
  { id: 'color:ego', hex: '#38BDF8', price: 60 },
  { id: 'color:crimson', hex: '#EF4444', price: 75 },
  { id: 'color:neon', hex: '#EC4899', price: 90 },
  { id: 'color:silver', hex: '#F8FAFC', price: 110 },
];

export const CLEAT_COLOR_OPTIONS: Array<{ id: string; hex: string; price: number }> = [
  { id: 'cleat:white', hex: '#F8FAFC', price: 0 },
  { id: 'cleat:gold', hex: '#FBBF24', price: 50 },
  { id: 'cleat:cyan', hex: '#22D3EE', price: 65 },
  { id: 'cleat:crimson', hex: '#F43F5E', price: 85 },
  { id: 'cleat:emerald', hex: '#34D399', price: 85 },
];

export const CHARACTER_COSMETICS: CosmeticItem[] = [
  // Hair / Headwear
  { id: 'hair:none', category: 'hair', value: 'none', price: 0 },
  { id: 'hair:spiky', category: 'hair', value: 'spiky', price: 60 },
  { id: 'hair:headband', category: 'hair', value: 'headband', price: 80 },
  { id: 'hair:afro', category: 'hair', value: 'afro', price: 95 },
  { id: 'hair:mohawk', category: 'hair', value: 'mohawk', price: 120 },
  { id: 'hair:horns', category: 'hair', value: 'horns', price: 180 },
  { id: 'hair:halo', category: 'hair', value: 'halo', price: 240 },
  { id: 'hair:crown', category: 'hair', value: 'crown', price: 320 },

  // Hair / Accent Colors
  ...HAIR_COLOR_OPTIONS.map((c) => ({
    id: c.id,
    category: 'color' as const,
    value: c.hex,
    price: c.price,
    previewHex: c.hex,
  })),

  // Jersey Patterns
  { id: 'pattern:solid', category: 'pattern', value: 'solid', price: 0 },
  { id: 'pattern:stripe', category: 'pattern', value: 'stripe', price: 70 },
  { id: 'pattern:sash', category: 'pattern', value: 'sash', price: 95 },
  { id: 'pattern:star', category: 'pattern', value: 'star', price: 140 },
  { id: 'pattern:flame', category: 'pattern', value: 'flame', price: 210 },

  // Aura / Footstep Trails
  { id: 'aura:none', category: 'aura', value: 'none', price: 0 },
  { id: 'aura:spark', category: 'aura', value: 'spark', price: 110, previewHex: '#38BDF8' },
  { id: 'aura:flame', category: 'aura', value: 'flame', price: 150, previewHex: '#F97316' },
  { id: 'aura:frost', category: 'aura', value: 'frost', price: 165, previewHex: '#67E8F9' },
  { id: 'aura:shadow', category: 'aura', value: 'shadow', price: 220, previewHex: '#8B5CF6' },
  { id: 'aura:ego', category: 'aura', value: 'ego', price: 340, previewHex: '#F43F5E' },

  // Cleats / Rim Glow
  ...CLEAT_COLOR_OPTIONS.map((c) => ({
    id: c.id,
    category: 'cleat' as const,
    value: c.hex,
    price: c.price,
    previewHex: c.hex,
  })),
];

export const ALL_COSMETIC_IDS = CHARACTER_COSMETICS.map((c) => c.id);
export const FREE_COSMETIC_IDS = CHARACTER_COSMETICS.filter((c) => c.price === 0).map((c) => c.id);

const VALID_HAIR_STYLES: HairStyleId[] = [
  'none',
  'spiky',
  'afro',
  'mohawk',
  'headband',
  'crown',
  'halo',
  'horns',
];
const VALID_PATTERNS: JerseyPatternId[] = ['solid', 'stripe', 'sash', 'star', 'flame'];
const VALID_AURAS: AuraTrailId[] = ['none', 'spark', 'flame', 'shadow', 'frost', 'ego'];
const VALID_HAIR_HEXES = HAIR_COLOR_OPTIONS.map((c) => c.hex);
const VALID_CLEAT_HEXES = CLEAT_COLOR_OPTIONS.map((c) => c.hex);

export function createDefaultCharacterConfig(): CharacterConfig {
  return {
    hairStyle: 'none',
    hairColor: '#0F172A',
    jerseyPattern: 'solid',
    auraTrail: 'none',
    cleatColor: '#F8FAFC',
    jerseyNumber: 10,
  };
}

export function sanitizeUnlockedCosmetics(raw: unknown): string[] {
  const set = new Set<string>(FREE_COSMETIC_IDS);
  if (Array.isArray(raw)) {
    for (const id of raw) {
      if (typeof id === 'string' && ALL_COSMETIC_IDS.includes(id)) {
        set.add(id);
      }
    }
  }
  return Array.from(set);
}

export function sanitizeCharacterConfig(
  raw: unknown,
  unlockedCosmetics?: string[]
): CharacterConfig {
  const def = createDefaultCharacterConfig();
  if (!raw || typeof raw !== 'object') return def;
  const r = raw as Record<string, unknown>;

  const hairStyle =
    typeof r.hairStyle === 'string' &&
    VALID_HAIR_STYLES.includes(r.hairStyle as HairStyleId)
      ? (r.hairStyle as HairStyleId)
      : def.hairStyle;
  const hairColor =
    typeof r.hairColor === 'string' && VALID_HAIR_HEXES.includes(r.hairColor)
      ? r.hairColor
      : def.hairColor;
  const jerseyPattern =
    typeof r.jerseyPattern === 'string' &&
    VALID_PATTERNS.includes(r.jerseyPattern as JerseyPatternId)
      ? (r.jerseyPattern as JerseyPatternId)
      : def.jerseyPattern;
  const auraTrail =
    typeof r.auraTrail === 'string' && VALID_AURAS.includes(r.auraTrail as AuraTrailId)
      ? (r.auraTrail as AuraTrailId)
      : def.auraTrail;
  const cleatColor =
    typeof r.cleatColor === 'string' && VALID_CLEAT_HEXES.includes(r.cleatColor)
      ? r.cleatColor
      : def.cleatColor;

  const rawNum = Number(r.jerseyNumber);
  const jerseyNumber =
    Number.isFinite(rawNum) && rawNum >= 1 && rawNum <= 99 ? Math.floor(rawNum) : 10;

  if (!unlockedCosmetics) {
    return {
      hairStyle,
      hairColor,
      jerseyPattern,
      auraTrail,
      cleatColor,
      jerseyNumber,
    };
  }

  const hairId = `hair:${hairStyle}`;
  const patternId = `pattern:${jerseyPattern}`;
  const auraId = `aura:${auraTrail}`;
  const colorItem = HAIR_COLOR_OPTIONS.find((c) => c.hex === hairColor);
  const cleatItem = CLEAT_COLOR_OPTIONS.find((c) => c.hex === cleatColor);

  return {
    hairStyle: unlockedCosmetics.includes(hairId) ? hairStyle : def.hairStyle,
    hairColor:
      colorItem && unlockedCosmetics.includes(colorItem.id) ? hairColor : def.hairColor,
    jerseyPattern: unlockedCosmetics.includes(patternId)
      ? jerseyPattern
      : def.jerseyPattern,
    auraTrail: unlockedCosmetics.includes(auraId) ? auraTrail : def.auraTrail,
    cleatColor:
      cleatItem && unlockedCosmetics.includes(cleatItem.id)
        ? cleatColor
        : def.cleatColor,
    jerseyNumber,
  };
}
