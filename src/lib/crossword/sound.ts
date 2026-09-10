/**
 * Plays a pleasant celebratory chime using Web Audio API when a word is solved.
 * Safe to call in any environment (browser, SSR, tests).
 */
let cachedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) {
    cachedAudioContext = null;
    return null;
  }

  if (cachedAudioContext && cachedAudioContext.state !== "closed") {
    if (cachedAudioContext.state === "suspended") {
      cachedAudioContext.resume().catch(() => {});
    }
    return cachedAudioContext;
  }

  try {
    cachedAudioContext = new AudioCtx();
    return cachedAudioContext;
  } catch {
    return null;
  }
}

/**
 * Plays a pleasant celebratory chime using Web Audio API when a word is solved.
 * Safe to call in any environment (browser, SSR, tests).
 */
export function playWordSolvedSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Two-tone cheerful chime: C5 (523.25 Hz) followed quickly by G5 (783.99 Hz)
    const notes = [
      { freq: 523.25, start: now, duration: 0.12 },
      { freq: 783.99, start: now + 0.1, duration: 0.25 },
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.freq, note.start);

      gain.gain.setValueAtTime(0.15, note.start);
      gain.gain.exponentialRampToValueAtTime(0.001, note.start + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(note.start);
      osc.stop(note.start + note.duration);
    }
  } catch {
    // Graceful fallback if Web Audio is restricted or unavailable
  }
}
