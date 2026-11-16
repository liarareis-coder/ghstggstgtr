import React from 'react';
import { Award, Crown, Shield, Star, Trophy, Users } from 'lucide-react';
import type { TranslationDict } from '../i18n/translations.ts';
import type {
  MatchWinner,
  MultiplayerMvpParticipant,
  MultiplayerMvpSummary,
} from '../shared/gameEngine.ts';

interface MultiplayerMvpScreenProps {
  summary: MultiplayerMvpSummary;
  winner: MatchWinner;
  winnerTitle: string;
  blueName: string;
  redName: string;
  blueScore: number;
  redScore: number;
  mySlot?: string | null;
  isSpectator: boolean;
  t: TranslationDict;
  onContinue: () => void;
  onExitToMenu: () => void;
}

function MvpAvatar({ participant }: { participant: MultiplayerMvpParticipant }) {
  const skin = '#F5C6A5';
  const hair = participant.appearance?.hairColor ?? '#1E293B';
  const jerseyPrimary = participant.team === 'blue' ? '#2563EB' : '#DC2626';
  const jerseyAccent = participant.team === 'blue' ? '#93C5FD' : '#FCA5A5';

  return (
    <div
      className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-xl ${
        participant.team === 'blue'
          ? 'bg-gradient-to-b from-blue-500/25 to-slate-900/90 border-amber-400/80'
          : 'bg-gradient-to-b from-red-500/25 to-slate-900/90 border-amber-400/80'
      }`}
    >
      <svg viewBox="0 0 80 80" className="w-16 h-16 sm:w-20 sm:h-20" aria-hidden="true">
        {/* Shoulders / Jersey */}
        <path
          d="M14 74 C14 55 24 48 40 48 C56 48 66 55 66 74 Z"
          fill={jerseyPrimary}
          stroke={jerseyAccent}
          strokeWidth="2.5"
        />
        {/* Collar */}
        <path d="M32 48 L40 56 L48 48" fill="none" stroke="#FFFFFF" strokeWidth="2.2" />
        {/* Head */}
        <circle cx="40" cy="31" r="14" fill={skin} stroke="#0F172A" strokeWidth="2" />
        {/* Hair */}
        <path
          d="M25 29 C26 15 54 15 55 29 C51 22 29 22 25 29 Z"
          fill={hair}
        />
        {/* Eyes */}
        <circle cx="35" cy="31" r="1.8" fill="#0F172A" />
        <circle cx="45" cy="31" r="1.8" fill="#0F172A" />
        {/* Jersey Number */}
        <text
          x="40"
          y="70"
          textAnchor="middle"
          fontSize="14"
          fontWeight="800"
          fill="#FFFFFF"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          {participant.number}
        </text>
      </svg>

      <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg border-2 border-[#0B1215]">
        <Crown className="w-4 h-4" />
      </div>
    </div>
  );
}

export const MultiplayerMvpScreen: React.FC<MultiplayerMvpScreenProps> = ({
  summary,
  winner,
  winnerTitle,
  blueName,
  redName,
  blueScore,
  redScore,
  mySlot,
  isSpectator,
  t,
  onContinue,
  onExitToMenu,
}) => {
  const { mvp, winners } = summary;
  const isDraw = winner === 'draw' || winner === null;

  const isYou = (p: MultiplayerMvpParticipant) =>
    !isSpectator && Boolean(mySlot) && p.isHuman && p.id === mySlot;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 z-50 overflow-y-auto animate-modal-backdrop">
      <div className="w-full max-w-3xl bg-[#0F181D] border border-amber-400/35 rounded-2xl p-4 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.75)] space-y-4 my-auto max-h-[94vh] overflow-y-auto animate-modal-enter">
        {/* Top Banner: Winner Headline + Final Score */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                isDraw
                  ? 'bg-slate-500/20 border-slate-400/40 text-slate-200'
                  : 'bg-amber-500/20 border-amber-400/50 text-amber-300'
              }`}
            >
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                {t.mvpEyebrow} · {isDraw ? t.mvpDrawSection : t.mvpWinnersSection}
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {winnerTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#0B1215] border border-white/10 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] font-bold text-blue-300 truncate max-w-[90px]">
                {blueName}
              </div>
            </div>
            <div className="font-display text-2xl font-extrabold text-white font-mono-num leading-none">
              {blueScore} <span className="text-slate-500 text-base">×</span> {redScore}
            </div>
            <div className="text-left">
              <div className="text-[10px] font-bold text-red-300 truncate max-w-[90px]">
                {redName}
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Showcase: Left = MVP Spotlight, Right = Winners Roster */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* MVP Spotlight Card */}
          <div className="md:col-span-6 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#131F26] to-[#0B1215] border border-amber-400/45 p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                {t.mvpEyebrow}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono-num text-[11px] font-black">
                {mvp.mvpScore} {t.mvpPointsSuffix}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <MvpAvatar participant={mvp} />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      mvp.team === 'blue'
                        ? 'bg-blue-500/25 text-blue-200 border border-blue-400/40'
                        : 'bg-red-500/25 text-red-200 border border-red-400/40'
                    }`}
                  >
                    {mvp.team === 'blue' ? t.blueTeam : t.redTeam}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-bold text-slate-200">
                    #{mvp.number} · {mvp.role}
                  </span>
                  {mvp.isHuman ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-[10px] font-bold">
                      {isYou(mvp) ? t.mvpYouBadge : t.mvpHumanBadge}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-slate-500/20 text-slate-300 text-[10px] font-bold">
                      {t.aiLabel}
                    </span>
                  )}
                </div>
                <div className="font-display text-2xl font-extrabold text-white truncate">
                  {mvp.name}
                </div>
              </div>
            </div>

            {/* 5-Stat Grid */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              <div className="rounded-xl bg-[#0B1215]/85 border border-white/10 py-2 px-1 text-center">
                <div className="font-display text-lg font-extrabold text-amber-300 font-mono-num leading-none">
                  {mvp.goals}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1 truncate">
                  {t.mvpStatGoals}
                </div>
              </div>
              <div className="rounded-xl bg-[#0B1215]/85 border border-white/10 py-2 px-1 text-center">
                <div className="font-display text-lg font-extrabold text-emerald-300 font-mono-num leading-none">
                  {mvp.assists}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1 truncate">
                  {t.mvpStatAssists}
                </div>
              </div>
              <div className="rounded-xl bg-[#0B1215]/85 border border-white/10 py-2 px-1 text-center">
                <div className="font-display text-lg font-extrabold text-sky-300 font-mono-num leading-none">
                  {mvp.saves}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1 truncate">
                  {t.mvpStatSaves}
                </div>
              </div>
              <div className="rounded-xl bg-[#0B1215]/85 border border-white/10 py-2 px-1 text-center">
                <div className="font-display text-lg font-extrabold text-violet-300 font-mono-num leading-none">
                  {mvp.steals}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1 truncate">
                  {t.mvpStatSteals}
                </div>
              </div>
              <div className="rounded-xl bg-[#0B1215]/85 border border-white/10 py-2 px-1 text-center">
                <div className="font-display text-lg font-extrabold text-slate-100 font-mono-num leading-none">
                  {mvp.passes}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1 truncate">
                  {t.mvpStatPasses}
                </div>
              </div>
            </div>
          </div>

          {/* Winners / Standouts Roster Card */}
          <div className="md:col-span-6 rounded-2xl bg-[#0B1215] border border-white/12 p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-200">
                {isDraw ? (
                  <Users className="w-4 h-4 text-sky-400" />
                ) : (
                  <Award
                    className={`w-4 h-4 ${
                      winner === 'blue' ? 'text-blue-400' : 'text-red-400'
                    }`}
                  />
                )}
                {isDraw
                  ? t.mvpDrawSection
                  : `${t.mvpWinnersSection} · ${
                      winner === 'blue' ? t.blueTeam : t.redTeam
                    }`}
              </span>
              <span className="text-[11px] font-mono-num text-slate-400">
                {winners.length}
              </span>
            </div>

            <div className="space-y-1.5 max-h-[210px] overflow-y-auto pr-1">
              {winners.map((p) => {
                const isMvpRow = p.id === mvp.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border ${
                      isMvpRow
                        ? 'bg-amber-500/12 border-amber-400/45'
                        : p.team === 'blue'
                        ? 'bg-blue-500/8 border-blue-400/20'
                        : 'bg-red-500/8 border-red-400/20'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono-num text-xs font-extrabold shrink-0 ${
                          p.team === 'blue'
                            ? 'bg-blue-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {p.number}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white truncate max-w-[125px]">
                            {p.name}
                          </span>
                          {isMvpRow && (
                            <Crown className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                          )}
                          {p.isHuman ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-[9px] font-bold shrink-0">
                              {isYou(p) ? t.mvpYouBadge : t.mvpHumanBadge}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-slate-400 text-[9px] font-bold shrink-0">
                              {t.aiLabel}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono-num">
                          <span>{p.role}</span>
                          <span>·</span>
                          <span>
                            {p.goals}G {p.assists}A {p.saves}D {p.steals}R
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold font-mono-num text-amber-200">
                        {p.mvpScore}
                      </span>
                      <span className="text-[9px] text-slate-400 ml-0.5">
                        {t.mvpPointsSuffix}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>{t.mvpContinueBtn}</span>
          </button>
          <button
            type="button"
            onClick={onExitToMenu}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            {t.mainMenu}
          </button>
        </div>
      </div>
    </div>
  );
};
