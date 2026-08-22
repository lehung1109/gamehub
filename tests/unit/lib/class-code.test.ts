// tests/unit/lib/class-code.test.ts
import { describe, it, expect } from 'vitest'
import { generateClassCode, isValidClassCode } from '@/lib/class-code'

describe('class-code utilities', () => {
  describe('generateClassCode', () => {
    it('generates a 6-character code by default', () => {
      const code = generateClassCode()
      expect(code).toBeDefined()
      expect(typeof code).toBe('string')
      expect(code.length).toBe(6)
    })

    it('generates only uppercase alphanumeric characters', () => {
      for (let i = 0; i < 20; i++) {
        const code = generateClassCode()
        expect(code).toMatch(/^[A-Z0-9]{6}$/)
      }
    })

    it('generates unique codes across multiple calls', () => {
      const set = new Set<string>()
      for (let i = 0; i < 50; i++) {
        set.add(generateClassCode())
      }
      expect(set.size).toBe(50)
    })
  })

  describe('isValidClassCode', () => {
    it('returns true for valid 6-8 character uppercase alphanumeric codes', () => {
      expect(isValidClassCode('ABC123')).toBe(true)
      expect(isValidClassCode('CLASS25')).toBe(true)
      expect(isValidClassCode('MATH2025')).toBe(true)
    })

    it('returns true for lowercase codes after normalisation or if case-insensitive', () => {
      expect(isValidClassCode('abc123')).toBe(true)
    })

    it('returns false for codes that are too short or too long', () => {
      expect(isValidClassCode('')).toBe(false)
      expect(isValidClassCode('AB')).toBe(false)
      expect(isValidClassCode('12345')).toBe(false)
      expect(isValidClassCode('TOOLONGCODE123')).toBe(false)
    })

    it('returns false for invalid non-alphanumeric characters', () => {
      expect(isValidClassCode('ABC 12')).toBe(false)
      expect(isValidClassCode('ABC-123')).toBe(false)
      expect(isValidClassCode('ABC@123')).toBe(false)
    })

    it('returns false for non-string values', () => {
      expect(isValidClassCode(null)).toBe(false)
      expect(isValidClassCode(undefined)).toBe(false)
      expect(isValidClassCode(123456)).toBe(false)
    })
  })
})
