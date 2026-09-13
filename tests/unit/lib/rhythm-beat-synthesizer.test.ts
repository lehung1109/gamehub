// tests/unit/lib/rhythm-beat-synthesizer.test.ts

import { describe, it, expect, vi } from 'vitest'
import { createRhythmSynthesizer } from '@/lib/rhythm-beat-synthesizer'

describe('Rhythm Beat Synthesizer', () => {
  it('returns null when AudioContext is unavailable', () => {
    const originalAudioContext = window.AudioContext
    // @ts-expect-error test mock
    delete window.AudioContext

    const synth = createRhythmSynthesizer()
    expect(synth).toBeNull()

    window.AudioContext = originalAudioContext
  })

  it('creates synthesizer and calls oscillator/gain methods with custom AudioContext', async () => {
    const startMock = vi.fn()
    const stopMock = vi.fn()
    const setValueAtTimeMock = vi.fn()
    const exponentialRampMock = vi.fn()
    const connectMock = vi.fn()
    const closeMock = vi.fn().mockResolvedValue(undefined)

    const mockCtx = {
      currentTime: 10.5,
      state: 'running',
      destination: {},
      createOscillator: () => ({
        type: 'sine',
        frequency: {
          setValueAtTime: setValueAtTimeMock,
          exponentialRampToValueAtTime: exponentialRampMock,
        },
        connect: connectMock,
        start: startMock,
        stop: stopMock,
      }),
      createGain: () => ({
        gain: {
          setValueAtTime: setValueAtTimeMock,
          exponentialRampToValueAtTime: exponentialRampMock,
        },
        connect: connectMock,
      }),
      resume: vi.fn(),
      close: closeMock,
    } as unknown as AudioContext

    const synth = createRhythmSynthesizer(mockCtx)
    expect(synth).not.toBeNull()

    // Test playing percussion
    synth?.playWoodblock()
    expect(startMock).toHaveBeenCalledTimes(1)
    expect(stopMock).toHaveBeenCalledTimes(1)

    synth?.playKick()
    expect(startMock).toHaveBeenCalledTimes(2)

    synth?.playSnare()
    expect(startMock).toHaveBeenCalledTimes(3)

    synth?.playChime()
    expect(startMock).toHaveBeenCalledTimes(4)

    await synth?.close()
    expect(closeMock).toHaveBeenCalled()
  })
})
