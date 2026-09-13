// src/lib/rhythm-beat-synthesizer.ts

/**
 * Pure Web Audio procedural rhythm synthesizer.
 * Generates rhythmic percussion sounds (kick, woodblock click, clap/snare, chime)
 * client-side without any external sound file downloads.
 */

export interface SoundSynthesizer {
  playWoodblock: (time?: number) => void
  playKick: (time?: number) => void
  playSnare: (time?: number) => void
  playChime: (time?: number) => void
  close: () => Promise<void>
}

export function createRhythmSynthesizer(customCtx?: AudioContext): SoundSynthesizer | null {
  const AudioCtx =
    customCtx ??
    (typeof window !== 'undefined'
      ? (window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
      : null)

  if (!AudioCtx && !customCtx) {
    return null
  }

  const ctx: AudioContext = customCtx ?? new (AudioCtx as typeof AudioContext)()

  function playWoodblock(time = ctx.currentTime) {
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(820, time)
    osc.frequency.exponentialRampToValueAtTime(420, time + 0.04)

    gain.gain.setValueAtTime(0.7, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + 0.05)
  }

  function playKick(time = ctx.currentTime) {
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(140, time)
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.09)

    gain.gain.setValueAtTime(0.9, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + 0.11)
  }

  function playSnare(time = ctx.currentTime) {
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }
    // High-pitched click/snap
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(280, time)
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08)

    gain.gain.setValueAtTime(0.6, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + 0.09)
  }

  function playChime(time = ctx.currentTime) {
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, time)
    osc.frequency.exponentialRampToValueAtTime(1320, time + 0.15)

    gain.gain.setValueAtTime(0.4, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + 0.35)
  }

  return {
    playWoodblock,
    playKick,
    playSnare,
    playChime,
    close: async () => {
      try {
        if (ctx.state !== 'closed') {
          await ctx.close()
        }
      } catch {
        // Ignore close errors
      }
    },
  }
}
