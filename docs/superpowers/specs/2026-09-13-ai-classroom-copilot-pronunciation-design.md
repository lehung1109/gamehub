# Phase 14 Technical Design: AI Classroom Co-Pilot & Automated Phoneme-Level Pronunciation Assessment

**Date:** 2026-09-13  
**Status:** Approved  
**Author:** Antigravity AI  

---

## 1. Overview & Pedagogical Motivation

In primary school English education (grades 1–5), Vietnamese young learners encounter systematic pronunciation obstacles due to phonological transfer from Vietnamese:
1. **Dropped Final Consonants**: Vietnamese syllables rarely end in unreleased stops or fricatives like English (`/s/`, `/t/`, `/k/`, `/d/`, `/z/`, `/ʃ/`), causing students to say *"li"* for *"like"* or *"ca"* for *"cat"*.
2. **Dental Fricative Substitution**: English `/θ/` and `/ð/` are frequently substituted with `/s/`, `/t/`, or `/d/` (*"sink"* for *"think"*, *"dis"* for *"this"*).
3. **Consonant Cluster Simplification**: Tri-consonant clusters (`/str/`, `/spl/`, `/spr/`) are broken or truncated (*"se-tret"* for *"street"*).

Whole-word string matching (Levenshtein distance) is inadequate because a student might say "lik" for "like" and receive high similarity, yet miss the crucial final consonant phoneme.

**Phase 14 solves this with two complementary systems:**
1. **Automated Phoneme-Level Assessment Engine**: Granular IPA phonemic segmentation with specific detection for dropped endings and Vietnamese ESL speech patterns, providing instant color-coded visual feedback (Green = Perfect, Yellow = Near, Red = Mispronounced, Gray = Omitted Ending).
2. **Teacher AI Classroom Co-Pilot**: An intelligent assistant directly embedded in the Teacher Admin Center that:
   - Transforms natural language prompts (e.g., *"Tạo 8 câu trắc nghiệm và phát âm về Animals & Habitats cho học sinh lớp 3"*) into ready-to-launch polymorphic Live Arena games.
   - Diagnoses class-wide weak phonemes and generates 15-minute targeted remediation lesson plans and practice worksheets.

---

## 2. Architecture & Data Flow

```
[Student Micro-Challenge: Pronunciation / Speaking]
               │
               ▼ Audio Recording & Speech Tokens
  [Phoneme Assessment Engine: src/lib/phoneme-evaluator.ts]
               │
               ├───► 1. Phoneme Tokenizer (Word -> CMU/IPA Phonemes)
               ├───► 2. Vietnamese ESL Pattern Analysis:
               │        - Dropped Ending Sound Check (/s/, /z/, /t/, /d/, /k/, /tʃ/)
               │        - Voicing & Fricative Substitution (/θ/ vs /s/, /ð/ vs /d/)
               │        - Vowel Duration & Cluster Intactness
               ▼
  [Output: PhonemeAssessmentResult]
  - Overall accuracy (0-100%)
  - Phoneme-by-phoneme breakdown: [ { phoneme: 'k', ipa: '/k/', status: 'omitted', tipVi: 'Nhớ bật âm đuôi /k/...' } ]
  - Pronunciation Badge / Stars
               │
               ▼
[Visualizer: PhonemeVisualizer.tsx] ──► Color-coded tiles with tap-to-hear native phoneme audio

─────────────────────────────────────────────────────────────────────────

[Teacher Dashboard: AI Classroom Co-Pilot: AiClassroomCopilot.tsx]
               │
               ▼ Prompt: "Tạo đấu trường 8 câu chủ đề Solar System lớp 5"
  [Server Action: generateArenaQuestionsFromPromptAction]
               │
               ├───► 1. Synthesizes 4-Choice, True/False, and Phonics Audio questions
               ├───► 2. Automatically validates CEFR vocabulary grade levels
               ▼
  [Generated Arena Payload] ──► 1-Click "Mở Đấu Trường Trực Tiếp (Live Arena)"

               │
               ▼ Action: "Tạo Giáo Án Khắc Phục Lỗi Sai Phát Âm Cho Lớp"
  [Server Action: generateRemediationLessonPlanAction]
               │
               └───► Identifies top 3 struggling phonemes in class
                     Generates structured 15-min warm-up routine & tongue-twisters
```

---

## 3. Data Contracts (`src/types/ai-copilot.ts`)

```ts
export type PhonemeStatus = 'perfect' | 'near' | 'incorrect' | 'omitted'

export interface PhonemeBreakdown {
  phoneme: string
  ipa: string
  type: 'vowel' | 'consonant' | 'cluster'
  status: PhonemeStatus
  score: number // 0 to 100
  tipVi?: string
}

export interface PhonemeAssessmentResult {
  targetWord: string
  transcribedText: string
  accuracy: number // 0 - 100
  stars: 1 | 2 | 3
  isPassed: boolean
  hasDroppedFinalSound: boolean
  phonemes: PhonemeBreakdown[]
  overallFeedbackVi: string
  remediationAdviceVi: string
}

export interface CopilotLessonPlan {
  id: string
  title: string
  targetGrade: string
  durationMinutes: number
  focusPhonemes: string[]
  warmUpTongueTwister: string
  interactiveActivity: string
  recommendedGames: string[]
  teacherScriptVi: string
}

export interface GenerateArenaPromptInput {
  prompt: string
  gradeLevel?: 'grade-1' | 'grade-2' | 'grade-3' | 'grade-4' | 'grade-5'
  questionCount?: number // Default 5 to 10
}
```

---

## 4. Phoneme Evaluation Algorithm

1. **Dictionary & Grapheme-to-Phoneme (G2P) Table**:
   - Comprehensive phoneme decomposition map for K-12 primary English vocabulary.
   - Covers irregular consonants, diphthongs (`/aɪ/`, `/eɪ/`, `/oʊ/`), and common clusters (`/bl/`, `/str/`, `/sp/`).
2. **Vietnamese ESL Pattern Matchers**:
   - **Dropped Final Stop / Fricative Rule**: If target word ends in `/s/`, `/z/`, `/t/`, `/d/`, `/k/`, `/p/`, `/tʃ/`, `/dʒ/` and transcribed input lacks ending representation, flag status as `'omitted'` with specific remediation tip.
   - **Dental Fricative Check**: Detects `/θ/` rendered as `s`/`t` and `/ð/` rendered as `d`/`z`.
   - **Silent Letter Tolerance**: Does not penalize students for silent letters (e.g. `k` in *knife*, `w` in *write*, `b` in *climb*).

---

## 5. UI Components & Student/Teacher Experience

1. **Student `PhonemeVisualizer.tsx`**:
   - Rendered below speaking prompts in Speaking Lab and Phonics Challenges.
   - Tactile interactive chips: clicking on any phoneme plays synthesized or native pronunciation of that exact phoneme.
   - Clear visual feedback using accessible color palettes and geometric symbols.
2. **Teacher `AiClassroomCopilot.tsx`**:
   - Tab 1: **"Trợ Lý Soạn Đề Live Arena"** - Generates customized Kahoot-style questions instantly from natural language prompts, ready to launch or edit.
   - Tab 2: **"Giáo Án Khắc Phục Lỗi Âm (Remediation Plan)"** - Analyzes class error patterns, outputs targeted warm-up tongue twisters and 15-minute structured lessons.

---

## 6. Kid-Friendly Typography Policy

- Strict minimum 16px font size across all screens (strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).
- Clean contrast ratios exceeding WCAG AA standards.

---

## 7. Verification Strategy

1. **Vitest Unit Tests**:
   - Grapheme-to-phoneme breakdown accuracy across vocabulary words.
   - Detection of dropped final consonants and phoneme status classification.
   - AI Arena question generator with deterministic fallbacks.
   - Teacher lesson plan synthesis.
2. **Playwright E2E Tests**:
   - Teacher navigating to AI Classroom Co-Pilot, inputting prompt, generating Live Arena questions.
   - Student speaking visualizer rendering phoneme breakdown without forbidden text sizes.
