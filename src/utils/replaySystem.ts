import {
  getPitchBounds,
  type GameState,
  type MatchWinner,
  type Team,
  type TeamSize,
} from '../shared/gameEngine.ts';
import { getSkillById, type SkillId } from '../shared/skills.ts';

export type HighlightKind = 'goal' | 'post' | 'skill' | 'save';

export interface HighlightClip {
  id: string;
  kind: HighlightKind;
  title: string;
  matchTimeSeconds: number;
  scoreAtMoment: { blue: number; red: number };
  team?: Team;
  skillId?: SkillId;
  priority: number;
  frames: GameState[];
}

export interface SavedMatchHighlights {
  id: string;
  mode: '1p' | '2p';
  teamSize: TeamSize;
  blueName: string;
  redName: string;
  blueScore: number;
  redScore: number;
  winner: MatchWinner;
  createdAt: number;
  clips: HighlightClip[];
}

const PRE_ROLL_MAX_FRAMES = 120; // ~4.0 seconds at 30fps
const FRAME_INTERVAL = 1 / 30;
const MAX_CLIPS_PER_MATCH = 8;
const MAX_SAVED_MATCHES = 6;

const DB_NAME = 'arena-futebol-replays-db';
const DB_VERSION = 1;
const STORE_NAME = 'matchReplays';

export function cloneGameStateSnapshot(st: GameState): GameState {
  return {
    mode: st.mode,
    teamSize: st.teamSize,
    phase: st.phase,
    phaseTimer: st.phaseTimer,
    timeRemaining: st.timeRemaining,
    overtimeCount: st.overtimeCount,
    score: {
      blue: st.score.blue,
      red: st.score.red,
    },
    lastScorerTeam: st.lastScorerTeam,
    lastScorerName: st.lastScorerName,
    lastGoalOwnGoal: Boolean(st.lastGoalOwnGoal),
    winner: st.winner,
    humanSlots: [...st.humanSlots],
    humanNames: { ...st.humanNames },
    controlMap: { ...st.controlMap },
    players: st.players.map((p) => ({
      ...p,
      equippedSkills: [...p.equippedSkills],
      skillCooldowns: [p.skillCooldowns[0], p.skillCooldowns[1]],
      appearance: p.appearance ? { ...p.appearance } : undefined,
    })),
    ball: { ...st.ball },
    skillObjects: st.skillObjects.map((obj) =>
      obj.kind === 'wall'
        ? { ...obj }
        : {
            ...obj,
            appearance: obj.appearance ? { ...obj.appearance } : undefined,
          }
    ),
    events: st.events.map((ev) => ({ ...ev })),
    tick: st.tick,
  };
}

interface ActiveHighlightCapture {
  id: string;
  kind: HighlightKind;
  title: string;
  priority: number;
  matchTimeSeconds: number;
  scoreAtMoment: { blue: number; red: number };
  team?: Team;
  skillId?: SkillId;
  frames: GameState[];
  remainingPostFrames: number;
}

export class MatchHighlightRecorder {
  private preRoll: GameState[] = [];
  private clips: HighlightClip[] = [];
  private activeCapture: ActiveHighlightCapture | null = null;
  private accumulator = 0;

  reset(): void {
    this.preRoll = [];
    this.clips = [];
    this.activeCapture = null;
    this.accumulator = 0;
  }

  private pushPreRoll(snap: GameState): void {
    this.preRoll.push(snap);
    if (this.preRoll.length > PRE_ROLL_MAX_FRAMES) {
      this.preRoll.shift();
    }
  }

  private finalizeActiveCapture(): void {
    if (!this.activeCapture) return;
    if (this.activeCapture.frames.length >= 12) {
      this.clips.push({
        id: this.activeCapture.id,
        kind: this.activeCapture.kind,
        title: this.activeCapture.title,
        matchTimeSeconds: this.activeCapture.matchTimeSeconds,
        scoreAtMoment: { ...this.activeCapture.scoreAtMoment },
        team: this.activeCapture.team,
        skillId: this.activeCapture.skillId,
        priority: this.activeCapture.priority,
        frames: this.activeCapture.frames,
      });
      this.trimClips();
    }
    this.activeCapture = null;
  }

  private trimClips(): void {
    if (this.clips.length <= MAX_CLIPS_PER_MATCH) return;
    // Drop lowest-priority non-goal clip first (or oldest extra clip if all are goals)
    let dropIdx = 0;
    let lowestPriority = Infinity;
    for (let i = 0; i < this.clips.length; i++) {
      if (this.clips[i].priority < lowestPriority) {
        lowestPriority = this.clips[i].priority;
        dropIdx = i;
      }
    }
    this.clips.splice(dropIdx, 1);
  }

  private triggerHighlight(
    st: GameState,
    opts: {
      kind: HighlightKind;
      title: string;
      priority: number;
      postFrames: number;
      team?: Team;
      skillId?: SkillId;
    }
  ): void {
    if (this.activeCapture) {
      // Upgrade an in-flight post/skill capture into a goal highlight seamlessly
      if (opts.priority > this.activeCapture.priority) {
        this.activeCapture.kind = opts.kind;
        this.activeCapture.title = opts.title;
        this.activeCapture.priority = opts.priority;
        this.activeCapture.matchTimeSeconds = Math.max(0, Math.round(st.timeRemaining));
        this.activeCapture.scoreAtMoment = { blue: st.score.blue, red: st.score.red };
        this.activeCapture.team = opts.team;
        if (opts.skillId) this.activeCapture.skillId = opts.skillId;
        this.activeCapture.remainingPostFrames = Math.max(
          this.activeCapture.remainingPostFrames,
          opts.postFrames
        );
      }
      return;
    }

    const baseFrames = this.preRoll.slice();
    this.activeCapture = {
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      kind: opts.kind,
      title: opts.title,
      priority: opts.priority,
      matchTimeSeconds: Math.max(0, Math.round(st.timeRemaining)),
      scoreAtMoment: { blue: st.score.blue, red: st.score.red },
      team: opts.team,
      skillId: opts.skillId,
      frames: baseFrames,
      remainingPostFrames: opts.postFrames,
    };
  }

  recordStep(st: GameState, dt: number): void {
    if (st.mode !== '1p' && st.mode !== '2p') return;

    let forcedSample = false;

    for (const ev of st.events) {
      if (ev.type === 'goal') {
        const scorer = ev.ownGoal
          ? 'GOL CONTRA KKKKKKKKKKKKK'
          : ev.scorerName || st.lastScorerName || 'Gol';
        this.triggerHighlight(st, {
          kind: 'goal',
          title: scorer,
          priority: 100,
          postFrames: 45,
          team: ev.team ?? st.lastScorerTeam ?? undefined,
        });
        forcedSample = true;
      } else if (ev.type === 'post') {
        this.triggerHighlight(st, {
          kind: 'post',
          title: 'Na Trave!',
          priority: 72,
          postFrames: 36,
          team: st.ball.lastTouchTeam ?? undefined,
        });
        forcedSample = true;
      } else if (ev.type === 'skill' && ev.skillId) {
        const sk = getSkillById(ev.skillId);
        const prio =
          sk?.rarity === 'mythic'
            ? 62
            : sk?.rarity === 'legendary'
            ? 56
            : sk?.rarity === 'epic'
            ? 48
            : 36;
        this.triggerHighlight(st, {
          kind: 'skill',
          title: sk ? sk.name : 'Skill',
          priority: prio,
          postFrames: 40,
          team: ev.team,
          skillId: ev.skillId,
        });
        forcedSample = true;
      } else if (
        ev.type === 'steal' &&
        (st.ball.x < getPitchBounds(st.teamSize).pitchLeft + 320 ||
          st.ball.x > getPitchBounds(st.teamSize).pitchRight - 320)
      ) {
        this.triggerHighlight(st, {
          kind: 'save',
          title: 'Desarme / Defesa',
          priority: 44,
          postFrames: 34,
          team: ev.team,
        });
        forcedSample = true;
      }
    }

    this.accumulator += dt;
    if (forcedSample || this.accumulator >= FRAME_INTERVAL) {
      while (this.accumulator >= FRAME_INTERVAL) {
        this.accumulator -= FRAME_INTERVAL;
      }
      const snap = cloneGameStateSnapshot(st);
      this.pushPreRoll(snap);

      if (this.activeCapture) {
        this.activeCapture.frames.push(snap);
        this.activeCapture.remainingPostFrames -= 1;
        if (this.activeCapture.remainingPostFrames <= 0) {
          this.finalizeActiveCapture();
        }
      }
    }
  }

  finalizeMatch(st: GameState): SavedMatchHighlights {
    if (this.activeCapture) {
      this.finalizeActiveCapture();
    }

    if (this.clips.length === 0 && this.preRoll.length > 0) {
      this.clips.push({
        id: `hl-final-${Date.now()}`,
        kind: 'save',
        title: 'Momento Final',
        matchTimeSeconds: Math.max(0, Math.round(st.timeRemaining)),
        scoreAtMoment: { blue: st.score.blue, red: st.score.red },
        priority: 10,
        frames: this.preRoll.slice(-110),
      });
    }

    const blueName =
      st.humanNames?.['blue-1'] ??
      st.players.find((p) => p.id === 'blue-1')?.name ??
      'Time Azul';
    const redName =
      st.humanNames?.['red-1'] ??
      st.players.find((p) => p.id === 'red-1')?.name ??
      'Time Vermelho';

    return {
      id: `replay-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      mode: st.mode === '2p' ? '2p' : '1p',
      teamSize: st.teamSize,
      blueName,
      redName,
      blueScore: st.score.blue,
      redScore: st.score.red,
      winner: st.winner,
      createdAt: Date.now(),
      clips: [...this.clips],
    };
  }
}

function openReplayDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Failed to open replay DB'));
  });
}

export async function loadReplaysFromDB(): Promise<SavedMatchHighlights[]> {
  try {
    const db = await openReplayDB();
    return await new Promise<SavedMatchHighlights[]>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const rows = Array.isArray(req.result)
          ? (req.result as SavedMatchHighlights[])
          : [];
        rows.sort((a, b) => b.createdAt - a.createdAt);
        resolve(rows);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function saveReplayToDB(reel: SavedMatchHighlights): Promise<void> {
  if (!reel.clips.length) return;
  try {
    const existing = await loadReplaysFromDB();
    const db = await openReplayDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(reel);
      const allSorted = [reel, ...existing.filter((r) => r.id !== reel.id)].sort(
        (a, b) => b.createdAt - a.createdAt
      );
      for (const old of allSorted.slice(MAX_SAVED_MATCHES)) {
        store.delete(old.id);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export async function deleteReplayFromDB(id: string): Promise<void> {
  try {
    const db = await openReplayDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore
  }
}
