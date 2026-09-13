// tests/components/story/StoryHub.test.tsx

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StoryHub } from '@/components/story/StoryHub'
import { COMIC_STORIES } from '@/data/stories/comic-stories'

describe('StoryHub Component', () => {
  it('renders story catalog with cards and satisfies strict typography', () => {
    const { container } = render(<StoryHub stories={COMIC_STORIES} />)

    expect(
      screen.getByRole('heading', { name: /thế giới truyện tranh tương tác/i })
    ).toBeVisible()
    expect(screen.getByText('Chú Mèo Lạc Trong Rừng Thì Thầm')).toBeInTheDocument()
    expect(screen.getByText('Tiệm Bánh Không Gian Của Robot Sparky')).toBeInTheDocument()
    expect(screen.getByText('Bí Ẩn Chiếc Đồng Hồ Kỳ Diệu')).toBeInTheDocument()

    // Typography audit: verify no small font classes
    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })

  it('filters stories by CEFR level tabs', () => {
    render(<StoryHub stories={COMIC_STORIES} />)

    // Filter to Pre-A1 only
    const preA1Tab = screen.getByRole('button', { name: /cấp độ pre-a1/i })
    fireEvent.click(preA1Tab)

    expect(screen.getByText('Chú Mèo Lạc Trong Rừng Thì Thầm')).toBeInTheDocument()
    expect(
      screen.queryByText('Tiệm Bánh Không Gian Của Robot Sparky')
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Bí Ẩn Chiếc Đồng Hồ Kỳ Diệu')
    ).not.toBeInTheDocument()

    // Filter to A2 only
    const a2Tab = screen.getByRole('button', { name: /cấp độ a2/i })
    fireEvent.click(a2Tab)

    expect(
      screen.queryByText('Chú Mèo Lạc Trong Rừng Thì Thầm')
    ).not.toBeInTheDocument()
    expect(screen.getByText('Bí Ẩn Chiếc Đồng Hồ Kỳ Diệu')).toBeInTheDocument()
  })
})
