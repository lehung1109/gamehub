import { describe, it, expect } from 'vitest'
import {
  decomposeWordIntoPhonemes,
  evaluatePhonemePronunciation,
} from '@/lib/phoneme-evaluator'

describe('Phoneme Assessment Engine', () => {
  describe('decomposeWordIntoPhonemes', () => {
    it('decomposes known primary vocabulary into segmented phonemes', () => {
      const likePhonemes = decomposeWordIntoPhonemes('like')
      expect(likePhonemes.length).toBeGreaterThanOrEqual(3)
      expect(likePhonemes[0].phoneme).toBe('l')
      expect(likePhonemes[likePhonemes.length - 1].phoneme).toBe('k')
      expect(likePhonemes[likePhonemes.length - 1].isEnding).toBe(true)

      const thinkPhonemes = decomposeWordIntoPhonemes('think')
      expect(thinkPhonemes[0].ipa).toBe('/θ/')
    })

    it('falls back to rule-based segmentation for arbitrary words', () => {
      const phonemes = decomposeWordIntoPhonemes('jump')
      expect(phonemes.length).toBeGreaterThan(0)
      expect(phonemes[phonemes.length - 1].isEnding).toBe(true)
    })
  })

  describe('evaluatePhonemePronunciation', () => {
    it('detects dropped final consonant when student omits ending sound (e.g. "lai" for "like")', () => {
      const result = evaluatePhonemePronunciation('like', 'lai')

      expect(result.targetWord).toBe('like')
      expect(result.hasDroppedFinalSound).toBe(true)
      expect(result.accuracy).toBeLessThan(80)

      const endingPhoneme = result.phonemes[result.phonemes.length - 1]
      expect(endingPhoneme.status).toBe('omitted')
      expect(endingPhoneme.tipVi).toMatch(/nuốt âm đuôi|bật âm đuôi/i)
      expect(result.remediationAdviceVi).toMatch(/âm đuôi \/k\//i)
    })

    it('detects dental fricative substitution (/θ/ spoken as /s/ e.g. "sink" for "think")', () => {
      const result = evaluatePhonemePronunciation('think', 'sink')

      expect(result.targetWord).toBe('think')
      const initialPhoneme = result.phonemes[0]
      expect(initialPhoneme.status).toBe('near')
      expect(initialPhoneme.tipVi).toMatch(/đầu lưỡi giữa hai hàm răng/i)
    })

    it('detects S/SH confusion (/ʃ/ spoken as /s/ e.g. "see" for "she")', () => {
      const result = evaluatePhonemePronunciation('she', 'see')

      expect(result.targetWord).toBe('she')
      const shPhoneme = result.phonemes[0]
      expect(shPhoneme.status).toBe('near')
      expect(shPhoneme.tipVi).toMatch(/tròn môi|cong lưỡi/i)
    })

    it('awards 3 stars and 100% accuracy for clear matching pronunciation', () => {
      const result = evaluatePhonemePronunciation('cat', 'cat')

      expect(result.accuracy).toBe(100)
      expect(result.stars).toBe(3)
      expect(result.isPassed).toBe(true)
      expect(result.hasDroppedFinalSound).toBe(false)
      result.phonemes.forEach((p) => {
        expect(p.status).toBe('perfect')
      })
    })

    it('handles empty or unrecognized input safely', () => {
      const result = evaluatePhonemePronunciation('dog', '')

      expect(result.accuracy).toBe(0)
      expect(result.stars).toBe(1)
      expect(result.isPassed).toBe(false)
    })
  })
})
