import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Check,
  Coins,
  Film,
  Lock,
  Minus,
  PackageOpen,
  Palette,
  Play,
  Plus,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Trash2,
  UserCheck,
  X,
  Zap,
} from 'lucide-react';
import { formatT, type Language, type TranslationDict } from '../i18n/translations.ts';
import {
  createDefaultAnimationConfig,
  GOAL_ANIMATIONS,
  TRAIL_ANIMATIONS,
  type AnimationConfig,
  type AnimationItem,
  type GoalAnimationId,
  type TrailAnimationId,
} from '../shared/animations.ts';
import {
  CHARACTER_COSMETICS,
  type AuraTrailId,
  type CharacterConfig,
  type CosmeticCategory,
  type CosmeticItem,
  type HairStyleId,
  type JerseyPatternId,
} from '../shared/character.ts';
import type { Team } from '../shared/gameEngine.ts';
import {
  getSkillById,
  LOOTBOX_TIERS,
  RARITY_META,
  SKILLS_CATALOG,
  type LootboxRollOutcome,
  type LootboxTierId,
  type SkillId,
  type SkillRarity,
} from '../shared/skills.ts';
import { PITCH_TURFS, type PitchTurfId } from '../shared/turfs.ts';
import { drawPlayerCircle } from './GameCanvas.tsx';

export type UnifiedShopTab = 'skills' | 'character' | 'turfs' | 'animations';

interface UnifiedShopModalProps {
  open: boolean;
  initialTab?: UnifiedShopTab;
  onClose: () => void;
  t: TranslationDict;
  lang: Language;
  coins: number;
  // Skills & Lootboxes
  unlockedSkills: SkillId[];
  equippedSkills: SkillId[];
  lastOutcome: LootboxRollOutcome | null;
  onOpenLootbox: (tierId: LootboxTierId) => void;
  onEquipSkill: (skillId: SkillId, slotIdx: 0 | 1) => void;
  onUnequipSlot: (slotIdx: 0 | 1) => void;
  onClearOutcome?: () => void;
  // Character Cosmetics
  unlockedCosmetics: string[];
  characterConfig: CharacterConfig;
  onBuyCosmetic: (itemId: string) => void;
  onChangeCharacterConfig: (next: CharacterConfig) => void;
  // Pitch Turfs
  unlockedTurfs: PitchTurfId[];
  selectedTurf: PitchTurfId;
  onBuyTurf: (turfId: PitchTurfId) => void;
  onSelectTurf: (turfId: PitchTurfId) => void;
  // Animations
  unlockedAnimations: string[];
  animationConfig: AnimationConfig;
  onBuyAnimation: (animId: string) => void;
  onChangeAnimationConfig: (next: AnimationConfig) => void;
}

const RARITY_ORDER: SkillRarity[] = ['mythic', 'legendary', 'epic', 'rare', 'common'];

const AURA_COLORS: Record<AuraTrailId, string> = {
  none: 'transparent',
  spark: '#38BDF8',
  flame: '#F97316',
  frost: '#67E8F9',
  shadow: '#8B5CF6',
  ego: '#F43F5E',
};

export const UnifiedShopModal: React.FC<UnifiedShopModalProps> = ({
  open,
  initialTab = 'skills',
  onClose,
  t,
  coins,
  unlockedSkills,
  equippedSkills,
  lastOutcome,
  onOpenLootbox,
  onEquipSkill,
  onUnequipSlot,
  onClearOutcome,
  unlockedCosmetics,
  characterConfig,
  onBuyCosmetic,
  onChangeCharacterConfig,
  unlockedTurfs,
  selectedTurf,
  onBuyTurf,
  onSelectTurf,
  unlockedAnimations,
  animationConfig,
  onBuyAnimation,
  onChangeAnimationConfig,
}) => {
  const [shopTab, setShopTab] = useState<UnifiedShopTab>(initialTab);
  const [skillsSubTab, setSkillsSubTab] = useState<'lootboxes' | 'collection'>('lootboxes');
  const [rarityFilter, setRarityFilter] = useState<SkillRarity | 'all'>('all');
  const [openingAnim, setOpeningAnim] = useState<{
    tierId: LootboxTierId;
    phase: 'shaking' | 'burst' | 'reveal';
  } | null>(null);
  const animTimersRef = useRef<number[]>([]);

  // Character sub-state
  const [cosmeticTab, setCosmeticTab] = useState<CosmeticCategory>('hair');
  const [previewTeam, setPreviewTeam] = useState<Team>('blue');
  const charCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animations preview canvas state
  const animCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const goalPreviewPulseRef = useRef<{ startedAt: number }>({ startedAt: 0 });

  useEffect(() => {
    if (open) {
      setShopTab(initialTab);
    }
  }, [open, initialTab]);

  const clearAnimTimers = () => {
    for (const id of animTimersRef.current) {
      window.clearTimeout(id);
    }
    animTimersRef.current = [];
  };

  useEffect(() => {
    if (!open) {
      clearAnimTimers();
      setOpeningAnim(null);
    }
    return () => clearAnimTimers();
  }, [open]);

  // Character preview canvas loop
  useEffect(() => {
    if (!open || shopTab !== 'character') return;
    const canvas = charCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const renderPreview = (now: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const bg = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.55);
      bg.addColorStop(
        0,
        previewTeam === 'blue' ? 'rgba(37,99,235,0.28)' : 'rgba(220,38,38,0.28)'
      );
      bg.addColorStop(1, 'rgba(11,18,21,0.95)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.scale(2.3, 2.3);
      const cx = w / (2 * 2.3);
      const cy = h / (2 * 2.3) + 5;

      if (characterConfig.auraTrail !== 'none') {
        const pulse = 1 + Math.sin(now * 0.005) * 0.1;
        ctx.save();
        ctx.strokeStyle = AURA_COLORS[characterConfig.auraTrail];
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 25 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      drawPlayerCircle(
        ctx,
        cx,
        cy,
        previewTeam,
        characterConfig.jerseyNumber,
        -0.35 + Math.sin(now * 0.0018) * 0.18,
        false,
        false,
        characterConfig
      );
      ctx.restore();

      animId = requestAnimationFrame(renderPreview);
    };

    animId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(animId);
  }, [open, shopTab, characterConfig, previewTeam]);

  // Live Goal & Trail animation preview canvas loop
  useEffect(() => {
    if (!open || shopTab !== 'animations') return;
    const canvas = animCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    goalPreviewPulseRef.current.startedAt = performance.now();
    let animId = 0;

    const renderAnimPreview = (now: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Pitch backdrop
      ctx.fillStyle = '#0D261C';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      ctx.beginPath();
      ctx.moveTo(w / 2, 12);
      ctx.lineTo(w / 2, h - 12);
      ctx.stroke();

      // Right Goal box
      ctx.strokeStyle = '#F87171';
      ctx.lineWidth = 3;
      ctx.strokeRect(w - 28, h / 2 - 42, 16, 84);

      // Moving player showing trail animation
      const runCycle = ((now % 2200) / 2200);
      const px = 48 + runCycle * (w - 135);
      const py = h / 2 + Math.sin(now * 0.006) * 20;
      const trail = animationConfig.trailAnimation;

      ctx.save();
      if (trail === 'flame-dash') {
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = i % 2 === 0 ? 'rgba(249, 115, 22, 0.78)' : 'rgba(251, 191, 36, 0.72)';
          ctx.beginPath();
          ctx.arc(px - 18 - i * 11, py + Math.sin(now * 0.03 + i) * 3, Math.max(2.5, 8 - i * 1.2), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (trail === 'frost-nova') {
        ctx.strokeStyle = 'rgba(103, 232, 249, 0.9)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const tx = px - 20 - i * 12;
          ctx.beginPath();
          ctx.moveTo(tx, py - 6);
          ctx.lineTo(tx + 6, py);
          ctx.lineTo(tx, py + 6);
          ctx.lineTo(tx - 6, py);
          ctx.closePath();
          ctx.stroke();
        }
      } else if (trail === 'shadow-echo') {
        for (let i = 1; i <= 3; i++) {
          ctx.globalAlpha = 0.36 / i;
          ctx.fillStyle = '#8B5CF6';
          ctx.beginPath();
          ctx.arc(px - i * 15, py, 16, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (trail === 'gold-aura') {
        ctx.fillStyle = '#FBBF24';
        for (let i = 0; i < 6; i++) {
          const ang = now * 0.01 + (i * Math.PI * 2) / 6;
          ctx.beginPath();
          ctx.arc(px + Math.cos(ang) * 24, py + Math.sin(ang) * 24, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
        ctx.lineWidth = 2;
        for (const oy of [-7, 0, 7]) {
          ctx.beginPath();
          ctx.moveTo(px - 18, py + oy);
          ctx.lineTo(px - 34, py + oy);
          ctx.stroke();
        }
      }
      ctx.restore();

      drawPlayerCircle(
        ctx,
        px,
        py,
        'blue',
        characterConfig.jerseyNumber,
        0,
        false,
        false,
        characterConfig
      );

      // Goal celebration burst preview scaled by fieldAnimDurationMs
      const dur = Math.max(400, animationConfig.fieldAnimDurationMs);
      const elapsed = now - goalPreviewPulseRef.current.startedAt;
      const progress = (elapsed % (dur + 450)) / dur;
      if (progress <= 1) {
        const alpha = 1 - progress;
        const gx = w - 28;
        const gy = h / 2;
        const gKind = animationConfig.goalAnimation;
        ctx.save();
        ctx.globalAlpha = alpha;
        if (gKind === 'lightning') {
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 3;
          for (let b = 0; b < 5; b++) {
            const ang = (b * Math.PI * 2) / 5 + 0.3;
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.lineTo(gx + Math.cos(ang) * (progress * 85), gy + Math.sin(ang) * (progress * 85));
            ctx.stroke();
          }
        } else if (gKind === 'supernova') {
          const rad = 16 + progress * 95;
          const g = ctx.createRadialGradient(gx, gy, 2, gx, gy, rad);
          g.addColorStop(0, '#FDE047');
          g.addColorStop(0.5, '#EC4899');
          g.addColorStop(1, 'rgba(236, 72, 153, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(gx, gy, rad, 0, Math.PI * 2);
          ctx.fill();
        } else if (gKind === 'matrix') {
          ctx.fillStyle = '#34D399';
          for (let m = 0; m < 12; m++) {
            ctx.fillRect(
              gx - 65 + (m % 4) * 18,
              18 + ((m * 29 + progress * 120) % (h - 40)),
              4,
              12
            );
          }
        } else if (gKind === 'fireworks') {
          for (let r = 0; r < 10; r++) {
            const ang = (r * Math.PI * 2) / 10;
            const d = progress * 80;
            ctx.fillStyle = r % 2 === 0 ? '#FBBF24' : '#EC4899';
            ctx.beginPath();
            ctx.arc(gx + Math.cos(ang) * d, gy + Math.sin(ang) * d, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.strokeStyle = '#60A5FA';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(gx, gy, 14 + progress * 76, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(renderAnimPreview);
    };

    animId = requestAnimationFrame(renderAnimPreview);
    return () => cancelAnimationFrame(animId);
  }, [open, shopTab, animationConfig, characterConfig]);

  if (!open) return null;

  const handleOpenCrateClick = (tierId: LootboxTierId) => {
    clearAnimTimers();
    onOpenLootbox(tierId);

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const totalMs = Math.max(0, animationConfig.lootboxAnimDurationMs);
    if (reducedMotion || totalMs < 80) {
      setOpeningAnim({ tierId, phase: 'reveal' });
      return;
    }

    const shakeMs = Math.round(totalMs * 0.74);
    setOpeningAnim({ tierId, phase: 'shaking' });
    const t1 = window.setTimeout(() => {
      setOpeningAnim({ tierId, phase: 'burst' });
    }, shakeMs);
    const t2 = window.setTimeout(() => {
      setOpeningAnim({ tierId, phase: 'reveal' });
    }, totalMs);
    animTimersRef.current = [t1, t2];
  };

  const handleSkipAnimation = () => {
    clearAnimTimers();
    if (openingAnim) {
      setOpeningAnim({ ...openingAnim, phase: 'reveal' });
    }
  };

  const slot1Skill = equippedSkills[0] ? getSkillById(equippedSkills[0]) : undefined;
  const slot2Skill = equippedSkills[1] ? getSkillById(equippedSkills[1]) : undefined;
  const sortedCatalog = [...SKILLS_CATALOG].sort((a, b) => {
    const rDiff = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
    return rDiff !== 0 ? rDiff : a.number - b.number;
  });
  const filteredCatalog =
    rarityFilter === 'all'
      ? sortedCatalog
      : sortedCatalog.filter((s) => s.rarity === rarityFilter);

  const animBoxTier = openingAnim
    ? LOOTBOX_TIERS.find((b) => b.id === openingAnim.tierId) ?? LOOTBOX_TIERS[0]
    : null;
  const isAnimatingOverlay = Boolean(openingAnim && lastOutcome);
  const shakeDurationMs = Math.max(120, Math.round(animationConfig.lootboxAnimDurationMs * 0.74));
  const burstDurationMs = Math.max(100, Math.round(animationConfig.lootboxAnimDurationMs * 0.26));

  const cosmeticTabs: Array<{ id: CosmeticCategory; label: string }> = [
    { id: 'hair', label: t.hairTab },
    { id: 'color', label: t.colorTab },
    { id: 'pattern', label: t.patternTab },
    { id: 'aura', label: t.auraTab },
    { id: 'cleat', label: t.cleatTab },
  ];
  const cosmeticItems = CHARACTER_COSMETICS.filter((c) => c.category === cosmeticTab);

  const isCosmeticEquipped = (item: CosmeticItem): boolean => {
    switch (item.category) {
      case 'hair':
        return characterConfig.hairStyle === item.value;
      case 'color':
        return characterConfig.hairColor === item.value;
      case 'pattern':
        return characterConfig.jerseyPattern === item.value;
      case 'aura':
        return characterConfig.auraTrail === item.value;
      case 'cleat':
        return characterConfig.cleatColor === item.value;
    }
  };

  const equipCosmetic = (item: CosmeticItem) => {
    switch (item.category) {
      case 'hair':
        onChangeCharacterConfig({ ...characterConfig, hairStyle: item.value as HairStyleId });
        break;
      case 'color':
        onChangeCharacterConfig({ ...characterConfig, hairColor: item.value });
        break;
      case 'pattern':
        onChangeCharacterConfig({
          ...characterConfig,
          jerseyPattern: item.value as JerseyPatternId,
        });
        break;
      case 'aura':
        onChangeCharacterConfig({ ...characterConfig, auraTrail: item.value as AuraTrailId });
        break;
      case 'cleat':
        onChangeCharacterConfig({ ...characterConfig, cleatColor: item.value });
        break;
    }
  };

  const renderAnimationCard = (item: AnimationItem) => {
    const owned = item.price === 0 || unlockedAnimations.includes(item.id);
    const equipped =
      item.kind === 'goal'
        ? animationConfig.goalAnimation === item.value
        : animationConfig.trailAnimation === item.value;
    const canAfford = coins >= item.price;

    return (
      <div
        key={item.id}
        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
          equipped
            ? 'bg-emerald-500/12 border-emerald-400/75 shadow-[0_0_20px_rgba(16,185,129,0.16)]'
            : 'bg-[#111C21] border-white/10'
        }`}
      >
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: `${item.accentColor}28` }}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-white truncate">
                  {t.animNames[item.id] ?? item.value}
                </div>
                <div className="text-[11px] font-bold">
                  {item.price === 0 ? (
                    <span className="text-emerald-300">{t.freeLabel}</span>
                  ) : (
                    <span className="text-amber-300 font-mono-num flex items-center gap-1">
                      <Coins className="w-3 h-3" />
                      {item.price}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {equipped && (
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase shrink-0">
                {t.equippedBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 leading-snug">
            {t.animDescs[item.id] ?? ''}
          </p>
        </div>

        {owned ? (
          <button
            type="button"
            disabled={equipped}
            onClick={() => {
              if (item.kind === 'goal') {
                onChangeAnimationConfig({
                  ...animationConfig,
                  goalAnimation: item.value as GoalAnimationId,
                });
                goalPreviewPulseRef.current.startedAt = performance.now();
              } else {
                onChangeAnimationConfig({
                  ...animationConfig,
                  trailAnimation: item.value as TrailAnimationId,
                });
              }
            }}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              equipped
                ? 'bg-emerald-500/20 text-emerald-200 cursor-default'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{equipped ? t.equippedBadge : t.equipBtn}</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={!canAfford}
            onClick={() => onBuyAnimation(item.id)}
            className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap ${
              canAfford
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
            }`}
          >
            {canAfford ? (
              <ShoppingBag className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>
              {canAfford ? `${t.buyBtn} (${item.price})` : `${t.insufficientCoins} (${item.price})`}
            </span>
          </button>
        )}
      </div>
    );
  };

  const mainTabs: Array<{
    id: UnifiedShopTab;
    label: string;
    icon: React.ReactNode;
    activeClass: string;
  }> = [
    {
      id: 'skills',
      label: t.tabSkills,
      icon: <Zap className="w-4 h-4" />,
      activeClass: 'bg-rose-500 text-white',
    },
    {
      id: 'character',
      label: t.tabCharacter,
      icon: <UserCheck className="w-4 h-4" />,
      activeClass: 'bg-sky-500 text-slate-950',
    },
    {
      id: 'turfs',
      label: t.tabTurfs,
      icon: <Palette className="w-4 h-4" />,
      activeClass: 'bg-emerald-500 text-slate-950',
    },
    {
      id: 'animations',
      label: t.tabAnimations,
      icon: <Film className="w-4 h-4" />,
      activeClass: 'bg-amber-400 text-slate-950',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-modal-backdrop">
      <div className="relative w-full max-w-4xl max-h-[92dvh] flex flex-col bg-[#0E171B] border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-modal-enter">
        {/* Sticky Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-white/10 bg-[#0E171B] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/45 text-amber-300 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-tight truncate">
                {t.unifiedShopTitle}
              </h2>
              <p className="text-xs text-slate-400 truncate">{t.unifiedShopSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 font-bold text-sm flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-300" />
              <span className="font-mono-num">{coins}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Category Navigation */}
        <div className="px-4 sm:px-5 py-2.5 bg-[#0B1215] border-b border-white/10 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setShopTab(tab.id)}
                className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  shopTab === tab.id
                    ? tab.activeClass
                    : 'bg-[#111C21] text-slate-300 hover:text-white hover:bg-white/5 border border-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          {/* ---------------- TAB 1: SKILLS & LOOTBOXES ---------------- */}
          {shopTab === 'skills' && (
            <div key="tab-skills" className="space-y-5 animate-modal-tab">
              <div className="p-4 rounded-xl bg-[#0B1215] border border-white/10 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.equippedSlotsTitle}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    {t.skillsOwnedLabel}:{' '}
                    <span className="font-mono-num text-emerald-300">
                      {unlockedSkills.length}/{SKILLS_CATALOG.length}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { idx: 0 as const, keyHint: 'Z', skill: slot1Skill },
                    { idx: 1 as const, keyHint: 'X', skill: slot2Skill },
                  ].map((slot) => {
                    const meta = slot.skill ? RARITY_META[slot.skill.rarity] : null;
                    return (
                      <div
                        key={slot.idx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 ${
                          slot.skill && meta
                            ? `${meta.bgClass} ${meta.borderClass}`
                            : 'bg-[#111C21] border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-black/40 border border-white/15 font-mono-num text-xs font-extrabold text-amber-300 flex items-center justify-center shrink-0">
                            {slot.keyHint}
                          </span>
                          {slot.skill ? (
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base leading-none">{slot.skill.icon}</span>
                                <span className="font-bold text-sm text-white truncate">
                                  {slot.skill.name}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-300 flex items-center gap-2">
                                <span className={meta?.textClass}>
                                  {t.rarityLabels[slot.skill.rarity]}
                                </span>
                                <span>· {slot.skill.cooldown}s CD</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400">
                              {t.slotLabel} {slot.idx + 1} ({slot.keyHint}) — {t.skillSlotEmpty}
                            </div>
                          )}
                        </div>
                        {slot.skill && (
                          <button
                            type="button"
                            onClick={() => onUnequipSlot(slot.idx)}
                            title={t.unequipBtn}
                            className="p-1.5 rounded-lg bg-black/30 hover:bg-red-500/25 text-slate-300 hover:text-red-200 cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {lastOutcome && (!openingAnim || openingAnim.phase === 'reveal') && (
                <div
                  className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                    RARITY_META[lastOutcome.skill.rarity].bgClass
                  } ${RARITY_META[lastOutcome.skill.rarity].borderClass}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-2xl shrink-0">
                      {lastOutcome.skill.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                        {lastOutcome.isDuplicate
                          ? formatT(t.boxResultDuplicate, { coins: lastOutcome.refundCoins })
                          : t.boxResultNew}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display text-xl font-extrabold text-white">
                          {lastOutcome.skill.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                            RARITY_META[lastOutcome.skill.rarity].bgClass
                          } ${RARITY_META[lastOutcome.skill.rarity].borderClass} ${
                            RARITY_META[lastOutcome.skill.rarity].textClass
                          }`}
                        >
                          {t.rarityLabels[lastOutcome.skill.rarity]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-0.5">{lastOutcome.skill.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onEquipSkill(lastOutcome.skill.id, 0)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer whitespace-nowrap"
                    >
                      {t.equipSlot1}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEquipSkill(lastOutcome.skill.id, 1)}
                      className="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer whitespace-nowrap"
                    >
                      {t.equipSlot2}
                    </button>
                    {onClearOutcome && (
                      <button
                        type="button"
                        onClick={onClearOutcome}
                        className="p-1.5 rounded-lg bg-black/30 text-slate-300 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 p-1 rounded-xl bg-[#0B1215] border border-white/10">
                <button
                  type="button"
                  onClick={() => setSkillsSubTab('lootboxes')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                    skillsSubTab === 'lootboxes'
                      ? 'bg-purple-500 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <PackageOpen className="w-4 h-4" />
                  <span>{t.lootboxTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSkillsSubTab('collection')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                    skillsSubTab === 'collection'
                      ? 'bg-purple-500 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{t.mySkillsTab}</span>
                </button>
              </div>

              {skillsSubTab === 'lootboxes' ? (
                <div key="sub-lootboxes" className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-modal-tab">
                  {LOOTBOX_TIERS.map((box) => {
                    const canAfford = coins >= box.price;
                    return (
                      <div
                        key={box.id}
                        className="p-4 rounded-2xl bg-[#111C21] border border-white/12 flex flex-col justify-between gap-4"
                        style={{ boxShadow: `0 12px 32px -12px ${box.accentColor}40` }}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20"
                              style={{
                                backgroundColor: `${box.accentColor}28`,
                                color: box.accentColor,
                              }}
                            >
                              <Box className="w-5 h-5" />
                            </div>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-200 font-mono-num text-xs font-extrabold flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 text-amber-300" />
                              {box.price}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-display text-xl font-extrabold text-white">
                              {t.lootboxNames[box.id]}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">{t.lootboxDescs[box.id]}</p>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-white/10">
                            {RARITY_ORDER.slice()
                              .reverse()
                              .map((r) => {
                                const pct = box.weights[r];
                                if (pct <= 0) return null;
                                const meta = RARITY_META[r];
                                return (
                                  <div key={r} className="flex items-center justify-between text-xs">
                                    <span className={`font-semibold ${meta.textClass}`}>
                                      {t.rarityLabels[r]}
                                    </span>
                                    <span className="font-mono-num font-bold text-slate-200">
                                      {pct}%
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={
                            !canAfford || (openingAnim !== null && openingAnim.phase !== 'reveal')
                          }
                          onClick={() => handleOpenCrateClick(box.id)}
                          className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                            canAfford
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                              : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                          }`}
                        >
                          <PackageOpen className="w-4 h-4" />
                          <span>{canAfford ? t.openBoxBtn : t.insufficientCoins}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div key="sub-collection" className="space-y-4 animate-modal-tab">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRarityFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
                        rarityFilter === 'all'
                          ? 'bg-white text-slate-950 border-white'
                          : 'bg-[#0B1215] border-white/10 text-slate-300'
                      }`}
                    >
                      {t.allRaritiesLabel} (20)
                    </button>
                    {RARITY_ORDER.map((r) => {
                      const meta = RARITY_META[r];
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRarityFilter(r)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
                            rarityFilter === r
                              ? `${meta.bgClass} ${meta.borderClass} ${meta.textClass}`
                              : 'bg-[#0B1215] border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t.rarityLabels[r]}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredCatalog.map((skill) => {
                      const owned = unlockedSkills.includes(skill.id);
                      const slotIndex = equippedSkills.indexOf(skill.id);
                      const meta = RARITY_META[skill.rarity];
                      return (
                        <div
                          key={skill.id}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 ${
                            owned
                              ? `${meta.bgClass} ${meta.borderClass}`
                              : 'bg-[#111C21]/70 border-white/10 opacity-75'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-lg shrink-0">
                                {skill.icon}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono-num text-[10px] text-slate-400">
                                    #{skill.number}
                                  </span>
                                  <span className="font-bold text-sm text-white truncate">
                                    {skill.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px]">
                                  <span className={`font-bold ${meta.textClass}`}>
                                    {t.rarityLabels[skill.rarity]}
                                  </span>
                                  <span className="text-slate-400">· CD {skill.cooldown}s</span>
                                </div>
                              </div>
                            </div>
                            {slotIndex >= 0 && (
                              <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase shrink-0 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {slotIndex === 0 ? 'Z (1)' : 'X (2)'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {skill.description}
                          </p>
                          {owned ? (
                            <div className="flex items-center gap-2 pt-1.5 border-t border-white/10">
                              <button
                                type="button"
                                onClick={() => onEquipSkill(skill.id, 0)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                                  slotIndex === 0
                                    ? 'bg-emerald-500 text-slate-950'
                                    : 'bg-white/10 hover:bg-emerald-500/30 text-white'
                                }`}
                              >
                                {t.equipSlot1}
                              </button>
                              <button
                                type="button"
                                onClick={() => onEquipSkill(skill.id, 1)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                                  slotIndex === 1
                                    ? 'bg-sky-500 text-slate-950'
                                    : 'bg-white/10 hover:bg-sky-500/30 text-white'
                                }`}
                              >
                                {t.equipSlot2}
                              </button>
                            </div>
                          ) : (
                            <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Lootbox
                              </span>
                              <button
                                type="button"
                                onClick={() => setSkillsSubTab('lootboxes')}
                                className="text-amber-300 hover:underline font-bold cursor-pointer whitespace-nowrap"
                              >
                                {t.openBoxBtn} →
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------- TAB 2: PERSONALIZAÇÃO (CHARACTER) ---------------- */}
          {shopTab === 'character' && (
            <div key="tab-character" className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-modal-tab">
              <div className="md:col-span-4 space-y-3">
                <div className="rounded-2xl bg-[#0B1215] border border-white/10 p-3 flex flex-col items-center gap-3">
                  <canvas
                    ref={charCanvasRef}
                    width={220}
                    height={200}
                    className="w-[180px] h-[164px] rounded-xl border border-white/10"
                  />
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() => setPreviewTeam('blue')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                        previewTeam === 'blue'
                          ? 'bg-blue-500/25 border-blue-400 text-blue-200'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {t.blueTeam}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewTeam('red')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                        previewTeam === 'red'
                          ? 'bg-red-500/25 border-red-400 text-red-200'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      {t.redTeam}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-[#0B1215] border border-white/10 p-3 space-y-2">
                  <div className="text-xs font-bold text-slate-300 text-center">
                    {t.jerseyNumberLabel}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onChangeCharacterConfig({
                          ...characterConfig,
                          jerseyNumber: Math.max(1, characterConfig.jerseyNumber - 1),
                        })
                      }
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={characterConfig.jerseyNumber}
                      onChange={(e) =>
                        onChangeCharacterConfig({
                          ...characterConfig,
                          jerseyNumber: Math.max(1, Math.min(99, Math.floor(Number(e.target.value)) || 1)),
                        })
                      }
                      className="w-16 py-1.5 rounded-lg bg-[#111C21] border border-white/15 text-center font-mono-num text-base font-extrabold text-white focus:outline-none focus:border-sky-400"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onChangeCharacterConfig({
                          ...characterConfig,
                          jerseyNumber: Math.min(99, characterConfig.jerseyNumber + 1),
                        })
                      }
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 space-y-4">
                <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#0B1215] border border-white/10">
                  {cosmeticTabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setCosmeticTab(tab.id)}
                      className={`flex-1 min-w-[74px] py-2 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                        cosmeticTab === tab.id
                          ? 'bg-sky-500 text-slate-950'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div key={cosmeticTab} className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-modal-tab">
                  {cosmeticItems.map((item) => {
                    const owned = item.price === 0 || unlockedCosmetics.includes(item.id);
                    const equipped = isCosmeticEquipped(item);
                    const canAfford = coins >= item.price;
                    const label = t.cosmeticNames[item.id] ?? item.value;

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                          equipped
                            ? 'bg-sky-500/12 border-sky-400/70 shadow-[0_0_18px_rgba(56,189,248,0.16)]'
                            : 'bg-[#111C21] border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.previewHex ? (
                              <span
                                className="w-6 h-6 rounded-full border border-white/35 shrink-0"
                                style={{ backgroundColor: item.previewHex }}
                              />
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                              </span>
                            )}
                            <span className="font-bold text-sm text-white truncate">{label}</span>
                          </div>
                          {equipped && (
                            <span className="px-2 py-0.5 rounded bg-sky-500 text-slate-950 text-[10px] font-extrabold uppercase shrink-0">
                              {t.equippedBadge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                          <div className="text-xs font-bold flex items-center gap-1">
                            {item.price === 0 ? (
                              <span className="text-emerald-300">{t.freeLabel}</span>
                            ) : (
                              <span className="text-amber-300 flex items-center gap-1 font-mono-num">
                                <Coins className="w-3.5 h-3.5" />
                                {item.price}
                              </span>
                            )}
                          </div>
                          {owned ? (
                            <button
                              type="button"
                              disabled={equipped}
                              onClick={() => equipCosmetic(item)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap ${
                                equipped
                                  ? 'bg-sky-500/20 text-sky-200 cursor-default'
                                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{equipped ? t.equippedBadge : t.equipBtn}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!canAfford}
                              onClick={() => onBuyCosmetic(item.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                                canAfford
                                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                                  : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                              }`}
                            >
                              <Lock className="w-3 h-3" />
                              <span>{canAfford ? t.buyBtn : t.insufficientCoins}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- TAB 3: TEXTURAS DO CAMPO (TURFS) ---------------- */}
          {shopTab === 'turfs' && (
            <div key="tab-turfs" className="space-y-4 animate-modal-tab">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-2.5 text-xs text-amber-100">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>{t.multiplayerCoinsHint}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {PITCH_TURFS.map((turf) => {
                  const owned = unlockedTurfs.includes(turf.id);
                  const equipped = selectedTurf === turf.id;
                  const canAfford = coins >= turf.price;

                  return (
                    <div
                      key={turf.id}
                      className={`rounded-xl border overflow-hidden flex flex-col justify-between transition-all ${
                        equipped
                          ? 'bg-emerald-500/10 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                          : owned
                          ? 'bg-[#0B1215]/90 border-white/15'
                          : 'bg-[#0B1215]/75 border-white/10'
                      }`}
                    >
                      <div
                        className="relative h-24 w-full border-b border-white/10 flex items-center justify-center overflow-hidden"
                        style={{ background: turf.previewGradient }}
                      >
                        <div
                          className="w-[84%] h-[74%] border-2 relative flex items-center justify-center"
                          style={{ borderColor: turf.lineColor }}
                        >
                          <div
                            className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2"
                            style={{ backgroundColor: turf.lineColor }}
                          />
                          <div
                            className="w-9 h-9 rounded-full border-2"
                            style={{ borderColor: turf.lineColor }}
                          />
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/65 text-xs font-bold text-white flex items-center gap-1">
                          <span>{turf.badgeEmoji}</span>
                          {equipped && (
                            <span className="text-emerald-300 text-[10px] uppercase tracking-wider">
                              · {t.equippedBadge}
                            </span>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-xs font-mono-num font-bold text-amber-300 flex items-center gap-1">
                          {turf.price === 0 ? (
                            <span className="text-emerald-300">{t.freeLabel}</span>
                          ) : (
                            <>
                              <Coins className="w-3 h-3" />
                              <span>{turf.price}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white">{t.turfNames[turf.id]}</h3>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                            {t.turfDescs[turf.id]}
                          </p>
                        </div>

                        {equipped ? (
                          <button
                            type="button"
                            disabled
                            className="w-full py-2 px-3 rounded-lg bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{t.equippedBadge}</span>
                          </button>
                        ) : owned ? (
                          <button
                            type="button"
                            onClick={() => onSelectTurf(turf.id)}
                            className="w-full py-2 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <span>{t.equipBtn}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={!canAfford}
                            onClick={() => onBuyTurf(turf.id)}
                            className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                              canAfford
                                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer'
                                : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {canAfford ? (
                              <ShoppingBag className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {canAfford
                                ? `${t.buyBtn} (${turf.price})`
                                : `${t.insufficientCoins} (${turf.price})`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ---------------- TAB 4: ANIMAÇÕES & TEMPOS CUSTOMIZÁVEIS ---------------- */}
          {shopTab === 'animations' && (
            <div key="tab-animations" className="space-y-5 animate-modal-tab">
              {/* Preview + Timing Controls Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-[#0B1215] border border-white/10 rounded-2xl p-4">
                <div className="lg:col-span-5 flex flex-col gap-2.5">
                  <canvas
                    ref={animCanvasRef}
                    width={320}
                    height={160}
                    className="w-full h-36 sm:h-40 rounded-xl border border-white/10 bg-[#0D261C]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      goalPreviewPulseRef.current.startedAt = performance.now();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{t.testAnimationBtn}</span>
                  </button>
                </div>

                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-extrabold text-white">
                      {t.animationsTitle}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        const def = createDefaultAnimationConfig();
                        onChangeAnimationConfig({
                          ...animationConfig,
                          fieldAnimDurationMs: def.fieldAnimDurationMs,
                          lootboxAnimDurationMs: def.lootboxAnimDurationMs,
                          uiAnimDurationMs: def.uiAnimDurationMs,
                        });
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-bold text-slate-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{t.animResetTimingBtn}</span>
                    </button>
                  </div>

                  {/* Field Animation Duration */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span>{t.animFieldDurationLabel}</span>
                      <span className="font-mono-num text-emerald-300">
                        {animationConfig.fieldAnimDurationMs} ms
                      </span>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={3500}
                      step={50}
                      value={animationConfig.fieldAnimDurationMs}
                      onChange={(e) =>
                        onChangeAnimationConfig({
                          ...animationConfig,
                          fieldAnimDurationMs: Number(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  {/* Lootbox Animation Duration */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span>{t.animLootboxDurationLabel}</span>
                      <span className="font-mono-num text-purple-300">
                        {animationConfig.lootboxAnimDurationMs} ms
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2500}
                      step={50}
                      value={animationConfig.lootboxAnimDurationMs}
                      onChange={(e) =>
                        onChangeAnimationConfig({
                          ...animationConfig,
                          lootboxAnimDurationMs: Number(e.target.value),
                        })
                      }
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>

                  {/* UI / Menu Animation Duration */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                      <span>{t.animUiDurationLabel}</span>
                      <span className="font-mono-num text-amber-300">
                        {animationConfig.uiAnimDurationMs} ms
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={800}
                      step={20}
                      value={animationConfig.uiAnimDurationMs}
                      onChange={(e) =>
                        onChangeAnimationConfig({
                          ...animationConfig,
                          uiAnimDurationMs: Number(e.target.value),
                        })
                      }
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Goal Celebrations Catalog */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  {t.goalAnimationsLabel}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {GOAL_ANIMATIONS.map(renderAnimationCard)}
                </div>
              </div>

              {/* Movement / Sprint Trails Catalog */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  {t.trailAnimationsLabel}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TRAIL_ANIMATIONS.map(renderAnimationCard)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lootbox Opening Stage Overlay */}
        {isAnimatingOverlay && animBoxTier && lastOutcome && openingAnim && (
          <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-modal-backdrop">
            {openingAnim.phase !== 'reveal' ? (
              <div className="relative flex flex-col items-center gap-5 text-center max-w-xs w-full">
                <div className="relative flex items-center justify-center w-40 h-40">
                  <div
                    className="absolute inset-0 rounded-full blur-2xl opacity-70"
                    style={{
                      backgroundColor:
                        openingAnim.phase === 'burst'
                          ? lastOutcome.skill.color
                          : animBoxTier.accentColor,
                    }}
                  />
                  {openingAnim.phase === 'burst' && (
                    <div
                      className="absolute w-32 h-32 rounded-full border-4 animate-lootbox-burst"
                      style={{
                        borderColor: lastOutcome.skill.color,
                        backgroundColor: `${lastOutcome.skill.color}55`,
                        animationDuration: `${burstDurationMs}ms`,
                      }}
                    />
                  )}
                  <div
                    className={`relative w-28 h-28 rounded-3xl border-2 flex items-center justify-center shadow-2xl ${
                      openingAnim.phase === 'shaking'
                        ? 'animate-lootbox-shake'
                        : 'scale-110 opacity-0 transition-all duration-200'
                    }`}
                    style={{
                      backgroundColor: '#111C21',
                      borderColor: animBoxTier.accentColor,
                      boxShadow: `0 0 40px ${animBoxTier.accentColor}70`,
                      animationDuration: `${shakeDurationMs}ms`,
                    }}
                  >
                    <PackageOpen
                      className="w-14 h-14"
                      style={{ color: animBoxTier.accentColor }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-display text-2xl font-extrabold text-white tracking-wide">
                    {t.lootboxOpeningTitle}
                  </div>
                  <div className="text-xs font-semibold text-slate-300">
                    {t.lootboxNames[animBoxTier.id]}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSkipAnimation}
                  className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-slate-200 cursor-pointer whitespace-nowrap"
                >
                  {t.lootboxSkipBtn}
                </button>
              </div>
            ) : (
              <div
                className={`relative w-full max-w-md rounded-2xl border-2 p-6 bg-[#111C21] shadow-2xl text-center space-y-4 animate-lootbox-reveal ${
                  RARITY_META[lastOutcome.skill.rarity].borderClass
                }`}
                style={{
                  boxShadow: `0 0 50px -10px ${lastOutcome.skill.color}88`,
                }}
              >
                <div className="text-xs font-extrabold uppercase tracking-widest text-amber-300">
                  {lastOutcome.isDuplicate
                    ? formatT(t.boxResultDuplicate, { coins: lastOutcome.refundCoins })
                    : t.boxResultNew}
                </div>
                <div
                  className={`w-20 h-20 mx-auto rounded-2xl border-2 flex items-center justify-center text-4xl shadow-lg ${
                    RARITY_META[lastOutcome.skill.rarity].bgClass
                  } ${RARITY_META[lastOutcome.skill.rarity].borderClass}`}
                >
                  {lastOutcome.skill.icon}
                </div>
                <div className="space-y-1.5">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase border ${
                      RARITY_META[lastOutcome.skill.rarity].bgClass
                    } ${RARITY_META[lastOutcome.skill.rarity].borderClass} ${
                      RARITY_META[lastOutcome.skill.rarity].textClass
                    }`}
                  >
                    {t.rarityLabels[lastOutcome.skill.rarity]}
                  </span>
                  <h3 className="font-display text-3xl font-extrabold text-white">
                    {lastOutcome.skill.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {lastOutcome.skill.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onEquipSkill(lastOutcome.skill.id, 0);
                      setOpeningAnim(null);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs cursor-pointer whitespace-nowrap"
                  >
                    {t.equipSlot1}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onEquipSkill(lastOutcome.skill.id, 1);
                      setOpeningAnim(null);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs cursor-pointer whitespace-nowrap"
                  >
                    {t.equipSlot2}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setOpeningAnim(null)}
                  className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 cursor-pointer whitespace-nowrap"
                >
                  {t.lootboxContinueBtn}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
