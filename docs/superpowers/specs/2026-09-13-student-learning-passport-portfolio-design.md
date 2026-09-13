# Design Spec: Phase 20 - Student Learning Passport, Audio-Visual Portfolio & Digital Graduation Ceremony (Hộ Chiếu Học Tập & Lễ Tốt Nghiệp Trực Tuyến Đa Phương Tiện)

**Date**: 2026-09-13  
**Status**: Approved (Autonomous Roadmap Execution)  
**Target Milestone**: Phase 20  

---

## 1. Overview & Vision

Phase 20 represents the crowning milestone of the GameHub learning ecosystem. It synthesizes all preceding learning achievements—mini-games, AI pronunciation tutoring, interactive comic storybooks, rhythm chants, and cooperative guild quests—into an official, interactive, and celebratory **Learning Passport & Digital Graduation Ceremony**.

### Key Pedagogical Pillars:
1. **Interactive Stamp Passport (`/passport`)**:
   - Designed like an international traveler's passport for young learners.
   - Earn golden stamps across 5 core disciplines:
     - 🎮 *Game Master*: Master 10+ mini-games.
     - 🎙️ *AI Speaking Prodigy*: Complete 3+ AI conversational scenarios.
     - 📖 *Comic Storyteller*: Voice-act in interactive comic adventures.
     - 🎵 *Karaoke Phonics Singer*: Perform rhythmic phonics chants on beat.
     - 🛡️ *Guild Hero*: Participate in weekly clan boss raids.
2. **Audio-Visual Voice Portfolio (Hồ Sơ Giọng Nói Nhí)**:
   - Preserves students' recorded voice clips and dialogues.
   - Allows students and parents to replay their spoken English over time, demonstrating real phonetic improvement and fluency confidence.
3. **Interactive Digital Graduation Ceremony (`/passport` & `/passport/graduate`)**:
   - Confetti shower and fanfare sound effects.
   - Unlocks the celebratory Golden Graduation Cap avatar.
   - Generates an official, printable English Mastery Certificate with QR code verification.
4. **Public Shareable Showcase Route (`/passport/[shareToken]`)**:
   - Parents can share their child's digital certificate and spoken portfolio with grandparents and friends on Zalo/Facebook.
5. **Strict Kid-Friendly Typography**:
   - Minimum font size $\ge 16$px across all passport views (strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`).

---

## 2. Core Architecture & Data Models

### 2.1 TypeScript Contracts (`src/types/passport.ts`)
```ts
export type StampCategory = 'games' | 'speaking' | 'stories' | 'chants' | 'guilds'

export interface PassportStamp {
  id: string
  category: StampCategory
  titleVi: string
  titleEn: string
  icon: string
  isUnlocked: boolean
  unlockedAt?: string
  criteriaVi: string
}

export interface VoicePortfolioItem {
  id: string
  titleVi: string
  type: 'story-dialogue' | 'phonics-chant' | 'ai-conversation'
  audioSampleText: string
  accuracyPercent: number
  recordedAt: string
  durationSeconds: number
}

export interface GraduationCertificate {
  certificateId: string
  studentName: string
  cefrLevelAchieved: 'Pre-A1' | 'A1' | 'A2'
  totalStars: number
  totalExp: number
  completedQuestsCount: number
  teacherCommendation: string
  issueDate: string
}

export interface StudentPassport {
  studentId: string
  studentName: string
  avatar: string
  gradeLevel: string
  stamps: PassportStamp[]
  voiceRecordings: VoicePortfolioItem[]
  certificate?: GraduationCertificate
  shareToken: string
}
```

### 2.2 Pure Passport Engine (`src/lib/passport-engine.ts`)
- `getStarterStamps()`: Default stamp collection.
- `calculatePassportCompletion(stamps)`: Percentage of unlocked stamps and graduation eligibility (e.g. $\ge 60\%$ unlocked).
- `evaluateNewStamps(currentStamps, stats)`: Unlocks pending stamps when milestones are reached.
- `createGraduationCertificate(studentName, stats)`: Generates certificate details with official serial ID.

---

## 3. Server Actions (`src/app/actions/passport.ts`)
- `getStudentPassportAction(studentId: string)`: Returns full passport state.
- `claimPassportStampAction(studentId: string, stampId: string)`: Unlocks a stamp.
- `triggerGraduationAction(studentId: string, studentName: string)`: Completes graduation and issues digital certificate.
- `getSharedPassportAction(shareToken: string)`: Retrieves public read-only showcase for parents.

---

## 4. UI Components & Routes
- `src/components/passport/PassportStampBook.tsx`: Stamp book visual grid with golden embossed unlock badges.
- `src/components/passport/VoicePortfolioPlayer.tsx`: Audio player for voice clips with text highlight.
- `src/components/passport/DigitalGraduationModal.tsx`: Modal with confetti, audio fanfare, and certificate preview.
- `src/components/passport/PassportHub.tsx`: Main dashboard.
- `src/app/passport/page.tsx`: Student passport route.
- `src/app/passport/[shareToken]/page.tsx`: Public showcase route.
- Topbar navigation integration in `src/app/page.tsx`.

---

## 5. Strict Quality Gates
- TypeScript 5 strict, zero `any`.
- Kid-friendly typography: $\ge 16$px font size everywhere.
- 100% Vitest test pass rate.
- Playwright E2E test verifying passport viewing, voice playback, graduation ceremony, and typography audit.
