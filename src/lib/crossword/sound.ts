/**
 * Plays a pleasant celebratory chime using Web Audio API when a word is solved.
 * Safe to call in any environment (browser, SSR, tests).
 */
export function playWordSolvedSound(): void {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
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
