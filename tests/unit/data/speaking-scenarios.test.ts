import { describe, it, expect } from 'vitest';
import scenariosData from '@/data/speaking/scenarios.json';
import type {
  CEFRLevel,
  SpeakingPersona,
  SpeakingScaffoldingHint,
  SpeakingDialogueTurn,
  SpeakingScenario,
  SpeakingSessionResult,
  SendSpeakingTurnInput,
  SpeakingTurnResponse,
  CompleteSpeakingSessionInput,
} from '@/types/speaking';

describe('Speaking Scenarios Data Integrity & Types', () => {
  const scenarios: SpeakingScenario[] = scenariosData as SpeakingScenario[];

  it('contains exactly 6 curated scenarios', () => {
    expect(scenarios).toBeDefined();
    expect(Array.isArray(scenarios)).toBe(true);
    expect(scenarios.length).toBe(6);
  });

  it('includes all 6 expected scenario IDs with unique IDs', () => {
    const expectedIds = [
      'ordering-cafe',
      'making-friends',
      'asking-directions',
      'school-life',
      'hotel-checkin',
      'free-talk',
    ];

    const actualIds = scenarios.map((s) => s.id);
    expect(actualIds).toEqual(expectedIds);

    const uniqueIds = new Set(actualIds);
    expect(uniqueIds.size).toBe(6);
  });

  it('assigns correct CEFR levels and icons to scenarios', () => {
    const expectedMapping: Record<string, { level: CEFRLevel; icon: string }> = {
      'ordering-cafe': { level: 'A1', icon: '☕' },
      'making-friends': { level: 'A1', icon: '👋' },
      'asking-directions': { level: 'A2', icon: '🗺️' },
      'school-life': { level: 'A2', icon: '🎒' },
      'hotel-checkin': { level: 'B1', icon: '🏨' },
      'free-talk': { level: 'B2', icon: '☀️' },
    };

    scenarios.forEach((scenario) => {
      const expected = expectedMapping[scenario.id];
      expect(expected).toBeDefined();
      expect(scenario.level).toBe(expected.level);
      expect(scenario.icon).toBe(expected.icon);
    });
  });

  it('all scenarios conform to SpeakingScenario structure with valid content', () => {
    const validLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
    const validAccents: Array<'us' | 'uk' | 'neutral'> = ['us', 'uk', 'neutral'];

    scenarios.forEach((scenario) => {
      expect(scenario.id).toBeTruthy();
      expect(typeof scenario.id).toBe('string');

      expect(scenario.titleVi).toBeTruthy();
      expect(typeof scenario.titleVi).toBe('string');

      expect(scenario.titleEn).toBeTruthy();
      expect(typeof scenario.titleEn).toBe('string');

      expect(scenario.descriptionVi).toBeTruthy();
      expect(typeof scenario.descriptionVi).toBe('string');

      expect(validLevels).toContain(scenario.level);
      expect(scenario.icon).toBeTruthy();
      expect(typeof scenario.targetTurns).toBe('number');
      expect(scenario.targetTurns).toBeGreaterThanOrEqual(3);

      // Persona validation
      expect(scenario.persona).toBeDefined();
      expect(scenario.persona.id).toBeTruthy();
      expect(scenario.persona.name).toBeTruthy();
      expect(scenario.persona.avatar).toBeTruthy();
      expect(scenario.persona.role).toBeTruthy();
      expect(validAccents).toContain(scenario.persona.accent);
      expect(scenario.persona.toneVi).toBeTruthy();

      // Initial dialogue starter
      expect(scenario.initialMessage).toBeTruthy();
      expect(typeof scenario.initialMessage).toBe('string');

      // Scaffolding hints (starter, natural, expressive)
      expect(Array.isArray(scenario.initialHints)).toBe(true);
      expect(scenario.initialHints.length).toBe(3);

      const hintLevels = scenario.initialHints.map((h) => h.level);
      expect(hintLevels).toContain('starter');
      expect(hintLevels).toContain('natural');
      expect(hintLevels).toContain('expressive');

      scenario.initialHints.forEach((hint: SpeakingScaffoldingHint) => {
        expect(hint.textEn).toBeTruthy();
        expect(hint.textVi).toBeTruthy();
        if (hint.phoneticHint) {
          expect(typeof hint.phoneticHint).toBe('string');
        }
      });
    });
  });

  it('verifies type contracts can be instantiated properly', () => {
    const persona: SpeakingPersona = {
      id: 'alex',
      name: 'Alex',
      avatar: '👨‍🏫',
      role: 'English Teacher',
      accent: 'us',
      toneVi: 'Thân thiện và kiên nhẫn',
    };
    expect(persona.id).toBe('alex');

    const turn: SpeakingDialogueTurn = {
      id: 'turn-1',
      sender: 'student',
      text: 'Hello, I would like a coffee.',
      accuracyScore: 92,
      wordBreakdown: [{ word: 'Hello', isMatch: true, score: 100 }],
      feedbackVi: 'Phát âm rất rõ ràng!',
      timestamp: new Date().toISOString(),
    };
    expect(turn.sender).toBe('student');

    const sessionResult: SpeakingSessionResult = {
      scenarioId: 'ordering-cafe',
      personaId: 'alex',
      totalTurns: 4,
      overallScore: 90,
      pronunciationScore: 88,
      fluencyScore: 92,
      stars: 3,
      xpEarned: 115,
      mispronouncedWords: [],
      turns: [turn],
    };
    expect(sessionResult.stars).toBe(3);

    const turnInput: SendSpeakingTurnInput = {
      scenarioId: 'ordering-cafe',
      personaId: 'alex',
      userMessage: 'Can I have an iced latte please?',
      turnHistory: [{ sender: 'tutor', text: 'Hi! What can I get for you?' }],
      elapsedMs: 3200,
    };
    expect(turnInput.userMessage).toBeTruthy();

    const turnResponse: SpeakingTurnResponse = {
      success: true,
      tutorMessage: 'Sure! What size would you like?',
      tutorAudioText: 'Sure! What size would you like?',
      accuracyScore: 95,
      feedbackVi: 'Tốt lắm!',
      isCompleted: false,
    };
    expect(turnResponse.success).toBe(true);

    const completeInput: CompleteSpeakingSessionInput = {
      scenarioId: 'ordering-cafe',
      personaId: 'alex',
      totalTurns: 4,
      overallScore: 90,
      pronunciationScore: 88,
      fluencyScore: 92,
      turns: [turn],
      mispronouncedWords: [],
    };
    expect(completeInput.totalTurns).toBe(4);
  });
});
