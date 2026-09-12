# Sub-project 6: Pronunciation & Speaking Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and launch Pronunciation & Speaking Lab (Game #20), enabling microphone-powered speech recognition, real-time pronunciation scoring, phonics sound contrasts, and workplace speaking exercises with full Supabase session tracking.

**Architecture:** A client-side speech recognition pipeline powered by a custom `useSpeechRecognition` hook wrapping `webkitSpeechRecognition`/`SpeechRecognition`, a deterministic Levenshtein token evaluation engine (`pronunciation-evaluator.ts`), interactive UI components for voice recording and phonetic cards, full catalog registration in `games.json`, teacher game config builder integration, and optional microphone answer support in Conversational Roleplay.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui, Web Speech API (`SpeechRecognition` & `SpeechSynthesis`), Vitest, Playwright, Supabase client.

**Spec:** [docs/superpowers/specs/2026-09-12-pronunciation-speaking-lab-design.md](file:///F:/projects/gamehub/docs/superpowers/specs/2026-09-12-pronunciation-speaking-lab-design.md)

## Global Constraints
- Target 0 TypeScript errors (`npx tsc --noEmit`).
- Target 0 ESLint errors (`npm run lint`).
- Maintain 100% passing tests across all existing 196 test suites (`npm run test:run`).
- Minimum font size >= 16px (1rem) for body/interactive text adhering to design guidelines.
- Graceful degradation when Web Speech Recognition is unsupported or microphone access is denied.

---

### Task 1: Pronunciation Data Types & Token Evaluation Engine (TDD)

**Files:**
- Create: `src/types/pronunciation.ts`
- Create: `src/lib/pronunciation-evaluator.ts`
- Test: `tests/lib/pronunciation-evaluator.test.ts`

**Interfaces:**
- Consumes: None (pure utility & types)
- Produces: `WordEvaluation`, `PronunciationResult`, `evaluatePronunciation(targetText, spokenText, passThreshold)`

- [ ] **Step 1: Write the failing test for pronunciation evaluation**

Create `tests/lib/pronunciation-evaluator.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { evaluatePronunciation } from '@/lib/pronunciation-evaluator';

describe('evaluatePronunciation', () => {
  it('awards 100% accuracy and 3 stars for exact matches', () => {
    const result = evaluatePronunciation('schedule', 'schedule');
    expect(result.accuracy).toBe(100);
    expect(result.stars).toBe(3);
    expect(result.isPassed).toBe(true);
    expect(result.wordDetails[0].isMatch).toBe(true);
  });

  it('handles case-insensitivity and punctuation gracefully', () => {
    const result = evaluatePronunciation('Good morning, team!', 'good morning team');
    expect(result.accuracy).toBe(100);
    expect(result.stars).toBe(3);
    expect(result.isPassed).toBe(true);
    expect(result.wordDetails.every(w => w.isMatch)).toBe(true);
  });

  it('correctly calculates partial match for multi-word sentence', () => {
    const result = evaluatePronunciation('I deployed the application yesterday', 'I deployed the app yesterday');
    expect(result.accuracy).toBeGreaterThanOrEqual(70);
    expect(result.accuracy).toBeLessThan(100);
    expect(result.wordDetails.find(w => w.word === 'application')?.isMatch).toBe(false);
  });

  it('fails with 1 star and retry guidance when speech is empty or completely wrong', () => {
    const result = evaluatePronunciation('architecture', 'banana');
    expect(result.accuracy).toBeLessThan(50);
    expect(result.stars).toBe(1);
    expect(result.isPassed).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/pronunciation-evaluator.test.ts`  
Expected: FAIL with "Cannot find module '@/lib/pronunciation-evaluator'"

- [ ] **Step 3: Implement `src/types/pronunciation.ts` and `src/lib/pronunciation-evaluator.ts`**

Create `src/types/pronunciation.ts`:
```typescript
export interface WordEvaluation {
  word: string;
  isMatch: boolean;
  score: number;
}

export interface PronunciationResult {
  accuracy: number;
  stars: 1 | 2 | 3;
  feedbackVi: string;
  wordDetails: WordEvaluation[];
  isPassed: boolean;
}

export interface PronunciationItem {
  id: string;
  targetText: string;
  phonetic: string;
  vietnameseMeaning: string;
  focusSound?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'minimal-pairs' | 'workplace-words' | 'standup-phrases';
}

export interface PronunciationTopic {
  id: string;
  nameVi: string;
  nameEn: string;
  descriptionVi: string;
  icon: string;
}
```

Create `src/lib/pronunciation-evaluator.ts`:
```typescript
import { PronunciationResult, WordEvaluation } from '@/types/pronunciation';

function cleanWord(str: string): string {
  return str.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim();
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function wordSimilarity(word1: string, word2: string): number {
  if (word1 === word2) return 100;
  const maxLen = Math.max(word1.length, word2.length);
  if (maxLen === 0) return 100;
  const dist = levenshteinDistance(word1, word2);
  const similarity = Math.max(0, (1 - dist / maxLen) * 100);
  return Math.round(similarity);
}

export function evaluatePronunciation(
  targetText: string,
  spokenText: string,
  passThreshold = 70
): PronunciationResult {
  const targetTokens = targetText.split(/\s+/).filter(Boolean);
  const spokenTokens = spokenText.split(/\s+/).filter(Boolean).map(cleanWord);

  if (targetTokens.length === 0) {
    return {
      accuracy: 0,
      stars: 1,
      feedbackVi: 'Không có nội dung mẫu để đối chiếu.',
      wordDetails: [],
      isPassed: false,
    };
  }

  const wordDetails: WordEvaluation[] = targetTokens.map((rawTargetWord, index) => {
    const cleanedTarget = cleanWord(rawTargetWord);
    const candidateSpoken = spokenTokens[index] || '';

    // Direct match or high similarity threshold
    const directScore = wordSimilarity(cleanedTarget, candidateSpoken);
    
    // Also check if spoken anywhere in the sentence for word transposition tolerance
    let bestScore = directScore;
    if (directScore < 80) {
      for (const sp of spokenTokens) {
        const altScore = wordSimilarity(cleanedTarget, sp);
        if (altScore > bestScore) {
          bestScore = altScore;
        }
      }
    }

    const isMatch = bestScore >= 80;
    return {
      word: rawTargetWord,
      isMatch,
      score: bestScore,
    };
  });

  const matchedCount = wordDetails.filter((w) => w.isMatch).length;
  const accuracy = Math.round((matchedCount / targetTokens.length) * 100);
  const isPassed = accuracy >= passThreshold;

  let stars: 1 | 2 | 3 = 1;
  let feedbackVi = 'Cần luyện tập thêm. Hãy nghe lại âm mẫu và thử lại nhé!';

  if (accuracy >= 90) {
    stars = 3;
    feedbackVi = 'Xuất sắc! Bạn phát âm rất chuẩn xác và rõ ràng.';
  } else if (accuracy >= passThreshold) {
    stars = 2;
    feedbackVi = 'Rất tốt! Cố gắng nhấn chuẩn các từ chưa chính xác nhé.';
  }

  return {
    accuracy,
    stars,
    feedbackVi,
    wordDetails,
    isPassed,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/pronunciation-evaluator.test.ts`  
Expected: PASS (4 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/types/pronunciation.ts src/lib/pronunciation-evaluator.ts tests/lib/pronunciation-evaluator.test.ts
git commit -m "feat(pronunciation): add pronunciation types and token evaluation engine"
```

---

### Task 2: Curriculum Datasets (Minimal Pairs, Workplace Words, Standup Phrases)

**Files:**
- Create: `src/data/pronunciation/index.json`
- Create: `src/data/pronunciation/minimal-pairs.json`
- Create: `src/data/pronunciation/workplace-words.json`
- Create: `src/data/pronunciation/standup-phrases.json`
- Test: `tests/data/pronunciation-data.test.ts`

**Interfaces:**
- Consumes: `PronunciationItem`, `PronunciationTopic`
- Produces: Static JSON catalogs for Pronunciation Lab

- [ ] **Step 1: Write schema and validity test for pronunciation data**

Create `tests/data/pronunciation-data.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import topics from '@/data/pronunciation/index.json';
import minimalPairs from '@/data/pronunciation/minimal-pairs.json';
import workplaceWords from '@/data/pronunciation/workplace-words.json';
import standupPhrases from '@/data/pronunciation/standup-phrases.json';

describe('Pronunciation Curriculum Datasets', () => {
  it('contains valid topic catalogs', () => {
    expect(topics.length).toBeGreaterThanOrEqual(3);
    topics.forEach((t) => {
      expect(t.id).toBeTruthy();
      expect(t.nameVi).toBeTruthy();
      expect(t.nameEn).toBeTruthy();
    });
  });

  it('validates minimal pairs dataset items', () => {
    expect(minimalPairs.length).toBeGreaterThanOrEqual(10);
    minimalPairs.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.targetText).toBeTruthy();
      expect(item.phonetic).toMatch(/^\/.*\/$/);
      expect(item.vietnameseMeaning).toBeTruthy();
    });
  });

  it('validates workplace words and standup phrases datasets', () => {
    expect(workplaceWords.length).toBeGreaterThanOrEqual(10);
    expect(standupPhrases.length).toBeGreaterThanOrEqual(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/data/pronunciation-data.test.ts`  
Expected: FAIL (modules not found)

- [ ] **Step 3: Create datasets in `src/data/pronunciation/`**

Create `src/data/pronunciation/index.json`:
```json
[
  {
    "id": "minimal-pairs",
    "nameVi": "Cặp âm dễ nhầm lẫn",
    "nameEn": "Minimal Pairs & Phonics",
    "descriptionVi": "Phân biệt các nguyên âm ngắn - dài và phụ âm khó trong tiếng Anh",
    "icon": "👂"
  },
  {
    "id": "workplace-words",
    "nameVi": "Từ vựng công sở & Trọng âm",
    "nameEn": "Workplace Vocabulary & Stress",
    "descriptionVi": "Luyện phát âm chuẩn các từ vựng công nghệ và văn phòng hay gặp",
    "icon": "💼"
  },
  {
    "id": "standup-phrases",
    "nameVi": "Câu giao tiếp Standup",
    "nameEn": "Daily Standup Communication",
    "descriptionVi": "Luyện nói trôi chảy các mẫu câu họp standup và cập nhật tiến độ",
    "icon": "🚀"
  }
]
```

Create `src/data/pronunciation/minimal-pairs.json`:
```json
[
  {
    "id": "mp-1",
    "targetText": "ship",
    "phonetic": "/ʃɪp/",
    "vietnameseMeaning": "con tàu",
    "focusSound": "/ɪ/ ngắn",
    "difficulty": "easy",
    "category": "minimal-pairs"
  },
  {
    "id": "mp-2",
    "targetText": "sheep",
    "phonetic": "/ʃiːp/",
    "vietnameseMeaning": "con cừu",
    "focusSound": "/iː/ dài",
    "difficulty": "easy",
    "category": "minimal-pairs"
  },
  {
    "id": "mp-3",
    "targetText": "bad",
    "phonetic": "/bæd/",
    "vietnameseMeaning": "tồi tệ, xấu",
    "focusSound": "/æ/ bẹt",
    "difficulty": "easy",
    "category": "minimal-pairs"
  },
  {
    "id": "mp-4",
    "targetText": "bed",
    "phonetic": "/bed/",
    "vietnameseMeaning": "chiếc giường",
    "focusSound": "/e/ ngắn",
    "difficulty": "easy",
    "category": "minimal-pairs"
  },
  {
    "id": "mp-5",
    "targetText": "leave",
    "phonetic": "/liːv/",
    "vietnameseMeaning": "rời đi, nghỉ phép",
    "focusSound": "/iː/ dài",
    "difficulty": "medium",
    "category": "minimal-pairs"
  },
  {
    "id": "mp-6",
    "targetText": "live",
    "phonetic": "/lɪv/",
    "vietnameseMeaning": "sống, ở",
    "focusSound": "/ɪ/ ngắn",
    "difficulty": "medium",
    "category": "minimal-pairs"
  },
  {
    "id": "mp-7",
    "targetText": "think",
    "phonetic": "/θɪŋk/",
    "vietnameseMeaning": "suy nghĩ",
    "focusSound": "/θ/ vô thanh",
    "difficulty": "hard",
    "category": "minimal-pairs"
  },
  {
    "id": "mp-8",
    "targetText": "sink",
    "phonetic": "/sɪŋk/",
    "vietnameseMeaning": "chìm, bồn rửa",
    "focusSound": "/s/ gió",
    "difficulty": "medium",
    "category": "minimal-pairs"
  },
  {
    "id": "mp-9",
    "targetText": "rice",
    "phonetic": "/raɪs/",
    "vietnameseMeaning": "cơm, gạo",
    "focusSound": "/r/",
    "difficulty": "easy",
    "category": "minimal-pairs"
  },
  {
    "id": "mp-10",
    "targetText": "mice",
    "phonetic": "/maɪs/",
    "vietnameseMeaning": "những con chuột",
    "focusSound": "/m/",
    "difficulty": "easy",
    "category": "minimal-pairs"
  }
]
```

Create `src/data/pronunciation/workplace-words.json`:
```json
[
  {
    "id": "ww-1",
    "targetText": "schedule",
    "phonetic": "/ˈʃedʒuːl/",
    "vietnameseMeaning": "lịch trình, thời gian biểu",
    "focusSound": "Trọng âm 1",
    "difficulty": "medium",
    "category": "workplace-words"
  },
  {
    "id": "ww-2",
    "targetText": "colleague",
    "phonetic": "/ˈkɒliːɡ/",
    "vietnameseMeaning": "đồng nghiệp",
    "focusSound": "Trọng âm 1",
    "difficulty": "medium",
    "category": "workplace-words"
  },
  {
    "id": "ww-3",
    "targetText": "architecture",
    "phonetic": "/ˈɑːkɪtektʃər/",
    "vietnameseMeaning": "kiến trúc hệ thống",
    "focusSound": "Trọng âm 1",
    "difficulty": "hard",
    "category": "workplace-words"
  },
  {
    "id": "ww-4",
    "targetText": "comfortable",
    "phonetic": "/ˈkʌmftəbl/",
    "vietnameseMeaning": "thoải mái, thuận tiện",
    "focusSound": "3 âm tiết",
    "difficulty": "medium",
    "category": "workplace-words"
  },
  {
    "id": "ww-5",
    "targetText": "prioritize",
    "phonetic": "/praɪˈɒrətaɪz/",
    "vietnameseMeaning": "ưu tiên giải quyết",
    "focusSound": "Trọng âm 2",
    "difficulty": "hard",
    "category": "workplace-words"
  },
  {
    "id": "ww-6",
    "targetText": "feedback",
    "phonetic": "/ˈfiːdbæk/",
    "vietnameseMeaning": "phản hồi, góp ý",
    "focusSound": "Trọng âm 1",
    "difficulty": "easy",
    "category": "workplace-words"
  },
  {
    "id": "ww-7",
    "targetText": "deployment",
    "phonetic": "/dɪˈplɔɪmənt/",
    "vietnameseMeaning": "triển khai phần mềm",
    "focusSound": "Trọng âm 2",
    "difficulty": "medium",
    "category": "workplace-words"
  },
  {
    "id": "ww-8",
    "targetText": "incident",
    "phonetic": "/ˈɪnsɪdənt/",
    "vietnameseMeaning": "sự cố kỹ thuật",
    "focusSound": "Trọng âm 1",
    "difficulty": "medium",
    "category": "workplace-words"
  },
  {
    "id": "ww-9",
    "targetText": "requirement",
    "phonetic": "/rɪˈkwaɪəmənt/",
    "vietnameseMeaning": "yêu cầu dự án",
    "focusSound": "Trọng âm 2",
    "difficulty": "medium",
    "category": "workplace-words"
  },
  {
    "id": "ww-10",
    "targetText": "productivity",
    "phonetic": "/ˌprɒdʌkˈtɪvəti/",
    "vietnameseMeaning": "năng suất làm việc",
    "focusSound": "Trọng âm 3",
    "difficulty": "hard",
    "category": "workplace-words"
  }
]
```

Create `src/data/pronunciation/standup-phrases.json`:
```json
[
  {
    "id": "sp-1",
    "targetText": "Can you hear me clearly?",
    "phonetic": "/kæn juː hɪər miː ˈklɪəli/",
    "vietnameseMeaning": "Mọi người có nghe rõ tôi nói không?",
    "difficulty": "easy",
    "category": "standup-phrases"
  },
  {
    "id": "sp-2",
    "targetText": "I am working on the deployment today.",
    "phonetic": "/aɪ æm ˈwɜːkɪŋ ɒn ðə dɪˈplɔɪmənt təˈdeɪ/",
    "vietnameseMeaning": "Hôm nay tôi đang tập trung vào việc triển khai.",
    "difficulty": "medium",
    "category": "standup-phrases"
  },
  {
    "id": "sp-3",
    "targetText": "I have no blockers for this sprint.",
    "phonetic": "/aɪ hæv nəʊ ˈblɒkərz fɔːr ðɪs sprɪnt/",
    "vietnameseMeaning": "Tôi không có vướng mắc nào trong sprint này.",
    "difficulty": "easy",
    "category": "standup-phrases"
  },
  {
    "id": "sp-4",
    "targetText": "Let us sync up after this meeting.",
    "phonetic": "/let ʌs sɪŋk ʌp ˈɑːftər ðɪs ˈmiːtɪŋ/",
    "vietnameseMeaning": "Chúng ta hãy trao đổi riêng sau cuộc họp này nhé.",
    "difficulty": "medium",
    "category": "standup-phrases"
  },
  {
    "id": "sp-5",
    "targetText": "Could you please review my pull request?",
    "phonetic": "/kʊd juː pliːz rɪˈvjuː maɪ pʊl rɪˈkwest/",
    "vietnameseMeaning": "Bạn có thể xem giúp tôi bản pull request này được không?",
    "difficulty": "medium",
    "category": "standup-phrases"
  },
  {
    "id": "sp-6",
    "targetText": "The build was successful on production.",
    "phonetic": "/ðə bɪld wɒz səkˈsesfl ɒn prəˈdʌkʃn/",
    "vietnameseMeaning": "Bản build đã chạy thành công trên môi trường production.",
    "difficulty": "medium",
    "category": "standup-phrases"
  },
  {
    "id": "sp-7",
    "targetText": "I am looking into the error logs now.",
    "phonetic": "/aɪ æm ˈlʊkɪŋ ˈɪntuː ði ˈerər lɒɡz naʊ/",
    "vietnameseMeaning": "Tôi đang kiểm tra nhật ký lỗi hệ thống ngay bây giờ.",
    "difficulty": "medium",
    "category": "standup-phrases"
  },
  {
    "id": "sp-8",
    "targetText": "Please share your screen with the team.",
    "phonetic": "/pliːz ʃeər jɔːr skriːn wɪð ðə tiːm/",
    "vietnameseMeaning": "Xin mời bạn chia sẻ màn hình với toàn đội.",
    "difficulty": "easy",
    "category": "standup-phrases"
  },
  {
    "id": "sp-9",
    "targetText": "We need to update our test coverage.",
    "phonetic": "/wiː niːd tuː ʌpˈdeɪt ˈaʊər test ˈkʌvərɪdʒ/",
    "vietnameseMeaning": "Chúng ta cần cập nhật tỷ lệ bao phủ kiểm thử.",
    "difficulty": "hard",
    "category": "standup-phrases"
  },
  {
    "id": "sp-10",
    "targetText": "Thank you everyone for joining today.",
    "phonetic": "/θæŋk juː ˈevriwʌn fɔːr ˈdʒɔɪnɪŋ təˈdeɪ/",
    "vietnameseMeaning": "Cảm ơn mọi người đã tham gia hôm nay.",
    "difficulty": "easy",
    "category": "standup-phrases"
  }
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/data/pronunciation-data.test.ts`  
Expected: PASS (3 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/data/pronunciation/ tests/data/pronunciation-data.test.ts
git commit -m "feat(pronunciation): add curriculum datasets for minimal pairs, words, and standup phrases"
```

---

### Task 3: Speech Recognition React Hook (`useSpeechRecognition`)

**Files:**
- Create: `src/hooks/useSpeechRecognition.ts`
- Test: `tests/hooks/useSpeechRecognition.test.ts`

**Interfaces:**
- Consumes: Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- Produces: `useSpeechRecognition({ lang, continuous, interimResults })` returning `isListening`, `transcript`, `interimTranscript`, `isSupported`, `error`, `startListening`, `stopListening`, `resetTranscript`.

- [ ] **Step 1: Write unit tests with mocked `webkitSpeechRecognition`**

Create `tests/hooks/useSpeechRecognition.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

describe('useSpeechRecognition', () => {
  let mockRecognitionInstance: any;

  beforeEach(() => {
    mockRecognitionInstance = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onstart: null,
      onend: null,
      onerror: null,
      onresult: null,
    };

    (window as any).webkitSpeechRecognition = vi.fn(() => mockRecognitionInstance);
  });

  it('detects browser support when webkitSpeechRecognition is available', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isListening).toBe(false);
  });

  it('starts listening and updates state when startListening is invoked', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
    });
    expect(mockRecognitionInstance.start).toHaveBeenCalled();

    // Trigger onstart
    act(() => {
      mockRecognitionInstance.onstart();
    });
    expect(result.current.isListening).toBe(true);
  });

  it('captures transcript from recognition result event', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
      mockRecognitionInstance.onresult({
        resultIndex: 0,
        results: [
          [{ transcript: 'schedule' }],
        ],
      });
    });
    expect(result.current.transcript).toBe('schedule');
  });

  it('handles permission denied error', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    act(() => {
      result.current.startListening();
      mockRecognitionInstance.onerror({ error: 'not-allowed' });
    });
    expect(result.current.error).toBe('not-allowed');
    expect(result.current.isListening).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/hooks/useSpeechRecognition.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `src/hooks/useSpeechRecognition.ts`**

Create `src/hooks/useSpeechRecognition.ts`:
```typescript
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechRecognitionResultState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  error: 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}): SpeechRecognitionResultState {
  const { lang = 'en-US', continuous = false, interimResults = true } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<'not-allowed' | 'no-speech' | 'network' | 'unsupported' | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  const isSupported = typeof window !== 'undefined' && Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort error
        }
      }
    };
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (isMountedRef.current) {
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('unsupported');
      return;
    }

    resetTranscript();

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      if (isMountedRef.current) {
        setIsListening(true);
        setError(null);
      }
    };

    recognition.onresult = (event: any) => {
      if (!isMountedRef.current) return;

      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal || !interimResults) {
          finalStr += item[0].transcript;
        } else {
          interimStr += item[0].transcript;
        }
      }

      if (finalStr) {
        setTranscript((prev) => (prev ? `${prev} ${finalStr}` : finalStr));
      }
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: any) => {
      if (!isMountedRef.current) return;
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setError('not-allowed');
      } else if (event.error === 'no-speech') {
        setError('no-speech');
      } else {
        setError('network');
      }
    };

    recognition.onend = () => {
      if (isMountedRef.current) {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      // already started or busy
    }
  }, [isSupported, lang, continuous, interimResults, resetTranscript]);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/hooks/useSpeechRecognition.test.ts`  
Expected: PASS (4 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSpeechRecognition.ts tests/hooks/useSpeechRecognition.test.ts
git commit -m "feat(pronunciation): add cross-browser useSpeechRecognition hook"
```

---

### Task 4: Interactive Recording UI Components

**Files:**
- Create: `src/components/game/pronunciation/MicrophoneRecorder.tsx`
- Create: `src/components/game/pronunciation/PhoneticWordCard.tsx`
- Create: `src/components/game/pronunciation/PronunciationResultCard.tsx`
- Create: `src/components/game/pronunciation/PronunciationScoreModal.tsx`
- Test: `tests/components/pronunciation/PronunciationComponents.test.tsx`

**Interfaces:**
- Consumes: `PronunciationItem`, `PronunciationResult`, `useSpeechRecognition`, `useSpeech`
- Produces: Visual components for pronunciation prompt, microphone recorder, word tokens feedback, and session completion modal.

- [ ] **Step 1: Write component tests**

Create `tests/components/pronunciation/PronunciationComponents.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PhoneticWordCard } from '@/components/game/pronunciation/PhoneticWordCard';
import { MicrophoneRecorder } from '@/components/game/pronunciation/MicrophoneRecorder';

describe('Pronunciation Components', () => {
  it('renders target text, phonetic IPA and translation in PhoneticWordCard', () => {
    const onPlayAudio = vi.fn();
    render(
      <PhoneticWordCard
        targetText="schedule"
        phonetic="/ˈʃedʒuːl/"
        vietnameseMeaning="lịch trình"
        focusSound="Trọng âm 1"
        onPlayAudio={onPlayAudio}
      />
    );

    expect(screen.getByText('schedule')).toBeInTheDocument();
    expect(screen.getByText('/ˈʃedʒuːl/')).toBeInTheDocument();
    expect(screen.getByText('lịch trình')).toBeInTheDocument();

    const listenBtn = screen.getByRole('button', { name: /nghe phát âm mẫu/i });
    fireEvent.click(listenBtn);
    expect(onPlayAudio).toHaveBeenCalledWith('schedule');
  });

  it('renders listening animation and action button in MicrophoneRecorder', () => {
    const onToggle = vi.fn();
    render(
      <MicrophoneRecorder
        isListening={true}
        interimTranscript="sched..."
        isSupported={true}
        error={null}
        onToggleListening={onToggle}
      />
    );

    expect(screen.getByText(/đang nghe/i)).toBeInTheDocument();
    expect(screen.getByText('sched...')).toBeInTheDocument();
    const micBtn = screen.getByTestId('mic-toggle-button');
    fireEvent.click(micBtn);
    expect(onToggle).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/pronunciation/PronunciationComponents.test.tsx`  
Expected: FAIL (modules not found)

- [ ] **Step 3: Implement components in `src/components/game/pronunciation/`**

Create `src/components/game/pronunciation/PhoneticWordCard.tsx`:
```tsx
'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PhoneticWordCardProps {
  targetText: string;
  phonetic: string;
  vietnameseMeaning: string;
  focusSound?: string;
  onPlayAudio: (text: string) => void;
}

export function PhoneticWordCard({
  targetText,
  phonetic,
  vietnameseMeaning,
  focusSound,
  onPlayAudio,
}: PhoneticWordCardProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card border rounded-2xl shadow-sm text-center space-y-3">
      {focusSound && (
        <Badge variant="secondary" className="text-xs px-2.5 py-0.5 font-medium">
          {focusSound}
        </Badge>
      )}
      <div className="flex items-center gap-3">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          {targetText}
        </h2>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Nghe phát âm mẫu"
          onClick={() => onPlayAudio(targetText)}
          className="rounded-full h-10 w-10 shrink-0"
        >
          <Volume2 className="h-5 w-5 text-primary" />
        </Button>
      </div>
      <p className="text-sm font-mono text-muted-foreground">{phonetic}</p>
      <p className="text-base text-primary/80 font-medium">{vietnameseMeaning}</p>
    </div>
  );
}
```

Create `src/components/game/pronunciation/MicrophoneRecorder.tsx`:
```tsx
'use client';

import React from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicrophoneRecorderProps {
  isListening: boolean;
  interimTranscript: string;
  isSupported: boolean;
  error: 'not-allowed' | 'no-speech' | 'network' | 'unsupported' | null;
  onToggleListening: () => void;
}

export function MicrophoneRecorder({
  isListening,
  interimTranscript,
  isSupported,
  error,
  onToggleListening,
}: MicrophoneRecorderProps) {
  if (!isSupported) {
    return (
      <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome, Edge hoặc Safari.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-2">
      <div className="relative flex items-center justify-center">
        {isListening && (
          <span className="absolute animate-ping h-20 w-20 rounded-full bg-red-400 opacity-50" />
        )}
        <Button
          type="button"
          data-testid="mic-toggle-button"
          variant={isListening ? 'destructive' : 'default'}
          size="lg"
          onClick={onToggleListening}
          className={`h-16 w-16 rounded-full shadow-md transition-all duration-200 ${
            isListening ? 'scale-105' : 'hover:scale-105'
          }`}
          aria-label={isListening ? 'Dừng thu âm' : 'Bắt đầu phát âm'}
        >
          {isListening ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
        </Button>
      </div>

      <div className="text-center min-h-[44px]">
        {isListening ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-red-600 animate-pulse">
              Đang nghe... hãy nói to và rõ ràng
            </p>
            {interimTranscript && (
              <p className="text-sm text-muted-foreground italic font-mono">
                &ldquo;{interimTranscript}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground font-medium">
            Nhấn biểu tượng Microphone để bắt đầu đọc
          </p>
        )}
      </div>

      {error === 'not-allowed' && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Vui lòng cấp quyền truy cập Microphone trên trình duyệt để luyện nói.</span>
        </div>
      )}
    </div>
  );
}
```

Create `src/components/game/pronunciation/PronunciationResultCard.tsx`:
```tsx
'use client';

import React from 'react';
import { Star, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { PronunciationResult } from '@/types/pronunciation';
import { Button } from '@/components/ui/button';

interface PronunciationResultCardProps {
  result: PronunciationResult;
  onRetry: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function PronunciationResultCard({
  result,
  onRetry,
  onNext,
  isLastQuestion,
}: PronunciationResultCardProps) {
  return (
    <div className="p-5 border rounded-2xl bg-card space-y-4 shadow-sm animate-in fade-in-50 duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((starIndex) => (
            <Star
              key={starIndex}
              className={`w-6 h-6 ${
                starIndex <= result.stars
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-bold text-foreground">{result.accuracy}%</span>
      </div>

      <div className="flex flex-wrap gap-2 py-2">
        {result.wordDetails.map((wordEval, idx) => (
          <span
            key={idx}
            className={`px-3 py-1 rounded-lg text-base font-semibold border ${
              wordEval.isMatch
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            {wordEval.word}
          </span>
        ))}
      </div>

      <p className="text-sm font-medium text-foreground">{result.feedbackVi}</p>

      <div className="flex items-center gap-3 pt-2">
        <Button variant="outline" onClick={onRetry} className="flex-1 gap-2">
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </Button>
        <Button onClick={onNext} className="flex-1 gap-2">
          {isLastQuestion ? (
            <>
              <CheckCircle className="w-4 h-4" /> Hoàn thành
            </>
          ) : (
            <>
              Tiếp tục <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
```

Create `src/components/game/pronunciation/PronunciationScoreModal.tsx`:
```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, RefreshCw, Home } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PronunciationScoreModalProps {
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  onRestart: () => void;
}

export function PronunciationScoreModal({
  isOpen,
  score,
  totalQuestions,
  onRestart,
}: PronunciationScoreModalProps) {
  const percentage = Math.round((score / (totalQuestions * 100)) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto my-3 p-3 bg-amber-500/15 text-amber-500 rounded-full w-fit">
            <Trophy className="w-10 h-10" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Hoàn Thành Bài Luyện Nói!
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <p className="text-3xl font-extrabold text-primary">{percentage}%</p>
          <p className="text-sm text-muted-foreground">
            Bạn đã hoàn thành {totalQuestions} mục phát âm và đạt tổng điểm {score}!
          </p>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-center">
          <Button variant="outline" onClick={onRestart} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Luyện lại
          </Button>
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="w-4 h-4" /> Về trang chủ
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/pronunciation/PronunciationComponents.test.tsx`  
Expected: PASS (2 tests passed)

- [ ] **Step 5: Commit**

```bash
git add src/components/game/pronunciation/ tests/components/pronunciation/PronunciationComponents.test.tsx
git commit -m "feat(pronunciation): implement interactive recording and feedback UI components"
```

---

### Task 5: Pronunciation Lab Game Arena & App Route (`/games/pronunciation`)

**Files:**
- Create: `src/components/game/pronunciation/PronunciationArena.tsx`
- Create: `src/app/games/pronunciation/page.tsx`
- Test: `tests/app/games/pronunciation/page.test.tsx`

**Interfaces:**
- Consumes: `useSpeechRecognition`, `useSpeech`, `useGameTracking`, `evaluatePronunciation`
- Produces: Full playable loop under `/games/pronunciation` with Supabase session submission.

- [ ] **Step 1: Write page render test**

Create `tests/app/games/pronunciation/page.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PronunciationPage from '@/app/games/pronunciation/page';

// Mock Speech APIs
(window as any).speechSynthesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
};

describe('PronunciationPage', () => {
  it('renders topic switcher and initial question correctly', () => {
    render(<PronunciationPage />);
    expect(screen.getByText(/phòng luyện phát âm/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/app/games/pronunciation/page.test.tsx`  
Expected: FAIL (route module does not exist)

- [ ] **Step 3: Implement `PronunciationArena.tsx` and `page.tsx`**

Create `src/components/game/pronunciation/PronunciationArena.tsx`:
```tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PronunciationItem, PronunciationResult } from '@/types/pronunciation';
import { PhoneticWordCard } from './PhoneticWordCard';
import { MicrophoneRecorder } from './MicrophoneRecorder';
import { PronunciationResultCard } from './PronunciationResultCard';
import { PronunciationScoreModal } from './PronunciationScoreModal';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeech } from '@/hooks/useSpeech';
import { useGameTracking } from '@/hooks/useGameTracking';
import { evaluatePronunciation } from '@/lib/pronunciation-evaluator';

interface PronunciationArenaProps {
  items: PronunciationItem[];
  topicId: string;
}

export function PronunciationArena({ items, topicId }: PronunciationArenaProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [evaluationResult, setEvaluationResult] = useState<PronunciationResult | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentItem = items[currentIndex] || items[0];
  const { speak } = useSpeech({ rate: 0.85 });
  const { isTracking, recordQuestion, submitSession } = useGameTracking({
    gameType: 'pronunciation',
    topic: topicId,
  });

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: 'en-US' });

  // When speech transcript completes, evaluate
  useEffect(() => {
    if (!isListening && transcript && currentItem) {
      const res = evaluatePronunciation(currentItem.targetText, transcript);
      setEvaluationResult(res);

      if (isTracking) {
        recordQuestion({
          prompt: currentItem.targetText,
          selectedAnswer: transcript,
          correctAnswer: currentItem.targetText,
          isCorrect: res.isPassed,
          timeTakenMs: 3000,
        });
      }
    }
  }, [isListening, transcript, currentItem, isTracking, recordQuestion]);

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      setEvaluationResult(null);
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleNext = useCallback(async () => {
    if (evaluationResult) {
      setTotalScore((prev) => prev + evaluationResult.accuracy);
    }
    setEvaluationResult(null);
    resetTranscript();

    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      if (isTracking) {
        await submitSession({
          score: totalScore + (evaluationResult?.accuracy || 0),
          totalQuestions: items.length,
          topic: topicId,
          gameType: 'pronunciation',
        });
      }
    }
  }, [currentIndex, items.length, evaluationResult, resetTranscript, isTracking, submitSession, totalScore, topicId]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setTotalScore(0);
    setEvaluationResult(null);
    setIsCompleted(false);
    resetTranscript();
  }, [resetTranscript]);

  if (!currentItem) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>Câu {currentIndex + 1} / {items.length}</span>
        <span>Điểm: {totalScore}</span>
      </div>

      <PhoneticWordCard
        targetText={currentItem.targetText}
        phonetic={currentItem.phonetic}
        vietnameseMeaning={currentItem.vietnameseMeaning}
        focusSound={currentItem.focusSound}
        onPlayAudio={(text) => speak(text)}
      />

      {!evaluationResult ? (
        <MicrophoneRecorder
          isListening={isListening}
          interimTranscript={interimTranscript}
          isSupported={isSupported}
          error={error}
          onToggleListening={handleToggleListening}
        />
      ) : (
        <PronunciationResultCard
          result={evaluationResult}
          onRetry={() => {
            setEvaluationResult(null);
            resetTranscript();
          }}
          onNext={handleNext}
          isLastQuestion={currentIndex + 1 >= items.length}
        />
      )}

      <PronunciationScoreModal
        isOpen={isCompleted}
        score={totalScore}
        totalQuestions={items.length}
        onRestart={handleRestart}
      />
    </div>
  );
}
```

Create `src/app/games/pronunciation/page.tsx`:
```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import topics from '@/data/pronunciation/index.json';
import minimalPairs from '@/data/pronunciation/minimal-pairs.json';
import workplaceWords from '@/data/pronunciation/workplace-words.json';
import standupPhrases from '@/data/pronunciation/standup-phrases.json';
import { PronunciationItem } from '@/types/pronunciation';
import { PronunciationArena } from '@/components/game/pronunciation/PronunciationArena';

const DATA_MAP: Record<string, PronunciationItem[]> = {
  'minimal-pairs': minimalPairs as PronunciationItem[],
  'workplace-words': workplaceWords as PronunciationItem[],
  'standup-phrases': standupPhrases as PronunciationItem[],
};

export default function PronunciationPage() {
  const [selectedTopic, setSelectedTopic] = useState('minimal-pairs');
  const items = DATA_MAP[selectedTopic] || minimalPairs;

  return (
    <Container className="py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </Link>
        </Button>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Game #20 Mới
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          🎙️ Phòng Luyện Phát Âm
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Luyện nói tiếng Anh chuẩn xác qua microphone với phản hồi tức thì
        </p>
      </div>

      {/* Topic Switcher */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
        {topics.map((t) => (
          <Button
            key={t.id}
            variant={selectedTopic === t.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTopic(t.id)}
            className="rounded-full text-xs"
          >
            <span className="mr-1.5">{t.icon}</span>
            {t.nameVi}
          </Button>
        ))}
      </div>

      <PronunciationArena items={items} topicId={selectedTopic} />
    </Container>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/app/games/pronunciation/page.test.tsx`  
Expected: PASS (1 test passed)

- [ ] **Step 5: Commit**

```bash
git add src/components/game/pronunciation/PronunciationArena.tsx src/app/games/pronunciation/page.tsx tests/app/games/pronunciation/page.test.tsx
git commit -m "feat(pronunciation): assemble PronunciationArena and route page"
```

---

### Task 6: Game Catalog Registration & Category Filter Update

**Files:**
- Modify: `src/data/games.json`
- Test: `tests/data/games.test.ts`

**Interfaces:**
- Consumes: 19 existing games
- Produces: 20 games catalog with `pronunciation` game included in `phonics-audio` category.

- [ ] **Step 1: Update catalog test to assert 20 games**

Modify `tests/data/games.test.ts`:
Update test assertion from `19` to `20`, and verify `pronunciation` exists with route `/games/pronunciation`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/data/games.test.ts`  
Expected: FAIL (expected 20, received 19)

- [ ] **Step 3: Add `pronunciation` to `src/data/games.json`**

Append entry to `src/data/games.json`:
```json
  {
    "id": "pronunciation",
    "slug": "pronunciation",
    "titleVi": "Phòng Luyện Phát Âm",
    "titleEn": "Pronunciation Lab",
    "description": "Luyện nói và phát âm tiếng Anh chuẩn xác qua microphone với phản hồi tức thì",
    "emoji": "🎙️",
    "route": "/games/pronunciation",
    "priority": 20,
    "category": "phonics-audio"
  }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/data/games.test.ts`  
Expected: PASS (all games valid)

- [ ] **Step 5: Commit**

```bash
git add src/data/games.json tests/data/games.test.ts
git commit -m "feat(catalog): register pronunciation lab game in games.json"
```

---

### Task 7: Teacher Config Builder (`PronunciationConfigForm`) & Schema Validation

**Files:**
- Modify: `src/types/config.ts`
- Modify: `src/lib/game-config-schema.ts`
- Create: `src/components/config/PronunciationConfigForm.tsx`
- Modify: `src/components/config/ConfigCreateForm.tsx`
- Modify: `src/components/config/ConfigEditForm.tsx`
- Test: `tests/components/config/PronunciationConfigForm.test.tsx`

**Interfaces:**
- Consumes: `PronunciationGameConfig`
- Produces: Config editor for teachers to assign pronunciation exercises to classrooms.

- [ ] **Step 1: Write test for PronunciationConfigForm**

Create `tests/components/config/PronunciationConfigForm.test.tsx`:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PronunciationConfigForm } from '@/components/config/PronunciationConfigForm';

describe('PronunciationConfigForm', () => {
  it('renders topic selector and pass threshold slider', () => {
    const onChange = vi.fn();
    render(
      <PronunciationConfigForm
        value={{ topic: 'minimal-pairs', passThreshold: 75, wordCount: 10 }}
        onChange={onChange}
      />
    );

    expect(screen.getByText(/chủ đề phát âm/i)).toBeInTheDocument();
    expect(screen.getByText(/điểm đạt tối thiểu/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/config/PronunciationConfigForm.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Implement config types, schema, and `PronunciationConfigForm.tsx`**

In `src/types/config.ts`:
Add `PronunciationGameConfig`:
```typescript
export interface PronunciationGameConfig {
  topic: 'minimal-pairs' | 'workplace-words' | 'standup-phrases';
  passThreshold: number; // 50 - 90
  wordCount: number;     // 5 - 20
}
```

In `src/lib/game-config-schema.ts`:
Add `pronunciationConfigSchema` and map to game type `pronunciation`.

Create `src/components/config/PronunciationConfigForm.tsx`:
Implement form with topic selector, threshold input, and item count selector.

Integrate into `ConfigCreateForm.tsx` and `ConfigEditForm.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/config/PronunciationConfigForm.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/config.ts src/lib/game-config-schema.ts src/components/config/PronunciationConfigForm.tsx src/components/config/ConfigCreateForm.tsx src/components/config/ConfigEditForm.tsx tests/components/config/PronunciationConfigForm.test.tsx
git commit -m "feat(config): add PronunciationConfigForm and schema validation"
```

---

### Task 8: Voice Response Option in Conversational Roleplay

**Files:**
- Modify: `src/components/roleplay/RoleplayDialogueBox.tsx`
- Test: `tests/components/roleplay/RoleplayDialogueBox.test.tsx`

**Interfaces:**
- Consumes: `useSpeechRecognition`
- Produces: Optional microphone button next to each dialogue option allowing learner to speak their reply.

- [ ] **Step 1: Write test for microphone button in RoleplayDialogueBox**

Add test checking that microphone button is rendered alongside option choices when speech recognition is available.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/roleplay/RoleplayDialogueBox.test.tsx`  
Expected: FAIL

- [ ] **Step 3: Update `RoleplayDialogueBox.tsx` with microphone voice trigger**

Integrate `useSpeechRecognition` so that speaking the words of an option automatically selects it.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/roleplay/RoleplayDialogueBox.test.tsx`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/roleplay/RoleplayDialogueBox.tsx tests/components/roleplay/RoleplayDialogueBox.test.tsx
git commit -m "feat(roleplay): integrate voice speaking response into conversational roleplay"
```

---

### Task 9: E2E Playwright Suite & Full System Verification

**Files:**
- Create: `tests/e2e/pronunciation-game.spec.ts`

**Interfaces:**
- Consumes: Entire application build and Playwright runner
- Produces: Complete end-to-end browser verification

- [ ] **Step 1: Write Playwright E2E test**

Create `tests/e2e/pronunciation-game.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Pronunciation Lab E2E Flow', () => {
  test('navigates from homepage to pronunciation lab and switches topics', async ({ page }) => {
    await page.goto('/');
    
    // Find pronunciation card
    const gameLink = page.getByRole('link', { name: /phòng luyện phát âm/i });
    await expect(gameLink).toBeVisible();
    await gameLink.click();

    await expect(page).toHaveURL('/games/pronunciation');
    await expect(page.getByRole('heading', { name: /phòng luyện phát âm/i })).toBeVisible();

    // Switch topic to workplace words
    const topicBtn = page.getByRole('button', { name: /từ vựng công sở/i });
    await topicBtn.click();
    await expect(page.getByText(/schedule/i)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run verification commands**

Run:
1. `npm run lint` -> 0 errors
2. `npx tsc --noEmit` -> 0 errors
3. `npm run test:run` -> All 197+ suites pass
4. `npx playwright test tests/e2e/pronunciation-game.spec.ts` -> E2E pass

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/pronunciation-game.spec.ts
git commit -m "test(e2e): add Playwright test suite for pronunciation lab"
```
