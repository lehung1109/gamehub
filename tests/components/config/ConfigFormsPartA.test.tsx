// tests/components/config/ConfigFormsPartA.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ReadingConfigForm } from '@/components/config/ReadingConfigForm'
import { TypingConfigForm } from '@/components/config/TypingConfigForm'
import { RoleplayConfigForm } from '@/components/config/RoleplayConfigForm'
import { WordleConfigForm } from '@/components/config/WordleConfigForm'
import { WordConnectConfigForm } from '@/components/config/WordConnectConfigForm'
import { OddOneOutConfigForm } from '@/components/config/OddOneOutConfigForm'

describe('ConfigFormsPartA', () => {
  describe('ReadingConfigForm', () => {
    it('renders correctly with default settings', () => {
      const onChange = vi.fn()
      render(
        <ReadingConfigForm
          settings={{ difficulty: 1, showTranslation: true }}
          onChange={onChange}
        />
      )

      expect(screen.getByText(/độ khó bài đọc/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/cấp độ 1/i)).toBeChecked()
      expect(screen.getByLabelText(/hiển thị bản dịch/i)).toBeChecked()
    })

    it('handles difficulty change', () => {
      const onChange = vi.fn()
      render(
        <ReadingConfigForm
          settings={{ difficulty: 1, showTranslation: true }}
          onChange={onChange}
        />
      )

      fireEvent.click(screen.getByLabelText(/cấp độ 2/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ difficulty: 2 })
      )
    })

    it('handles showTranslation toggle', () => {
      const onChange = vi.fn()
      render(
        <ReadingConfigForm
          settings={{ difficulty: 1, showTranslation: true }}
          onChange={onChange}
        />
      )

      fireEvent.click(screen.getByLabelText(/hiển thị bản dịch/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ showTranslation: false })
      )
    })

    it('respects disabled state', () => {
      const onChange = vi.fn()
      render(
        <ReadingConfigForm
          settings={{ difficulty: 1, showTranslation: true }}
          onChange={onChange}
          disabled={true}
        />
      )

      expect(screen.getByLabelText(/cấp độ 1/i)).toBeDisabled()
      expect(screen.getByLabelText(/hiển thị bản dịch/i)).toBeDisabled()
    })
  })

  describe('TypingConfigForm', () => {
    it('renders correctly and handles topic toggle', () => {
      const onChange = vi.fn()
      render(
        <TypingConfigForm
          settings={{
            topics: ['animals'],
            timeLimitSeconds: 60,
            showVirtualKeyboard: true,
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByText(/chủ đề luyện gõ/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/thời gian giới hạn/i)).toHaveValue(60)
      expect(screen.getByLabelText(/hiển thị bàn phím ảo/i)).toBeChecked()

      // Toggle off 'animals'
      const animalsCheckbox = screen.getByRole('checkbox', { name: /động vật/i })
      expect(animalsCheckbox).toBeChecked()
      fireEvent.click(animalsCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ topics: [] })
      )

      // Toggle on a topic that was not selected
      const fruitsCheckbox = screen.getByRole('checkbox', { name: /trái cây/i })
      expect(fruitsCheckbox).not.toBeChecked()
      fireEvent.click(fruitsCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ topics: ['animals', 'fruits'] })
      )
    })

    it('handles timeLimitSeconds change including empty and boundary values', () => {
      const onChange = vi.fn()
      render(
        <TypingConfigForm
          settings={{
            topics: [],
            timeLimitSeconds: 60,
            showVirtualKeyboard: true,
          }}
          onChange={onChange}
        />
      )

      fireEvent.change(screen.getByLabelText(/thời gian giới hạn/i), {
        target: { value: '120' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ timeLimitSeconds: 120 })
      )

      fireEvent.change(screen.getByLabelText(/thời gian giới hạn/i), {
        target: { value: '' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ timeLimitSeconds: 0 })
      )
    })

    it('handles showVirtualKeyboard toggle and disabled state', () => {
      const onChange = vi.fn()
      render(
        <TypingConfigForm
          settings={{
            topics: [],
            timeLimitSeconds: 60,
            showVirtualKeyboard: true,
          }}
          onChange={onChange}
          disabled={true}
        />
      )

      expect(screen.getByLabelText(/thời gian giới hạn/i)).toBeDisabled()
      expect(screen.getByLabelText(/hiển thị bàn phím ảo/i)).toBeDisabled()
    })
  })

  describe('RoleplayConfigForm', () => {
    it('renders correctly and handles difficulty change', () => {
      const onChange = vi.fn()
      render(
        <RoleplayConfigForm
          settings={{ difficulty: 1, autoSpeak: true, scenarioTopic: 'all' }}
          onChange={onChange}
        />
      )

      expect(screen.getByText(/độ khó hội thoại/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/cấp độ 1/i)).toBeChecked()
      expect(screen.getByLabelText(/tự động phát âm/i)).toBeChecked()

      fireEvent.click(screen.getByLabelText(/cấp độ 3/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ difficulty: 3 })
      )
    })

    it('handles autoSpeak toggle and disabled state', () => {
      const onChange = vi.fn()
      const { rerender } = render(
        <RoleplayConfigForm
          settings={{ difficulty: 1, autoSpeak: true }}
          onChange={onChange}
        />
      )

      fireEvent.click(screen.getByLabelText(/tự động phát âm/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ autoSpeak: false })
      )

      rerender(
        <RoleplayConfigForm
          settings={{ difficulty: 1, autoSpeak: true }}
          onChange={onChange}
          disabled={true}
        />
      )
      expect(screen.getByLabelText(/cấp độ 1/i)).toBeDisabled()
      expect(screen.getByLabelText(/tự động phát âm/i)).toBeDisabled()
    })
  })

  describe('WordleConfigForm', () => {
    it('renders correctly with allowed lengths and handles toggle', () => {
      const onChange = vi.fn()
      render(
        <WordleConfigForm
          settings={{
            allowedLengths: [4, 5, 6],
            categories: ['animals'],
            maxAttempts: 6,
            allowHints: true,
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByText(/độ dài từ cho phép/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/4 chữ cái/i)).toBeChecked()
      expect(screen.getByLabelText(/5 chữ cái/i)).toBeChecked()
      expect(screen.getByLabelText(/6 chữ cái/i)).toBeChecked()
      expect(screen.getByLabelText(/số lần đoán tối đa/i)).toHaveValue(6)
      expect(screen.getByLabelText(/cho phép gợi ý/i)).toBeChecked()

      // Toggle length 6 off
      fireEvent.click(screen.getByLabelText(/6 chữ cái/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ allowedLengths: [4, 5] })
      )
    })

    it('handles maxAttempts change, empty input, and allowHints toggle', () => {
      const onChange = vi.fn()
      render(
        <WordleConfigForm
          settings={{
            allowedLengths: [5],
            categories: [],
            maxAttempts: 6,
            allowHints: true,
          }}
          onChange={onChange}
        />
      )

      fireEvent.change(screen.getByLabelText(/số lần đoán tối đa/i), {
        target: { value: '8' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ maxAttempts: 8 })
      )

      fireEvent.change(screen.getByLabelText(/số lần đoán tối đa/i), {
        target: { value: '' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ maxAttempts: 4 })
      )

      fireEvent.click(screen.getByLabelText(/cho phép gợi ý/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ allowHints: false })
      )
    })

    it('respects disabled state', () => {
      const onChange = vi.fn()
      render(
        <WordleConfigForm
          settings={{
            allowedLengths: [5],
            categories: [],
            maxAttempts: 6,
            allowHints: true,
          }}
          onChange={onChange}
          disabled={true}
        />
      )

      expect(screen.getByLabelText(/5 chữ cái/i)).toBeDisabled()
      expect(screen.getByLabelText(/số lần đoán tối đa/i)).toBeDisabled()
      expect(screen.getByLabelText(/cho phép gợi ý/i)).toBeDisabled()
    })
  })

  describe('WordConnectConfigForm', () => {
    it('renders difficulty checkboxes and toggle switches', () => {
      const onChange = vi.fn()
      render(
        <WordConnectConfigForm
          settings={{
            difficultyRange: ['easy', 'medium'],
            allowHints: true,
            allowShuffle: true,
            enableBonusWords: true,
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByText(/mức độ khó xuất hiện/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/dễ/i)).toBeChecked()
      expect(screen.getByLabelText(/trung bình/i)).toBeChecked()
      expect(screen.getByLabelText(/thử thách/i)).not.toBeChecked()

      // Toggle hard on
      fireEvent.click(screen.getByLabelText(/thử thách/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          difficultyRange: ['easy', 'medium', 'hard'],
        })
      )

      // Toggle allowHints off
      fireEvent.click(screen.getByLabelText(/cho phép gợi ý/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ allowHints: false })
      )

      // Toggle allowShuffle off
      fireEvent.click(screen.getByLabelText(/cho phép xáo trộn chữ cái/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ allowShuffle: false })
      )

      // Toggle enableBonusWords off
      fireEvent.click(screen.getByLabelText(/kích hoạt từ vựng thưởng/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ enableBonusWords: false })
      )
    })

    it('handles removing a difficulty and respects disabled state', () => {
      const onChange = vi.fn()
      render(
        <WordConnectConfigForm
          settings={{
            difficultyRange: ['easy', 'medium'],
            allowHints: true,
            allowShuffle: true,
            enableBonusWords: true,
          }}
          onChange={onChange}
          disabled={true}
        />
      )

      expect(screen.getByLabelText(/dễ/i)).toBeDisabled()
      expect(screen.getByLabelText(/cho phép gợi ý/i)).toBeDisabled()
      expect(screen.getByLabelText(/cho phép xáo trộn chữ cái/i)).toBeDisabled()
      expect(screen.getByLabelText(/kích hoạt từ vựng thưởng/i)).toBeDisabled()
    })
  })

  describe('OddOneOutConfigForm', () => {
    it('renders difficulty, questionCount, and allowHints', () => {
      const onChange = vi.fn()
      render(
        <OddOneOutConfigForm
          settings={{
            difficulty: ['easy', 'medium'],
            questionCount: 10,
            allowHints: true,
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByText(/mức độ câu hỏi/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/dễ/i)).toBeChecked()
      expect(screen.getByLabelText(/trung bình/i)).toBeChecked()
      expect(screen.getByLabelText(/khó/i)).not.toBeChecked()
      expect(screen.getByLabelText(/số lượng câu hỏi/i)).toHaveValue(10)
      expect(screen.getByLabelText(/cho phép gợi ý/i)).toBeChecked()

      // Toggle 'hard' on
      fireEvent.click(screen.getByLabelText(/khó/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          difficulty: ['easy', 'medium', 'hard'],
        })
      )

      // Change question count
      fireEvent.change(screen.getByLabelText(/số lượng câu hỏi/i), {
        target: { value: '15' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ questionCount: 15 })
      )

      // Empty question count sets fallback (5)
      fireEvent.change(screen.getByLabelText(/số lượng câu hỏi/i), {
        target: { value: '' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ questionCount: 5 })
      )

      // Toggle allowHints off
      fireEvent.click(screen.getByLabelText(/cho phép gợi ý/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ allowHints: false })
      )
    })

    it('handles removing difficulty and respects disabled state', () => {
      const onChange = vi.fn()
      const { rerender } = render(
        <OddOneOutConfigForm
          settings={{
            difficulty: ['easy', 'medium'],
            questionCount: 10,
            allowHints: true,
          }}
          onChange={onChange}
        />
      )

      fireEvent.click(screen.getByLabelText(/dễ/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ difficulty: ['medium'] })
      )

      rerender(
        <OddOneOutConfigForm
          settings={{
            difficulty: ['medium'],
            questionCount: 10,
            allowHints: true,
          }}
          onChange={onChange}
          disabled={true}
        />
      )

      expect(screen.getByLabelText(/trung bình/i)).toBeDisabled()
      expect(screen.getByLabelText(/số lượng câu hỏi/i)).toBeDisabled()
      expect(screen.getByLabelText(/cho phép gợi ý/i)).toBeDisabled()
    })
  })
})
