// tests/components/config/ConfigFormsPartB.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GrammarDetectiveConfigForm } from '@/components/config/GrammarDetectiveConfigForm'
import { VocabDefenseConfigForm } from '@/components/config/VocabDefenseConfigForm'
import { CrosswordConfigForm } from '@/components/config/CrosswordConfigForm'
import { FallingWordsConfigForm } from '@/components/config/FallingWordsConfigForm'
import { HangmanConfigForm } from '@/components/config/HangmanConfigForm'

describe('ConfigFormsPartB', () => {
  describe('GrammarDetectiveConfigForm', () => {
    it('renders correctly with default settings and handles rank tier toggle', () => {
      const onChange = vi.fn()
      render(
        <GrammarDetectiveConfigForm
          settings={{
            rankTiers: ['intern', 'junior', 'senior', 'chief'],
            allowHints: true,
            showExplanations: true,
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByText(/cấp bậc điều tra/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/thực tập sinh/i)).toBeChecked()
      expect(screen.getByLabelText(/thám tử tập sự/i)).toBeChecked()
      expect(screen.getByLabelText(/thám tử chính thức/i)).toBeChecked()
      expect(screen.getByLabelText(/đội trưởng thám tử/i)).toBeChecked()
      expect(screen.getByLabelText(/cho phép gợi ý/i)).toBeChecked()
      expect(screen.getByLabelText(/hiển thị giải thích/i)).toBeChecked()

      // Toggle 'intern' off
      fireEvent.click(screen.getByLabelText(/thực tập sinh/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          rankTiers: ['junior', 'senior', 'chief'],
        })
      )
    })

    it('handles adding a rank tier and toggling hint and explanation options', () => {
      const onChange = vi.fn()
      render(
        <GrammarDetectiveConfigForm
          settings={{
            rankTiers: ['junior'],
            allowHints: true,
            showExplanations: true,
          }}
          onChange={onChange}
        />
      )

      // Toggle 'intern' on
      fireEvent.click(screen.getByLabelText(/thực tập sinh/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          rankTiers: ['junior', 'intern'],
        })
      )

      // Toggle hints off
      fireEvent.click(screen.getByLabelText(/cho phép gợi ý/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ allowHints: false })
      )

      // Toggle explanations off
      fireEvent.click(screen.getByLabelText(/hiển thị giải thích/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ showExplanations: false })
      )
    })

    it('respects disabled state', () => {
      const onChange = vi.fn()
      render(
        <GrammarDetectiveConfigForm
          settings={{
            rankTiers: ['intern'],
            allowHints: true,
            showExplanations: true,
          }}
          onChange={onChange}
          disabled={true}
        />
      )

      expect(screen.getByLabelText(/thực tập sinh/i)).toBeDisabled()
      expect(screen.getByLabelText(/cho phép gợi ý/i)).toBeDisabled()
      expect(screen.getByLabelText(/hiển thị giải thích/i)).toBeDisabled()
    })
  })

  describe('VocabDefenseConfigForm', () => {
    it('renders correctly and handles difficulty radio selection', () => {
      const onChange = vi.fn()
      render(
        <VocabDefenseConfigForm
          settings={{
            difficulty: 'medium',
            initialHearts: 3,
            showHints: true,
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByText(/mức độ thử thách/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^dễ/i)).not.toBeChecked()
      expect(screen.getByLabelText(/trung bình/i)).toBeChecked()
      expect(screen.getByLabelText(/khó/i)).not.toBeChecked()
      expect(screen.getByLabelText(/số tim ban đầu/i)).toHaveValue(3)
      expect(screen.getByLabelText(/hiển thị gợi ý/i)).toBeChecked()

      // Select 'easy'
      fireEvent.click(screen.getByLabelText(/^dễ/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ difficulty: 'easy' })
      )

      // Select 'hard'
      fireEvent.click(screen.getByLabelText(/khó/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ difficulty: 'hard' })
      )
    })

    it('handles initialHearts input change, empty value fallback, and hint toggle', () => {
      const onChange = vi.fn()
      render(
        <VocabDefenseConfigForm
          settings={{
            difficulty: 'medium',
            initialHearts: 3,
            showHints: true,
          }}
          onChange={onChange}
        />
      )

      fireEvent.change(screen.getByLabelText(/số tim ban đầu/i), {
        target: { value: '5' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ initialHearts: 5 })
      )

      fireEvent.change(screen.getByLabelText(/số tim ban đầu/i), {
        target: { value: '' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ initialHearts: 1 })
      )

      fireEvent.click(screen.getByLabelText(/hiển thị gợi ý/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ showHints: false })
      )
    })

    it('respects disabled state', () => {
      const onChange = vi.fn()
      render(
        <VocabDefenseConfigForm
          settings={{
            difficulty: 'medium',
            initialHearts: 3,
            showHints: true,
          }}
          onChange={onChange}
          disabled={true}
        />
      )

      expect(screen.getByLabelText(/trung bình/i)).toBeDisabled()
      expect(screen.getByLabelText(/số tim ban đầu/i)).toBeDisabled()
      expect(screen.getByLabelText(/hiển thị gợi ý/i)).toBeDisabled()
    })
  })

  describe('CrosswordConfigForm', () => {
    it('renders correctly and handles topic selection and toggle', () => {
      const onChange = vi.fn()
      render(
        <CrosswordConfigForm
          settings={{
            topics: ['animals'],
            gridSize: 'medium',
            allowHints: true,
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByText(/chủ đề ô chữ/i)).toBeInTheDocument()
      expect(screen.getByText(/kích thước bảng ô chữ/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/vừa \(medium\)/i)).toBeChecked()
      expect(screen.getByLabelText(/cho phép gợi ý chữ cái/i)).toBeChecked()

      // Toggle 'animals' off
      const animalsCheckbox = screen.getByRole('checkbox', { name: /động vật/i })
      expect(animalsCheckbox).toBeChecked()
      fireEvent.click(animalsCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ topics: [] })
      )

      // Toggle 'fruits' on
      const fruitsCheckbox = screen.getByRole('checkbox', { name: /trái cây/i })
      expect(fruitsCheckbox).not.toBeChecked()
      fireEvent.click(fruitsCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ topics: ['animals', 'fruits'] })
      )
    })

    it('handles gridSize change and allowHints toggle', () => {
      const onChange = vi.fn()
      render(
        <CrosswordConfigForm
          settings={{
            topics: [],
            gridSize: 'medium',
            allowHints: true,
          }}
          onChange={onChange}
        />
      )

      // Select 'small'
      fireEvent.click(screen.getByLabelText(/nhỏ \(small\)/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ gridSize: 'small' })
      )

      // Select 'large'
      fireEvent.click(screen.getByLabelText(/lớn \(large\)/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ gridSize: 'large' })
      )

      // Toggle hints off
      fireEvent.click(screen.getByLabelText(/cho phép gợi ý chữ cái/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ allowHints: false })
      )
    })

    it('respects disabled state', () => {
      const onChange = vi.fn()
      render(
        <CrosswordConfigForm
          settings={{
            topics: ['animals'],
            gridSize: 'medium',
            allowHints: true,
          }}
          onChange={onChange}
          disabled={true}
        />
      )

      expect(screen.getByRole('checkbox', { name: /động vật/i })).toBeDisabled()
      expect(screen.getByLabelText(/vừa \(medium\)/i)).toBeDisabled()
      expect(screen.getByLabelText(/cho phép gợi ý chữ cái/i)).toBeDisabled()
    })
  })

  describe('FallingWordsConfigForm', () => {
    it('renders correctly and handles speed radio selection', () => {
      const onChange = vi.fn()
      render(
        <FallingWordsConfigForm
          settings={{
            speed: 'medium',
            wordTopics: ['animals'],
            lives: 3,
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByText(/tốc độ rơi của từ/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/chậm \(slow\)/i)).not.toBeChecked()
      expect(screen.getByLabelText(/vừa \(medium\)/i)).toBeChecked()
      expect(screen.getByLabelText(/nhanh \(fast\)/i)).not.toBeChecked()
      expect(screen.getByLabelText(/số mạng sống/i)).toHaveValue(3)

      // Select 'fast'
      fireEvent.click(screen.getByLabelText(/nhanh \(fast\)/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ speed: 'fast' })
      )
    })

    it('handles wordTopics toggle and lives input change', () => {
      const onChange = vi.fn()
      render(
        <FallingWordsConfigForm
          settings={{
            speed: 'medium',
            wordTopics: ['animals'],
            lives: 3,
          }}
          onChange={onChange}
        />
      )

      // Toggle off 'animals'
      const animalsCheckbox = screen.getByRole('checkbox', { name: /động vật/i })
      expect(animalsCheckbox).toBeChecked()
      fireEvent.click(animalsCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ wordTopics: [] })
      )

      // Toggle on 'fruits'
      const fruitsCheckbox = screen.getByRole('checkbox', { name: /trái cây/i })
      expect(fruitsCheckbox).not.toBeChecked()
      fireEvent.click(fruitsCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ wordTopics: ['animals', 'fruits'] })
      )

      // Change lives
      fireEvent.change(screen.getByLabelText(/số mạng sống/i), {
        target: { value: '5' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ lives: 5 })
      )

      // Empty lives fallback
      fireEvent.change(screen.getByLabelText(/số mạng sống/i), {
        target: { value: '' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ lives: 1 })
      )
    })

    it('respects disabled state', () => {
      const onChange = vi.fn()
      render(
        <FallingWordsConfigForm
          settings={{
            speed: 'medium',
            wordTopics: ['animals'],
            lives: 3,
          }}
          onChange={onChange}
          disabled={true}
        />
      )

      expect(screen.getByLabelText(/vừa \(medium\)/i)).toBeDisabled()
      expect(screen.getByRole('checkbox', { name: /động vật/i })).toBeDisabled()
      expect(screen.getByLabelText(/số mạng sống/i)).toBeDisabled()
    })
  })

  describe('HangmanConfigForm', () => {
    it('renders correctly and handles topic selection and toggle', () => {
      const onChange = vi.fn()
      render(
        <HangmanConfigForm
          settings={{
            topics: ['animals'],
            maxBalloons: 6,
            allowHints: true,
          }}
          onChange={onChange}
        />
      )

      expect(screen.getByText(/chủ đề từ vựng/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/số bóng bay tối đa/i)).toHaveValue(6)
      expect(screen.getByLabelText(/cho phép gợi ý/i)).toBeChecked()

      // Toggle off 'animals'
      const animalsCheckbox = screen.getByRole('checkbox', { name: /động vật/i })
      expect(animalsCheckbox).toBeChecked()
      fireEvent.click(animalsCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ topics: [] })
      )

      // Toggle on 'fruits'
      const fruitsCheckbox = screen.getByRole('checkbox', { name: /trái cây/i })
      expect(fruitsCheckbox).not.toBeChecked()
      fireEvent.click(fruitsCheckbox)
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ topics: ['animals', 'fruits'] })
      )
    })

    it('handles maxBalloons input change, empty value fallback, and hint toggle', () => {
      const onChange = vi.fn()
      render(
        <HangmanConfigForm
          settings={{
            topics: [],
            maxBalloons: 6,
            allowHints: true,
          }}
          onChange={onChange}
        />
      )

      // Change maxBalloons
      fireEvent.change(screen.getByLabelText(/số bóng bay tối đa/i), {
        target: { value: '8' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ maxBalloons: 8 })
      )

      // Empty input fallback to 3
      fireEvent.change(screen.getByLabelText(/số bóng bay tối đa/i), {
        target: { value: '' },
      })
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ maxBalloons: 3 })
      )

      // Toggle hint off
      fireEvent.click(screen.getByLabelText(/cho phép gợi ý/i))
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ allowHints: false })
      )
    })

    it('respects disabled state', () => {
      const onChange = vi.fn()
      render(
        <HangmanConfigForm
          settings={{
            topics: ['animals'],
            maxBalloons: 6,
            allowHints: true,
          }}
          onChange={onChange}
          disabled={true}
        />
      )

      expect(screen.getByRole('checkbox', { name: /động vật/i })).toBeDisabled()
      expect(screen.getByLabelText(/số bóng bay tối đa/i)).toBeDisabled()
      expect(screen.getByLabelText(/cho phép gợi ý/i)).toBeDisabled()
    })
  })
})
