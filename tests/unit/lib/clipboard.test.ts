// tests/unit/lib/clipboard.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { copyToClipboard } from '@/lib/clipboard'

describe('copyToClipboard utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('uses navigator.clipboard.writeText when available and resolves true', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const result = await copyToClipboard('TEST123')
    expect(result).toBe(true)
    expect(writeTextMock).toHaveBeenCalledWith('TEST123')
  })

  it('falls back to document.execCommand when navigator.clipboard is undefined', async () => {
    // Make navigator.clipboard undefined
    Object.assign(navigator, {
      clipboard: undefined,
    })

    const execCommandMock = vi.fn().mockReturnValue(true)
    document.execCommand = execCommandMock

    const result = await copyToClipboard('FALLBACK123')
    expect(result).toBe(true)
    expect(execCommandMock).toHaveBeenCalledWith('copy')
  })

  it('returns false for empty input or errors', async () => {
    const result = await copyToClipboard('')
    expect(result).toBe(false)
  })
})
