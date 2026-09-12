'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { getStudentProgress } from '@/app/actions/student-progress'
import {
  getStudentGamificationProfile,
  syncStudentGamificationState,
  purchaseShopItemAction,
  equipShopItemAction,
  claimQuestRewardAction,
  CloudStudentProfile,
} from '@/app/actions/student-gamification'
import { getLevelInfo, LevelInfo, LevelProgress } from '@/lib/levels'
import {
  calculateEffectiveStars,
  getStoredInventory,
  saveStoredInventory,
  getInitialInventory,
  purchaseShopItem,
  equipShopItem,
  unequipShopItem,
} from '@/lib/shop'
import {
  getStoredStreak,
  saveStoredStreak,
  getInitialStreakState,
  getEffectiveStreak,
} from '@/lib/streak'
import {
  getStoredQuests,
  saveStoredQuests,
  claimQuestReward,
} from '@/lib/quests'
import {
  getStoredRoadmapProgress,
  saveStoredRoadmapProgress,
  recordLocalNodeCompletion,
} from '@/lib/roadmap-storage'
import {
  getStudentRoadmapProgressAction,
  recordRoadmapNodeCompletionAction,
  syncLocalRoadmapProgressAction,
} from '@/app/actions/roadmap'
import type { StreakState } from '@/types/streak'
import type { StudentInventory } from '@/types/shop'
import type { Quest } from '@/types/quests'
import type { RoadmapProgressState } from '@/types/roadmap'

export const STUDENT_SESSION_KEY = 'gamehub_student_session'

export interface StudentSession {
  classCode: string
  studentName: string
  className?: string
  classId?: string
}

export interface StoredStudentSession {
  classCode?: string
  studentName?: string
  className?: string
  classId?: string
  isAnonymous?: boolean
}

export interface LevelUpCelebration {
  show: boolean
  level: LevelInfo | null
}

export interface StudentSessionContextValue {
  session: StudentSession | null
  isAnonymous: boolean
  isLoaded: boolean
  isOpen: boolean
  setOpen: (open: boolean) => void
  joinClass: (sessionData: StudentSession) => void
  skip: () => void
  clearSession: () => void

  // Gamification properties
  totalStars: number
  levelInfo: LevelProgress
  isLoadingStars: boolean
  refreshProgress: () => Promise<void>
  celebration: LevelUpCelebration
  dismissCelebration: () => void

  // Cloud & Local Gamification State
  streakState: StreakState
  inventory: StudentInventory
  quests: Quest[]
  refreshGamification: () => Promise<void>
  syncGamification: (data?: {
    streakState?: StreakState
    inventory?: StudentInventory
    quests?: Quest[]
  }) => Promise<void>
  buyShopItem: (itemId: string) => Promise<{ success: boolean; error?: string }>
  toggleEquipItem: (itemId: string, category: 'frame' | 'title') => Promise<{ success: boolean; error?: string }>
  claimQuest: (questId: string) => Promise<{ success: boolean; error?: string }>

  // Roadmap Journey State & Actions
  roadmapState: RoadmapProgressState
  refreshRoadmapProgress: () => Promise<void>
  recordRoadmapCompletion: (
    nodeId: string,
    worldId: string,
    score: number,
    totalQuestions: number
  ) => Promise<{ success: boolean; stars: number }>
  recordNodeCompletion: (
    nodeId: string,
    worldId: string,
    score: number,
    totalQuestions: number
  ) => Promise<{ success: boolean; stars: number }>
}

const StudentSessionContext = createContext<StudentSessionContextValue | null>(null)

function reconcileGamification(
  classCode: string,
  studentName: string,
  cloudProfile: CloudStudentProfile
): {
  mergedInventory: StudentInventory
  mergedStreak: StreakState
  mergedQuests: Quest[]
  effectiveStars: number
  needsCloudSync: boolean
} {
  const localInv = getStoredInventory(classCode, studentName)
  const localStreak = getStoredStreak(classCode, studentName)
  const localQuests = getStoredQuests(classCode, studentName)

  const cloudInv = cloudProfile.inventory || getInitialInventory()
  const cloudStreak = cloudProfile.streakState || getInitialStreakState()
  const cloudQuests = cloudProfile.quests || []

  // 1. Inventory reconciliation
  const mergedOwned = Array.from(
    new Set([...(cloudInv.ownedItemIds || []), ...(localInv.ownedItemIds || [])])
  )
  const mergedEquippedFrame =
    cloudInv.equippedFrameId ?? localInv.equippedFrameId ?? null
  const mergedEquippedTitle =
    cloudInv.equippedTitleId ?? localInv.equippedTitleId ?? null
  const mergedSpentStars = Math.max(cloudInv.spentStars || 0, localInv.spentStars || 0)
  const mergedBonusStars = Math.max(cloudInv.bonusStars || 0, localInv.bonusStars || 0)

  const mergedInventory: StudentInventory = {
    ownedItemIds: mergedOwned,
    equippedFrameId: mergedEquippedFrame,
    equippedTitleId: mergedEquippedTitle,
    spentStars: mergedSpentStars,
    bonusStars: mergedBonusStars,
  }

  // 2. Streak reconciliation
  const currentStreak = Math.max(cloudStreak.currentStreak || 0, localStreak.currentStreak || 0)
  const longestStreak = Math.max(
    cloudStreak.longestStreak || 0,
    localStreak.longestStreak || 0,
    currentStreak
  )
  const freezeCount = Math.max(cloudStreak.freezeCount ?? 0, localStreak.freezeCount ?? 0)
  const totalActiveDays = Math.max(cloudStreak.totalActiveDays || 0, localStreak.totalActiveDays || 0)
  const lastActiveDate =
    cloudStreak.lastActiveDate &&
    (!localStreak.lastActiveDate || cloudStreak.lastActiveDate >= localStreak.lastActiveDate)
      ? cloudStreak.lastActiveDate
      : localStreak.lastActiveDate || cloudStreak.lastActiveDate || ''
  const unlockedMilestones = Array.from(
    new Set([...(cloudStreak.unlockedMilestones || []), ...(localStreak.unlockedMilestones || [])])
  ).sort((a, b) => a - b)

  const mergedStreak: StreakState = {
    currentStreak,
    longestStreak,
    lastActiveDate,
    freezeCount,
    totalActiveDays,
    unlockedMilestones,
  }

  // 3. Quests reconciliation: merge cloud quests with local progress and preserve local-only quests
  let mergedQuests: Quest[] = []
  if (cloudQuests.length === 0) {
    mergedQuests = localQuests
  } else if (localQuests.length === 0) {
    mergedQuests = cloudQuests
  } else {
    const mergedFromCloud = cloudQuests.map((cq) => {
      const lq = localQuests.find((q) => q.id === cq.id)
      if (!lq) return cq
      return {
        ...cq,
        current: Math.max(cq.current, lq.current),
        isCompleted: cq.isCompleted || lq.isCompleted,
        isClaimed: cq.isClaimed || lq.isClaimed,
      }
    })
    const localOnlyQuests = localQuests.filter(
      (lq) => !cloudQuests.some((cq) => cq.id === lq.id)
    )
    mergedQuests = [...mergedFromCloud, ...localOnlyQuests]
  }

  // Check if any local quest has higher progress, new completion/claim, or is missing from cloud
  const hasLocalQuestProgress = localQuests.some((lq) => {
    const cq = cloudQuests.find((q) => q.id === lq.id)
    if (!cq) return true
    return (
      lq.current > cq.current ||
      (lq.isCompleted && !cq.isCompleted) ||
      (lq.isClaimed && !cq.isClaimed)
    )
  })

  // Effective stars calculation based on profile totalStars and reconciled spent/bonus
  const rawTotalStars = typeof cloudProfile.totalStars === 'number' ? cloudProfile.totalStars : 0
  const effectiveStars = Math.max(0, rawTotalStars - mergedSpentStars + mergedBonusStars)

  const needsCloudSync =
    mergedInventory.ownedItemIds.length > (cloudInv.ownedItemIds?.length || 0) ||
    (mergedInventory.bonusStars || 0) > (cloudInv.bonusStars || 0) ||
    (mergedInventory.spentStars || 0) > (cloudInv.spentStars || 0) ||
    mergedStreak.currentStreak > (cloudStreak.currentStreak || 0) ||
    (mergedStreak.freezeCount ?? 0) > (cloudStreak.freezeCount ?? 0) ||
    hasLocalQuestProgress

  return {
    mergedInventory,
    mergedStreak,
    mergedQuests,
    effectiveStars,
    needsCloudSync,
  }
}

function StudentSessionProviderInternal({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StudentSession | null>(null)
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // Gamification state
  const [totalStars, setTotalStars] = useState<number>(0)
  const [isLoadingStars, setIsLoadingStars] = useState<boolean>(false)
  const [celebration, setCelebration] = useState<LevelUpCelebration>({
    show: false,
    level: null,
  })

  // Cloud & local gamification states
  const [streakState, setStreakState] = useState<StreakState>(getInitialStreakState)
  const [inventory, setInventory] = useState<StudentInventory>(getInitialInventory)
  const [quests, setQuests] = useState<Quest[]>([])

  // Roadmap journey state
  const [roadmapState, setRoadmapState] = useState<RoadmapProgressState>(getStoredRoadmapProgress)
  const roadmapFetchIdRef = useRef<number>(0)

  const prevLevelRef = useRef<number>(1)
  const hasInitializedStarsRef = useRef<boolean>(false)
  const gamificationFetchIdRef = useRef<number>(0)

  const sessionRef = useRef<StudentSession | null>(null)
  const isAnonymousRef = useRef<boolean>(false)
  const streakStateRef = useRef<StreakState>(streakState)
  const inventoryRef = useRef<StudentInventory>(inventory)
  const questsRef = useRef<Quest[]>(quests)
  const totalStarsRef = useRef<number>(totalStars)

  useEffect(() => {
    sessionRef.current = session
    isAnonymousRef.current = isAnonymous
  }, [session, isAnonymous])

  useEffect(() => {
    streakStateRef.current = streakState
  }, [streakState])

  useEffect(() => {
    inventoryRef.current = inventory
  }, [inventory])

  useEffect(() => {
    questsRef.current = quests
  }, [quests])

  useEffect(() => {
    totalStarsRef.current = totalStars
  }, [totalStars])

  // Hydrate session from sessionStorage (or localStorage) on client mount and listen to storage events
  useEffect(() => {
    const hydrateFromStorage = (raw: string | null) => {
      setRoadmapState(getStoredRoadmapProgress())
      if (raw) {
        try {
          const parsed: StoredStudentSession = JSON.parse(raw)
          if (parsed.isAnonymous) {
            setIsAnonymous(true)
            setSession(null)
            setIsOpen(false)
            const anonStars = calculateEffectiveStars(0, undefined, undefined)
            setTotalStars(anonStars)
            setIsLoadingStars(false)
            prevLevelRef.current = 1
            hasInitializedStarsRef.current = false

            setInventory(getStoredInventory(undefined, undefined))
            setStreakState(getEffectiveStreak(getStoredStreak(undefined, undefined)))
            setQuests(getStoredQuests(undefined, undefined))
          } else if (parsed.classCode && parsed.studentName) {
            setSession({
              classCode: parsed.classCode,
              studentName: parsed.studentName,
              className: parsed.className,
              classId: parsed.classId,
            })
            setIsLoadingStars(true)
            setIsAnonymous(false)
            setIsOpen(false)

            setInventory(getStoredInventory(parsed.classCode, parsed.studentName))
            setStreakState(
              getEffectiveStreak(getStoredStreak(parsed.classCode, parsed.studentName))
            )
            setQuests(getStoredQuests(parsed.classCode, parsed.studentName))
          } else {
            setSession(null)
            setIsAnonymous(false)
            setIsOpen(true)
            setTotalStars(0)
            setIsLoadingStars(false)
            prevLevelRef.current = 1
            hasInitializedStarsRef.current = false

            setInventory(getInitialInventory())
            setStreakState(getInitialStreakState())
            setQuests([])
          }
        } catch (e) {
          console.warn('Failed to parse student session from storage:', e)
          setSession(null)
          setIsAnonymous(false)
          setIsOpen(true)
          setTotalStars(0)
          setIsLoadingStars(false)
          prevLevelRef.current = 1
          hasInitializedStarsRef.current = false

          setInventory(getInitialInventory())
          setStreakState(getInitialStreakState())
          setQuests([])
        }
      } else {
        setSession(null)
        setIsAnonymous(false)
        setIsOpen(true)
        setTotalStars(0)
        setIsLoadingStars(false)
        prevLevelRef.current = 1
        hasInitializedStarsRef.current = false

        setInventory(getInitialInventory())
        setStreakState(getInitialStreakState())
        setQuests([])
      }
    }

    try {
      let initialRaw: string | null = null
      if (typeof window !== 'undefined') {
        initialRaw =
          window.sessionStorage.getItem(STUDENT_SESSION_KEY) ||
          window.localStorage.getItem(STUDENT_SESSION_KEY)
      }
      hydrateFromStorage(initialRaw)
    } finally {
      setIsLoaded(true)
    }

    // Cross-tab synchronization via storage event
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STUDENT_SESSION_KEY) {
        hydrateFromStorage(event.newValue)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorage)
      return () => {
        window.removeEventListener('storage', handleStorage)
      }
    }
  }, [])

  // Calculate current level info
  const levelInfo = useMemo(() => getLevelInfo(totalStars), [totalStars])

  // Internal unified fetcher: relies on getStudentGamificationProfile as single unified fetcher,
  // falling back to getStudentProgress only if gamification profile fetch fails.
  const fetchGamificationProfile = useCallback(
    async (classCode: string, studentName: string, fetchId?: number): Promise<boolean> => {
      let profileSucceeded = false
      try {
        const res = await getStudentGamificationProfile({ classCode, studentName })

        if (res && res.success && res.data) {
          if (fetchId !== undefined && fetchId !== gamificationFetchIdRef.current) {
            return false
          }

          if (
            !sessionRef.current ||
            sessionRef.current.classCode !== classCode ||
            sessionRef.current.studentName !== studentName
          ) {
            return false
          }

          profileSucceeded = true
          const {
            mergedInventory,
            mergedStreak,
            mergedQuests,
            effectiveStars,
            needsCloudSync,
          } = reconcileGamification(classCode, studentName, res.data)

          saveStoredInventory(classCode, studentName, mergedInventory)
          saveStoredStreak(classCode, studentName, mergedStreak)
          saveStoredQuests(classCode, studentName, mergedQuests)

          setInventory(mergedInventory)
          setStreakState(getEffectiveStreak(mergedStreak))
          setQuests(mergedQuests)

          const newLevelProgress = getLevelInfo(effectiveStars)
          if (
            hasInitializedStarsRef.current &&
            newLevelProgress.currentLevel.level > prevLevelRef.current
          ) {
            setCelebration({
              show: true,
              level: newLevelProgress.currentLevel,
            })
          }
          prevLevelRef.current = newLevelProgress.currentLevel.level
          hasInitializedStarsRef.current = true
          setTotalStars(effectiveStars)

          if (needsCloudSync) {
            syncStudentGamificationState({
              classCode,
              studentName,
              inventory: mergedInventory,
              streakState: mergedStreak,
              quests: mergedQuests,
            }).catch((err) => {
              console.warn('[StudentSessionContext] Failed to sync merged state to cloud:', err)
            })
          }
          return true
        }
      } catch (err) {
        console.warn('[StudentSessionContext] Failed to fetch cloud gamification profile:', err)
      }

      // Explicit error fallback: query getStudentProgress only if gamification profile fetch fails
      if (!profileSucceeded) {
        try {
          const fallbackRes = await getStudentProgress({ classCode, studentName })

          if (fetchId !== undefined && fetchId !== gamificationFetchIdRef.current) {
            return false
          }

          if (
            !sessionRef.current ||
            sessionRef.current.classCode !== classCode ||
            sessionRef.current.studentName !== studentName
          ) {
            return false
          }

          if (fallbackRes && fallbackRes.success && typeof fallbackRes.totalStars === 'number') {
            const fallbackStars = calculateEffectiveStars(
              fallbackRes.totalStars,
              classCode,
              studentName
            )
            const newLevelProgress = getLevelInfo(fallbackStars)

            if (
              hasInitializedStarsRef.current &&
              newLevelProgress.currentLevel.level > prevLevelRef.current
            ) {
              setCelebration({
                show: true,
                level: newLevelProgress.currentLevel,
              })
            }
            prevLevelRef.current = newLevelProgress.currentLevel.level
            hasInitializedStarsRef.current = true
            setTotalStars(fallbackStars)
            return true
          }
        } catch (fallbackErr) {
          console.warn(
            '[StudentSessionContext] Fallback to getStudentProgress failed:',
            fallbackErr
          )
        }
      }

      return false
    },
    []
  )

  // Fetch roadmap progress from cloud, syncing local progress first if present
  const fetchRoadmapProgress = useCallback(
    async (classCode: string, studentName: string): Promise<boolean> => {
      const fetchId = ++roadmapFetchIdRef.current
      try {
        const localProgress = getStoredRoadmapProgress()
        if (Object.keys(localProgress.nodesProgress).length > 0) {
          try {
            await syncLocalRoadmapProgressAction(
              classCode,
              studentName,
              localProgress.nodesProgress
            )
          } catch (syncErr) {
            console.warn('[StudentSessionContext] syncLocalRoadmapProgress failed:', syncErr)
          }
        }

        if (fetchId !== roadmapFetchIdRef.current) return false

        const res = await getStudentRoadmapProgressAction(classCode, studentName)
        if (fetchId !== roadmapFetchIdRef.current) return false

        if (res && res.success && res.data) {
          if (
            !sessionRef.current ||
            sessionRef.current.classCode !== classCode ||
            sessionRef.current.studentName !== studentName
          ) {
            return false
          }

          setRoadmapState(res.data)
          saveStoredRoadmapProgress(res.data)
          return true
        }
      } catch (err) {
        console.warn('[StudentSessionContext] Failed to fetch cloud roadmap progress:', err)
      }

      if (fetchId === roadmapFetchIdRef.current) {
        setRoadmapState(getStoredRoadmapProgress())
      }
      return false
    },
    []
  )

  // Auto-fetch progress and gamification whenever session credentials change
  useEffect(() => {
    let isCancelled = false

    const classCode = session?.classCode
    const studentName = session?.studentName

    if (!classCode || !studentName) {
      return
    }

    const currentFetchId = ++gamificationFetchIdRef.current

    fetchGamificationProfile(classCode, studentName, currentFetchId).finally(() => {
      if (!isCancelled && currentFetchId === gamificationFetchIdRef.current) {
        setIsLoadingStars(false)
      }
    })

    fetchRoadmapProgress(classCode, studentName)

    return () => {
      isCancelled = true
    }
  }, [session?.classCode, session?.studentName, fetchGamificationProfile, fetchRoadmapProgress])

  // Explicit manual progress and gamification refresh
  const refreshProgress = useCallback(async () => {
    if (!session?.classCode || !session?.studentName) {
      if (isAnonymous) {
        const anonStars = calculateEffectiveStars(0, undefined, undefined)
        setTotalStars(anonStars)
      } else {
        setTotalStars(0)
      }
      return
    }

    const currentSession = session
    const gamificationFetchId = ++gamificationFetchIdRef.current

    try {
      setIsLoadingStars(true)
      await fetchGamificationProfile(
        currentSession.classCode,
        currentSession.studentName,
        gamificationFetchId
      )
    } finally {
      if (gamificationFetchId === gamificationFetchIdRef.current) {
        setIsLoadingStars(false)
      }
    }
  }, [session, isAnonymous, fetchGamificationProfile])

  // Explicit refresh of gamification state
  const refreshGamification = useCallback(async () => {
    if (!session?.classCode || !session?.studentName) {
      if (isAnonymous) {
        setInventory(getStoredInventory(undefined, undefined))
        setStreakState(getEffectiveStreak(getStoredStreak(undefined, undefined)))
        setQuests(getStoredQuests(undefined, undefined))
      }
      return
    }

    const gamificationFetchId = ++gamificationFetchIdRef.current
    await fetchGamificationProfile(
      session.classCode,
      session.studentName,
      gamificationFetchId
    )
  }, [session, isAnonymous, fetchGamificationProfile])

  // Synchronize gamification state to local storage and cloud
  const syncGamification = useCallback(
    async (data?: {
      streakState?: StreakState
      inventory?: StudentInventory
      quests?: Quest[]
    }) => {
      const classCode = sessionRef.current?.classCode
      const studentName = sessionRef.current?.studentName
      const isAnon = isAnonymousRef.current

      if (data?.streakState) {
        saveStoredStreak(classCode, studentName, data.streakState)
        setStreakState(getEffectiveStreak(data.streakState))
      }
      if (data?.inventory) {
        saveStoredInventory(classCode, studentName, data.inventory)
        setInventory(data.inventory)
      }
      if (data?.quests) {
        saveStoredQuests(classCode, studentName, data.quests)
        setQuests(data.quests)
      }

      if (isAnon || !classCode || !studentName) {
        return
      }

      try {
        await syncStudentGamificationState({
          classCode,
          studentName,
          streakState: data?.streakState ?? streakStateRef.current,
          inventory: data?.inventory ?? inventoryRef.current,
          quests: data?.quests ?? questsRef.current,
        })
      } catch (err) {
        console.warn('[StudentSessionContext] syncGamification failed:', err)
      }
    },
    []
  )

  // Purchase shop item with optimistic update and cloud sync
  const buyShopItem = useCallback(
    async (itemId: string): Promise<{ success: boolean; error?: string }> => {
      const classCode = sessionRef.current?.classCode
      const studentName = sessionRef.current?.studentName
      const isAnon = isAnonymousRef.current
      const currentInv = inventoryRef.current
      const currentStreak = streakStateRef.current
      const currentStars = totalStarsRef.current

      const localResult = purchaseShopItem(currentInv, currentStars, itemId)
      if (!localResult.success) {
        return { success: false, error: localResult.error }
      }

      const updatedInv = localResult.newInventory
      const remainingStars = localResult.remainingStars
      let updatedStreak = currentStreak
      if (itemId === 'streak_freeze') {
        updatedStreak = {
          ...currentStreak,
          freezeCount: (currentStreak.freezeCount || 0) + 1,
        }
      }

      // Optimistic local update
      saveStoredInventory(classCode, studentName, updatedInv)
      setInventory(updatedInv)
      setTotalStars(remainingStars)
      if (itemId === 'streak_freeze') {
        saveStoredStreak(classCode, studentName, updatedStreak)
        setStreakState(updatedStreak)
      }

      if (isAnon || !classCode || !studentName) {
        return { success: true }
      }

      try {
        const serverRes = await purchaseShopItemAction({
          classCode,
          studentName,
          itemId,
        })

        if (!serverRes.success) {
          saveStoredInventory(classCode, studentName, currentInv)
          setInventory(currentInv)
          setTotalStars(currentStars)
          if (itemId === 'streak_freeze') {
            saveStoredStreak(classCode, studentName, currentStreak)
            setStreakState(currentStreak)
          }
          return { success: false, error: serverRes.error || 'Mua vật phẩm thất bại' }
        }

        if (serverRes.inventory) {
          saveStoredInventory(classCode, studentName, serverRes.inventory)
          setInventory(serverRes.inventory)
        }
        if (serverRes.streakState) {
          saveStoredStreak(classCode, studentName, serverRes.streakState)
          setStreakState(serverRes.streakState)
        }
        if (typeof serverRes.remainingStars === 'number') {
          setTotalStars(serverRes.remainingStars)
        }

        return { success: true }
      } catch (err) {
        saveStoredInventory(classCode, studentName, currentInv)
        setInventory(currentInv)
        setTotalStars(currentStars)
        if (itemId === 'streak_freeze') {
          saveStoredStreak(classCode, studentName, currentStreak)
          setStreakState(currentStreak)
        }
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Lỗi kết nối máy chủ',
        }
      }
    },
    []
  )

  // Toggle equip shop item with optimistic update and cloud sync
  const toggleEquipItem = useCallback(
    async (
      itemId: string,
      category: 'frame' | 'title'
    ): Promise<{ success: boolean; error?: string }> => {
      const classCode = sessionRef.current?.classCode
      const studentName = sessionRef.current?.studentName
      const isAnon = isAnonymousRef.current
      const currentInv = inventoryRef.current

      if (!currentInv.ownedItemIds.includes(itemId)) {
        return { success: false, error: 'Bạn chưa sở hữu vật phẩm này' }
      }

      let updatedInv: StudentInventory
      if (category === 'frame') {
        updatedInv =
          currentInv.equippedFrameId === itemId
            ? unequipShopItem(currentInv, 'frame')
            : equipShopItem(currentInv, itemId)
      } else {
        updatedInv =
          currentInv.equippedTitleId === itemId
            ? unequipShopItem(currentInv, 'title')
            : equipShopItem(currentInv, itemId)
      }

      // Optimistic update
      saveStoredInventory(classCode, studentName, updatedInv)
      setInventory(updatedInv)

      if (isAnon || !classCode || !studentName) {
        return { success: true }
      }

      try {
        const serverRes = await equipShopItemAction({
          classCode,
          studentName,
          itemId,
          category,
        })

        if (!serverRes.success) {
          saveStoredInventory(classCode, studentName, currentInv)
          setInventory(currentInv)
          return { success: false, error: serverRes.error || 'Trang bị thất bại' }
        }

        if (serverRes.inventory) {
          saveStoredInventory(classCode, studentName, serverRes.inventory)
          setInventory(serverRes.inventory)
        }

        return { success: true }
      } catch (err) {
        saveStoredInventory(classCode, studentName, currentInv)
        setInventory(currentInv)
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Lỗi kết nối máy chủ',
        }
      }
    },
    []
  )

  // Claim quest reward with optimistic update and cloud sync
  const claimQuest = useCallback(
    async (questId: string): Promise<{ success: boolean; error?: string }> => {
      const classCode = sessionRef.current?.classCode
      const studentName = sessionRef.current?.studentName
      const isAnon = isAnonymousRef.current
      const currentQuests = questsRef.current
      const currentInv = inventoryRef.current
      const currentStreak = streakStateRef.current
      const currentStars = totalStarsRef.current

      const claimResult = claimQuestReward(currentQuests, questId)
      if (!claimResult.claimedReward) {
        return { success: false, error: claimResult.error || 'Không thể nhận phần thưởng' }
      }

      const reward = claimResult.claimedReward
      const updatedQuests = claimResult.updatedQuests
      const updatedInv: StudentInventory = {
        ...currentInv,
        bonusStars: (currentInv.bonusStars || 0) + reward.stars,
      }
      const updatedStars = currentStars + reward.stars

      let updatedStreak = currentStreak
      if (reward.freeze > 0) {
        updatedStreak = {
          ...currentStreak,
          freezeCount: (currentStreak.freezeCount || 0) + reward.freeze,
        }
      }

      // Optimistic update
      saveStoredQuests(classCode, studentName, updatedQuests)
      setQuests(updatedQuests)
      saveStoredInventory(classCode, studentName, updatedInv)
      setInventory(updatedInv)
      setTotalStars(updatedStars)
      if (reward.freeze > 0) {
        saveStoredStreak(classCode, studentName, updatedStreak)
        setStreakState(updatedStreak)
      }

      if (isAnon || !classCode || !studentName) {
        return { success: true }
      }

      try {
        const serverRes = await claimQuestRewardAction({
          classCode,
          studentName,
          questId,
        })

        if (!serverRes.success) {
          saveStoredQuests(classCode, studentName, currentQuests)
          setQuests(currentQuests)
          saveStoredInventory(classCode, studentName, currentInv)
          setInventory(currentInv)
          setTotalStars(currentStars)
          if (reward.freeze > 0) {
            saveStoredStreak(classCode, studentName, currentStreak)
            setStreakState(currentStreak)
          }
          return { success: false, error: serverRes.error || 'Nhận thưởng thất bại' }
        }

        if (serverRes.quests) {
          saveStoredQuests(classCode, studentName, serverRes.quests)
          setQuests(serverRes.quests)
        }
        if (serverRes.inventory) {
          saveStoredInventory(classCode, studentName, serverRes.inventory)
          setInventory(serverRes.inventory)
        }
        if (serverRes.streakState) {
          saveStoredStreak(classCode, studentName, serverRes.streakState)
          setStreakState(serverRes.streakState)
        }

        return { success: true }
      } catch (err) {
        saveStoredQuests(classCode, studentName, currentQuests)
        setQuests(currentQuests)
        saveStoredInventory(classCode, studentName, currentInv)
        setInventory(currentInv)
        setTotalStars(currentStars)
        if (reward.freeze > 0) {
          saveStoredStreak(classCode, studentName, currentStreak)
          setStreakState(currentStreak)
        }
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Lỗi kết nối máy chủ',
        }
      }
    },
    []
  )

  // Refresh roadmap progress
  const refreshRoadmapProgress = useCallback(async () => {
    const classCode = sessionRef.current?.classCode
    const studentName = sessionRef.current?.studentName

    if (!classCode || !studentName) {
      setRoadmapState(getStoredRoadmapProgress())
      return
    }

    await fetchRoadmapProgress(classCode, studentName)
  }, [fetchRoadmapProgress])

  // Record node completion locally and sync with cloud
  const recordRoadmapCompletion = useCallback(
    async (
      nodeId: string,
      worldId: string,
      score: number,
      totalQuestions: number
    ): Promise<{ success: boolean; stars: number }> => {
      // Invalidate any older in-flight roadmap fetches
      roadmapFetchIdRef.current++

      const localResult = recordLocalNodeCompletion(nodeId, worldId, score, totalQuestions)
      setRoadmapState(localResult.state)

      const classCode = sessionRef.current?.classCode
      const studentName = sessionRef.current?.studentName

      if (!classCode || !studentName) {
        return { success: true, stars: localResult.stars }
      }

      try {
        const serverRes = await recordRoadmapNodeCompletionAction(
          classCode,
          studentName,
          { nodeId, worldId, score, totalQuestions }
        )

        if (serverRes.success) {
          if (serverRes.stars === 3) {
            refreshGamification().catch(() => {})
          }
          return { success: true, stars: serverRes.stars ?? localResult.stars }
        } else {
          console.warn('[StudentSessionContext] recordRoadmapNodeCompletionAction failed:', serverRes.error)
          return { success: false, stars: localResult.stars }
        }
      } catch (err) {
        console.warn('[StudentSessionContext] Failed to record roadmap completion on server:', err)
        return { success: true, stars: localResult.stars }
      }
    },
    [refreshGamification]
  )

  const joinClass = useCallback((sessionData: StudentSession) => {
    setSession(sessionData)
    setIsAnonymous(false)
    setIsOpen(false)
    hasInitializedStarsRef.current = false
    setIsLoadingStars(true)

    // Instant local cache hydration (0ms delay)
    const localInv = getStoredInventory(sessionData.classCode, sessionData.studentName)
    const localStreak = getEffectiveStreak(
      getStoredStreak(sessionData.classCode, sessionData.studentName)
    )
    const localQuests = getStoredQuests(sessionData.classCode, sessionData.studentName)
    setInventory(localInv)
    setStreakState(localStreak)
    setQuests(localQuests)
    setRoadmapState(getStoredRoadmapProgress())

    try {
      if (typeof window !== 'undefined') {
        const toStore: StoredStudentSession = {
          ...sessionData,
          isAnonymous: false,
        }
        window.sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(toStore))
        window.localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(toStore))
      }
    } catch (e) {
      console.error('Failed to save student session:', e)
    }

    // Trigger cloud roadmap sync and fetch
    fetchRoadmapProgress(sessionData.classCode, sessionData.studentName).catch((err) => {
      console.warn('[StudentSessionContext] Failed to sync roadmap progress on joinClass:', err)
    })
  }, [fetchRoadmapProgress])

  const skip = useCallback(() => {
    setSession(null)
    setIsAnonymous(true)
    setIsOpen(false)
    const anonStars = calculateEffectiveStars(0, undefined, undefined)
    setTotalStars(anonStars)
    prevLevelRef.current = 1
    hasInitializedStarsRef.current = false
    setCelebration({ show: false, level: null })

    const anonInv = getStoredInventory(undefined, undefined)
    const anonStreak = getEffectiveStreak(getStoredStreak(undefined, undefined))
    const anonQuests = getStoredQuests(undefined, undefined)
    setInventory(anonInv)
    setStreakState(anonStreak)
    setQuests(anonQuests)
    setRoadmapState(getStoredRoadmapProgress())

    try {
      if (typeof window !== 'undefined') {
        const toStore: StoredStudentSession = {
          isAnonymous: true,
        }
        window.sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(toStore))
        window.localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(toStore))
      }
    } catch (e) {
      console.error('Failed to save anonymous student session:', e)
    }
  }, [])

  const clearSession = useCallback(() => {
    setSession(null)
    setIsAnonymous(false)
    setIsOpen(true)
    setTotalStars(0)
    prevLevelRef.current = 1
    hasInitializedStarsRef.current = false
    setCelebration({ show: false, level: null })

    setInventory(getInitialInventory())
    setStreakState(getInitialStreakState())
    setQuests([])
    setRoadmapState(getStoredRoadmapProgress())

    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(STUDENT_SESSION_KEY)
        window.localStorage.removeItem(STUDENT_SESSION_KEY)
      }
    } catch (e) {
      console.error('Failed to remove student session:', e)
    }
  }, [])

  const dismissCelebration = useCallback(() => {
    setCelebration({ show: false, level: null })
  }, [])

  const value = useMemo(
    () => ({
      session,
      isAnonymous,
      isLoaded,
      isOpen,
      setOpen: setIsOpen,
      joinClass,
      skip,
      clearSession,
      totalStars,
      levelInfo,
      isLoadingStars,
      refreshProgress,
      celebration,
      dismissCelebration,

      streakState,
      inventory,
      quests,
      refreshGamification,
      syncGamification,
      buyShopItem,
      toggleEquipItem,
      claimQuest,

      roadmapState,
      refreshRoadmapProgress,
      recordRoadmapCompletion,
      recordNodeCompletion: recordRoadmapCompletion,
    }),
    [
      session,
      isAnonymous,
      isLoaded,
      isOpen,
      joinClass,
      skip,
      clearSession,
      totalStars,
      levelInfo,
      isLoadingStars,
      refreshProgress,
      celebration,
      dismissCelebration,
      streakState,
      inventory,
      quests,
      refreshGamification,
      syncGamification,
      buyShopItem,
      toggleEquipItem,
      claimQuest,
      roadmapState,
      refreshRoadmapProgress,
      recordRoadmapCompletion,
    ]
  )

  return (
    <StudentSessionContext.Provider value={value}>
      {children}
    </StudentSessionContext.Provider>
  )
}

export function StudentSessionProvider({ children }: { children: React.ReactNode }) {
  const parentContext = useContext(StudentSessionContext)
  if (parentContext) {
    return <>{children}</>
  }
  return <StudentSessionProviderInternal>{children}</StudentSessionProviderInternal>
}

const defaultStudentSessionContext: StudentSessionContextValue = {
  session: null,
  isAnonymous: false,
  isLoaded: true,
  isOpen: false,
  setOpen: () => {},
  joinClass: () => {},
  skip: () => {},
  clearSession: () => {},
  totalStars: 0,
  levelInfo: getLevelInfo(0),
  isLoadingStars: false,
  refreshProgress: async () => {},
  celebration: { show: false, level: null },
  dismissCelebration: () => {},

  streakState: getInitialStreakState(),
  inventory: getInitialInventory(),
  quests: [],
  refreshGamification: async () => {},
  syncGamification: async () => {},
  buyShopItem: async () => ({ success: false, error: 'Context not initialized' }),
  toggleEquipItem: async () => ({ success: false, error: 'Context not initialized' }),
  claimQuest: async () => ({ success: false, error: 'Context not initialized' }),

  roadmapState: {
    totalStars: 0,
    completedNodeIds: [],
    nodesProgress: {},
  },
  refreshRoadmapProgress: async () => {},
  recordRoadmapCompletion: async () => ({ success: false, stars: 0 }),
  recordNodeCompletion: async () => ({ success: false, stars: 0 }),
}

export function useStudentSession(): StudentSessionContextValue {
  const context = useContext(StudentSessionContext)
  if (!context) {
    return defaultStudentSessionContext
  }
  return context
}
