import { customAlphabet } from 'nanoid'

// Use unambiguous uppercase characters (omitting easily confused chars: 0/O, 1/I)
// 32 unambiguous alphanumeric characters:
const CLASS_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

const defaultClassCodeNanoid = customAlphabet(CLASS_CODE_ALPHABET, 6)

/**
 * Generate a unique 6-character uppercase alphanumeric class code (e.g. "K9X2P4")
 * @param length Length of the code (default 6)
 */
export function generateClassCode(length = 6): string {
  if (length === 6) {
    return defaultClassCodeNanoid()
  }
  const generator = customAlphabet(CLASS_CODE_ALPHABET, length)
  return generator()
}

/**
 * Validate whether a string is a valid class code format (6-8 alphanumeric characters, case-insensitive)
 * @param code Class code string to validate
 */
export function isValidClassCode(code: unknown): boolean {
  if (typeof code !== 'string') return false
  const trimmed = code.trim().toUpperCase()
  if (!trimmed || trimmed.length < 6 || trimmed.length > 8) return false
  return /^[A-Z0-9]{6,8}$/.test(trimmed)
}
