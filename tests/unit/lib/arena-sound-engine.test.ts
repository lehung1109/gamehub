import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ArenaSoundEngine } from '@/lib/arena/sound-engine'

describe('ArenaSoundEngine', () => {
  let engine: ArenaSoundEngine

  beforeEach(() => {
    engine = ArenaSoundEngine.getInstance()
    engine.setMuted(false)
    engine.setVolume(0.8)
  })

  afterEach(() => {
    engine.stopLobbyGroove()
    vi.restoreAllMocks()
  })

  it('safely handles environments without AudioContext (SSR/Node) without throwing', () => {
    // In Node / Vitest without window.AudioContext mock
    expect(() => {
      engine.playLobbyGroove()
      engine.playCountdownTension(10)
      engine.playCountdownTension(3)
      engine.playAnswerSubmitChime()
      engine.playRevealDrumroll()
      engine.playPodiumCelebration()
      engine.stopLobbyGroove()
    }).not.toThrow()
  })

  it('manages mute and volume state correctly', () => {
    expect(engine.isMuted()).toBe(false)
    expect(engine.getVolume()).toBe(0.8)

    engine.setMuted(true)
    expect(engine.isMuted()).toBe(true)

    engine.setVolume(0.5)
    expect(engine.getVolume()).toBe(0.5)

    // Clamps volume between 0 and 1
    engine.setVolume(1.5)
    expect(engine.getVolume()).toBe(1.0)

    engine.setVolume(-0.5)
    expect(engine.getVolume()).toBe(0.0)
  })

  describe('with mocked AudioContext', () => {
    let mockOscillator: {
      type: string
      frequency: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn>; value: number }
      connect: ReturnType<typeof vi.fn>
      start: ReturnType<typeof vi.fn>
      stop: ReturnType<typeof vi.fn>
    }

    let mockGain: {
      gain: { setValueAtTime: ReturnType<typeof vi.fn>; linearRampToValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn>; value: number }
      connect: ReturnType<typeof vi.fn>
    }

    let mockAudioCtx: {
      currentTime: number
      state: string
      resume: ReturnType<typeof vi.fn>
      createOscillator: ReturnType<typeof vi.fn>
      createGain: ReturnType<typeof vi.fn>
      destination: object
    }

    beforeEach(() => {
      mockOscillator = {
        type: 'sine',
        frequency: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          value: 440,
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }

      mockGain = {
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
          value: 1,
        },
        connect: vi.fn(),
      }

      mockAudioCtx = {
        currentTime: 0,
        state: 'running',
        resume: vi.fn().mockResolvedValue(undefined),
        createOscillator: vi.fn().mockReturnValue(mockOscillator),
        createGain: vi.fn().mockReturnValue(mockGain),
        destination: {},
      }

      const MockAudioContext = vi.fn(function () {
        return mockAudioCtx
      })
      vi.stubGlobal('AudioContext', MockAudioContext)
      // Force engine to re-initialize with the mock AudioContext
      engine.init(true)
    })

    it('detects AudioContext support', () => {
      expect(engine.isSupported()).toBe(true)
    })

    it('plays answer submit chime using oscillators', () => {
      engine.playAnswerSubmitChime()
      expect(mockAudioCtx.createOscillator).toHaveBeenCalled()
      expect(mockOscillator.start).toHaveBeenCalled()
    })

    it('plays countdown tension with higher frequency when seconds remaining <= 5', () => {
      engine.playCountdownTension(10)
      expect(mockAudioCtx.createOscillator).toHaveBeenCalled()

      const normalCalls = mockOscillator.frequency.setValueAtTime.mock.calls.length

      engine.playCountdownTension(2)
      expect(mockOscillator.frequency.setValueAtTime.mock.calls.length).toBeGreaterThan(normalCalls)
    })

    it('does not play sounds when muted', () => {
      mockAudioCtx.createOscillator.mockClear()
      engine.setMuted(true)

      engine.playAnswerSubmitChime()
      engine.playCountdownTension(3)
      engine.playLobbyGroove()
      engine.playRevealDrumroll()
      engine.playPodiumCelebration()

      expect(mockAudioCtx.createOscillator).not.toHaveBeenCalled()
    })

    it('plays and stops lobby groove loop cleanly', () => {
      engine.setMuted(false)
      engine.playLobbyGroove()
      expect(mockAudioCtx.createOscillator).toHaveBeenCalled()

      expect(() => {
        engine.stopLobbyGroove()
      }).not.toThrow()
    })

    it('plays reveal drumroll and podium celebration', () => {
      engine.playRevealDrumroll()
      expect(mockAudioCtx.createOscillator).toHaveBeenCalled()

      mockAudioCtx.createOscillator.mockClear()
      engine.playPodiumCelebration()
      expect(mockAudioCtx.createOscillator).toHaveBeenCalled()
    })
  })
})
