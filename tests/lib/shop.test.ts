import { describe, it, expect, beforeEach } from 'vitest'
import {
  SHOP_CATALOG,
  getShopCatalog,
  getShopItemById,
  getInitialInventory,
  purchaseShopItem,
  purchaseItem,
  equipShopItem,
  equipItem,
  unequipShopItem,
  unequipItem,
  getInventoryStorageKey,
  parseInventory,
  getStoredInventory,
  saveStoredInventory,
  recordBonusStars,
  calculateEffectiveStars,
} from '@/lib/shop'
import type { StudentInventory } from '@/types/shop'

describe('Shop Catalog and Retrieval', () => {
  it('contains exactly 10 curated shop items', () => {
    expect(SHOP_CATALOG).toHaveLength(10)
    expect(getShopCatalog()).toEqual(SHOP_CATALOG)
  })

  it('contains 5 frames, 4 titles, and 1 utility item', () => {
    const frames = SHOP_CATALOG.filter(item => item.category === 'frame')
    const titles = SHOP_CATALOG.filter(item => item.category === 'title')
    const utilities = SHOP_CATALOG.filter(item => item.category === 'utility')

    expect(frames).toHaveLength(5)
    expect(titles).toHaveLength(4)
    expect(utilities).toHaveLength(1)
  })

  it('defines valid frame items with proper cssClass styles', () => {
    const goldFrame = getShopItemById('frame_gold')
    expect(goldFrame).toBeDefined()
    expect(goldFrame?.name).toBe('Khung Vàng Hoàng Gia')
    expect(goldFrame?.cost).toBe(30)
    expect(goldFrame?.icon).toBe('👑')
    expect(goldFrame?.cssClass).toContain('ring-amber-400')

    const neonFrame = getShopItemById('frame_neon')
    expect(neonFrame?.cssClass).toContain('animate-pulse')

    const fireFrame = getShopItemById('frame_fire')
    expect(fireFrame?.cssClass).toContain('ring-rose-500')

    const rainbowFrame = getShopItemById('frame_rainbow')
    expect(rainbowFrame?.cssClass).toContain('bg-gradient-to-tr')

    const galaxyFrame = getShopItemById('frame_galaxy')
    expect(galaxyFrame?.cssClass).toContain('ring-purple-600')
  })

  it('defines valid title items with proper titleBadgeClass styles', () => {
    const speedTitle = getShopItemById('title_speed')
    expect(speedTitle).toBeDefined()
    expect(speedTitle?.name).toBe('Thần Tốc Độ')
    expect(speedTitle?.cost).toBe(20)
    expect(speedTitle?.titleBadgeClass).toContain('text-sky-700')

    const masterTitle = getShopItemById('title_master')
    expect(masterTitle?.cost).toBe(35)
    expect(masterTitle?.titleBadgeClass).toContain('text-emerald-700')

    const voiceTitle = getShopItemById('title_voice')
    expect(voiceTitle?.cost).toBe(35)
    expect(voiceTitle?.titleBadgeClass).toContain('text-violet-700')

    const legendTitle = getShopItemById('title_legend')
    expect(legendTitle?.cost).toBe(75)
    expect(legendTitle?.titleBadgeClass).toContain('text-amber-800')
  })

  it('defines the streak freeze utility item', () => {
    const freeze = getShopItemById('streak_freeze')
    expect(freeze).toBeDefined()
    expect(freeze?.category).toBe('utility')
    expect(freeze?.cost).toBe(25)
    expect(freeze?.icon).toBe('🧊')
    expect(freeze?.name).toBe('Băng Bảo Vệ Chuỗi')
  })

  it('returns undefined for non-existent item id', () => {
    expect(getShopItemById('non_existent_item')).toBeUndefined()
  })
})

describe('Initial Inventory', () => {
  it('returns an empty inventory with null equipped items', () => {
    const initial = getInitialInventory()
    expect(initial).toEqual({
      ownedItemIds: [],
      equippedFrameId: null,
      equippedTitleId: null,
      spentStars: 0,
      bonusStars: 0,
    })
  })

  it('returns a fresh object reference each call', () => {
    const inv1 = getInitialInventory()
    const inv2 = getInitialInventory()
    expect(inv1).not.toBe(inv2)
    expect(inv1.ownedItemIds).not.toBe(inv2.ownedItemIds)
  })
})

describe('Purchase Validations and Transactions', () => {
  it('successfully purchases a frame when student has sufficient stars', () => {
    const inventory = getInitialInventory()
    const result = purchaseShopItem(inventory, 100, 'frame_gold')

    expect(result.success).toBe(true)
    expect(result.remainingStars).toBe(70)
    expect(result.newInventory.ownedItemIds).toEqual(['frame_gold'])
    expect(result.purchasedItem?.id).toBe('frame_gold')
    expect(result.error).toBeUndefined()
    // Original inventory must remain immutable
    expect(inventory.ownedItemIds).toEqual([])
  })

  it('successfully purchases a title with exact star balance', () => {
    const inventory = getInitialInventory()
    const result = purchaseShopItem(inventory, 20, 'title_speed')

    expect(result.success).toBe(true)
    expect(result.remainingStars).toBe(0)
    expect(result.newInventory.ownedItemIds).toEqual(['title_speed'])
    expect(result.purchasedItem?.id).toBe('title_speed')
  })

  it('successfully purchases streak freeze utility item repeatedly', () => {
    const inventory: StudentInventory = {
      ownedItemIds: ['frame_gold'],
      equippedFrameId: 'frame_gold',
      equippedTitleId: null,
    }

    const firstPurchase = purchaseShopItem(inventory, 60, 'streak_freeze')
    expect(firstPurchase.success).toBe(true)
    expect(firstPurchase.remainingStars).toBe(35)
    expect(firstPurchase.purchasedItem?.id).toBe('streak_freeze')

    // Utility item can be bought again even if already bought before
    const secondPurchase = purchaseShopItem(firstPurchase.newInventory, 35, 'streak_freeze')
    expect(secondPurchase.success).toBe(true)
    expect(secondPurchase.remainingStars).toBe(10)
  })

  it('fails with error message when student has insufficient stars', () => {
    const inventory = getInitialInventory()
    const result = purchaseShopItem(inventory, 15, 'frame_gold') // cost: 30

    expect(result.success).toBe(false)
    expect(result.remainingStars).toBe(15)
    expect(result.newInventory).toEqual(inventory)
    expect(result.error).toBe('Không đủ sao để mua vật phẩm này')
  })

  it('fails with error message when item does not exist', () => {
    const inventory = getInitialInventory()
    const result = purchaseShopItem(inventory, 100, 'ghost_item')

    expect(result.success).toBe(false)
    expect(result.remainingStars).toBe(100)
    expect(result.newInventory).toEqual(inventory)
    expect(result.error).toBe('Vật phẩm không tồn tại')
  })

  it('fails when purchasing a frame or title that is already owned', () => {
    const inventory: StudentInventory = {
      ownedItemIds: ['frame_gold', 'title_speed'],
      equippedFrameId: 'frame_gold',
      equippedTitleId: 'title_speed',
    }

    const frameResult = purchaseShopItem(inventory, 100, 'frame_gold')
    expect(frameResult.success).toBe(false)
    expect(frameResult.remainingStars).toBe(100)
    expect(frameResult.error).toBe('Bạn đã sở hữu vật phẩm này rồi')

    const titleResult = purchaseShopItem(inventory, 100, 'title_speed')
    expect(titleResult.success).toBe(false)
    expect(titleResult.remainingStars).toBe(100)
    expect(titleResult.error).toBe('Bạn đã sở hữu vật phẩm này rồi')
  })

  it('supports purchaseItem alias passing item object or id', () => {
    const inventory = getInitialInventory()
    const item = getShopItemById('title_master')!
    const result = purchaseItem(inventory, 50, item)

    expect(result.success).toBe(true)
    expect(result.remainingStars).toBe(15)
    expect(result.newInventory.ownedItemIds).toContain('title_master')
  })
})

describe('Equip and Unequip Mechanics', () => {
  const inventory: StudentInventory = {
    ownedItemIds: ['frame_gold', 'frame_neon', 'title_speed', 'title_master'],
    equippedFrameId: 'frame_gold',
    equippedTitleId: 'title_speed',
  }

  it('equips a newly selected owned frame', () => {
    const updated = equipShopItem(inventory, 'frame_neon')
    expect(updated.equippedFrameId).toBe('frame_neon')
    // Title remains unchanged
    expect(updated.equippedTitleId).toBe('title_speed')
  })

  it('equips a newly selected owned title', () => {
    const updated = equipShopItem(inventory, 'title_master')
    expect(updated.equippedTitleId).toBe('title_master')
    // Frame remains unchanged
    expect(updated.equippedFrameId).toBe('frame_gold')
  })

  it('does not equip an item that the student does not own', () => {
    const updated = equipShopItem(inventory, 'frame_fire')
    expect(updated).toEqual(inventory)
    expect(updated.equippedFrameId).toBe('frame_gold')
  })

  it('does not equip an unrecognised item or utility item', () => {
    const invWithFreeze: StudentInventory = {
      ...inventory,
      ownedItemIds: [...inventory.ownedItemIds, 'streak_freeze'],
    }
    const updated = equipShopItem(invWithFreeze, 'streak_freeze')
    expect(updated).toEqual(invWithFreeze)

    const updatedInvalid = equipShopItem(inventory, 'non_existent')
    expect(updatedInvalid).toEqual(inventory)
  })

  it('unequips frame setting equippedFrameId to null', () => {
    const updated = unequipShopItem(inventory, 'frame')
    expect(updated.equippedFrameId).toBeNull()
    expect(updated.equippedTitleId).toBe('title_speed')
  })

  it('unequips title setting equippedTitleId to null', () => {
    const updated = unequipShopItem(inventory, 'title')
    expect(updated.equippedTitleId).toBeNull()
    expect(updated.equippedFrameId).toBe('frame_gold')
  })

  it('supports equipItem and unequipItem aliases', () => {
    const frameItem = getShopItemById('frame_neon')!
    const updated = equipItem(inventory, frameItem)
    expect(updated.equippedFrameId).toBe('frame_neon')

    const unequipped = unequipItem(updated, 'frame')
    expect(unequipped.equippedFrameId).toBeNull()
  })
})

describe('Dual-layer Storage Persistence', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear()
    }
  })

  it('formats inventory storage key correctly', () => {
    expect(getInventoryStorageKey('CLASS1', 'Bé An')).toBe(
      'gamehub_inventory_v1_CLASS1_bé an'
    )
    expect(getInventoryStorageKey(undefined, undefined)).toBe(
      'gamehub_inventory_v1_ANON_anon'
    )
    expect(getInventoryStorageKey('  class2  ', '  Nam  ')).toBe(
      'gamehub_inventory_v1_CLASS2_nam'
    )
  })

  it('parses valid raw JSON into StudentInventory', () => {
    const raw = JSON.stringify({
      ownedItemIds: ['frame_gold', 'title_speed'],
      equippedFrameId: 'frame_gold',
      equippedTitleId: 'title_speed',
    })
    const parsed = parseInventory(raw)
    expect(parsed.ownedItemIds).toEqual(['frame_gold', 'title_speed'])
    expect(parsed.equippedFrameId).toBe('frame_gold')
    expect(parsed.equippedTitleId).toBe('title_speed')
  })

  it('recovers safely from invalid or corrupted JSON', () => {
    expect(parseInventory('not-a-json')).toEqual(getInitialInventory())
    expect(parseInventory('{"ownedItemIds": "wrong"}')).toEqual(getInitialInventory())
    expect(parseInventory('')).toEqual(getInitialInventory())
  })

  it('saves and restores inventory across sessions via localStorage and memory', () => {
    const testInventory: StudentInventory = {
      ownedItemIds: ['frame_rainbow', 'title_legend'],
      equippedFrameId: 'frame_rainbow',
      equippedTitleId: 'title_legend',
      spentStars: 50,
      bonusStars: 20,
    }

    saveStoredInventory('10A1', 'Minh Triết', testInventory)
    const retrieved = getStoredInventory('10A1', 'Minh Triết')

    expect(retrieved).toEqual(testInventory)
  })

  it('returns initial inventory when no stored inventory exists', () => {
    const result = getStoredInventory('CLASS_EMPTY', 'Student 99')
    expect(result).toEqual(getInitialInventory())
  })
})

describe('Gamification Balance & Effective Stars', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('records bonus stars correctly in student inventory', () => {
    recordBonusStars('CLASS_A', 'Bé Nam', 15)
    const inv = getStoredInventory('CLASS_A', 'Bé Nam')
    expect(inv.bonusStars).toBe(15)

    recordBonusStars('CLASS_A', 'Bé Nam', 35)
    const inv2 = getStoredInventory('CLASS_A', 'Bé Nam')
    expect(inv2.bonusStars).toBe(50)
  })

  it('computes effective stars adding bonus stars and subtracting spent stars', () => {
    recordBonusStars('CLASS_A', 'Bé Nam', 30) // +30 bonus stars
    const inv = getStoredInventory('CLASS_A', 'Bé Nam')
    const item = getShopItemById('frame_gold')! // cost 30
    const purchased = purchaseShopItem(inv, 100, item.id)
    saveStoredInventory('CLASS_A', 'Bé Nam', purchased.newInventory)

    // Base stars: 50 from Supabase
    // Bonus stars: 30 from quests
    // Spent stars: 30 from shop
    // Net effective stars: 50 + 30 - 30 = 50
    const effective = calculateEffectiveStars(50, 'CLASS_A', 'Bé Nam')
    expect(effective).toBe(50)

    // With base 0:
    const anonEffective = calculateEffectiveStars(0, 'CLASS_A', 'Bé Nam')
    expect(anonEffective).toBe(0)
  })
})
