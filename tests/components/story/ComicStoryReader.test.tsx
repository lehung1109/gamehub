// tests/components/story/ComicStoryReader.test.tsx

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComicStoryReader } from '@/components/story/ComicStoryReader'
import { COMIC_STORIES } from '@/data/stories/comic-stories'

const testStory = COMIC_STORIES[0] // The Lost Kitten

describe('ComicStoryReader Component', () => {
  it('renders initial panel with character dialogue, sound effect, and obeys typography', () => {
    const { container } = render(<ComicStoryReader story={testStory} />)

    expect(screen.getByText('Miu Miu')).toBeInTheDocument()
    expect(screen.getAllByText(/I see a big cat./i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('MEOW!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nghe câu thoại mẫu/i })).toBeInTheDocument()

    // Kid-friendly typography audit: ensure zero forbidden small text classes
    const html = container.innerHTML
    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })

  it('triggers voice-acting recording and displays phoneme evaluation', () => {
    render(<ComicStoryReader story={testStory} />)

    const voiceBtn = screen.getByRole('button', { name: /bắt đầu lồng tiếng/i })
    expect(voiceBtn).toBeInTheDocument()

    // Start recording
    fireEvent.click(voiceBtn)
    expect(screen.getByRole('button', { name: /dừng & chấm điểm/i })).toBeInTheDocument()

    // Stop recording and evaluate
    fireEvent.click(screen.getByRole('button', { name: /dừng & chấm điểm/i }))

    // Evaluation visualizer should now appear
    expect(screen.getByText(/độ chuẩn xác/i)).toBeInTheDocument()
  })

  it('handles narrative branching decision and advances to chosen branch panel', () => {
    render(<ComicStoryReader story={testStory} />)

    const treeChoiceBtn = screen.getByRole('button', { name: /climb the tall green tree/i })
    expect(treeChoiceBtn).toBeInTheDocument()

    // Click branch choice
    fireEvent.click(treeChoiceBtn)

    // Panel 2B (tree branch) dialogue should now appear
    expect(screen.getAllByText(/I can see my sweet home!/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('RUSTLE!')).toBeInTheDocument()
  })

  it('reaches ending panel and opens completion modal', () => {
    const onComplete = vi.fn()
    render(<ComicStoryReader story={testStory} onCompleteStory={onComplete} />)

    // Step 1 -> Choose tree branch
    fireEvent.click(screen.getByRole('button', { name: /climb the tall green tree/i }))

    // Step 2 -> Click continue
    fireEvent.click(screen.getByRole('button', { name: /tiếp tục diễn biến tiếp theo/i }))

    // Step 3 -> Click continue to finish story
    fireEvent.click(screen.getByRole('button', { name: /tiếp tục diễn biến tiếp theo/i }))

    expect(
      screen.getByRole('heading', { name: /chú mèo lạc trong rừng thì thầm/i })
    ).toBeVisible()
    expect(screen.getByText(/hoàn thành cuộc phiêu lưu!/i)).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalled()
  })
})
