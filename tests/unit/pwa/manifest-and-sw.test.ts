import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import manifest from '@/app/manifest'

describe('PWA Manifest & Service Worker Cache Engine', () => {
  describe('manifest.ts', () => {
    it('returns valid W3C PWA manifest metadata', () => {
      const data = manifest()

      expect(data.name).toContain('GameHub')
      expect(data.short_name).toBe('GameHub')
      expect(data.start_url).toBe('/')
      expect(data.display).toBe('standalone')
      expect(data.theme_color).toBe('#4f46e5')
      expect(data.background_color).toBe('#ffffff')

      expect(Array.isArray(data.icons)).toBe(true)
      expect(data.icons?.length).toBeGreaterThanOrEqual(2)

      const has192 = data.icons?.some(
        (icon) => icon.sizes === '192x192' && icon.src.includes('192')
      )
      const has512 = data.icons?.some(
        (icon) => icon.sizes === '512x512' && icon.src.includes('512')
      )
      expect(has192).toBe(true)
      expect(has512).toBe(true)
    })
  })

  describe('public/sw.js', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js')

    it('exists and includes cache name versioning and core assets', () => {
      expect(fs.existsSync(swPath)).toBe(true)
      const content = fs.readFileSync(swPath, 'utf-8')

      expect(content).toMatch(/const\s+CACHE_NAME\s*=\s*['"`]gamehub-cache-v/i)
      expect(content).toContain("'/offline'")
      expect(content).toContain("'/manifest.webmanifest'")
    })

    it('contains lifecycle handlers: install with skipWaiting, activate with clients.claim', () => {
      const content = fs.readFileSync(swPath, 'utf-8')

      expect(content).toContain("addEventListener('install'")
      expect(content).toContain('skipWaiting')

      expect(content).toContain("addEventListener('activate'")
      expect(content).toContain('clients.claim')
      expect(content).toContain('caches.delete')
    })

    it('contains fetch caching strategies for navigation, static assets, and non-GET bypass', () => {
      const content = fs.readFileSync(swPath, 'utf-8')

      expect(content).toContain("addEventListener('fetch'")
      // Non-GET bypass
      expect(content).toMatch(/request\.method\s*!==\s*['"`]GET['"`]/)
      // Navigation handler with fallback
      expect(content).toMatch(/request\.mode\s*===\s*['"`]navigate['"`]/)
      // Audio or media cache check
      expect(content).toMatch(/(audio|mp3|wav|png|svg|webp)/i)
    })
  })

  describe('src/app/offline/page.tsx', () => {
    it('exists and complies with strict kid-friendly typography (>= 16px)', () => {
      const offlinePagePath = path.resolve(process.cwd(), 'src/app/offline/page.tsx')
      expect(fs.existsSync(offlinePagePath)).toBe(true)

      const content = fs.readFileSync(offlinePagePath, 'utf-8')
      // Ensure strictly NO text-xs, text-sm, or small bracket sizes
      const prohibitedClasses = [
        'text-xs',
        'text-sm',
        'text-[10px]',
        'text-[11px]',
        'text-[12px]',
        'text-[13px]',
        'text-[14px]',
      ]
      for (const prohibited of prohibitedClasses) {
        expect(content).not.toContain(prohibited)
      }

      // Ensure kid-friendly reassuring messaging
      expect(content).toContain('Offline')
      expect(content).toContain('saved safely')
    })
  })
})

