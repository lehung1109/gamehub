/**
 * Web Audio API sound synthesizer for Word Connect.
 * Safe to run in SSR, test environments (Node/JSDOM), and browsers without Web Audio support.
 */

let cachedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (cachedAudioContext && cachedAudioContext.state !== "closed") {
    if (cachedAudioContext.state === "suspended") {
      cachedAudioContext.resume().catch(() => {});
    }
    return cachedAudioContext;
  }
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      cachedAudioContext = new AudioCtx();
      return cachedAudioContext;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Plays a pleasant pop/tap sound when a letter node is selected.
 * Pitch ascends gently with the letter index.
 */
export function playLetterClickSound(index: number = 0): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Pentatonic-like pleasant step: 340Hz up to 580Hz
    const baseFreq = 340 + Math.min(index, 7) * 35;
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, now + 0.05);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  } catch {
    // Graceful fallback
  }
}

/**
 * Plays a cheerful chime when a target word is found.
 * Three ascending notes: C5 (523Hz), E5 (659Hz), G5 (784Hz).
 */
export function playTargetSolvedSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25, time: 0, dur: 0.1 },
      { freq: 659.25, time: 0.09, dur: 0.12 },
      { freq: 783.99, time: 0.2, dur: 0.22 },
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.12, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    }
  } catch {
    // Graceful fallback
  }
}

/**
 * Plays a magical sparkle chime when a bonus anagram word is discovered.
 * Sparkly ascending arpeggio: G5, B5, D6.
 */
export function playBonusSolvedSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { freq: 783.99, time: 0, dur: 0.08 },
      { freq: 987.77, time: 0.07, dur: 0.1 },
      { freq: 1174.66, time: 0.16, dur: 0.2 },
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.09, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    }
  } catch {
    // Graceful fallback
  }
}

/**
 * Plays a gentle low error buzz when submitting an invalid or duplicate word.
 */
export function playErrorBuzzSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.setValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch {
    // Graceful fallback
  }
}

/**
 * Plays a gentle harmonic chime when a hint letter is revealed.
 */
export function playHintRevealSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now); // A5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.1); // E6

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // Graceful fallback
  }
}

/**
 * Plays a triumphant fanfare when all target words are solved to clear the level.
 */
export function playLevelClearSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25, time: 0, dur: 0.12 }, // C5
      { freq: 659.25, time: 0.12, dur: 0.12 }, // E5
      { freq: 783.99, time: 0.24, dur: 0.14 }, // G5
      { freq: 1046.5, time: 0.38, dur: 0.4 }, // C6
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.12, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    }
  } catch {
    // Graceful fallback
  }
}

// Aliases for convenience
export const playLetterClick = playLetterClickSound;
export const playErrorSound = playErrorBuzzSound;
export const playHintSound = playHintRevealSound;
export const playFanfareSound = playLevelClearSound;
