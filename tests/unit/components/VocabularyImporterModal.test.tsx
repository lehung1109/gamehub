import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VocabularyImporterModal } from '@/components/admin/VocabularyImporterModal'
import * as wordBankActions from '@/app/actions/word-bank'
import fs from 'node:fs'
import path from 'node:path'

vi.mock('@/app/actions/word-bank', () => ({
  bulkCreateWordBankWordsAction: vi.fn(),
}))

describe('VocabularyImporterModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    existingWords: new Set(['apple']),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(wordBankActions.bulkCreateWordBankWordsAction).mockResolvedValue({
      success: true,
      count: 2,
    })
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<VocabularyImporterModal {...defaultProps} isOpen={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders modal dialog with tabs and input controls when open', () => {
    render(<VocabularyImporterModal {...defaultProps} />)
    expect(screen.getByText(/Nhập từ vựng/i)).toBeDefined()
    expect(screen.getByRole('button', { name: /Dán văn bản/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Tải tệp tin/i })).toBeDefined()
    expect(screen.getByRole('button', { name: /Phân tích dữ liệu/i })).toBeDefined()
  })

  it('parses pasted Quizlet/TSV text, displays preview table, and identifies duplicates and warnings', async () => {
    render(<VocabularyImporterModal {...defaultProps} />)

    const textarea = screen.getByPlaceholderText(/Dán danh sách từ vựng/i)
    fireEvent.change(textarea, {
      target: {
        value: `apple\tquả táo\nbanana\tquả chuối\nbanana\tchuối chín`,
      },
    })

    const parseBtn = screen.getByRole('button', { name: /Phân tích dữ liệu/i })
    fireEvent.click(parseBtn)

    await waitFor(() => {
      expect(screen.getByDisplayValue('apple')).toBeDefined()
      expect(screen.getAllByDisplayValue('banana')).toHaveLength(2)
    })

    // 'banana' duplicate in batch has status duplicate
    expect(screen.getAllByText(/Trùng lặp/i).length).toBeGreaterThan(0)
    // 'apple' already in existingWords has status warning
    expect(screen.getAllByText(/Cảnh báo/i).length).toBeGreaterThan(0)
    // first banana has status valid
    expect(screen.getAllByText(/Hợp lệ/i).length).toBeGreaterThan(0)
  })


  it('allows inline editing of rows and toggling selection', async () => {
    render(<VocabularyImporterModal {...defaultProps} />)

    const textarea = screen.getByPlaceholderText(/Dán danh sách từ vựng/i)
    fireEvent.change(textarea, {
      target: {
        value: `dog\tcon chó\nelephant\tcon voi`,
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /Phân tích dữ liệu/i }))

    await waitFor(() => {
      expect(screen.getByDisplayValue('dog')).toBeDefined()
    })

    // Edit dog translation
    const viInput = screen.getByDisplayValue('con chó')
    fireEvent.change(viInput, { target: { value: 'chú cún' } })
    expect(screen.getByDisplayValue('chú cún')).toBeDefined()

    // Uncheck elephant
    const checkboxes = screen.getAllByRole('checkbox')
    // Checkbox 0 is master checkbox, 1 is dog, 2 is elephant
    fireEvent.click(checkboxes[2])

    // Verify submit button is clickable
    const submitBtn = screen.getByRole('button', { name: /Thêm vào Ngân hàng từ vựng/i })
    expect(submitBtn).toBeDefined()
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(wordBankActions.bulkCreateWordBankWordsAction).toHaveBeenCalledTimes(1)
      const calledWords = vi.mocked(wordBankActions.bulkCreateWordBankWordsAction).mock.calls[0][0]
      // Only 1 word selected (dog with edited translation)
      expect(calledWords).toHaveLength(1)
      expect(calledWords[0].english).toBe('dog')
      expect(calledWords[0].vietnamese).toBe('chú cún')
      expect(defaultProps.onSuccess).toHaveBeenCalled()
    })
  })

  it('complies strictly with the kid-friendly >= 16px typography policy', () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/components/admin/VocabularyImporterModal.tsx'
    )
    expect(fs.existsSync(filePath)).toBe(true)
    const content = fs.readFileSync(filePath, 'utf-8')

    // Must not contain sub-16px font size utility classes
    const forbiddenClasses = [
      'text-xs',
      'text-sm',
      'text-[10px]',
      'text-[11px]',
      'text-[12px]',
      'text-[13px]',
      'text-[14px]',
      'text-[15px]',
    ]

    for (const cls of forbiddenClasses) {
      const regex = new RegExp(`\\b${cls.replace('[', '\\[').replace(']', '\\]')}\\b`, 'g')
      const matches = content.match(regex)
      expect(
        matches,
        `Found forbidden sub-16px class "${cls}" in VocabularyImporterModal.tsx`
      ).toBeNull()
    }
  })
})
