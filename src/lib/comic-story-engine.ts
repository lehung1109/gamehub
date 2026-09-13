// src/lib/comic-story-engine.ts

import type { ComicStory, ComicPanel } from '@/types/comic-story'
import { COMIC_STORIES } from '@/data/stories/comic-stories'

/**
 * Retrieves all curated comic storybooks
 */
export function getAllStories(): ComicStory[] {
  return COMIC_STORIES
}

/**
 * Finds a comic story by its unique identifier
 */
export function getStoryById(id: string): ComicStory | null {
  return COMIC_STORIES.find((s) => s.id === id) || null
}

/**
 * Resolves the next panel in the narrative graph, handling branching choices
 */
export function getNextPanel(
  story: ComicStory,
  currentPanelId: string,
  choiceId?: string
): ComicPanel | null {
  const currentPanel = story.panels.find((p) => p.id === currentPanelId)
  if (!currentPanel) return null

  // If panel has branch choices and a choice is selected
  if (currentPanel.branchChoices && currentPanel.branchChoices.length > 0) {
    if (choiceId) {
      const choice = currentPanel.branchChoices.find((c) => c.id === choiceId)
      if (choice) {
        return story.panels.find((p) => p.id === choice.targetPanelId) || null
      }
    }
    // Fallback to first branch choice target if none provided
    const firstTargetId = currentPanel.branchChoices[0].targetPanelId
    return story.panels.find((p) => p.id === firstTargetId) || null
  }

  // Linear progression: find panel with strictly higher panelNumber
  const nextNumberedPanel = story.panels.find((p) => p.panelNumber > currentPanel.panelNumber)
  return nextNumberedPanel || null
}

/**
 * Computes rewarded EXP based on story completion
 */
export function calculateStoryExp(panelsCompleted: number, totalPanels: number): number {
  if (totalPanels <= 0) return 0
  if (panelsCompleted >= totalPanels) return 25 // Completion bonus
  return Math.min(20, panelsCompleted * 5)
}
