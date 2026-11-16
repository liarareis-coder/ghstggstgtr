import React from 'react';
import { Check, Coins, Lock, Palette, ShoppingBag, Sparkles, X } from 'lucide-react';
import type { TranslationDict } from '../i18n/translations.ts';
import { PITCH_TURFS, type PitchTurfId } from '../shared/turfs.ts';

interface PitchShopModalProps {
  open: boolean;
  onClose: () => void;
  t: TranslationDict;
  coins: number;
  unlockedTurfs: PitchTurfId[];
  selectedTurf: PitchTurfId;
  onBuyTurf: (turfId: PitchTurfId) => void;
  onSelectTurf: (turfId: PitchTurfId) => void;
}

export const PitchShopModal: React.FC<PitchShopModalProps> = ({
  open,
  onClose,
  t,
  coins,
  unlockedTurfs,
  selectedTurf,
  onBuyTurf,
  onSelectTurf,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-modal-backdrop">
      <div className="w-full max-w-3xl max-h-[90dvh] bg-[#111C21] border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-modal-enter">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-extrabold text-white truncate">
                {t.shopTitle}
              </h2>
              <p className="text-xs text-slate-400 truncate">{t.shopSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-400/45 flex items-center gap-1.5 text-amber-200 font-mono-num text-sm font-extrabold">
              <Coins className="w-4 h-4 text-amber-300" />
              <span>{coins}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
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
                  {/* Visual Pitch Preview Mini-Field */}
                  <div
                    className="relative h-24 w-full border-b border-white/10 flex items-center justify-center overflow-hidden"
                    style={{ background: turf.previewGradient }}
                  >
                    {/* Mini markings */}
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

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-xs font-bold text-white flex items-center gap-1">
                      <span>{turf.badgeEmoji}</span>
                      {equipped && (
                        <span className="text-emerald-300 text-[10px] uppercase tracking-wider">
                          · {t.equippedBadge}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-xs font-mono-num font-bold text-amber-300 flex items-center gap-1">
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

                  {/* Card Details & Action */}
                  <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {t.turfNames[turf.id]}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {t.turfDescs[turf.id]}
                      </p>
                    </div>

                    {equipped ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2 px-3 rounded-lg bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t.equippedBadge}</span>
                      </button>
                    ) : owned ? (
                      <button
                        type="button"
                        onClick={() => onSelectTurf(turf.id)}
                        className="w-full py-2 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>{t.equipBtn}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford}
                        onClick={() => onBuyTurf(turf.id)}
                        className={`w-full py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
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
      </div>
    </div>
  );
};
