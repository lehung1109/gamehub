// tests/components/guild/GuildDetailView.test.tsx

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GuildDetailView } from '@/components/guild/GuildDetailView'
import { STARTER_GUILDS } from '@/data/guilds/starter-guilds'

// Mock server actions
vi.mock('@/app/actions/guilds', () => ({
  contributeGuildExpAction: vi.fn().mockResolvedValue({
    success: true,
    data: { currentExp: 3500, bossHp: 2100, isBossDefeated: false },
  }),
  postGuildCheerAction: vi.fn().mockResolvedValue({
    success: true,
    data: undefined, // Let component use optimistic update or self-contained state
  }),
}))

describe('GuildDetailView Component', () => {
  const sampleGuild = STARTER_GUILDS[0]

  it('renders guild header, mascot, level, and code badge', () => {
    render(<GuildDetailView initialGuild={sampleGuild} />)

    expect(screen.getByRole('heading', { name: 'Hiệp Sĩ Rồng Lửa' })).toBeInTheDocument()
    expect(screen.getByText('Mã Bang: DRAGON-99')).toBeInTheDocument()
    expect(screen.getByText('Cấp 4')).toBeInTheDocument()
    expect(screen.getByText('3 bạn')).toBeInTheDocument()
  })

  it('renders boss raid and handles attack action', async () => {
    render(<GuildDetailView initialGuild={sampleGuild} />)

    expect(screen.getByText('Rồng Từ Vựng Khổng Lồ')).toBeInTheDocument()
    const attackBtn = screen.getByRole('button', { name: /tấn công boss/i })
    expect(attackBtn).toBeInTheDocument()

    fireEvent.click(attackBtn)
    expect(await screen.findByText('-50 HP!')).toBeInTheDocument()
  })

  it('renders members leaderboard with contribution ranks', () => {
    render(<GuildDetailView initialGuild={sampleGuild} />)

    expect(screen.getAllByText('Bé Minh Khang').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Bang Chủ')).toBeInTheDocument()
    expect(screen.getByText('+450 XP')).toBeInTheDocument()
  })

  it('sends quick cheer and renders on cheer wall', async () => {
    render(<GuildDetailView initialGuild={sampleGuild} />)

    const quickCheerBtn = screen.getByRole('button', {
      name: /gửi cổ vũ cố lên các bạn ơi/i,
    })
    fireEvent.click(quickCheerBtn)

    expect(await screen.findByText(/cùng săn Boss nào/i)).toBeInTheDocument()
  })

  it('satisfies strict kid-friendly typography policy (zero text-xs, text-sm)', () => {
    const { container } = render(<GuildDetailView initialGuild={sampleGuild} />)
    const html = container.innerHTML

    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })
})
