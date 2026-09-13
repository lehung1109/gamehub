// tests/components/guild/GuildHub.test.tsx

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GuildHub } from '@/components/guild/GuildHub'
import { STARTER_GUILDS } from '@/data/guilds/starter-guilds'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('GuildHub Component', () => {
  it('renders hub title, action buttons, and all starter guilds', () => {
    render(<GuildHub guilds={STARTER_GUILDS} />)

    expect(
      screen.getByRole('heading', { name: /đại sảnh bang hội học tập/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /nhập mã vào bang hội/i })).toBeInTheDocument()

    expect(screen.getByText('Hiệp Sĩ Rồng Lửa')).toBeInTheDocument()
    expect(screen.getByText('Biệt Đội Cú Thông Thái')).toBeInTheDocument()
    expect(screen.getByText('Chiến Binh Cáo Nhanh Trí')).toBeInTheDocument()
  })

  it('opens join modal on button click', () => {
    render(<GuildHub guilds={STARTER_GUILDS} />)

    const joinBtn = screen.getByRole('button', { name: /nhập mã vào bang hội/i })
    fireEvent.click(joinBtn)

    expect(screen.getByRole('dialog', { name: /gia nhập bang hội bằng mã/i })).toBeInTheDocument()
  })

  it('filters guilds based on search term', () => {
    render(<GuildHub guilds={STARTER_GUILDS} />)

    const searchInput = screen.getByPlaceholderText(/tìm tên bang hoặc mã bang/i)
    fireEvent.change(searchInput, { target: { value: 'rồng' } })

    expect(screen.getByText('Hiệp Sĩ Rồng Lửa')).toBeInTheDocument()
    expect(screen.queryByText('Biệt Đội Cú Thông Thái')).not.toBeInTheDocument()
  })

  it('satisfies strict kid-friendly typography policy (zero text-xs, text-sm)', () => {
    const { container } = render(<GuildHub guilds={STARTER_GUILDS} />)
    const html = container.innerHTML

    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })
})
