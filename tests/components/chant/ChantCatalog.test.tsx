// tests/components/chant/ChantCatalog.test.tsx

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChantCatalog } from '@/components/chant/ChantCatalog'
import { PHONICS_CHANTS } from '@/data/chants/phonics-chants'

describe('ChantCatalog Component', () => {
  it('renders catalog header and all curated chants by default', () => {
    render(<ChantCatalog chants={PHONICS_CHANTS} />)

    expect(
      screen.getByRole('heading', { name: /phòng thu vè phonics & karaoke nhịp điệu/i })
    ).toBeInTheDocument()

    expect(screen.getByText('Chú Mèo Trên Tấm Thảm')).toBeInTheDocument()
    expect(screen.getByText("Nhảy Bật, Nổ Bốp, Đừng Dừng Lại!")).toBeInTheDocument()
    expect(screen.getByText('Năm Chú Ếch Nhỏ Trên Khúc Gỗ')).toBeInTheDocument()
  })

  it('filters chants based on difficulty selection', () => {
    render(<ChantCatalog chants={PHONICS_CHANTS} />)

    const preA1Btn = screen.getByRole('button', { name: /pre-a1/i })
    fireEvent.click(preA1Btn)

    expect(screen.getByText('Chú Mèo Trên Tấm Thảm')).toBeInTheDocument()
    expect(screen.queryByText("Nhảy Bật, Nổ Bốp, Đừng Dừng Lại!")).not.toBeInTheDocument()
    expect(screen.queryByText('Năm Chú Ếch Nhỏ Trên Khúc Gỗ')).not.toBeInTheDocument()
  })

  it('verifies strict typography policy (zero text-xs, text-sm)', () => {
    const { container } = render(<ChantCatalog chants={PHONICS_CHANTS} />)
    const html = container.innerHTML

    expect(html).not.toContain('text-xs')
    expect(html).not.toContain('text-sm')
    expect(html).not.toContain('text-[10px]')
    expect(html).not.toContain('text-[12px]')
    expect(html).not.toContain('text-[14px]')
  })
})
