export type ShopCategory = 'frame' | 'title' | 'utility'

export interface ShopItem {
  id: string
  name: string
  description: string
  category: ShopCategory
  cost: number
  icon: string
  cssClass?: string // CSS classes applied to avatar container (gradients, borders, glow)
  titleBadgeClass?: string // CSS classes applied to title badge
}

export interface StudentInventory {
  ownedItemIds: string[];
  equippedFrameId?: string | null;
  equippedTitleId?: string | null;
  spentStars?: number;
  bonusStars?: number;
}

export interface PurchaseResult {
  success: boolean
  newInventory: StudentInventory
  remainingStars: number
  error?: string
  purchasedItem?: ShopItem
}
