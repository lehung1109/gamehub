'use client'

import React, { useState, useMemo } from 'react'
import {
  SHOP_CATALOG,
  getStoredInventory,
  saveStoredInventory,
  purchaseShopItem,
  equipShopItem,
  unequipShopItem,
} from '@/lib/shop'
import { getStoredStreak, saveStoredStreak } from '@/lib/streak'
import type { ShopCategory, StudentInventory } from '@/types/shop'
import { Button } from '@/components/ui/button'
import { Star, Sparkles, CheckCircle2, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StudentShopTabProps {
  classCode?: string
  studentName?: string
  totalStars: number
  onStarsSpent?: (newTotalStars: number) => void
  onInventoryChanged?: (newInventory: StudentInventory) => void
}

type FilterCategory = 'all' | ShopCategory

export function StudentShopTab({
  classCode,
  studentName,
  totalStars,
  onStarsSpent,
  onInventoryChanged,
}: StudentShopTabProps) {
  const credKey = `${classCode || ''}_${studentName || ''}`
  const [prevCredKey, setPrevCredKey] = useState(credKey)
  const [inventory, setInventory] = useState<StudentInventory>(() =>
    getStoredInventory(classCode, studentName)
  )
  const [freezeCount, setFreezeCount] = useState<number>(() =>
    getStoredStreak(classCode, studentName).freezeCount
  )
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all')
  const [feedback, setFeedback] = useState<string | null>(null)

  if (credKey !== prevCredKey) {
    setPrevCredKey(credKey)
    setInventory(getStoredInventory(classCode, studentName))
    setFreezeCount(getStoredStreak(classCode, studentName).freezeCount)
  }

  // Filter items
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return SHOP_CATALOG
    return SHOP_CATALOG.filter((item) => item.category === activeCategory)
  }, [activeCategory])

  // Handle purchasing utility item (streak freeze)
  const handlePurchaseUtility = (itemId: string) => {
    const result = purchaseShopItem(inventory, totalStars, itemId)
    if (result.success) {
      const streak = getStoredStreak(classCode, studentName)
      const updatedStreak = {
        ...streak,
        freezeCount: streak.freezeCount + 1,
      }
      saveStoredStreak(classCode, studentName, updatedStreak)
      setFreezeCount(updatedStreak.freezeCount)

      saveStoredInventory(classCode, studentName, result.newInventory)
      setInventory(result.newInventory)

      onStarsSpent?.(result.remainingStars)
      onInventoryChanged?.(result.newInventory)

      setFeedback('Mua thành công Băng Bảo Vệ Chuỗi!')
    } else if (result.error) {
      setFeedback(result.error)
    }
  }

  // Handle purchasing cosmetic item (frame or title)
  const handlePurchaseCosmetic = (itemId: string) => {
    const result = purchaseShopItem(inventory, totalStars, itemId)
    if (result.success) {
      saveStoredInventory(classCode, studentName, result.newInventory)
      setInventory(result.newInventory)

      onStarsSpent?.(result.remainingStars)
      onInventoryChanged?.(result.newInventory)

      const item = SHOP_CATALOG.find((i) => i.id === itemId)
      setFeedback(`Mua thành công ${item?.name || 'vật phẩm'}!`)
    } else if (result.error) {
      setFeedback(result.error)
    }
  }

  // Handle equipping an owned item
  const handleEquip = (itemId: string) => {
    const updated = equipShopItem(inventory, itemId)
    saveStoredInventory(classCode, studentName, updated)
    setInventory(updated)
    onInventoryChanged?.(updated)

    const item = SHOP_CATALOG.find((i) => i.id === itemId)
    setFeedback(`Đã trang bị ${item?.name || 'vật phẩm'}!`)
  }

  // Handle unequipping an item
  const handleUnequip = (category: 'frame' | 'title') => {
    const updated = unequipShopItem(inventory, category)
    saveStoredInventory(classCode, studentName, updated)
    setInventory(updated)
    onInventoryChanged?.(updated)

    setFeedback(
      category === 'frame' ? 'Đã tháo khung avatar!' : 'Đã tháo danh hiệu!'
    )
  }

  return (
    <div className="space-y-5">
      {/* Feedback Banner */}
      {feedback && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200 text-base font-bold flex items-center justify-between gap-2 shadow-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Star Balance Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100/90 dark:from-amber-950/60 dark:via-slate-900 dark:to-yellow-950/40 border-2 border-amber-300 dark:border-amber-700/60 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-xl bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-xl shadow-xs border border-amber-300 dark:border-amber-600 shrink-0">
            <Sparkles className="size-5 text-amber-600 dark:text-amber-400 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              Ví sao thưởng
            </div>
            <span className="text-base sm:text-lg font-black text-foreground">
              Số sao hiện có:
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-200/90 dark:bg-amber-900/70 border border-amber-300 dark:border-amber-700/60">
          <Star className="size-5 fill-amber-500 text-amber-500" />
          <span className="text-lg sm:text-xl font-black text-amber-950 dark:text-amber-100">
            {totalStars} ⭐
          </span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div
        role="tablist"
        aria-label="Shop categories"
        className="flex gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border overflow-x-auto"
      >
        <button
          role="button"
          aria-pressed={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
          className={cn(
            'flex-1 min-w-[70px] py-2 px-3 rounded-xl text-base font-bold transition-all select-none text-center cursor-pointer',
            activeCategory === 'all'
              ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-amber-200 dark:border-amber-800/40'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          Tất cả
        </button>

        <button
          role="button"
          aria-pressed={activeCategory === 'frame'}
          onClick={() => setActiveCategory('frame')}
          className={cn(
            'flex-1 min-w-[100px] py-2 px-3 rounded-xl text-base font-bold transition-all select-none text-center cursor-pointer',
            activeCategory === 'frame'
              ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-amber-200 dark:border-amber-800/40'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          Khung avatar
        </button>

        <button
          role="button"
          aria-pressed={activeCategory === 'title'}
          onClick={() => setActiveCategory('title')}
          className={cn(
            'flex-1 min-w-[90px] py-2 px-3 rounded-xl text-base font-bold transition-all select-none text-center cursor-pointer',
            activeCategory === 'title'
              ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-amber-200 dark:border-amber-800/40'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          Danh hiệu
        </button>

        <button
          role="button"
          aria-pressed={activeCategory === 'utility'}
          onClick={() => setActiveCategory('utility')}
          className={cn(
            'flex-1 min-w-[80px] py-2 px-3 rounded-xl text-base font-bold transition-all select-none text-center cursor-pointer',
            activeCategory === 'utility'
              ? 'bg-card text-amber-600 dark:text-amber-400 shadow-xs border border-amber-200 dark:border-amber-800/40'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
          )}
        >
          Vật phẩm
        </button>
      </div>

      {/* Shop Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredItems.map((item) => {
          const isUtility = item.category === 'utility'
          const isOwned = inventory.ownedItemIds.includes(item.id)
          const isEquipped =
            item.category === 'frame'
              ? inventory.equippedFrameId === item.id
              : item.category === 'title'
              ? inventory.equippedTitleId === item.id
              : false
          const canAfford = totalStars >= item.cost

          return (
            <div
              key={item.id}
              className={cn(
                'p-4 rounded-2xl border-2 flex flex-col justify-between gap-3.5 transition-all shadow-xs',
                isEquipped
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
                  : isOwned
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-card border-border hover:border-amber-300 dark:hover:border-amber-700/60'
              )}
            >
              {/* Item Header and Preview */}
              <div className="flex items-start gap-3">
                {/* Visual Icon / Preview Container */}
                <div
                  className={cn(
                    'size-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 bg-muted/40 border border-border transition-all',
                    item.category === 'frame' && item.cssClass
                  )}
                >
                  <span>{item.icon}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.category === 'title' && item.titleBadgeClass ? (
                      <h4
                        className={cn(
                          'font-bold text-base px-2.5 py-0.5 rounded-xl border',
                          item.titleBadgeClass
                        )}
                      >
                        {item.name}
                      </h4>
                    ) : (
                      <h4 className="font-bold text-base text-foreground truncate">
                        {item.name}
                      </h4>
                    )}
                    {isOwned && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        Đã sở hữu
                      </span>
                    )}
                  </div>

                  <p className="text-base text-muted-foreground mt-0.5 leading-snug">
                    {item.description}
                  </p>

                  {/* Utility Extra State Info */}
                  {isUtility && item.id === 'streak_freeze' && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
                      <Shield className="size-4" />
                      <span>Đang có: {freezeCount} khiên</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Item Footer / Action Area */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60 gap-2">
                <div className="flex items-center gap-1 font-black text-base text-amber-600 dark:text-amber-400">
                  <Star className="size-4 fill-amber-500 text-amber-500 shrink-0" />
                  <span>{item.cost} ⭐</span>
                </div>

                <div>
                  {isUtility ? (
                    <Button
                      disabled={!canAfford}
                      onClick={() => handlePurchaseUtility(item.id)}
                      className={cn(
                        'rounded-xl text-base font-bold transition-all cursor-pointer',
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-sm'
                          : 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      Mua với {item.cost} ⭐
                    </Button>
                  ) : isOwned ? (
                    isEquipped ? (
                      <Button
                        variant="outline"
                        aria-label="Đang dùng (Tháo)"
                        onClick={() =>
                          handleUnequip(item.category as 'frame' | 'title')
                        }
                        className="rounded-xl text-base font-bold border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 cursor-pointer shadow-xs"
                      >
                        <span>Đang dùng</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          (Tháo)
                        </span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleEquip(item.id)}
                        className="rounded-xl text-base font-bold text-foreground hover:bg-muted cursor-pointer"
                      >
                        Trang bị
                      </Button>
                    )
                  ) : (
                    <Button
                      disabled={!canAfford}
                      onClick={() => handlePurchaseCosmetic(item.id)}
                      className={cn(
                        'rounded-xl text-base font-bold transition-all cursor-pointer',
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-sm'
                          : 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      Mua {item.cost} ⭐
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
