// src/types/comic-story.ts

export type StoryCefrLevel = 'Pre-A1' | 'A1' | 'A2'

export interface BranchChoice {
  id: string
  textEn: string
  textVi: string
  targetPanelId: string
}

export interface ComicPanel {
  id: string
  panelNumber: number
  sceneEmoji: string
  narratorTextVi: string
  characterName: string
  characterAvatar: string
  dialogueEn: string
  dialogueIpa: string
  dialogueMeaningVi: string
  soundEffect?: string
  requiresVoiceActing: boolean
  branchChoices?: BranchChoice[]
}

export interface ComicStory {
  id: string
  title: string
  titleVi: string
  level: StoryCefrLevel
  coverEmoji: string
  themeColor: string
  synopsisVi: string
  focusPhonemes: string[]
  panels: ComicPanel[]
}

export interface StorySessionProgress {
  storyId: string
  currentPanelId: string
  completedPanelIds: string[]
  score: number
  isCompleted: boolean
}
