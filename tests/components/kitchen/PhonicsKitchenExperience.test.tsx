// tests/components/kitchen/PhonicsKitchenExperience.test.tsx

import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { PhonicsKitchenExperience } from '@/components/kitchen/PhonicsKitchenExperience'
import { KitchenHeaderBar } from '@/components/kitchen/KitchenHeaderBar'
import { KitchenStationSelector } from '@/components/kitchen/KitchenStationSelector'
import { CookingWorkbenchModal } from '@/components/kitchen/CookingWorkbenchModal'
import { RecipeBookModal } from '@/components/kitchen/RecipeBookModal'
import { KITCHEN_RECIPES, KITCHEN_STATIONS } from '@/data/kitchen/recipes'
import type { KitchenProgress } from '@/types/phonics-kitchen'

// Mock speech
const mockSpeak = vi.fn()
vi.mock('@/hooks/useSpeech', () => ({
  useSpeech: () => ({
    speak: mockSpeak,
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}))

// Mock sound synthesizer
const mockPlayChime = vi.fn()
const mockPlayKick = vi.fn()
const mockPlayWoodblock = vi.fn()
const mockClose = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/rhythm-beat-synthesizer', () => ({
  createRhythmSynthesizer: () => ({
    playChime: mockPlayChime,
    playKick: mockPlayKick,
    playSnare: vi.fn(),
    playWoodblock: mockPlayWoodblock,
    close: mockClose,
  }),
}))

// Mock server action
vi.mock('@/app/actions/phonics-kitchen', () => ({
  saveKitchenProgressAction: vi.fn().mockResolvedValue({
    success: true,
    data: { saved: true, totalMastered: 1, chefRank: 'apprentice-cook' },
  }),
}))

describe('Phonics Kitchen UI Components', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockSpeak.mockClear()
    mockPlayChime.mockClear()
    mockPlayKick.mockClear()
    mockPlayWoodblock.mockClear()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('KitchenHeaderBar', () => {
    it('renders chef rank, recipe counter, stars, and triggers actions', () => {
      const onOpenRecipeBook = vi.fn()
      const onResetProgress = vi.fn()

      render(
        <KitchenHeaderBar
          chefRank="apprentice-cook"
          totalMastered={2}
          totalAvailable={12}
          chefStars={6}
          onOpenRecipeBook={onOpenRecipeBook}
          onResetProgress={onResetProgress}
        />
      )

      expect(screen.getByText('Phụ Bếp Nhí 🥄')).toBeInTheDocument()
      expect(screen.getByText(/Món Đã Nấu: 2\/12/i)).toBeInTheDocument()
      expect(screen.getByText(/6 Sao/i)).toBeInTheDocument()

      const bookBtn = screen.getByRole('button', { name: /mở sổ tay công thức món ăn/i })
      fireEvent.click(bookBtn)
      expect(onOpenRecipeBook).toHaveBeenCalledTimes(1)

      const resetBtn = screen.getByRole('button', { name: /đặt lại tiến trình nấu ăn/i })
      fireEvent.click(resetBtn)
      expect(onResetProgress).toHaveBeenCalledTimes(1)
    })
  })

  describe('KitchenStationSelector', () => {
    it('renders all stations and triggers onSelectStation', () => {
      const onSelect = vi.fn()
      render(
        <KitchenStationSelector
          stations={KITCHEN_STATIONS}
          selectedStation="pizzeria"
          completedStations={['pizzeria']}
          onSelectStation={onSelect}
        />
      )

      expect(screen.getByText('Tiệm Pizza & Mì Ý')).toBeInTheDocument()
      expect(screen.getByText('Quầy Sushi & Ramen Tokyo')).toBeInTheDocument()

      const sushiTab = screen.getByRole('tab', { name: /quầy sushi & ramen tokyo/i })
      fireEvent.click(sushiTab)
      expect(onSelect).toHaveBeenCalledWith('sushi-bar')
    })
  })

  describe('CookingWorkbenchModal', () => {
    const pizza = KITCHEN_RECIPES[0]

    it('renders workbench, plays sound on correct answer, and calls onCookComplete', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()

      render(
        <CookingWorkbenchModal
          recipe={pizza}
          isAlreadyMastered={false}
          onCookComplete={onComplete}
          onClose={onClose}
          playChimeSound={mockPlayChime}
          playKickSound={mockPlayKick}
        />
      )

      expect(screen.getByText(/Nấu Món: Pizza Margherita/i)).toBeInTheDocument()
      expect(screen.getByText(pizza.challenge.promptVi)).toBeInTheDocument()

      // Click correct option "HAM"
      const correctBtn = screen.getByRole('button', { name: 'HAM' })
      fireEvent.click(correctBtn)

      expect(mockPlayChime).toHaveBeenCalled()
      expect(screen.getByText(/Xèo xèo! Món ăn đã chín vàng/i)).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      expect(onComplete).toHaveBeenCalledWith(0)
    })

    it('handles wrong option selection with kick sound', () => {
      const onComplete = vi.fn()
      const onClose = vi.fn()

      render(
        <CookingWorkbenchModal
          recipe={pizza}
          isAlreadyMastered={false}
          onCookComplete={onComplete}
          onClose={onClose}
          playChimeSound={mockPlayChime}
          playKickSound={mockPlayKick}
        />
      )

      // Click wrong option "HOM"
      const wrongBtn = screen.getByRole('button', { name: 'HOM' })
      fireEvent.click(wrongBtn)

      expect(mockPlayKick).toHaveBeenCalled()
      expect(screen.getByText(/Chưa đúng nguyên liệu rồi!/i)).toBeInTheDocument()
    })
  })

  describe('RecipeBookModal', () => {
    it('renders all recipes and shows details for mastered recipes', () => {
      const onClose = vi.fn()
      render(
        <RecipeBookModal
          masteredRecipeIds={['margherita-pizza']}
          onClose={onClose}
        />
      )

      expect(screen.getByText('Sổ Tay Công Thức MasterChef')).toBeInTheDocument()
      expect(screen.getByText(/1\/12 món/i)).toBeInTheDocument()
      expect(screen.getByText('Pizza Margherita Truyền Thống')).toBeInTheDocument()

      // Pronunciation trigger
      const pronounceBtn = screen.getByRole('button', { name: /nghe phát âm.*pizza/i })
      fireEvent.click(pronounceBtn)
      expect(mockSpeak).toHaveBeenCalled()
    })
  })

  describe('PhonicsKitchenExperience Main Container', () => {
    it('renders station recipes, opens workbench modal, and cooks recipe', () => {
      const initialProgress: KitchenProgress = {
        masteredRecipeIds: [],
        chefStars: 0,
        chefRank: 'apprentice-cook',
        completedStations: [],
      }

      render(<PhonicsKitchenExperience initialProgress={initialProgress} />)

      expect(screen.getByText('Bếp Trưởng Nhí Phonics 🧑‍🍳')).toBeInTheDocument()
      expect(screen.getByText(/Tiệm Pizza & Mì Ý \(Italian Pizzeria & Pasta\)/i)).toBeInTheDocument()

      // 3 recipes in pizzeria
      expect(screen.getByTestId('kitchen-recipe-card-margherita-pizza')).toBeInTheDocument()
      expect(screen.getByTestId('kitchen-recipe-card-creamy-pasta')).toBeInTheDocument()
      expect(screen.getByTestId('kitchen-recipe-card-garlic-bread')).toBeInTheDocument()

      // Click "Nấu Món Ngay" for Margherita Pizza
      const cookPizzaBtn = screen.getByRole('button', { name: /nấu món pizza margherita/i })
      fireEvent.click(cookPizzaBtn)

      // Workbench modal appears
      expect(screen.getByRole('dialog', { name: /bàn chế biến món pizza margherita/i })).toBeInTheDocument()

      // Click correct option "HAM"
      const correctOption = screen.getByRole('button', { name: 'HAM' })
      fireEvent.click(correctOption)

      act(() => {
        vi.advanceTimersByTime(1600)
      })

      // Progress updated: 1/12 dishes, 3 stars
      expect(screen.getByText(/Món Đã Nấu: 1\/12/i)).toBeInTheDocument()
      expect(screen.getByText(/3 Sao/i)).toBeInTheDocument()
    })
  })
})
