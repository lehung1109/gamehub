import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentShopTab } from '@/components/student/StudentShopTab'
import { saveStoredInventory, getStoredInventory } from '@/lib/shop'
import { saveStoredStreak, getStoredStreak } from '@/lib/streak'
import type { StudentInventory } from '@/types/shop'
import type { StreakState } from '@/types/streak'

describe('StudentShopTab Component', () => {
  const classCode = 'CLASS1'
  const studentName = 'Bé Minh'

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('renders star balance banner and shop catalog items', () => {
    render(
      <StudentShopTab
        classCode={classCode}
        studentName={studentName}
        totalStars={100}
      />
    )

    // Star balance banner
    expect(screen.getByText(/Số sao hiện có/i)).toBeInTheDocument()
    expect(screen.getByText(/100/)).toBeInTheDocument()

    // Shop items rendered
    expect(screen.getByText('Khung Vàng Hoàng Gia')).toBeInTheDocument()
    expect(screen.getByText('Thần Tốc Độ')).toBeInTheDocument()
    expect(screen.getByText('Băng Bảo Vệ Chuỗi')).toBeInTheDocument()

    // Costs displayed
    expect(screen.getByText('30 ⭐')).toBeInTheDocument()
    expect(screen.getByText('20 ⭐')).toBeInTheDocument()
    expect(screen.getByText('25 ⭐')).toBeInTheDocument()
  })

  it('filters items by category tabs (Tất cả, Khung avatar, Danh hiệu, Vật phẩm)', () => {
    render(
      <StudentShopTab
        classCode={classCode}
        studentName={studentName}
        totalStars={100}
      />
    )

    // Default "Tất cả" shows items from all categories
    expect(screen.getByText('Khung Vàng Hoàng Gia')).toBeInTheDocument()
    expect(screen.getByText('Thần Tốc Độ')).toBeInTheDocument()
    expect(screen.getByText('Băng Bảo Vệ Chuỗi')).toBeInTheDocument()

    // Switch to "Khung avatar"
    const frameTab = screen.getByRole('button', { name: /Khung avatar/i })
    fireEvent.click(frameTab)

    expect(screen.getByText('Khung Vàng Hoàng Gia')).toBeInTheDocument()
    expect(screen.queryByText('Thần Tốc Độ')).not.toBeInTheDocument()
    expect(screen.queryByText('Băng Bảo Vệ Chuỗi')).not.toBeInTheDocument()

    // Switch to "Danh hiệu"
    const titleTab = screen.getByRole('button', { name: /Danh hiệu/i })
    fireEvent.click(titleTab)

    expect(screen.queryByText('Khung Vàng Hoàng Gia')).not.toBeInTheDocument()
    expect(screen.getByText('Thần Tốc Độ')).toBeInTheDocument()
    expect(screen.queryByText('Băng Bảo Vệ Chuỗi')).not.toBeInTheDocument()

    // Switch to "Vật phẩm"
    const utilityTab = screen.getByRole('button', { name: /Vật phẩm/i })
    fireEvent.click(utilityTab)

    expect(screen.queryByText('Khung Vàng Hoàng Gia')).not.toBeInTheDocument()
    expect(screen.queryByText('Thần Tốc Độ')).not.toBeInTheDocument()
    expect(screen.getByText('Băng Bảo Vệ Chuỗi')).toBeInTheDocument()

    // Switch back to "Tất cả"
    const allTab = screen.getByRole('button', { name: /Tất cả/i })
    fireEvent.click(allTab)

    expect(screen.getByText('Khung Vàng Hoàng Gia')).toBeInTheDocument()
    expect(screen.getByText('Thần Tốc Độ')).toBeInTheDocument()
    expect(screen.getByText('Băng Bảo Vệ Chuỗi')).toBeInTheDocument()
  })

  it('purchasing streak freeze increments freezeCount, deducts stars, saves to storage, and calls callbacks', () => {
    // Seed streak state with 1 freeze
    const initialStreak: StreakState = {
      currentStreak: 3,
      longestStreak: 5,
      lastActiveDate: '2026-09-11',
      freezeCount: 1,
      totalActiveDays: 6,
      unlockedMilestones: [3],
    }
    saveStoredStreak(classCode, studentName, initialStreak)

    const mockOnStarsSpent = vi.fn()
    const mockOnInventoryChanged = vi.fn()

    render(
      <StudentShopTab
        classCode={classCode}
        studentName={studentName}
        totalStars={50}
        onStarsSpent={mockOnStarsSpent}
        onInventoryChanged={mockOnInventoryChanged}
      />
    )

    // Current freeze count indicator
    expect(screen.getByText(/Đang có: 1 khiên/i)).toBeInTheDocument()

    // Buy streak freeze (cost: 25)
    const buyButton = screen.getByRole('button', { name: /Mua.*25/i })
    expect(buyButton).not.toBeDisabled()

    fireEvent.click(buyButton)

    // Remaining stars: 50 - 25 = 25
    expect(mockOnStarsSpent).toHaveBeenCalledWith(25)

    // Streak freeze count incremented to 2 in storage
    const updatedStreak = getStoredStreak(classCode, studentName)
    expect(updatedStreak.freezeCount).toBe(2)

    // UI updates freeze count display
    expect(screen.getByText(/Đang có: 2 khiên/i)).toBeInTheDocument()
  })

  it('disables purchase buttons when student has insufficient stars', () => {
    render(
      <StudentShopTab
        classCode={classCode}
        studentName={studentName}
        totalStars={10} // cannot afford any item (min cost is 20)
      />
    )

    // All purchase buttons should be disabled
    const buyButtons = screen.getAllByRole('button', { name: /Mua/i })
    expect(buyButtons.length).toBeGreaterThan(0)
    buyButtons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('purchasing cosmetic item adds to inventory, deducts stars, updates UI to show owned and Trang bị button', () => {
    const mockOnStarsSpent = vi.fn()
    const mockOnInventoryChanged = vi.fn()

    render(
      <StudentShopTab
        classCode={classCode}
        studentName={studentName}
        totalStars={40} // enough for Khung Vàng Hoàng Gia (cost: 30)
        onStarsSpent={mockOnStarsSpent}
        onInventoryChanged={mockOnInventoryChanged}
      />
    )

    // Purchase frame_gold
    const buyFrameBtn = screen.getByRole('button', { name: /Mua.*30/i })
    fireEvent.click(buyFrameBtn)

    // Stars deducted (40 - 30 = 10)
    expect(mockOnStarsSpent).toHaveBeenCalledWith(10)

    // onInventoryChanged called with frame_gold in ownedItemIds
    expect(mockOnInventoryChanged).toHaveBeenCalledWith(
      expect.objectContaining({
        ownedItemIds: expect.arrayContaining(['frame_gold']),
      })
    )

    // Stored inventory updated
    const stored = getStoredInventory(classCode, studentName)
    expect(stored.ownedItemIds).toContain('frame_gold')

    // UI shows "Đã sở hữu" and "Trang bị" button
    expect(screen.getByText('Đã sở hữu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Trang bị' })).toBeInTheDocument()
  })

  it('allows equipping and unequipping owned cosmetic items', () => {
    const initialInventory: StudentInventory = {
      ownedItemIds: ['frame_gold'],
      equippedFrameId: null,
      equippedTitleId: null,
    }
    saveStoredInventory(classCode, studentName, initialInventory)

    const mockOnInventoryChanged = vi.fn()

    render(
      <StudentShopTab
        classCode={classCode}
        studentName={studentName}
        totalStars={50}
        onInventoryChanged={mockOnInventoryChanged}
      />
    )

    // Already owned item shows "Đã sở hữu" and "Trang bị"
    expect(screen.getByText('Đã sở hữu')).toBeInTheDocument()
    const equipButton = screen.getByRole('button', { name: 'Trang bị' })
    expect(equipButton).toBeInTheDocument()

    // Equip item
    fireEvent.click(equipButton)

    // Should call onInventoryChanged with equippedFrameId: 'frame_gold'
    expect(mockOnInventoryChanged).toHaveBeenCalledWith(
      expect.objectContaining({
        equippedFrameId: 'frame_gold',
      })
    )

    // Button should now show "Đang dùng" (or unequip option)
    const unequipButton = screen.getByRole('button', { name: /Đang dùng/i })
    expect(unequipButton).toBeInTheDocument()

    // Stored inventory reflects equipped state
    let stored = getStoredInventory(classCode, studentName)
    expect(stored.equippedFrameId).toBe('frame_gold')

    // Click "Đang dùng" / "Tháo" to unequip
    fireEvent.click(unequipButton)

    // onInventoryChanged called with equippedFrameId: null
    expect(mockOnInventoryChanged).toHaveBeenCalledWith(
      expect.objectContaining({
        equippedFrameId: null,
      })
    )

    stored = getStoredInventory(classCode, studentName)
    expect(stored.equippedFrameId).toBeNull()

    // Button reverts back to "Trang bị"
    expect(screen.getByRole('button', { name: 'Trang bị' })).toBeInTheDocument()
  })

  it('loads existing equipped items from storage on mount', () => {
    const initialInventory: StudentInventory = {
      ownedItemIds: ['frame_gold', 'title_speed'],
      equippedFrameId: 'frame_gold',
      equippedTitleId: 'title_speed',
    }
    saveStoredInventory(classCode, studentName, initialInventory)

    render(
      <StudentShopTab
        classCode={classCode}
        studentName={studentName}
        totalStars={50}
      />
    )

    // Both equipped items show "Đang dùng"
    const inUseButtons = screen.getAllByRole('button', { name: /Đang dùng/i })
    expect(inUseButtons.length).toBe(2)
  })
})
