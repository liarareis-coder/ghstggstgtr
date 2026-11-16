import type { Language } from '../i18n/translations.ts';
import {
  createDefaultAnimationConfig,
  createDefaultMenuConfig,
  sanitizeAnimationConfig,
  sanitizeMenuConfig,
  sanitizeUnlockedAnimations,
  type AnimationConfig,
  type MenuConfig,
} from '../shared/animations.ts';
import {
  createDefaultCharacterConfig,
  sanitizeCharacterConfig,
  sanitizeUnlockedCosmetics,
  type CharacterConfig,
} from '../shared/character.ts';
import { parseTeamSize, type GameMode, type TeamSize } from '../shared/gameEngine.ts';
import {
  getCurrentSeasonInfo,
  getRankInfo,
  type RankId,
} from '../shared/ranks.ts';
import { isValidSkillId, type SkillId } from '../shared/skills.ts';
import { isValidTurfId, type PitchTurfId } from '../shared/turfs.ts';
import {
  createDefaultHudConfig,
  sanitizeHudConfig,
  type HudConfig,
} from './hudLayout.ts';

export const LOCAL_SAVE_KEY = 'arena_futebol_save_v1';

export interface SaveMatchRecord {
  id: string;
  mode: GameMode;
  isRanked: boolean;
  teamSize: TeamSize;
  blueScore: number;
  redScore: number;
  result: 'win' | 'loss' | 'draw';
  expDelta: number;
  rankAfter: RankId;
  createdAt: number;
}

export interface SaveProfile {
  displayName: string;
  language: Language;
  exp: number;
  rankId: RankId;
  coins: number;
  unlockedTurfs: PitchTurfId[];
  selectedTurf: PitchTurfId;
  unlockedCosmetics: string[];
  characterConfig: CharacterConfig;
  unlockedSkills: SkillId[];
  equippedSkills: SkillId[];
  unlockedAnimations: string[];
  animationConfig: AnimationConfig;
  menuConfig: MenuConfig;
  hudConfig: HudConfig;
  rankedWins: number;
  rankedLosses: number;
  rankedDraws: number;
  totalMatches: number;
  totalGoals: number;
  preferredMode: GameMode;
  preferredTeamSize: TeamSize;
  muted: boolean;
  seasonNumber: number;
  lastSavedAt: number | null;
  recentMatches: SaveMatchRecord[];
}

let offlineSeasonResetBannerSeason: number | null = null;

export function getOfflineSeasonResetSeason(): number | null {
  return offlineSeasonResetBannerSeason;
}

export function clearOfflineSeasonResetSeason(): void {
  offlineSeasonResetBannerSeason = null;
}

export function applySeasonResetIfNeeded(
  profile: SaveProfile,
  nowMs: number = Date.now()
): { profile: SaveProfile; didReset: boolean } {
  const currentSeason = getCurrentSeasonInfo(nowMs).seasonNumber;
  if (profile.seasonNumber >= currentSeason) {
    return { profile, didReset: false };
  }
  const hadRankedState =
    profile.exp > 0 ||
    profile.rankId !== 'bronze' ||
    profile.rankedWins > 0 ||
    profile.rankedLosses > 0 ||
    profile.rankedDraws > 0;
  return {
    profile: {
      ...profile,
      seasonNumber: currentSeason,
      exp: 0,
      rankId: 'bronze',
      rankedWins: 0,
      rankedLosses: 0,
      rankedDraws: 0,
    },
    didReset: hadRankedState,
  };
}

export function sanitizeUnlockedTurfs(raw: unknown): PitchTurfId[] {
  const set = new Set<PitchTurfId>(['classic']);
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (isValidTurfId(item)) {
        set.add(item);
      }
    }
  }
  return Array.from(set);
}

export function sanitizeSelectedTurf(
  raw: unknown,
  unlocked: PitchTurfId[]
): PitchTurfId {
  if (isValidTurfId(raw) && unlocked.includes(raw)) {
    return raw;
  }
  return 'classic';
}

export function sanitizeUnlockedSkills(raw: unknown): SkillId[] {
  const set = new Set<SkillId>();
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (isValidSkillId(item)) {
        set.add(item);
      }
    }
  }
  return Array.from(set);
}

export function sanitizeEquippedSkills(
  raw: unknown,
  unlocked: SkillId[]
): SkillId[] {
  const list: SkillId[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (
        isValidSkillId(item) &&
        unlocked.includes(item) &&
        !list.includes(item)
      ) {
        list.push(item);
        if (list.length >= 2) break;
      }
    }
  }
  return list;
}

export function createDefaultSaveProfile(): SaveProfile {
  const unlockedAnimations = sanitizeUnlockedAnimations([]);
  return {
    displayName: 'Jogador',
    language: 'pt-BR',
    exp: 0,
    rankId: 'bronze',
    coins: 0,
    unlockedTurfs: ['classic'],
    selectedTurf: 'classic',
    unlockedCosmetics: sanitizeUnlockedCosmetics([]),
    characterConfig: createDefaultCharacterConfig(),
    unlockedSkills: [],
    equippedSkills: [],
    unlockedAnimations,
    animationConfig: createDefaultAnimationConfig(),
    menuConfig: createDefaultMenuConfig(),
    hudConfig: createDefaultHudConfig(),
    rankedWins: 0,
    rankedLosses: 0,
    rankedDraws: 0,
    totalMatches: 0,
    totalGoals: 0,
    preferredMode: '1p',
    preferredTeamSize: 1,
    muted: false,
    seasonNumber: getCurrentSeasonInfo().seasonNumber,
    lastSavedAt: null,
    recentMatches: [],
  };
}

export function loadLocalSave(): SaveProfile {
  try {
    const raw = localStorage.getItem(LOCAL_SAVE_KEY);
    if (!raw) return createDefaultSaveProfile();
    const parsed = JSON.parse(raw) as Partial<SaveProfile>;
    const exp = Math.max(0, Math.floor(Number(parsed.exp || 0)));
    const rankId = getRankInfo(exp).tier.id;
    const coins = Math.max(0, Math.floor(Number(parsed.coins || 0)));
    const unlockedTurfs = sanitizeUnlockedTurfs(parsed.unlockedTurfs);
    const selectedTurf = sanitizeSelectedTurf(parsed.selectedTurf, unlockedTurfs);
    const unlockedCosmetics = sanitizeUnlockedCosmetics(parsed.unlockedCosmetics);
    const characterConfig = sanitizeCharacterConfig(
      parsed.characterConfig,
      unlockedCosmetics
    );
    const unlockedSkills = sanitizeUnlockedSkills(parsed.unlockedSkills);
    const equippedSkills = sanitizeEquippedSkills(
      parsed.equippedSkills,
      unlockedSkills
    );
    const unlockedAnimations = sanitizeUnlockedAnimations(parsed.unlockedAnimations);
    const animationConfig = sanitizeAnimationConfig(
      parsed.animationConfig,
      unlockedAnimations
    );
    const menuConfig = sanitizeMenuConfig(parsed.menuConfig);
    const hudConfig = sanitizeHudConfig(parsed.hudConfig);
    const currentSeasonNum = getCurrentSeasonInfo().seasonNumber;
    const rawSeason = Number(parsed.seasonNumber);
    const parsedSeason =
      Number.isFinite(rawSeason) && rawSeason >= 1
        ? Math.floor(rawSeason)
        : currentSeasonNum;
    const built: SaveProfile = {
      displayName:
        typeof parsed.displayName === 'string' && parsed.displayName.trim().length > 0
          ? parsed.displayName.trim().slice(0, 16)
          : 'Jogador',
      language:
        parsed.language === 'pt-PT' ||
        parsed.language === 'en-US' ||
        parsed.language === 'es'
          ? parsed.language
          : 'pt-BR',
      exp,
      rankId,
      coins,
      unlockedTurfs,
      selectedTurf,
      unlockedCosmetics,
      characterConfig,
      unlockedSkills,
      equippedSkills,
      unlockedAnimations,
      animationConfig,
      menuConfig,
      hudConfig,
      rankedWins: Math.max(0, Math.floor(Number(parsed.rankedWins || 0))),
      rankedLosses: Math.max(0, Math.floor(Number(parsed.rankedLosses || 0))),
      rankedDraws: Math.max(0, Math.floor(Number(parsed.rankedDraws || 0))),
      totalMatches: Math.max(0, Math.floor(Number(parsed.totalMatches || 0))),
      totalGoals: Math.max(0, Math.floor(Number(parsed.totalGoals || 0))),
      preferredMode:
        parsed.preferredMode === '2p' ||
        parsed.preferredMode === 'training' ||
        parsed.preferredMode === 'online'
          ? parsed.preferredMode
          : '1p',
      preferredTeamSize: parseTeamSize(parsed.preferredTeamSize),
      muted: Boolean(parsed.muted),
      seasonNumber: parsedSeason,
      lastSavedAt: typeof parsed.lastSavedAt === 'number' ? parsed.lastSavedAt : null,
      recentMatches: Array.isArray(parsed.recentMatches)
        ? parsed.recentMatches.slice(0, 12)
        : [],
    };
    const { profile: resetChecked, didReset } = applySeasonResetIfNeeded(built);
    if (didReset) {
      offlineSeasonResetBannerSeason = currentSeasonNum;
    }
    if (didReset || parsedSeason < currentSeasonNum) {
      try {
        localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(resetChecked));
      } catch {
        // ignore quota errors
      }
    }
    return resetChecked;
  } catch {
    return createDefaultSaveProfile();
  }
}

export function saveLocalProfile(profile: SaveProfile): SaveProfile {
  const exp = Math.max(0, Math.floor(profile.exp));
  const coins = Math.max(0, Math.floor(profile.coins || 0));
  const unlockedTurfs = sanitizeUnlockedTurfs(profile.unlockedTurfs);
  const selectedTurf = sanitizeSelectedTurf(profile.selectedTurf, unlockedTurfs);
  const unlockedCosmetics = sanitizeUnlockedCosmetics(profile.unlockedCosmetics);
  const characterConfig = sanitizeCharacterConfig(
    profile.characterConfig,
    unlockedCosmetics
  );
  const unlockedSkills = sanitizeUnlockedSkills(profile.unlockedSkills);
  const equippedSkills = sanitizeEquippedSkills(
    profile.equippedSkills,
    unlockedSkills
  );
  const unlockedAnimations = sanitizeUnlockedAnimations(profile.unlockedAnimations);
  const animationConfig = sanitizeAnimationConfig(
    profile.animationConfig,
    unlockedAnimations
  );
  const menuConfig = sanitizeMenuConfig(profile.menuConfig);
  const hudConfig = sanitizeHudConfig(profile.hudConfig);
  const currentSeason = getCurrentSeasonInfo().seasonNumber;
  const rawSeason = Number(profile.seasonNumber);
  const seasonNumber =
    Number.isFinite(rawSeason) && rawSeason >= 1
      ? Math.max(currentSeason, Math.floor(rawSeason))
      : currentSeason;
  const needsReset =
    Number.isFinite(rawSeason) && rawSeason >= 1 && Math.floor(rawSeason) < currentSeason;
  const safeExp = needsReset ? 0 : exp;
  const normalized: SaveProfile = {
    ...profile,
    displayName: profile.displayName.trim().slice(0, 16) || 'Jogador',
    exp: safeExp,
    rankId: getRankInfo(safeExp).tier.id,
    rankedWins: needsReset ? 0 : profile.rankedWins,
    rankedLosses: needsReset ? 0 : profile.rankedLosses,
    rankedDraws: needsReset ? 0 : profile.rankedDraws,
    coins,
    unlockedTurfs,
    selectedTurf,
    unlockedCosmetics,
    characterConfig,
    unlockedSkills,
    equippedSkills,
    unlockedAnimations,
    animationConfig,
    menuConfig,
    hudConfig,
    seasonNumber,
    lastSavedAt: Date.now(),
    recentMatches: profile.recentMatches.slice(0, 12),
  };
  try {
    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(normalized));
  } catch {
    // Ignore storage quota errors cleanly
  }
  return normalized;
}

export function resetLocalSave(language?: Language): SaveProfile {
  const fresh = createDefaultSaveProfile();
  if (language) fresh.language = language;
  try {
    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(fresh));
  } catch {
    // ignore
  }
  return fresh;
}

export function mergeCloudAndLocalSave(
  rawLocal: SaveProfile,
  rawCloud: SaveProfile
): SaveProfile {
  const local = applySeasonResetIfNeeded(rawLocal).profile;
  const cloud = applySeasonResetIfNeeded(rawCloud).profile;
  const preferCloud =
    cloud.exp > local.exp ||
    cloud.totalMatches > local.totalMatches ||
    (cloud.exp === local.exp && (cloud.lastSavedAt ?? 0) >= (local.lastSavedAt ?? 0));

  const primary = preferCloud ? cloud : local;
  const secondary = preferCloud ? local : cloud;

  const currentSeason = getCurrentSeasonInfo().seasonNumber;
  const exp = Math.max(local.exp, cloud.exp);
  const rankId = getRankInfo(exp).tier.id;
  const unlockedTurfs = sanitizeUnlockedTurfs([
    ...local.unlockedTurfs,
    ...cloud.unlockedTurfs,
  ]);
  const selectedTurf = sanitizeSelectedTurf(
    primary.selectedTurf || secondary.selectedTurf,
    unlockedTurfs
  );

  const unlockedCosmetics = sanitizeUnlockedCosmetics([
    ...local.unlockedCosmetics,
    ...cloud.unlockedCosmetics,
  ]);
  const characterConfig = sanitizeCharacterConfig(
    primary.characterConfig || secondary.characterConfig,
    unlockedCosmetics
  );
  const unlockedSkills = sanitizeUnlockedSkills([
    ...local.unlockedSkills,
    ...cloud.unlockedSkills,
  ]);
  const equippedSkills = sanitizeEquippedSkills(
    primary.equippedSkills?.length ? primary.equippedSkills : secondary.equippedSkills,
    unlockedSkills
  );
  const unlockedAnimations = sanitizeUnlockedAnimations([
    ...(local.unlockedAnimations ?? []),
    ...(cloud.unlockedAnimations ?? []),
  ]);
  const animationConfig = sanitizeAnimationConfig(
    local.animationConfig ?? cloud.animationConfig,
    unlockedAnimations
  );
  const menuConfig = sanitizeMenuConfig(local.menuConfig ?? cloud.menuConfig);

  // Use primary coins cleanly, or max if neither spent since last sync
  const localItemCount =
    local.unlockedTurfs.length +
    local.unlockedCosmetics.length +
    local.unlockedSkills.length +
    (local.unlockedAnimations?.length ?? 2);
  const cloudItemCount =
    cloud.unlockedTurfs.length +
    cloud.unlockedCosmetics.length +
    cloud.unlockedSkills.length +
    (cloud.unlockedAnimations?.length ?? 2);
  const coins = preferCloud
    ? Math.max(
        cloud.coins,
        localItemCount === cloudItemCount ? Math.max(local.coins, cloud.coins) : cloud.coins
      )
    : Math.max(
        local.coins,
        localItemCount === cloudItemCount ? Math.max(local.coins, cloud.coins) : local.coins
      );

  const combinedMatchesMap = new Map<string, SaveMatchRecord>();
  for (const m of [...primary.recentMatches, ...secondary.recentMatches]) {
    if (!combinedMatchesMap.has(m.id)) {
      combinedMatchesMap.set(m.id, m);
    }
  }
  const mergedMatches = Array.from(combinedMatchesMap.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 12);

  return {
    displayName: primary.displayName || secondary.displayName || 'Jogador',
    language: local.language,
    exp,
    rankId,
    coins,
    unlockedTurfs,
    selectedTurf,
    unlockedCosmetics,
    characterConfig,
    unlockedSkills,
    equippedSkills,
    unlockedAnimations,
    animationConfig,
    menuConfig,
    hudConfig: sanitizeHudConfig(local.hudConfig ?? cloud.hudConfig),
    rankedWins: Math.max(local.rankedWins, cloud.rankedWins),
    rankedLosses: Math.max(local.rankedLosses, cloud.rankedLosses),
    rankedDraws: Math.max(local.rankedDraws, cloud.rankedDraws),
    totalMatches: Math.max(local.totalMatches, cloud.totalMatches),
    totalGoals: Math.max(local.totalGoals, cloud.totalGoals),
    preferredMode: local.preferredMode,
    preferredTeamSize: local.preferredTeamSize,
    muted: local.muted,
    seasonNumber: Math.max(currentSeason, local.seasonNumber, cloud.seasonNumber),
    lastSavedAt: Date.now(),
    recentMatches: mergedMatches,
  };
}
