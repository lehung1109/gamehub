// src/lib/arena/sound-engine.ts

/**
 * Zero-dependency Procedural Web Audio Sound Engine for Live Classroom Arena
 * Synthesizes dynamic tones directly using native AudioContext oscillators and gain nodes.
 */
export class ArenaSoundEngine {
  private static instance: ArenaSoundEngine | null = null
  private audioCtx: AudioContext | null = null
  private muted: boolean = false
  private volume: number = 0.8
  private lobbyInterval: ReturnType<typeof setInterval> | null = null

  private constructor() {
    // Lazy audio context init on user gesture
  }

  public static getInstance(): ArenaSoundEngine {
    if (!ArenaSoundEngine.instance) {
      ArenaSoundEngine.instance = new ArenaSoundEngine()
    }
    return ArenaSoundEngine.instance
  }

  private getGlobalScope(): Record<string, unknown> {
    if (typeof window !== 'undefined') return window as unknown as Record<string, unknown>
    if (typeof globalThis !== 'undefined') return globalThis as unknown as Record<string, unknown>
    return {}
  }

  public isSupported(): boolean {
    const globalScope = this.getGlobalScope()
    return Boolean(globalScope.AudioContext || globalScope.webkitAudioContext)
  }

  public init(force: boolean = false): void {
    if (this.audioCtx && !force) return

    const globalScope = this.getGlobalScope()
    try {
      const AudioContextClass = (globalScope.AudioContext ||
        globalScope.webkitAudioContext) as typeof AudioContext | undefined

      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass()
      }
    } catch {
      // Gracefully ignore AudioContext init errors in restricted environments
      this.audioCtx = null
    }
  }

  private ensureContext(): AudioContext | null {
    if (!this.audioCtx) {
      this.init()
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {
        // Autoplay policy may block resume until user gesture
      })
    }
    return this.audioCtx
  }

  public setMuted(muted: boolean): void {
    this.muted = muted
    if (muted) {
      this.stopLobbyGroove()
    }
  }

  public isMuted(): boolean {
    return this.muted
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  public getVolume(): number {
    return this.volume
  }

  /**
   * Schedules a procedural synthesized tone
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainLevel: number = 0.3,
    startOffset: number = 0
  ): void {
    if (this.muted) return
    const ctx = this.ensureContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime + startOffset
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = type
      osc.frequency.setValueAtTime(frequency, now)

      const effectiveGain = gainLevel * this.volume
      gain.gain.setValueAtTime(effectiveGain, now)
      // Decay envelope to avoid audio click
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + duration)
    } catch {
      // Audio playback failsafe
    }
  }

  /**
   * Cheerful chime played when student submits an answer
   */
  public playAnswerSubmitChime(): void {
    if (this.muted) return
    // C5 (523Hz) then E5 (659Hz)
    this.playTone(523.25, 0.15, 'sine', 0.25, 0)
    this.playTone(659.25, 0.25, 'sine', 0.25, 0.1)
  }

  /**
   * Tension countdown rhythm; intensifies when time is <= 5 seconds
   */
  public playCountdownTension(secondsRemaining: number): void {
    if (this.muted) return

    if (secondsRemaining <= 0) return

    if (secondsRemaining <= 5) {
      // High urgency double tick (330Hz then 440Hz)
      this.playTone(330, 0.1, 'square', 0.2, 0)
      this.playTone(440, 0.15, 'sawtooth', 0.25, 0.08)
    } else {
      // Steady clock tick (220Hz)
      this.playTone(220, 0.08, 'triangle', 0.15, 0)
    }
  }

  /**
   * Lobby groove: gentle ambient repeating arpeggio
   */
  public playLobbyGroove(): void {
    if (this.muted) return
    this.stopLobbyGroove()

    const notes = [261.63, 329.63, 392.0, 493.88, 523.25] // C4, E4, G4, B4, C5
    let step = 0

    const playStep = () => {
      if (this.muted) return
      const freq = notes[step % notes.length]
      this.playTone(freq, 0.35, 'triangle', 0.1, 0)
      step++
    }

    playStep()
    this.lobbyInterval = setInterval(playStep, 600)
  }

  /**
   * Stops lobby ambient loop
   */
  public stopLobbyGroove(): void {
    if (this.lobbyInterval) {
      clearInterval(this.lobbyInterval)
      this.lobbyInterval = null
    }
  }

  /**
   * Reveal drumroll: accelerating burst of noise/tones leading to chord hit
   */
  public playRevealDrumroll(): void {
    if (this.muted) return

    // Quick burst of pulses
    const pulseCount = 8
    for (let i = 0; i < pulseCount; i++) {
      const delay = i * 0.06 + Math.pow(i / pulseCount, 2) * 0.05
      this.playTone(180 + i * 20, 0.05, 'triangle', 0.15 + i * 0.02, delay)
    }

    // Big reveal chord at the end
    const finalDelay = 0.55
    this.playTone(523.25, 0.5, 'sine', 0.3, finalDelay) // C5
    this.playTone(659.25, 0.5, 'sine', 0.25, finalDelay) // E5
    this.playTone(783.99, 0.6, 'sine', 0.25, finalDelay) // G5
  }

  /**
   * Podium victory fanfare: cascading trumpet-style major chords
   */
  public playPodiumCelebration(): void {
    if (this.muted) return

    const fanfare = [
      { freq: 261.63, duration: 0.15, delay: 0 },
      { freq: 329.63, duration: 0.15, delay: 0.12 },
      { freq: 392.0, duration: 0.18, delay: 0.24 },
      { freq: 523.25, duration: 0.5, delay: 0.38 },
      { freq: 659.25, duration: 0.6, delay: 0.6 },
      { freq: 783.99, duration: 0.9, delay: 0.75 },
    ]

    for (const note of fanfare) {
      this.playTone(note.freq, note.duration, 'triangle', 0.3, note.delay)
      // Layer a sine octave for warmth
      this.playTone(note.freq * 2, note.duration * 0.8, 'sine', 0.15, note.delay)
    }
  }
}

export const arenaSound = ArenaSoundEngine.getInstance()
