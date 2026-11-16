export type GoalAnimationId =
  | 'classic'
  | 'fireworks'
  | 'lightning'
  | 'supernova'
  | 'matrix';

export type TrailAnimationId =
  | 'standard'
  | 'flame-dash'
  | 'frost-nova'
  | 'shadow-echo'
  | 'gold-aura';

export interface AnimationItem {
  id: string;
  kind: 'goal' | 'trail';
  value: GoalAnimationId | TrailAnimationId;
  price: number;
  accentColor: string;
  icon: string;
}

export interface AnimationConfig {
  goalAnimation: GoalAnimationId;
  trailAnimation: TrailAnimationId;
  fieldAnimDurationMs: number;
  lootboxAnimDurationMs: number;
  uiAnimDurationMs: number;
}

export interface MenuConfig {
  menuLayout: 'default' | 'compact';
  menuBackdropMode: 'stadium' | 'minimal';
  showMenuRules: boolean;
  menuKeyboardNav: boolean;
  menuAnimations: boolean;
}

export const GOAL_ANIMATIONS: AnimationItem[] = [
  {
    id: 'goal:classic',
    kind: 'goal',
    value: 'classic',
    price: 0,
    accentColor: '#10B981',
    icon: '🎉',
  },
  {
    id: 'goal:fireworks',
    kind: 'goal',
    value: 'fireworks',
    price: 120,
    accentColor: '#F59E0B',
    icon: '🎆',
  },
  {
    id: 'goal:lightning',
    kind: 'goal',
    value: 'lightning',
    price: 200,
    accentColor: '#38BDF8',
    icon: '⚡',
  },
  {
    id: 'goal:supernova',
    kind: 'goal',
    value: 'supernova',
    price: 280,
    accentColor: '#EC4899',
    icon: '💥',
  },
  {
    id: 'goal:matrix',
    kind: 'goal',
    value: 'matrix',
    price: 360,
    accentColor: '#34D399',
    icon: '🟩',
  },
];

export const TRAIL_ANIMATIONS: AnimationItem[] = [
  {
    id: 'trail:standard',
    kind: 'trail',
    value: 'standard',
    price: 0,
    accentColor: '#38BDF8',
    icon: '💨',
  },
  {
    id: 'trail:flame-dash',
    kind: 'trail',
    value: 'flame-dash',
    price: 140,
    accentColor: '#F97316',
    icon: '🔥',
  },
  {
    id: 'trail:frost-nova',
    kind: 'trail',
    value: 'frost-nova',
    price: 190,
    accentColor: '#67E8F9',
    icon: '❄️',
  },
  {
    id: 'trail:shadow-echo',
    kind: 'trail',
    value: 'shadow-echo',
    price: 260,
    accentColor: '#8B5CF6',
    icon: '👻',
  },
  {
    id: 'trail:gold-aura',
    kind: 'trail',
    value: 'gold-aura',
    price: 340,
    accentColor: '#FBBF24',
    icon: '✨',
  },
];

export const ANIMATION_CATALOG: AnimationItem[] = [
  ...GOAL_ANIMATIONS,
  ...TRAIL_ANIMATIONS,
];

export const ALL_ANIMATION_IDS: string[] = ANIMATION_CATALOG.map((a) => a.id);

const VALID_GOAL_SET = new Set<string>(GOAL_ANIMATIONS.map((g) => g.value));
const VALID_TRAIL_SET = new Set<string>(TRAIL_ANIMATIONS.map((t) => t.value));
const VALID_ANIM_ID_SET = new Set<string>(ALL_ANIMATION_IDS);

export function isValidGoalAnimation(val: unknown): val is GoalAnimationId {
  return typeof val === 'string' && VALID_GOAL_SET.has(val);
}

export function isValidTrailAnimation(val: unknown): val is TrailAnimationId {
  return typeof val === 'string' && VALID_TRAIL_SET.has(val);
}

export function createDefaultAnimationConfig(): AnimationConfig {
  return {
    goalAnimation: 'classic',
    trailAnimation: 'standard',
    fieldAnimDurationMs: 1800,
    lootboxAnimDurationMs: 1000,
    uiAnimDurationMs: 220,
  };
}

export function sanitizeUnlockedAnimations(raw: unknown): string[] {
  const set = new Set<string>(['goal:classic', 'trail:standard']);
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item === 'string' && VALID_ANIM_ID_SET.has(item)) {
        set.add(item);
      }
    }
  }
  return Array.from(set);
}

function clampNum(v: unknown, min: number, max: number, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function sanitizeAnimationConfig(
  raw: unknown,
  unlocked: string[]
): AnimationConfig {
  const def = createDefaultAnimationConfig();
  if (!raw || typeof raw !== 'object') return def;
  const obj = raw as Partial<AnimationConfig>;

  const goalVal = isValidGoalAnimation(obj.goalAnimation)
    ? obj.goalAnimation
    : def.goalAnimation;
  const trailVal = isValidTrailAnimation(obj.trailAnimation)
    ? obj.trailAnimation
    : def.trailAnimation;

  return {
    goalAnimation: unlocked.includes(`goal:${goalVal}`) ? goalVal : def.goalAnimation,
    trailAnimation: unlocked.includes(`trail:${trailVal}`) ? trailVal : def.trailAnimation,
    fieldAnimDurationMs: clampNum(
      obj.fieldAnimDurationMs,
      600,
      3500,
      def.fieldAnimDurationMs
    ),
    lootboxAnimDurationMs: clampNum(
      obj.lootboxAnimDurationMs,
      0,
      2500,
      def.lootboxAnimDurationMs
    ),
    uiAnimDurationMs: clampNum(obj.uiAnimDurationMs, 0, 800, def.uiAnimDurationMs),
  };
}

export function createDefaultMenuConfig(): MenuConfig {
  return {
    menuLayout: 'default',
    menuBackdropMode: 'stadium',
    showMenuRules: true,
    menuKeyboardNav: true,
    menuAnimations: true,
  };
}

export function sanitizeMenuConfig(raw: unknown): MenuConfig {
  const def = createDefaultMenuConfig();
  if (!raw || typeof raw !== 'object') return def;
  const obj = raw as Partial<MenuConfig>;
  return {
    menuLayout: obj.menuLayout === 'compact' ? 'compact' : 'default',
    menuBackdropMode: obj.menuBackdropMode === 'minimal' ? 'minimal' : 'stadium',
    showMenuRules: typeof obj.showMenuRules === 'boolean' ? obj.showMenuRules : def.showMenuRules,
    menuKeyboardNav:
      typeof obj.menuKeyboardNav === 'boolean' ? obj.menuKeyboardNav : def.menuKeyboardNav,
    menuAnimations:
      typeof obj.menuAnimations === 'boolean' ? obj.menuAnimations : def.menuAnimations,
  };
}
