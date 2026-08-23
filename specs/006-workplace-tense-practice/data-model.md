# Data Model: Workplace English Tense Practice

## Overview

This document formalizes the entity structures, types, validation rules, and state machine transitions for the Workplace English Tense Practice feature. All data models are 100% decoupled from legacy game schemas and reside in `src/types/tenses.ts` and `src/data/tenses/`.

---

## 1. Entities & Type Definitions

### 1.1 TenseMetadata
Represents high-level metadata for each of the 12 English tenses displayed on the Hub map (`/tenses`).

```typescript
export type TenseGroup = "present" | "past" | "future";
export type TenseStatus = "active" | "coming_soon";
export type TenseLevel = "A1-A2 (Beginner)" | "B1-B2 (Intermediate)" | "C1-C2 (Advanced)";

export interface TenseMetadata {
  id: string; // e.g. "present-simple"
  slug: string; // e.g. "present-simple"
  name: string; // e.g. "Present Simple"
  vietnameseName: string; // e.g. "Thì Hiện Tại Đơn"
  group: TenseGroup; // "present" | "past" | "future"
  status: TenseStatus; // "active" | "coming_soon"
  level: TenseLevel;
  badge?: string; // e.g. "Cốt lõi cho người đi làm"
  description: string; // e.g. "Diễn tả thói quen, lịch trình và quy trình công việc"
  estimatedMinutes: number; // e.g. 10
  challengeCount: number; // e.g. 20 (sum of all 3 stages)
}
```

### 1.2 GrammarRuleCard (Quick Rules)
Represents a concise cheat-sheet card for grammar rules shown in the "Quy Tắc Cốt Lõi" tab.

```typescript
export interface RuleFormula {
  label: string; // e.g. "Khẳng định (+)", "Phủ định (-)", "Nghi vấn (?)"
  structure: string; // e.g. "S + V(s/es) + O"
  example: string; // e.g. "She manages the marketing team."
  vietnameseTranslation: string; // e.g. "Cô ấy quản lý đội ngũ tiếp thị."
}

export interface GrammarRuleCard {
  id: string; // e.g. "action-verbs-formula"
  category: "to-be" | "action-verbs" | "spelling-rules" | "adverbs-frequency" | "workplace-usage";
  titleVi: string; // e.g. "Cấu Trúc Động Từ Thường"
  titleEn: string; // e.g. "Action Verbs Structure"
  summaryVi: string; // Short summary
  formulas?: RuleFormula[];
  rulesList?: Array<{
    ruleVi: string;
    condition: string;
    examples: Array<{
      en: string;
      vi: string;
      note?: string;
    }>;
  }>;
  workplaceTips?: string[];
}
```

### 1.3 ConjugationItem (Stage 1: Chia Động Từ Email & Ngữ Cảnh)
Represents an in-context verb conjugation exercise.

```typescript
export type WorkplaceContextType = "email" | "meeting" | "routine" | "report" | "chat";

export interface ConjugationItem {
  id: string; // e.g. "conj-01"
  contextType: WorkplaceContextType;
  scenarioVi: string; // e.g. "Email thông báo lịch họp phòng ban"
  
  // Display components of the email / context
  sender?: string; // e.g. "HR Department <hr@company.com>"
  recipient?: string; // e.g. "All Staff <all@company.com>"
  subject?: string; // e.g. "Weekly Progress Update"
  
  // Sentence / Paragraph with blanks
  textBefore: string; // e.g. "Our team "
  baseVerb: string; // e.g. "meet"
  textAfter: string; // e.g. " every Monday morning at 9:00 AM to review project deadlines."
  
  // Validation & Feedback
  correctAnswer: string; // e.g. "meets"
  acceptableAlternatives?: string[]; // e.g. ["MEETS"]
  options: string[]; // e.g. ["meet", "meets", "meeting", "is meet"]
  explanation: {
    ruleVi: string; // e.g. "Chủ ngữ 'Our team' (ngôi thứ 3 số ít) đi với động từ thêm 's/es'."
    detailedAnalysisVi: string; // Detailed breakdown of why other choices are incorrect
  };
}
```

### 1.4 ErrorHunterItem (Stage 2: Săn Lỗi Sai Văn Phòng)
Represents an interactive proofreading exercise where learners identify the incorrect word token in a workplace sentence and replace it with the correct form.

```typescript
export interface ErrorTokenOption {
  value: string; // e.g. "does not agree"
  label: string; // Display label
  isCorrect: boolean;
}

export interface ErrorHunterItem {
  id: string; // e.g. "err-01"
  scenarioVi: string; // e.g. "Trao đổi ý kiến trong cuộc họp dự án"
  
  // Sentence broken into interactive tokens
  tokens: string[]; // e.g. ["She", "don't", "agree", "with", "the", "client's", "new", "proposal."]
  errorTokenIndex: number; // 1 (pointing to "don't")
  
  correctToken: string; // e.g. "doesn't"
  options: ErrorTokenOption[]; // e.g. ["doesn't", "isn't", "don't", "not"]
  
  fullCorrectSentence: string; // e.g. "She doesn't agree with the client's new proposal."
  vietnameseMeaning: string; // e.g. "Cô ấy không đồng ý với đề xuất mới của khách hàng."
  
  explanation: {
    whyWrongVi: string; // e.g. "'Don't' là dạng phủ định cho I/You/We/They. Chủ ngữ 'She' là ngôi thứ 3 số ít, cần dùng 'doesn't'."
    workplaceImpactVi: string; // e.g. "Trong giao tiếp kinh doanh, nhầm lẫn 'don't/doesn't' làm giảm tính chuyên nghiệp của người viết."
  };
}
```

### 1.5 SentenceBuilderItem (Stage 3: Ghép Câu Lịch Trình & Giao Tiếp)
Represents a scrambled sentence exercise combining drag-and-drop or tap-to-select interaction.

```typescript
export interface SentenceBuilderItem {
  id: string; // e.g. "sb-01"
  scenarioVi: string; // e.g. "Lịch trình phỏng vấn nhân sự"
  vietnameseMeaning: string; // e.g. "Người quản lý nhân sự luôn kiểm tra CV trước khi bắt đầu phỏng vấn."
  
  scrambledTokens: Array<{
    id: string; // Unique token ID, e.g. "tok-1", "tok-2"
    text: string; // e.g. "The HR manager"
  }>;
  
  correctTokenOrder: string[]; // Array of token texts in exact order: ["The HR manager", "always", "reviews", "resumes", "before", "the interview."]
  fullSentenceEn: string; // e.g. "The HR manager always reviews resumes before the interview."
  
  grammarTip: {
    titleVi: string; // e.g. "Vị trí trạng từ chỉ tần suất"
    tipVi: string; // e.g. "'Always' đứng TRƯỚC động từ thường 'reviews' và SAU chủ ngữ."
  };
}
```

### 1.6 TenseModuleData (Master Lesson Container)
Root container bundling all metadata, cheat sheets, and challenge stages for a specific tense.

```typescript
export interface TenseModuleData {
  metadata: TenseMetadata;
  quickRules: GrammarRuleCard[];
  challenges: {
    conjugation: ConjugationItem[];
    errorHunting: ErrorHunterItem[];
    sentenceBuilding: SentenceBuilderItem[];
  };
}
```

### 1.7 TenseUserProgressRecord (Local Storage State)
Represents the user's persisted learning state in `localStorage`.

```typescript
export interface StageProgress {
  score: number;
  total: number;
  passed: boolean;
  completedAt?: string; // ISO 8601
}

export interface TenseUserProgressRecord {
  tenseId: string; // e.g. "present-simple"
  completed: boolean;
  stageScores: {
    conjugation: StageProgress;
    errorHunting: StageProgress;
    sentenceBuilding: StageProgress;
  };
  totalScore: number; // e.g. 18
  maxPossibleScore: number; // e.g. 20
  accuracyPercentage: number; // e.g. 90
  lastStudiedAt: string; // ISO 8601
}

export type TensesProgressMap = Record<string, TenseUserProgressRecord>;
```

---

## 2. Validation Rules

1. **Conjugation Questions**:
   - `options` MUST contain between 3 and 4 items.
   - `correctAnswer` MUST match exactly one of the `options`.
   - String comparisons during answer submission MUST normalize leading/trailing whitespace and ignore case differences unless grammatically case-sensitive.
2. **Error Hunter Questions**:
   - `errorTokenIndex` MUST be `>= 0` and `< tokens.length`.
   - `options` MUST contain `correctToken` with `isCorrect === true`.
   - `options` MUST contain exactly one option with `isCorrect === true`.
3. **Sentence Builder Questions**:
   - `scrambledTokens.length` MUST equal `correctTokenOrder.length`.
   - All items in `correctTokenOrder` MUST exist in `scrambledTokens`.
   - `fullSentenceEn` MUST match the whitespace-joined tokens in `correctTokenOrder`.
4. **Data Decoupling**:
   - Tense modules MUST NOT import or depend on legacy `Game`, `Topic`, `Word`, or `Sentence` schemas from `src/types/index.ts`.
   - All tense data files MUST reside under `src/data/tenses/`.

---

## 3. Lesson State Machine & Stage Transitions

```
[ Hub: /tenses ]
       │
       ▼ (User clicks "Thì Hiện Tại Đơn")
[ Lesson Page: /tenses/present-simple ]
       │
       ├─────────────────────────────────────────┐
       ▼                                         ▼
[ Tab: Quick Rules (Lý Thuyết) ]        [ Tab: Practice (Luyện Tập) ]
       │                                         │
       │ (User starts practice)                  ▼
       └───────────────────────────────> [ Stage 1: Conjugation ] (8 questions)
                                                 │
                                                 ▼ (Complete Stage 1)
                                         [ Stage 2: Error Hunter ] (6 questions)
                                                 │
                                                 ▼ (Complete Stage 2)
                                         [ Stage 3: Sentence Builder ] (6 questions)
                                                 │
                                                 ▼ (Complete Stage 3)
                                         [ Completion Summary Dashboard ]
                                                 │
                                                 ├─► Save progress to LocalStorage
                                                 ├─► Retry / Replay specific stage
                                                 └─► Return to Hub (/tenses) with updated badge
```
