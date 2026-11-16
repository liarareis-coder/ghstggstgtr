import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, Smartphone, X } from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall.ts';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleCopyUrl = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard?.writeText(window.location.origin).catch(() => {});
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 1800);
  };

  const guideModal =
    showGuide && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-modal-backdrop">
            <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-2xl bg-[#111C21] border border-white/15 p-5 sm:p-6 space-y-4 shadow-2xl animate-modal-enter">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl font-bold text-white leading-tight">
                    {isIOS ? 'Instalar no iPhone / iPad' : 'Arena Futebol — App Android'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tela cheia, controles flutuantes e modo 1P/2P offline
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Fechar"
                  onClick={() => setShowGuide(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIOS ? (
                <div className="rounded-xl bg-[#0B1215] border border-white/10 p-4 text-sm text-slate-300 leading-relaxed space-y-2">
                  <p>
                    1. Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari.
                  </p>
                  <p>
                    2. Role para baixo e toque em <strong>Adicionar à Tela de Início</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <div className="rounded-xl bg-[#0B1215] border border-emerald-500/30 p-3.5 space-y-1.5">
                    <p className="font-bold text-emerald-300">
                      1. Instalar direto no Android (WebAPK em Tela Cheia)
                    </p>
                    <p>
                      Abra este link no <strong>Chrome do Android</strong>, toque no menu{' '}
                      <strong>⋮</strong> (canto superior direito) e selecione{' '}
                      <strong>Instalar aplicativo</strong> ou{' '}
                      <strong>Adicionar à tela inicial</strong>.
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#0B1215] border border-white/10 p-3.5 space-y-2">
                    <p className="font-bold text-white">
                      2. Gerar arquivo .APK instalável (PWABuilder / Capacitor)
                    </p>
                    <p className="text-slate-400 text-xs">
                      Projeto já configurado com Manifesto Fullscreen e{' '}
                      <code className="text-emerald-300">capacitor.config.json</code>. Copie a URL abaixo para empacotar em APK pelo PWABuilder ou use{' '}
                      <code className="text-emerald-300">npx cap add android</code>:
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={typeof window !== 'undefined' ? window.location.origin : ''}
                        className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-[#111C21] border border-white/15 text-xs text-slate-200 font-mono-num"
                      />
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUrl ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isInstallable) {
            void install();
          } else {
            setShowGuide(true);
          }
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
          isInstallable
            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            : 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-200'
        }`}
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{isIOS ? 'Instalar no iOS' : isAndroid || isInstallable ? 'App Android' : 'App Android / PWA'}</span>
      </button>
      {guideModal}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 left-3 z-50 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold shadow-lg">
      Modo Offline — 1P e 2P disponíveis
    </div>
  );
};
