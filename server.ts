import http from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import {
  createDefaultCharacterConfig,
  sanitizeCharacterConfig,
  type CharacterConfig,
} from './src/shared/character.ts';
import {
  createInitialGameState,
  DEFAULT_DEV_HACKS,
  EMOTE_OPTIONS,
  EMPTY_INPUT,
  parseTeamSize,
  stepGameState,
  syncPlayerControlRoles,
  type DevHacksConfig,
  type GameState,
  type PlayerInput,
  type Team,
  type TeamSize,
} from './src/shared/gameEngine.ts';
import {
  calculateRankedExpDelta,
  getCurrentSeasonInfo,
  getRankInfo,
} from './src/shared/ranks.ts';
import { encodeCompactState } from './src/shared/netProtocol.ts';
import { isValidSkillId, type SkillId } from './src/shared/skills.ts';
import { calculateMultiplayerCoins } from './src/shared/turfs.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3000);

const SERVER_DEV_PASSWORD = process.env.DEV_MODE_PASSWORD || '';
const devAuthTokens = new Map<string, number>();
const devAuthAttempts = new Map<string, { count: number; resetAt: number }>();

function isValidDevToken(value: unknown): value is string {
  if (typeof value !== 'string' || value.length < 32) return false;
  const expiresAt = devAuthTokens.get(value);
  if (!expiresAt) return false;
  if (expiresAt <= Date.now()) {
    devAuthTokens.delete(value);
    return false;
  }
  return true;
}

function sanitizeServerDevHacks(raw: unknown): DevHacksConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_DEV_HACKS };
  const r = raw as Record<string, unknown>;
  const clampNum = (v: unknown, min: number, max: number, def: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : def;
  };
  return {
    enabled: Boolean(r.enabled),
    playerSpeedMultiplier: clampNum(r.playerSpeedMultiplier, 0.5, 3.5, 1),
    kickPowerMultiplier: clampNum(r.kickPowerMultiplier, 0.5, 3.0, 1),
    ballFrictionMultiplier: clampNum(r.ballFrictionMultiplier, 0.2, 2.5, 1),
    infiniteStamina: Boolean(r.infiniteStamina),
    noDribbleCooldown: Boolean(r.noDribbleCooldown),
    freezeClock: Boolean(r.freezeClock),
    freezeEnemyAI: Boolean(r.freezeEnemyAI),
    ballMagnet: Boolean(r.ballMagnet),
    gkAlwaysThrow: Boolean(r.gkAlwaysThrow),
  };
}

interface ClientSession {
  ws: WebSocket;
  id: string;
  name: string;
  exp: number;
  seasonNumber: number;
  appearance: CharacterConfig;
  equippedSkills: SkillId[];
  roomCode: string | null;
  playerSlot: string | null;
  isSpectator: boolean;
  isDev: boolean;
  pendingDevHacks?: DevHacksConfig;
}

function syncClientSeason(client: ClientSession): void {
  const currentSeason = getCurrentSeasonInfo().seasonNumber;
  if (client.seasonNumber < currentSeason) {
    client.seasonNumber = currentSeason;
    client.exp = 0;
  }
}

interface OnlineRoom {
  code: string;
  teamSize: TeamSize;
  isRanked: boolean;
  hostId: string;
  slots: Map<string, ClientSession>;
  spectators: Map<string, ClientSession>;
  state: GameState | null;
  devHacks: DevHacksConfig;
  devOwnerId: string | null;
  inputs: Record<string, PlayerInput>;
  latches: Record<
    string,
    {
      shoot: boolean;
      dribble: boolean;
      pass: boolean;
      switchPlayer: boolean;
      skill1: boolean;
      skill2: boolean;
    }
  >;
  intervalId: NodeJS.Timeout | null;
  lastStepAt: number;
  inputDirty: boolean;
  broadcastTickCount: number;
}

const rooms = new Map<string, OnlineRoom>();
const clientByWs = new Map<WebSocket, ClientSession>();
type QueueKey = `${TeamSize}-${'casual' | 'ranked'}`;
const quickMatchQueues: Record<QueueKey, ClientSession | null> = {
  '1-casual': null,
  '2-casual': null,
  '4-casual': null,
  '8-casual': null,
  '16-casual': null,
  '1-ranked': null,
  '2-ranked': null,
  '4-ranked': null,
  '8-ranked': null,
  '16-ranked': null,
};
let clientSeq = 1;
let globalWss: WebSocketServer | null = null;
let liveRoomsBroadcastTimer: NodeJS.Timeout | null = null;
let lastLiveRoomsBroadcastAt = 0;

function sanitizeEquippedSkillList(raw: unknown): SkillId[] {
  const list: SkillId[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (isValidSkillId(item) && !list.includes(item)) {
        list.push(item);
        if (list.length >= 2) break;
      }
    }
  }
  return list;
}

function getTeamSlots(team: Team, teamSize: TeamSize): string[] {
  const slots: string[] = [];
  for (let i = 1; i <= teamSize; i++) {
    slots.push(`${team}-${i}`);
  }
  return slots;
}

function getAllSlots(teamSize: TeamSize): string[] {
  const slots: string[] = [];
  for (let i = 1; i <= teamSize; i++) {
    slots.push(`blue-${i}`, `red-${i}`);
  }
  return slots;
}

function findNextBalancedSlot(room: OnlineRoom): string | null {
  const blueSlots = getTeamSlots('blue', room.teamSize);
  const redSlots = getTeamSlots('red', room.teamSize);
  const blueCount = blueSlots.filter((s) => room.slots.has(s)).length;
  const redCount = redSlots.filter((s) => room.slots.has(s)).length;

  const firstOrder =
    blueCount <= redCount ? [...blueSlots, ...redSlots] : [...redSlots, ...blueSlots];
  for (const s of firstOrder) {
    if (!room.slots.has(s)) return s;
  }
  return null;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return rooms.has(code) ? generateRoomCode() : code;
}

function sendJson(ws: WebSocket, payload: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function sendRawJson(ws: WebSocket, rawJson: string, force = false): void {
  if (ws.readyState !== WebSocket.OPEN) return;
  if (!force && ws.bufferedAmount > 96 * 1024) return;
  ws.send(rawJson);
}

function getLiveRoomsPayload() {
  const list: Array<{
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
  }> = [];

  for (const room of rooms.values()) {
    if (!room.state || room.state.phase === 'FINISHED') continue;
    const blueClient = room.slots.get('blue-1') ?? Array.from(room.slots.values())[0];
    const redClient = room.slots.get('red-1');
    list.push({
      roomCode: room.code,
      teamSize: room.teamSize,
      isRanked: room.isRanked,
      humanCount: room.slots.size,
      maxHumans: room.teamSize * 2,
      spectatorCount: room.spectators.size,
      blueScore: room.state.score.blue,
      redScore: room.state.score.red,
      timeRemaining: Math.ceil(room.state.timeRemaining),
      blueName: blueClient?.name ?? 'Time Azul',
      redName: redClient?.name ?? 'Time Vermelho',
    });
  }

  return { type: 'live_rooms', rooms: list };
}

function flushBroadcastLiveRooms(): void {
  if (!globalWss) return;
  lastLiveRoomsBroadcastAt = Date.now();
  const raw = JSON.stringify(getLiveRoomsPayload());
  for (const clientWs of globalWss.clients) {
    if (clientWs.readyState !== WebSocket.OPEN) continue;
    const session = clientByWs.get(clientWs);
    if (session?.roomCode && rooms.get(session.roomCode)?.state) {
      continue;
    }
    sendRawJson(clientWs, raw, false);
  }
}

function broadcastLiveRooms(immediate = false): void {
  if (!globalWss) return;
  const elapsed = Date.now() - lastLiveRoomsBroadcastAt;
  if (immediate || elapsed >= 1200) {
    if (liveRoomsBroadcastTimer) {
      clearTimeout(liveRoomsBroadcastTimer);
      liveRoomsBroadcastTimer = null;
    }
    flushBroadcastLiveRooms();
    return;
  }
  if (!liveRoomsBroadcastTimer) {
    liveRoomsBroadcastTimer = setTimeout(() => {
      liveRoomsBroadcastTimer = null;
      flushBroadcastLiveRooms();
    }, 1200 - elapsed);
  }
}

function broadcastLobby(room: OnlineRoom): void {
  const blueSlots = getTeamSlots('blue', room.teamSize);
  const redSlots = getTeamSlots('red', room.teamSize);

  const bluePlayers = blueSlots.map((slot) => {
    const c = room.slots.get(slot);
    const info = c ? getRankInfo(c.exp) : null;
    return {
      slot,
      name: c ? c.name : 'IA Parceira',
      isAI: !c,
      exp: c ? c.exp : 0,
      rankId: info ? info.tier.id : 'bronze',
      subLevel: info ? info.subLevel : 1,
    };
  });
  const redPlayers = redSlots.map((slot) => {
    const c = room.slots.get(slot);
    const info = c ? getRankInfo(c.exp) : null;
    return {
      slot,
      name: c ? c.name : 'IA Rival',
      isAI: !c,
      exp: c ? c.exp : 0,
      rankId: info ? info.tier.id : 'bronze',
      subLevel: info ? info.subLevel : 1,
    };
  });

  const hostClient = Array.from(room.slots.values()).find((c) => c.id === room.hostId);
  const humanCount = room.slots.size;

  for (const [slot, client] of room.slots.entries()) {
    const yourTeam: Team = slot.startsWith('blue') ? 'blue' : 'red';
    sendJson(client.ws, {
      type: 'lobby_update',
      roomCode: room.code,
      teamSize: room.teamSize,
      isRanked: room.isRanked,
      hostName: hostClient?.name ?? 'Anfitrião',
      isHost: client.id === room.hostId,
      yourSlot: slot,
      yourTeam,
      bluePlayers,
      redPlayers,
      humanCount,
      maxHumans: room.teamSize * 2,
      isReady: humanCount >= 2,
    });
  }
}

function stopRoomLoop(room: OnlineRoom): void {
  if (room.intervalId) {
    clearTimeout(room.intervalId);
    room.intervalId = null;
  }
}

function startRoomMatch(room: OnlineRoom): void {
  if (room.slots.size < 2) return;
  stopRoomLoop(room);

  room.inputs = {};
  room.latches = {};
  const slotNames: Record<string, string> = {};
  const slotAppearances: Record<string, CharacterConfig> = {};
  const slotSkills: Record<string, SkillId[]> = {};
  const humanSlots: string[] = [];

  for (const slot of getAllSlots(room.teamSize)) {
    room.inputs[slot] = { ...EMPTY_INPUT };
    room.latches[slot] = {
      shoot: false,
      dribble: false,
      pass: false,
      switchPlayer: false,
      skill1: false,
      skill2: false,
    };
    const occupant = room.slots.get(slot);
    if (occupant) {
      humanSlots.push(slot);
      slotNames[slot] = occupant.name;
      slotAppearances[slot] = occupant.appearance;
      slotSkills[slot] = occupant.equippedSkills;
    }
  }

  room.state = createInitialGameState({
    mode: 'online',
    teamSize: room.teamSize,
    slotNames,
    slotAppearances,
    slotSkills,
    humanSlots,
  });
  room.lastStepAt = performance.now();
  room.inputDirty = false;
  room.broadcastTickCount = 0;

  for (const [slot, client] of room.slots.entries()) {
    sendJson(client.ws, {
      type: 'match_started',
      roomCode: room.code,
      isRanked: room.isRanked,
      yourSlot: slot,
      state: room.state,
    });
  }

  for (const spec of room.spectators.values()) {
    sendJson(spec.ws, {
      type: 'spectator_joined',
      roomCode: room.code,
      teamSize: room.teamSize,
      isRanked: room.isRanked,
      spectatorCount: room.spectators.size,
      state: room.state,
    });
  }

  broadcastLiveRooms(true);

  let accumulator = 0;
  const FIXED_DT = 1 / 60;
  const TICK_MS = 1000 / 60;
  let nextTickTarget = performance.now() + TICK_MS;
  const frameInputs: Record<string, PlayerInput> = {};

  const runTick = () => {
    room.intervalId = null;
    if (!room.state) return;

    const perfNow = performance.now();
    const elapsed = Math.min(Math.max(0, (perfNow - room.lastStepAt) / 1000), 0.05);
    room.lastStepAt = perfNow;
    accumulator += elapsed;

    for (const slot of room.state.humanSlots) {
      const base = room.inputs[slot] ?? EMPTY_INPUT;
      const latch = room.latches[slot] ?? {
        shoot: false,
        dribble: false,
        pass: false,
        switchPlayer: false,
        skill1: false,
        skill2: false,
      };
      frameInputs[slot] = {
        moveX: base.moveX,
        moveY: base.moveY,
        shoot: base.shoot || latch.shoot,
        dribble: base.dribble || latch.dribble,
        pass: base.pass || latch.pass,
        switchPlayer: Boolean(base.switchPlayer) || latch.switchPlayer,
        sprint: base.sprint,
        skill1: Boolean(base.skill1) || latch.skill1,
        skill2: Boolean(base.skill2) || latch.skill2,
        diagonalToleranceMs: base.diagonalToleranceMs,
      };
      latch.shoot = false;
      latch.dribble = false;
      latch.pass = false;
      latch.switchPlayer = false;
      latch.skill1 = false;
      latch.skill2 = false;
    }

    let activeRoomHacks: DevHacksConfig | undefined;
    if (room.devHacks.enabled && room.devOwnerId) {
      let devSlot: string | null = null;
      for (const [slot, occupant] of room.slots.entries()) {
        if (occupant.id === room.devOwnerId) {
          devSlot = slot;
          break;
        }
      }
      if (devSlot) {
        activeRoomHacks = { ...room.devHacks, devSlot };
      }
    }

    const prevPhase = room.state.phase;
    let stepped = false;
    let importantEvents: typeof room.state.events = [];
    let subSteps = 0;
    while (accumulator >= FIXED_DT && subSteps < 3 && room.state.phase !== 'FINISHED') {
      stepGameState(room.state, frameInputs, FIXED_DT, activeRoomHacks);
      if (room.state.events.length > 0) {
        importantEvents = importantEvents.concat(room.state.events);
      }
      accumulator -= FIXED_DT;
      subSteps += 1;
      stepped = true;
    }

    if (!stepped && elapsed > 0 && room.state.phase !== 'FINISHED') {
      const stepDt = Math.max(0.008, Math.min(FIXED_DT, accumulator));
      accumulator = 0;
      stepGameState(room.state, frameInputs, stepDt, activeRoomHacks);
      if (room.state.events.length > 0) {
        importantEvents = importantEvents.concat(room.state.events);
      }
      stepped = true;
    }

    if (stepped) {
      if (importantEvents.length > 0) {
        room.state.events = importantEvents;
      }
      room.broadcastTickCount += 1;
      const hasImportantChange =
        room.state.events.length > 0 ||
        room.state.phase !== prevPhase ||
        room.state.phase === 'FINISHED';
      const shouldBroadcast =
        hasImportantChange ||
        room.inputDirty ||
        room.broadcastTickCount % 2 === 0;

      if (shouldBroadcast) {
        room.inputDirty = false;
        const packetJson = JSON.stringify(
          encodeCompactState(room.state, {
            spectatorCount: room.spectators.size,
            serverTime: Date.now(),
          })
        );
        for (const client of room.slots.values()) {
          sendRawJson(client.ws, packetJson, hasImportantChange);
        }
        for (const spec of room.spectators.values()) {
          sendRawJson(spec.ws, packetJson, hasImportantChange);
        }
      }
    }

    if (room.state.phase === 'FINISHED') {
      const blueScore = room.state.score.blue;
      const redScore = room.state.score.red;
      const winner = room.state.winner;
      for (const [slot, client] of room.slots.entries()) {
        const team: Team = slot.startsWith('red') ? 'red' : 'blue';
        const result: 'win' | 'loss' | 'draw' =
          winner === 'draw' || winner === null
            ? 'draw'
            : winner === team
            ? 'win'
            : 'loss';
        const goalsFor = team === 'blue' ? blueScore : redScore;
        const goalsAgainst = team === 'blue' ? redScore : blueScore;
        const coinsEarned = calculateMultiplayerCoins(result, goalsFor, room.isRanked);

        if (room.isRanked) {
          syncClientSeason(client);
          const outcome = calculateRankedExpDelta(
            result,
            goalsFor,
            goalsAgainst,
            client.exp
          );
          client.exp = outcome.nextExp;
          sendJson(client.ws, {
            type: 'ranked_result',
            yourSlot: slot,
            teamSize: room.teamSize,
            result,
            blueScore,
            redScore,
            expDelta: outcome.expDelta,
            nextExp: outcome.nextExp,
            prevRankId: outcome.prevRank.id,
            nextRankId: outcome.nextRank.id,
            prevSubLevel: outcome.prevSubLevel,
            nextSubLevel: outcome.nextSubLevel,
            promoted: outcome.promoted,
            tierPromoted: outcome.tierPromoted,
            coinsEarned,
          });
        } else {
          sendJson(client.ws, {
            type: 'online_casual_result',
            yourSlot: slot,
            teamSize: room.teamSize,
            result,
            blueScore,
            redScore,
            coinsEarned,
          });
        }
      }

      for (const spec of room.spectators.values()) {
        sendJson(spec.ws, {
          type: 'spectator_match_ended',
          roomCode: room.code,
          winner,
          blueScore,
          redScore,
        });
      }

      stopRoomLoop(room);
      broadcastLiveRooms(true);
      return;
    }

    const afterNow = performance.now();
    nextTickTarget += TICK_MS;
    if (nextTickTarget < afterNow - TICK_MS * 2) {
      nextTickTarget = afterNow + TICK_MS;
    }
    const delay = Math.max(1, Math.round(nextTickTarget - afterNow));
    room.intervalId = setTimeout(runTick, delay);
  };

  room.intervalId = setTimeout(runTick, Math.round(TICK_MS));
}

function clearClientFromQueues(client: ClientSession): void {
  for (const key of Object.keys(quickMatchQueues) as QueueKey[]) {
    if (quickMatchQueues[key]?.id === client.id) {
      quickMatchQueues[key] = null;
    }
  }
}

function enterSpectatorRoom(room: OnlineRoom, client: ClientSession): void {
  room.spectators.set(client.id, client);
  client.roomCode = room.code;
  client.playerSlot = 'spectator';
  client.isSpectator = true;

  if (room.state) {
    sendJson(client.ws, {
      type: 'spectator_joined',
      roomCode: room.code,
      teamSize: room.teamSize,
      isRanked: room.isRanked,
      spectatorCount: room.spectators.size,
      state: room.state,
    });
  } else {
    sendJson(client.ws, {
      type: 'error',
      message: 'A partida ainda não começou. Aguarde na sala.',
    });
  }
  broadcastLiveRooms();
}

function leaveRoom(client: ClientSession): void {
  clearClientFromQueues(client);

  if (!client.roomCode) return;
  const room = rooms.get(client.roomCode);
  const oldSlot = client.playerSlot;
  const wasSpectator = client.isSpectator;
  client.roomCode = null;
  client.playerSlot = null;
  client.isSpectator = false;

  if (!room) return;

  if (wasSpectator) {
    room.spectators.delete(client.id);
    if (room.slots.size === 0 && room.spectators.size === 0) {
      stopRoomLoop(room);
      rooms.delete(room.code);
    }
    broadcastLiveRooms();
    return;
  }

  if (oldSlot) {
    room.slots.delete(oldSlot);
  }
  if (room.devOwnerId === client.id) {
    room.devOwnerId = null;
    room.devHacks = { ...DEFAULT_DEV_HACKS, enabled: false };
  }

  if (room.slots.size === 0 && room.spectators.size === 0) {
    stopRoomLoop(room);
    rooms.delete(room.code);
    broadcastLiveRooms();
    return;
  }

  if (room.slots.size === 0) {
    stopRoomLoop(room);
    room.state = null;
    for (const spec of room.spectators.values()) {
      sendJson(spec.ws, {
        type: 'opponent_left',
        message: 'Os jogadores encerraram a partida.',
      });
      spec.roomCode = null;
      spec.playerSlot = null;
      spec.isSpectator = false;
    }
    room.spectators.clear();
    rooms.delete(room.code);
    broadcastLiveRooms();
    return;
  }

  // Promote a new host if the host left
  if (room.hostId === client.id) {
    const nextHost = room.slots.values().next().value;
    if (nextHost) {
      room.hostId = nextHost.id;
    }
  }

  // If a match was running and fewer than 2 humans remain, return to lobby
  if (room.state && room.slots.size < 2) {
    stopRoomLoop(room);
    room.state = null;
    for (const c of room.slots.values()) {
      sendJson(c.ws, {
        type: 'opponent_left',
        message: 'Um jogador saiu da partida.',
      });
    }
    for (const spec of room.spectators.values()) {
      sendJson(spec.ws, {
        type: 'opponent_left',
        message: 'Um jogador saiu da partida.',
      });
      spec.roomCode = null;
      spec.playerSlot = null;
      spec.isSpectator = false;
    }
    room.spectators.clear();
    broadcastLiveRooms();
  } else if (room.state && oldSlot) {
    // Convert departed player's slot to AI mid-match so remaining players can finish!
    room.state.humanSlots = room.state.humanSlots.filter((s) => s !== oldSlot);
    delete room.state.controlMap[oldSlot];
    const p = room.state.players.find((pl) => pl.id === oldSlot);
    let updatedName: string | null = null;
    if (p) {
      p.name = `${p.name} (IA)`;
      updatedName = p.name;
    }
    syncPlayerControlRoles(room.state);
    if (updatedName) {
      const note = JSON.stringify({
        type: 'slot_to_ai',
        slot: oldSlot,
        name: updatedName,
        humanSlots: room.state.humanSlots,
      });
      for (const c of room.slots.values()) sendRawJson(c.ws, note, true);
      for (const spec of room.spectators.values()) sendRawJson(spec.ws, note, true);
    }
  }

  broadcastLobby(room);
}

// parseTeamSize imported from src/shared/gameEngine.ts

async function startServer() {
  const app = express();
  app.set('etag', false);
  app.set('trust proxy', 1);
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, activeRooms: rooms.size });
  });

  app.post('/api/dev-auth', (req, res) => {
    if (!SERVER_DEV_PASSWORD) {
      res.status(503).json({ ok: false, error: 'Modo desenvolvedor não configurado no servidor.' });
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const attempts = devAuthAttempts.get(ip);
    if (attempts && attempts.resetAt > now && attempts.count >= 8) {
      res.status(429).json({ ok: false, error: 'Muitas tentativas. Aguarde 15 minutos.' });
      return;
    }

    const supplied = typeof req.body?.password === 'string' ? req.body.password : '';
    const expectedBuffer = Buffer.from(SERVER_DEV_PASSWORD);
    const suppliedBuffer = Buffer.from(supplied);
    const passwordMatches = suppliedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(suppliedBuffer, expectedBuffer);

    if (!passwordMatches) {
      const current = attempts && attempts.resetAt > now
        ? attempts
        : { count: 0, resetAt: now + 15 * 60 * 1000 };
      current.count += 1;
      devAuthAttempts.set(ip, current);
      res.status(401).json({ ok: false, error: 'Senha incorreta! Acesso negado.' });
      return;
    }

    devAuthAttempts.delete(ip);
    const token = randomBytes(32).toString('hex');
    devAuthTokens.set(token, now + 12 * 60 * 60 * 1000);
    res.json({ ok: true, token, expiresIn: 12 * 60 * 60 });
  });

  const server = http.createServer(app);
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        ws: {
          server,
          path: '/vite-hmr',
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const wss = new WebSocketServer({
    noServer: true,
    perMessageDeflate: false,
    maxPayload: 64 * 1024,
  });
  globalWss = wss;

  server.on('upgrade', (req, socket, head) => {
    const reqUrl = req.url || '';
    if (reqUrl === '/ws' || reqUrl.startsWith('/ws?')) {
      if ('setNoDelay' in socket && typeof socket.setNoDelay === 'function') {
        socket.setNoDelay(true);
      }
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
  });

  wss.on('connection', (ws) => {
    const rawSocket = (ws as unknown as { _socket?: { setNoDelay?: (v: boolean) => void } })
      ._socket;
    rawSocket?.setNoDelay?.(true);
    const client: ClientSession = {
      ws,
      id: `c-${clientSeq++}`,
      name: `Jogador ${clientSeq}`,
      exp: 0,
      seasonNumber: getCurrentSeasonInfo().seasonNumber,
      appearance: createDefaultCharacterConfig(),
      equippedSkills: [],
      roomCode: null,
      playerSlot: null,
      isSpectator: false,
      isDev: false,
    };
    clientByWs.set(ws, client);

    sendJson(ws, { type: 'connected', clientId: client.id });
    sendJson(ws, getLiveRoomsPayload());

    ws.on('message', (raw) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString()) as Record<string, unknown>;
      } catch {
        return;
      }

      const type = String(msg.type || '');
      if (type === 'ping') {
        sendJson(ws, { type: 'pong', t: msg.t });
        return;
      }

      if (type === 'pi' || type === 'player_input') {
        if (!client.roomCode || !client.playerSlot || client.isSpectator) return;
        const room = rooms.get(client.roomCode);
        if (!room || !room.state) return;

        const slot = client.playerSlot;
        const isCompact = type === 'pi';
        const moveX = Number(isCompact ? msg.x : msg.moveX) || 0;
        const moveY = Number(isCompact ? msg.y : msg.moveY) || 0;
        const shoot = Boolean(isCompact ? msg.sh : msg.shoot);
        const dribble = Boolean(isCompact ? msg.dr : msg.dribble);
        const pass = Boolean(isCompact ? msg.ps : msg.pass);
        const switchPlayer = Boolean(isCompact ? msg.sw : msg.switchPlayer);
        const sprint = Boolean(isCompact ? msg.sp : msg.sprint);
        const skill1 = Boolean(isCompact ? msg.s1 : msg.skill1);
        const skill2 = Boolean(isCompact ? msg.s2 : msg.skill2);
        const rawDiagMs = Number(isCompact ? msg.dt : msg.diagonalToleranceMs);
        const diagonalToleranceMs = Number.isFinite(rawDiagMs)
          ? Math.max(0, Math.min(400, Math.round(rawDiagMs)))
          : undefined;

        const nextMoveX = Math.max(-1, Math.min(1, moveX));
        const nextMoveY = Math.max(-1, Math.min(1, moveY));
        const prevInput = room.inputs[slot];
        if (
          !prevInput ||
          Math.abs(prevInput.moveX - nextMoveX) > 0.01 ||
          Math.abs(prevInput.moveY - nextMoveY) > 0.01 ||
          prevInput.shoot !== shoot ||
          prevInput.dribble !== dribble ||
          prevInput.pass !== pass ||
          Boolean(prevInput.switchPlayer) !== switchPlayer ||
          prevInput.sprint !== sprint ||
          Boolean(prevInput.skill1) !== skill1 ||
          Boolean(prevInput.skill2) !== skill2
        ) {
          room.inputDirty = true;
        }

        room.inputs[slot] = {
          moveX: nextMoveX,
          moveY: nextMoveY,
          shoot,
          dribble,
          pass,
          switchPlayer,
          sprint,
          skill1,
          skill2,
          ...(diagonalToleranceMs !== undefined ? { diagonalToleranceMs } : {}),
        };
        if (shoot || dribble || pass || switchPlayer || skill1 || skill2) {
          const latch =
            room.latches[slot] ??
            (room.latches[slot] = {
              shoot: false,
              dribble: false,
              pass: false,
              switchPlayer: false,
              skill1: false,
              skill2: false,
            });
          if (shoot) latch.shoot = true;
          if (dribble) latch.dribble = true;
          if (pass) latch.pass = true;
          if (switchPlayer) latch.switchPlayer = true;
          if (skill1) latch.skill1 = true;
          if (skill2) latch.skill2 = true;
        }
        return;
      }

      syncClientSeason(client);
      if (typeof msg.name === 'string' && msg.name.trim().length > 0) {
        client.name = msg.name.trim().slice(0, 16);
      }
      if (typeof msg.exp === 'number' && Number.isFinite(msg.exp) && msg.exp >= 0) {
        const msgSeason =
          typeof msg.seasonNumber === 'number' && Number.isFinite(msg.seasonNumber)
            ? Math.floor(msg.seasonNumber)
            : client.seasonNumber;
        if (msgSeason < client.seasonNumber) {
          client.exp = 0;
        } else {
          client.exp = Math.min(1000000, Math.floor(msg.exp));
        }
      }
      if (msg.appearance !== undefined) {
        client.appearance = sanitizeCharacterConfig(msg.appearance);
      }
      if (msg.equippedSkills !== undefined) {
        client.equippedSkills = sanitizeEquippedSkillList(msg.equippedSkills);
      }

      if (Object.prototype.hasOwnProperty.call(msg, 'devToken')) {
        client.isDev = isValidDevToken(msg.devToken);
      }
      if (client.isDev && msg.devHacks && typeof msg.devHacks === 'object') {
        client.pendingDevHacks = sanitizeServerDevHacks(msg.devHacks);
      }

      if (type === 'dev_auth') {
        if (isValidDevToken(msg.token)) {
          client.isDev = true;
          sendJson(ws, { type: 'dev_authenticated', ok: true });
        } else {
          client.isDev = false;
          sendJson(ws, { type: 'dev_authenticated', ok: false });
        }
        return;
      }

      if (type === 'list_live_rooms') {
        sendJson(ws, getLiveRoomsPayload());
        return;
      }

      if (type === 'update_profile') {
        if (client.roomCode && !client.isSpectator) {
          const room = rooms.get(client.roomCode);
          if (room && !room.state) {
            broadcastLobby(room);
          }
        }
        return;
      }

      if (type === 'dev_lock') {
        client.isDev = false;
        if (client.roomCode) {
          const room = rooms.get(client.roomCode);
          if (room && room.devOwnerId === client.id) {
            room.devOwnerId = null;
            room.devHacks = { ...DEFAULT_DEV_HACKS, enabled: false };
          }
        }
        return;
      }

      if (type === 'dev_set_hacks') {
        if (!client.isDev) return;
        client.isDev = true;
        if (!client.roomCode || client.isSpectator) return;
        const room = rooms.get(client.roomCode);
        if (!room) return;
        room.devOwnerId = client.id;
        room.devHacks = sanitizeServerDevHacks(msg.hacks);
        client.pendingDevHacks = room.devHacks;
        return;
      }

      if (type === 'dev_command') {
        if (!client.isDev) return;
        client.isDev = true;
        if (!client.roomCode || !client.playerSlot || client.isSpectator) return;
        const room = rooms.get(client.roomCode);
        if (!room || !room.state) return;

        const cmd = String(msg.command || '');
        const st = room.state;
        if (cmd === 'add_goal') {
          const t: Team = msg.team === 'red' ? 'red' : 'blue';
          const delta = Math.trunc(Number(msg.delta || 0));
          st.score[t] = Math.max(0, st.score[t] + delta);
        } else if (cmd === 'reset_score') {
          st.score.blue = 0;
          st.score.red = 0;
        } else if (cmd === 'adjust_time') {
          const tm = String(msg.timeMode || '');
          if (tm === 'add30') {
            st.timeRemaining += 30;
          } else if (tm === 'set5') {
            st.timeRemaining = 5;
            if (st.phase === 'KICKOFF' || st.phase === 'OVERTIME') {
              st.phase = 'PLAYING';
              st.phaseTimer = 0;
            }
          } else if (tm === 'set999') {
            st.timeRemaining = 999;
            if (st.phase === 'KICKOFF' || st.phase === 'OVERTIME') {
              st.phase = 'PLAYING';
              st.phaseTimer = 0;
            }
          } else if (tm === 'finish') {
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
        } else if (cmd === 'bring_ball') {
          const targetId = st.controlMap?.[client.playerSlot] ?? client.playerSlot;
          const target = st.players.find((p) => p.id === targetId) ?? st.players[0];
          if (target) {
            target.pickupLockout = 0;
            target.stealImmunity = 0.5;
            st.ball.possessorId = target.id;
            st.ball.lastTouchTeam = target.team;
            st.ball.vx = 0;
            st.ball.vy = 0;
            st.ball.x = target.x + Math.cos(target.facingAngle) * 34;
            st.ball.y = target.y + Math.sin(target.facingAngle) * 34;
          }
        }

        const packetJson = JSON.stringify(
          encodeCompactState(st, {
            spectatorCount: room.spectators.size,
            serverTime: Date.now(),
          })
        );
        for (const c of room.slots.values()) {
          sendRawJson(c.ws, packetJson, true);
        }
        for (const spec of room.spectators.values()) {
          sendRawJson(spec.ws, packetJson, true);
        }
        return;
      }

      if (type === 'create_room') {
        leaveRoom(client);
        const teamSize = parseTeamSize(msg.teamSize);
        const isRanked = Boolean(msg.isRanked);
        const code = generateRoomCode();
        const initialDevHacks =
          client.isDev && msg.devHacks
            ? sanitizeServerDevHacks(msg.devHacks)
            : { ...DEFAULT_DEV_HACKS };
        const room: OnlineRoom = {
          code,
          teamSize,
          isRanked,
          hostId: client.id,
          slots: new Map([['blue-1', client]]),
          spectators: new Map(),
          state: null,
          devHacks: initialDevHacks,
          devOwnerId: client.isDev && initialDevHacks.enabled ? client.id : null,
          inputs: {},
          latches: {},
          intervalId: null,
          lastStepAt: performance.now(),
          inputDirty: false,
          broadcastTickCount: 0,
        };
        client.roomCode = code;
        client.playerSlot = 'blue-1';
        client.isSpectator = false;
        rooms.set(code, room);
        broadcastLobby(room);
        return;
      }

      if (type === 'join_room') {
        leaveRoom(client);
        const code = String(msg.roomCode || '')
          .trim()
          .toUpperCase();
        const room = rooms.get(code);
        if (!room) {
          sendJson(ws, {
            type: 'error',
            message: 'Sala não encontrada. Verifique o código digitado.',
          });
          return;
        }
        // Automatically enter Spectator Mode if match already started or room is full
        if (room.state !== null) {
          enterSpectatorRoom(room, client);
          return;
        }
        const nextSlot = findNextBalancedSlot(room);
        if (!nextSlot) {
          sendJson(ws, {
            type: 'error',
            message: 'Esta sala já está lotada.',
          });
          return;
        }
        room.slots.set(nextSlot, client);
        client.roomCode = code;
        client.playerSlot = nextSlot;
        client.isSpectator = false;
        if (client.isDev && client.pendingDevHacks?.enabled) {
          room.devOwnerId = client.id;
          room.devHacks = { ...client.pendingDevHacks };
        }
        broadcastLobby(room);
        return;
      }

      if (type === 'spectate_room') {
        leaveRoom(client);
        const code = String(msg.roomCode || '')
          .trim()
          .toUpperCase();
        const room = rooms.get(code);
        if (!room || !room.state) {
          sendJson(ws, {
            type: 'error',
            message: 'Esta partida não está ativa no momento.',
          });
          broadcastLiveRooms();
          return;
        }
        enterSpectatorRoom(room, client);
        return;
      }

      if (type === 'switch_team') {
        if (!client.roomCode || !client.playerSlot || client.isSpectator) return;
        const room = rooms.get(client.roomCode);
        if (!room || room.state) return;

        const targetTeam: Team = client.playerSlot.startsWith('blue') ? 'red' : 'blue';
        const targetSlots = getTeamSlots(targetTeam, room.teamSize);
        const openSlot = targetSlots.find((s) => !room.slots.has(s));
        if (!openSlot) {
          sendJson(ws, {
            type: 'error',
            message: `O ${targetTeam === 'blue' ? 'Time Azul' : 'Time Vermelho'} já está completo.`,
          });
          return;
        }
        room.slots.delete(client.playerSlot);
        room.slots.set(openSlot, client);
        client.playerSlot = openSlot;
        broadcastLobby(room);
        return;
      }

      if (type === 'quick_match') {
        leaveRoom(client);
        const teamSize = parseTeamSize(msg.teamSize);
        const isRanked = Boolean(msg.isRanked);
        const queueKey: QueueKey = `${teamSize}-${isRanked ? 'ranked' : 'casual'}`;
        const waiting = quickMatchQueues[queueKey];

        if (
          waiting &&
          waiting.id !== client.id &&
          waiting.ws.readyState === WebSocket.OPEN
        ) {
          quickMatchQueues[queueKey] = null;
          const code = generateRoomCode();
          const devClient =
            client.isDev && client.pendingDevHacks?.enabled
              ? client
              : waiting.isDev && waiting.pendingDevHacks?.enabled
              ? waiting
              : null;
          const initialDevHacks = devClient?.pendingDevHacks
            ? { ...devClient.pendingDevHacks }
            : { ...DEFAULT_DEV_HACKS };
          const room: OnlineRoom = {
            code,
            teamSize,
            isRanked,
            hostId: waiting.id,
            slots: new Map([
              ['blue-1', waiting],
              ['red-1', client],
            ]),
            spectators: new Map(),
            state: null,
            devHacks: initialDevHacks,
            devOwnerId: devClient ? devClient.id : null,
            inputs: {},
            latches: {},
            intervalId: null,
            lastStepAt: performance.now(),
            inputDirty: false,
            broadcastTickCount: 0,
          };
          waiting.roomCode = code;
          waiting.playerSlot = 'blue-1';
          waiting.isSpectator = false;
          client.roomCode = code;
          client.playerSlot = 'red-1';
          client.isSpectator = false;
          rooms.set(code, room);
          broadcastLobby(room);
          startRoomMatch(room);
        } else {
          quickMatchQueues[queueKey] = client;
          sendJson(ws, { type: 'matchmaking_waiting', isRanked });
        }
        return;
      }

      if (type === 'cancel_quick_match') {
        clearClientFromQueues(client);
        return;
      }

      if (type === 'start_match' || type === 'rematch') {
        if (!client.roomCode || client.isSpectator) return;
        const room = rooms.get(client.roomCode);
        if (!room || room.slots.size < 2) return;
        if (type === 'start_match' && room.hostId !== client.id) return;
        startRoomMatch(room);
        return;
      }

      if (type === 'leave_room') {
        leaveRoom(client);
        return;
      }

      if (type === 'send_emote') {
        if (!client.roomCode || !client.playerSlot || client.isSpectator) return;
        const room = rooms.get(client.roomCode);
        if (!room) return;
        const emoteId = String(msg.emoteId || '');
        const emote = EMOTE_OPTIONS.find((e) => e.id === emoteId);
        if (!emote) return;

        const activePlayerId =
          room.state?.controlMap?.[client.playerSlot] ?? client.playerSlot;
        const team: Team = client.playerSlot.startsWith('red') ? 'red' : 'blue';
        const packet = {
          type: 'emote',
          uid: `${client.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          playerId: activePlayerId,
          senderName: client.name,
          team,
          emoji: emote.emoji,
          label: emote.label,
          createdAt: Date.now(),
        };
        for (const c of room.slots.values()) {
          sendJson(c.ws, packet);
        }
        for (const spec of room.spectators.values()) {
          sendJson(spec.ws, packet);
        }
        return;
      }

    });

    ws.on('close', () => {
      clientByWs.delete(ws);
      leaveRoom(client);
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Arena Futebol server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
