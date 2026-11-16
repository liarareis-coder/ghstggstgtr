import type { RankId } from '../shared/ranks.ts';
import type { PitchTurfId } from '../shared/turfs.ts';

export type Language = 'pt-BR' | 'pt-PT' | 'en-US' | 'es';

export interface LanguageOption {
  id: Language;
  shortLabel: string;
  label: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { id: 'pt-BR', shortLabel: 'PT-BR', label: 'Português (BR)', flag: '🇧🇷' },
  { id: 'pt-PT', shortLabel: 'PT-PT', label: 'Português (PT)', flag: '🇵🇹' },
  { id: 'en-US', shortLabel: 'EN-US', label: 'English (USA)', flag: '🇺🇸' },
  { id: 'es', shortLabel: 'ES', label: 'Español', flag: '🇪🇸' },
];

export const RANK_NAMES_BY_LANG: Record<Language, Record<RankId, string>> = {
  'pt-BR': {
    bronze: 'Bronze',
    prata: 'Prata',
    ouro: 'Ouro',
    diamante: 'Diamante',
    platina: 'Platina',
    titanio: 'Titânio',
    legend: 'Legend',
    'supersonic-legend': 'Supersonic Legend',
    champion: 'Champion',
    'supersonic-champion': 'Supersonic Champion',
  },
  'pt-PT': {
    bronze: 'Bronze',
    prata: 'Prata',
    ouro: 'Ouro',
    diamante: 'Diamante',
    platina: 'Platina',
    titanio: 'Titânio',
    legend: 'Legend',
    'supersonic-legend': 'Supersonic Legend',
    champion: 'Champion',
    'supersonic-champion': 'Supersonic Champion',
  },
  'en-US': {
    bronze: 'Bronze',
    prata: 'Silver',
    ouro: 'Gold',
    diamante: 'Diamond',
    platina: 'Platinum',
    titanio: 'Titanium',
    legend: 'Legend',
    'supersonic-legend': 'Supersonic Legend',
    champion: 'Champion',
    'supersonic-champion': 'Supersonic Champion',
  },
  es: {
    bronze: 'Bronce',
    prata: 'Plata',
    ouro: 'Oro',
    diamante: 'Diamante',
    platina: 'Platino',
    titanio: 'Titanio',
    legend: 'Legend',
    'supersonic-legend': 'Supersonic Legend',
    champion: 'Champion',
    'supersonic-champion': 'Supersonic Champion',
  },
};

export function getLocalizedRankName(rankId: RankId, lang: Language): string {
  return RANK_NAMES_BY_LANG[lang]?.[rankId] ?? RANK_NAMES_BY_LANG['pt-BR'][rankId];
}

export interface TranslationDict {
  appName: string;
  headerDuration: string;
  soundOn: string;
  soundOff: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  rule1Title: string;
  rule1Desc: string;
  rule2Title: string;
  rule2Desc: string;
  chooseModeTitle: string;
  chooseModeSubtitle: string;
  mode1pTitle: string;
  mode1pDesc: string;
  mode2pTitle: string;
  mode2pDesc: string;
  modeTrainingTitle: string;
  modeTrainingDesc: string;
  modeOnlineTitle: string;
  modeOnlineDesc: string;
  teamFormat: string;
  localP1Label: string;
  localP2Label: string;
  localP1Placeholder: string;
  localP2Placeholder: string;
  openOnlineLobby: string;
  startTraining: string;
  startMatch: string;
  footerControls1p: string;
  footerControls2p: string;
  // Save & Profile
  saveAndRankBtn: string;
  saveModalTitle: string;
  saveModalSubtitle: string;
  close: string;
  playerNameLabel: string;
  currentRankLabel: string;
  expToNext: string;
  maxRankReached: string;
  careerStatsTitle: string;
  rankedRecordLabel: string;
  totalMatchesLabel: string;
  totalGoalsLabel: string;
  localSaveTitle: string;
  cloudSaveTitle: string;
  lastSavedAt: string;
  notSavedYet: string;
  saveNow: string;
  loadSave: string;
  resetSave: string;
  confirmReset: string;
  saveFeedbackSaved: string;
  saveFeedbackLoaded: string;
  saveFeedbackReset: string;
  saveFeedbackSynced: string;
  signInGoogle: string;
  signOutGoogle: string;
  syncCloudNow: string;
  cloudSignedInAs: string;
  cloudNotSignedIn: string;
  matchHistoryTitle: string;
  noMatchesYet: string;
  leaderboardTitle: string;
  leaderboardEmpty: string;
  refreshLeaderboard: string;
  rankProgressionTitle: string;
  // Online Lobby
  backToMenu: string;
  serverConnected: string;
  connecting: string;
  onlineTitle: string;
  onlineSubtitle: string;
  queueTypeLabel: string;
  casualQueue: string;
  rankedQueue: string;
  rankedQueueDesc: string;
  casualQueueDesc: string;
  yourFieldName: string;
  namePlaceholder: string;
  quickOrNewRoomTitle: string;
  quickOrNewRoomDesc: string;
  findQuickMatch: string;
  searchingOpponent: string;
  createCodeRoom: string;
  joinRoomTitle: string;
  joinRoomDesc: string;
  joinBtn: string;
  roomCodeLabel: string;
  humansCount: string;
  switchTeam: string;
  copyCode: string;
  copied: string;
  blueTeam: string;
  redTeam: string;
  youTag: string;
  aiLabel: string;
  humanLabel: string;
  leaveRoom: string;
  startOnlineMatch: string;
  waitingPlayers: string;
  waitingHost: string;
  // Match HUD & Controls
  goalPausedClock: string;
  overtimeLabel: string;
  trainingModeLabel: string;
  regulationLabel: string;
  pausedTitle: string;
  resumeMatch: string;
  restartMatch: string;
  exitToMenu: string;
  drawTitle: string;
  youWonTitle: string;
  wonSuffix: string;
  blueTeamWon: string;
  redTeamWon: string;
  aiWon: string;
  drawReason: string;
  overtimeDecided: string;
  playAgain: string;
  mainMenu: string;
  staminaLabel: string;
  powerLabel: string;
  shootPowerLabel: string;
  walkAimLabel: string;
  walkAimHint: string;
  emotesHint: string;
  emotes2pHint: string;
  emotesBtnLabel: string;
  actionShoot: string;
  actionPass: string;
  actionDribble: string;
  actionSprint: string;
  actionSwitch: string;
  // Ranked Match Result
  rankedSummaryTitle: string;
  rankedPromoted: string;
  rankedWin: string;
  rankedLoss: string;
  rankedDraw: string;
  // Canvas
  canvasGoalTitle: string;
  canvasPrepareTitle: string;
  canvasPrepareSub: string;
  canvasOvertimeTitle: string;
  canvasOvertimeSub: string;
  canvasPausedClock: string;
  canvasScoredFor: string;
  canvasOwnGoalScoredFor: string;
  // Errors
  serverConnectError: string;
  connectingWaitError: string;
  // Coins & Pitch Texture Shop
  coinsLabel: string;
  shopBtn: string;
  shopTitle: string;
  shopSubtitle: string;
  multiplayerCoinsHint: string;
  freeLabel: string;
  buyBtn: string;
  equipBtn: string;
  equippedBadge: string;
  insufficientCoins: string;
  onlineCoinsEarned: string;
  casualSummaryTitle: string;
  turfNames: Record<PitchTurfId, string>;
  turfDescs: Record<PitchTurfId, string>;
  // HUD / Button Customizer
  customizeButtonsBtn: string;
  customizerTitle: string;
  customizerSubtitle: string;
  layoutModeLabel: string;
  layoutRadial: string;
  layoutSplit: string;
  handednessLabel: string;
  leftJoy: string;
  rightJoy: string;
  buttonScaleLabel: string;
  joystickScaleLabel: string;
  joystickSensitivityLabel: string;
  diagonalToleranceLabel: string;
  diagonalToleranceHint: string;
  opacityLabel: string;
  dragHint: string;
  resetHudBtn: string;
  doneBtn: string;
  switchBtnToggleLabel: string;
  switchBtnOn: string;
  switchBtnOff: string;
  devModeBtn: string;
  trainingResetBallBtn: string;
  lootboxOpeningTitle: string;
  lootboxSkipBtn: string;
  lootboxContinueBtn: string;
  // Spectator Mode
  spectatorBadge: string;
  spectatingLive: string;
  liveMatchesTitle: string;
  noLiveMatches: string;
  watchLiveBtn: string;
  spectatorsCountLabel: string;
  followBall: string;
  cameraFocusLabel: string;
  spectatorEndedTitle: string;
  spectatorEndedDesc: string;
  refreshLiveBtn: string;
  // Character Shop
  characterBtn: string;
  characterShopTitle: string;
  characterShopSubtitle: string;
  hairTab: string;
  colorTab: string;
  patternTab: string;
  auraTab: string;
  cleatTab: string;
  jerseyNumberLabel: string;
  cosmeticNames: Record<string, string>;
  // Skills & Lootboxes
  skillsBtn: string;
  skillsModalTitle: string;
  skillsModalSubtitle: string;
  lootboxTab: string;
  mySkillsTab: string;
  openBoxBtn: string;
  boxResultNew: string;
  boxResultDuplicate: string;
  rarityLabels: Record<'common' | 'rare' | 'epic' | 'legendary' | 'mythic', string>;
  lootboxNames: Record<'standard' | 'epic' | 'mythic', string>;
  lootboxDescs: Record<'standard' | 'epic' | 'mythic', string>;
  equippedSlotsTitle: string;
  slotLabel: string;
  equipSlot1: string;
  equipSlot2: string;
  unequipBtn: string;
  skillSlotEmpty: string;
  skillsOwnedLabel: string;
  // Best Moments Replay
  watchReplayBtn: string;
  replaysBtn: string;
  replayModalTitle: string;
  replayModalSubtitle: string;
  replayMomentGoal: string;
  replayMomentPost: string;
  replayMomentSkill: string;
  replayMomentSave: string;
  replaySpeedLabel: string;
  replayPlay: string;
  replayPause: string;
  replayPrev: string;
  replayNext: string;
  replaySavedMatchesLabel: string;
  noReplaysYet: string;
  // Mobile Landscape Enforcement
  landscapeOnlyTitle: string;
  landscapeOnlyDesc: string;
  landscapeOnlyBtn: string;
  landscapeHintBanner: string;
  landscapeManualHint: string;
  // Pre-match Skill Selection
  matchDraftTitle: string;
  matchDraftSubtitle1p: string;
  matchDraftSubtitle2p: string;
  matchDraftSubtitleOnline: string;
  draftingForLabel: string;
  randomSkillsBtn: string;
  clearSkillsBtn: string;
  startWithSkillsBtn: string;
  confirmOnlineSkillsBtn: string;
  changeMatchSkillsBtn: string;
  noOnlineSkillsHint: string;
  allRaritiesLabel: string;
  // Multiplayer MVP & Winners Screen
  mvpEyebrow: string;
  mvpWinnersSection: string;
  mvpDrawSection: string;
  mvpPointsSuffix: string;
  mvpStatGoals: string;
  mvpStatAssists: string;
  mvpStatSaves: string;
  mvpStatSteals: string;
  mvpStatPasses: string;
  mvpHumanBadge: string;
  mvpYouBadge: string;
  mvpContinueBtn: string;
  mvpReopenBtn: string;
  // Unified Shop & Animations & Menu Controls
  unifiedShopBtn: string;
  unifiedShopTitle: string;
  unifiedShopSubtitle: string;
  tabSkills: string;
  tabCharacter: string;
  tabTurfs: string;
  tabAnimations: string;
  animationsTitle: string;
  animationsSubtitle: string;
  goalAnimationsLabel: string;
  trailAnimationsLabel: string;
  animFieldDurationLabel: string;
  animLootboxDurationLabel: string;
  animUiDurationLabel: string;
  testAnimationBtn: string;
  animResetTimingBtn: string;
  animPresetInstant: string;
  animPresetFast: string;
  animPresetDefault: string;
  animPresetCinematic: string;
  animNames: Record<string, string>;
  animDescs: Record<string, string>;
  menuControlsBtn: string;
  menuControlsTitle: string;
  menuControlsSubtitle: string;
  menuLayoutLabel: string;
  menuLayoutDefault: string;
  menuLayoutCompact: string;
  menuBackdropLabel: string;
  menuBackdropStadium: string;
  menuBackdropMinimal: string;
  menuShowRulesLabel: string;
  menuKeyboardNavLabel: string;
  menuKeyboardLegend: string;
  menuQuickNavTitle: string;
  menuAnimTimingTitle: string;
  menuAudioLangTitle: string;
  menuAnimationsLabel: string;
  pingLabel: string;
  onLabel: string;
  offLabel: string;
  seasonLabel: string;
  seasonResetTimerLabel: string;
  seasonResetNotice: string;
  seasonDesc: string;
}

const PT_BR: TranslationDict = {
  appName: 'Arena Futebol',
  headerDuration: '3 min + até 3×30s Prorrogação',
  soundOn: 'Som Ativo',
  soundOff: 'Sem Som',
  heroEyebrow: 'Futebol Arcade em Tempo Real',
  heroTitle: 'Leve a bola até o gol adversário.',
  heroSubtitle:
    'Encoste na bola para prendê-la nos pés, toque com precisão pelo botão Passar, controle automaticamente o atleta com a bola e decida no chute ou no drible.',
  rule1Title: '3 min + até 3 Prorrogações',
  rule1Desc:
    'O tempo pausa na comemoração do gol. Após 3 prorrogações empatadas, dá empate.',
  rule2Title: 'Passe e Troca Automática',
  rule2Desc:
    'Joystick anda e mira, e você sempre controla o jogador do seu time que está com a bola.',
  chooseModeTitle: 'Escolha o Modo de Jogo',
  chooseModeSubtitle:
    'Partida normal, duelo local com nomes, treino contra IA leve ou online rankeado.',
  mode1pTitle: '1 Jogador',
  mode1pDesc: 'Modo normal vs IA',
  mode2pTitle: '2 Jogadores',
  mode2pDesc: 'Multiplayer local',
  modeTrainingTitle: 'Modo Treino',
  modeTrainingDesc: 'IA leve para treinar',
  modeOnlineTitle: 'Online',
  modeOnlineDesc: 'Casual ou Rankeada',
  teamFormat: 'Formato dos Times',
  localP1Label: 'Nome Jogador 1 (Azul)',
  localP2Label: 'Nome Jogador 2 (Vermelho)',
  localP1Placeholder: 'Jogador 1',
  localP2Placeholder: 'Jogador 2',
  openOnlineLobby: 'Abrir Lobby Online',
  startTraining: 'Iniciar Treino',
  startMatch: 'Iniciar Partida',
  footerControls1p:
    '1P/Treino: WASD/Setas · Shift Correr · E Passar/Trocar · G Driblar · Z/X Skills · Segurar Espaço/F Chutar · 1–5 Emotes',
  footerControls2p:
    '2P Local: P1 WASD + Shift/E/G/F (Z/X) · P2 Setas + Shift Dir./J/L/K (I/O · 6–0)',
  saveAndRankBtn: 'Save & Rankeada',
  saveModalTitle: 'Perfil, Patente e Sistema de Save',
  saveModalSubtitle: 'Salve seu progresso local, sincronize na nuvem e acompanhe o ranking.',
  close: 'Fechar',
  playerNameLabel: 'Nome do Jogador',
  currentRankLabel: 'Patente Atual',
  expToNext: 'Faltam {exp} EXP para {rank}',
  maxRankReached: 'Patente Máxima Alcançada!',
  careerStatsTitle: 'Estatísticas da Carreira',
  rankedRecordLabel: 'Rankeada (V / E / D)',
  totalMatchesLabel: 'Partidas',
  totalGoalsLabel: 'Gols',
  localSaveTitle: 'Save Local (Navegador)',
  cloudSaveTitle: 'Save na Nuvem (Google)',
  lastSavedAt: 'Último save: {date}',
  notSavedYet: 'Ainda não salvo manualmente',
  saveNow: 'Salvar Agora',
  loadSave: 'Carregar Save',
  resetSave: 'Resetar Save',
  confirmReset: 'Confirmar Reset?',
  saveFeedbackSaved: 'Save gravado com sucesso!',
  saveFeedbackLoaded: 'Save carregado!',
  saveFeedbackReset: 'Save reiniciado para Bronze (0 EXP).',
  saveFeedbackSynced: 'Progresso sincronizado com a nuvem!',
  signInGoogle: 'Entrar com Google',
  signOutGoogle: 'Sair da Conta',
  syncCloudNow: 'Sincronizar Nuvem',
  cloudSignedInAs: 'Conectado como {name}',
  cloudNotSignedIn: 'Entre com Google para salvar sua patente na nuvem e aparecer no Ranking Global.',
  matchHistoryTitle: 'Últimas Partidas',
  noMatchesYet: 'Nenhuma partida registrada ainda.',
  leaderboardTitle: 'Ranking Global (Top EXP)',
  leaderboardEmpty: 'Nenhum jogador ranqueado na nuvem ainda.',
  refreshLeaderboard: 'Atualizar',
  rankProgressionTitle: 'Patentes Rankeadas (10 Patentes · Níveis I–III)',
  backToMenu: 'Voltar ao Menu',
  serverConnected: 'Servidor Conectado',
  connecting: 'Conectando...',
  onlineTitle: 'Multiplayer Online',
  onlineSubtitle:
    'Jogue em tempo real pela internet em salas {size} vs {size} (vagas vazias usam IA).',
  queueTypeLabel: 'Tipo de Partida',
  casualQueue: 'Casual',
  rankedQueue: 'Rankeada (EXP)',
  rankedQueueDesc: 'Ganha ou perde EXP e sobe de patente até Supersonic Champion.',
  casualQueueDesc: 'Partida amistosa sem alterar sua patente ou EXP.',
  yourFieldName: 'Seu Nome em Campo',
  namePlaceholder: 'Digite seu apelido',
  quickOrNewRoomTitle: 'Partida Rápida ou Nova Sala',
  quickOrNewRoomDesc:
    'Encontre qualquer jogador online ou crie uma sala privada com código.',
  findQuickMatch: 'Buscar Partida Rápida',
  searchingOpponent: 'Procurando adversário... (Cancelar)',
  createCodeRoom: 'Criar Sala com Código',
  joinRoomTitle: 'Entrar em uma Sala',
  joinRoomDesc: 'Digite o código: se a partida já começou, você entra automaticamente como Espectador!',
  joinBtn: 'Entrar',
  roomCodeLabel: 'Código da Sala',
  humansCount: 'humanos',
  switchTeam: 'Trocar de Time',
  copyCode: 'Copiar Código',
  copied: 'Copiado',
  blueTeam: 'Time Azul',
  redTeam: 'Time Vermelho',
  youTag: '(Você)',
  aiLabel: 'IA',
  humanLabel: 'Humano',
  leaveRoom: 'Sair da Sala',
  startOnlineMatch: 'Iniciar Partida Online',
  waitingPlayers: 'Aguardando pelo menos 2 jogadores...',
  waitingHost: 'Aguardando o anfitrião iniciar a partida...',
  goalPausedClock: 'Gol · Relógio Pausado',
  overtimeLabel: 'Prorrogação',
  trainingModeLabel: 'Modo Treino',
  regulationLabel: 'Tempo Regulamentar',
  pausedTitle: 'Jogo Pausado',
  resumeMatch: 'Continuar Partida',
  restartMatch: 'Reiniciar (3 min)',
  exitToMenu: 'Voltar ao Menu Inicial',
  drawTitle: 'Empate!',
  youWonTitle: 'Você Venceu!',
  wonSuffix: 'Venceu!',
  blueTeamWon: 'Time Azul Venceu!',
  redTeamWon: 'Time Vermelho Venceu!',
  aiWon: 'A IA Venceu!',
  drawReason: 'Empate oficial após {max} prorrogações sem vencedor',
  overtimeDecided: 'Decidido na Prorrogação (+{sec}s)',
  playAgain: 'Jogar Novamente',
  mainMenu: 'Menu Inicial',
  staminaLabel: 'Stamina',
  powerLabel: 'Força',
  shootPowerLabel: 'Força do Chute',
  walkAimLabel: 'Andar / Mirar',
  walkAimHint: 'WASD ou Setas',
  emotesHint: 'Emotes (1–5):',
  emotes2pHint: 'Emotes: P1 (1–5) · P2 (6–0)',
  emotesBtnLabel: 'Emotes',
  actionShoot: 'Chutar',
  actionPass: 'Passar',
  actionDribble: 'Driblar',
  actionSprint: 'Correr',
  actionSwitch: 'Trocar',
  rankedSummaryTitle: 'Resultado da Rankeada',
  rankedPromoted: 'PROMOÇÃO! Nova patente: {rank}',
  rankedWin: 'Vitória Rankeada',
  rankedLoss: 'Derrota Rankeada',
  rankedDraw: 'Empate Rankeado',
  canvasGoalTitle: 'GOOOL!',
  canvasPrepareTitle: 'PREPARE-SE',
  canvasPrepareSub: 'Leve a bola ao gol adversário!',
  canvasOvertimeTitle: 'EMPATE! +30s',
  canvasOvertimeSub: 'Prorrogação {cur}/{max} — Quem fizer mais pontos vence',
  canvasPausedClock: 'Relógio pausado durante a comemoração',
  canvasScoredFor: '{scorer} marcou para o {team}',
  canvasOwnGoalScoredFor: '{otherTeam} fez ponto pro time adversário ({team})',
  serverConnectError: 'Não foi possível conectar ao servidor multiplayer.',
  connectingWaitError: 'Conectando ao servidor... Tente novamente em 1 segundo.',
  coinsLabel: 'Moedas',
  shopBtn: 'Texturas do Campo',
  shopTitle: 'Loja de Texturas do Campo',
  shopSubtitle: 'Compre novos gramados e pisos usando moedas ganhas nas partidas multiplayer.',
  multiplayerCoinsHint:
    'Você ganha moedas jogando partidas Online (Casual ou Rankeada): 60 por vitória, 35 por empate, 20 por participação + bônus por gols!',
  freeLabel: 'Grátis',
  buyBtn: 'Comprar',
  equipBtn: 'Equipar',
  equippedBadge: 'Equipado',
  insufficientCoins: 'Moedas insuficientes',
  onlineCoinsEarned: 'Recompensa Multiplayer: +{coins} moedas',
  casualSummaryTitle: 'Partida Online Finalizada',
  turfNames: {
    classic: 'Clássico Esmeralda',
    checker: 'Quadriculado Arena',
    street: 'Asfalto Urbano',
    neon: 'Cyber Neon Noturno',
    beach: 'Areia de Praia',
    futsal: 'Quadra Futsal Madeira',
    clay: 'Terrão Clássico',
    lava: 'Vulcão Magma',
    frost: 'Arena Ártica Gelo',
    sakura: 'Estádio Sakura',
    imperial: 'Estádio Imperial Ouro',
    galaxy: 'Arena Cósmica',
  },
  turfDescs: {
    classic: 'Gramado listrado tradicional de estádio profissional.',
    checker: 'Corte quadriculado de copa europeia com linhas reforçadas.',
    street: 'Piso de rua em asfalto escuro com marcações amarelas urbanas.',
    neon: 'Arena futurista escura com grade ciano e detalhes luminosos.',
    beach: 'Areia dourada de futebol de praia com linhas brancas tensionadas.',
    futsal: 'Piso envernizado de madeira de quadra coberta oficial.',
    clay: 'Campo brasileiro de terra batida com textura granulada e cal.',
    lava: 'Rocha vulcânica escura cortada por fendas incandescentes de magma.',
    frost: 'Pista glacial azulada com linhas árticas de alto contraste.',
    sakura: 'Gramado noturno refinado com pétalas de cerejeira e linhas rosa.',
    imperial: 'Gramado nobre escuro com marcações douradas imperiais.',
    galaxy: 'Campo estelar roxo profundo com poeira cósmica e linhas brilhantes.',
  },
  customizeButtonsBtn: 'Customizar Botões',
  customizerTitle: 'Customizar Controles na Tela',
  customizerSubtitle:
    'Arraste o joystick ou os botões na prévia, escolha o estilo e ajuste tamanho e transparência.',
  layoutModeLabel: 'Estilo do Layout',
  layoutRadial: 'Arco ao Redor',
  layoutSplit: 'Esquerda / Direita',
  handednessLabel: 'Posição do Joystick',
  leftJoy: 'Joystick à Esquerda',
  rightJoy: 'Joystick à Direita',
  buttonScaleLabel: 'Tamanho dos Botões',
  joystickScaleLabel: 'Tamanho do Joystick',
  joystickSensitivityLabel: 'Sensibilidade do Joystick',
  diagonalToleranceLabel: 'Tolerância da Diagonal',
  diagonalToleranceHint: 'Tempo para segurar a direção diagonal ao soltar uma tecla (0–400 ms).',
  opacityLabel: 'Transparência',
  dragHint: 'Arraste qualquer controle abaixo para ajustar a posição livremente.',
  resetHudBtn: 'Restaurar Padrão',
  doneBtn: 'Concluir',
  switchBtnToggleLabel: 'Botão Trocar Personagem (Mobile)',
  switchBtnOn: 'Ligado',
  switchBtnOff: 'Desligado',
  devModeBtn: 'Dev',
  trainingResetBallBtn: 'Resetar Bola',
  lootboxOpeningTitle: 'Abrindo Caixa...',
  lootboxSkipBtn: 'Pular',
  lootboxContinueBtn: 'Continuar',
  spectatorBadge: 'MODO ESPECTADOR',
  spectatingLive: 'Assistindo ao vivo · Sala {code}',
  liveMatchesTitle: 'Partidas Ao Vivo (Modo Espectador)',
  noLiveMatches: 'Nenhuma partida online em andamento no momento.',
  watchLiveBtn: 'Assistir Ao Vivo',
  spectatorsCountLabel: 'espectadores',
  followBall: 'Bola',
  cameraFocusLabel: 'Câmera:',
  spectatorEndedTitle: 'Partida Encerrada',
  spectatorEndedDesc: 'Você acompanhou a partida no Modo Espectador.',
  refreshLiveBtn: 'Atualizar',
  characterBtn: 'Personagem',
  characterShopTitle: 'Personalização de Personagem',
  characterShopSubtitle: 'Use suas moedas do multiplayer para personalizar cabelo, camisa, aura e chuteiras.',
  hairTab: 'Cabelo',
  colorTab: 'Cor',
  patternTab: 'Camisa',
  auraTab: 'Aura',
  cleatTab: 'Chuteira',
  jerseyNumberLabel: 'Número da Camisa',
  cosmeticNames: {
    'hair:none': 'Sem Cabelo',
    'hair:spiky': 'Cabelo Espetado',
    'hair:headband': 'Faixa Ninja',
    'hair:afro': 'Black Power',
    'hair:mohawk': 'Moicano Radical',
    'hair:horns': 'Chifres Demon',
    'hair:halo': 'Auréola Divina',
    'hair:crown': 'Coroa do Rei',
    'color:dark': 'Preto Clássico',
    'color:gold': 'Ouro Real',
    'color:ego': 'Azul Ego',
    'color:crimson': 'Carmesim',
    'color:neon': 'Rosa Neon',
    'color:silver': 'Prata Glacial',
    'pattern:solid': 'Lisa Clássica',
    'pattern:stripe': 'Faixa Vertical',
    'pattern:sash': 'Faixa Diagonal',
    'pattern:star': 'Estrela Central',
    'pattern:flame': 'Chama Imperial',
    'aura:none': 'Sem Aura',
    'aura:spark': 'Aura Faísca',
    'aura:flame': 'Aura Flamejante',
    'aura:frost': 'Aura Glacial',
    'aura:shadow': 'Aura Sombria',
    'aura:ego': 'Aura Despertar',
    'cleat:white': 'Chuteira Branca',
    'cleat:gold': 'Chuteira Ouro',
    'cleat:cyan': 'Chuteira Ciano',
    'cleat:crimson': 'Chuteira Rubi',
    'cleat:emerald': 'Chuteira Esmeralda',
  },
  skillsBtn: 'Skills & Caixas',
  skillsModalTitle: '20 Skills & Lootboxes',
  skillsModalSubtitle: 'Compre caixas com moedas multiplayer, desbloqueie habilidades especiais e equipe até 2 em campo (Z / X).',
  lootboxTab: 'Abrir Lootboxes',
  mySkillsTab: 'Coleção (20 Skills)',
  openBoxBtn: 'Abrir Caixa',
  boxResultNew: 'NOVA SKILL DESBLOQUEADA!',
  boxResultDuplicate: 'Repetida! Reembolso de +{coins} moedas',
  rarityLabels: {
    common: 'Comum',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Lendário',
    mythic: 'Mítico',
  },
  lootboxNames: {
    standard: 'Caixa Padrão',
    epic: 'Caixa Épica',
    mythic: 'Caixa Egoísta Mítica',
  },
  lootboxDescs: {
    standard: 'Ótima chance de Comuns e Raras com chance de drop raro superior.',
    epic: 'Foco em Raras e Épicas com chance elevada de Lendárias e Míticas.',
    mythic: 'Garante Raro ou superior com as maiores chances de Lendárias e Míticas.',
  },
  equippedSlotsTitle: 'Skills Equipadas em Campo',
  slotLabel: 'Slot',
  equipSlot1: 'Equipar Z (1)',
  equipSlot2: 'Equipar X (2)',
  unequipBtn: 'Remover',
  skillSlotEmpty: 'Vazio',
  skillsOwnedLabel: 'Desbloqueadas',
  watchReplayBtn: 'Assistir Melhores Momentos',
  replaysBtn: 'Replays',
  replayModalTitle: 'Melhores Momentos da Partida',
  replayModalSubtitle: 'Reveja os lances salvos das suas partidas 1P e 2P com câmera lenta e controle de tempo.',
  replayMomentGoal: 'Gol',
  replayMomentPost: 'Na Trave',
  replayMomentSkill: 'Skill',
  replayMomentSave: 'Lance',
  replaySpeedLabel: 'Velocidade',
  replayPlay: 'Reproduzir',
  replayPause: 'Pausar',
  replayPrev: 'Anterior',
  replayNext: 'Próximo',
  replaySavedMatchesLabel: 'Partidas Salvas',
  noReplaysYet: 'Nenhum replay salvo ainda. Conclua uma partida 1P ou 2P para salvar os melhores momentos!',
  landscapeOnlyTitle: 'Gire o celular para jogar',
  landscapeOnlyDesc:
    'No celular, as partidas funcionam apenas no modo paisagem (tela horizontal) para visão completa do campo e dos botões.',
  landscapeOnlyBtn: 'Ativar Tela Horizontal',
  landscapeHintBanner: 'Modo paisagem (horizontal) obrigatório durante as partidas no celular.',
  landscapeManualHint:
    'Gire o aparelho fisicamente para a horizontal (verifique se o bloqueio de rotação está desativado).',
  matchDraftTitle: 'Escolha as Skills da Partida',
  matchDraftSubtitle1p: 'Selecione até 2 habilidades para entrar em campo (Z e X).',
  matchDraftSubtitle2p: 'Jogador 1 (Z / X) e Jogador 2 (I / O) escolhem até 2 habilidades cada.',
  matchDraftSubtitleOnline: 'Escolha até 2 habilidades desbloqueadas para a partida online (Z e X).',
  draftingForLabel: 'Escolhendo para',
  randomSkillsBtn: 'Aleatório',
  clearSkillsBtn: 'Limpar',
  startWithSkillsBtn: 'Começar Partida',
  confirmOnlineSkillsBtn: 'Confirmar Skills',
  changeMatchSkillsBtn: 'Escolher Skills',
  noOnlineSkillsHint: 'Nenhuma skill desbloqueada para o Online ainda. Abra Lootboxes com moedas multiplayer ou entre direto.',
  allRaritiesLabel: 'Todas',
  mvpEyebrow: 'MVP da Partida',
  mvpWinnersSection: 'Vencedores',
  mvpDrawSection: 'Destaques em Campo',
  mvpPointsSuffix: 'PTS',
  mvpStatGoals: 'Gols',
  mvpStatAssists: 'Assist.',
  mvpStatSaves: 'Defesas',
  mvpStatSteals: 'Roubos',
  mvpStatPasses: 'Passes',
  mvpHumanBadge: 'Jogador',
  mvpYouBadge: 'Você',
  mvpContinueBtn: 'Continuar para Resumo',
  mvpReopenBtn: 'Ver MVP e Vencedores',
  unifiedShopBtn: 'Lojinha',
  unifiedShopTitle: 'Lojinha da Arena',
  unifiedShopSubtitle: 'Skills, Lootboxes, Personalização, Texturas do Campo e Animações em um só lugar.',
  tabSkills: 'Skills & Caixas',
  tabCharacter: 'Personalização',
  tabTurfs: 'Texturas',
  tabAnimations: 'Animações',
  animationsTitle: 'Animações & Tempos Customizáveis',
  animationsSubtitle: 'Desbloqueie efeitos de gol e rastros de corrida e ajuste a duração de cada animação.',
  goalAnimationsLabel: 'Animações de Gol',
  trailAnimationsLabel: 'Animações de Movimento / Rastro',
  animFieldDurationLabel: 'Duração das Animações em Campo',
  animLootboxDurationLabel: 'Tempo de Abertura das Lootboxes',
  animUiDurationLabel: 'Tempo de Animação dos Menus / UI',
  testAnimationBtn: 'Testar Animação',
  animResetTimingBtn: 'Restaurar Tempos',
  animPresetInstant: 'Instantâneo',
  animPresetFast: 'Rápido',
  animPresetDefault: 'Padrão',
  animPresetCinematic: 'Cinemático',
  animNames: {
    'goal:classic': 'Confete Clássico',
    'goal:fireworks': 'Fogos de Estádio',
    'goal:lightning': 'Relâmpago Azul',
    'goal:supernova': 'Supernova Estelar',
    'goal:matrix': 'Pulso Digital',
    'trail:standard': 'Rastro Veloz',
    'trail:flame-dash': 'Chama Ardente',
    'trail:frost-nova': 'Cristais de Gelo',
    'trail:shadow-echo': 'Ecos Sombrios',
    'trail:gold-aura': 'Órbita Dourada',
  },
  animDescs: {
    'goal:classic': 'Chuva tradicional de confetes e ondas de impacto do time.',
    'goal:fireworks': 'Múltiplas explosões de fogos de artifício coloridos sobre o gol.',
    'goal:lightning': 'Raios elétricos saindo das traves com clarão de energia.',
    'goal:supernova': 'Explosão radial intensa com duplo anel de choque luminoso.',
    'goal:matrix': 'Chuva cibernética esmeralda com fragmentos neon.',
    'trail:standard': 'Linhas aerodinâmicas limpas ao correr em campo.',
    'trail:flame-dash': 'Brasas e labaredas laranja deixando rastro ao correr e driblar.',
    'trail:frost-nova': 'Losangos de gelo brilhantes atrás do jogador em alta velocidade.',
    'trail:shadow-echo': 'Silhuetas fantasma roxas seguindo seus movimentos rápidos.',
    'trail:gold-aura': 'Partículas douradas orbitando o jogador durante o sprint.',
  },
  menuControlsBtn: 'Menu & Controles',
  menuControlsTitle: 'Controles do Menu',
  menuControlsSubtitle: 'Configure layout do menu, atalhos de teclado, tempos de animação e acesso rápido.',
  menuLayoutLabel: 'Layout do Menu Inicial',
  menuLayoutDefault: 'Padrão',
  menuLayoutCompact: 'Compacto',
  menuBackdropLabel: 'Fundo do Menu',
  menuBackdropStadium: 'Estádio Noturno',
  menuBackdropMinimal: 'Minimalista',
  menuShowRulesLabel: 'Mostrar Regras no Menu',
  menuKeyboardNavLabel: 'Atalhos de Teclado no Menu',
  menuKeyboardLegend: '1–4 Modo · Enter Jogar · L Lojinha · C Controles do Menu · M Som · Esc Fechar',
  menuQuickNavTitle: 'Acesso Rápido aos Menus',
  menuAnimTimingTitle: 'Tempos de Animação',
  menuAudioLangTitle: 'Áudio e Idioma',
  menuAnimationsLabel: 'Animações do Menu',
  pingLabel: 'Ping',
  onLabel: 'Ligado',
  offLabel: 'Desligado',
  seasonLabel: 'Temporada {num}',
  seasonResetTimerLabel: 'Reset Bronze em',
  seasonResetNotice: 'Temporada {num} começou! Todas as patentes foram resetadas para Bronze.',
  seasonDesc: 'A cada 3 semanas as patentes voltam para Bronze I (o timer continua contando com o jogo fechado).',
};

const PT_PT: TranslationDict = {
  ...PT_BR,
  mvpStatGoals: 'Golos',
  mvpYouBadge: 'Tu',
  headerDuration: '3 min + até 3×30s Prolongamento',
  soundOn: 'Som Ativo',
  soundOff: 'Sem Som',
  heroEyebrow: 'Futebol Arcade em Tempo Real',
  heroTitle: 'Leva a bola até à baliza adversária.',
  heroSubtitle:
    'Toca na bola para a prender nos pés, passa com precisão no botão Passar, controla automaticamente o jogador com bola e decide no remate ou no drible.',
  rule1Title: '3 min + até 3 Prolongamentos',
  rule1Desc:
    'O relógio pára durante a celebração do golo. Após 3 prolongamentos empatados, termina empatado.',
  rule2Title: 'Passe e Troca Automática',
  rule2Desc:
    'O joystick move e aponta, e controlas sempre o jogador da tua equipa com a bola.',
  chooseModeTitle: 'Escolhe o Modo de Jogo',
  chooseModeSubtitle:
    'Partida normal, duelo local com nomes, treino contra IA ligeira ou online rankeado.',
  mode1pTitle: '1 Jogador',
  mode1pDesc: 'Modo normal vs IA',
  mode2pTitle: '2 Jogadores',
  mode2pDesc: 'Multijogador local',
  modeTrainingTitle: 'Modo Treino',
  modeTrainingDesc: 'IA ligeira para treinar',
  modeOnlineTitle: 'Online',
  modeOnlineDesc: 'Casual ou Rankeada',
  teamFormat: 'Formato das Equipas',
  localP1Label: 'Nome Jogador 1 (Azul)',
  localP2Label: 'Nome Jogador 2 (Vermelho)',
  openOnlineLobby: 'Abrir Lobby Online',
  startTraining: 'Iniciar Treino',
  startMatch: 'Iniciar Partida',
  footerControls1p:
    '1P/Treino: WASD/Setas · Shift Correr · E Passar/Trocar · G Driblar · Z/X Skills · Segurar Espaço/F Rematar · 1–5 Emotes',
  footerControls2p:
    '2P Local: P1 WASD + Shift/E/G/F (Z/X) · P2 Setas + Shift Dir./J/L/K (I/O · 6–0)',
  saveAndRankBtn: 'Save & Rankeada',
  saveModalTitle: 'Perfil, Patente e Sistema de Save',
  saveModalSubtitle: 'Guarda o teu progresso local, sincroniza na nuvem e consulta o ranking.',
  close: 'Fechar',
  expToNext: 'Faltam {exp} EXP para {rank}',
  maxRankReached: 'Patente Máxima Alcançada!',
  careerStatsTitle: 'Estatísticas de Carreira',
  totalMatchesLabel: 'Jogos',
  totalGoalsLabel: 'Golos',
  localSaveTitle: 'Save Local (Navegador)',
  cloudSaveTitle: 'Save na Nuvem (Google)',
  lastSavedAt: 'Último save: {date}',
  notSavedYet: 'Ainda não guardado manualmente',
  saveNow: 'Guardar Agora',
  loadSave: 'Carregar Save',
  resetSave: 'Repor Save',
  confirmReset: 'Confirmar Reposição?',
  saveFeedbackSaved: 'Progresso guardado com sucesso!',
  saveFeedbackLoaded: 'Save carregado!',
  saveFeedbackReset: 'Save reposto para Bronze (0 EXP).',
  saveFeedbackSynced: 'Progresso sincronizado com a nuvem!',
  signInGoogle: 'Entrar com Google',
  signOutGoogle: 'Terminar Sessão',
  syncCloudNow: 'Sincronizar Nuvem',
  cloudSignedInAs: 'Ligado como {name}',
  cloudNotSignedIn: 'Entra com Google para guardar a tua patente na nuvem e entrar no Ranking Global.',
  matchHistoryTitle: 'Últimos Jogos',
  noMatchesYet: 'Ainda sem jogos registados.',
  leaderboardEmpty: 'Ainda não há jogadores ranqueados na nuvem.',
  refreshLeaderboard: 'Atualizar',
  backToMenu: 'Voltar ao Menu',
  serverConnected: 'Servidor Ligado',
  connecting: 'A ligar...',
  onlineTitle: 'Multijogador Online',
  onlineSubtitle:
    'Joga em tempo real pela internet em salas {size} vs {size} (lugares vazios usam IA).',
  queueTypeLabel: 'Tipo de Jogo',
  yourFieldName: 'O Teu Nome em Campo',
  namePlaceholder: 'Escreve a tua alcunha',
  quickOrNewRoomTitle: 'Jogo Rápido ou Nova Sala',
  quickOrNewRoomDesc:
    'Encontra qualquer jogador online ou cria uma sala privada com código.',
  findQuickMatch: 'Procurar Jogo Rápido',
  searchingOpponent: 'A procurar adversário... (Cancelar)',
  createCodeRoom: 'Criar Sala com Código',
  joinRoomTitle: 'Entrar numa Sala',
  joinRoomDesc: 'Insere o código: se o jogo já começou, entras automaticamente como Espectador!',
  joinBtn: 'Entrar',
  roomCodeLabel: 'Código da Sala',
  switchTeam: 'Trocar de Equipa',
  copyCode: 'Copiar Código',
  copied: 'Copiado',
  blueTeam: 'Equipa Azul',
  redTeam: 'Equipa Vermelha',
  youTag: '(Tu)',
  leaveRoom: 'Sair da Sala',
  startOnlineMatch: 'Iniciar Jogo Online',
  waitingPlayers: 'A aguardar pelo menos 2 jogadores...',
  waitingHost: 'A aguardar que o anfitrião inicie o jogo...',
  goalPausedClock: 'Golo · Relógio Pausado',
  overtimeLabel: 'Prolongamento',
  regulationLabel: 'Tempo Regulamentar',
  pausedTitle: 'Jogo em Pausa',
  resumeMatch: 'Continuar Jogo',
  exitToMenu: 'Voltar ao Menu Inicial',
  youWonTitle: 'Venceste!',
  blueTeamWon: 'Equipa Azul Venceu!',
  redTeamWon: 'Equipa Vermelha Venceu!',
  drawReason: 'Empate oficial após {max} prolongamentos sem vencedor',
  overtimeDecided: 'Decidido no Prolongamento (+{sec}s)',
  playAgain: 'Jogar Novamente',
  actionShoot: 'Rematar',
  actionSprint: 'Correr',
  shootPowerLabel: 'Força do Remate',
  walkAimLabel: 'Andar / Apontar',
  walkAimHint: 'WASD ou Setas',
  canvasGoalTitle: 'GOLOOO!',
  canvasPrepareTitle: 'PREPARA-TE',
  canvasPrepareSub: 'Leva a bola até à baliza adversária!',
  canvasOvertimeTitle: 'EMPATE! +30s',
  canvasOvertimeSub: 'Prolongamento {cur}/{max} — Quem marcar mais vence',
  canvasPausedClock: 'Relógio pausado durante a celebração',
  canvasScoredFor: '{scorer} marcou pela {team}',
  canvasOwnGoalScoredFor: '{otherTeam} fez ponto para a equipa adversária ({team})',
  serverConnectError: 'Não foi possível ligar ao servidor multijogador.',
  connectingWaitError: 'A ligar ao servidor... Tenta novamente dentro de 1 segundo.',
  turfNames: {
    ...PT_BR.turfNames,
    classic: 'Clássico Esmeralda',
    futsal: 'Pavilhão Futsal Madeira',
  },
  matchDraftTitle: 'Escolhe as Skills do Jogo',
  matchDraftSubtitle1p: 'Seleciona até 2 habilidades para entrar em campo (Z e X).',
  matchDraftSubtitle2p: 'Jogador 1 (Z / X) e Jogador 2 (I / O) escolhem até 2 habilidades cada.',
  matchDraftSubtitleOnline: 'Escolhe até 2 habilidades desbloqueadas para o jogo online (Z e X).',
  startWithSkillsBtn: 'Começar Jogo',
  trainingResetBallBtn: 'Repor Bola',
  unifiedShopBtn: 'Lojinha',
  unifiedShopTitle: 'Lojinha da Arena',
  unifiedShopSubtitle: 'Skills, Lootboxes, Personalização, Texturas do Relvado e Animações num só sítio.',
  menuControlsBtn: 'Menu & Controlos',
  menuControlsTitle: 'Controlos do Menu',
  menuControlsSubtitle: 'Configura o layout do menu, atalhos de teclado, tempos de animação e acesso rápido.',
};

const EN_US: TranslationDict = {
  appName: 'Arena Soccer',
  headerDuration: '3 min + up to 3×30s Overtime',
  soundOn: 'Sound On',
  soundOff: 'Muted',
  heroEyebrow: 'Real-Time Arcade Soccer',
  heroTitle: 'Drive the ball into the opponent goal.',
  heroSubtitle:
    'Touch the ball to trap it at your feet, pass crisply with Pass, auto-control the teammate with the ball, and score with charged shots or dribbles.',
  rule1Title: '3 min + up to 3 Overtimes',
  rule1Desc:
    'The clock pauses during goal celebrations. After 3 tied overtimes, the match ends in a draw.',
  rule2Title: 'Pass & Auto-Switch Control',
  rule2Desc:
    'Joystick moves and aims, and you always control the player on your team who has the ball.',
  chooseModeTitle: 'Choose Game Mode',
  chooseModeSubtitle:
    'Standard match, local duel with custom names, light AI training, or ranked online.',
  mode1pTitle: '1 Player',
  mode1pDesc: 'Normal mode vs AI',
  mode2pTitle: '2 Players',
  mode2pDesc: 'Local multiplayer',
  modeTrainingTitle: 'Training Mode',
  modeTrainingDesc: 'Light AI practice',
  modeOnlineTitle: 'Online',
  modeOnlineDesc: 'Casual or Ranked',
  teamFormat: 'Team Format',
  localP1Label: 'Player 1 Name (Blue)',
  localP2Label: 'Player 2 Name (Red)',
  localP1Placeholder: 'Player 1',
  localP2Placeholder: 'Player 2',
  openOnlineLobby: 'Open Online Lobby',
  startTraining: 'Start Training',
  startMatch: 'Start Match',
  footerControls1p:
    '1P/Training: WASD/Arrows · Shift Sprint · E Pass/Switch · G Dribble · Z/X Skills · Hold Space/F Shoot · 1–5 Emotes',
  footerControls2p:
    '2P Local: P1 WASD + Shift/E/G/F (Z/X) · P2 Arrows + R-Shift/J/L/K (I/O · 6–0)',
  saveAndRankBtn: 'Save & Ranked',
  saveModalTitle: 'Profile, Rank & Save System',
  saveModalSubtitle: 'Save local progress, sync to the cloud, and view global rankings.',
  close: 'Close',
  playerNameLabel: 'Player Name',
  currentRankLabel: 'Current Rank',
  expToNext: '{exp} EXP needed for {rank}',
  maxRankReached: 'Highest Rank Reached!',
  careerStatsTitle: 'Career Stats',
  rankedRecordLabel: 'Ranked (W / D / L)',
  totalMatchesLabel: 'Matches',
  totalGoalsLabel: 'Goals',
  localSaveTitle: 'Local Save (Browser)',
  cloudSaveTitle: 'Cloud Save (Google)',
  lastSavedAt: 'Last saved: {date}',
  notSavedYet: 'Not manually saved yet',
  saveNow: 'Save Now',
  loadSave: 'Load Save',
  resetSave: 'Reset Save',
  confirmReset: 'Confirm Reset?',
  saveFeedbackSaved: 'Progress saved locally!',
  saveFeedbackLoaded: 'Save loaded!',
  saveFeedbackReset: 'Save reset to Bronze (0 EXP).',
  saveFeedbackSynced: 'Cloud progress synced!',
  signInGoogle: 'Sign in with Google',
  signOutGoogle: 'Sign Out',
  syncCloudNow: 'Sync Cloud',
  cloudSignedInAs: 'Signed in as {name}',
  cloudNotSignedIn: 'Sign in with Google to save your rank to the cloud and join the Global Leaderboard.',
  matchHistoryTitle: 'Recent Matches',
  noMatchesYet: 'No matches recorded yet.',
  leaderboardTitle: 'Global Leaderboard (Top EXP)',
  leaderboardEmpty: 'No ranked players on the cloud leaderboard yet.',
  refreshLeaderboard: 'Refresh',
  rankProgressionTitle: 'Ranked Tiers (10 Ranks · Levels I–III)',
  backToMenu: 'Back to Menu',
  serverConnected: 'Server Connected',
  connecting: 'Connecting...',
  onlineTitle: 'Online Multiplayer',
  onlineSubtitle:
    'Play live online in {size} vs {size} rooms (empty slots are filled by AI).',
  queueTypeLabel: 'Match Type',
  casualQueue: 'Casual',
  rankedQueue: 'Ranked (EXP)',
  rankedQueueDesc: 'Win or lose EXP and climb tiers up to Supersonic Champion.',
  casualQueueDesc: 'Friendly match without affecting your rank or EXP.',
  yourFieldName: 'Your Field Name',
  namePlaceholder: 'Enter your nickname',
  quickOrNewRoomTitle: 'Quick Match or New Room',
  quickOrNewRoomDesc: 'Match with any online player or create a private room code.',
  findQuickMatch: 'Find Quick Match',
  searchingOpponent: 'Searching opponent... (Cancel)',
  createCodeRoom: 'Create Room with Code',
  joinRoomTitle: 'Join a Room',
  joinRoomDesc: 'Enter the 5-letter code: if the match already started, you join as Spectator!',
  joinBtn: 'Join',
  roomCodeLabel: 'Room Code',
  humansCount: 'humans',
  switchTeam: 'Switch Team',
  copyCode: 'Copy Code',
  copied: 'Copied',
  blueTeam: 'Blue Team',
  redTeam: 'Red Team',
  youTag: '(You)',
  aiLabel: 'AI',
  humanLabel: 'Human',
  leaveRoom: 'Leave Room',
  startOnlineMatch: 'Start Online Match',
  waitingPlayers: 'Waiting for at least 2 players...',
  waitingHost: 'Waiting for the host to start the match...',
  goalPausedClock: 'Goal · Clock Paused',
  overtimeLabel: 'Overtime',
  trainingModeLabel: 'Training Mode',
  regulationLabel: 'Regulation Time',
  pausedTitle: 'Game Paused',
  resumeMatch: 'Resume Match',
  restartMatch: 'Restart (3 min)',
  exitToMenu: 'Exit to Main Menu',
  drawTitle: 'Draw!',
  youWonTitle: 'You Won!',
  wonSuffix: 'Won!',
  blueTeamWon: 'Blue Team Won!',
  redTeamWon: 'Red Team Won!',
  aiWon: 'AI Won!',
  drawReason: 'Official draw after {max} overtimes without a winner',
  overtimeDecided: 'Decided in Overtime (+{sec}s)',
  playAgain: 'Play Again',
  mainMenu: 'Main Menu',
  staminaLabel: 'Stamina',
  powerLabel: 'Power',
  shootPowerLabel: 'Shot Power',
  walkAimLabel: 'Move / Aim',
  walkAimHint: 'WASD or Arrows',
  emotesHint: 'Emotes (1–5):',
  emotes2pHint: 'Emotes: P1 (1–5) · P2 (6–0)',
  emotesBtnLabel: 'Emotes',
  actionShoot: 'Shoot',
  actionPass: 'Pass',
  actionDribble: 'Dribble',
  actionSprint: 'Sprint',
  actionSwitch: 'Switch',
  rankedSummaryTitle: 'Ranked Match Result',
  rankedPromoted: 'PROMOTED! New rank: {rank}',
  rankedWin: 'Ranked Victory',
  rankedLoss: 'Ranked Defeat',
  rankedDraw: 'Ranked Draw',
  canvasGoalTitle: 'GOOOAL!',
  canvasPrepareTitle: 'GET READY',
  canvasPrepareSub: 'Take the ball to the opponent goal!',
  canvasOvertimeTitle: 'TIE! +30s',
  canvasOvertimeSub: 'Overtime {cur}/{max} — Highest score wins',
  canvasPausedClock: 'Clock paused during goal celebration',
  canvasScoredFor: '{scorer} scored for {team}',
  canvasOwnGoalScoredFor: '{otherTeam} scored a point for the opposing team ({team})',
  serverConnectError: 'Could not connect to the multiplayer server.',
  connectingWaitError: 'Connecting to server... Try again in 1 second.',
  coinsLabel: 'Coins',
  shopBtn: 'Pitch Textures',
  shopTitle: 'Pitch Texture Shop',
  shopSubtitle: 'Unlock new field surfaces using coins earned from multiplayer matches.',
  multiplayerCoinsHint:
    'Earn coins in Online Multiplayer (Casual or Ranked): 60 per win, 35 per draw, 20 per match + goal bonuses!',
  freeLabel: 'Free',
  buyBtn: 'Buy',
  equipBtn: 'Equip',
  equippedBadge: 'Equipped',
  insufficientCoins: 'Not enough coins',
  onlineCoinsEarned: 'Multiplayer Reward: +{coins} coins',
  casualSummaryTitle: 'Online Match Complete',
  turfNames: {
    classic: 'Classic Emerald',
    checker: 'Arena Checkerboard',
    street: 'Urban Street Asphalt',
    neon: 'Cyber Neon Night',
    beach: 'Golden Beach Sand',
    futsal: 'Indoor Wood Court',
    clay: 'Classic Red Clay',
    lava: 'Volcanic Magma',
    frost: 'Arctic Frost Ice',
    sakura: 'Sakura Blossom Turf',
    imperial: 'Imperial Gold Turf',
    galaxy: 'Cosmic Galaxy Arena',
  },
  turfDescs: {
    classic: 'Traditional striped stadium grass with crisp white lines.',
    checker: 'European cup checkerboard mowing pattern with bold markings.',
    street: 'Gritty urban street asphalt pitch with bold yellow street markings.',
    neon: 'Dark futuristic cyber turf with glowing cyan grid details.',
    beach: 'Warm coastal beach sand pitch with crisp taut white tape lines.',
    futsal: 'Warm polished hardwood court with official indoor lines.',
    clay: 'Iconic compacted red-clay field with subtle chalk lines.',
    lava: 'Obsidian volcanic stone etched with glowing molten magma veins.',
    frost: 'Glacial ice-blue pitch surface with high-contrast arctic markings.',
    sakura: 'Twilight emerald stadium speckled with delicate cherry-blossom petals.',
    imperial: 'Rich deep obsidian turf finished with metallic gold lines.',
    galaxy: 'Deep cosmic nebula turf sparkling with starlight and violet grid lines.',
  },
  customizeButtonsBtn: 'Customize Buttons',
  customizerTitle: 'Customize On-Screen Controls',
  customizerSubtitle:
    'Drag any button or joystick on the preview, switch presets, and tune size and opacity.',
  layoutModeLabel: 'Control Layout',
  layoutRadial: 'Arc Around Stick',
  layoutSplit: 'Left / Right Split',
  handednessLabel: 'Joystick Side',
  leftJoy: 'Left Joystick',
  rightJoy: 'Right Joystick',
  buttonScaleLabel: 'Button Size',
  joystickScaleLabel: 'Joystick Size',
  joystickSensitivityLabel: 'Joystick Sensitivity',
  diagonalToleranceLabel: 'Diagonal Tolerance',
  diagonalToleranceHint: 'Grace window keeping diagonal aim when releasing a key (0–400 ms).',
  opacityLabel: 'Opacity',
  dragHint: 'Drag any control below to adjust its position freely.',
  resetHudBtn: 'Reset Defaults',
  doneBtn: 'Done',
  switchBtnToggleLabel: 'Switch Player Button (Mobile)',
  switchBtnOn: 'On',
  switchBtnOff: 'Off',
  devModeBtn: 'Dev',
  trainingResetBallBtn: 'Reset Ball',
  lootboxOpeningTitle: 'Opening Crate...',
  lootboxSkipBtn: 'Skip',
  lootboxContinueBtn: 'Continue',
  spectatorBadge: 'SPECTATOR MODE',
  spectatingLive: 'Watching live · Room {code}',
  liveMatchesTitle: 'Live Matches (Spectator Mode)',
  noLiveMatches: 'No live online matches running right now.',
  watchLiveBtn: 'Watch Live',
  spectatorsCountLabel: 'spectators',
  followBall: 'Ball',
  cameraFocusLabel: 'Camera:',
  spectatorEndedTitle: 'Match Ended',
  spectatorEndedDesc: 'You watched the full match in Spectator Mode.',
  refreshLiveBtn: 'Refresh',
  characterBtn: 'Character',
  characterShopTitle: 'Character Customization',
  characterShopSubtitle: 'Spend multiplayer coins on hair, jerseys, auras, and cleats.',
  hairTab: 'Hair',
  colorTab: 'Color',
  patternTab: 'Jersey',
  auraTab: 'Aura',
  cleatTab: 'Cleats',
  jerseyNumberLabel: 'Jersey Number',
  cosmeticNames: {
    'hair:none': 'Clean',
    'hair:spiky': 'Spiky Hair',
    'hair:headband': 'Headband',
    'hair:afro': 'Afro',
    'hair:mohawk': 'Mohawk',
    'hair:horns': 'Demon Horns',
    'hair:halo': 'Divine Halo',
    'hair:crown': "King's Crown",
    'color:dark': 'Obsidian',
    'color:gold': 'Royal Gold',
    'color:ego': 'Ego Cyan',
    'color:crimson': 'Crimson',
    'color:neon': 'Neon Pink',
    'color:silver': 'Glacial Silver',
    'pattern:solid': 'Classic Solid',
    'pattern:stripe': 'Center Stripe',
    'pattern:sash': 'Diagonal Sash',
    'pattern:star': 'Center Star',
    'pattern:flame': 'Imperial Flame',
    'aura:none': 'No Aura',
    'aura:spark': 'Spark Trail',
    'aura:flame': 'Flame Trail',
    'aura:frost': 'Frost Trail',
    'aura:shadow': 'Shadow Trail',
    'aura:ego': 'Awakened Ego',
    'cleat:white': 'White Cleats',
    'cleat:gold': 'Gold Cleats',
    'cleat:cyan': 'Cyan Cleats',
    'cleat:crimson': 'Crimson Cleats',
    'cleat:emerald': 'Emerald Cleats',
  },
  skillsBtn: 'Skills & Crates',
  skillsModalTitle: '20 Skills & Lootboxes',
  skillsModalSubtitle: 'Open lootboxes using multiplayer coins, unlock 20 skills, and equip up to 2 on pitch (Z / X).',
  lootboxTab: 'Open Lootboxes',
  mySkillsTab: 'Collection (20 Skills)',
  openBoxBtn: 'Open Crate',
  boxResultNew: 'NEW SKILL UNLOCKED!',
  boxResultDuplicate: 'Duplicate! Refunded +{coins} coins',
  rarityLabels: {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
    mythic: 'Mythic',
  },
  lootboxNames: {
    standard: 'Standard Crate',
    epic: 'Epic Crate',
    mythic: 'Mythic Ego Crate',
  },
  lootboxDescs: {
    standard: 'Solid chance for Common and Rare skills with an upside shot at Epic+.',
    epic: 'Focused on Rare and Epic pulls with boosted Legendary & Mythic odds.',
    mythic: 'Guarantees Rare+ with top-tier Legendary and Mythic drop rates.',
  },
  equippedSlotsTitle: 'Equipped Pitch Skills',
  slotLabel: 'Slot',
  equipSlot1: 'Equip Z (1)',
  equipSlot2: 'Equip X (2)',
  unequipBtn: 'Unequip',
  skillSlotEmpty: 'Empty',
  skillsOwnedLabel: 'Unlocked',
  watchReplayBtn: 'Watch Best Moments',
  replaysBtn: 'Replays',
  replayModalTitle: 'Match Highlights Replay',
  replayModalSubtitle: 'Rewatch saved 1P & 2P best moments with timeline scrubbing and slow-motion playback.',
  replayMomentGoal: 'Goal',
  replayMomentPost: 'Woodwork',
  replayMomentSkill: 'Skill',
  replayMomentSave: 'Play',
  replaySpeedLabel: 'Speed',
  replayPlay: 'Play',
  replayPause: 'Pause',
  replayPrev: 'Previous',
  replayNext: 'Next',
  replaySavedMatchesLabel: 'Saved Matches',
  noReplaysYet: 'No saved replays yet. Finish a 1P or 2P match to save its best moments!',
  landscapeOnlyTitle: 'Rotate Your Phone to Play',
  landscapeOnlyDesc:
    'On mobile devices, matches can only be played in landscape mode for full pitch visibility and responsive touch controls.',
  landscapeOnlyBtn: 'Switch to Landscape Fullscreen',
  landscapeHintBanner: 'Landscape mode is required while playing on mobile.',
  landscapeManualHint:
    'Please rotate your phone sideways physically (make sure rotation lock is turned off).',
  matchDraftTitle: 'Choose Match Skills',
  matchDraftSubtitle1p: 'Pick up to 2 skills before kickoff (Z and X).',
  matchDraftSubtitle2p: 'Player 1 (Z / X) and Player 2 (I / O) each pick up to 2 skills.',
  matchDraftSubtitleOnline: 'Pick up to 2 unlocked skills for this online match (Z and X).',
  draftingForLabel: 'Picking for',
  randomSkillsBtn: 'Random',
  clearSkillsBtn: 'Clear',
  startWithSkillsBtn: 'Start Match',
  confirmOnlineSkillsBtn: 'Confirm Skills',
  changeMatchSkillsBtn: 'Choose Skills',
  noOnlineSkillsHint: 'No online skills unlocked yet. Open Lootboxes with multiplayer coins or continue without skills.',
  allRaritiesLabel: 'All',
  mvpEyebrow: 'Match MVP',
  mvpWinnersSection: 'Winners',
  mvpDrawSection: 'Match Standouts',
  mvpPointsSuffix: 'PTS',
  mvpStatGoals: 'Goals',
  mvpStatAssists: 'Assists',
  mvpStatSaves: 'Saves',
  mvpStatSteals: 'Steals',
  mvpStatPasses: 'Passes',
  mvpHumanBadge: 'Player',
  mvpYouBadge: 'You',
  mvpContinueBtn: 'Continue to Summary',
  mvpReopenBtn: 'View MVP & Winners',
  unifiedShopBtn: 'Arena Shop',
  unifiedShopTitle: 'Unified Arena Shop',
  unifiedShopSubtitle: 'Skills, Lootboxes, Character Customization, Pitch Textures, and Animations in one place.',
  tabSkills: 'Skills & Crates',
  tabCharacter: 'Customization',
  tabTurfs: 'Textures',
  tabAnimations: 'Animations',
  animationsTitle: 'Animations & Custom Timing',
  animationsSubtitle: 'Unlock goal celebrations and sprint trails, and tune every animation duration.',
  goalAnimationsLabel: 'Goal Celebrations',
  trailAnimationsLabel: 'Movement / Sprint Trails',
  animFieldDurationLabel: 'On-Pitch Animation Duration',
  animLootboxDurationLabel: 'Lootbox Opening Time',
  animUiDurationLabel: 'Menu / UI Animation Time',
  testAnimationBtn: 'Preview Animation',
  animResetTimingBtn: 'Reset Timings',
  animPresetInstant: 'Instant',
  animPresetFast: 'Fast',
  animPresetDefault: 'Default',
  animPresetCinematic: 'Cinematic',
  animNames: {
    'goal:classic': 'Classic Confetti',
    'goal:fireworks': 'Stadium Fireworks',
    'goal:lightning': 'Blue Lightning',
    'goal:supernova': 'Stellar Supernova',
    'goal:matrix': 'Digital Pulse',
    'trail:standard': 'Speed Lines',
    'trail:flame-dash': 'Flame Dash',
    'trail:frost-nova': 'Frost Crystals',
    'trail:shadow-echo': 'Shadow Echoes',
    'trail:gold-aura': 'Golden Orbit',
  },
  animDescs: {
    'goal:classic': 'Traditional stadium confetti and team shockwaves.',
    'goal:fireworks': 'Multi-burst stadium fireworks exploding above the goal.',
    'goal:lightning': 'Jagged electric bolts arcing from the goalposts.',
    'goal:supernova': 'Intense radial supernova flare with double shockwave rings.',
    'goal:matrix': 'Emerald cyber rain and glowing neon pulse.',
    'trail:standard': 'Crisp aerodynamic sprint lines on the turf.',
    'trail:flame-dash': 'Blazing orange embers trailing behind sprinting and dribbling.',
    'trail:frost-nova': 'Crystalline ice diamonds shimmering behind rapid movement.',
    'trail:shadow-echo': 'Violet phantom afterimages following high-speed runs.',
    'trail:gold-aura': 'Spinning golden sparks orbiting your player on the pitch.',
  },
  menuControlsBtn: 'Menu Controls',
  menuControlsTitle: 'Menu Controls',
  menuControlsSubtitle: 'Customize menu layout, keyboard navigation shortcuts, animation timings, and quick jumps.',
  menuLayoutLabel: 'Main Menu Layout',
  menuLayoutDefault: 'Default',
  menuLayoutCompact: 'Compact',
  menuBackdropLabel: 'Menu Backdrop',
  menuBackdropStadium: 'Night Stadium',
  menuBackdropMinimal: 'Minimal',
  menuShowRulesLabel: 'Show Rules on Menu',
  menuKeyboardNavLabel: 'Menu Keyboard Shortcuts',
  menuKeyboardLegend: '1–4 Mode · Enter Play · L Shop · C Menu Controls · M Sound · Esc Close',
  menuQuickNavTitle: 'Quick Menu Navigation',
  menuAnimTimingTitle: 'Animation Timings',
  menuAudioLangTitle: 'Audio & Language',
  menuAnimationsLabel: 'Menu Animations',
  pingLabel: 'Ping',
  onLabel: 'On',
  offLabel: 'Off',
  seasonLabel: 'Season {num}',
  seasonResetTimerLabel: 'Bronze Reset in',
  seasonResetNotice: 'Season {num} has begun! All ranks have been reset to Bronze.',
  seasonDesc: 'Every 3 weeks all ranks reset back to Bronze I (timer runs even while the game is closed).',
};

const ES: TranslationDict = {
  appName: 'Arena Fútbol',
  headerDuration: '3 min + hasta 3×30s Prórroga',
  soundOn: 'Sonido Activo',
  soundOff: 'Silenciado',
  heroEyebrow: 'Fútbol Arcade en Tiempo Real',
  heroTitle: 'Lleva el balón hasta la portería rival.',
  heroSubtitle:
    'Toca el balón para pegarlo a tus pies, pasa con precisión con Pasar, controla automáticamente al jugador con balón y define con tiro cargado o regate.',
  rule1Title: '3 min + hasta 3 Prórrogas',
  rule1Desc:
    'El reloj se detiene en la celebración del gol. Tras 3 prórrogas empatadas, termina en empate.',
  rule2Title: 'Pase y Cambio Automático',
  rule2Desc:
    'El joystick mueve y apunta, y siempre controlas al jugador de tu equipo que tiene el balón.',
  chooseModeTitle: 'Elige el Modo de Juego',
  chooseModeSubtitle:
    'Partido normal, duelo local con nombres, entrenamiento contra IA suave u online clasificatorio.',
  mode1pTitle: '1 Jugador',
  mode1pDesc: 'Modo normal vs IA',
  mode2pTitle: '2 Jugadores',
  mode2pDesc: 'Multijugador local',
  modeTrainingTitle: 'Modo Entreno',
  modeTrainingDesc: 'IA suave para entrenar',
  modeOnlineTitle: 'Online',
  modeOnlineDesc: 'Casual o Rankeada',
  teamFormat: 'Formato de Equipos',
  localP1Label: 'Nombre Jugador 1 (Azul)',
  localP2Label: 'Nombre Jugador 2 (Rojo)',
  localP1Placeholder: 'Jugador 1',
  localP2Placeholder: 'Jugador 2',
  openOnlineLobby: 'Abrir Lobby Online',
  startTraining: 'Iniciar Entreno',
  startMatch: 'Iniciar Partido',
  footerControls1p:
    '1P/Entreno: WASD/Flechas · Shift Correr · E Pasar/Cambiar · G Regatear · Z/X Skills · Mantener Espacio/F Chutar · 1–5 Emotes',
  footerControls2p:
    '2P Local: P1 WASD + Shift/E/G/F (Z/X) · P2 Flechas + Shift Der./J/L/K (I/O · 6–0)',
  saveAndRankBtn: 'Save y Rango',
  saveModalTitle: 'Perfil, Rango y Sistema de Guardado',
  saveModalSubtitle: 'Guarda tu progreso local, sincroniza en la nube y mira el ranking.',
  close: 'Cerrar',
  playerNameLabel: 'Nombre del Jugador',
  currentRankLabel: 'Rango Actual',
  expToNext: 'Faltan {exp} EXP para {rank}',
  maxRankReached: '¡Rango Máximo Alcanzado!',
  careerStatsTitle: 'Estadísticas de Carrera',
  rankedRecordLabel: 'Rankeada (V / E / D)',
  totalMatchesLabel: 'Partidos',
  totalGoalsLabel: 'Goles',
  localSaveTitle: 'Guardado Local (Navegador)',
  cloudSaveTitle: 'Guardado en la Nube (Google)',
  lastSavedAt: 'Último guardado: {date}',
  notSavedYet: 'Aún no guardado manualmente',
  saveNow: 'Guardar Ahora',
  loadSave: 'Cargar Save',
  resetSave: 'Reiniciar Save',
  confirmReset: '¿Confirmar Reinicio?',
  saveFeedbackSaved: '¡Progreso guardado con éxito!',
  saveFeedbackLoaded: '¡Partida guardada cargada!',
  saveFeedbackReset: 'Guardado reiniciado a Bronce (0 EXP).',
  saveFeedbackSynced: '¡Progreso sincronizado con la nube!',
  signInGoogle: 'Entrar con Google',
  signOutGoogle: 'Cerrar Sesión',
  syncCloudNow: 'Sincronizar Nube',
  cloudSignedInAs: 'Conectado como {name}',
  cloudNotSignedIn: 'Inicia sesión con Google para guardar tu rango en la nube y entrar en el Ranking Global.',
  matchHistoryTitle: 'Últimos Partidos',
  noMatchesYet: 'Aún no hay partidos registrados.',
  leaderboardTitle: 'Ranking Global (Top EXP)',
  leaderboardEmpty: 'Aún no hay jugadores rankeados en la nube.',
  refreshLeaderboard: 'Actualizar',
  rankProgressionTitle: 'Rangos Clasificatorios (10 Rangos · Niveles I–III)',
  backToMenu: 'Volver al Menú',
  serverConnected: 'Servidor Conectado',
  connecting: 'Conectando...',
  onlineTitle: 'Multijugador Online',
  onlineSubtitle:
    'Juega en tiempo real por internet en salas {size} vs {size} (los huecos libres usan IA).',
  queueTypeLabel: 'Tipo de Partido',
  casualQueue: 'Casual',
  rankedQueue: 'Rankeada (EXP)',
  rankedQueueDesc: 'Gana o pierde EXP y sube de rango hasta Supersonic Champion.',
  casualQueueDesc: 'Partido amistoso sin afectar tu rango ni tu EXP.',
  yourFieldName: 'Tu Nombre en Campo',
  namePlaceholder: 'Escribe tu apodo',
  quickOrNewRoomTitle: 'Partida Rápida o Nueva Sala',
  quickOrNewRoomDesc:
    'Encuentra a cualquier jugador online o crea una sala privada con código.',
  findQuickMatch: 'Buscar Partida Rápida',
  searchingOpponent: 'Buscando rival... (Cancelar)',
  createCodeRoom: 'Crear Sala con Código',
  joinRoomTitle: 'Unirse a una Sala',
  joinRoomDesc: 'Introduce el código: ¡si el partido ya empezó, entras como Espectador!',
  joinBtn: 'Entrar',
  roomCodeLabel: 'Código de Sala',
  humansCount: 'humanos',
  switchTeam: 'Cambiar de Equipo',
  copyCode: 'Copiar Código',
  copied: 'Copiado',
  blueTeam: 'Equipo Azul',
  redTeam: 'Equipo Rojo',
  youTag: '(Tú)',
  aiLabel: 'IA',
  humanLabel: 'Humano',
  leaveRoom: 'Salir de la Sala',
  startOnlineMatch: 'Iniciar Partido Online',
  waitingPlayers: 'Esperando al menos 2 jugadores...',
  waitingHost: 'Esperando a que el anfitrión inicie el partido...',
  goalPausedClock: 'Gol · Reloj Pausado',
  overtimeLabel: 'Prórroga',
  trainingModeLabel: 'Modo Entreno',
  regulationLabel: 'Tiempo Reglamentario',
  pausedTitle: 'Juego en Pausa',
  resumeMatch: 'Continuar Partido',
  restartMatch: 'Reiniciar (3 min)',
  exitToMenu: 'Volver al Menú Principal',
  drawTitle: '¡Empate!',
  youWonTitle: '¡Ganaste!',
  wonSuffix: '¡Ganó!',
  blueTeamWon: '¡Equipo Azul Ganó!',
  redTeamWon: '¡Equipo Rojo Ganó!',
  aiWon: '¡La IA Ganó!',
  drawReason: 'Empate oficial tras {max} prórrogas sin ganador',
  overtimeDecided: 'Decidido en la Prórroga (+{sec}s)',
  playAgain: 'Jugar de Nuevo',
  mainMenu: 'Menú Principal',
  staminaLabel: 'Energía',
  powerLabel: 'Fuerza',
  shootPowerLabel: 'Fuerza del Tiro',
  walkAimLabel: 'Mover / Apuntar',
  walkAimHint: 'WASD o Flechas',
  emotesHint: 'Emotes (1–5):',
  emotes2pHint: 'Emotes: J1 (1–5) · J2 (6–0)',
  emotesBtnLabel: 'Emotes',
  actionShoot: 'Chutar',
  actionPass: 'Pasar',
  actionDribble: 'Regatear',
  actionSprint: 'Correr',
  actionSwitch: 'Cambiar',
  rankedSummaryTitle: 'Resultado de Rankeada',
  rankedPromoted: '¡ASCENSO! Nuevo rango: {rank}',
  rankedWin: 'Victoria Rankeada',
  rankedLoss: 'Derrota Rankeada',
  rankedDraw: 'Empate Rankeado',
  canvasGoalTitle: '¡GOOOL!',
  canvasPrepareTitle: 'PREPÁRATE',
  canvasPrepareSub: '¡Lleva el balón a la portería rival!',
  canvasOvertimeTitle: '¡EMPATE! +30s',
  canvasOvertimeSub: 'Prórroga {cur}/{max} — Quien haga más goles gana',
  canvasPausedClock: 'Reloj pausado durante la celebración',
  canvasScoredFor: '{scorer} marcó para el {team}',
  canvasOwnGoalScoredFor: '{otherTeam} anotó un punto para el equipo rival ({team})',
  serverConnectError: 'No se pudo conectar al servidor multijugador.',
  connectingWaitError: 'Conectando al servidor... Inténtalo de nuevo en 1 segundo.',
  coinsLabel: 'Monedas',
  shopBtn: 'Texturas de Campo',
  shopTitle: 'Tienda de Texturas de Campo',
  shopSubtitle: 'Compra nuevos céspedes y pisos con monedas ganadas en partidas multijugador.',
  multiplayerCoinsHint:
    '¡Gana monedas en Multijugador Online (Casual o Rankeada): 60 por victoria, 35 por empate, 20 por partido + bonus por goles!',
  freeLabel: 'Gratis',
  buyBtn: 'Comprar',
  equipBtn: 'Equipar',
  equippedBadge: 'Equipado',
  insufficientCoins: 'Monedas insuficientes',
  onlineCoinsEarned: 'Recompensa Multijugador: +{coins} monedas',
  casualSummaryTitle: 'Partido Online Finalizado',
  turfNames: {
    classic: 'Clásico Esmeralda',
    checker: 'Ajedrezado Arena',
    street: 'Asfalto Urbano',
    neon: 'Ciber Neón Nocturno',
    beach: 'Arena de Playa',
    futsal: 'Cancha Futsal Madera',
    clay: 'Tierra Clásica',
    lava: 'Volcán Magma',
    frost: 'Arena Ártica Hielo',
    sakura: 'Estadio Sakura',
    imperial: 'Estadio Imperial Oro',
    galaxy: 'Arena Cósmica',
  },
  turfDescs: {
    classic: 'Césped rayado tradicional de estadio profesional.',
    checker: 'Corte cuadriculado de copa con líneas reforzadas.',
    street: 'Cancha urbana de asfalto oscuro con líneas amarillas vibrantes.',
    neon: 'Arena futurista oscura con cuadrícula cian luminosa.',
    beach: 'Arena dorada de fútbol playa con líneas blancas tensadas.',
    futsal: 'Piso barnizado de madera oficial de fútbol sala.',
    clay: 'Cancha clásica de tierra batida con líneas de cal.',
    lava: 'Roca volcánica oscura surcada por grietas de magma brillante.',
    frost: 'Superficie glacial azulada con líneas árticas nítidas.',
    sakura: 'Césped nocturno con pétalos de cerezo y líneas rosadas.',
    imperial: 'Césped oscuro de gala con líneas doradas imperiales.',
    galaxy: 'Campo estelar violeta profundo con polvo cósmico y brillo neón.',
  },
  customizeButtonsBtn: 'Personalizar Botones',
  customizerTitle: 'Personalizar Controles en Pantalla',
  customizerSubtitle:
    'Arrastra el joystick o los botones en la vista previa, elige el estilo y ajusta tamaño y opacidad.',
  layoutModeLabel: 'Estilo de Diseño',
  layoutRadial: 'Arco Alrededor',
  layoutSplit: 'Izquierda / Derecha',
  handednessLabel: 'Lado del Joystick',
  leftJoy: 'Joystick Izquierdo',
  rightJoy: 'Joystick Derecho',
  buttonScaleLabel: 'Tamaño de Botones',
  joystickScaleLabel: 'Tamaño de Joystick',
  joystickSensitivityLabel: 'Sensibilidad del Joystick',
  diagonalToleranceLabel: 'Tolerancia Diagonal',
  diagonalToleranceHint: 'Tiempo que mantiene la dirección diagonal al soltar una tecla (0–400 ms).',
  opacityLabel: 'Opacidad',
  dragHint: 'Arrastra cualquier control abajo para ajustar su posición libremente.',
  resetHudBtn: 'Restaurar',
  doneBtn: 'Listo',
  switchBtnToggleLabel: 'Botón Cambiar Jugador (Móvil)',
  switchBtnOn: 'Activado',
  switchBtnOff: 'Desactivado',
  devModeBtn: 'Dev',
  trainingResetBallBtn: 'Reiniciar Balón',
  lootboxOpeningTitle: 'Abriendo Caja...',
  lootboxSkipBtn: 'Saltar',
  lootboxContinueBtn: 'Continuar',
  spectatorBadge: 'MODO ESPECTADOR',
  spectatingLive: 'Viendo en vivo · Sala {code}',
  liveMatchesTitle: 'Partidos en Vivo (Espectador)',
  noLiveMatches: 'No hay partidos online activos en este momento.',
  watchLiveBtn: 'Ver en Vivo',
  spectatorsCountLabel: 'espectadores',
  followBall: 'Balón',
  cameraFocusLabel: 'Cámara:',
  spectatorEndedTitle: 'Partido Finalizado',
  spectatorEndedDesc: 'Seguiste todo el partido en Modo Espectador.',
  refreshLiveBtn: 'Actualizar',
  characterBtn: 'Personaje',
  characterShopTitle: 'Personalización de Personaje',
  characterShopSubtitle: 'Usa monedas del multijugador para personalizar pelo, camiseta, aura y botas.',
  hairTab: 'Pelo',
  colorTab: 'Color',
  patternTab: 'Camiseta',
  auraTab: 'Aura',
  cleatTab: 'Botas',
  jerseyNumberLabel: 'Número',
  cosmeticNames: {
    'hair:none': 'Sin Pelo',
    'hair:spiky': 'Pelo de Punta',
    'hair:headband': 'Cinta Ninja',
    'hair:afro': 'Afro',
    'hair:mohawk': 'Cresta',
    'hair:horns': 'Cuernos Demon',
    'hair:halo': 'Aureola',
    'hair:crown': 'Corona Real',
    'color:dark': 'Negro',
    'color:gold': 'Oro',
    'color:ego': 'Cian Ego',
    'color:crimson': 'Carmesí',
    'color:neon': 'Rosa Neón',
    'color:silver': 'Plata',
    'pattern:solid': 'Lisa Clásica',
    'pattern:stripe': 'Franja Central',
    'pattern:sash': 'Banda Diagonal',
    'pattern:star': 'Estrella',
    'pattern:flame': 'Llama Imperial',
    'aura:none': 'Sin Aura',
    'aura:spark': 'Aura Chispa',
    'aura:flame': 'Aura Fuego',
    'aura:frost': 'Aura Hielo',
    'aura:shadow': 'Aura Sombra',
    'aura:ego': 'Aura Ego',
    'cleat:white': 'Botas Blancas',
    'cleat:gold': 'Botas Oro',
    'cleat:cyan': 'Botas Cian',
    'cleat:crimson': 'Botas Rubí',
    'cleat:emerald': 'Botas Esmeralda',
  },
  skillsBtn: 'Skills y Cajas',
  skillsModalTitle: '20 Skills y Lootboxes',
  skillsModalSubtitle: 'Compra cajas con monedas multijugador, desbloquea habilidades y equipa hasta 2 en el campo (Z / X).',
  lootboxTab: 'Abrir Cajas',
  mySkillsTab: 'Colección (20 Skills)',
  openBoxBtn: 'Abrir Caja',
  boxResultNew: '¡NUEVA SKILL DESBLOQUEADA!',
  boxResultDuplicate: '¡Repetida! Reembolso de +{coins} monedas',
  rarityLabels: {
    common: 'Común',
    rare: 'Raro',
    epic: 'Épico',
    legendary: 'Legendario',
    mythic: 'Mítico',
  },
  lootboxNames: {
    standard: 'Caja Estándar',
    epic: 'Caja Épica',
    mythic: 'Caja Mítica',
  },
  lootboxDescs: {
    standard: 'Buena probabilidad de Comunes y Raras con opción de caída superior.',
    epic: 'Enfocada en Raras y Épicas con mayor chance de Legendarias y Míticas.',
    mythic: 'Garantiza Raro o superior con las mejores tasas de Legendarias y Míticas.',
  },
  equippedSlotsTitle: 'Skills Equipadas en Campo',
  slotLabel: 'Ranura',
  equipSlot1: 'Equipar Z (1)',
  equipSlot2: 'Equipar X (2)',
  unequipBtn: 'Quitar',
  skillSlotEmpty: 'Vacío',
  skillsOwnedLabel: 'Desbloqueadas',
  watchReplayBtn: 'Ver Mejores Momentos',
  replaysBtn: 'Replays',
  replayModalTitle: 'Repetición de Mejores Momentos',
  replayModalSubtitle: 'Revive los mejores lances guardados de tus partidos 1P y 2P en cámara lenta.',
  replayMomentGoal: 'Gol',
  replayMomentPost: 'Al Palo',
  replayMomentSkill: 'Skill',
  replayMomentSave: 'Lance',
  replaySpeedLabel: 'Velocidad',
  replayPlay: 'Reproducir',
  replayPause: 'Pausar',
  replayPrev: 'Anterior',
  replayNext: 'Siguiente',
  replaySavedMatchesLabel: 'Partidos Guardados',
  noReplaysYet: 'Aún no hay replays guardados. ¡Termina un partido 1P o 2P para guardar los mejores momentos!',
  landscapeOnlyTitle: 'Gira tu móvil para jugar',
  landscapeOnlyDesc:
    'En dispositivos móviles, los partidos solo se pueden jugar en modo horizontal (paisaje) para ver todo el campo y usar los controles.',
  landscapeOnlyBtn: 'Activar Pantalla Horizontal',
  landscapeHintBanner: 'El modo horizontal es obligatorio durante los partidos en el móvil.',
  landscapeManualHint:
    'Gira el teléfono físicamente a horizontal (comprueba que el bloqueo de rotación esté desactivado).',
  matchDraftTitle: 'Elige las Skills del Partido',
  matchDraftSubtitle1p: 'Selecciona hasta 2 habilidades antes del saque inicial (Z y X).',
  matchDraftSubtitle2p: 'Jugador 1 (Z / X) y Jugador 2 (I / O) eligen hasta 2 habilidades cada uno.',
  matchDraftSubtitleOnline: 'Elige hasta 2 habilidades desbloqueadas para el partido online (Z y X).',
  draftingForLabel: 'Eligiendo para',
  randomSkillsBtn: 'Aleatorio',
  clearSkillsBtn: 'Limpiar',
  startWithSkillsBtn: 'Iniciar Partido',
  confirmOnlineSkillsBtn: 'Confirmar Skills',
  changeMatchSkillsBtn: 'Elegir Skills',
  noOnlineSkillsHint: 'Aún no tienes skills desbloqueadas para Online. Abre cajas con monedas multijugador o entra directo.',
  allRaritiesLabel: 'Todas',
  mvpEyebrow: 'MVP del Partido',
  mvpWinnersSection: 'Ganadores',
  mvpDrawSection: 'Destacados del Partido',
  mvpPointsSuffix: 'PTS',
  mvpStatGoals: 'Goles',
  mvpStatAssists: 'Asist.',
  mvpStatSaves: 'Paradas',
  mvpStatSteals: 'Robos',
  mvpStatPasses: 'Pases',
  mvpHumanBadge: 'Jugador',
  mvpYouBadge: 'Tú',
  mvpContinueBtn: 'Continuar al Resumen',
  mvpReopenBtn: 'Ver MVP y Ganadores',
  unifiedShopBtn: 'Tiendita',
  unifiedShopTitle: 'Tienda Unificada de la Arena',
  unifiedShopSubtitle: 'Skills, Lootboxes, Personalización, Texturas de Campo y Animaciones en un solo lugar.',
  tabSkills: 'Skills y Cajas',
  tabCharacter: 'Personalización',
  tabTurfs: 'Texturas',
  tabAnimations: 'Animaciones',
  animationsTitle: 'Animaciones y Tiempos Personalizables',
  animationsSubtitle: 'Desbloquea celebraciones de gol y estelas de carrera y ajusta su duración.',
  goalAnimationsLabel: 'Animaciones de Gol',
  trailAnimationsLabel: 'Animaciones de Movimiento / Estela',
  animFieldDurationLabel: 'Duración en Campo',
  animLootboxDurationLabel: 'Tiempo de Apertura de Lootbox',
  animUiDurationLabel: 'Tiempo de Animación de Menús / UI',
  testAnimationBtn: 'Probar Animación',
  animResetTimingBtn: 'Restaurar Tiempos',
  animPresetInstant: 'Instantáneo',
  animPresetFast: 'Rápido',
  animPresetDefault: 'Estándar',
  animPresetCinematic: 'Cinemático',
  animNames: {
    'goal:classic': 'Confeti Clásico',
    'goal:fireworks': 'Fuegos Artificiales',
    'goal:lightning': 'Relámpago Azul',
    'goal:supernova': 'Supernova Estelar',
    'goal:matrix': 'Pulso Digital',
    'trail:standard': 'Estela Veloz',
    'trail:flame-dash': 'Llama Ardiente',
    'trail:frost-nova': 'Cristales de Hielo',
    'trail:shadow-echo': 'Ecos Sombríos',
    'trail:gold-aura': 'Órbita Dorada',
  },
  animDescs: {
    'goal:classic': 'Lluvia tradicional de confeti y ondas de choque.',
    'goal:fireworks': 'Múltiples explosiones pirotécnicas sobre la portería.',
    'goal:lightning': 'Rayos eléctricos saliendo de los postes.',
    'goal:supernova': 'Explosión radial intensa con doble anillo de choque.',
    'goal:matrix': 'Lluvia cibernética esmeralda y pulso neón.',
    'trail:standard': 'Líneas aerodinámicas limpias al esprintar.',
    'trail:flame-dash': 'Brasas naranjas al esprintar y regatear.',
    'trail:frost-nova': 'Diamantes glaciales tras movimientos rápidos.',
    'trail:shadow-echo': 'Siluetas fantasma violeta siguiendo tu carrera.',
    'trail:gold-aura': 'Chispas doradas orbitando al jugador.',
  },
  menuControlsBtn: 'Controles del Menú',
  menuControlsTitle: 'Controles del Menú',
  menuControlsSubtitle: 'Configura diseño del menú, atajos de teclado, tiempos de animación y acceso rápido.',
  menuLayoutLabel: 'Diseño del Menú Principal',
  menuLayoutDefault: 'Estándar',
  menuLayoutCompact: 'Compacto',
  menuBackdropLabel: 'Fondo del Menú',
  menuBackdropStadium: 'Estadio Nocturno',
  menuBackdropMinimal: 'Minimalista',
  menuShowRulesLabel: 'Mostrar Reglas en el Menú',
  menuKeyboardNavLabel: 'Atajos de Teclado en el Menú',
  menuKeyboardLegend: '1–4 Modo · Enter Jugar · L Tienda · C Controles · M Sonido · Esc Cerrar',
  menuQuickNavTitle: 'Acceso Rápido a Menús',
  menuAnimTimingTitle: 'Tiempos de Animación',
  menuAudioLangTitle: 'Audio e Idioma',
  menuAnimationsLabel: 'Animaciones del Menú',
  pingLabel: 'Ping',
  onLabel: 'Activado',
  offLabel: 'Desactivado',
  seasonLabel: 'Temporada {num}',
  seasonResetTimerLabel: 'Reinicio Bronce en',
  seasonResetNotice: '¡Comenzó la Temporada {num}! Todos los rangos volvieron a Bronce.',
  seasonDesc: 'Cada 3 semanas todos los rangos regresan a Bronce I (el reloj sigue contando incluso con el juego cerrado).',
};

export const TRANSLATIONS: Record<Language, TranslationDict> = {
  'pt-BR': PT_BR,
  'pt-PT': PT_PT,
  'en-US': EN_US,
  es: ES,
};

export function formatT(template: string, vars: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, String(v));
  }
  return out;
}
