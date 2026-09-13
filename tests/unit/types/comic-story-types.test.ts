// tests/unit/types/comic-story-types.test.ts

import { describe, it, expect } from 'vitest'
import type {
  StoryCefrLevel,
  ComicStory,
  ComicPanel,
  StorySessionProgress,
} from '@/types/comic-story'

describe('Comic Story Types Contract', () => {
  it('validates StoryCefrLevel union options', () => {
    const levels: StoryCefrLevel[] = ['Pre-A1', 'A1', 'A2']
    expect(levels).toHaveLength(3)
  })

  it('validates ComicPanel structure with branching choice', () => {
    const panel: ComicPanel = {
      id: 'panel-1',
      panelNumber: 1,
      sceneEmoji: '🌲',
      narratorTextVi: 'Mặt trời chiếu rọi qua khu rừng thì thầm.',
      characterName: 'Miu Miu',
      characterAvatar: '🐱',
      dialogueEn: 'Hello! I need help.',
      dialogueIpa: '/həˈloʊ aɪ niːd hɛlp/',
      dialogueMeaningVi: 'Xin chào! Mình cần sự giúp đỡ.',
      soundEffect: 'MEOW!',
      requiresVoiceActing: true,
      branchChoices: [
        {
          id: 'choice-1',
          textEn: 'Follow the river',
          textVi: 'Đi theo dòng sông',
          targetPanelId: 'panel-river',
        },
      ],
    }

    expect(panel.id).toBe('panel-1')
    expect(panel.requiresVoiceActing).toBe(true)
    expect(panel.branchChoices).toHaveLength(1)
  })

  it('validates ComicStory model', () => {
    const story: ComicStory = {
      id: 'lost-kitten',
      title: 'The Lost Kitten in Whispering Woods',
      titleVi: 'Chú Mèo Lạc Trong Rừng Thì Thầm',
      level: 'Pre-A1',
      coverEmoji: '🐱',
      themeColor: '#10B981',
      synopsisVi: 'Cùng chú mèo Miu Miu vượt qua khu rừng bằng cách phát âm chuẩn xác.',
      focusPhonemes: ['/s/', '/t/', '/k/'],
      panels: [],
    }

    expect(story.id).toBe('lost-kitten')
    expect(story.level).toBe('Pre-A1')
    expect(story.focusPhonemes).toContain('/s/')
  })

  it('validates StorySessionProgress tracking model', () => {
    const progress: StorySessionProgress = {
      storyId: 'lost-kitten',
      currentPanelId: 'panel-2',
      completedPanelIds: ['panel-1'],
      score: 100,
      isCompleted: false,
    }

    expect(progress.currentPanelId).toBe('panel-2')
    expect(progress.completedPanelIds).toContain('panel-1')
    expect(progress.score).toBe(100)
  })
})
