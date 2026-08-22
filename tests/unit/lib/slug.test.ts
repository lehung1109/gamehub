import { describe, it, expect } from 'vitest'
import { generateSlug, isValidSlug } from '@/lib/slug'

describe('slug utility (T033 / US4)', () => {
  describe('generateSlug', () => {
    it('generates a 10-character slug by default', () => {
      const slug = generateSlug()
      expect(slug).toBeTypeOf('string')
      expect(slug.length).toBe(10)
    })

    it('generates a slug of specified custom length', () => {
      const slug6 = generateSlug(6)
      const slug12 = generateSlug(12)
      expect(slug6.length).toBe(6)
      expect(slug12.length).toBe(12)
    })

    it('generates URL-safe alphanumeric slugs without confusing characters', () => {
      for (let i = 0; i < 20; i++) {
        const slug = generateSlug()
        expect(isValidSlug(slug)).toBe(true)
        // URL safe characters only (letters and digits)
        expect(slug).toMatch(/^[A-Za-z0-9_-]+$/)
      }
    })

    it('generates unique slugs on successive calls', () => {
      const slugs = new Set<string>()
      for (let i = 0; i < 100; i++) {
        slugs.add(generateSlug())
      }
      expect(slugs.size).toBe(100)
    })
  })

  describe('isValidSlug', () => {
    it('returns true for valid slugs', () => {
      expect(isValidSlug('abc123XYZ0')).toBe(true)
      expect(isValidSlug('k9_a-Z2')).toBe(true)
    })

    it('returns false for invalid inputs or characters', () => {
      expect(isValidSlug('')).toBe(false)
      expect(isValidSlug('ab')).toBe(false) // too short (<3)
      expect(isValidSlug('a'.repeat(65))).toBe(false) // too long (>64)
      expect(isValidSlug('abc/def')).toBe(false)
      expect(isValidSlug('abc def')).toBe(false)
      expect(isValidSlug('abc?xyz')).toBe(false)
      expect(isValidSlug(null as unknown as string)).toBe(false)
      expect(isValidSlug(undefined as unknown as string)).toBe(false)
      expect(isValidSlug(123 as unknown as string)).toBe(false)
    })
  })
})
