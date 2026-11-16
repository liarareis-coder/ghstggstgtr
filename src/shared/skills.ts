export type SkillRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type SkillId =
  | 'phantom-dribble'
  | 'thunder-pass'
  | 'aerial-dominance'
  | 'eagle-shot'
  | 'godspeed'
  | 'dragon-curve'
  | 'bloodhound'
  | 'shadow-step'
  | 'meteor-strike'
  | 'steal-master'
  | 'cyclone-dribble'
  | 'gravity-control'
  | 'clone-feint'
  | 'zero-angle'
  | 'devils-touch'
  | 'kings-awakening'
  | 'overdrive'
  | 'absolute-reflex'
  | 'iron-wall'
  | 'predator-vision';

export interface SkillDefinition {
  id: SkillId;
  number: number;
  name: string;
  description: string;
  rarity: SkillRarity;
  cooldown: number;
  duration: number;
  color: string;
  icon: string;
}

export const RARITY_META: Record<
  SkillRarity,
  {
    labelPt: string;
    labelEn: string;
    labelEs: string;
    color: string;
    bgClass: string;
    borderClass: string;
    textClass: string;
  }
> = {
  common: {
    labelPt: 'Comum',
    labelEn: 'Common',
    labelEs: 'Común',
    color: '#94A3B8',
    bgClass: 'bg-slate-500/15',
    borderClass: 'border-slate-400/45',
    textClass: 'text-slate-200',
  },
  rare: {
    labelPt: 'Raro',
    labelEn: 'Rare',
    labelEs: 'Raro',
    color: '#38BDF8',
    bgClass: 'bg-sky-500/15',
    borderClass: 'border-sky-400/55',
    textClass: 'text-sky-300',
  },
  epic: {
    labelPt: 'Épico',
    labelEn: 'Epic',
    labelEs: 'Épico',
    color: '#A855F7',
    bgClass: 'bg-purple-500/20',
    borderClass: 'border-purple-400/60',
    textClass: 'text-purple-300',
  },
  legendary: {
    labelPt: 'Lendário',
    labelEn: 'Legendary',
    labelEs: 'Legendario',
    color: '#FBBF24',
    bgClass: 'bg-amber-500/20',
    borderClass: 'border-amber-400/70',
    textClass: 'text-amber-300',
  },
  mythic: {
    labelPt: 'Mítico',
    labelEn: 'Mythic',
    labelEs: 'Mítico',
    color: '#F43F5E',
    bgClass: 'bg-rose-500/20',
    borderClass: 'border-rose-400/75',
    textClass: 'text-rose-300',
  },
};

export const SKILLS_CATALOG: SkillDefinition[] = [
  // Comum (3)
  {
    id: 'phantom-dribble',
    number: 1,
    name: 'Phantom Dribble',
    description: 'Dribla o adversário com movimentos extremamente rápidos.',
    rarity: 'common',
    cooldown: 7,
    duration: 0.55,
    color: '#94A3B8',
    icon: '👻',
  },
  {
    id: 'thunder-pass',
    number: 11,
    name: 'Thunder Pass',
    description: 'Passe extremamente rápido e preciso.',
    rarity: 'common',
    cooldown: 7,
    duration: 1.4,
    color: '#38BDF8',
    icon: '⚡',
  },
  {
    id: 'aerial-dominance',
    number: 13,
    name: 'Aerial Dominance',
    description: 'Aumenta a capacidade de salto e disputa aérea.',
    rarity: 'common',
    cooldown: 8,
    duration: 2.2,
    color: '#34D399',
    icon: '🦅',
  },

  // Raro (4)
  {
    id: 'eagle-shot',
    number: 2,
    name: 'Eagle Shot',
    description: 'Chute de longa distância com precisão absurda.',
    rarity: 'rare',
    cooldown: 9,
    duration: 0.4,
    color: '#0EA5E9',
    icon: '🎯',
  },
  {
    id: 'godspeed',
    number: 6,
    name: 'Godspeed',
    description: 'Aumenta drasticamente a velocidade do jogador.',
    rarity: 'rare',
    cooldown: 10,
    duration: 3.0,
    color: '#22D3EE',
    icon: '💨',
  },
  {
    id: 'dragon-curve',
    number: 8,
    name: 'Dragon Curve',
    description: 'Chute com uma curva extremamente acentuada.',
    rarity: 'rare',
    cooldown: 9,
    duration: 0.4,
    color: '#6366F1',
    icon: '🐉',
  },
  {
    id: 'bloodhound',
    number: 12,
    name: 'Bloodhound',
    description: 'Permite perseguir e interceptar a bola automaticamente.',
    rarity: 'rare',
    cooldown: 9,
    duration: 2.4,
    color: '#FB7185',
    icon: '🐺',
  },

  // Épico (4)
  {
    id: 'shadow-step',
    number: 3,
    name: 'Shadow Step',
    description: 'Desaparece momentaneamente e reaparece em outra posição.',
    rarity: 'epic',
    cooldown: 11,
    duration: 0.45,
    color: '#8B5CF6',
    icon: '🌑',
  },
  {
    id: 'meteor-strike',
    number: 4,
    name: 'Meteor Strike',
    description: 'Chute poderoso que ganha velocidade no ar.',
    rarity: 'epic',
    cooldown: 11,
    duration: 0.4,
    color: '#F97316',
    icon: '☄️',
  },
  {
    id: 'steal-master',
    number: 14,
    name: 'Steal Master',
    description: 'Rouba a bola instantaneamente de um adversário próximo.',
    rarity: 'epic',
    cooldown: 10,
    duration: 0.5,
    color: '#A855F7',
    icon: '🥷',
  },
  {
    id: 'cyclone-dribble',
    number: 17,
    name: 'Cyclone Dribble',
    description: 'Gira ao redor da bola, afastando os adversários próximos.',
    rarity: 'epic',
    cooldown: 10,
    duration: 2.0,
    color: '#2DD4BF',
    icon: '🌪️',
  },

  // Lendário (4)
  {
    id: 'gravity-control',
    number: 5,
    name: 'Gravity Control',
    description: 'Altera a trajetória da bola durante o chute.',
    rarity: 'legendary',
    cooldown: 12,
    duration: 0.6,
    color: '#FBBF24',
    icon: '🪐',
  },
  {
    id: 'clone-feint',
    number: 9,
    name: 'Clone Feint',
    description: 'Cria ilusões de movimento para confundir o marcador.',
    rarity: 'legendary',
    cooldown: 12,
    duration: 3.2,
    color: '#F59E0B',
    icon: '👥',
  },
  {
    id: 'zero-angle',
    number: 15,
    name: 'Zero Angle',
    description: 'Permite chutar com precisão mesmo de ângulos impossíveis.',
    rarity: 'legendary',
    cooldown: 12,
    duration: 0.45,
    color: '#FDE047',
    icon: '📐',
  },
  {
    id: 'devils-touch',
    number: 18,
    name: "Devil's Touch",
    description: 'Faz a bola passar por espaços extremamente pequenos.',
    rarity: 'legendary',
    cooldown: 12,
    duration: 2.6,
    color: '#FB923C',
    icon: '😈',
  },

  // Mítico (5)
  {
    id: 'kings-awakening',
    number: 20,
    name: "King's Awakening",
    description: 'Desbloqueia um estado especial com habilidades aprimoradas por alguns segundos.',
    rarity: 'mythic',
    cooldown: 16,
    duration: 5.0,
    color: '#F43F5E',
    icon: '👑',
  },
  {
    id: 'overdrive',
    number: 16,
    name: 'Overdrive',
    description: 'Aumenta todos os atributos temporariamente.',
    rarity: 'mythic',
    cooldown: 15,
    duration: 4.5,
    color: '#EC4899',
    icon: '🔋',
  },
  {
    id: 'absolute-reflex',
    number: 19,
    name: 'Absolute Reflex',
    description: 'Permite ao goleiro realizar uma defesa quase impossível.',
    rarity: 'mythic',
    cooldown: 13,
    duration: 2.5,
    color: '#E11D48',
    icon: '🧤',
  },
  {
    id: 'iron-wall',
    number: 10,
    name: 'Iron Wall',
    description: 'Cria uma barreira defensiva temporária.',
    rarity: 'mythic',
    cooldown: 14,
    duration: 4.2,
    color: '#CBD5E1',
    icon: '🧱',
  },
  {
    id: 'predator-vision',
    number: 7,
    name: 'Predator Vision',
    description: 'Revela brevemente os espaços livres e posições adversárias.',
    rarity: 'mythic',
    cooldown: 14,
    duration: 4.8,
    color: '#EF4444',
    icon: '👁️',
  },
];

export const ALL_SKILL_IDS: SkillId[] = SKILLS_CATALOG.map((s) => s.id);

export function isValidSkillId(id: unknown): id is SkillId {
  return typeof id === 'string' && ALL_SKILL_IDS.includes(id as SkillId);
}

export function getSkillById(id: SkillId | string): SkillDefinition | undefined {
  return SKILLS_CATALOG.find((s) => s.id === id);
}

export type LootboxTierId = 'standard' | 'epic' | 'mythic';

export interface LootboxDefinition {
  id: LootboxTierId;
  price: number;
  accentColor: string;
  weights: Record<SkillRarity, number>;
}

export const LOOTBOX_TIERS: LootboxDefinition[] = [
  {
    id: 'standard',
    price: 80,
    accentColor: '#38BDF8',
    weights: {
      common: 55,
      rare: 28,
      epic: 12,
      legendary: 4,
      mythic: 1,
    },
  },
  {
    id: 'epic',
    price: 180,
    accentColor: '#A855F7',
    weights: {
      common: 20,
      rare: 42,
      epic: 26,
      legendary: 9,
      mythic: 3,
    },
  },
  {
    id: 'mythic',
    price: 350,
    accentColor: '#F43F5E',
    weights: {
      common: 0,
      rare: 30,
      epic: 38,
      legendary: 22,
      mythic: 10,
    },
  },
];

export interface LootboxRollOutcome {
  skill: SkillDefinition;
  isDuplicate: boolean;
  refundCoins: number;
}

export function rollSkillLootbox(
  tierId: LootboxTierId,
  alreadyOwned: SkillId[],
  rng: () => number = Math.random
): LootboxRollOutcome {
  const tier = LOOTBOX_TIERS.find((b) => b.id === tierId) ?? LOOTBOX_TIERS[0];
  const entries = (Object.entries(tier.weights) as [SkillRarity, number][]).filter(
    ([, w]) => w > 0
  );
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = rng() * totalWeight;
  let chosenRarity: SkillRarity = entries[0][0];
  for (const [rarity, weight] of entries) {
    roll -= weight;
    if (roll <= 0) {
      chosenRarity = rarity;
      break;
    }
  }

  const pool = SKILLS_CATALOG.filter((s) => s.rarity === chosenRarity);
  const unownedInRarity = pool.filter((s) => !alreadyOwned.includes(s.id));
  const candidatePool = unownedInRarity.length > 0 ? unownedInRarity : pool;
  const picked =
    candidatePool[Math.floor(rng() * candidatePool.length) % candidatePool.length];

  const isDuplicate = alreadyOwned.includes(picked.id);
  const refundCoins = isDuplicate ? Math.round(tier.price * 0.45) : 0;

  return {
    skill: picked,
    isDuplicate,
    refundCoins,
  };
}
