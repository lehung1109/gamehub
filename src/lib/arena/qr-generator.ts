// src/lib/arena/qr-generator.ts

import QRCode from 'qrcode-svg'

export interface ArenaQrOptions {
  size?: number
  margin?: number
  color?: string
  background?: string
  level?: 'L' | 'M' | 'Q' | 'H'
}

/**
 * Generates pure SVG string for a student join URL without any network requests.
 */
export function generateArenaQrSvg(content: string, options: ArenaQrOptions = {}): string {
  if (!content || !content.trim()) {
    throw new Error('Content cannot be empty')
  }

  const qr = new QRCode({
    content: content.trim(),
    padding: options.margin ?? 4,
    width: options.size ?? 256,
    height: options.size ?? 256,
    color: options.color ?? '#0f172a',
    background: options.background ?? '#ffffff',
    ecl: options.level ?? 'M',
    join: true,
    container: 'svg-viewbox',
  })

  return qr.svg()
}
