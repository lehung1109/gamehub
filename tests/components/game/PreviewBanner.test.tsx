// tests/components/game/PreviewBanner.test.tsx
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PreviewBanner } from '@/components/game/PreviewBanner'

describe('PreviewBanner Component', () => {
  it('renders with role="status" and correct accessibility label', () => {
    render(<PreviewBanner />)

    const banner = screen.getByRole('status')
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveAttribute('aria-label', expect.stringMatching(/chế độ xem trước/i))
  })

  it('displays the preview warning text indicating temporary/unsaved status', () => {
    render(<PreviewBanner />)

    expect(screen.getByText(/chế độ xem trước/i)).toBeInTheDocument()
    expect(screen.getByText(/cấu hình chưa được lưu/i)).toBeInTheDocument()
  })

  it('applies amber styling distinct from normal indigo config banner', () => {
    const { container } = render(<PreviewBanner />)
    const element = container.firstChild as HTMLElement

    expect(element.className).toMatch(/amber/)
  })

  it('supports custom className prop', () => {
    const { container } = render(<PreviewBanner className="custom-banner-class" />)
    const element = container.firstChild as HTMLElement

    expect(element).toHaveClass('custom-banner-class')
  })
})
