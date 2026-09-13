import { describe, it, expect } from 'vitest'
import { generateArenaQrSvg } from '@/lib/arena/qr-generator'

describe('generateArenaQrSvg', () => {
  it('generates a valid SVG string for a given arena URL', () => {
    const url = 'https://gamehub.vn/arena/847291'
    const svg = generateArenaQrSvg(url)

    expect(typeof svg).toBe('string')
    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
    expect(svg).toContain('viewBox')
  })

  it('respects size and padding options', () => {
    const url = 'https://gamehub.vn/arena/123456'
    const svg = generateArenaQrSvg(url, { size: 300, margin: 4 })

    expect(svg).toContain('<svg')
    expect(svg).toContain('300')
  })

  it('handles custom foreground and background colors', () => {
    const url = 'https://gamehub.vn/arena/999888'
    const svg = generateArenaQrSvg(url, {
      color: '#4f46e5',
      background: '#ffffff',
    })

    expect(svg).toContain('#4f46e5')
  })

  it('throws or handles empty text gracefully', () => {
    expect(() => generateArenaQrSvg('')).toThrow('Content cannot be empty')
  })
})
