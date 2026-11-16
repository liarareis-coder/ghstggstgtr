import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  sanitizeAnimationConfig,
  sanitizeMenuConfig,
  sanitizeUnlockedAnimations,
} from './shared/animations.ts';
import {
  sanitizeCharacterConfig,
  sanitizeUnlockedCosmetics,
} from './shared/character.ts';
import { parseTeamSize } from './shared/gameEngine.ts';
import {
  getCurrentSeasonInfo,
  getRankInfo,
  type RankId,
} from './shared/ranks.ts';
import { sanitizeHudConfig } from './utils/hudLayout.ts';
import {
  applySeasonResetIfNeeded,
  sanitizeEquippedSkills,
  sanitizeSelectedTurf,
  sanitizeUnlockedSkills,
  sanitizeUnlockedTurfs,
  type SaveMatchRecord,
  type SaveProfile,
} from './utils/saveSystem.ts';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;

export type OperationTypeValue = (typeof OperationType)[keyof typeof OperationType];

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationTypeValue;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: Array<{
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }>;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationTypeValue,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Verify Firestore connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export function subscribeAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function createEmailAccount(email: string, password: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  exp: number;
  rankId: RankId;
  rankedWins: number;
  rankedMatches: number;
  totalGoals: number;
}

function sanitizeDisplayName(name: string): string {
  const trimmed = name.trim().slice(0, 16);
  return trimmed.length > 0 ? trimmed : 'Jogador';
}

export async function loadCloudSave(uid: string): Promise<SaveProfile | null> {
  const path = `saves/${uid}`;
  try {
    const ref = doc(db, 'saves', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();

    const matchesPath = `saves/${uid}/matches`;
    let recentMatches: SaveMatchRecord[] = [];
    try {
      const mSnap = await getDocs(
        query(collection(db, 'saves', uid, 'matches'), where('uid', '==', uid))
      );
      recentMatches = mSnap.docs
        .map((d): SaveMatchRecord => {
          const md = d.data();
          const ts = md.createdAt instanceof Timestamp ? md.createdAt.toMillis() : Date.now();
          const teamSize: SaveMatchRecord['teamSize'] = parseTeamSize(md.teamSize);
          const result: SaveMatchRecord['result'] =
            md.result === 'win' || md.result === 'loss' ? md.result : 'draw';
          return {
            id: d.id,
            mode: md.mode,
            isRanked: Boolean(md.isRanked),
            teamSize,
            blueScore: Number(md.blueScore || 0),
            redScore: Number(md.redScore || 0),
            result,
            expDelta: Number(md.expDelta || 0),
            rankAfter: md.rankAfter as RankId,
            createdAt: ts,
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 12);
    } catch (matchErr) {
      handleFirestoreError(matchErr, OperationType.LIST, matchesPath);
    }

    const updatedMs =
      data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now();
    const exp = Math.max(0, Math.floor(Number(data.exp || 0)));
    const unlockedTurfs = sanitizeUnlockedTurfs(data.unlockedTurfs);
    const selectedTurf = sanitizeSelectedTurf(data.selectedTurf, unlockedTurfs);
    const unlockedCosmetics = sanitizeUnlockedCosmetics(data.unlockedCosmetics);
    const characterConfig = sanitizeCharacterConfig(
      data.characterConfig,
      unlockedCosmetics
    );
    const unlockedSkills = sanitizeUnlockedSkills(data.unlockedSkills);
    const equippedSkills = sanitizeEquippedSkills(data.equippedSkills, unlockedSkills);
    const unlockedAnimations = sanitizeUnlockedAnimations(data.unlockedAnimations);
    const animationConfig = sanitizeAnimationConfig(
      data.animationConfig,
      unlockedAnimations
    );
    const menuConfig = sanitizeMenuConfig(data.menuConfig);

    const currentSeason = getCurrentSeasonInfo().seasonNumber;
    const rawSeason = Number(data.seasonNumber);
    const parsedSeason =
      Number.isFinite(rawSeason) && rawSeason >= 1
        ? Math.floor(rawSeason)
        : currentSeason;

    const loadedProfile: SaveProfile = {
      displayName: sanitizeDisplayName(String(data.displayName || 'Jogador')),
      language:
        data.language === 'pt-PT' || data.language === 'en-US' || data.language === 'es'
          ? data.language
          : 'pt-BR',
      exp,
      rankId: getRankInfo(exp).tier.id,
      coins: Math.max(0, Math.floor(Number(data.coins || 0))),
      unlockedTurfs,
      selectedTurf,
      unlockedCosmetics,
      characterConfig,
      unlockedSkills,
      equippedSkills,
      unlockedAnimations,
      animationConfig,
      menuConfig,
      hudConfig: sanitizeHudConfig(data.hudConfig),
      rankedWins: Math.max(0, Math.floor(Number(data.rankedWins || 0))),
      rankedLosses: Math.max(0, Math.floor(Number(data.rankedLosses || 0))),
      rankedDraws: Math.max(0, Math.floor(Number(data.rankedDraws || 0))),
      totalMatches: Math.max(0, Math.floor(Number(data.totalMatches || 0))),
      totalGoals: Math.max(0, Math.floor(Number(data.totalGoals || 0))),
      preferredMode:
        data.preferredMode === '2p' ||
        data.preferredMode === 'training' ||
        data.preferredMode === 'online'
          ? data.preferredMode
          : '1p',
      preferredTeamSize: parseTeamSize(data.preferredTeamSize),
      muted: Boolean(data.muted),
      seasonNumber: parsedSeason,
      lastSavedAt: updatedMs,
      recentMatches,
    };
    return applySeasonResetIfNeeded(loadedProfile).profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function writeCloudSave(uid: string, rawProfile: SaveProfile): Promise<void> {
  const profile = applySeasonResetIfNeeded(rawProfile).profile;
  const currentSeason = getCurrentSeasonInfo().seasonNumber;
  const seasonNumber = Math.max(currentSeason, Math.floor(profile.seasonNumber || currentSeason));
  const savePath = `saves/${uid}`;
  const safeName = sanitizeDisplayName(profile.displayName);
  const exp = Math.max(0, Math.floor(profile.exp));
  const rankId = getRankInfo(exp).tier.id;
  const coins = Math.max(0, Math.floor(profile.coins || 0));
  const unlockedTurfs = sanitizeUnlockedTurfs(profile.unlockedTurfs);
  const selectedTurf = sanitizeSelectedTurf(profile.selectedTurf, unlockedTurfs);
  const unlockedCosmetics = sanitizeUnlockedCosmetics(profile.unlockedCosmetics);
  const characterConfig = sanitizeCharacterConfig(
    profile.characterConfig,
    unlockedCosmetics
  );
  const unlockedSkills = sanitizeUnlockedSkills(profile.unlockedSkills);
  const equippedSkills = sanitizeEquippedSkills(profile.equippedSkills, unlockedSkills);
  const unlockedAnimations = sanitizeUnlockedAnimations(profile.unlockedAnimations);
  const animationConfig = sanitizeAnimationConfig(
    profile.animationConfig,
    unlockedAnimations
  );
  const menuConfig = sanitizeMenuConfig(profile.menuConfig);
  const hudConfig = sanitizeHudConfig(profile.hudConfig);

  try {
    const saveRef = doc(db, 'saves', uid);
    const existingSnap = await getDoc(saveRef);
    const createdAtVal = existingSnap.exists()
      ? existingSnap.data().createdAt
      : serverTimestamp();

    await setDoc(saveRef, {
      uid,
      displayName: safeName,
      language: profile.language,
      exp,
      rankId,
      coins,
      unlockedTurfs,
      selectedTurf,
      unlockedCosmetics,
      characterConfig,
      unlockedSkills,
      equippedSkills,
      unlockedAnimations,
      animationConfig,
      menuConfig,
      hudConfig,
      rankedWins: Math.max(0, Math.floor(profile.rankedWins)),
      rankedLosses: Math.max(0, Math.floor(profile.rankedLosses)),
      rankedDraws: Math.max(0, Math.floor(profile.rankedDraws)),
      totalMatches: Math.max(0, Math.floor(profile.totalMatches)),
      totalGoals: Math.max(0, Math.floor(profile.totalGoals)),
      preferredMode: profile.preferredMode,
      preferredTeamSize: profile.preferredTeamSize,
      muted: Boolean(profile.muted),
      seasonNumber,
      createdAt: createdAtVal,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, savePath);
  }

  // Also sync PII-free public leaderboard entry
  const lbPath = `leaderboard/${uid}`;
  try {
    const lbRef = doc(db, 'leaderboard', uid);
    await setDoc(lbRef, {
      uid,
      displayName: safeName,
      exp,
      rankId,
      rankedWins: Math.max(0, Math.floor(profile.rankedWins)),
      rankedMatches: Math.max(
        0,
        Math.floor(profile.rankedWins + profile.rankedLosses + profile.rankedDraws)
      ),
      totalGoals: Math.max(0, Math.floor(profile.totalGoals)),
      seasonNumber,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, lbPath);
  }
}

export async function recordCloudMatch(
  uid: string,
  record: SaveMatchRecord
): Promise<void> {
  const matchPath = `saves/${uid}/matches/${record.id}`;
  try {
    const ref = doc(db, 'saves', uid, 'matches', record.id);
    await setDoc(ref, {
      uid,
      mode: record.mode,
      isRanked: Boolean(record.isRanked),
      teamSize: record.teamSize,
      blueScore: Math.min(99, Math.max(0, Math.floor(record.blueScore))),
      redScore: Math.min(99, Math.max(0, Math.floor(record.redScore))),
      result: record.result,
      expDelta: Math.min(500, Math.max(-200, Math.floor(record.expDelta))),
      rankAfter: record.rankAfter,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, matchPath);
  }
}

export async function fetchRankedLeaderboard(maxCount = 20): Promise<LeaderboardEntry[]> {
  const path = 'leaderboard';
  try {
    const q = query(
      collection(db, 'leaderboard'),
      where('exp', '>=', 0),
      orderBy('exp', 'desc'),
      limit(maxCount)
    );
    const snap = await getDocs(q);
    const currentSeason = getCurrentSeasonInfo().seasonNumber;
    return snap.docs
      .map((d) => {
        const data = d.data();
        const entrySeason =
          typeof data.seasonNumber === 'number' && Number.isFinite(data.seasonNumber)
            ? Math.floor(data.seasonNumber)
            : currentSeason;
        const staleSeason = entrySeason < currentSeason;
        const exp = staleSeason ? 0 : Math.max(0, Math.floor(Number(data.exp || 0)));
        return {
          uid: String(data.uid || d.id),
          displayName: sanitizeDisplayName(String(data.displayName || 'Jogador')),
          exp,
          rankId: getRankInfo(exp).tier.id,
          rankedWins: staleSeason ? 0 : Math.max(0, Math.floor(Number(data.rankedWins || 0))),
          rankedMatches: staleSeason
            ? 0
            : Math.max(0, Math.floor(Number(data.rankedMatches || 0))),
          totalGoals: Math.max(0, Math.floor(Number(data.totalGoals || 0))),
        };
      })
      .sort((a, b) => b.exp - a.exp);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
