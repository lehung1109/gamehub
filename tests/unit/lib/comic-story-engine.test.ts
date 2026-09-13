// tests/unit/lib/comic-story-engine.test.ts

import { describe, it, expect } from 'vitest'
import {
  getAllStories,
  getStoryById,
  getNextPanel,
  calculateStoryExp,
} from '@/lib/comic-story-engine'

describe('Comic Story Engine', () => {
  it('returns all 3 curated stories spanning Pre-A1 to A2', () => {
    const stories = getAllStories()
    expect(stories).toHaveLength(3)

    const levels = stories.map((s) => s.level)
    expect(levels).toContain('Pre-A1')
    expect(levels).toContain('A1')
    expect(levels).toContain('A2')
  })

  it('retrieves story by id or returns null when not found', () => {
    const story = getStoryById('the-lost-kitten')
    expect(story).toBeDefined()
    expect(story?.titleVi).toBe('Chú Mèo Lạc Trong Rừng Thì Thầm')

    const notFound = getStoryById('non-existent-story')
    expect(notFound).toBeNull()
  })

  it('navigates to branching panel when branch choice is selected', () => {
    const story = getStoryById('the-lost-kitten')
    expect(story).toBeDefined()
    if (!story) return

    // Choice c-pond -> p2-pond
    const nextPond = getNextPanel(story, 'p1', 'c-pond')
    expect(nextPond?.id).toBe('p2-pond')
    expect(nextPond?.characterName).toBe('Froggy')

    // Choice c-tree -> p2-tree
    const nextTree = getNextPanel(story, 'p1', 'c-tree')
    expect(nextTree?.id).toBe('p2-tree')
    expect(nextTree?.characterName).toBe('Miu Miu')
  })

  it('calculates EXP reward correctly', () => {
    expect(calculateStoryExp(0, 3)).toBe(0)
    expect(calculateStoryExp(1, 3)).toBe(5)
    expect(calculateStoryExp(2, 3)).toBe(10)
    expect(calculateStoryExp(3, 3)).toBe(25) // Completion bonus
  })
})
