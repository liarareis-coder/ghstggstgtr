import React, { useEffect, useRef, useState } from 'react';
import { Check, Coins, Lock, Minus, Plus, Sparkles, UserCheck, X } from 'lucide-react';
import type { TranslationDict } from '../i18n/translations.ts';
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
import { drawPlayerCircle } from './GameCanvas.tsx';

interface CharacterShopModalProps {
  open: boolean;
  onClose: () => void;
  t: TranslationDict;
  coins: number;
  unlockedCosmetics: string[];
  config: CharacterConfig;
  onBuyCosmetic: (itemId: string) => void;
  onChangeConfig: (next: CharacterConfig) => void;
}

const AURA_COLORS: Record<AuraTrailId, string> = {
  none: 'transparent',
  spark: '#38BDF8',
  flame: '#F97316',
  frost: '#67E8F9',
  shadow: '#8B5CF6',
  ego: '#F43F5E',
};

export const CharacterShopModal: React.FC<CharacterShopModalProps> = ({
  open,
  onClose,
  t,
  coins,
  unlockedCosmetics,
  config,
  onBuyCosmetic,
  onChangeConfig,
}) => {
  const [activeTab, setActiveTab] = useState<CosmeticCategory>('hair');
  const [previewTeam, setPreviewTeam] = useState<Team>('blue');
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const renderPreview = (now: number) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Subtle dark radial arena stage
      const bg = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.55);
      bg.addColorStop(0, previewTeam === 'blue' ? 'rgba(37,99,235,0.28)' : 'rgba(220,38,38,0.28)');
      bg.addColorStop(1, 'rgba(11,18,21,0.95)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.scale(2.4, 2.4);
      const cx = w / (2 * 2.4);
      const cy = h / (2 * 2.4) + 5;

      // Aura preview pulse
      if (config.auraTrail !== 'none') {
        const pulse = 1 + Math.sin(now * 0.005) * 0.1;
        ctx.save();
        ctx.strokeStyle = AURA_COLORS[config.auraTrail];
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
        config.jerseyNumber,
        -0.35 + Math.sin(now * 0.0018) * 0.18,
        false,
        false,
        config
      );
      ctx.restore();

      animId = requestAnimationFrame(renderPreview);
    };

    animId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(animId);
  }, [open, config, previewTeam]);

  if (!open) return null;

  const tabs: Array<{ id: CosmeticCategory; label: string }> = [
    { id: 'hair', label: t.hairTab },
    { id: 'color', label: t.colorTab },
    { id: 'pattern', label: t.patternTab },
    { id: 'aura', label: t.auraTab },
    { id: 'cleat', label: t.cleatTab },
  ];

  const items = CHARACTER_COSMETICS.filter((c) => c.category === activeTab);

  const isItemEquipped = (item: CosmeticItem): boolean => {
    switch (item.category) {
      case 'hair':
        return config.hairStyle === item.value;
      case 'color':
        return config.hairColor === item.value;
      case 'pattern':
        return config.jerseyPattern === item.value;
      case 'aura':
        return config.auraTrail === item.value;
      case 'cleat':
        return config.cleatColor === item.value;
    }
  };

  const equipItem = (item: CosmeticItem) => {
    switch (item.category) {
      case 'hair':
        onChangeConfig({ ...config, hairStyle: item.value as HairStyleId });
        break;
      case 'color':
        onChangeConfig({ ...config, hairColor: item.value });
        break;
      case 'pattern':
        onChangeConfig({ ...config, jerseyPattern: item.value as JerseyPatternId });
        break;
      case 'aura':
        onChangeConfig({ ...config, auraTrail: item.value as AuraTrailId });
        break;
      case 'cleat':
        onChangeConfig({ ...config, cleatColor: item.value });
        break;
    }
  };

  const setJerseyNumber = (nextNum: number) => {
    const clamped = Math.max(1, Math.min(99, Math.floor(nextNum) || 1));
    onChangeConfig({ ...config, jerseyNumber: clamped });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-modal-backdrop">
      <div className="w-full max-w-3xl max-h-[90dvh] overflow-y-auto bg-[#0E171B] border border-white/15 rounded-2xl shadow-2xl animate-modal-enter">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-[#0E171B]/95 backdrop-blur-xs px-5 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 text-sky-300 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {t.characterShopTitle}
              </h2>
              <p className="text-xs text-slate-400">{t.characterShopSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
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

        {/* Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Preview & Number Panel */}
          <div className="md:col-span-4 space-y-3">
            <div className="rounded-2xl bg-[#0B1215] border border-white/10 p-3 flex flex-col items-center gap-3">
              <canvas
                ref={previewCanvasRef}
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

            {/* Jersey Number Selector */}
            <div className="rounded-xl bg-[#0B1215] border border-white/10 p-3 space-y-2">
              <div className="text-xs font-bold text-slate-300 text-center">
                {t.jerseyNumberLabel}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setJerseyNumber(config.jerseyNumber - 1)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={config.jerseyNumber}
                  onChange={(e) => setJerseyNumber(Number(e.target.value))}
                  className="w-16 py-1.5 rounded-lg bg-[#111C21] border border-white/15 text-center font-mono-num text-base font-extrabold text-white focus:outline-none focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={() => setJerseyNumber(config.jerseyNumber + 1)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Category Tabs & Items */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#0B1215] border border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[74px] py-2 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => {
                const owned = item.price === 0 || unlockedCosmetics.includes(item.id);
                const equipped = isItemEquipped(item);
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
                          onClick={() => equipItem(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
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
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            canAfford
                              ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
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
      </div>
    </div>
  );
};
