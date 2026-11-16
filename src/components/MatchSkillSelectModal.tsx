import React, { useEffect, useMemo, useState } from 'react';
import { Check, Lock, Play, Shuffle, Trash2, Users, X, Zap } from 'lucide-react';
import type { TranslationDict } from '../i18n/translations.ts';
import {
  ALL_SKILL_IDS,
  getSkillById,
  RARITY_META,
  SKILLS_CATALOG,
  type SkillId,
  type SkillRarity,
} from '../shared/skills.ts';

type DraftMode = '1p' | '2p' | 'training' | 'online';

interface MatchSkillSelectModalProps {
  open: boolean;
  mode: DraftMode;
  p1Name: string;
  p2Name?: string;
  initialP1Skills: SkillId[];
  initialP2Skills?: SkillId[];
  unlockedSkills?: SkillId[];
  t: TranslationDict;
  onCancel: () => void;
  onConfirm: (p1Skills: SkillId[], p2Skills: SkillId[]) => void;
  onOpenLootboxes?: () => void;
}

const RARITY_ORDER: SkillRarity[] = ['mythic', 'legendary', 'epic', 'rare', 'common'];

function toTwoSlotTuple(list: SkillId[] | undefined, allowed?: Set<SkillId>): [SkillId | null, SkillId | null] {
  const clean: SkillId[] = [];
  if (Array.isArray(list)) {
    for (const id of list) {
      if (allowed && !allowed.has(id)) continue;
      if (!clean.includes(id)) {
        clean.push(id);
        if (clean.length >= 2) break;
      }
    }
  }
  return [clean[0] ?? null, clean[1] ?? null];
}

function compactSlots(slots: [SkillId | null, SkillId | null]): SkillId[] {
  const res: SkillId[] = [];
  if (slots[0]) res.push(slots[0]);
  if (slots[1] && slots[1] !== slots[0]) res.push(slots[1]);
  return res;
}

export const MatchSkillSelectModal: React.FC<MatchSkillSelectModalProps> = ({
  open,
  mode,
  p1Name,
  p2Name = 'Jogador 2',
  initialP1Skills,
  initialP2Skills,
  unlockedSkills,
  t,
  onCancel,
  onConfirm,
  onOpenLootboxes,
}) => {
  const isTwoPlayer = mode === '2p';
  const isOnline = mode === 'online';

  const allowedSet = useMemo(() => {
    if (!isOnline) return null;
    return new Set<SkillId>(unlockedSkills ?? []);
  }, [isOnline, unlockedSkills]);

  const [p1Slots, setP1Slots] = useState<[SkillId | null, SkillId | null]>([null, null]);
  const [p2Slots, setP2Slots] = useState<[SkillId | null, SkillId | null]>([null, null]);
  const [activePlayer, setActivePlayer] = useState<1 | 2>(1);
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0);
  const [rarityFilter, setRarityFilter] = useState<SkillRarity | 'all'>('all');

  useEffect(() => {
    if (!open) return;
    const nextP1 = toTwoSlotTuple(initialP1Skills, allowedSet ?? undefined);
    const nextP2 = isTwoPlayer ? toTwoSlotTuple(initialP2Skills) : ([null, null] as [SkillId | null, SkillId | null]);
    setP1Slots(nextP1);
    setP2Slots(nextP2);
    setActivePlayer(1);
    setActiveSlot(nextP1[0] === null ? 0 : nextP1[1] === null ? 1 : 0);
    setRarityFilter('all');
  }, [open, mode, initialP1Skills, initialP2Skills, isTwoPlayer, allowedSet]);

  const sortedCatalog = useMemo(() => {
    return [...SKILLS_CATALOG].sort((a, b) => {
      const rDiff = RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
      return rDiff !== 0 ? rDiff : a.number - b.number;
    });
  }, []);

  if (!open) return null;

  const filteredCatalog =
    rarityFilter === 'all'
      ? sortedCatalog
      : sortedCatalog.filter((s) => s.rarity === rarityFilter);

  const pickRandomTwo = (pool: SkillId[]): [SkillId | null, SkillId | null] => {
    if (pool.length === 0) return [null, null];
    if (pool.length === 1) return [pool[0], null];
    const copy = [...pool];
    const i1 = Math.floor(Math.random() * copy.length);
    const s1 = copy.splice(i1, 1)[0];
    const i2 = Math.floor(Math.random() * copy.length);
    const s2 = copy[i2];
    return [s1, s2];
  };

  const handleRandomize = (playerNum: 1 | 2) => {
    const pool = allowedSet ? Array.from(allowedSet) : ALL_SKILL_IDS;
    const picked = pickRandomTwo(pool);
    if (playerNum === 1) {
      setP1Slots(picked);
      if (isTwoPlayer && p2Slots[0] === null && p2Slots[1] === null) {
        setActivePlayer(2);
        setActiveSlot(0);
      }
    } else {
      setP2Slots(picked);
    }
  };

  const handleClearSlot = (playerNum: 1 | 2, slotIdx: 0 | 1) => {
    if (playerNum === 1) {
      setP1Slots((prev) => {
        const next: [SkillId | null, SkillId | null] = [...prev] as [SkillId | null, SkillId | null];
        next[slotIdx] = null;
        return next;
      });
    } else {
      setP2Slots((prev) => {
        const next: [SkillId | null, SkillId | null] = [...prev] as [SkillId | null, SkillId | null];
        next[slotIdx] = null;
        return next;
      });
    }
    setActivePlayer(playerNum);
    setActiveSlot(slotIdx);
  };

  const handleSelectSkill = (skillId: SkillId) => {
    if (allowedSet && !allowedSet.has(skillId)) return;

    if (activePlayer === 1) {
      const existingIdx = p1Slots.indexOf(skillId);
      if (existingIdx !== -1) {
        handleClearSlot(1, existingIdx as 0 | 1);
        return;
      }
      const next: [SkillId | null, SkillId | null] = [...p1Slots] as [SkillId | null, SkillId | null];
      next[activeSlot] = skillId;
      setP1Slots(next);

      const otherSlot: 0 | 1 = activeSlot === 0 ? 1 : 0;
      if (next[otherSlot] === null) {
        setActiveSlot(otherSlot);
      } else if (isTwoPlayer && (p2Slots[0] === null || p2Slots[1] === null)) {
        setActivePlayer(2);
        setActiveSlot(p2Slots[0] === null ? 0 : 1);
      }
    } else {
      const existingIdx = p2Slots.indexOf(skillId);
      if (existingIdx !== -1) {
        handleClearSlot(2, existingIdx as 0 | 1);
        return;
      }
      const next: [SkillId | null, SkillId | null] = [...p2Slots] as [SkillId | null, SkillId | null];
      next[activeSlot] = skillId;
      setP2Slots(next);

      const otherSlot: 0 | 1 = activeSlot === 0 ? 1 : 0;
      if (next[otherSlot] === null) {
        setActiveSlot(otherSlot);
      }
    }
  };

  const p1Selected = compactSlots(p1Slots);
  const p2Selected = compactSlots(p2Slots);

  const renderPlayerLoadout = (
    playerNum: 1 | 2,
    name: string,
    slots: [SkillId | null, SkillId | null],
    keyHints: [string, string]
  ) => {
    const isEditingThisPlayer = activePlayer === playerNum;
    const isBlue = playerNum === 1;
    const poolSize = allowedSet ? allowedSet.size : ALL_SKILL_IDS.length;

    return (
      <div
        onClick={() => setActivePlayer(playerNum)}
        className={`p-3.5 rounded-xl border transition-colors cursor-pointer space-y-2.5 ${
          isEditingThisPlayer
            ? isBlue
              ? 'bg-blue-500/12 border-blue-400/75'
              : 'bg-red-500/12 border-red-400/75'
            : 'bg-[#0B1215] border-white/10 hover:border-white/25'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2.5 h-5 rounded-sm shrink-0 ${isBlue ? 'bg-blue-500' : 'bg-red-500'}`}
            />
            <span className="font-bold text-sm text-white truncate">{name}</span>
            <span className="text-xs font-mono-num text-slate-400 shrink-0">
              {compactSlots(slots).length}/2
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {poolSize > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRandomize(playerNum);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-white/8 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
              >
                <Shuffle className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t.randomSkillsBtn}</span>
              </button>
            )}
            {(slots[0] || slots[1]) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (playerNum === 1) setP1Slots([null, null]);
                  else setP2Slots([null, null]);
                  setActivePlayer(playerNum);
                  setActiveSlot(0);
                }}
                title={t.clearSkillsBtn}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {([0, 1] as const).map((slotIdx) => {
            const skillId = slots[slotIdx];
            const skill = skillId ? getSkillById(skillId) : undefined;
            const meta = skill ? RARITY_META[skill.rarity] : null;
            const isSlotFocused = isEditingThisPlayer && activeSlot === slotIdx;

            return (
              <div
                key={slotIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePlayer(playerNum);
                  setActiveSlot(slotIdx);
                }}
                className={`min-h-[48px] px-2.5 py-2 rounded-lg border flex items-center justify-between gap-2 transition-colors ${
                  isSlotFocused
                    ? isBlue
                      ? 'bg-blue-500/20 border-blue-300'
                      : 'bg-red-500/20 border-red-300'
                    : skill && meta
                    ? `${meta.bgClass} ${meta.borderClass}`
                    : 'bg-[#111C21] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded bg-black/45 border border-white/15 font-mono-num text-[11px] font-extrabold text-amber-300 flex items-center justify-center shrink-0">
                    {keyHints[slotIdx]}
                  </span>
                  {skill ? (
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm leading-none shrink-0">{skill.icon}</span>
                        <span className="text-xs font-bold text-white truncate">{skill.name}</span>
                      </div>
                      <div className="text-[10px] font-mono-num text-slate-300">
                        {skill.cooldown}s CD
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 truncate">{t.skillSlotEmpty}</span>
                  )}
                </div>

                {skill && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearSlot(playerNum, slotIdx);
                    }}
                    aria-label={t.unequipBtn}
                    className="p-1 rounded text-slate-400 hover:text-red-300 hover:bg-black/30 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[75] bg-black/82 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-modal-backdrop">
      <div className="w-full max-w-4xl max-h-[92dvh] flex flex-col bg-[#0E171B] border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-modal-enter">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between gap-3 shrink-0 bg-[#0E171B]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center shrink-0">
              {isTwoPlayer ? <Users className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-tight truncate">
                {t.matchDraftTitle}
              </h2>
              <p className="text-xs text-slate-300 truncate">
                {isTwoPlayer
                  ? t.matchDraftSubtitle2p
                  : isOnline
                  ? t.matchDraftSubtitleOnline
                  : t.matchDraftSubtitle1p}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label={t.close}
            className="p-2 min-w-[40px] min-h-[40px] rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Active Player Switcher for 2P */}
          {isTwoPlayer && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">{t.draftingForLabel}:</span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0B1215] border border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setActivePlayer(1);
                    setActiveSlot(p1Slots[0] === null ? 0 : p1Slots[1] === null ? 1 : 0);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    activePlayer === 1
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {p1Name} (Z / X)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePlayer(2);
                    setActiveSlot(p2Slots[0] === null ? 0 : p2Slots[1] === null ? 1 : 0);
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    activePlayer === 2
                      ? 'bg-red-500 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {p2Name} (I / O)
                </button>
              </div>
            </div>
          )}

          {/* Player Slots Header */}
          <div className={`grid gap-3 ${isTwoPlayer ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {renderPlayerLoadout(1, p1Name, p1Slots, ['Z', 'X'])}
            {isTwoPlayer && renderPlayerLoadout(2, p2Name, p2Slots, ['I', 'O'])}
          </div>

          {/* Empty Online Skills Notice */}
          {isOnline && allowedSet && allowedSet.size === 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/35 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-amber-200 leading-relaxed flex-1 min-w-[200px]">
                {t.noOnlineSkillsHint}
              </p>
              {onOpenLootboxes && (
                <button
                  type="button"
                  onClick={() => {
                    onCancel();
                    onOpenLootboxes();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer"
                >
                  {t.skillsBtn}
                </button>
              )}
            </div>
          )}

          {/* Rarity Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRarityFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap cursor-pointer ${
                rarityFilter === 'all'
                  ? 'bg-white text-slate-950 border-white'
                  : 'bg-[#0B1215] border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {t.allRaritiesLabel} ({SKILLS_CATALOG.length})
            </button>
            {RARITY_ORDER.map((r) => {
              const meta = RARITY_META[r];
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRarityFilter(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap cursor-pointer ${
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

          {/* 20-Skill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredCatalog.map((skill) => {
              const isUnlockedForMatch = !allowedSet || allowedSet.has(skill.id);
              const p1SlotIdx = p1Slots.indexOf(skill.id);
              const p2SlotIdx = isTwoPlayer ? p2Slots.indexOf(skill.id) : -1;
              const isSelectedByActive =
                activePlayer === 1 ? p1SlotIdx !== -1 : p2SlotIdx !== -1;
              const meta = RARITY_META[skill.rarity];

              return (
                <button
                  key={skill.id}
                  type="button"
                  disabled={!isUnlockedForMatch}
                  onClick={() => handleSelectSkill(skill.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all min-h-[106px] ${
                    !isUnlockedForMatch
                      ? 'bg-[#111C21]/50 border-white/8 opacity-55 cursor-not-allowed'
                      : isSelectedByActive
                      ? activePlayer === 1
                        ? 'bg-blue-500/20 border-blue-400 ring-1 ring-blue-400/60 cursor-pointer'
                        : 'bg-red-500/20 border-red-400 ring-1 ring-red-400/60 cursor-pointer'
                      : 'bg-[#111C21] border-white/12 hover:border-white/30 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-black/40 border border-white/12 flex items-center justify-center text-base shrink-0">
                        {skill.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate">
                          {skill.name}
                        </div>
                        <div className="text-[11px] flex items-center gap-1.5 text-slate-400">
                          <span className={`font-semibold ${meta.textClass}`}>
                            {t.rarityLabels[skill.rarity]}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-num">CD {skill.cooldown}s</span>
                        </div>
                      </div>
                    </div>

                    {!isUnlockedForMatch ? (
                      <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-1" />
                    ) : (
                      <div className="flex items-center gap-1 shrink-0">
                        {p1SlotIdx !== -1 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white font-mono-num text-[10px] font-extrabold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            {p1SlotIdx === 0 ? 'Z' : 'X'}
                          </span>
                        )}
                        {p2SlotIdx !== -1 && (
                          <span className="px-1.5 py-0.5 rounded bg-red-500 text-white font-mono-num text-[10px] font-extrabold flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" />
                            {p2SlotIdx === 0 ? 'I' : 'O'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                    {skill.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky Footer CTA */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-white/10 bg-[#0B1215] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-300 flex items-center gap-2 font-mono-num">
            <span>
              {isTwoPlayer
                ? `${p1Name}: ${p1Selected.length}/2 · ${p2Name}: ${p2Selected.length}/2`
                : `${p1Name}: ${p1Selected.length}/2`}
            </span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 min-h-[44px] rounded-xl bg-white/8 hover:bg-white/15 text-slate-200 font-semibold text-sm whitespace-nowrap cursor-pointer"
            >
              {t.close}
            </button>
            <button
              type="button"
              onClick={() => onConfirm(p1Selected, p2Selected)}
              className="px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 whitespace-nowrap shadow-[0_8px_20px_rgba(16,185,129,0.28)] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isOnline ? t.confirmOnlineSkillsBtn : t.startWithSkillsBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
