import type { GameEventType } from '../shared/gameEngine.ts';

type MatchOutcome = 'win' | 'loss' | 'draw';

interface ChordBar {
  bass: number;
  chord: number[];
  lead: number[];
}

// 4-bar upbeat stadium-arcade progression in A minor / C major (~118 BPM)
const MENU_BARS: ChordBar[] = [
  {
    bass: 110.0, // A2
    chord: [220.0, 261.63, 329.63, 392.0], // Am7
    lead: [659.25, 0, 783.99, 0, 880.0, 0, 783.99, 659.25, 587.33, 0, 659.25, 0, 523.25, 0, 587.33, 0],
  },
  {
    bass: 87.31, // F2
    chord: [174.61, 220.0, 261.63, 329.63], // Fmaj7
    lead: [523.25, 0, 659.25, 0, 783.99, 0, 659.25, 523.25, 440.0, 0, 523.25, 0, 659.25, 0, 523.25, 0],
  },
  {
    bass: 130.81, // C3
    chord: [261.63, 329.63, 392.0, 493.88], // Cmaj7
    lead: [783.99, 0, 659.25, 0, 523.25, 0, 587.33, 659.25, 783.99, 0, 880.0, 0, 783.99, 0, 659.25, 0],
  },
  {
    bass: 98.0, // G2
    chord: [196.0, 246.94, 293.66, 329.63], // G6
    lead: [587.33, 0, 493.88, 0, 392.0, 0, 440.0, 493.88, 587.33, 0, 659.25, 0, 783.99, 0, 587.33, 0],
  },
];

const STEP_DURATION_SEC = 60 / 118 / 4; // 16th note at 118 BPM (~0.127s)

class SoundFX {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;

  private menuMusicDesired = false;
  private menuMusicTimer: number | null = null;
  private nextStepTime = 0;
  private currentStep = 0;
  private listenersInstalled = false;

  constructor() {
    this.installLifecycleListeners();
  }

  private installLifecycleListeners() {
    if (this.listenersInstalled || typeof window === 'undefined') return;
    this.listenersInstalled = true;

    const unlockAndResume = () => {
      if (this.muted) return;
      const ctx = this.ensureContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.syncMenuMusicState();
        }).catch(() => {});
      } else {
        this.syncMenuMusicState();
      }
    };

    window.addEventListener('pointerdown', unlockAndResume, { passive: true });
    window.addEventListener('keydown', unlockAndResume, { passive: true });

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.stopSchedulerOnly();
        } else {
          this.syncMenuMusicState();
        }
      });
    }
  }

  public setMuted(m: boolean) {
    this.muted = m;
    if (m) {
      this.stopSchedulerOnly();
      if (this.ctx && this.musicGain) {
        const now = this.ctx.currentTime;
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setTargetAtTime(0.0001, now, 0.04);
      }
    } else {
      this.syncMenuMusicState();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMenuMusic(enabled: boolean) {
    this.menuMusicDesired = enabled;
    this.syncMenuMusicState();
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.92;
      this.sfxGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.0001;
      this.musicGain.connect(this.ctx.destination);

      // Build reusable 1.5s white-noise buffer for crowd roar, kicks, hi-hats & swooshes
      const sampleRate = this.ctx.sampleRate;
      const length = Math.floor(sampleRate * 1.5);
      const buffer = this.ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buffer;
    }
    return this.ctx;
  }

  private getCtx(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    const ctx = this.ensureContext();
    if (!ctx) return null;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  private getSfxOut(): AudioNode | null {
    const ctx = this.getCtx();
    if (!ctx || !this.sfxGain) return null;
    return this.sfxGain;
  }

  private stopSchedulerOnly() {
    if (this.menuMusicTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.menuMusicTimer);
      this.menuMusicTimer = null;
    }
    if (this.ctx && this.musicGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(0.0001, now, 0.08);
    }
  }

  private syncMenuMusicState() {
    if (typeof window === 'undefined') return;
    const shouldRun =
      this.menuMusicDesired &&
      !this.muted &&
      (typeof document === 'undefined' || !document.hidden);

    if (!shouldRun) {
      this.stopSchedulerOnly();
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.musicGain) return;
    if (ctx.state === 'suspended') {
      // Wait for user gesture listener to resume and re-sync
      return;
    }

    const now = ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setTargetAtTime(0.16, now, 0.25);

    if (this.menuMusicTimer !== null) return;

    this.nextStepTime = now + 0.05;
    this.menuMusicTimer = window.setInterval(() => {
      this.scheduleMusicAhead();
    }, 80);
  }

  private scheduleMusicAhead() {
    if (
      !this.menuMusicDesired ||
      this.muted ||
      !this.ctx ||
      !this.musicGain ||
      this.ctx.state !== 'running'
    ) {
      return;
    }

    const lookAheadSec = 0.24;
    while (this.nextStepTime < this.ctx.currentTime + lookAheadSec) {
      this.scheduleMusicStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += STEP_DURATION_SEC;
      this.currentStep = (this.currentStep + 1) % 64;
    }
  }

  private scheduleMusicStep(step: number, time: number) {
    const ctx = this.ctx;
    const out = this.musicGain;
    if (!ctx || !out) return;

    const barIdx = Math.floor(step / 16) % MENU_BARS.length;
    const stepInBar = step % 16;
    const bar = MENU_BARS[barIdx];

    // 1. Warm filtered synth pad on beat 1 of each bar
    if (stepInBar === 0) {
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(920, time);
      padFilter.connect(out);

      const padDur = STEP_DURATION_SEC * 15.2;
      for (const freq of bar.chord) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.linearRampToValueAtTime(0.052, time + 0.08);
        gain.gain.setValueAtTime(0.042, time + padDur - 0.18);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + padDur);
        osc.connect(gain);
        gain.connect(padFilter);
        osc.start(time);
        osc.stop(time + padDur + 0.02);
      }
    }

    // 2. Bouncy octave bassline
    if (
      stepInBar === 0 ||
      stepInBar === 3 ||
      stepInBar === 6 ||
      stepInBar === 8 ||
      stepInBar === 10 ||
      stepInBar === 14
    ) {
      const octaveUp = stepInBar === 6 || stepInBar === 14 ? 2 : 1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(520, time);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(bar.bass * octaveUp, time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.24, time + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + STEP_DURATION_SEC * 1.45);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(out);
      osc.start(time);
      osc.stop(time + STEP_DURATION_SEC * 1.5);
    }

    // 3. Bright arcade lead melody
    const leadFreq = bar.lead[stepInBar];
    if (leadFreq > 0) {
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(leadFreq, time);
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(leadFreq * 0.5, time);

      const noteLen = STEP_DURATION_SEC * 1.6;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.11, time + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + noteLen);

      osc.connect(gain);
      subOsc.connect(gain);
      gain.connect(out);
      osc.start(time);
      subOsc.start(time);
      osc.stop(time + noteLen + 0.02);
      subOsc.stop(time + noteLen + 0.02);
    }

    // 4. Light groove percussion (kick on 0, 8, 10; crisp hat on off-beats; soft snare on 4, 12)
    if (stepInBar === 0 || stepInBar === 8 || stepInBar === 10) {
      const kOsc = ctx.createOscillator();
      const kGain = ctx.createGain();
      kOsc.type = 'sine';
      kOsc.frequency.setValueAtTime(115, time);
      kOsc.frequency.exponentialRampToValueAtTime(42, time + 0.09);
      kGain.gain.setValueAtTime(0.26, time);
      kGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.11);
      kOsc.connect(kGain);
      kGain.connect(out);
      kOsc.start(time);
      kOsc.stop(time + 0.12);
    }

    if (this.noiseBuffer && (stepInBar % 4 === 2 || stepInBar === 4 || stepInBar === 12)) {
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      const nGain = ctx.createGain();
      if (stepInBar === 4 || stepInBar === 12) {
        // Soft snare / clap
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1900, time);
        filter.Q.value = 1.2;
        nGain.gain.setValueAtTime(0.1, time);
        nGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.085);
        src.connect(filter);
        filter.connect(nGain);
        nGain.connect(out);
        src.start(time);
        src.stop(time + 0.09);
      } else {
        // Crisp closed hi-hat
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7200, time);
        nGain.gain.setValueAtTime(0.055, time);
        nGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);
        src.connect(filter);
        filter.connect(nGain);
        nGain.connect(out);
        src.start(time);
        src.stop(time + 0.04);
      }
    }
  }

  private playNoiseBurst(
    startTime: number,
    duration: number,
    filterType: BiquadFilterType,
    freqStart: number,
    freqEnd: number,
    peakGain: number,
    q = 1
  ) {
    const ctx = this.ctx;
    const out = this.sfxGain;
    if (!ctx || !out || !this.noiseBuffer) return;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(freqStart, startTime);
    if (freqEnd !== freqStart) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), startTime + duration);
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + Math.min(0.03, duration * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(out);
    src.start(startTime);
    src.stop(startTime + duration + 0.02);
  }

  public play(type: GameEventType) {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;

    const now = ctx.currentTime;
    switch (type) {
      case 'kick': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(175, now);
        osc.frequency.exponentialRampToValueAtTime(46, now + 0.11);
        gain.gain.setValueAtTime(0.36, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.connect(gain);
        gain.connect(out);
        osc.start(now);
        osc.stop(now + 0.13);

        this.playNoiseBurst(now, 0.055, 'bandpass', 1200, 380, 0.16, 1.4);
        break;
      }
      case 'pass': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(98, now + 0.08);
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(out);
        osc.start(now);
        osc.stop(now + 0.09);

        this.playNoiseBurst(now, 0.035, 'bandpass', 1500, 650, 0.09, 1.5);
        break;
      }
      case 'dribble': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(out);
        osc.start(now);
        osc.stop(now + 0.14);

        this.playNoiseBurst(now, 0.11, 'bandpass', 650, 1900, 0.1, 1.8);
        break;
      }
      case 'steal': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(290, now);
        osc.frequency.exponentialRampToValueAtTime(115, now + 0.08);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(out);
        osc.start(now);
        osc.stop(now + 0.09);

        this.playNoiseBurst(now, 0.045, 'highpass', 1400, 900, 0.12);
        break;
      }
      case 'post': {
        [620, 985].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.86, now + 0.28);
          gain.gain.setValueAtTime(idx === 0 ? 0.22 : 0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(out);
          osc.start(now);
          osc.stop(now + 0.3);
        });
        break;
      }
      case 'whistle': {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(38, now);
        lfoGain.gain.setValueAtTime(85, now);
        lfo.connect(lfoGain);

        [2660, 2785].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          lfoGain.connect(osc.frequency);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(idx === 0 ? 0.1 : 0.06, now + 0.02);
          gain.gain.setValueAtTime(idx === 0 ? 0.09 : 0.055, now + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
          osc.connect(gain);
          gain.connect(out);
          osc.start(now);
          osc.stop(now + 0.33);
        });
        lfo.start(now);
        lfo.stop(now + 0.33);
        break;
      }
      case 'overtime': {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.085);
          gain.gain.setValueAtTime(0.18, now + idx * 0.085);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.085 + 0.28);
          osc.connect(gain);
          gain.connect(out);
          osc.start(now + idx * 0.085);
          osc.stop(now + idx * 0.085 + 0.28);
        });
        break;
      }
      case 'goal': {
        // Crowd roar swell + brassy stadium goal fanfare
        this.playNoiseBurst(now, 1.35, 'bandpass', 500, 1150, 0.22, 0.7);
        [392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const t0 = now + idx * 0.075;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t0);
          gain.gain.setValueAtTime(0.22, t0);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.56);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t0);
          osc.stop(t0 + 0.56);
        });
        break;
      }
      case 'skill': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(1060, now + 0.16);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(out);
        osc.start(now);
        osc.stop(now + 0.18);

        const chime = ctx.createOscillator();
        const chimeGain = ctx.createGain();
        chime.type = 'sine';
        chime.frequency.setValueAtTime(1318.51, now + 0.04);
        chimeGain.gain.setValueAtTime(0.09, now + 0.04);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
        chime.connect(chimeGain);
        chimeGain.connect(out);
        chime.start(now + 0.04);
        chime.stop(now + 0.24);
        break;
      }
    }
  }

  public playClick() {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(510, now + 0.032);
    gain.gain.setValueAtTime(0.065, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.036);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.036);
  }

  public playModalOpen() {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    [523.25, 783.99].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.045);
      gain.gain.setValueAtTime(0.06, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.13);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.13);
    });
  }

  public playModalClose() {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    [659.25, 440].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.055, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.11);
      osc.connect(gain);
      gain.connect(out);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.11);
    });
  }

  public playPurchase() {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    [987.77, 1318.51, 1760].forEach((freq, idx) => {
      const t0 = now + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.14, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t0);
      osc.stop(t0 + 0.25);
    });
  }

  public playEquip() {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    [587.33, 880].forEach((freq, idx) => {
      const t0 = now + idx * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.11, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.15);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t0);
      osc.stop(t0 + 0.15);
    });
  }

  public playPause(isPaused: boolean) {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    const notes = isPaused ? [659.25, 440] : [440, 659.25];
    notes.forEach((freq, idx) => {
      const t0 = now + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.11, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.14);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t0);
      osc.stop(t0 + 0.14);
    });
  }

  public playCountdownTick(secondsLeft: number) {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    const urgent = secondsLeft <= 3;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = urgent ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(urgent ? 940 : 680, now);
    gain.gain.setValueAtTime(urgent ? 0.14 : 0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playMatchFound() {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const t0 = now + idx * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.13, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.24);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t0);
      osc.stop(t0 + 0.24);
    });
  }

  public playMatchEnd(outcome: MatchOutcome) {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;

    // Triple final whistle
    [0, 0.16, 0.34].forEach((offset, idx) => {
      const dur = idx === 2 ? 0.34 : 0.11;
      const t0 = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2680, t0);
      gain.gain.setValueAtTime(0.085, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t0);
      osc.stop(t0 + dur + 0.01);
    });

    if (outcome === 'win') {
      this.playNoiseBurst(now + 0.25, 1.1, 'bandpass', 520, 1100, 0.15, 0.8);
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const t0 = now + 0.36 + idx * 0.085;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.18, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.48);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t0);
        osc.stop(t0 + 0.48);
      });
    } else if (outcome === 'loss') {
      [440, 392, 349.23, 293.66].forEach((freq, idx) => {
        const t0 = now + 0.36 + idx * 0.11;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.14, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.36);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t0);
        osc.stop(t0 + 0.36);
      });
    } else {
      [392, 523.25, 392].forEach((freq, idx) => {
        const t0 = now + 0.36 + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.13, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t0);
        osc.stop(t0 + 0.32);
      });
    }
  }

  public playError() {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    [210, 155].forEach((freq, idx) => {
      const t0 = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.08, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t0);
      osc.stop(t0 + 0.1);
    });
  }

  public playEmote() {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.09);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    osc.connect(gain);
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playLootbox() {
    const out = this.getSfxOut();
    const ctx = this.ctx;
    if (!ctx || !out) return;
    const now = ctx.currentTime;
    [440, 554.37, 659.25, 880, 1108.73].forEach((freq, idx) => {
      const t0 = now + idx * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.15, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.34);
      osc.connect(gain);
      gain.connect(out);
      osc.start(t0);
      osc.stop(t0 + 0.34);
    });
  }
}

export const soundFX = new SoundFX();
