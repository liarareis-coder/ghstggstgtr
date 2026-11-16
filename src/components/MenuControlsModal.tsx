import React from 'react';
import {
  Film,
  Keyboard,
  Languages,
  LayoutGrid,
  Palette,
  RotateCcw,
  Save,
  ShoppingBag,
  Sliders,
  SlidersHorizontal,
  Sparkles,
  UserCheck,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react';
import {
  LANGUAGE_OPTIONS,
  type Language,
  type TranslationDict,
} from '../i18n/translations.ts';
import {
  createDefaultAnimationConfig,
  createDefaultMenuConfig,
  type AnimationConfig,
  type MenuConfig,
} from '../shared/animations.ts';
import type { UnifiedShopTab } from './UnifiedShopModal.tsx';

interface MenuControlsModalProps {
  open: boolean;
  onClose: () => void;
  t: TranslationDict;
  lang: Language;
  muted: boolean;
  menuConfig: MenuConfig;
  animationConfig: AnimationConfig;
  hasReplays: boolean;
  onChangeMenuConfig: (next: MenuConfig) => void;
  onChangeAnimationConfig: (next: AnimationConfig) => void;
  onSelectLanguage: (lang: Language) => void;
  onToggleMute: () => void;
  onOpenShopTab: (tab: UnifiedShopTab) => void;
  onOpenHudCustomizer: () => void;
  onOpenSaveModal: () => void;
  onOpenReplays: () => void;
}

export const MenuControlsModal: React.FC<MenuControlsModalProps> = ({
  open,
  onClose,
  t,
  lang,
  muted,
  menuConfig,
  animationConfig,
  hasReplays,
  onChangeMenuConfig,
  onChangeAnimationConfig,
  onSelectLanguage,
  onToggleMute,
  onOpenShopTab,
  onOpenHudCustomizer,
  onOpenSaveModal,
  onOpenReplays,
}) => {
  if (!open) return null;

  const applyAnimPreset = (preset: 'instant' | 'fast' | 'default' | 'cinematic') => {
    if (preset === 'instant') {
      onChangeAnimationConfig({
        ...animationConfig,
        uiAnimDurationMs: 0,
        lootboxAnimDurationMs: 0,
        fieldAnimDurationMs: 700,
      });
    } else if (preset === 'fast') {
      onChangeAnimationConfig({
        ...animationConfig,
        uiAnimDurationMs: 120,
        lootboxAnimDurationMs: 500,
        fieldAnimDurationMs: 1100,
      });
    } else if (preset === 'default') {
      const def = createDefaultAnimationConfig();
      onChangeAnimationConfig({
        ...animationConfig,
        uiAnimDurationMs: def.uiAnimDurationMs,
        lootboxAnimDurationMs: def.lootboxAnimDurationMs,
        fieldAnimDurationMs: def.fieldAnimDurationMs,
      });
    } else {
      onChangeAnimationConfig({
        ...animationConfig,
        uiAnimDurationMs: 420,
        lootboxAnimDurationMs: 1900,
        fieldAnimDurationMs: 2800,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-modal-backdrop">
      <div className="w-full max-w-3xl max-h-[92dvh] flex flex-col bg-[#0E171B] border border-white/15 rounded-2xl shadow-2xl overflow-hidden animate-modal-enter">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 border-b border-white/10 bg-[#0E171B] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/45 text-emerald-300 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-tight truncate">
                {t.menuControlsTitle}
              </h2>
              <p className="text-xs text-slate-400 truncate">{t.menuControlsSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onChangeMenuConfig(createDefaultMenuConfig());
                applyAnimPreset('default');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.resetHudBtn}</span>
            </button>
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
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick Navigation Hub */}
          <div className="p-4 rounded-xl bg-[#0B1215] border border-white/10 space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.menuQuickNavTitle}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenShopTab('skills');
                }}
                className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-xs font-bold text-rose-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{t.tabSkills}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenShopTab('character');
                }}
                className="py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-xs font-bold text-sky-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t.tabCharacter}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenShopTab('turfs');
                }}
                className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-xs font-bold text-emerald-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>{t.tabTurfs}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenShopTab('animations');
                }}
                className="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t.tabAnimations}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHudCustomizer();
                }}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Sliders className="w-3.5 h-3.5 text-sky-300" />
                <span>{t.customizeButtonsBtn}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSaveModal();
                }}
                className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t.saveAndRankBtn}</span>
              </button>
              {hasReplays && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReplays();
                  }}
                  className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Film className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t.replaysBtn}</span>
                </button>
              )}
            </div>
          </div>

          {/* Menu Layout & Visuals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-[#111C21] border border-white/10 space-y-2.5">
              <div className="text-xs font-bold text-slate-200">{t.menuLayoutLabel}</div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onChangeMenuConfig({ ...menuConfig, menuLayout: 'default' })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
                    menuConfig.menuLayout === 'default'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-[#0B1215] text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  {t.menuLayoutDefault}
                </button>
                <button
                  type="button"
                  onClick={() => onChangeMenuConfig({ ...menuConfig, menuLayout: 'compact' })}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
                    menuConfig.menuLayout === 'compact'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-[#0B1215] text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  {t.menuLayoutCompact}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111C21] border border-white/10 space-y-2.5">
              <div className="text-xs font-bold text-slate-200">{t.menuBackdropLabel}</div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onChangeMenuConfig({ ...menuConfig, menuBackdropMode: 'stadium' })
                  }
                  className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
                    menuConfig.menuBackdropMode === 'stadium'
                      ? 'bg-sky-500 text-slate-950 border-sky-400'
                      : 'bg-[#0B1215] text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  {t.menuBackdropStadium}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChangeMenuConfig({ ...menuConfig, menuBackdropMode: 'minimal' })
                  }
                  className={`py-2 px-3 rounded-lg text-xs font-bold border cursor-pointer whitespace-nowrap ${
                    menuConfig.menuBackdropMode === 'minimal'
                      ? 'bg-sky-500 text-slate-950 border-sky-400'
                      : 'bg-[#0B1215] text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  {t.menuBackdropMinimal}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111C21] border border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-200">{t.menuShowRulesLabel}</span>
              <button
                type="button"
                onClick={() =>
                  onChangeMenuConfig({
                    ...menuConfig,
                    showMenuRules: !menuConfig.showMenuRules,
                  })
                }
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer whitespace-nowrap ${
                  menuConfig.showMenuRules
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                {menuConfig.showMenuRules ? t.onLabel : t.offLabel}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111C21] border border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>{t.menuAnimationsLabel}</span>
              </span>
              <button
                type="button"
                onClick={() =>
                  onChangeMenuConfig({
                    ...menuConfig,
                    menuAnimations: !menuConfig.menuAnimations,
                  })
                }
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer whitespace-nowrap ${
                  menuConfig.menuAnimations
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                {menuConfig.menuAnimations ? t.onLabel : t.offLabel}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111C21] border border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t.menuKeyboardNavLabel}</span>
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onChangeMenuConfig({
                      ...menuConfig,
                      menuKeyboardNav: !menuConfig.menuKeyboardNav,
                    })
                  }
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer whitespace-nowrap ${
                    menuConfig.menuKeyboardNav
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {menuConfig.menuKeyboardNav ? t.onLabel : t.offLabel}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-mono-num">
                {t.menuKeyboardLegend}
              </p>
            </div>
          </div>

          {/* Animation Timings & Presets */}
          <div className="p-4 rounded-xl bg-[#0B1215] border border-white/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                {t.menuAnimTimingTitle}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'instant', label: t.animPresetInstant },
                    { id: 'fast', label: t.animPresetFast },
                    { id: 'default', label: t.animPresetDefault },
                    { id: 'cinematic', label: t.animPresetCinematic },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyAnimPreset(preset.id)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-[11px] font-bold text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
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

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
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

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-200">
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
            </div>
          </div>

          {/* Audio & Language Controls */}
          <div className="p-4 rounded-xl bg-[#111C21] border border-white/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.menuAudioLangTitle}</span>
              </span>
              <button
                type="button"
                onClick={onToggleMute}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  muted
                    ? 'bg-red-500/20 border border-red-400/40 text-red-200'
                    : 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                }`}
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{muted ? t.soundOff : t.soundOn}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectLanguage(opt.id)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    lang === opt.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-[#0B1215] text-slate-300 border-white/10 hover:text-white'
                  }`}
                >
                  <span>{opt.flag}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-white/10 bg-[#0B1215] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm cursor-pointer whitespace-nowrap"
          >
            {t.doneBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
