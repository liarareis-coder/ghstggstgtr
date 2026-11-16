import React, { useEffect, useRef, useState } from 'react';
import { Box, Check, Coins, Lock, PackageOpen, Sparkles, Trash2, X, Zap } from 'lucide-react';
import { formatT, type Language, type TranslationDict } from '../i18n/translations.ts';
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

interface SkillLootboxModalProps {
  open: boolean;
  onClose: () => void;
  t: TranslationDict;
  lang: Language;
  coins: number;
  unlockedSkills: SkillId[];
  equippedSkills: SkillId[];
  lastOutcome: LootboxRollOutcome | null;
  onOpenLootbox: (tierId: LootboxTierId) => void;
  onEquipSkill: (skillId: SkillId, slotIdx: 0 | 1) => void;
  onUnequipSlot: (slotIdx: 0 | 1) => void;
  onClearOutcome?: () => void;
}

const RARITY_ORDER: SkillRarity[] = ['mythic', 'legendary', 'epic', 'rare', 'common'];

export const SkillLootboxModal: React.FC<SkillLootboxModalProps> = ({
  open,
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
}) => {
  const [activeTab, setActiveTab] = useState<'lootboxes' | 'collection'>('lootboxes');
  const [rarityFilter, setRarityFilter] = useState<SkillRarity | 'all'>('all');
  const [openingAnim, setOpeningAnim] = useState<{
    tierId: LootboxTierId;
    phase: 'shaking' | 'burst' | 'reveal';
  } | null>(null);
  const animTimersRef = useRef<number[]>([]);

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

  const handleOpenCrateClick = (tierId: LootboxTierId) => {
    clearAnimTimers();
    onOpenLootbox(tierId);

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setOpeningAnim({ tierId, phase: 'reveal' });
      return;
    }

    setOpeningAnim({ tierId, phase: 'shaking' });
    const t1 = window.setTimeout(() => {
      setOpeningAnim({ tierId, phase: 'burst' });
    }, 800);
    const t2 = window.setTimeout(() => {
      setOpeningAnim({ tierId, phase: 'reveal' });
    }, 1060);
    animTimersRef.current = [t1, t2];
  };

  const handleSkipAnimation = () => {
    clearAnimTimers();
    if (openingAnim) {
      setOpeningAnim({ ...openingAnim, phase: 'reveal' });
    }
  };

  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-modal-backdrop">
      <div className="relative w-full max-w-4xl max-h-[90dvh] overflow-y-auto bg-[#0E171B] border border-white/15 rounded-2xl shadow-2xl animate-modal-enter">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-[#0E171B]/95 backdrop-blur-xs px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/45 text-purple-300 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {t.skillsModalTitle}
              </h2>
              <p className="text-xs text-slate-400">{t.skillsModalSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-200">
              {t.skillsOwnedLabel}:{' '}
              <span className="font-mono-num text-emerald-300">
                {unlockedSkills.length}/{SKILLS_CATALOG.length}
              </span>
            </div>
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

        <div className="p-5 space-y-5">
          {/* Equipped Skills Slots Bar (Z & X) */}
          <div className="p-4 rounded-xl bg-[#0B1215] border border-white/10 space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.equippedSlotsTitle}</span>
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

          {/* Latest Lootbox Roll Result Reveal (hidden while opening animation is playing) */}
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
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  {t.equipSlot1}
                </button>
                <button
                  type="button"
                  onClick={() => onEquipSkill(lastOutcome.skill.id, 1)}
                  className="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs cursor-pointer"
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

          {/* Mode Tabs */}
          <div className="flex gap-2 p-1 rounded-xl bg-[#0B1215] border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('lootboxes')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'lootboxes'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <PackageOpen className="w-4 h-4" />
              <span>{t.lootboxTab}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('collection')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'collection'
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{t.mySkillsTab}</span>
            </button>
          </div>

          {activeTab === 'lootboxes' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          style={{ backgroundColor: `${box.accentColor}28`, color: box.accentColor }}
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

                      {/* Drop Rates */}
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
                      disabled={!canAfford || (openingAnim !== null && openingAnim.phase !== 'reveal')}
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
            <div className="space-y-4">
              {/* Rarity filter chips */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setRarityFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
                    rarityFilter === 'all'
                      ? 'bg-white text-slate-950 border-white'
                      : 'bg-[#0B1215] border-white/10 text-slate-300'
                  }`}
                >
                  Todas (20)
                </button>
                {RARITY_ORDER.map((r) => {
                  const meta = RARITY_META[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRarityFilter(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${
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

                      <p className="text-xs text-slate-300 leading-relaxed">{skill.description}</p>

                      {owned ? (
                        <div className="flex items-center gap-2 pt-1.5 border-t border-white/10">
                          <button
                            type="button"
                            onClick={() => onEquipSkill(skill.id, 0)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
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
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
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
                            onClick={() => setActiveTab('lootboxes')}
                            className="text-amber-300 hover:underline font-bold cursor-pointer"
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
                      }}
                    />
                  )}
                  <div
                    className={`relative w-28 h-28 rounded-3xl border-2 flex items-center justify-center shadow-2xl ${
                      openingAnim.phase === 'shaking' ? 'animate-lootbox-shake' : 'scale-110 opacity-0 transition-all duration-200'
                    }`}
                    style={{
                      backgroundColor: '#111C21',
                      borderColor: animBoxTier.accentColor,
                      boxShadow: `0 0 40px ${animBoxTier.accentColor}70`,
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
