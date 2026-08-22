import { customAlphabet } from 'nanoid'

// URL-safe alphanumeric characters (no special ambiguous symbols)
const SLUG_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

const defaultNanoid = customAlphabet(SLUG_ALPHABET, 10)

/**
 * Generate a unique, short, URL-friendly slug
 * @param length Length of the slug (default 10)
 */
export function generateSlug(length = 10): string {
  if (length === 10) {
    return defaultNanoid()
  }
  const generator = customAlphabet(SLUG_ALPHABET, length)
  return generator()
}

/**
 * Validate whether a string is a valid slug format
 * @param slug String to check
 */
export function isValidSlug(slug: unknown): boolean {
  if (typeof slug !== 'string') return false
  const trimmed = slug.trim()
  if (!trimmed || trimmed.length < 3 || trimmed.length > 64) return false
  return /^[A-Za-z0-9_-]+$/.test(trimmed)
}
