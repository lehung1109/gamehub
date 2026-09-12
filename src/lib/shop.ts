import type { ShopItem, StudentInventory, PurchaseResult } from '@/types/shop'

export const SHOP_CATALOG: ShopItem[] = [
  // Avatar Frames
  {
    id: 'frame_gold',
    name: 'Khung Vàng Hoàng Gia',
    description: 'Viền vàng hoàng gia quý phái lấp lánh',
    category: 'frame',
    cost: 30,
    icon: '👑',
    cssClass: 'ring-4 ring-amber-400 shadow-amber-300/50 shadow-lg border-2 border-yellow-200',
  },
  {
    id: 'frame_neon',
    name: 'Khung Neon Tương Lai',
    description: 'Ánh sáng neon phong cách tương lai huyền ảo',
    category: 'frame',
    cost: 40,
    icon: '⚡',
    cssClass: 'ring-4 ring-cyan-400 shadow-cyan-300/50 shadow-lg border-2 border-teal-200 animate-pulse',
  },
  {
    id: 'frame_fire',
    name: 'Khung Lửa Rực Cháy',
    description: 'Ngọn lửa nhiệt huyết rực sáng tinh thần học tập',
    category: 'frame',
    cost: 50,
    icon: '🔥',
    cssClass: 'ring-4 ring-rose-500 shadow-rose-400/50 shadow-lg border-2 border-orange-300',
  },
  {
    id: 'frame_rainbow',
    name: 'Khung Cầu Vồng Kỳ Diệu',
    description: 'Sắc màu cầu vồng lung linh rực rỡ',
    category: 'frame',
    cost: 60,
    icon: '🌈',
    cssClass:
      'ring-4 ring-pink-500 shadow-purple-400/50 shadow-lg border-2 border-indigo-200 bg-gradient-to-tr from-pink-400 via-amber-300 to-sky-400',
  },
  {
    id: 'frame_galaxy',
    name: 'Khung Vũ Trụ Huyền Ảo',
    description: 'Huyền bí dải ngân hà bao la sâu thẳm',
    category: 'frame',
    cost: 80,
    icon: '🌌',
    cssClass: 'ring-4 ring-purple-600 shadow-purple-500/60 shadow-xl border-2 border-violet-300',
  },

  // Titles
  {
    id: 'title_speed',
    name: 'Thần Tốc Độ',
    description: 'Danh hiệu dành cho người phản xạ nhanh như chớp',
    category: 'title',
    cost: 20,
    icon: '⚡',
    titleBadgeClass:
      'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700',
  },
  {
    id: 'title_master',
    name: 'Bậc Thầy Tiếng Anh',
    description: 'Danh hiệu tôn vinh sự am hiểu ngôn ngữ sâu sắc',
    category: 'title',
    cost: 35,
    icon: '🎓',
    titleBadgeClass:
      'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
  },
  {
    id: 'title_voice',
    name: 'Giọng Ca Vàng',
    description: 'Danh hiệu danh giá cho phát âm chuẩn xác',
    category: 'title',
    cost: 35,
    icon: '🎙️',
    titleBadgeClass:
      'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-300 dark:border-violet-700',
  },
  {
    id: 'title_legend',
    name: 'Huyền Thoại GameHub',
    description: 'Danh hiệu tối thượng của người dẫn đầu đỉnh cao',
    category: 'title',
    cost: 75,
    icon: '🌟',
    titleBadgeClass:
      'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-400 dark:border-amber-600',
  },

  // Utility
  {
    id: 'streak_freeze',
    name: 'Băng Bảo Vệ Chuỗi',
    description: 'Bảo vệ chuỗi học tập nếu bạn vô tình bỏ lỡ 1 ngày (+1 Khiên)',
    category: 'utility',
    cost: 25,
    icon: '🧊',
  },
]

/**
 * Returns default initial inventory for a new student.
 */
export function getInitialInventory(): StudentInventory {
  return {
    ownedItemIds: [],
    equippedFrameId: null,
    equippedTitleId: null,
  }
}

/**
 * Returns the entire shop catalog.
 */
export function getShopCatalog(): ShopItem[] {
  return SHOP_CATALOG
}

/**
 * Finds a shop item by its id.
 */
export function getShopItemById(id: string): ShopItem | undefined {
  return SHOP_CATALOG.find(item => item.id === id)
}

/**
 * Processes a purchase transaction for an item from the shop catalog.
 */
export function purchaseShopItem(
  inventory: StudentInventory,
  currentStars: number,
  itemId: string
): PurchaseResult {
  const item = getShopItemById(itemId)
  if (!item) {
    return {
      success: false,
      newInventory: inventory,
      remainingStars: currentStars,
      error: 'Vật phẩm không tồn tại',
    }
  }

  // Non-utility items (frames, titles) cannot be bought twice
  if (item.category !== 'utility' && inventory.ownedItemIds.includes(itemId)) {
    return {
      success: false,
      newInventory: inventory,
      remainingStars: currentStars,
      error: 'Bạn đã sở hữu vật phẩm này rồi',
    }
  }

  if (currentStars < item.cost) {
    return {
      success: false,
      newInventory: inventory,
      remainingStars: currentStars,
      error: 'Không đủ sao để mua vật phẩm này',
    }
  }

  const remainingStars = currentStars - item.cost
  let newInventory: StudentInventory

  if (item.category === 'frame' || item.category === 'title') {
    newInventory = {
      ...inventory,
      ownedItemIds: [...inventory.ownedItemIds, itemId],
    }
  } else {
    // Utility items (e.g. streak_freeze) do not stay in ownedItemIds
    newInventory = {
      ...inventory,
    }
  }

  return {
    success: true,
    newInventory,
    remainingStars,
    purchasedItem: item,
  }
}

/**
 * Alias for purchaseShopItem accepting either item ID or ShopItem object.
 */
export function purchaseItem(
  inventory: StudentInventory,
  currentStars: number,
  itemOrId: ShopItem | string
): PurchaseResult {
  const itemId = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
  return purchaseShopItem(inventory, currentStars, itemId)
}

/**
 * Equips an owned frame or title.
 */
export function equipShopItem(inventory: StudentInventory, itemId: string): StudentInventory {
  if (!inventory.ownedItemIds.includes(itemId)) {
    return inventory
  }

  const item = getShopItemById(itemId)
  if (!item) {
    return inventory
  }

  if (item.category === 'frame') {
    return {
      ...inventory,
      equippedFrameId: itemId,
    }
  }

  if (item.category === 'title') {
    return {
      ...inventory,
      equippedTitleId: itemId,
    }
  }

  return inventory
}

/**
 * Alias for equipShopItem accepting either item ID or ShopItem object.
 */
export function equipItem(
  inventory: StudentInventory,
  itemOrId: ShopItem | string
): StudentInventory {
  const itemId = typeof itemOrId === 'string' ? itemOrId : itemOrId.id
  return equipShopItem(inventory, itemId)
}

/**
 * Unequips currently equipped item for a specific category ('frame' or 'title').
 */
export function unequipShopItem(
  inventory: StudentInventory,
  category: 'frame' | 'title'
): StudentInventory {
  if (category === 'frame') {
    return {
      ...inventory,
      equippedFrameId: null,
    }
  }

  if (category === 'title') {
    return {
      ...inventory,
      equippedTitleId: null,
    }
  }

  return inventory
}

/**
 * Alias for unequipShopItem.
 */
export const unequipItem = unequipShopItem

/**
 * Formats storage key for student inventory.
 */
export function getInventoryStorageKey(classCode?: string, studentName?: string): string {
  const code = (classCode?.trim() || 'anon').toUpperCase()
  const student = (studentName?.trim() || 'anon').toLowerCase()
  return `gamehub_inventory_v1_${code}_${student}`
}

// In-memory fallback map for SSR or restricted environments
const inMemoryInventoryStorage = new Map<string, string>()

/**
 * Safely parses raw JSON into StudentInventory.
 */
export function parseInventory(raw: string): StudentInventory {
  const initial = getInitialInventory()
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        ownedItemIds: Array.isArray(parsed.ownedItemIds)
          ? parsed.ownedItemIds.filter((id: unknown): id is string => typeof id === 'string')
          : initial.ownedItemIds,
        equippedFrameId:
          typeof parsed.equippedFrameId === 'string' ? parsed.equippedFrameId : null,
        equippedTitleId:
          typeof parsed.equippedTitleId === 'string' ? parsed.equippedTitleId : null,
      }
    }
  } catch {
    // Return default initial on corrupted or malformed data
  }
  return initial
}

/**
 * Retrieves stored inventory with dual fallback (localStorage + in-memory map).
 */
export function getStoredInventory(classCode?: string, studentName?: string): StudentInventory {
  const key = getInventoryStorageKey(classCode, studentName)

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(key)
      if (raw) {
        return parseInventory(raw)
      }
      return getInitialInventory()
    }
  } catch {
    // LocalStorage restricted or failed, fallback to memory
  }

  const memRaw = inMemoryInventoryStorage.get(key)
  return memRaw ? parseInventory(memRaw) : getInitialInventory()
}

/**
 * Saves inventory to localStorage and in-memory map.
 */
export function saveStoredInventory(
  classCode: string | undefined,
  studentName: string | undefined,
  inventory: StudentInventory
): void {
  const key = getInventoryStorageKey(classCode, studentName)
  const data = JSON.stringify(inventory)

  inMemoryInventoryStorage.set(key, data)

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, data)
    }
  } catch {
    // LocalStorage write failed, in-memory store updated
  }
}
