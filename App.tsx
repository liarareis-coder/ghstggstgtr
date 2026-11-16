import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Code2,
  Coins,
  Copy,
  Crown,
  Dumbbell,
  Eye,
  Film,
  Gamepad2,
  Globe,
  Languages,
  Palette,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Save,
  Shield,
  ShoppingBag,
  Sliders,
  SlidersHorizontal,
  Smartphone,
  Smile,
  Timer,
  Trophy,
  User,
  UserCheck,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
  Zap,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import stadiumBackdrop from './assets/images/stadium_turf_backdrop_1794695697038.jpg';
import { ActionButton } from './components/ActionButton.tsx';
import { DevModeModal } from './components/DevModeModal.tsx';
import { GameCanvas } from './components/GameCanvas.tsx';
import { HudCustomizerModal } from './components/HudCustomizerModal.tsx';
import { MatchSkillSelectModal } from './components/MatchSkillSelectModal.tsx';
import { MenuAnimatedBackdrop } from './components/MenuAnimatedBackdrop.tsx';
import { MenuControlsModal } from './components/MenuControlsModal.tsx';
import { MenuPlayerShowcase } from './components/MenuPlayerShowcase.tsx';
import { MultiplayerMvpScreen } from './components/MultiplayerMvpScreen.tsx';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton.tsx';
import { ReplayModal } from './components/ReplayModal.tsx';
import { SaveRankModal } from './components/SaveRankModal.tsx';
import { UnifiedShopModal, type UnifiedShopTab } from './components/UnifiedShopModal.tsx';
import { VirtualJoystick } from './components/VirtualJoystick.tsx';
import {
  fetchRankedLeaderboard,
  loadCloudSave,
  recordCloudMatch,
  signInWithGoogle,
  signInWithEmail,
  createEmailAccount,
  sendPasswordReset,
  signOutUser,
  subscribeAuth,
  writeCloudSave,
  type LeaderboardEntry,
} from './firebase.ts';
import {
  formatT,
  getLocalizedRankName,
  LANGUAGE_OPTIONS,
  TRANSLATIONS,
  type Language,
} from './i18n/translations.ts';
import {
  ALL_ANIMATION_IDS,
  ANIMATION_CATALOG,
  sanitizeAnimationConfig,
  sanitizeMenuConfig,
  sanitizeUnlockedAnimations,
  type AnimationConfig,
  type MenuConfig,
} from './shared/animations.ts';
import {
  ALL_COSMETIC_IDS,
  CHARACTER_COSMETICS,
  sanitizeCharacterConfig,
  sanitizeUnlockedCosmetics,
  type CharacterConfig,
} from './shared/character.ts';
import {
  computeMultiplayerMvpAndWinners,
  createInitialGameState,
  DEFAULT_DEV_HACKS,
  DRIBBLE_COOLDOWN,
  EMOTE_OPTIONS,
  EMPTY_INPUT,
  MATCH_DURATION_SECONDS,
  MAX_OVERTIMES,
  parseTeamSize,
  resetPositionsForKickoff,
  stepGameState,
  type ActiveEmote,
  type DevHacksConfig,
  type GameMode,
  type GameState,
  type MatchPhase,
  type MatchWinner,
  type PlayerInput,
  type Team,
  type TeamSize,
} from './shared/gameEngine.ts';
import { applyCompactState, type CompactStatePacket } from './shared/netProtocol.ts';
import {
  formatRankWithSubLevel,
  formatSeasonCountdown,
  getCurrentSeasonInfo,
  getRankInfo,
  RANK_TIERS,
  type RankId,
  type SeasonTimerInfo,
  type SubLevel,
} from './shared/ranks.ts';
import {
  ALL_SKILL_IDS,
  getSkillById,
  LOOTBOX_TIERS,
  RARITY_META,
  rollSkillLootbox,
  type LootboxRollOutcome,
  type LootboxTierId,
  type SkillId,
} from './shared/skills.ts';
import { getTurfById, type PitchTurfId } from './shared/turfs.ts';
import {
  computeSinglePlayerHudPlacements,
  computeTwoPlayerHudPlacements,
  sanitizeHudConfig,
  type HudConfig,
} from './utils/hudLayout.ts';
import {
  applySeasonResetIfNeeded,
  clearOfflineSeasonResetSeason,
  getOfflineSeasonResetSeason,
  loadLocalSave,
  mergeCloudAndLocalSave,
  resetLocalSave,
  saveLocalProfile,
  sanitizeEquippedSkills,
  sanitizeUnlockedSkills,
  sanitizeUnlockedTurfs,
  type SaveMatchRecord,
  type SaveProfile,
} from './utils/saveSystem.ts';
import {
  deleteReplayFromDB,
  loadReplaysFromDB,
  MatchHighlightRecorder,
  saveReplayToDB,
  type SavedMatchHighlights,
} from './utils/replaySystem.ts';
import { soundFX } from './utils/sound.ts';

type AppScreen = 'MENU' | 'ONLINE_LOBBY' | 'PLAYING';

interface HudSnapshot {
  blueScore: number;
  redScore: number;
  timeRemaining: number;
  overtimeCount: number;
  phase: MatchPhase;
  winner: MatchWinner;
  blueDribbleCdRatio: number;
  redDribbleCdRatio: number;
  myDribbleCdRatio: number;
  blueStamina: number;
  blueStaminaExhausted: boolean;
  blueShootCharge: number;
  redStamina: number;
  redStaminaExhausted: boolean;
  redShootCharge: number;
  myStamina: number;
  myStaminaExhausted: boolean;
  myShootCharge: number;
  blueName: string;
  redName: string;
  p1Label: string;
  p2Label: string;
  mySkill1Id: SkillId | null;
  mySkill2Id: SkillId | null;
  mySkill1Cd: number;
  mySkill2Cd: number;
  mySkill1MaxCd: number;
  mySkill2MaxCd: number;
  myActiveSkill: SkillId | null;
  p2Skill1Id: SkillId | null;
  p2Skill2Id: SkillId | null;
  p2Skill1Cd: number;
  p2Skill2Cd: number;
  p2Skill1MaxCd: number;
  p2Skill2MaxCd: number;
  p2ActiveSkill: SkillId | null;
}

interface LiveRoomInfo {
  roomCode: string;
  teamSize: TeamSize;
  isRanked: boolean;
  humanCount: number;
  maxHumans: number;
  spectatorCount: number;
  blueScore: number;
  redScore: number;
  timeRemaining: number;
  blueName: string;
  redName: string;
}

interface SpectatorSummary {
  roomCode: string;
  winner: MatchWinner;
  blueScore: number;
  redScore: number;
}

interface LobbySlotInfo {
  slot: string;
  name: string;
  isAI: boolean;
  exp?: number;
  rankId?: RankId;
}

interface LobbyState {
  roomCode: string;
  teamSize: TeamSize;
  isRanked: boolean;
  hostName: string;
  isHost: boolean;
  isReady: boolean;
  yourSlot: string;
  yourTeam: Team;
  bluePlayers: LobbySlotInfo[];
  redPlayers: LobbySlotInfo[];
  humanCount: number;
  maxHumans: number;
}

interface RankedMatchSummary {
  result: 'win' | 'loss' | 'draw';
  expDelta: number;
  nextExp: number;
  prevRankId: RankId;
  nextRankId: RankId;
  nextSubLevel: SubLevel;
  promoted: boolean;
  coinsEarned: number;
}

interface OnlineCasualSummary {
  result: 'win' | 'loss' | 'draw';
  coinsEarned: number;
}

function formatClock(seconds: number): string {
  const ceilSec = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(ceilSec / 60);
  const secs = ceilSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function App() {
  const [saveProfile, setSaveProfile] = useState<SaveProfile>(() => loadLocalSave());
  const [language, setLanguage] = useState<Language>(() => loadLocalSave().language);
  const t = TRANSLATIONS[language];

  const [screen, setScreen] = useState<AppScreen>('MENU');
  const [selectedMode, setSelectedMode] = useState<GameMode>(
    () => loadLocalSave().preferredMode
  );
  const [teamSize, setTeamSize] = useState<TeamSize>(
    () => loadLocalSave().preferredTeamSize
  );
  const [localBlueName, setLocalBlueName] = useState('Jogador 1');
  const [localRedName, setLocalRedName] = useState('Jogador 2');
  const [muted, setMuted] = useState(() => loadLocalSave().muted);
  const [paused, setPaused] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const detectMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    const coarse = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
    const ua = navigator.userAgent || '';
    const mobileUa =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(
        ua
      ) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const uaDataMobile =
      (navigator as Navigator & { userAgentData?: { mobile?: boolean } })
        .userAgentData?.mobile ?? false;
    return coarse || mobileUa || uaDataMobile;
  };

  const controlsOverrideRef = useRef<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(() => detectMobileDevice());
  const [isPortrait, setIsPortrait] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  );
  const [landscapeManualHintVisible, setLandscapeManualHintVisible] = useState(false);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number }>(() =>
    typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 1280, height: 720 }
  );
  const [showFloatingControls, setShowFloatingControls] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return (
      window.matchMedia('(pointer: coarse)').matches ||
      window.innerWidth <= 1024 ||
      window.innerHeight <= 620
    );
  });

  const requestLandscapeMode = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!detectMobileDevice()) return;
    const docEl = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    const attemptLock = () => {
      const orient = window.screen?.orientation as
        | (ScreenOrientation & { lock?: (mode: string) => Promise<void> })
        | undefined;
      if (orient?.lock) {
        void orient.lock('landscape').catch(() => {});
      }
    };
    if (!document.fullscreenElement) {
      if (docEl.requestFullscreen) {
        void docEl.requestFullscreen().then(attemptLock).catch(attemptLock);
      } else if (docEl.webkitRequestFullscreen) {
        void docEl.webkitRequestFullscreen().then(attemptLock).catch(attemptLock);
      } else {
        attemptLock();
      }
    } else {
      attemptLock();
    }
    window.setTimeout(() => {
      if (window.innerHeight > window.innerWidth) {
        setLandscapeManualHintVisible(true);
      }
    }, 350);
  }, []);

  useEffect(() => {
    const syncResponsiveControls = () => {
      const mobileNow = detectMobileDevice();
      const portraitNow = window.innerHeight > window.innerWidth;
      setIsMobileDevice(mobileNow);
      setIsPortrait(portraitNow);
      if (!portraitNow) {
        setLandscapeManualHintVisible(false);
      }
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });

      if (controlsOverrideRef.current) return;
      const shouldShow =
        mobileNow || window.innerWidth <= 1024 || window.innerHeight <= 620;
      setShowFloatingControls(shouldShow);
    };
    syncResponsiveControls();
    window.addEventListener('resize', syncResponsiveControls);
    window.addEventListener('orientationchange', syncResponsiveControls);
    const screenOrient = window.screen?.orientation;
    screenOrient?.addEventListener?.('change', syncResponsiveControls);
    const mq = window.matchMedia('(pointer: coarse)');
    const mqOrient = window.matchMedia('(orientation: portrait)');
    mq.addEventListener?.('change', syncResponsiveControls);
    mqOrient.addEventListener?.('change', syncResponsiveControls);
    return () => {
      window.removeEventListener('resize', syncResponsiveControls);
      window.removeEventListener('orientationchange', syncResponsiveControls);
      screenOrient?.removeEventListener?.('change', syncResponsiveControls);
      mq.removeEventListener?.('change', syncResponsiveControls);
      mqOrient.removeEventListener?.('change', syncResponsiveControls);
    };
  }, []);

  // Crisp mobile tap feedback for every button across the app (even on rapid taps)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const timers = new WeakMap<HTMLElement, number>();
    const releaseTap = (btn: HTMLElement) => {
      const existing = timers.get(btn);
      if (existing) window.clearTimeout(existing);
      const tId = window.setTimeout(() => {
        btn.removeAttribute('data-tap-active');
      }, 140);
      timers.set(btn, tId);
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest('button');
      if (!btn || (btn as HTMLButtonElement).disabled) return;
      if (btn.classList.contains('btn-game-action')) return;
      const prevTimer = timers.get(btn);
      if (prevTimer) window.clearTimeout(prevTimer);
      btn.setAttribute('data-tap-active', 'true');
    };
    const onPointerEnd = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest('button');
      if (btn) {
        releaseTap(btn);
        return;
      }
      document
        .querySelectorAll<HTMLElement>('button[data-tap-active="true"]')
        .forEach(releaseTap);
    };
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('pointerup', onPointerEnd, { passive: true });
    document.addEventListener('pointercancel', onPointerEnd, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointerup', onPointerEnd);
      document.removeEventListener('pointercancel', onPointerEnd);
    };
  }, []);

  // Save & Cloud Sync, Unified Shop, Menu Controls, HUD Customizer & Leaderboard Modal State
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [unifiedShop, setUnifiedShop] = useState<{ open: boolean; tab: UnifiedShopTab }>({
    open: false,
    tab: 'skills',
  });
  const [menuControlsOpen, setMenuControlsOpen] = useState(false);
  const openShopTab = useCallback((tab: UnifiedShopTab) => {
    setUnifiedShop({ open: true, tab });
  }, []);
  const [p1MatchSkills, setP1MatchSkills] = useState<SkillId[]>(() => loadLocalSave().equippedSkills);
  const [p2MatchSkills, setP2MatchSkills] = useState<SkillId[]>([]);
  const [matchSkillPicker, setMatchSkillPicker] = useState<{
    open: boolean;
    mode: '1p' | '2p' | 'training' | 'online';
    purpose: 'local-start' | 'online-quick' | 'online-lobby';
  }>({ open: false, mode: '1p', purpose: 'local-start' });
  const [lastLootboxOutcome, setLastLootboxOutcome] = useState<LootboxRollOutcome | null>(
    null
  );
  const [customizerModalOpen, setCustomizerModalOpen] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [seasonInfo, setSeasonInfo] = useState<SeasonTimerInfo>(() =>
    getCurrentSeasonInfo()
  );
  const [seasonResetBanner, setSeasonResetBanner] = useState<number | null>(() =>
    getOfflineSeasonResetSeason()
  );
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // Developer Mode / Hacks State
  const [devModalOpen, setDevModalOpen] = useState(false);
  const [devUnlocked, setDevUnlocked] = useState(false);
  const devUnlockedRef = useRef<boolean>(false);
  devUnlockedRef.current = devUnlocked;
  const devTokenRef = useRef<string | null>(null);
  const [devHacks, setDevHacks] = useState<DevHacksConfig>(() => ({
    ...DEFAULT_DEV_HACKS,
  }));
  const devHacksRef = useRef<DevHacksConfig>(devHacks);
  devHacksRef.current = devHacks;

  // Emote Chat State
  const [emoteFeed, setEmoteFeed] = useState<ActiveEmote[]>([]);
  const activeEmotesRef = useRef<ActiveEmote[]>([]);
  const [emotePickerOpen, setEmotePickerOpen] = useState(false);
  const [emotePickerSlot, setEmotePickerSlot] = useState<'blue-1' | 'red-1'>('blue-1');

  // Online Multiplayer, Spectator & Ranked State
  const [playerName, setPlayerName] = useState(() => loadLocalSave().displayName);
  const [isRankedQueue, setIsRankedQueue] = useState(true);
  const [onlineMatchIsRanked, setOnlineMatchIsRanked] = useState(false);
  const [rankedSummary, setRankedSummary] = useState<RankedMatchSummary | null>(null);
  const [onlineCasualSummary, setOnlineCasualSummary] =
    useState<OnlineCasualSummary | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [searchingQuickMatch, setSearchingQuickMatch] = useState(false);
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const lobbyRef = useRef<LobbyState | null>(null);
  lobbyRef.current = lobby;
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [onlineSlot, setOnlineSlot] = useState<string>('blue-1');
  const [liveRooms, setLiveRooms] = useState<LiveRoomInfo[]>([]);
  const [isSpectator, setIsSpectator] = useState(false);
  const isSpectatorRef = useRef<boolean>(false);
  isSpectatorRef.current = isSpectator;
  const [spectateTargetId, setSpectateTargetId] = useState<string>('ball');
  const [spectatorCount, setSpectatorCount] = useState<number>(0);
  const [spectatorSummary, setSpectatorSummary] = useState<SpectatorSummary | null>(null);
  const [mvpDismissed, setMvpDismissed] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const onlineSlotRef = useRef<string>('blue-1');
  const saveProfileRef = useRef<SaveProfile>(saveProfile);
  saveProfileRef.current = saveProfile;
  const firebaseUserRef = useRef<FirebaseUser | null>(firebaseUser);
  firebaseUserRef.current = firebaseUser;
  const localMatchRecordedRef = useRef<boolean>(false);
  const diagonalToleranceRef = useRef<number>(
    saveProfile.hudConfig.diagonalTolerance ?? 200
  );
  diagonalToleranceRef.current = saveProfile.hudConfig.diagonalTolerance ?? 200;

  const isDevUser =
    saveProfile.displayName.trim() === 'Armando Pinto' ||
    playerName.trim() === 'Armando Pinto';

  // Best Moments Replay State (1P & 2P)
  const [replayModalOpen, setReplayModalOpen] = useState(false);
  const [lastMatchReplay, setLastMatchReplay] = useState<SavedMatchHighlights | null>(null);
  const [savedReplays, setSavedReplays] = useState<SavedMatchHighlights[]>([]);
  const replayRecorderRef = useRef<MatchHighlightRecorder | null>(null);
  const getReplayRecorder = useCallback(() => {
    if (!replayRecorderRef.current) {
      replayRecorderRef.current = new MatchHighlightRecorder();
    }
    return replayRecorderRef.current;
  }, []);

  useEffect(() => {
    void loadReplaysFromDB().then((rows) => setSavedReplays(rows));
  }, []);

  const handleDeleteSavedReplay = useCallback((id: string) => {
    setSavedReplays((prev) => prev.filter((r) => r.id !== id));
    void deleteReplayFromDB(id);
  }, []);

  // Simulation state ref (read at 60fps by Canvas)
  const gameStateRef = useRef<GameState>(
    createInitialGameState({ mode: '1p', teamSize: 1 })
  );

  const [hud, setHud] = useState<HudSnapshot>({
    blueScore: 0,
    redScore: 0,
    timeRemaining: MATCH_DURATION_SECONDS,
    overtimeCount: 0,
    phase: 'KICKOFF',
    winner: null,
    blueDribbleCdRatio: 0,
    redDribbleCdRatio: 0,
    myDribbleCdRatio: 0,
    blueStamina: 100,
    blueStaminaExhausted: false,
    blueShootCharge: 0,
    redStamina: 100,
    redStaminaExhausted: false,
    redShootCharge: 0,
    myStamina: 100,
    myStaminaExhausted: false,
    myShootCharge: 0,
    blueName: 'Você',
    redName: 'IA Rival',
    p1Label: 'Jogador 1',
    p2Label: 'Jogador 2',
    mySkill1Id: null,
    mySkill2Id: null,
    mySkill1Cd: 0,
    mySkill2Cd: 0,
    mySkill1MaxCd: 10,
    mySkill2MaxCd: 10,
    myActiveSkill: null,
    p2Skill1Id: null,
    p2Skill2Id: null,
    p2Skill1Cd: 0,
    p2Skill2Cd: 0,
    p2Skill1MaxCd: 10,
    p2Skill2MaxCd: 10,
    p2ActiveSkill: null,
  });

  // Input sources: touch/virtual joysticks + keyboard
  const touchP1Ref = useRef<PlayerInput>({ ...EMPTY_INPUT });
  const touchP2Ref = useRef<PlayerInput>({ ...EMPTY_INPUT });
  const keysPressedRef = useRef<Set<string>>(new Set());
  const p1DiagGraceRef = useRef<{ x: number; y: number; until: number }>({
    x: 0,
    y: 0,
    until: 0,
  });
  const p2DiagGraceRef = useRef<{ x: number; y: number; until: number }>({
    x: 0,
    y: 0,
    until: 0,
  });

  // Mirror keyboard state for joystick & button visual indicators
  const [p1KeyVec, setP1KeyVec] = useState({ x: 0, y: 0 });
  const [p2KeyVec, setP2KeyVec] = useState({ x: 0, y: 0 });
  const [p1KeyButtons, setP1KeyButtons] = useState({
    shoot: false,
    dribble: false,
    pass: false,
    switchPlayer: false,
    sprint: false,
    skill1: false,
    skill2: false,
  });
  const [p2KeyButtons, setP2KeyButtons] = useState({
    shoot: false,
    dribble: false,
    pass: false,
    switchPlayer: false,
    sprint: false,
    skill1: false,
    skill2: false,
  });

  const pushEmote = useCallback((emote: ActiveEmote) => {
    const cutoff = Date.now() - 3600;
    const pruned = activeEmotesRef.current.filter((e) => e.createdAt > cutoff);
    const next = [...pruned, emote].slice(-10);
    activeEmotesRef.current = next;
    setEmoteFeed(next.slice(-3));
    soundFX.playEmote();
  }, []);

  // Expire visible corner emote feed automatically
  useEffect(() => {
    if (emoteFeed.length === 0) return;
    const timer = setInterval(() => {
      const cutoff = Date.now() - 3500;
      const pruned = activeEmotesRef.current.filter((e) => e.createdAt > cutoff);
      activeEmotesRef.current = pruned;
      setEmoteFeed(pruned.slice(-3));
    }, 350);
    return () => clearInterval(timer);
  }, [emoteFeed.length]);

  const syncHudFromState = useCallback((st: GameState) => {
    const b1 = st.players.find((p) => p.id === 'blue-1');
    const r1 = st.players.find((p) => p.id === 'red-1');
    const blueCtrlId = st.controlMap?.['blue-1'] ?? 'blue-1';
    const redCtrlId = st.controlMap?.['red-1'] ?? 'red-1';
    const myCtrlId =
      st.mode === 'online'
        ? st.controlMap?.[onlineSlotRef.current] ?? onlineSlotRef.current
        : blueCtrlId;

    const blueCtrl = st.players.find((p) => p.id === blueCtrlId) ?? b1;
    const redCtrl = st.players.find((p) => p.id === redCtrlId) ?? r1;
    const mine = st.players.find((p) => p.id === myCtrlId) ?? b1;

    const p1Label = st.humanNames?.['blue-1'] ?? b1?.name ?? 'Jogador 1';
    const p2Label = st.humanNames?.['red-1'] ?? r1?.name ?? 'Jogador 2';

    const blueName =
      st.teamSize > 1
        ? st.mode === '2p'
          ? `${p1Label} (${st.teamSize}v${st.teamSize})`
          : `Time Azul (${st.teamSize}v${st.teamSize})`
        : p1Label;
    const redName =
      st.teamSize > 1
        ? st.mode === '2p'
          ? `${p2Label} (${st.teamSize}v${st.teamSize})`
          : st.mode === 'training'
          ? `IA Treino (${st.teamSize}v${st.teamSize})`
          : `Time Vermelho (${st.teamSize}v${st.teamSize})`
        : p2Label;

    const skill1Id = mine?.equippedSkills?.[0] ?? null;
    const skill2Id = mine?.equippedSkills?.[1] ?? null;
    const skill1Def = skill1Id ? getSkillById(skill1Id) : undefined;
    const skill2Def = skill2Id ? getSkillById(skill2Id) : undefined;
    const p2Skill1Id = redCtrl?.equippedSkills?.[0] ?? null;
    const p2Skill2Id = redCtrl?.equippedSkills?.[1] ?? null;
    const p2Skill1Def = p2Skill1Id ? getSkillById(p2Skill1Id) : undefined;
    const p2Skill2Def = p2Skill2Id ? getSkillById(p2Skill2Id) : undefined;

    const nextSnap: HudSnapshot = {
      blueScore: st.score.blue,
      redScore: st.score.red,
      timeRemaining: Math.ceil(st.timeRemaining),
      overtimeCount: st.overtimeCount,
      phase: st.phase,
      winner: st.winner,
      blueDribbleCdRatio: blueCtrl
        ? Math.round((blueCtrl.dribbleCooldown / DRIBBLE_COOLDOWN) * 100) / 100
        : 0,
      redDribbleCdRatio: redCtrl
        ? Math.round((redCtrl.dribbleCooldown / DRIBBLE_COOLDOWN) * 100) / 100
        : 0,
      myDribbleCdRatio: mine
        ? Math.round((mine.dribbleCooldown / DRIBBLE_COOLDOWN) * 100) / 100
        : 0,
      blueStamina: blueCtrl ? Math.round(blueCtrl.stamina) : 100,
      blueStaminaExhausted: blueCtrl ? blueCtrl.staminaExhausted : false,
      blueShootCharge:
        blueCtrl && blueCtrl.isChargingShoot
          ? Math.round(blueCtrl.shootCharge * 100) / 100
          : 0,
      redStamina: redCtrl ? Math.round(redCtrl.stamina) : 100,
      redStaminaExhausted: redCtrl ? redCtrl.staminaExhausted : false,
      redShootCharge:
        redCtrl && redCtrl.isChargingShoot
          ? Math.round(redCtrl.shootCharge * 100) / 100
          : 0,
      myStamina: mine ? Math.round(mine.stamina) : 100,
      myStaminaExhausted: mine ? mine.staminaExhausted : false,
      myShootCharge:
        mine && mine.isChargingShoot ? Math.round(mine.shootCharge * 100) / 100 : 0,
      blueName,
      redName,
      p1Label,
      p2Label,
      mySkill1Id: skill1Id,
      mySkill2Id: skill2Id,
      mySkill1Cd: mine ? Math.round((mine.skillCooldowns?.[0] ?? 0) * 10) / 10 : 0,
      mySkill2Cd: mine ? Math.round((mine.skillCooldowns?.[1] ?? 0) * 10) / 10 : 0,
      mySkill1MaxCd: skill1Def?.cooldown ?? 10,
      mySkill2MaxCd: skill2Def?.cooldown ?? 10,
      myActiveSkill: mine?.activeSkill ?? null,
      p2Skill1Id,
      p2Skill2Id,
      p2Skill1Cd: redCtrl ? Math.round((redCtrl.skillCooldowns?.[0] ?? 0) * 10) / 10 : 0,
      p2Skill2Cd: redCtrl ? Math.round((redCtrl.skillCooldowns?.[1] ?? 0) * 10) / 10 : 0,
      p2Skill1MaxCd: p2Skill1Def?.cooldown ?? 10,
      p2Skill2MaxCd: p2Skill2Def?.cooldown ?? 10,
      p2ActiveSkill: redCtrl?.activeSkill ?? null,
    };

    setHud((prev) => {
      if (
        prev.blueScore === nextSnap.blueScore &&
        prev.redScore === nextSnap.redScore &&
        prev.timeRemaining === nextSnap.timeRemaining &&
        prev.overtimeCount === nextSnap.overtimeCount &&
        prev.phase === nextSnap.phase &&
        prev.winner === nextSnap.winner &&
        prev.blueDribbleCdRatio === nextSnap.blueDribbleCdRatio &&
        prev.redDribbleCdRatio === nextSnap.redDribbleCdRatio &&
        prev.myDribbleCdRatio === nextSnap.myDribbleCdRatio &&
        prev.blueStamina === nextSnap.blueStamina &&
        prev.blueStaminaExhausted === nextSnap.blueStaminaExhausted &&
        prev.blueShootCharge === nextSnap.blueShootCharge &&
        prev.redStamina === nextSnap.redStamina &&
        prev.redStaminaExhausted === nextSnap.redStaminaExhausted &&
        prev.redShootCharge === nextSnap.redShootCharge &&
        prev.myStamina === nextSnap.myStamina &&
        prev.myStaminaExhausted === nextSnap.myStaminaExhausted &&
        prev.myShootCharge === nextSnap.myShootCharge &&
        prev.blueName === nextSnap.blueName &&
        prev.redName === nextSnap.redName &&
        prev.p1Label === nextSnap.p1Label &&
        prev.p2Label === nextSnap.p2Label &&
        prev.mySkill1Id === nextSnap.mySkill1Id &&
        prev.mySkill2Id === nextSnap.mySkill2Id &&
        prev.mySkill1Cd === nextSnap.mySkill1Cd &&
        prev.mySkill2Cd === nextSnap.mySkill2Cd &&
        prev.mySkill1MaxCd === nextSnap.mySkill1MaxCd &&
        prev.mySkill2MaxCd === nextSnap.mySkill2MaxCd &&
        prev.myActiveSkill === nextSnap.myActiveSkill &&
        prev.p2Skill1Id === nextSnap.p2Skill1Id &&
        prev.p2Skill2Id === nextSnap.p2Skill2Id &&
        prev.p2Skill1Cd === nextSnap.p2Skill1Cd &&
        prev.p2Skill2Cd === nextSnap.p2Skill2Cd &&
        prev.p2Skill1MaxCd === nextSnap.p2Skill1MaxCd &&
        prev.p2Skill2MaxCd === nextSnap.p2Skill2MaxCd &&
        prev.p2ActiveSkill === nextSnap.p2ActiveSkill
      ) {
        return prev;
      }
      return nextSnap;
    });
  }, []);

  useEffect(() => {
    soundFX.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    soundFX.setMenuMusic(screen === 'MENU' || screen === 'ONLINE_LOBBY');
  }, [screen]);

  useEffect(() => {
    const onUiClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest('button');
      if (!btn || (btn as HTMLButtonElement).disabled) return;
      if (btn.classList.contains('btn-game-action')) return;
      if (btn.dataset.sfx === 'none') return;
      soundFX.playClick();
    };
    document.addEventListener('click', onUiClick);
    return () => document.removeEventListener('click', onUiClick);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const ms = prefersReduced ? 0 : saveProfile.animationConfig.uiAnimDurationMs;
    document.documentElement.style.setProperty('--ui-anim-duration', `${ms}ms`);
  }, [saveProfile.animationConfig.uiAnimDurationMs]);

  const anyModalOpen =
    saveModalOpen ||
    unifiedShop.open ||
    menuControlsOpen ||
    customizerModalOpen ||
    replayModalOpen ||
    devModalOpen ||
    matchSkillPicker.open;
  const prevModalOpenRef = useRef(false);
  useEffect(() => {
    if (anyModalOpen && !prevModalOpenRef.current) {
      soundFX.playModalOpen();
    } else if (!anyModalOpen && prevModalOpenRef.current) {
      soundFX.playModalClose();
    }
    prevModalOpenRef.current = anyModalOpen;
  }, [anyModalOpen]);

  const prevPausedRef = useRef(paused);
  useEffect(() => {
    if (screen === 'PLAYING' && prevPausedRef.current !== paused) {
      soundFX.playPause(paused);
    }
    prevPausedRef.current = paused;
  }, [paused, screen]);

  const lastCountdownSecRef = useRef<number | null>(null);
  useEffect(() => {
    if (screen !== 'PLAYING' || paused || hud.phase !== 'PLAYING') {
      if (screen !== 'PLAYING') lastCountdownSecRef.current = null;
      return;
    }
    const secLeft = Math.ceil(hud.timeRemaining);
    if (secLeft >= 1 && secLeft <= 5 && secLeft !== lastCountdownSecRef.current) {
      lastCountdownSecRef.current = secLeft;
      soundFX.playCountdownTick(secLeft);
    } else if (secLeft > 5) {
      lastCountdownSecRef.current = null;
    }
  }, [screen, paused, hud.phase, hud.timeRemaining]);

  const showSaveToast = useCallback((msg: string) => {
    setSaveFeedback(msg);
    setTimeout(() => {
      setSaveFeedback((prev) => (prev === msg ? null : prev));
    }, 3000);
  }, []);

  const persistProfile = useCallback(
    (updater: (prev: SaveProfile) => SaveProfile, syncCloud = false) => {
      const nextRaw = updater(saveProfileRef.current);
      const saved = saveLocalProfile(nextRaw);
      saveProfileRef.current = saved;
      setSaveProfile(saved);
      if (syncCloud && firebaseUserRef.current) {
        void writeCloudSave(firebaseUserRef.current.uid, saved).catch((err) => {
          console.error(err);
        });
      }
      return saved;
    },
    []
  );

  // Subscribe to Firebase Auth and auto-merge cloud save on sign-in
  useEffect(() => {
    const unsub = subscribeAuth(async (user) => {
      setFirebaseUser(user);
      firebaseUserRef.current = user;
      if (user) {
        setCloudBusy(true);
        try {
          const cloud = await loadCloudSave(user.uid);
          if (cloud) {
            if (applySeasonResetIfNeeded(cloud).didReset) {
              setSeasonResetBanner(getCurrentSeasonInfo().seasonNumber);
            }
            const merged = mergeCloudAndLocalSave(saveProfileRef.current, cloud);
            const saved = saveLocalProfile(merged);
            saveProfileRef.current = saved;
            setSaveProfile(saved);
            setPlayerName(saved.displayName);
            await writeCloudSave(user.uid, saved);
          } else {
            const nameFromAuth =
              user.displayName?.trim().slice(0, 16) || saveProfileRef.current.displayName;
            const prepared = saveLocalProfile({
              ...saveProfileRef.current,
              displayName: nameFromAuth,
            });
            saveProfileRef.current = prepared;
            setSaveProfile(prepared);
            setPlayerName(prepared.displayName);
            await writeCloudSave(user.uid, prepared);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setCloudBusy(false);
        }
      }
    });
    return () => unsub();
  }, []);

  const refreshLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const list = await fetchRankedLeaderboard(25);
      setLeaderboard(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  const cycleLanguage = () => {
    const idx = LANGUAGE_OPTIONS.findIndex((l) => l.id === language);
    const nextLang = LANGUAGE_OPTIONS[(idx + 1) % LANGUAGE_OPTIONS.length].id;
    setLanguage(nextLang);
    persistProfile((prev) => ({ ...prev, language: nextLang }), true);
  };

  const handleSelectLanguage = (nextLang: Language) => {
    setLanguage(nextLang);
    persistProfile((prev) => ({ ...prev, language: nextLang }), true);
  };

  const handleUpdateDisplayName = (nextName: string) => {
    setPlayerName(nextName);
    setSaveProfile((prev) => ({ ...prev, displayName: nextName }));
  };

  const handleManualSaveNow = async () => {
    const saved = persistProfile(
      (prev) => ({
        ...prev,
        displayName: playerName.trim().slice(0, 16) || 'Jogador',
        language,
        preferredMode: selectedMode,
        preferredTeamSize: teamSize,
        muted,
      }),
      false
    );
    if (firebaseUser) {
      setCloudBusy(true);
      try {
        await writeCloudSave(firebaseUser.uid, saved);
        showSaveToast(t.saveFeedbackSynced);
      } catch (err) {
        console.error(err);
        showSaveToast(t.saveFeedbackSaved);
      } finally {
        setCloudBusy(false);
      }
    } else {
      showSaveToast(t.saveFeedbackSaved);
    }
  };

  const handleManualLoadSave = async () => {
    if (firebaseUser) {
      setCloudBusy(true);
      try {
        const cloud = await loadCloudSave(firebaseUser.uid);
        if (cloud && applySeasonResetIfNeeded(cloud).didReset) {
          setSeasonResetBanner(getCurrentSeasonInfo().seasonNumber);
        }
        const local = loadLocalSave();
        const loaded = cloud ? mergeCloudAndLocalSave(local, cloud) : local;
        const saved = saveLocalProfile(loaded);
        setSaveProfile(saved);
        setPlayerName(saved.displayName);
        setLanguage(saved.language);
        setSelectedMode(saved.preferredMode);
        setTeamSize(saved.preferredTeamSize);
        setMuted(saved.muted);
        showSaveToast(t.saveFeedbackLoaded);
        return;
      } catch (err) {
        console.error(err);
      } finally {
        setCloudBusy(false);
      }
    }
    const local = loadLocalSave();
    setSaveProfile(local);
    setPlayerName(local.displayName);
    setLanguage(local.language);
    setSelectedMode(local.preferredMode);
    setTeamSize(local.preferredTeamSize);
    setMuted(local.muted);
    showSaveToast(t.saveFeedbackLoaded);
  };

  const handleResetSave = async () => {
    const fresh = resetLocalSave(language);
    setSaveProfile(fresh);
    setPlayerName(fresh.displayName);
    if (firebaseUser) {
      setCloudBusy(true);
      try {
        await writeCloudSave(firebaseUser.uid, fresh);
      } catch (err) {
        console.error(err);
      } finally {
        setCloudBusy(false);
      }
    }
    showSaveToast(t.saveFeedbackReset);
  };

  const handleSignInGoogle = async () => {
    setCloudBusy(true);
    try {
      await signInWithGoogle();
      showSaveToast(t.saveFeedbackSynced);
    } catch (err) {
      console.error(err);
    } finally {
      setCloudBusy(false);
    }
  };

  const handleSignInEmail = async (email: string, password: string) => {
    setCloudBusy(true);
    try {
      await signInWithEmail(email, password);
      showSaveToast(t.saveFeedbackSynced);
    } finally {
      setCloudBusy(false);
    }
  };

  const handleCreateEmailAccount = async (email: string, password: string) => {
    setCloudBusy(true);
    try {
      await createEmailAccount(email, password);
      showSaveToast(t.saveFeedbackSynced);
    } finally {
      setCloudBusy(false);
    }
  };

  const handlePasswordReset = async (email: string) => {
    setCloudBusy(true);
    try {
      await sendPasswordReset(email);
      showSaveToast('E-mail de recuperação enviado. Confira sua caixa de entrada.');
    } finally {
      setCloudBusy(false);
    }
  };

  const handleSignOutGoogle = async () => {
    setCloudBusy(true);
    try {
      await signOutUser();
    } catch (err) {
      console.error(err);
    } finally {
      setCloudBusy(false);
    }
  };

  const handleSyncCloudNow = async () => {
    if (!firebaseUser) return;
    setCloudBusy(true);
    try {
      const saved = saveLocalProfile({
        ...saveProfile,
        displayName: playerName.trim().slice(0, 16) || 'Jogador',
        language,
        preferredMode: selectedMode,
        preferredTeamSize: teamSize,
        muted,
      });
      setSaveProfile(saved);
      await writeCloudSave(firebaseUser.uid, saved);
      showSaveToast(t.saveFeedbackSynced);
      void refreshLeaderboard();
    } catch (err) {
      console.error(err);
    } finally {
      setCloudBusy(false);
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundFX.setMuted(next);
    persistProfile((prev) => ({ ...prev, muted: next }), false);
  };

  const handleSendEmote = useCallback(
    (emoteId: string, senderSlot?: 'blue-1' | 'red-1') => {
      const option = EMOTE_OPTIONS.find((e) => e.id === emoteId);
      if (!option) return;

      const st = gameStateRef.current;
      if (st.mode === 'online') {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'send_emote', emoteId }));
        }
        return;
      }

      const baseSlot = st.mode === '2p' && senderSlot === 'red-1' ? 'red-1' : 'blue-1';
      const senderTeam: Team = baseSlot === 'red-1' ? 'red' : 'blue';
      const activeId = st.controlMap?.[baseSlot] ?? baseSlot;
      const senderPlayer =
        st.players.find((p) => p.id === activeId) ??
        st.players.find((p) => p.id === baseSlot);

      pushEmote({
        uid: `local-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        playerId: activeId,
        senderName:
          st.humanNames?.[baseSlot] ??
          senderPlayer?.name ??
          (senderTeam === 'blue' ? 'Jogador 1' : 'Jogador 2'),
        team: senderTeam,
        emoji: option.emoji,
        label: option.label,
        createdAt: Date.now(),
      });
    },
    [pushEmote]
  );

  const resolveKeyboardWithDiagonalTolerance = useCallback(
    (
      rawX: number,
      rawY: number,
      graceRef: React.MutableRefObject<{ x: number; y: number; until: number }>
    ): { x: number; y: number } => {
      const now = performance.now();
      const tolMs = Math.max(0, Math.min(400, diagonalToleranceRef.current ?? 200));
      const hasX = Math.abs(rawX) > 0.1;
      const hasY = Math.abs(rawY) > 0.1;

      if (hasX && hasY) {
        const mag = Math.hypot(rawX, rawY) || 1;
        const nx = rawX / mag;
        const ny = rawY / mag;
        graceRef.current = { x: nx, y: ny, until: tolMs > 0 ? now + tolMs : 0 };
        return { x: nx, y: ny };
      }

      if (tolMs > 0 && (hasX || hasY) && now <= graceRef.current.until) {
        const gx = graceRef.current.x;
        const gy = graceRef.current.y;
        const reversesX = hasX && Math.sign(rawX) !== Math.sign(gx);
        const reversesY = hasY && Math.sign(rawY) !== Math.sign(gy);
        if (!reversesX && !reversesY) {
          return { x: gx, y: gy };
        }
        graceRef.current.until = 0;
      } else if ((!hasX && !hasY) || tolMs <= 0) {
        graceRef.current.until = 0;
      }

      const mag = Math.hypot(rawX, rawY);
      if (mag > 1) {
        return { x: rawX / mag, y: rawY / mag };
      }
      return { x: rawX, y: rawY };
    },
    []
  );

  // Compute merged keyboard + virtual joystick inputs
  const computeCombinedInputs = useCallback(
    (mode: GameMode, slot: string): Record<string, PlayerInput> => {
      const keys = keysPressedRef.current;

      // Player 1 keyboard (WASD + F/G/E; in non-2P modes also Arrows + Space/Shift/C)
      let raw1x = 0;
      let raw1y = 0;
      if (keys.has('KeyA')) raw1x -= 1;
      if (keys.has('KeyD')) raw1x += 1;
      if (keys.has('KeyW')) raw1y -= 1;
      if (keys.has('KeyS')) raw1y += 1;

      if (mode !== '2p') {
        if (keys.has('ArrowLeft')) raw1x -= 1;
        if (keys.has('ArrowRight')) raw1x += 1;
        if (keys.has('ArrowUp')) raw1y -= 1;
        if (keys.has('ArrowDown')) raw1y += 1;
      }

      const { x: k1x, y: k1y } = resolveKeyboardWithDiagonalTolerance(
        raw1x,
        raw1y,
        p1DiagGraceRef
      );

      const k1Shoot =
        keys.has('KeyF') ||
        (mode !== '2p' && (keys.has('Space') || keys.has('KeyJ')));
      const k1Dribble =
        keys.has('KeyG') ||
        (mode !== '2p' && (keys.has('KeyQ') || keys.has('KeyK')));
      const k1Pass =
        keys.has('KeyE') ||
        keys.has('KeyR') ||
        (mode !== '2p' && keys.has('KeyC'));
      const k1Switch = keys.has('KeyE');
      const k1Sprint =
        keys.has('ShiftLeft') ||
        keys.has('KeyB') ||
        (mode !== '2p' && keys.has('ShiftRight'));
      const k1Skill1 = keys.has('KeyZ');
      const k1Skill2 = keys.has('KeyX');

      // Player 2 keyboard (2P Local: Arrow keys + K Chutar / L Driblar / J Passar / RightShift Correr)
      let raw2x = 0;
      let raw2y = 0;
      if (keys.has('ArrowLeft')) raw2x -= 1;
      if (keys.has('ArrowRight')) raw2x += 1;
      if (keys.has('ArrowUp')) raw2y -= 1;
      if (keys.has('ArrowDown')) raw2y += 1;
      const { x: k2x, y: k2y } = resolveKeyboardWithDiagonalTolerance(
        raw2x,
        raw2y,
        p2DiagGraceRef
      );
      const k2Shoot = keys.has('KeyK') || keys.has('Enter') || keys.has('Numpad1');
      const k2Dribble = keys.has('KeyL') || keys.has('Numpad2');
      const k2Pass = keys.has('KeyJ') || keys.has('Numpad3');
      const k2Sprint = keys.has('ShiftRight') || keys.has('Numpad0');
      const k2Skill1 = keys.has('KeyI') || keys.has('Numpad4');
      const k2Skill2 = keys.has('KeyO') || keys.has('Numpad5');

      const t1 = touchP1Ref.current;
      const t2 = touchP2Ref.current;

      const p1Input: PlayerInput = {
        moveX: Math.abs(t1.moveX) > 0.05 ? t1.moveX : k1x,
        moveY: Math.abs(t1.moveY) > 0.05 ? t1.moveY : k1y,
        shoot: t1.shoot || k1Shoot,
        dribble: t1.dribble || k1Dribble,
        pass: t1.pass || k1Pass,
        switchPlayer: Boolean(t1.switchPlayer) || k1Switch,
        sprint: t1.sprint || k1Sprint,
        skill1: Boolean(t1.skill1) || k1Skill1,
        skill2: Boolean(t1.skill2) || k1Skill2,
        diagonalToleranceMs: diagonalToleranceRef.current,
      };

      const p2Input: PlayerInput = {
        moveX: Math.abs(t2.moveX) > 0.05 ? t2.moveX : k2x,
        moveY: Math.abs(t2.moveY) > 0.05 ? t2.moveY : k2y,
        shoot: t2.shoot || k2Shoot,
        dribble: t2.dribble || k2Dribble,
        pass: t2.pass || k2Pass,
        switchPlayer: Boolean(t2.switchPlayer),
        sprint: t2.sprint || k2Sprint,
        skill1: Boolean(t2.skill1) || k2Skill1,
        skill2: Boolean(t2.skill2) || k2Skill2,
        diagonalToleranceMs: diagonalToleranceRef.current,
      };

      if (mode === 'online') {
        return { [slot]: p1Input };
      }
      if (mode === '2p') {
        return { 'blue-1': p1Input, 'red-1': p2Input };
      }
      return { 'blue-1': p1Input };
    },
    [resolveKeyboardWithDiagonalTolerance]
  );

  const isPortraitBlocked = screen === 'PLAYING' && isMobileDevice && isPortrait;
  const isPortraitBlockedRef = useRef<boolean>(false);
  isPortraitBlockedRef.current = isPortraitBlocked;

  const lastSentInputMetaRef = useRef<{ sig: string; sentAt: number }>({
    sig: '',
    sentAt: 0,
  });

  const pushOnlineInputNow = useCallback(
    (forceImmediate = false) => {
      if (gameStateRef.current.mode !== 'online' || isSpectatorRef.current) return;
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      const slot = onlineSlotRef.current;
      const mine = isPortraitBlockedRef.current
        ? EMPTY_INPUT
        : computeCombinedInputs('online', slot)[slot] ?? EMPTY_INPUT;

      const sig = `${mine.moveX.toFixed(3)},${mine.moveY.toFixed(3)},${
        mine.shoot ? 1 : 0
      },${mine.dribble ? 1 : 0},${mine.pass ? 1 : 0},${mine.switchPlayer ? 1 : 0},${
        mine.sprint ? 1 : 0
      },${mine.skill1 ? 1 : 0},${mine.skill2 ? 1 : 0}`;
      const now = performance.now();
      const elapsed = now - lastSentInputMetaRef.current.sentAt;
      const hasActionHold =
        mine.shoot ||
        mine.dribble ||
        mine.pass ||
        Boolean(mine.switchPlayer) ||
        mine.sprint ||
        Boolean(mine.skill1) ||
        Boolean(mine.skill2);

      if (!forceImmediate && sig === lastSentInputMetaRef.current.sig) {
        const heartbeatMs = hasActionHold ? 180 : 450;
        if (elapsed < heartbeatMs) {
          return;
        }
      }

      lastSentInputMetaRef.current = { sig, sentAt: now };
      ws.send(
        JSON.stringify({
          type: 'pi',
          x: Math.round(mine.moveX * 1000) / 1000,
          y: Math.round(mine.moveY * 1000) / 1000,
          sh: mine.shoot ? 1 : 0,
          dr: mine.dribble ? 1 : 0,
          ps: mine.pass ? 1 : 0,
          sw: mine.switchPlayer ? 1 : 0,
          sp: mine.sprint ? 1 : 0,
          s1: mine.skill1 ? 1 : 0,
          s2: mine.skill2 ? 1 : 0,
          dt: diagonalToleranceRef.current,
        })
      );
    },
    [computeCombinedInputs]
  );

  // Keyboard listener for crisp desktop control + quick emote hotkeys (P1: 1-5, P2: 6-0)
  useEffect(() => {
    let diagExpireTimer: number | null = null;

    const updateVisualKeyMirror = () => {
      const keys = keysPressedRef.current;
      const mode = gameStateRef.current.mode;

      let raw1x = (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0);
      let raw1y = (keys.has('KeyS') ? 1 : 0) - (keys.has('KeyW') ? 1 : 0);
      if (mode !== '2p') {
        raw1x += (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
        raw1y += (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0);
      }
      const { x: k1x, y: k1y } = resolveKeyboardWithDiagonalTolerance(
        raw1x,
        raw1y,
        p1DiagGraceRef
      );
      setP1KeyVec({ x: k1x, y: k1y });
      setP1KeyButtons({
        shoot: keys.has('KeyF') || (mode !== '2p' && (keys.has('Space') || keys.has('KeyJ'))),
        dribble: keys.has('KeyG') || (mode !== '2p' && (keys.has('KeyQ') || keys.has('KeyK'))),
        pass:
          keys.has('KeyE') ||
          keys.has('KeyR') ||
          (mode !== '2p' && keys.has('KeyC')),
        switchPlayer: keys.has('KeyE'),
        sprint:
          keys.has('ShiftLeft') ||
          keys.has('KeyB') ||
          (mode !== '2p' && keys.has('ShiftRight')),
        skill1: keys.has('KeyZ'),
        skill2: keys.has('KeyX'),
      });

      const raw2x = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
      const raw2y = (keys.has('ArrowDown') ? 1 : 0) - (keys.has('ArrowUp') ? 1 : 0);
      const { x: k2x, y: k2y } = resolveKeyboardWithDiagonalTolerance(
        raw2x,
        raw2y,
        p2DiagGraceRef
      );
      setP2KeyVec({ x: k2x, y: k2y });
      setP2KeyButtons({
        shoot: keys.has('KeyK') || keys.has('Enter') || keys.has('Numpad1'),
        dribble: keys.has('KeyL') || keys.has('Numpad2'),
        pass: keys.has('KeyJ') || keys.has('Numpad3'),
        switchPlayer: false,
        sprint: keys.has('ShiftRight') || keys.has('Numpad0'),
        skill1: keys.has('KeyI') || keys.has('Numpad4'),
        skill2: keys.has('KeyO') || keys.has('Numpad5'),
      });
    };

    const scheduleDiagGraceRefresh = () => {
      if (diagExpireTimer !== null) {
        window.clearTimeout(diagExpireTimer);
        diagExpireTimer = null;
      }
      const now = performance.now();
      const rem1 = p1DiagGraceRef.current.until - now;
      const rem2 = p2DiagGraceRef.current.until - now;
      const waitMs = Math.max(rem1, rem2);
      if (waitMs > 0) {
        diagExpireTimer = window.setTimeout(() => {
          updateVisualKeyMirror();
          pushOnlineInputNow(true);
        }, waitMs + 12);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (devModalOpen || matchSkillPicker.open) return;
      if (screen !== 'PLAYING') return;
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)
      ) {
        e.preventDefault();
      }
      if (e.code === 'Escape' && gameStateRef.current.mode !== 'online') {
        setEmotePickerOpen(false);
        setPaused((p) => !p);
        return;
      }

      // Keyboard number emotes: Player 1 -> 12345, Player 2 -> 67890
      if (!e.repeat && e.code.startsWith('Digit')) {
        const digit = Number(e.code.replace('Digit', ''));
        if (digit >= 1 && digit <= 5) {
          const opt = EMOTE_OPTIONS[digit - 1];
          if (opt) handleSendEmote(opt.id, 'blue-1');
          return;
        }
        if (digit === 6 || digit === 7 || digit === 8 || digit === 9 || digit === 0) {
          if (gameStateRef.current.mode === '2p') {
            const idx = digit === 0 ? 4 : digit - 6;
            const opt = EMOTE_OPTIONS[idx];
            if (opt) handleSendEmote(opt.id, 'red-1');
          }
          return;
        }
      }

      keysPressedRef.current.add(e.code);
      updateVisualKeyMirror();
      pushOnlineInputNow(true);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.code);
      updateVisualKeyMirror();
      scheduleDiagGraceRefresh();
      pushOnlineInputNow(true);
    };

    const onBlur = () => {
      keysPressedRef.current.clear();
      p1DiagGraceRef.current.until = 0;
      p2DiagGraceRef.current.until = 0;
      updateVisualKeyMirror();
      pushOnlineInputNow(true);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      if (diagExpireTimer !== null) {
        window.clearTimeout(diagExpireTimer);
      }
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [
    screen,
    devModalOpen,
    matchSkillPicker.open,
    handleSendEmote,
    pushOnlineInputNow,
    resolveKeyboardWithDiagonalTolerance,
  ]);

  // Closing Developer Mode also ends the local authorization session.
  // Reopening it always requires the developer password again.
  const closeDevMode = () => {
    setDevModalOpen(false);
    setDevUnlocked(false);
    devTokenRef.current = null;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'dev_auth', token: '' }));
    }
  };

  // Global Developer Mode shortcut (Ctrl+Shift+Alt+D) + Escape close
  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.altKey && e.code === 'KeyD') {
        e.preventDefault();
        keysPressedRef.current.clear();
        if (devModalOpen) {
          closeDevMode();
        } else {
          setDevModalOpen(true);
        }
        return;
      }
      if (e.code === 'Escape' && devModalOpen) {
        e.preventDefault();
        closeDevMode();
        return;
      }
      if (e.code === 'Escape' && matchSkillPicker.open) {
        e.preventDefault();
        setMatchSkillPicker((prev) => ({ ...prev, open: false }));
        return;
      }
      if (e.code === 'Escape' && menuControlsOpen) {
        e.preventDefault();
        setMenuControlsOpen(false);
        return;
      }
      if (e.code === 'Escape' && unifiedShop.open) {
        e.preventDefault();
        setUnifiedShop((prev) => ({ ...prev, open: false }));
      }
    };
    window.addEventListener('keydown', onGlobalKey);
    return () => window.removeEventListener('keydown', onGlobalKey);
  }, [devModalOpen, matchSkillPicker.open, menuControlsOpen, unifiedShop.open]);

  const prevPortraitBlockedRef = useRef<boolean>(false);
  useEffect(() => {
    const wasBlocked = prevPortraitBlockedRef.current;
    prevPortraitBlockedRef.current = isPortraitBlocked;
    if (isPortraitBlocked) {
      touchP1Ref.current = { ...EMPTY_INPUT };
      touchP2Ref.current = { ...EMPTY_INPUT };
      keysPressedRef.current.clear();
      if (gameStateRef.current.mode === 'online') {
        pushOnlineInputNow(true);
      }
    } else if (wasBlocked && screen === 'PLAYING' && gameStateRef.current.phase === 'KICKOFF') {
      soundFX.play('whistle');
    }
  }, [isPortraitBlocked, pushOnlineInputNow, screen]);

  // Local 60Hz game loop for 1P, Training & 2P modes
  useEffect(() => {
    if (screen !== 'PLAYING' || gameStateRef.current.mode === 'online') return;

    let animId = 0;
    let lastTime = performance.now();
    let hudTimer = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const st = gameStateRef.current;

      if (!paused && !isPortraitBlockedRef.current) {
        const prevPhase = st.phase;
        const prevBlue = st.score.blue;
        const prevRed = st.score.red;

        const inputs = computeCombinedInputs(st.mode, 'blue-1');
        stepGameState(st, inputs, dt, devHacksRef.current);

        for (const ev of st.events) {
          soundFX.play(ev.type);
        }

        if (st.mode === '1p' || st.mode === '2p') {
          getReplayRecorder().recordStep(st, dt);
        }

        hudTimer += dt;
        if (
          hudTimer >= 0.033 ||
          st.phase !== prevPhase ||
          st.score.blue !== prevBlue ||
          st.score.red !== prevRed
        ) {
          hudTimer = 0;
          syncHudFromState(st);
        }
      }

      // Save career stats & best moments replay when a local match finishes
      if (st.phase === 'FINISHED' && !localMatchRecordedRef.current) {
        localMatchRecordedRef.current = true;
        if (st.mode === '1p' || st.mode === '2p') {
          const reel = getReplayRecorder().finalizeMatch(st);
          setLastMatchReplay(reel);
          setSavedReplays((prev) => [reel, ...prev.filter((r) => r.id !== reel.id)].slice(0, 6));
          void saveReplayToDB(reel);
        }
        const result: 'win' | 'loss' | 'draw' =
          st.winner === 'draw' || st.winner === null
            ? 'draw'
            : st.winner === 'blue'
            ? 'win'
            : 'loss';
        soundFX.playMatchEnd(result);
        const matchRec: SaveMatchRecord = {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          mode: st.mode,
          isRanked: false,
          teamSize: st.teamSize,
          blueScore: st.score.blue,
          redScore: st.score.red,
          result,
          expDelta: 0,
          rankAfter: getRankInfo(saveProfileRef.current.exp).tier.id,
          createdAt: Date.now(),
        };
        const updated = persistProfile(
          (prev) => ({
            ...prev,
            totalMatches: prev.totalMatches + 1,
            totalGoals: prev.totalGoals + st.score.blue,
            recentMatches: [matchRec, ...prev.recentMatches].slice(0, 12),
          }),
          true
        );
        if (firebaseUserRef.current) {
          void recordCloudMatch(firebaseUserRef.current.uid, matchRec).catch(() => {});
          void writeCloudSave(firebaseUserRef.current.uid, updated).catch(() => {});
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [screen, paused, computeCombinedInputs, syncHudFromState, persistProfile]);

  // WebSocket lifecycle for Online Multiplayer
  const connectWebSocket = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
      setOnlineError(null);
      ws.send(JSON.stringify({ type: 'list_live_rooms' }));
      ws.send(JSON.stringify({ type: 'ping', t: performance.now() }));
      if (devTokenRef.current) {
        ws.send(JSON.stringify({ type: 'dev_auth', token: devTokenRef.current }));
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      setPingMs(null);
      setSearchingQuickMatch(false);
    };

    ws.onerror = () => {
      setOnlineError(t.serverConnectError);
    };

    ws.onmessage = (event) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(event.data) as Record<string, unknown>;
      } catch {
        return;
      }

      const type = String(msg.type || '');
      if (type === 'dev_authenticated' && msg.ok === false) {
        devTokenRef.current = null;
        setDevUnlocked(false);
        return;
      }
      if (type === 'pong') {
        const sentT = Number(msg.t);
        if (Number.isFinite(sentT)) {
          const rtt = Math.max(1, Math.min(999, Math.round(performance.now() - sentT)));
          setPingMs(rtt);
        }
        return;
      }

      if (type === 'error') {
        setOnlineError(String(msg.message || 'Erro no servidor.'));
        setSearchingQuickMatch(false);
        soundFX.playError();
        return;
      }

      if (type === 'matchmaking_waiting') {
        setSearchingQuickMatch(true);
        setOnlineError(null);
        return;
      }

      if (type === 'lobby_update') {
        const hadLobby = Boolean(lobbyRef.current);
        setSearchingQuickMatch(false);
        setOnlineError(null);
        const slot = String(msg.yourSlot || 'blue-1');
        onlineSlotRef.current = slot;
        setOnlineSlot(slot);
        const parsedSize: TeamSize = parseTeamSize(msg.teamSize);
        setLobby({
          roomCode: String(msg.roomCode),
          teamSize: parsedSize,
          isRanked: Boolean(msg.isRanked),
          hostName: String(msg.hostName),
          isHost: Boolean(msg.isHost),
          isReady: Boolean(msg.isReady),
          yourSlot: slot,
          yourTeam: msg.yourTeam === 'red' ? 'red' : 'blue',
          bluePlayers: (msg.bluePlayers as LobbySlotInfo[]) || [],
          redPlayers: (msg.redPlayers as LobbySlotInfo[]) || [],
          humanCount: Number(msg.humanCount || 1),
          maxHumans: Number(msg.maxHumans || parsedSize * 2),
        });
        if (!hadLobby) {
          soundFX.playMatchFound();
        }
        return;
      }

      if (type === 'live_rooms') {
        setLiveRooms(Array.isArray(msg.rooms) ? (msg.rooms as LiveRoomInfo[]) : []);
        return;
      }

      if (type === 'match_started') {
        setSearchingQuickMatch(false);
        setOnlineError(null);
        setRankedSummary(null);
        setOnlineCasualSummary(null);
        setSpectatorSummary(null);
        setMvpDismissed(false);
        setIsSpectator(false);
        isSpectatorRef.current = false;
        setOnlineMatchIsRanked(Boolean(msg.isRanked));
        activeEmotesRef.current = [];
        setEmoteFeed([]);
        const slot = String(msg.yourSlot || 'blue-1');
        onlineSlotRef.current = slot;
        setOnlineSlot(slot);
        const incomingState = msg.state as GameState;
        gameStateRef.current = incomingState;
        syncHudFromState(incomingState);
        setPaused(false);
        setScreen('PLAYING');
        soundFX.play('whistle');
        return;
      }

      if (type === 'spectator_joined') {
        setSearchingQuickMatch(false);
        setOnlineError(null);
        setRankedSummary(null);
        setOnlineCasualSummary(null);
        setSpectatorSummary(null);
        setMvpDismissed(false);
        setOnlineMatchIsRanked(Boolean(msg.isRanked));
        setIsSpectator(true);
        isSpectatorRef.current = true;
        onlineSlotRef.current = 'spectator';
        setOnlineSlot('spectator');
        setSpectateTargetId('ball');
        setSpectatorCount(Number(msg.spectatorCount || 1));
        activeEmotesRef.current = [];
        setEmoteFeed([]);
        const incomingState = msg.state as GameState;
        gameStateRef.current = incomingState;
        syncHudFromState(incomingState);
        setPaused(false);
        setScreen('PLAYING');
        soundFX.play('whistle');
        return;
      }

      if (type === 'spectator_match_ended') {
        setSpectatorSummary({
          roomCode: String(msg.roomCode || ''),
          winner: (msg.winner as MatchWinner) ?? 'draw',
          blueScore: Number(msg.blueScore || 0),
          redScore: Number(msg.redScore || 0),
        });
        gameStateRef.current.phase = 'FINISHED';
        gameStateRef.current.winner = (msg.winner as MatchWinner) ?? 'draw';
        syncHudFromState(gameStateRef.current);
        soundFX.playMatchEnd('draw');
        return;
      }

      if (type === 'gs') {
        const incomingState = applyCompactState(
          gameStateRef.current,
          msg as unknown as CompactStatePacket
        );
        gameStateRef.current = incomingState;
        if (typeof msg.sc === 'number') {
          setSpectatorCount(msg.sc);
        }
        for (const ev of incomingState.events) {
          soundFX.play(ev.type);
        }
        syncHudFromState(incomingState);
        return;
      }

      if (type === 'slot_to_ai') {
        const aiSlot = String(msg.slot || '');
        const aiName = String(msg.name || '');
        if (Array.isArray(msg.humanSlots)) {
          gameStateRef.current.humanSlots = msg.humanSlots.map((s) => String(s));
        }
        const player = gameStateRef.current.players.find((pl) => pl.id === aiSlot);
        if (player) {
          player.isAI = true;
          if (aiName) player.name = aiName;
        }
        syncHudFromState(gameStateRef.current);
        return;
      }

      if (type === 'game_state') {
        const incomingState = msg.state as GameState;
        gameStateRef.current = incomingState;
        if (typeof msg.spectatorCount === 'number') {
          setSpectatorCount(msg.spectatorCount);
        }
        for (const ev of incomingState.events) {
          soundFX.play(ev.type);
        }
        syncHudFromState(incomingState);
        return;
      }

      if (type === 'ranked_result') {
        const result =
          msg.result === 'win' || msg.result === 'loss' ? msg.result : 'draw';
        const expDelta = Number(msg.expDelta || 0);
        const nextExp = Math.max(0, Math.floor(Number(msg.nextExp || 0)));
        const rankAfterInfo = getRankInfo(nextExp);
        const prevRankId = (msg.prevRankId as RankId) || 'bronze';
        const nextRankId = (msg.nextRankId as RankId) || rankAfterInfo.tier.id;
        const promoted = Boolean(msg.promoted);
        const coinsEarned = Math.max(0, Math.floor(Number(msg.coinsEarned || 0)));
        const blueScore = Number(msg.blueScore || 0);
        const redScore = Number(msg.redScore || 0);
        const matchTeamSize: TeamSize = parseTeamSize(msg.teamSize);
        const slot = String(msg.yourSlot || onlineSlotRef.current);
        const goalsFor = slot.startsWith('red') ? redScore : blueScore;

        setRankedSummary({
          result,
          expDelta,
          nextExp,
          prevRankId,
          nextRankId,
          nextSubLevel: rankAfterInfo.subLevel,
          promoted,
          coinsEarned,
        });
        soundFX.playMatchEnd(result);

        const rec: SaveMatchRecord = {
          id: `ranked-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          mode: 'online',
          isRanked: true,
          teamSize: matchTeamSize,
          blueScore,
          redScore,
          result,
          expDelta,
          rankAfter: nextRankId,
          createdAt: Date.now(),
        };

        const updated = persistProfile(
          (prev) => ({
            ...prev,
            exp: nextExp,
            rankId: nextRankId,
            coins: prev.coins + coinsEarned,
            rankedWins: prev.rankedWins + (result === 'win' ? 1 : 0),
            rankedLosses: prev.rankedLosses + (result === 'loss' ? 1 : 0),
            rankedDraws: prev.rankedDraws + (result === 'draw' ? 1 : 0),
            totalMatches: prev.totalMatches + 1,
            totalGoals: prev.totalGoals + goalsFor,
            recentMatches: [rec, ...prev.recentMatches].slice(0, 12),
          }),
          true
        );

        if (firebaseUserRef.current) {
          void recordCloudMatch(firebaseUserRef.current.uid, rec).catch(() => {});
          void writeCloudSave(firebaseUserRef.current.uid, updated).catch(() => {});
        }
        return;
      }

      if (type === 'online_casual_result') {
        const result =
          msg.result === 'win' || msg.result === 'loss' ? msg.result : 'draw';
        const coinsEarned = Math.max(0, Math.floor(Number(msg.coinsEarned || 0)));
        const blueScore = Number(msg.blueScore || 0);
        const redScore = Number(msg.redScore || 0);
        const matchTeamSize: TeamSize = parseTeamSize(msg.teamSize);
        const slot = String(msg.yourSlot || onlineSlotRef.current);
        const goalsFor = slot.startsWith('red') ? redScore : blueScore;

        setOnlineCasualSummary({ result, coinsEarned });
        soundFX.playMatchEnd(result);

        const rec: SaveMatchRecord = {
          id: `casual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          mode: 'online',
          isRanked: false,
          teamSize: matchTeamSize,
          blueScore,
          redScore,
          result,
          expDelta: 0,
          rankAfter: getRankInfo(saveProfileRef.current.exp).tier.id,
          createdAt: Date.now(),
        };

        const updated = persistProfile(
          (prev) => ({
            ...prev,
            coins: prev.coins + coinsEarned,
            totalMatches: prev.totalMatches + 1,
            totalGoals: prev.totalGoals + goalsFor,
            recentMatches: [rec, ...prev.recentMatches].slice(0, 12),
          }),
          true
        );

        if (firebaseUserRef.current) {
          void recordCloudMatch(firebaseUserRef.current.uid, rec).catch(() => {});
          void writeCloudSave(firebaseUserRef.current.uid, updated).catch(() => {});
        }
        return;
      }

      if (type === 'emote') {
        pushEmote({
          uid: String(msg.uid || `em-${Date.now()}`),
          playerId: String(msg.playerId || 'blue-1'),
          senderName: String(msg.senderName || 'Jogador'),
          team: msg.team === 'red' ? 'red' : 'blue',
          emoji: String(msg.emoji || '⚽'),
          label: String(msg.label || ''),
          createdAt: Date.now(),
        });
        return;
      }

      if (type === 'opponent_left') {
        setOnlineError(String(msg.message || 'O adversário saiu da sala.'));
        setIsSpectator(false);
        isSpectatorRef.current = false;
        setSpectatorSummary(null);
        setLobby(null);
        setScreen('ONLINE_LOBBY');
        setPaused(false);
        soundFX.playError();
        return;
      }
    };
  }, [syncHudFromState, pushEmote, persistProfile, t.serverConnectError]);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Periodic RTT ping measurement while WebSocket is connected
  useEffect(() => {
    if (!wsConnected) return;
    const sendPing = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', t: performance.now() }));
      }
    };
    sendPing();
    const interval = setInterval(sendPing, 2000);
    return () => clearInterval(interval);
  }, [wsConnected]);

  // Online input heartbeat (immediate on touch/key edges, low-overhead keepalive heartbeat)
  useEffect(() => {
    if (screen !== 'PLAYING' || gameStateRef.current.mode !== 'online') return;

    lastSentInputMetaRef.current = { sig: '', sentAt: 0 };
    const interval = setInterval(() => {
      pushOnlineInputNow(false);
    }, 180);

    return () => clearInterval(interval);
  }, [screen, pushOnlineInputNow]);

  const startLocalMatch = (
    mode: '1p' | '2p' | 'training',
    p1SkillsOverride?: SkillId[],
    p2SkillsOverride?: SkillId[]
  ) => {
    localMatchRecordedRef.current = false;
    getReplayRecorder().reset();
    setReplayModalOpen(false);
    setLastMatchReplay(null);
    setRankedSummary(null);
    setOnlineCasualSummary(null);
    setSpectatorSummary(null);
    setMvpDismissed(false);
    setIsSpectator(false);
    isSpectatorRef.current = false;
    setOnlineMatchIsRanked(false);
    const p1Custom = localBlueName.trim() || t.localP1Placeholder;
    const p2Custom = localRedName.trim() || t.localP2Placeholder;
    const finalP1Skills = (p1SkillsOverride ?? p1MatchSkills).slice(0, 2);
    const finalP2Skills = (p2SkillsOverride ?? p2MatchSkills).slice(0, 2);
    setP1MatchSkills(finalP1Skills);
    if (mode === '2p') {
      setP2MatchSkills(finalP2Skills);
    }
    const initial = createInitialGameState({
      mode,
      teamSize,
      blueName: mode === '2p' ? p1Custom : t.youTag.replace(/[()]/g, ''),
      redName:
        mode === '2p' ? p2Custom : mode === 'training' ? 'IA Treino' : 'IA Rival',
      slotAppearances: {
        'blue-1': saveProfileRef.current.characterConfig,
      },
      slotSkills: {
        'blue-1': finalP1Skills,
        ...(mode === '2p' ? { 'red-1': finalP2Skills } : {}),
      },
    });
    gameStateRef.current = initial;
    activeEmotesRef.current = [];
    setEmoteFeed([]);
    syncHudFromState(initial);
    setPaused(false);
    setScreen('PLAYING');
    if (!(detectMobileDevice() && window.innerHeight > window.innerWidth)) {
      soundFX.play('whistle');
    }
  };

  const handleMainStart = () => {
    persistProfile(
      (prev) => ({
        ...prev,
        preferredMode: selectedMode,
        preferredTeamSize: teamSize,
      }),
      false
    );
    if (selectedMode === 'online') {
      setOnlineError(null);
      setLobby(null);
      setIsSpectator(false);
      isSpectatorRef.current = false;
      setSpectatorSummary(null);
      connectWebSocket();
      setScreen('ONLINE_LOBBY');
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'list_live_rooms' }));
      }
    } else {
      setMatchSkillPicker({
        open: true,
        mode: selectedMode,
        purpose: 'local-start',
      });
    }
  };

  const handleRestartMatch = () => {
    const mode = gameStateRef.current.mode;
    if (mode === 'online') {
      if (isSpectatorRef.current) {
        handleExitToMenu();
        return;
      }
      setRankedSummary(null);
      setOnlineCasualSummary(null);
      wsRef.current?.send(
        JSON.stringify({
          type: 'rematch',
          name: playerName.trim().slice(0, 16) || 'Jogador',
          exp: saveProfileRef.current.exp,
          appearance: saveProfileRef.current.characterConfig,
          equippedSkills: saveProfileRef.current.equippedSkills,
          ...(devUnlockedRef.current
            ? { devToken: devTokenRef.current, devHacks: devHacksRef.current }
            : {}),
        })
      );
      return;
    }
    setPaused(false);
    setMatchSkillPicker({
      open: true,
      mode,
      purpose: 'local-start',
    });
  };

  const handleExitToMenu = () => {
    if (gameStateRef.current.mode === 'online' || screen === 'ONLINE_LOBBY') {
      wsRef.current?.send(JSON.stringify({ type: 'leave_room' }));
      setLobby(null);
      setSearchingQuickMatch(false);
    }
    setIsSpectator(false);
    isSpectatorRef.current = false;
    setSpectatorSummary(null);
    setRankedSummary(null);
    setOnlineCasualSummary(null);
    setMvpDismissed(false);
    activeEmotesRef.current = [];
    setEmoteFeed([]);
    setEmotePickerOpen(false);
    setPaused(false);
    setScreen('MENU');
  };

  const sendLobbyMsg = (
    payload: Record<string, unknown>,
    equippedSkillsOverride?: SkillId[]
  ) => {
    if (
      payload.type === 'quick_match' ||
      payload.type === 'start_match' ||
      payload.type === 'spectate_room'
    ) {
      requestLandscapeMode();
    }
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
      setOnlineError(t.connectingWaitError);
      return;
    }
    const cleanName = playerName.trim().slice(0, 16) || 'Jogador';
    if (cleanName !== saveProfileRef.current.displayName) {
      persistProfile((prev) => ({ ...prev, displayName: cleanName }), false);
    }
    wsRef.current.send(
      JSON.stringify({
        ...payload,
        name: cleanName,
        exp: saveProfileRef.current.exp,
        seasonNumber: saveProfileRef.current.seasonNumber,
        appearance: saveProfileRef.current.characterConfig,
        equippedSkills: equippedSkillsOverride ?? saveProfileRef.current.equippedSkills,
        ...(devUnlockedRef.current
          ? { devToken: devTokenRef.current, devHacks: devHacksRef.current }
          : {}),
      })
    );
  };

  const copyRoomCode = () => {
    if (!lobby) return;
    navigator.clipboard?.writeText(lobby.roomCode).catch(() => {});
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const isOnline = gameStateRef.current.mode === 'online';
  const isTwoPlayerLocal = gameStateRef.current.mode === '2p';
  const myTeam: Team = isOnline && onlineSlot.startsWith('red') ? 'red' : 'blue';

  const myRankInfo = getRankInfo(saveProfile.exp);
  const myRankBaseLabel = getLocalizedRankName(myRankInfo.tier.id, language);
  const myRankLabel = formatRankWithSubLevel(myRankBaseLabel, myRankInfo.subLevel);
  const currentLangObj =
    LANGUAGE_OPTIONS.find((l) => l.id === language) ?? LANGUAGE_OPTIONS[0];

  const syncProfileToServerIfOpen = useCallback((profile: SaveProfile) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'update_profile',
          name: profile.displayName,
          exp: profile.exp,
          seasonNumber: profile.seasonNumber,
          appearance: profile.characterConfig,
          equippedSkills: profile.equippedSkills,
        })
      );
    }
  }, []);

  // Live 1-second Season Countdown & Automatic Bronze Reset (handles live rollover + background tab wake)
  useEffect(() => {
    const tickSeason = () => {
      const next = getCurrentSeasonInfo();
      setSeasonInfo(next);
      if (saveProfileRef.current.seasonNumber < next.seasonNumber) {
        const { profile: resetProfile, didReset } = applySeasonResetIfNeeded(
          saveProfileRef.current
        );
        const saved = persistProfile(() => resetProfile, true);
        syncProfileToServerIfOpen(saved);
        if (didReset) {
          setSeasonResetBanner(next.seasonNumber);
        }
      }
    };
    tickSeason();
    const id = window.setInterval(tickSeason, 1000);
    return () => window.clearInterval(id);
  }, [persistProfile, syncProfileToServerIfOpen]);

  const handleDevAddGoal = useCallback(
    (team: Team, delta: number) => {
      const st = gameStateRef.current;
      if (st.mode === 'online') {
        if (!isSpectatorRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'dev_command',
              devToken: devTokenRef.current,
              command: 'add_goal',
              team,
              delta,
            })
          );
        }
        return;
      }
      st.score[team] = Math.max(0, st.score[team] + delta);
      syncHudFromState(st);
    },
    [syncHudFromState]
  );

  const handleDevResetScore = useCallback(() => {
    const st = gameStateRef.current;
    if (st.mode === 'online') {
      if (!isSpectatorRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'dev_command',
            devToken: devTokenRef.current,
            command: 'reset_score',
          })
        );
      }
      return;
    }
    st.score.blue = 0;
    st.score.red = 0;
    syncHudFromState(st);
  }, [syncHudFromState]);

  const handleDevAdjustTime = useCallback(
    (mode: 'add30' | 'set5' | 'set999' | 'finish') => {
      const st = gameStateRef.current;
      if (st.mode === 'online') {
        if (!isSpectatorRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'dev_command',
              devToken: devTokenRef.current,
              command: 'adjust_time',
              timeMode: mode,
            })
          );
        }
        return;
      }
      if (mode === 'add30') {
        st.timeRemaining += 30;
      } else if (mode === 'set5') {
        st.timeRemaining = 5;
        if (st.phase === 'KICKOFF' || st.phase === 'OVERTIME') {
          st.phase = 'PLAYING';
          st.phaseTimer = 0;
        }
      } else if (mode === 'set999') {
        st.timeRemaining = 999;
        if (st.phase === 'KICKOFF' || st.phase === 'OVERTIME') {
          st.phase = 'PLAYING';
          st.phaseTimer = 0;
        }
      } else if (mode === 'finish') {
        st.timeRemaining = 0;
        st.phase = 'FINISHED';
        st.winner =
          st.score.blue > st.score.red
            ? 'blue'
            : st.score.red > st.score.blue
            ? 'red'
            : 'draw';
        st.events.push({ type: 'whistle' });
      }
      syncHudFromState(st);
    },
    [syncHudFromState]
  );

  const handleDevBringBallToMe = useCallback(() => {
    const st = gameStateRef.current;
    if (st.mode === 'online') {
      if (!isSpectatorRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'dev_command',
            devToken: devTokenRef.current,
            command: 'bring_ball',
          })
        );
      }
      return;
    }
    const targetId = st.controlMap?.['blue-1'] ?? 'blue-1';
    const target = st.players.find((p) => p.id === targetId) ?? st.players[0];
    if (!target) return;
    target.pickupLockout = 0;
    target.stealImmunity = 0.5;
    st.ball.possessorId = target.id;
    st.ball.lastTouchTeam = target.team;
    st.ball.vx = 0;
    st.ball.vy = 0;
    st.ball.x = target.x + Math.cos(target.facingAngle) * 34;
    st.ball.y = target.y + Math.sin(target.facingAngle) * 34;
    syncHudFromState(st);
  }, [syncHudFromState]);

  const handleDevSetExp = useCallback(
    (nextExp: number) => {
      const clamped = Math.max(0, Math.floor(nextExp || 0));
      const rankId = getRankInfo(clamped).tier.id;
      const saved = persistProfile(
        (prev) => ({
          ...prev,
          exp: clamped,
          rankId,
        }),
        true
      );
      syncProfileToServerIfOpen(saved);
    },
    [persistProfile, syncProfileToServerIfOpen]
  );

  const handleDevSelectRank = useCallback(
    (rankId: RankId) => {
      const tier = RANK_TIERS.find((r) => r.id === rankId) ?? RANK_TIERS[0];
      const saved = persistProfile(
        (prev) => ({
          ...prev,
          exp: tier.minExp,
          rankId: tier.id,
        }),
        true
      );
      syncProfileToServerIfOpen(saved);
    },
    [persistProfile, syncProfileToServerIfOpen]
  );

  const handleDevAddCoins = useCallback(
    (delta: number) => {
      persistProfile(
        (prev) => ({
          ...prev,
          coins: Math.max(0, prev.coins + Math.floor(delta)),
        }),
        true
      );
    },
    [persistProfile]
  );

  const handleDevUnlockAllContent = useCallback(() => {
    const saved = persistProfile(
      (prev) => ({
        ...prev,
        unlockedCosmetics: sanitizeUnlockedCosmetics(ALL_COSMETIC_IDS),
        unlockedSkills: sanitizeUnlockedSkills(ALL_SKILL_IDS),
        unlockedAnimations: sanitizeUnlockedAnimations(ALL_ANIMATION_IDS),
      }),
      true
    );
    syncProfileToServerIfOpen(saved);
  }, [persistProfile, syncProfileToServerIfOpen]);

  const handleBuyAnimation = useCallback(
    (animId: string) => {
      const item = ANIMATION_CATALOG.find((a) => a.id === animId);
      if (!item) return;
      const status: { outcome: 'bought' | 'insufficient' | 'noop' } = { outcome: 'noop' };
      const saved = persistProfile((prev) => {
        if (prev.unlockedAnimations.includes(animId)) return prev;
        if (prev.coins < item.price) {
          status.outcome = 'insufficient';
          return prev;
        }
        status.outcome = 'bought';
        const unlockedAnimations = sanitizeUnlockedAnimations([
          ...prev.unlockedAnimations,
          animId,
        ]);
        const nextCfg: AnimationConfig = { ...prev.animationConfig };
        if (item.kind === 'goal') {
          nextCfg.goalAnimation = item.value as AnimationConfig['goalAnimation'];
        } else if (item.kind === 'trail') {
          nextCfg.trailAnimation = item.value as AnimationConfig['trailAnimation'];
        }
        return {
          ...prev,
          coins: prev.coins - item.price,
          unlockedAnimations,
          animationConfig: sanitizeAnimationConfig(nextCfg, unlockedAnimations),
        };
      }, true);
      if (status.outcome === 'bought') soundFX.playPurchase();
      else if (status.outcome === 'insufficient') soundFX.playError();
      syncProfileToServerIfOpen(saved);
    },
    [persistProfile, syncProfileToServerIfOpen]
  );

  const handleChangeAnimationConfig = useCallback(
    (next: AnimationConfig) => {
      const prevCfg = saveProfileRef.current.animationConfig;
      const itemChanged =
        prevCfg.goalAnimation !== next.goalAnimation ||
        prevCfg.trailAnimation !== next.trailAnimation;
      const saved = persistProfile(
        (prev) => ({
          ...prev,
          animationConfig: sanitizeAnimationConfig(next, prev.unlockedAnimations),
        }),
        true
      );
      if (itemChanged) {
        soundFX.playEquip();
      }
      syncProfileToServerIfOpen(saved);
    },
    [persistProfile, syncProfileToServerIfOpen]
  );

  const handleChangeMenuConfig = useCallback(
    (next: MenuConfig) => {
      persistProfile(
        (prev) => ({
          ...prev,
          menuConfig: sanitizeMenuConfig(next),
        }),
        true
      );
    },
    [persistProfile]
  );

  const handleBuyCosmetic = useCallback(
    (itemId: string) => {
      const item = CHARACTER_COSMETICS.find((c) => c.id === itemId);
      if (!item) return;
      const status: { outcome: 'bought' | 'insufficient' | 'noop' } = { outcome: 'noop' };
      const saved = persistProfile((prev) => {
        if (prev.unlockedCosmetics.includes(itemId)) return prev;
        if (prev.coins < item.price) {
          status.outcome = 'insufficient';
          return prev;
        }
        status.outcome = 'bought';
        const unlockedCosmetics = sanitizeUnlockedCosmetics([
          ...prev.unlockedCosmetics,
          itemId,
        ]);
        const nextCfg = { ...prev.characterConfig };
        if (item.category === 'hair') nextCfg.hairStyle = item.value as CharacterConfig['hairStyle'];
        else if (item.category === 'color') nextCfg.hairColor = item.value;
        else if (item.category === 'pattern')
          nextCfg.jerseyPattern = item.value as CharacterConfig['jerseyPattern'];
        else if (item.category === 'aura')
          nextCfg.auraTrail = item.value as CharacterConfig['auraTrail'];
        else if (item.category === 'cleat') nextCfg.cleatColor = item.value;
        return {
          ...prev,
          coins: prev.coins - item.price,
          unlockedCosmetics,
          characterConfig: sanitizeCharacterConfig(nextCfg, unlockedCosmetics),
        };
      }, true);
      if (status.outcome === 'bought') soundFX.playPurchase();
      else if (status.outcome === 'insufficient') soundFX.playError();
      syncProfileToServerIfOpen(saved);
    },
    [persistProfile, syncProfileToServerIfOpen]
  );

  const handleChangeCharacterConfig = useCallback(
    (next: CharacterConfig) => {
      const saved = persistProfile(
        (prev) => ({
          ...prev,
          characterConfig: sanitizeCharacterConfig(next, prev.unlockedCosmetics),
        }),
        true
      );
      soundFX.playEquip();
      syncProfileToServerIfOpen(saved);
    },
    [persistProfile, syncProfileToServerIfOpen]
  );

  const handleOpenLootbox = useCallback(
    (tierId: LootboxTierId) => {
      const box = LOOTBOX_TIERS.find((b) => b.id === tierId);
      if (!box) return;
      if (saveProfileRef.current.coins < box.price) {
        soundFX.playError();
        return;
      }
      const outcome = rollSkillLootbox(tierId, saveProfileRef.current.unlockedSkills);
      setLastLootboxOutcome(outcome);
      soundFX.playLootbox();
      const saved = persistProfile((prev) => {
        if (prev.coins < box.price) return prev;
        const unlockedSkills = sanitizeUnlockedSkills([
          ...prev.unlockedSkills,
          outcome.skill.id,
        ]);
        const autoEquipped =
          prev.equippedSkills.length < 2 && !prev.equippedSkills.includes(outcome.skill.id)
            ? sanitizeEquippedSkills(
                [...prev.equippedSkills, outcome.skill.id],
                unlockedSkills
              )
            : prev.equippedSkills;
        return {
          ...prev,
          coins: prev.coins - box.price + outcome.refundCoins,
          unlockedSkills,
          equippedSkills: autoEquipped,
        };
      }, true);
      syncProfileToServerIfOpen(saved);
    },
    [persistProfile, syncProfileToServerIfOpen]
  );

  const handleEquipSkill = useCallback(
    (skillId: SkillId, slotIdx: 0 | 1) => {
      const saved = persistProfile((prev) => {
        if (!prev.unlockedSkills.includes(skillId)) return prev;
        const slots: Array<SkillId | undefined> = [
          prev.equippedSkills[0],
          prev.equippedSkills[1],
        ];
        const otherIdx: 0 | 1 = slotIdx === 0 ? 1 : 0;
        if (slots[otherIdx] === skillId) {
          slots[otherIdx] = slots[slotIdx];
        }
        slots[slotIdx] = skillId;
        const nextList = sanitizeEquippedSkills(
          slots.filter((s): s is SkillId => Boolean(s)),
          prev.unlockedSkills
        );
        return { ...prev, equippedSkills: nextList };
      }, true);
      soundFX.playEquip();
      syncProfileToServerIfOpen(saved);
    },
    [persistProfile, syncProfileToServerIfOpen]
  );

  const handleUnequipSkillSlot = useCallback(
    (slotIdx: 0 | 1) => {
      const saved = persistProfile((prev) => {
        const nextList = prev.equippedSkills.filter((_, idx) => idx !== slotIdx);
        return {
          ...prev,
          equippedSkills: sanitizeEquippedSkills(nextList, prev.unlockedSkills),
        };
      }, true);
      soundFX.playEquip();
      syncProfileToServerIfOpen(saved);
    },
    [persistProfile, syncProfileToServerIfOpen]
  );

  const handleBuyTurf = useCallback(
    (turfId: PitchTurfId) => {
      const turf = getTurfById(turfId);
      const status: { outcome: 'bought' | 'equipped' | 'insufficient' } = {
        outcome: 'insufficient',
      };
      persistProfile((prev) => {
        if (prev.unlockedTurfs.includes(turfId)) {
          status.outcome = 'equipped';
          return { ...prev, selectedTurf: turfId };
        }
        if (prev.coins < turf.price) {
          status.outcome = 'insufficient';
          return prev;
        }
        status.outcome = 'bought';
        return {
          ...prev,
          coins: prev.coins - turf.price,
          unlockedTurfs: sanitizeUnlockedTurfs([...prev.unlockedTurfs, turfId]),
          selectedTurf: turfId,
        };
      }, true);
      if (status.outcome === 'bought') soundFX.playPurchase();
      else if (status.outcome === 'equipped') soundFX.playEquip();
      else soundFX.playError();
    },
    [persistProfile]
  );

  const handleSelectTurf = useCallback(
    (turfId: PitchTurfId) => {
      persistProfile((prev) => {
        if (!prev.unlockedTurfs.includes(turfId)) return prev;
        return { ...prev, selectedTurf: turfId };
      }, true);
      soundFX.playEquip();
    },
    [persistProfile]
  );

  const handleChangeHudConfig = useCallback(
    (next: HudConfig) => {
      const clean = sanitizeHudConfig(next);
      persistProfile((prev) => ({ ...prev, hudConfig: clean }), false);
    },
    [persistProfile]
  );

  const handleCloseHudCustomizer = useCallback(() => {
    setCustomizerModalOpen(false);
    persistProfile(
      (prev) => ({ ...prev, hudConfig: sanitizeHudConfig(prev.hudConfig) }),
      true
    );
  }, [persistProfile]);

  const saveModalElement = (
    <SaveRankModal
      open={saveModalOpen}
      onClose={() => setSaveModalOpen(false)}
      t={t}
      lang={language}
      profile={saveProfile}
      seasonInfo={seasonInfo}
      onChangeName={handleUpdateDisplayName}
      onSaveNow={handleManualSaveNow}
      onLoadSave={handleManualLoadSave}
      onResetSave={handleResetSave}
      user={firebaseUser}
      cloudBusy={cloudBusy}
      onSignInGoogle={handleSignInGoogle}
      onSignInEmail={handleSignInEmail}
      onCreateEmailAccount={handleCreateEmailAccount}
      onPasswordReset={handlePasswordReset}
      onSignOutGoogle={handleSignOutGoogle}
      onSyncCloud={handleSyncCloudNow}
      leaderboard={leaderboard}
      leaderboardLoading={leaderboardLoading}
      onRefreshLeaderboard={refreshLeaderboard}
      feedbackMsg={saveFeedback}
    />
  );

  const unifiedShopElement = (
    <UnifiedShopModal
      open={unifiedShop.open}
      initialTab={unifiedShop.tab}
      onClose={() => setUnifiedShop((prev) => ({ ...prev, open: false }))}
      t={t}
      lang={language}
      coins={saveProfile.coins}
      unlockedSkills={saveProfile.unlockedSkills}
      equippedSkills={saveProfile.equippedSkills}
      lastOutcome={lastLootboxOutcome}
      onOpenLootbox={handleOpenLootbox}
      onEquipSkill={handleEquipSkill}
      onUnequipSlot={handleUnequipSkillSlot}
      onClearOutcome={() => setLastLootboxOutcome(null)}
      unlockedCosmetics={saveProfile.unlockedCosmetics}
      characterConfig={saveProfile.characterConfig}
      onBuyCosmetic={handleBuyCosmetic}
      onChangeCharacterConfig={handleChangeCharacterConfig}
      unlockedTurfs={saveProfile.unlockedTurfs}
      selectedTurf={saveProfile.selectedTurf}
      onBuyTurf={handleBuyTurf}
      onSelectTurf={handleSelectTurf}
      unlockedAnimations={saveProfile.unlockedAnimations}
      animationConfig={saveProfile.animationConfig}
      onBuyAnimation={handleBuyAnimation}
      onChangeAnimationConfig={handleChangeAnimationConfig}
    />
  );

  const menuControlsElement = (
    <MenuControlsModal
      open={menuControlsOpen}
      onClose={() => setMenuControlsOpen(false)}
      t={t}
      lang={language}
      muted={muted}
      menuConfig={saveProfile.menuConfig}
      animationConfig={saveProfile.animationConfig}
      hasReplays={savedReplays.length > 0}
      onChangeMenuConfig={handleChangeMenuConfig}
      onChangeAnimationConfig={handleChangeAnimationConfig}
      onSelectLanguage={handleSelectLanguage}
      onToggleMute={toggleMute}
      onOpenShopTab={(tab) => openShopTab(tab)}
      onOpenHudCustomizer={() => setCustomizerModalOpen(true)}
      onOpenSaveModal={() => setSaveModalOpen(true)}
      onOpenReplays={() => {
        setLastMatchReplay(savedReplays[0] ?? null);
        setReplayModalOpen(true);
      }}
    />
  );

  const matchSkillPickerElement = (
    <MatchSkillSelectModal
      open={matchSkillPicker.open}
      mode={matchSkillPicker.mode}
      p1Name={
        matchSkillPicker.mode === '2p'
          ? localBlueName.trim() || t.localP1Placeholder
          : matchSkillPicker.mode === 'online'
          ? playerName.trim() || saveProfile.displayName || 'Jogador'
          : t.youTag.replace(/[()]/g, '')
      }
      p2Name={localRedName.trim() || t.localP2Placeholder}
      initialP1Skills={
        matchSkillPicker.mode === 'online' ? saveProfile.equippedSkills : p1MatchSkills
      }
      initialP2Skills={p2MatchSkills}
      unlockedSkills={
        matchSkillPicker.mode === 'online' ? saveProfile.unlockedSkills : undefined
      }
      t={t}
      onOpenLootboxes={() => openShopTab('skills')}
      onCancel={() =>
        setMatchSkillPicker((prev) => ({
          ...prev,
          open: false,
        }))
      }
      onConfirm={(chosenP1, chosenP2) => {
        const { mode, purpose } = matchSkillPicker;
        setMatchSkillPicker((prev) => ({
          ...prev,
          open: false,
        }));
        if (purpose === 'local-start' && mode !== 'online') {
          requestLandscapeMode();
          startLocalMatch(mode, chosenP1, chosenP2);
        } else {
          const sanitized = sanitizeEquippedSkills(chosenP1, saveProfileRef.current.unlockedSkills);
          const updated = persistProfile(
            (prev) => ({
              ...prev,
              equippedSkills: sanitized,
            }),
            false
          );
          syncProfileToServerIfOpen(updated);
          if (purpose === 'online-quick') {
            sendLobbyMsg(
              {
                type: 'quick_match',
                teamSize,
                isRanked: isRankedQueue,
              },
              sanitized
            );
          }
        }
      }}
    />
  );

  const customizerModalElement = (
    <HudCustomizerModal
      open={customizerModalOpen}
      onClose={handleCloseHudCustomizer}
      t={t}
      config={saveProfile.hudConfig}
      onChange={handleChangeHudConfig}
    />
  );

  const devModalElement = (
    <DevModeModal
      open={devModalOpen}
      unlocked={devUnlocked}
      onUnlock={async (password) => {
        const response = await fetch('/api/dev-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const result = (await response.json()) as { ok?: boolean; token?: string; error?: string };
        if (!response.ok || !result.ok || !result.token) {
          throw new Error(result.error || 'Falha ao validar senha.');
        }
        devTokenRef.current = result.token;
        setDevUnlocked(true);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'dev_auth', token: result.token }));
        }
        return true;
      }}
      hacks={devHacks}
      onChangeHacks={(next) => {
        setDevHacks(next);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'dev_set_hacks',
              devToken: devTokenRef.current,
              hacks: next,
            })
          );
        }
      }}
      isPlaying={screen === 'PLAYING'}
      isSpectator={isSpectator}
      gameMode={gameStateRef.current.mode}
      currentScore={{ blue: hud.blueScore, red: hud.redScore }}
      currentTimeRemaining={hud.timeRemaining}
      onAddGoal={handleDevAddGoal}
      onResetScore={handleDevResetScore}
      onAdjustTime={handleDevAdjustTime}
      onBringBallToMe={handleDevBringBallToMe}
      currentExp={saveProfile.exp}
      onSetExp={handleDevSetExp}
      onSelectRank={handleDevSelectRank}
      currentCoins={saveProfile.coins}
      onAddCoins={handleDevAddCoins}
      onUnlockAllContent={handleDevUnlockAllContent}
    />
  );

  const canvasLabelsShared = {
    goalTitle: t.canvasGoalTitle,
    prepareTitle: t.canvasPrepareTitle,
    prepareSub: t.canvasPrepareSub,
    overtimeTitle: t.canvasOvertimeTitle,
    overtimeSub: t.canvasOvertimeSub,
    pausedClock: t.canvasPausedClock,
    scoredFor: t.canvasScoredFor,
    ownGoalScoredFor: t.canvasOwnGoalScoredFor,
    blueTeam: t.blueTeam,
    redTeam: t.redTeam,
  };

  const replayModalElement = (
    <ReplayModal
      open={replayModalOpen}
      onClose={() => setReplayModalOpen(false)}
      t={t}
      initialReplay={lastMatchReplay}
      savedReplays={savedReplays}
      onDeleteReplay={handleDeleteSavedReplay}
      turfId={saveProfile.selectedTurf}
      canvasLabels={canvasLabelsShared}
    />
  );

  // Menu keyboard shortcuts (1-4 modes, Enter start, L shop, C controls, M mute)
  const menuNavRef = useRef({
    handleMainStart,
    toggleMute,
    openShopTab,
  });
  menuNavRef.current = {
    handleMainStart,
    toggleMute,
    openShopTab,
  };

  useEffect(() => {
    if (screen !== 'MENU') return;
    const onMenuKey = (e: KeyboardEvent) => {
      if (!saveProfile.menuConfig.menuKeyboardNav) return;
      if (anyModalOpen) return;
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT')
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === '1') {
        setSelectedMode('1p');
      } else if (e.key === '2') {
        setSelectedMode('2p');
      } else if (e.key === '3') {
        setSelectedMode('training');
      } else if (e.key === '4') {
        setSelectedMode('online');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        menuNavRef.current.handleMainStart();
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        menuNavRef.current.openShopTab('skills');
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        setMenuControlsOpen(true);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        menuNavRef.current.toggleMute();
      }
    };
    window.addEventListener('keydown', onMenuKey);
    return () => window.removeEventListener('keydown', onMenuKey);
  }, [screen, anyModalOpen, saveProfile.menuConfig.menuKeyboardNav]);

  // ---------------- RENDER: MENU INICIAL ----------------
  if (screen === 'MENU') {
    const equippedSkillObjs = saveProfile.equippedSkills
      .map((sid) => getSkillById(sid))
      .filter((s): s is NonNullable<typeof s> => Boolean(s));
    const isCompactMenu = saveProfile.menuConfig.menuLayout === 'compact';
    const isMinimalBackdrop = saveProfile.menuConfig.menuBackdropMode === 'minimal';
    const menuAnimEnabled = saveProfile.menuConfig.menuAnimations;

    return (
      <div
        className={`relative min-h-dvh w-full bg-[#0B1215] text-slate-50 flex flex-col justify-between overflow-x-hidden ${
          menuAnimEnabled ? '' : 'menu-anim-off'
        }`}
      >
        {saveModalElement}
        {unifiedShopElement}
        {menuControlsElement}
        {matchSkillPickerElement}
        {customizerModalElement}
        {devModalElement}
        {replayModalElement}

        {/* Atmospheric stadium backdrop + GPU-light live floodlights & sparks */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {isMinimalBackdrop || imgFailed ? (
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(20,83,45,0.42),_#0B1215_70%)]" />
          ) : (
            <img
              src={stadiumBackdrop}
              alt="Estádio iluminado à noite"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover opacity-30 scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1215]/75 via-[#0B1215]/60 to-[#0B1215]" />
          <MenuAnimatedBackdrop
            enabled={menuAnimEnabled}
            minimal={isMinimalBackdrop}
            trailAnimation={saveProfile.animationConfig.trailAnimation}
            goalAnimation={saveProfile.animationConfig.goalAnimation}
          />
        </div>

        {/* Compact Top Navigation (higher z-30 than main so dropdowns/modals inside header never go under Play menu) */}
        <header className="relative z-30 max-w-6xl w-full mx-auto px-3 sm:px-6 py-2 sm:py-3 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 animate-menu-header">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
            <span className="font-display text-lg sm:text-2xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0">
              {t.appName}
            </span>
            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              className={`px-2 py-1 rounded-lg border text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${myRankInfo.tier.bgClass} ${myRankInfo.tier.borderClass} ${myRankInfo.tier.textClass}`}
            >
              <span>{myRankInfo.tier.icon}</span>
              <span>{myRankLabel}</span>
              <span className="hidden sm:inline font-mono-num text-[11px] opacity-85">
                ({saveProfile.exp} EXP)
              </span>
            </button>
            <button
              type="button"
              onClick={() => openShopTab('turfs')}
              title={t.shopTitle}
              className="px-2 py-1 rounded-lg border border-amber-400/40 bg-amber-500/15 hover:bg-amber-500/25 text-[11px] sm:text-xs font-bold text-amber-200 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-mono-num">{saveProfile.coins}</span>
            </button>
            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              title={`${formatT(t.seasonLabel, { num: seasonInfo.seasonNumber })} — ${t.seasonResetTimerLabel}`}
              className="px-2 py-1 rounded-lg border border-orange-400/35 bg-orange-500/12 hover:bg-orange-500/22 text-[11px] font-bold text-orange-200 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Timer className="w-3.5 h-3.5 text-orange-300 shrink-0" />
              <span className="hidden md:inline">
                {formatT(t.seasonLabel, { num: seasonInfo.seasonNumber })} ·
              </span>
              <span className="font-mono-num">{formatSeasonCountdown(seasonInfo)}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => openShopTab('skills')}
              title={t.unifiedShopTitle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500/25 via-indigo-500/20 to-amber-500/20 hover:from-rose-500/35 hover:to-amber-500/30 border border-rose-400/45 text-[11px] sm:text-xs font-extrabold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.unifiedShopBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuControlsOpen(true)}
              title={t.menuControlsTitle}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 text-[11px] sm:text-xs font-bold text-indigo-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.menuControlsBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setCustomizerModalOpen(true)}
              title={t.customizeButtonsBtn}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-[11px] sm:text-xs font-bold text-sky-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.customizeButtonsBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              title={t.saveAndRankBtn}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-[11px] sm:text-xs font-bold text-emerald-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.saveAndRankBtn}</span>
            </button>

            <button
              type="button"
              onClick={cycleLanguage}
              title={currentLangObj.label}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#111C21] border border-white/15 hover:bg-white/10 text-[11px] font-bold text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentLangObj.shortLabel}</span>
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? t.soundOn : t.soundOff}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <PWAInstallButton />

            {isDevUser && (
              <button
                type="button"
                onClick={() => setDevModalOpen(true)}
                title="Dev Mode"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-[11px] sm:text-xs font-extrabold text-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.devModeBtn}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              title={saveProfile.displayName || playerName || 'Jogador'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#111C21]/90 hover:bg-white/10 border border-white/15 text-[11px] sm:text-xs font-bold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="max-w-[110px] truncate">
                {saveProfile.displayName || playerName || 'Jogador'}
              </span>
            </button>
          </div>
          <OfflineIndicator />
        </header>

        {/* Main Content: Play Card ALWAYS above the fold without scrolling on mobile & desktop */}
        <main
          className={`relative z-10 max-w-6xl w-full mx-auto px-3 sm:px-6 flex-1 flex flex-col justify-center ${
            isCompactMenu ? 'py-1.5 sm:py-3' : 'py-2.5 sm:py-5'
          }`}
        >
          {seasonResetBanner !== null && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-400/45 text-xs font-bold text-amber-100 flex items-center justify-between gap-3 animate-modal-enter">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{formatT(t.seasonResetNotice, { num: seasonResetBanner })}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  clearOfflineSeasonResetSeason();
                  setSeasonResetBanner(null);
                }}
                aria-label={t.close}
                className="p-1 rounded-lg hover:bg-white/10 text-amber-200 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div
            className={`w-full grid grid-cols-1 lg:grid-cols-12 items-start lg:items-center ${
              isCompactMenu ? 'gap-3 lg:gap-5' : 'gap-4 lg:gap-7'
            }`}
          >
            {/* Mode Setup Card FIRST on small screens so Play CTA never requires scrolling */}
            <div className="order-1 lg:order-2 lg:col-span-7 animate-menu-enter menu-stagger-1">
              <div className="bg-[#111C21]/92 border border-white/12 rounded-2xl p-3.5 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] space-y-3 sm:space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-lg sm:text-2xl font-bold text-white leading-tight">
                      {t.chooseModeTitle}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-slate-400">
                      {t.chooseModeSubtitle}
                    </p>
                  </div>
                  <span className="hidden sm:inline-block text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-400/25 px-2.5 py-1 rounded-lg">
                    {t.headerDuration}
                  </span>
                </div>

                {/* 4 Mode Options (4 columns on sm+/landscape so vertical height stays compact) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('1p')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedMode === '1p'
                        ? 'bg-emerald-500/15 border-emerald-400 text-white'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-400 mb-1" />
                    <div className="font-semibold text-xs sm:text-sm leading-tight">
                      {t.mode1pTitle}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {t.mode1pDesc}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('2p')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedMode === '2p'
                        ? 'bg-blue-500/15 border-blue-400 text-white'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <Users className="w-4 h-4 text-blue-400 mb-1" />
                    <div className="font-semibold text-xs sm:text-sm leading-tight">
                      {t.mode2pTitle}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {t.mode2pDesc}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('training')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedMode === 'training'
                        ? 'bg-teal-500/15 border-teal-400 text-white'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <Dumbbell className="w-4 h-4 text-teal-400 mb-1" />
                    <div className="font-semibold text-xs sm:text-sm leading-tight">
                      {t.modeTrainingTitle}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {t.modeTrainingDesc}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('online')}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedMode === 'online'
                        ? 'bg-amber-500/15 border-amber-400 text-white'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-amber-400 mb-1" />
                    <div className="font-semibold text-xs sm:text-sm leading-tight">
                      {t.modeOnlineTitle}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {t.modeOnlineDesc}
                    </div>
                  </button>
                </div>

                {/* Format & Local Names */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-white/10">
                  <span className="text-xs font-medium text-slate-300">{t.teamFormat}</span>
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0B1215] rounded-lg border border-white/10">
                    {(
                      [
                        { id: 1, label: '1v1' },
                        { id: 2, label: '2v2' },
                        { id: 4, label: '4v4' },
                        { id: 8, label: '8v8' },
                        { id: 16, label: '16v16' },
                      ] as const
                    ).map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setTeamSize(fmt.id)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                          teamSize === fmt.id
                            ? 'bg-slate-200 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedMode === '2p' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="local-p1-name"
                        className="block text-[11px] font-semibold text-blue-300 mb-0.5"
                      >
                        {t.localP1Label}
                      </label>
                      <input
                        id="local-p1-name"
                        type="text"
                        maxLength={16}
                        value={localBlueName}
                        onChange={(e) => setLocalBlueName(e.target.value)}
                        placeholder={t.localP1Placeholder}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B1215] border border-blue-500/40 text-xs text-white focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="local-p2-name"
                        className="block text-[11px] font-semibold text-red-300 mb-0.5"
                      >
                        {t.localP2Label}
                      </label>
                      <input
                        id="local-p2-name"
                        type="text"
                        maxLength={16}
                        value={localRedName}
                        onChange={(e) => setLocalRedName(e.target.value)}
                        placeholder={t.localP2Placeholder}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#0B1215] border border-red-500/40 text-xs text-white focus:outline-none focus:border-red-400"
                      />
                    </div>
                  </div>
                )}

                {/* Primary CTA — Immediately visible on every screen size */}
                <button
                  type="button"
                  onClick={handleMainStart}
                  className="animate-cta-sheen w-full py-3 sm:py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors shadow-[0_8px_24px_rgba(16,185,129,0.35)] cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>
                    {selectedMode === 'online'
                      ? t.openOnlineLobby
                      : selectedMode === 'training'
                      ? t.startTraining
                      : t.startMatch}
                  </span>
                </button>
                {isMobileDevice && isPortrait && (
                  <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-400/35 text-amber-200 text-[11px] font-semibold flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-300 shrink-0 animate-phone-rotate" />
                    <span>{t.landscapeHintBanner}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hero, Live Showcase, Loadout Quick Strip & Rules Column */}
            <div
              className={`order-2 lg:order-1 lg:col-span-5 animate-menu-enter menu-stagger-2 ${
                isCompactMenu ? 'space-y-2 sm:space-y-2.5' : 'space-y-2.5 sm:space-y-4'
              }`}
            >
              <div className="space-y-1.5 sm:space-y-2">
                {!isCompactMenu && (
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400 animate-hero-glow">
                    {t.heroEyebrow}
                  </p>
                )}
                <h1
                  className={`font-display font-extrabold tracking-tight text-white leading-[0.98] text-balance ${
                    isCompactMenu ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-5xl'
                  }`}
                >
                  {t.heroTitle}
                </h1>
                {!isCompactMenu && (
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    {t.heroSubtitle}
                  </p>
                )}
              </div>

              <MenuPlayerShowcase
                characterConfig={saveProfile.characterConfig}
                turfId={saveProfile.selectedTurf}
                trailAnimation={saveProfile.animationConfig.trailAnimation}
                goalAnimation={saveProfile.animationConfig.goalAnimation}
                enabled={menuAnimEnabled}
                onOpenShop={() => openShopTab('animations')}
                tapHintLabel={t.tabAnimations}
              />

              {/* Active Equipped Skills, Character, Turf & Animations Quick Strip */}
              <div className="p-3 rounded-xl bg-[#111C21]/90 border border-white/10 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openShopTab('character')}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/35 text-xs font-bold text-indigo-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>#{saveProfile.characterConfig.jerseyNumber}</span>
                    </button>
                    {equippedSkillObjs.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => openShopTab('skills')}
                        className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/35 text-xs text-rose-300 hover:text-rose-200 font-semibold cursor-pointer whitespace-nowrap"
                      >
                        + {t.skillsBtn}
                      </button>
                    ) : (
                      equippedSkillObjs.map((sk, idx) => (
                        <button
                          key={sk.id}
                          type="button"
                          onClick={() => openShopTab('skills')}
                          className="px-2 py-1 rounded-lg bg-[#0B1215] border border-white/15 hover:border-rose-400/50 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <span className="text-[10px] font-mono-num text-rose-300">
                            {idx === 0 ? 'Z' : 'X'}
                          </span>
                          <span>{sk.icon}</span>
                          <span className="truncate max-w-[90px]">{sk.name}</span>
                        </button>
                      ))
                    )}
                    <button
                      type="button"
                      onClick={() => openShopTab('animations')}
                      className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/35 text-[11px] font-bold text-amber-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Film className="w-3 h-3" />
                      <span>{t.tabAnimations}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openShopTab('turfs')}
                      className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-[11px] font-bold text-emerald-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Palette className="w-3 h-3" />
                      <span>{t.tabTurfs}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {savedReplays.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setLastMatchReplay(savedReplays[0] ?? null);
                          setReplayModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/35 text-[11px] font-bold text-emerald-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Film className="w-3 h-3" />
                        <span>
                          {t.replaysBtn} ({savedReplays.length})
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openShopTab('skills')}
                      className="text-[11px] font-bold text-rose-300 hover:text-rose-200 cursor-pointer whitespace-nowrap"
                    >
                      {saveProfile.unlockedSkills.length}/20 {t.skillsBtn} →
                    </button>
                  </div>
                </div>
              </div>

              {saveProfile.menuConfig.showMenuRules && (
                <div className="hidden sm:grid pt-2 border-t border-white/10 grid-cols-2 gap-3 text-xs text-slate-300">
                  <div>
                    <p className="font-semibold text-white">{t.rule1Title}</p>
                    <p className="text-slate-400 mt-0.5">{t.rule1Desc}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t.rule2Title}</p>
                    <p className="text-slate-400 mt-0.5">{t.rule2Desc}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Compact Footer */}
        <footer className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-6 py-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>{t.footerControls1p}</span>
          <span>{t.footerControls2p}</span>
        </footer>
      </div>
    );
  }

  // ---------------- RENDER: ONLINE LOBBY ----------------
  if (screen === 'ONLINE_LOBBY') {
    const lobbyAnimEnabled = saveProfile.menuConfig.menuAnimations;
    return (
      <div
        className={`relative min-h-dvh w-full bg-[#0B1215] text-slate-50 flex flex-col overflow-x-hidden ${
          lobbyAnimEnabled ? '' : 'menu-anim-off'
        }`}
      >
        {saveModalElement}
        {unifiedShopElement}
        {menuControlsElement}
        {matchSkillPickerElement}
        {customizerModalElement}
        {devModalElement}
        <MenuAnimatedBackdrop
          enabled={lobbyAnimEnabled}
          minimal={saveProfile.menuConfig.menuBackdropMode === 'minimal'}
          trailAnimation={saveProfile.animationConfig.trailAnimation}
          goalAnimation={saveProfile.animationConfig.goalAnimation}
        />
        <header className="relative z-20 max-w-4xl w-full mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 animate-menu-header">
          <button
            type="button"
            onClick={handleExitToMenu}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToMenu}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openShopTab('skills')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-rose-500/25 to-amber-500/20 hover:from-rose-500/35 hover:to-amber-500/30 border border-rose-400/45 text-xs font-extrabold text-white cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span>{t.unifiedShopBtn}</span>
            </button>

            <button
              type="button"
              onClick={() => setMenuControlsOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 text-xs font-bold text-indigo-200 cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.menuControlsBtn}</span>
            </button>

            <button
              type="button"
              onClick={cycleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#111C21] border border-white/15 text-xs font-bold text-white cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentLangObj.shortLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => openShopTab('turfs')}
              className="px-2.5 py-1 rounded-lg border border-amber-400/40 bg-amber-500/15 hover:bg-amber-500/25 text-xs font-bold text-amber-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-mono-num">{saveProfile.coins}</span>
            </button>

            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${myRankInfo.tier.bgClass} ${myRankInfo.tier.borderClass} ${myRankInfo.tier.textClass}`}
            >
              <span>{myRankInfo.tier.icon}</span>
              <span>{myRankLabel}</span>
            </button>

            <button
              type="button"
              onClick={() => setSaveModalOpen(true)}
              title={`${formatT(t.seasonLabel, { num: seasonInfo.seasonNumber })} — ${t.seasonResetTimerLabel}`}
              className="px-2.5 py-1 rounded-lg border border-orange-400/35 bg-orange-500/12 hover:bg-orange-500/22 text-[11px] font-bold text-orange-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Timer className="w-3.5 h-3.5 text-orange-300 shrink-0" />
              <span className="hidden sm:inline">
                {formatT(t.seasonLabel, { num: seasonInfo.seasonNumber })} ·
              </span>
              <span className="font-mono-num">{formatSeasonCountdown(seasonInfo)}</span>
            </button>

            {isDevUser && (
              <button
                type="button"
                onClick={() => setDevModalOpen(true)}
                title="Dev Mode"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-xs font-extrabold text-amber-200 cursor-pointer whitespace-nowrap"
              >
                <Code2 className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.devModeBtn}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-xs font-medium">
              {wsConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300 hidden sm:inline">
                    {t.serverConnected}
                  </span>
                  {pingMs !== null && (
                    <span
                      className={`font-mono-num text-[11px] font-bold px-1.5 py-0.5 rounded bg-black/40 border ${
                        pingMs <= 65
                          ? 'text-emerald-300 border-emerald-400/35'
                          : pingMs <= 130
                          ? 'text-amber-300 border-amber-400/35'
                          : 'text-rose-300 border-rose-400/35'
                      }`}
                    >
                      {t.pingLabel}: {pingMs}ms
                    </span>
                  )}
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 hidden sm:inline">{t.connecting}</span>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 flex flex-col justify-center animate-menu-enter menu-stagger-1">
          <div className="bg-[#111C21]/95 border border-white/12 rounded-2xl p-4 sm:p-7 space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                  {t.onlineTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {formatT(t.onlineSubtitle, { size: teamSize })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#0B1215] rounded-lg border border-white/10">
                {(
                  [
                    { id: 1, label: '1 vs 1' },
                    { id: 2, label: '2 vs 2' },
                    { id: 4, label: '4 vs 4' },
                    { id: 8, label: '8 vs 8' },
                    { id: 16, label: '16 vs 16' },
                  ] as const
                ).map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    disabled={Boolean(lobby)}
                    onClick={() => setTeamSize(fmt.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer disabled:opacity-50 ${
                      teamSize === fmt.id
                        ? 'bg-slate-200 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {seasonResetBanner !== null && (
              <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/45 text-xs font-bold text-amber-100 flex items-center justify-between gap-3 animate-modal-enter">
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{formatT(t.seasonResetNotice, { num: seasonResetBanner })}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearOfflineSeasonResetSeason();
                    setSeasonResetBanner(null);
                  }}
                  aria-label={t.close}
                  className="p-1 rounded-lg hover:bg-white/10 text-amber-200 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {onlineError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/35 text-sm text-red-200">
                {onlineError}
              </div>
            )}

            {isMobileDevice && isPortrait && (
              <div className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-400/35 text-amber-200 text-xs font-semibold flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-amber-300 shrink-0 animate-phone-rotate" />
                <span>{t.landscapeHintBanner}</span>
              </div>
            )}

            {!lobby ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <label
                      htmlFor="player-name"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      {t.yourFieldName}
                    </label>
                    <input
                      id="player-name"
                      type="text"
                      maxLength={16}
                      value={playerName}
                      onChange={(e) => handleUpdateDisplayName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0B1215] border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Queue Mode: Casual vs Ranked */}
                  <div>
                    <span className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {t.queueTypeLabel}
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRankedQueue(true)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isRankedQueue
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-[#0B1215] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Shield className="w-4 h-4" />
                        <span>{t.rankedQueue}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRankedQueue(false)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          !isRankedQueue
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                            : 'bg-[#0B1215] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span>{t.casualQueue}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      {isRankedQueue ? t.rankedQueueDesc : t.casualQueueDesc}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 sm:p-5 rounded-xl bg-[#0B1215]/70 border border-white/10 space-y-3.5">
                    <div>
                      <h2 className="font-semibold text-white">{t.quickOrNewRoomTitle}</h2>
                      <p className="text-xs text-slate-400 mt-1">{t.quickOrNewRoomDesc}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {!searchingQuickMatch ? (
                        <button
                          type="button"
                          onClick={() =>
                            setMatchSkillPicker({
                              open: true,
                              mode: 'online',
                              purpose: 'online-quick',
                            })
                          }
                          className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                            isRankedQueue
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          }`}
                        >
                          {t.findQuickMatch} ({isRankedQueue ? t.rankedQueue : t.casualQueue})
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchingQuickMatch(false);
                            sendLobbyMsg({ type: 'cancel_quick_match' });
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-200 font-semibold text-sm transition-colors cursor-pointer"
                        >
                          {t.searchingOpponent}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          sendLobbyMsg({
                            type: 'create_room',
                            teamSize,
                            isRanked: isRankedQueue,
                          })
                        }
                        className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors cursor-pointer"
                      >
                        {t.createCodeRoom} ({isRankedQueue ? t.rankedQueue : t.casualQueue})
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-xl bg-[#0B1215]/70 border border-white/10 space-y-3.5">
                    <div>
                      <h2 className="font-semibold text-white">{t.joinRoomTitle}</h2>
                      <p className="text-xs text-slate-400 mt-1">{t.joinRoomDesc}</p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                        placeholder="Ex: GOL42"
                        className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-[#111C21] border border-white/15 font-mono-num text-sm uppercase tracking-wider text-white focus:outline-none focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          sendLobbyMsg({
                            type: 'join_room',
                            roomCode: joinCodeInput,
                          })
                        }
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {t.joinBtn}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Matches — Spectator Mode List */}
                <div className="p-4 rounded-xl bg-[#0B1215]/75 border border-sky-400/25 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-sky-400" />
                      <h2 className="font-semibold text-sm sm:text-base text-white">
                        {t.liveMatchesTitle}
                      </h2>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono-num text-[11px] font-bold">
                        {liveRooms.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => sendLobbyMsg({ type: 'list_live_rooms' })}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t.refreshLiveBtn}</span>
                    </button>
                  </div>

                  {liveRooms.length === 0 ? (
                    <p className="text-xs text-slate-400 py-1">{t.noLiveMatches}</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {liveRooms.map((lr) => (
                        <div
                          key={lr.roomCode}
                          className="p-3 rounded-xl bg-[#111C21] border border-white/10 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="font-mono-num font-bold text-white">
                                #{lr.roomCode}
                              </span>
                              <span className="text-slate-400">
                                {lr.teamSize}v{lr.teamSize}
                              </span>
                              <span
                                className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                  lr.isRanked
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-emerald-500/15 text-emerald-300'
                                }`}
                              >
                                {lr.isRanked ? t.rankedQueue : t.casualQueue}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-white truncate">
                              <span className="text-blue-300">{lr.blueName}</span>{' '}
                              <span className="font-mono-num text-white">
                                {lr.blueScore} × {lr.redScore}
                              </span>{' '}
                              <span className="text-red-300">{lr.redName}</span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                              <span className="font-mono-num text-emerald-300">
                                {formatClock(lr.timeRemaining)}
                              </span>
                              <span>
                                👁 {lr.spectatorCount} {t.spectatorsCountLabel}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              sendLobbyMsg({
                                type: 'spectate_room',
                                roomCode: lr.roomCode,
                              })
                            }
                            className="shrink-0 px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{t.watchLiveBtn}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-[#0B1215] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>
                        {t.roomCodeLabel} · {lobby.teamSize} vs {lobby.teamSize} (
                        {lobby.humanCount}/{lobby.maxHumans} {t.humansCount})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          lobby.isRanked
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
                        }`}
                      >
                        {lobby.isRanked ? t.rankedQueue : t.casualQueue}
                      </span>
                    </div>
                    <div className="font-mono-num text-3xl font-bold tracking-widest text-white mt-0.5">
                      {lobby.roomCode}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => sendLobbyMsg({ type: 'switch_team' })}
                      className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      {t.switchTeam}
                    </button>
                    <button
                      type="button"
                      onClick={copyRoomCode}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-medium text-white transition-colors cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>{t.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>{t.copyCode}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-blue-500/40 bg-blue-500/10 space-y-2">
                    <div className="text-xs font-semibold text-blue-300">{t.blueTeam}</div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {lobby.bluePlayers.map((p) => {
                        const slotInfo = getRankInfo(p.exp ?? 0);
                        const slotTier = slotInfo.tier;
                        return (
                          <div
                            key={p.slot}
                            className={`px-3 py-1.5 rounded-lg text-sm flex items-center justify-between gap-2 ${
                              p.isAI
                                ? 'bg-black/20 text-slate-400'
                                : 'bg-blue-500/20 text-white font-semibold'
                            }`}
                          >
                            <span className="truncate">
                              {p.name} {p.slot === lobby.yourSlot ? t.youTag : ''}
                            </span>
                            <span className="text-xs text-blue-200/90 shrink-0 flex items-center gap-1.5">
                              {p.isAI ? (
                                t.aiLabel
                              ) : (
                                <>
                                  <span>{slotTier.icon}</span>
                                  <span className={slotTier.textClass}>
                                    {formatRankWithSubLevel(
                                      getLocalizedRankName(slotTier.id, language),
                                      slotInfo.subLevel
                                    )}
                                  </span>
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 space-y-2">
                    <div className="text-xs font-semibold text-red-300">{t.redTeam}</div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {lobby.redPlayers.map((p) => {
                        const slotInfo = getRankInfo(p.exp ?? 0);
                        const slotTier = slotInfo.tier;
                        return (
                          <div
                            key={p.slot}
                            className={`px-3 py-1.5 rounded-lg text-sm flex items-center justify-between gap-2 ${
                              p.isAI
                                ? 'bg-black/20 text-slate-400'
                                : 'bg-red-500/20 text-white font-semibold'
                            }`}
                          >
                            <span className="truncate">
                              {p.name} {p.slot === lobby.yourSlot ? t.youTag : ''}
                            </span>
                            <span className="text-xs text-red-200/90 shrink-0 flex items-center gap-1.5">
                              {p.isAI ? (
                                t.aiLabel
                              ) : (
                                <>
                                  <span>{slotTier.icon}</span>
                                  <span className={slotTier.textClass}>
                                    {formatRankWithSubLevel(
                                      getLocalizedRankName(slotTier.id, language),
                                      slotInfo.subLevel
                                    )}
                                  </span>
                                </>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B1215] border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="text-xs font-semibold text-slate-300">
                      {t.equippedSlotsTitle}:
                    </span>
                    {saveProfile.equippedSkills.length === 0 ? (
                      <span className="text-xs text-slate-400">{t.skillSlotEmpty} (0/2)</span>
                    ) : (
                      saveProfile.equippedSkills.map((skId, idx) => {
                        const sk = getSkillById(skId);
                        if (!sk) return null;
                        return (
                          <span
                            key={sk.id}
                            className="px-2.5 py-1 rounded-lg bg-[#111C21] border border-white/15 text-xs font-bold text-white flex items-center gap-1.5"
                          >
                            <span className="font-mono-num text-[10px] text-amber-300">
                              {idx === 0 ? 'Z' : 'X'}
                            </span>
                            <span>{sk.icon}</span>
                            <span>{sk.name}</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setMatchSkillPicker({
                        open: true,
                        mode: 'online',
                        purpose: 'online-lobby',
                      })
                    }
                    className="px-3.5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{t.changeMatchSkillsBtn}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      wsRef.current?.send(JSON.stringify({ type: 'leave_room' }));
                      setLobby(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium text-slate-200 transition-colors cursor-pointer"
                  >
                    {t.leaveRoom}
                  </button>

                  {lobby.isHost ? (
                    <button
                      type="button"
                      disabled={!lobby.isReady}
                      onClick={() => sendLobbyMsg({ type: 'start_match' })}
                      className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-bold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      {lobby.isReady ? t.startOnlineMatch : t.waitingPlayers}
                    </button>
                  ) : (
                    <span className="text-sm text-slate-300">{t.waitingHost}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ---------------- RENDER: ACTIVE MATCH ----------------
  const isOvertime = hud.overtimeCount > 0;
  const isTraining = gameStateRef.current.mode === 'training';
  const winnerTitle =
    hud.winner === 'draw'
      ? t.drawTitle
      : hud.winner === 'blue'
      ? isOnline && !isSpectator && myTeam === 'blue'
        ? t.youWonTitle
        : isTwoPlayerLocal
        ? `${hud.p1Label} ${t.wonSuffix}`
        : t.blueTeamWon
      : isOnline && !isSpectator && myTeam === 'red'
      ? t.youWonTitle
      : gameStateRef.current.mode === '1p' || isTraining
      ? t.aiWon
      : isTwoPlayerLocal
      ? `${hud.p2Label} ${t.wonSuffix}`
      : t.redTeamWon;

  const canvasLabels = {
    goalTitle: t.canvasGoalTitle,
    prepareTitle: t.canvasPrepareTitle,
    prepareSub: t.canvasPrepareSub,
    overtimeTitle: t.canvasOvertimeTitle,
    overtimeSub: t.canvasOvertimeSub,
    pausedClock: t.canvasPausedClock,
    scoredFor: t.canvasScoredFor,
    ownGoalScoredFor: t.canvasOwnGoalScoredFor,
    blueTeam: t.blueTeam,
    redTeam: t.redTeam,
  };

  const hudPlacements = computeSinglePlayerHudPlacements(
    saveProfile.hudConfig,
    Math.max(480, viewportSize.width),
    Math.max(320, viewportSize.height)
  );
  const twoPlayerHudPlacements = computeTwoPlayerHudPlacements(
    saveProfile.hudConfig,
    Math.max(480, viewportSize.width),
    Math.max(320, viewportSize.height)
  );
  const hudOpacity = saveProfile.hudConfig.opacity;

  const equippedSkillSlots = (
    [
      {
        slotIdx: 0 as const,
        keyLabel: 'Z',
        skill: hud.mySkill1Id ? getSkillById(hud.mySkill1Id) : null,
        cd: hud.mySkill1Cd,
        maxCd: Math.max(1, hud.mySkill1MaxCd),
        pressed: p1KeyButtons.skill1,
      },
      {
        slotIdx: 1 as const,
        keyLabel: 'X',
        skill: hud.mySkill2Id ? getSkillById(hud.mySkill2Id) : null,
        cd: hud.mySkill2Cd,
        maxCd: Math.max(1, hud.mySkill2MaxCd),
        pressed: p1KeyButtons.skill2,
      },
    ] as const
  ).filter((s) => Boolean(s.skill));

  const p2EquippedSkillSlots = isTwoPlayerLocal
    ? (
        [
          {
            slotIdx: 0 as const,
            keyLabel: 'I',
            skill: hud.p2Skill1Id ? getSkillById(hud.p2Skill1Id) : null,
            cd: hud.p2Skill1Cd,
            maxCd: Math.max(1, hud.p2Skill1MaxCd),
            pressed: p2KeyButtons.skill1,
          },
          {
            slotIdx: 1 as const,
            keyLabel: 'O',
            skill: hud.p2Skill2Id ? getSkillById(hud.p2Skill2Id) : null,
            cd: hud.p2Skill2Cd,
            maxCd: Math.max(1, hud.p2Skill2MaxCd),
            pressed: p2KeyButtons.skill2,
          },
        ] as const
      ).filter((s) => Boolean(s.skill))
    : [];

  return (
    <div className="relative h-dvh w-screen bg-[#0D191E] text-slate-50 overflow-hidden select-none touch-none">
      {saveModalElement}
      {unifiedShopElement}
      {menuControlsElement}
      {matchSkillPickerElement}
      {customizerModalElement}
      {devModalElement}
      {replayModalElement}

      {/* Mobile Portrait Blocking Overlay — forces landscape mode to play on mobile */}
      {isPortraitBlocked && (
        <div className="fixed inset-0 z-[90] bg-[#0B1215]/96 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="w-full max-w-sm bg-[#111C21] border border-amber-400/35 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 relative">
              <Smartphone className="w-10 h-10 animate-phone-rotate" />
              <RotateCw className="w-5 h-5 text-emerald-300 absolute -top-2 -right-2" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-extrabold text-white">
                {t.landscapeOnlyTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.landscapeOnlyDesc}
              </p>
              {landscapeManualHintVisible && (
                <p className="text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-400/30 rounded-xl px-3 py-2">
                  {t.landscapeManualHint}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={requestLandscapeMode}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                <span>{t.landscapeOnlyBtn}</span>
              </button>
              <button
                type="button"
                onClick={handleExitToMenu}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.exitToMenu}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top-Left Spectator Badge OR Active Equipped Skills Floating Buttons (Z / X) */}
      {isSpectator ? (
        <div className="pointer-events-none fixed top-[max(0.4rem,env(safe-area-inset-top))] left-2.5 z-20 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-sky-950/85 backdrop-blur-md border border-sky-400/50 shadow-lg text-xs">
          <Eye className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
          <span className="font-extrabold text-sky-200 tracking-wide">
            {t.spectatorBadge}
          </span>
          <span className="hidden sm:inline text-slate-300">· {t.spectatingLive}</span>
          <span className="font-mono-num text-[11px] font-bold text-sky-300">
            👁 {spectatorCount}
          </span>
        </div>
      ) : (
        !paused &&
        !isPortraitBlocked &&
        hud.phase !== 'FINISHED' &&
        equippedSkillSlots.length > 0 && (
          <div className="fixed top-[max(0.4rem,env(safe-area-inset-top))] left-2 z-20 flex items-center gap-1.5">
            {equippedSkillSlots.map(({ slotIdx, keyLabel, skill, cd, maxCd, pressed }) => {
              if (!skill) return null;
              const isActive = hud.myActiveSkill === skill.id;
              const onCooldown = cd > 0.05;
              const cdRatio = onCooldown ? Math.min(1, cd / maxCd) : 0;
              const rarity = RARITY_META[skill.rarity];
              return (
                <button
                  key={`${slotIdx}-${skill.id}`}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    if (slotIdx === 0) touchP1Ref.current.skill1 = true;
                    else touchP1Ref.current.skill2 = true;
                    pushOnlineInputNow(true);
                  }}
                  onPointerUp={() => {
                    if (slotIdx === 0) touchP1Ref.current.skill1 = false;
                    else touchP1Ref.current.skill2 = false;
                    pushOnlineInputNow(true);
                  }}
                  onPointerLeave={() => {
                    if (slotIdx === 0) touchP1Ref.current.skill1 = false;
                    else touchP1Ref.current.skill2 = false;
                    pushOnlineInputNow(true);
                  }}
                  onPointerCancel={() => {
                    if (slotIdx === 0) touchP1Ref.current.skill1 = false;
                    else touchP1Ref.current.skill2 = false;
                    pushOnlineInputNow(true);
                  }}
                  className={`relative overflow-hidden px-2 py-1 rounded-xl backdrop-blur-md border shadow-lg flex items-center gap-1.5 transition-transform touch-none select-none cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/35 border-emerald-300 ring-2 ring-emerald-400/70 scale-105'
                      : pressed
                      ? 'bg-white/25 border-white/60 scale-95'
                      : `bg-[#0B1215]/75 ${rarity.borderClass} hover:bg-[#111C21]/90`
                  }`}
                >
                  {onCooldown && (
                    <div
                      style={{ height: `${Math.round(cdRatio * 100)}%` }}
                      className="pointer-events-none absolute bottom-0 left-0 right-0 bg-black/70 transition-[height] duration-75"
                    />
                  )}
                  <span className="relative z-10 text-base leading-none">{skill.icon}</span>
                  <div className="relative z-10 text-left leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="px-1 py-0.2 rounded bg-white/15 font-mono-num text-[9px] font-extrabold text-white">
                        {keyLabel}
                      </span>
                      <span className="hidden sm:inline text-[11px] font-bold text-white max-w-[78px] truncate">
                        {skill.name}
                      </span>
                    </div>
                    {onCooldown ? (
                      <div className="font-mono-num text-[10px] font-bold text-amber-300">
                        {Math.ceil(cd)}s
                      </div>
                    ) : isActive ? (
                      <div className="text-[9px] font-extrabold text-emerald-300 uppercase">
                        ATIVADA
                      </div>
                    ) : (
                      <div className="text-[9px] text-slate-300 hidden sm:block">PRONTO</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )
      )}

      {/* Top-Right Player 2 Equipped Skills Buttons in 2P Local (I / O) */}
      {isTwoPlayerLocal &&
        !isSpectator &&
        !paused &&
        !isPortraitBlocked &&
        hud.phase !== 'FINISHED' &&
        p2EquippedSkillSlots.length > 0 && (
          <div className="fixed top-[calc(max(0.4rem,env(safe-area-inset-top))+2.65rem)] right-2 z-20 flex items-center gap-1.5">
            {p2EquippedSkillSlots.map(({ slotIdx, keyLabel, skill, cd, maxCd, pressed }) => {
              if (!skill) return null;
              const isActive = hud.p2ActiveSkill === skill.id;
              const onCooldown = cd > 0.05;
              const cdRatio = onCooldown ? Math.min(1, cd / maxCd) : 0;
              return (
                <button
                  key={`p2-${slotIdx}-${skill.id}`}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    if (slotIdx === 0) touchP2Ref.current.skill1 = true;
                    else touchP2Ref.current.skill2 = true;
                  }}
                  onPointerUp={() => {
                    if (slotIdx === 0) touchP2Ref.current.skill1 = false;
                    else touchP2Ref.current.skill2 = false;
                  }}
                  onPointerLeave={() => {
                    if (slotIdx === 0) touchP2Ref.current.skill1 = false;
                    else touchP2Ref.current.skill2 = false;
                  }}
                  onPointerCancel={() => {
                    if (slotIdx === 0) touchP2Ref.current.skill1 = false;
                    else touchP2Ref.current.skill2 = false;
                  }}
                  className={`relative overflow-hidden px-2 py-1 rounded-xl backdrop-blur-md border shadow-lg flex items-center gap-1.5 transition-transform touch-none select-none cursor-pointer ${
                    isActive
                      ? 'bg-red-500/40 border-red-300 ring-2 ring-red-400/70 scale-105'
                      : pressed
                      ? 'bg-white/25 border-white/60 scale-95'
                      : 'bg-[#0B1215]/75 border-red-400/45 hover:bg-[#111C21]/90'
                  }`}
                >
                  {onCooldown && (
                    <div
                      style={{ height: `${Math.round(cdRatio * 100)}%` }}
                      className="pointer-events-none absolute bottom-0 left-0 right-0 bg-black/70 transition-[height] duration-75"
                    />
                  )}
                  <span className="relative z-10 text-base leading-none">{skill.icon}</span>
                  <div className="relative z-10 text-left leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="px-1 py-0.2 rounded bg-red-500/30 font-mono-num text-[9px] font-extrabold text-red-200">
                        {keyLabel}
                      </span>
                      <span className="hidden sm:inline text-[11px] font-bold text-white max-w-[78px] truncate">
                        {skill.name}
                      </span>
                    </div>
                    {onCooldown ? (
                      <div className="font-mono-num text-[10px] font-bold text-amber-300">
                        {Math.ceil(cd)}s
                      </div>
                    ) : isActive ? (
                      <div className="text-[9px] font-extrabold text-red-200 uppercase">
                        ATIVADA
                      </div>
                    ) : (
                      <div className="text-[9px] text-slate-300 hidden sm:block">P2</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

      {/* Minimal Floating Scoreboard Chip (NO top bar — maximizes 16:9 & 9:16 pitch space) */}
      <div className="pointer-events-none fixed top-[max(0.4rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1 rounded-xl bg-[#0B1215]/55 backdrop-blur-md border border-white/10 shadow-lg">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-4 rounded-sm bg-blue-500 shrink-0" />
          <span className="hidden sm:inline text-xs font-semibold text-blue-200 truncate max-w-[96px]">
            {hud.blueName}
          </span>
          <span
            key={`blue-score-${hud.blueScore}`}
            className="font-display font-extrabold text-xl sm:text-2xl text-white font-mono-num leading-none animate-score-bump"
          >
            {hud.blueScore}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center px-1.5 sm:px-2 border-x border-white/10 leading-none">
          <span
            className={`font-mono-num text-sm sm:text-base font-bold leading-none ${
              hud.phase === 'GOAL'
                ? 'text-emerald-400'
                : hud.timeRemaining <= 10
                ? 'text-amber-400'
                : 'text-white'
            }`}
          >
            {formatClock(hud.timeRemaining)}
          </span>
          {(hud.phase === 'GOAL' || isOvertime) && (
            <span className="text-[9px] font-semibold text-emerald-300 mt-0.5 whitespace-nowrap">
              {hud.phase === 'GOAL'
                ? t.goalPausedClock
                : `${t.overtimeLabel} ${hud.overtimeCount}/${MAX_OVERTIMES}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <span
            key={`red-score-${hud.redScore}`}
            className="font-display font-extrabold text-xl sm:text-2xl text-white font-mono-num leading-none animate-score-bump"
          >
            {hud.redScore}
          </span>
          <span className="hidden sm:inline text-xs font-semibold text-red-200 truncate max-w-[96px]">
            {hud.redName}
          </span>
          <span className="w-2 h-4 rounded-sm bg-red-500 shrink-0" />
        </div>
      </div>

      {/* Dedicated Training Mode Quick Action Chip below Scoreboard */}
      {isTraining && !isSpectator && !paused && hud.phase !== 'FINISHED' && (
        <div className="fixed top-[calc(max(0.4rem,env(safe-area-inset-top))+2.55rem)] left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#0B1215]/90 border border-emerald-400/35 shadow-md">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 whitespace-nowrap">
            {t.trainingModeLabel}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              const st = gameStateRef.current;
              resetPositionsForKickoff(st);
              st.phase = 'PLAYING';
              st.phaseTimer = 0;
              syncHudFromState(st);
              soundFX.play('whistle');
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/45 text-[10px] font-bold text-emerald-200 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.trainingResetBallBtn}</span>
          </button>
        </div>
      )}

      {/* Minimal Floating Top-Right Utility Actions */}
      <div className="fixed top-[max(0.4rem,env(safe-area-inset-top))] right-2.5 z-20 flex items-center gap-1 px-1.5 py-1 rounded-xl bg-[#0B1215]/55 backdrop-blur-md border border-white/10 shadow-lg">
        {isOnline && wsConnected && pingMs !== null && (
          <div
            className={`px-1.5 py-0.5 rounded-md font-mono-num text-[10px] font-bold flex items-center gap-1 whitespace-nowrap ${
              pingMs <= 65
                ? 'text-emerald-300 bg-emerald-500/15'
                : pingMs <= 130
                ? 'text-amber-300 bg-amber-500/15'
                : 'text-rose-300 bg-rose-500/15'
            }`}
          >
            <Wifi className="w-3 h-3" />
            <span>{pingMs}ms</span>
          </div>
        )}
        {isDevUser && (
          <button
            type="button"
            onClick={() => setDevModalOpen(true)}
            title="Dev Mode"
            aria-label="Dev Mode"
            className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:text-amber-100 hover:bg-amber-500/35 transition-colors cursor-pointer"
          >
            <Code2 className="w-4 h-4" />
          </button>
        )}
        {!isSpectator && (
          <>
            {!paused && !isPortraitBlocked && hud.phase !== 'FINISHED' && (
              <button
                type="button"
                onClick={() => setEmotePickerOpen((v) => !v)}
                title={t.emotesBtnLabel}
                aria-label={t.emotesBtnLabel}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  emotePickerOpen
                    ? 'bg-amber-500/25 text-amber-300'
                    : 'text-amber-200 hover:text-white hover:bg-amber-500/20'
                }`}
              >
                <Smile className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setCustomizerModalOpen(true)}
              title={t.customizeButtonsBtn}
              aria-label={t.customizeButtonsBtn}
              className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-500/20 transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                controlsOverrideRef.current = true;
                setShowFloatingControls((v) => !v);
              }}
              title="Controles na Tela"
              aria-label="Controles na Tela"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showFloatingControls
                  ? 'bg-emerald-500/25 text-emerald-300'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={cycleLanguage}
          title={currentLangObj.label}
          className="hidden sm:inline-flex px-1.5 py-1 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {currentLangObj.flag}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? t.soundOn : t.soundOff}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={() => {
            if (isOnline || isSpectator) {
              handleExitToMenu();
            } else {
              setEmotePickerOpen(false);
              setPaused((p) => !p);
            }
          }}
          aria-label={isOnline || isSpectator ? t.exitToMenu : t.pausedTitle}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {isOnline || isSpectator ? (
            <ArrowLeft className="w-4 h-4" />
          ) : (
            <Pause className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Mobile / Touch Emote Picker Popover */}
      {emotePickerOpen &&
        !isSpectator &&
        !paused &&
        !isPortraitBlocked &&
        hud.phase !== 'FINISHED' && (
          <div className="fixed top-[calc(max(0.4rem,env(safe-area-inset-top))+2.75rem)] right-2.5 z-30 bg-[#0B1215]/92 backdrop-blur-md border border-white/15 rounded-xl p-2 shadow-2xl space-y-1.5 animate-modal-enter">
            {isTwoPlayerLocal && (
              <div className="flex items-center gap-1 justify-end">
                <button
                  type="button"
                  onClick={() => setEmotePickerSlot('blue-1')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    emotePickerSlot === 'blue-1'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  P1
                </button>
                <button
                  type="button"
                  onClick={() => setEmotePickerSlot('red-1')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    emotePickerSlot === 'red-1'
                      ? 'bg-red-500 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  P2
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {EMOTE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    handleSendEmote(opt.id, isTwoPlayerLocal ? emotePickerSlot : 'blue-1');
                    setEmotePickerOpen(false);
                  }}
                  title={opt.label}
                  className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all cursor-pointer min-w-[44px]"
                >
                  <span className="text-base leading-none">{opt.emoji}</span>
                  <span className="text-[9px] font-bold text-slate-200 leading-none">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Edge-to-Edge Fullscreen Pitch Canvas (both 16:9 and 9:16) */}
      <main className="relative w-full h-full flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          <GameCanvas
            stateRef={gameStateRef}
            localPlayerId={
              isSpectator
                ? 'spectator'
                : isOnline
                ? onlineSlot
                : isTwoPlayerLocal
                ? null
                : 'blue-1'
            }
            spectateTargetId={isSpectator ? spectateTargetId : null}
            emotesRef={activeEmotesRef}
            labels={canvasLabels}
            turfId={saveProfile.selectedTurf}
            animationConfig={saveProfile.animationConfig}
          />
        </div>

        {/* Transient Corner Emote Chat Feed */}
        {emoteFeed.length > 0 && (
          <div className="pointer-events-none absolute top-14 left-3 z-10 flex flex-col gap-1.5 max-w-[220px]">
            {emoteFeed.map((em) => (
              <div
                key={em.uid}
                className="px-3 py-1.5 rounded-lg bg-[#0B1215]/85 border border-white/15 text-xs flex items-center gap-2 shadow-lg backdrop-blur-xs"
              >
                <span className="text-base leading-none">{em.emoji}</span>
                <span
                  className={`font-semibold truncate ${
                    em.team === 'blue' ? 'text-blue-300' : 'text-red-300'
                  }`}
                >
                  {em.senderName}:
                </span>
                <span className="text-slate-100 whitespace-nowrap">{em.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Spectator Camera Target Switcher Bar */}
        {isSpectator && hud.phase !== 'FINISHED' && (
          <div className="fixed bottom-[max(0.65rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-20 max-w-[95vw] flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-[#0B1215]/85 backdrop-blur-md border border-sky-400/35 shadow-xl overflow-x-auto">
            <span className="text-[11px] font-bold text-sky-300 whitespace-nowrap shrink-0 pr-1">
              {t.cameraFocusLabel}:
            </span>
            <button
              type="button"
              onClick={() => setSpectateTargetId('ball')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                spectateTargetId === 'ball'
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15'
              }`}
            >
              ⚽ {t.followBall}
            </button>
            {gameStateRef.current.players.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSpectateTargetId(p.id)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors border ${
                  spectateTargetId === p.id
                    ? p.team === 'blue'
                      ? 'bg-blue-500 text-white border-blue-300'
                      : 'bg-red-500 text-white border-red-300'
                    : p.team === 'blue'
                    ? 'bg-blue-500/15 text-blue-200 border-blue-400/30 hover:bg-blue-500/25'
                    : 'bg-red-500/15 text-red-200 border-red-400/30 hover:bg-red-500/25'
                }`}
              >
                {p.appearance?.jerseyNumber ? `#${p.appearance.jerseyNumber} ` : ''}
                {p.name}
              </button>
            ))}
            <button
              type="button"
              onClick={handleExitToMenu}
              className="ml-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.exitToMenu}
            </button>
          </div>
        )}

        {/* Pause Modal (Local Modes) */}
        {paused && !isSpectator && hud.phase !== 'FINISHED' && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-40 animate-modal-backdrop">
            <div className="w-full max-w-sm bg-[#111C21] border border-white/15 rounded-2xl p-6 text-center space-y-4 shadow-2xl animate-modal-enter">
              <h2 className="font-display text-3xl font-extrabold text-white">
                {t.pausedTitle}
              </h2>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setPaused(false)}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm cursor-pointer"
                >
                  {t.resumeMatch}
                </button>
                {isDevUser && (
                  <button
                    type="button"
                    onClick={() => setDevModalOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Code2 className="w-4 h-4" />
                    <span>Dev Mode</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCustomizerModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/45 text-sky-200 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-4 h-4" />
                  <span>{t.customizeButtonsBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMenuControlsOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 text-indigo-200 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>{t.menuControlsBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openShopTab('skills')}
                  className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t.unifiedShopBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRestartMatch}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm cursor-pointer"
                >
                  {t.restartMatch}
                </button>
                <button
                  type="button"
                  onClick={handleExitToMenu}
                  className="w-full py-2.5 rounded-xl bg-transparent hover:bg-white/10 text-slate-300 font-medium text-sm cursor-pointer"
                >
                  {t.exitToMenu}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Match Finished: Dedicated Multiplayer MVP & Winners Screen, then Summary Modal */}
        {hud.phase === 'FINISHED' && (() => {
          const isMultiplayerMatch =
            gameStateRef.current.mode === 'online' || gameStateRef.current.mode === '2p';
          const mvpSummary = isMultiplayerMatch
            ? computeMultiplayerMvpAndWinners(gameStateRef.current)
            : null;
          const finalBlueScore = spectatorSummary ? spectatorSummary.blueScore : hud.blueScore;
          const finalRedScore = spectatorSummary ? spectatorSummary.redScore : hud.redScore;

          if (isMultiplayerMatch && mvpSummary && !mvpDismissed) {
            return (
              <MultiplayerMvpScreen
                summary={mvpSummary}
                winner={hud.winner}
                winnerTitle={isSpectator ? t.spectatorEndedTitle : winnerTitle}
                blueName={hud.blueName}
                redName={hud.redName}
                blueScore={finalBlueScore}
                redScore={finalRedScore}
                mySlot={isOnline ? onlineSlot : isTwoPlayerLocal ? 'blue-1' : 'blue-1'}
                isSpectator={isSpectator}
                t={t}
                onContinue={() => setMvpDismissed(true)}
                onExitToMenu={handleExitToMenu}
              />
            );
          }

          return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-modal-backdrop">
              <div className="w-full max-w-md bg-[#111C21] border border-white/15 rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-modal-enter">
                <div
                  className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto ${
                    hud.winner === 'draw'
                      ? 'bg-slate-500/20 border-slate-400/40 text-slate-200'
                      : isSpectator
                      ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
                      : 'bg-amber-500/20 border-amber-400/40 text-amber-400'
                  }`}
                >
                  {isSpectator ? <Eye className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
                </div>

                <div>
                  <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                    {isSpectator ? t.spectatorEndedTitle : winnerTitle}
                  </h2>
                  {isSpectator ? (
                    <p className="text-xs font-semibold text-sky-300 mt-1">
                      {t.spectatorEndedDesc}
                    </p>
                  ) : hud.winner === 'draw' ? (
                    <p className="text-xs font-semibold text-slate-300 mt-1">
                      {formatT(t.drawReason, { max: MAX_OVERTIMES })}
                    </p>
                  ) : (
                    isOvertime && (
                      <p className="text-xs font-semibold text-amber-400 mt-1">
                        {formatT(t.overtimeDecided, { sec: hud.overtimeCount * 30 })}
                      </p>
                    )
                  )}
                </div>

                <div className="py-4 px-6 rounded-xl bg-[#0B1215] border border-white/10 flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="text-xs text-blue-300 font-semibold">{hud.blueName}</div>
                    <div className="font-display text-5xl font-extrabold text-white font-mono-num">
                      {finalBlueScore}
                    </div>
                  </div>
                  <span className="text-slate-500 font-bold text-xl">×</span>
                  <div className="text-center">
                    <div className="text-xs text-red-300 font-semibold">{hud.redName}</div>
                    <div className="font-display text-5xl font-extrabold text-white font-mono-num">
                      {finalRedScore}
                    </div>
                  </div>
                </div>

                {/* Ranked EXP + Coins Summary */}
                {isOnline && !isSpectator && onlineMatchIsRanked && rankedSummary && (
                  <div className="p-4 rounded-xl bg-[#0B1215] border border-amber-400/35 space-y-2.5 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        {t.rankedSummaryTitle} ·{' '}
                        {rankedSummary.result === 'win'
                          ? t.rankedWin
                          : rankedSummary.result === 'loss'
                          ? t.rankedLoss
                          : t.rankedDraw}
                      </span>
                      <span
                        className={`font-mono-num text-sm font-extrabold ${
                          rankedSummary.expDelta >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {rankedSummary.expDelta >= 0
                          ? `+${rankedSummary.expDelta}`
                          : rankedSummary.expDelta}{' '}
                        EXP
                      </span>
                    </div>

                    {(() => {
                      const postInfo = getRankInfo(rankedSummary.nextExp);
                      const postName = formatRankWithSubLevel(
                        getLocalizedRankName(postInfo.tier.id, language),
                        postInfo.subLevel
                      );
                      return (
                        <>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`font-bold ${postInfo.tier.textClass}`}>
                              {postInfo.tier.icon} {postName}
                            </span>
                            <span className="font-mono-num text-slate-300">
                              {rankedSummary.nextExp} EXP
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[#111C21] overflow-hidden border border-white/10">
                            <div
                              style={{ width: `${postInfo.subProgressPercent}%` }}
                              className="h-full bg-gradient-to-r from-emerald-500 to-amber-400"
                            />
                          </div>
                          {rankedSummary.promoted && (
                            <div className="px-2.5 py-1.5 rounded-lg bg-amber-400/20 border border-amber-300/60 text-amber-200 text-xs font-extrabold text-center">
                              🎉 {formatT(t.rankedPromoted, { rank: postName })}
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {rankedSummary.coinsEarned > 0 && (
                      <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-bold flex items-center justify-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-300" />
                        <span>
                          {formatT(t.onlineCoinsEarned, {
                            coins: rankedSummary.coinsEarned,
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Casual Online Coins Summary */}
                {isOnline && !isSpectator && !onlineMatchIsRanked && onlineCasualSummary && (
                  <div className="p-3.5 rounded-xl bg-[#0B1215] border border-amber-400/35 space-y-2 text-center">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      {t.casualSummaryTitle}
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs font-extrabold flex items-center justify-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-300" />
                      <span>
                        {formatT(t.onlineCoinsEarned, {
                          coins: onlineCasualSummary.coinsEarned,
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {replayModalElement}

                {isMultiplayerMatch && mvpSummary && (
                  <button
                    type="button"
                    onClick={() => setMvpDismissed(false)}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/45 text-amber-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>{t.mvpReopenBtn}</span>
                  </button>
                )}

                {/* Best Moments Replay CTA after 1P or 2P match */}
                {(gameStateRef.current.mode === '1p' || gameStateRef.current.mode === '2p') &&
                  lastMatchReplay &&
                  lastMatchReplay.clips.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setReplayModalOpen(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Film className="w-4 h-4 text-sky-300" />
                      <span>
                        {t.watchReplayBtn} ({lastMatchReplay.clips.length})
                      </span>
                    </button>
                  )}

                <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  {!isSpectator && (
                    <button
                      type="button"
                      onClick={handleRestartMatch}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{t.playAgain}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleExitToMenu}
                    className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm cursor-pointer whitespace-nowrap"
                  >
                    {t.mainMenu}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </main>

      {/* Customizable Floating Touch Controls (Disabled in Spectator Mode & Portrait Mobile) */}
      {showFloatingControls &&
        !isSpectator &&
        !paused &&
        !isPortraitBlocked &&
        hud.phase !== 'FINISHED' && (
        isTwoPlayerLocal ? (
          <>
            {(() => {
              const { p1, p2 } = twoPlayerHudPlacements;
              const posStyle = (pl: typeof p1.joystick): React.CSSProperties => ({
                position: 'fixed',
                zIndex: 20,
                opacity: hudOpacity,
                bottom: `calc(max(0.6rem, env(safe-area-inset-bottom)) + ${Math.round(
                  pl.bottomY - pl.size / 2
                )}px)`,
                ...(pl.anchor === 'left'
                  ? { left: Math.round(pl.centerX - pl.size / 2) }
                  : { right: Math.round(pl.centerX - pl.size / 2) }),
              });

              return (
                <>
                  {/* P1 Joystick + Radial Arc */}
                  <div style={posStyle(p1.joystick)} className="pointer-events-auto">
                    <VirtualJoystick
                      team="blue"
                      label={hud.p1Label}
                      externalVector={p1KeyVec}
                      size={p1.joystick.size}
                      sensitivity={saveProfile.hudConfig.joystickSensitivity}
                      floating
                      hideLabel
                      onChange={(vec) => {
                        touchP1Ref.current.moveX = vec.x;
                        touchP1Ref.current.moveY = vec.y;
                      }}
                    />
                  </div>
                  <div style={posStyle(p1.sprint)} className="pointer-events-auto">
                    <ActionButton
                      variant="sprint"
                      team="blue"
                      label={t.actionSprint}
                      size={p1.sprint.size}
                      floating
                      exhausted={hud.blueStaminaExhausted}
                      active={p1KeyButtons.sprint}
                      onPressChange={(pressed) => {
                        touchP1Ref.current.sprint = pressed;
                      }}
                    />
                  </div>
                  <div style={posStyle(p1.dribble)} className="pointer-events-auto">
                    <ActionButton
                      variant="dribble"
                      team="blue"
                      label={t.actionDribble}
                      size={p1.dribble.size}
                      floating
                      cooldownRatio={hud.blueDribbleCdRatio}
                      active={p1KeyButtons.dribble}
                      onPressChange={(pressed) => {
                        touchP1Ref.current.dribble = pressed;
                      }}
                    />
                  </div>
                  <div style={posStyle(p1.pass)} className="pointer-events-auto">
                    <ActionButton
                      variant="pass"
                      team="blue"
                      label={t.actionPass}
                      size={p1.pass.size}
                      floating
                      active={p1KeyButtons.pass}
                      onPressChange={(pressed) => {
                        touchP1Ref.current.pass = pressed;
                      }}
                    />
                  </div>
                  <div style={posStyle(p1.shoot)} className="pointer-events-auto">
                    <ActionButton
                      variant="shoot"
                      team="blue"
                      label={t.actionShoot}
                      size={p1.shoot.size}
                      floating
                      chargeRatio={hud.blueShootCharge}
                      active={p1KeyButtons.shoot}
                      onPressChange={(pressed) => {
                        touchP1Ref.current.shoot = pressed;
                      }}
                    />
                  </div>
                  {saveProfile.hudConfig.showSwitchButton && (
                    <div style={posStyle(p1.switch)} className="pointer-events-auto">
                      <ActionButton
                        variant="switch"
                        team="blue"
                        label={t.actionSwitch}
                        size={p1.switch.size}
                        floating
                        active={p1KeyButtons.switchPlayer}
                        onPressChange={(pressed) => {
                          touchP1Ref.current.switchPlayer = pressed;
                        }}
                      />
                    </div>
                  )}

                  {/* P2 Mirrored Joystick + Radial Arc */}
                  <div style={posStyle(p2.joystick)} className="pointer-events-auto">
                    <VirtualJoystick
                      team="red"
                      label={hud.p2Label}
                      externalVector={p2KeyVec}
                      size={p2.joystick.size}
                      sensitivity={saveProfile.hudConfig.joystickSensitivity}
                      floating
                      hideLabel
                      onChange={(vec) => {
                        touchP2Ref.current.moveX = vec.x;
                        touchP2Ref.current.moveY = vec.y;
                      }}
                    />
                  </div>
                  <div style={posStyle(p2.sprint)} className="pointer-events-auto">
                    <ActionButton
                      variant="sprint"
                      team="red"
                      label={t.actionSprint}
                      size={p2.sprint.size}
                      floating
                      exhausted={hud.redStaminaExhausted}
                      active={p2KeyButtons.sprint}
                      onPressChange={(pressed) => {
                        touchP2Ref.current.sprint = pressed;
                      }}
                    />
                  </div>
                  <div style={posStyle(p2.dribble)} className="pointer-events-auto">
                    <ActionButton
                      variant="dribble"
                      team="red"
                      label={t.actionDribble}
                      size={p2.dribble.size}
                      floating
                      cooldownRatio={hud.redDribbleCdRatio}
                      active={p2KeyButtons.dribble}
                      onPressChange={(pressed) => {
                        touchP2Ref.current.dribble = pressed;
                      }}
                    />
                  </div>
                  <div style={posStyle(p2.pass)} className="pointer-events-auto">
                    <ActionButton
                      variant="pass"
                      team="red"
                      label={t.actionPass}
                      size={p2.pass.size}
                      floating
                      active={p2KeyButtons.pass}
                      onPressChange={(pressed) => {
                        touchP2Ref.current.pass = pressed;
                      }}
                    />
                  </div>
                  <div style={posStyle(p2.shoot)} className="pointer-events-auto">
                    <ActionButton
                      variant="shoot"
                      team="red"
                      label={t.actionShoot}
                      size={p2.shoot.size}
                      floating
                      chargeRatio={hud.redShootCharge}
                      active={p2KeyButtons.shoot}
                      onPressChange={(pressed) => {
                        touchP2Ref.current.shoot = pressed;
                      }}
                    />
                  </div>
                  {saveProfile.hudConfig.showSwitchButton && (
                    <div style={posStyle(p2.switch)} className="pointer-events-auto">
                      <ActionButton
                        variant="switch"
                        team="red"
                        label={t.actionSwitch}
                        size={p2.switch.size}
                        floating
                        active={p2KeyButtons.switchPlayer}
                        onPressChange={(pressed) => {
                          touchP2Ref.current.switchPlayer = pressed;
                        }}
                      />
                    </div>
                  )}
                </>
              );
            })()}
          </>
        ) : (
          /* Single-Player / Training / Online: Fully Customizable Controls + Slim Stamina/Power */
          <>
            {(() => {
              const j = hudPlacements.joystick;
              const s = hudPlacements.sprint;
              const d = hudPlacements.dribble;
              const p = hudPlacements.pass;
              const sh = hudPlacements.shoot;
              const sw = hudPlacements.switch;
              const posStyle = (pl: typeof j): React.CSSProperties => ({
                position: 'fixed',
                zIndex: 20,
                opacity: hudOpacity,
                bottom: `calc(max(0.65rem, env(safe-area-inset-bottom)) + ${Math.round(
                  pl.bottomY - pl.size / 2
                )}px)`,
                ...(pl.anchor === 'left'
                  ? { left: Math.round(pl.centerX - pl.size / 2) }
                  : { right: Math.round(pl.centerX - pl.size / 2) }),
              });

              return (
                <>
                  <div style={posStyle(j)} className="pointer-events-auto">
                    <VirtualJoystick
                      team={myTeam}
                      label={t.walkAimLabel}
                      externalVector={p1KeyVec}
                      size={j.size}
                      sensitivity={saveProfile.hudConfig.joystickSensitivity}
                      floating
                      hideLabel
                      onChange={(vec) => {
                        const wasZero =
                          Math.abs(touchP1Ref.current.moveX) < 0.02 &&
                          Math.abs(touchP1Ref.current.moveY) < 0.02;
                        const isNowZero =
                          Math.abs(vec.x) < 0.02 && Math.abs(vec.y) < 0.02;
                        touchP1Ref.current.moveX = vec.x;
                        touchP1Ref.current.moveY = vec.y;
                        pushOnlineInputNow(wasZero || isNowZero);
                      }}
                    />
                  </div>
                  <div style={posStyle(s)} className="pointer-events-auto">
                    <ActionButton
                      variant="sprint"
                      team={myTeam}
                      label={t.actionSprint}
                      size={s.size}
                      floating
                      exhausted={hud.myStaminaExhausted}
                      active={p1KeyButtons.sprint}
                      onPressChange={(pressed) => {
                        touchP1Ref.current.sprint = pressed;
                        pushOnlineInputNow(true);
                      }}
                    />
                  </div>
                  <div style={posStyle(d)} className="pointer-events-auto">
                    <ActionButton
                      variant="dribble"
                      team={myTeam}
                      label={t.actionDribble}
                      size={d.size}
                      floating
                      cooldownRatio={hud.myDribbleCdRatio}
                      active={p1KeyButtons.dribble}
                      onPressChange={(pressed) => {
                        touchP1Ref.current.dribble = pressed;
                        pushOnlineInputNow(true);
                      }}
                    />
                  </div>
                  <div style={posStyle(p)} className="pointer-events-auto">
                    <ActionButton
                      variant="pass"
                      team={myTeam}
                      label={t.actionPass}
                      size={p.size}
                      floating
                      active={p1KeyButtons.pass}
                      onPressChange={(pressed) => {
                        touchP1Ref.current.pass = pressed;
                        pushOnlineInputNow(true);
                      }}
                    />
                  </div>
                  <div style={posStyle(sh)} className="pointer-events-auto">
                    <ActionButton
                      variant="shoot"
                      team={myTeam}
                      label={t.actionShoot}
                      size={sh.size}
                      floating
                      chargeRatio={hud.myShootCharge}
                      active={p1KeyButtons.shoot}
                      onPressChange={(pressed) => {
                        touchP1Ref.current.shoot = pressed;
                        pushOnlineInputNow(true);
                      }}
                    />
                  </div>
                  {saveProfile.hudConfig.showSwitchButton && (
                    <div style={posStyle(sw)} className="pointer-events-auto">
                      <ActionButton
                        variant="switch"
                        team={myTeam}
                        label={t.actionSwitch}
                        size={sw.size}
                        floating
                        active={p1KeyButtons.switchPlayer}
                        onPressChange={(pressed) => {
                          touchP1Ref.current.switchPlayer = pressed;
                          pushOnlineInputNow(true);
                        }}
                      />
                    </div>
                  )}
                </>
              );
            })()}

            <div
              className={`fixed bottom-[max(0.65rem,env(safe-area-inset-bottom))] z-15 pointer-events-none flex flex-col gap-1 w-28 ${
                saveProfile.hudConfig.layoutMode === 'split'
                  ? 'left-1/2 -translate-x-1/2'
                  : saveProfile.hudConfig.handedness === 'right-joy'
                  ? 'left-2.5'
                  : 'right-2.5'
              }`}
            >
              <div className="px-2 py-1 rounded-lg bg-[#0B1215]/50 backdrop-blur-md border border-white/10 space-y-0.5">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-200 leading-none">
                  <span>{t.staminaLabel}</span>
                  <span className="font-mono-num">{Math.round(hud.myStamina)}%</span>
                </div>
                <div className="h-1 rounded-full bg-black/50 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(0, Math.min(100, hud.myStamina))}%` }}
                    className={`h-full transition-[width] duration-75 ${
                      hud.myStaminaExhausted ? 'bg-amber-500' : 'bg-sky-400'
                    }`}
                  />
                </div>
              </div>
              <div className="px-2 py-1 rounded-lg bg-[#0B1215]/50 backdrop-blur-md border border-white/10 space-y-0.5">
                <div className="flex items-center justify-between text-[9px] font-bold text-slate-200 leading-none">
                  <span>{t.powerLabel}</span>
                  <span className="font-mono-num">{Math.round(hud.myShootCharge * 100)}%</span>
                </div>
                <div className="h-1 rounded-full bg-black/50 overflow-hidden">
                  <div
                    style={{ width: `${Math.max(0, Math.min(100, hud.myShootCharge * 100))}%` }}
                    className={`h-full transition-[width] duration-75 ${
                      hud.myShootCharge > 0.78
                        ? 'bg-red-500'
                        : hud.myShootCharge > 0.45
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
