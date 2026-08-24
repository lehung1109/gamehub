# Implementation Plan: Hoàn Thiện Thì Hiện Tại Đơn (Complete Present Simple)

**Branch**: `009-complete-present-simple` | **Date**: 2026-08-24 | **Spec**: [spec.md](file:///F:/projects/gamehub/specs/009-complete-present-simple/spec.md)

**Input**: Feature specification from `/specs/009-complete-present-simple/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Mở rộng ngân hàng câu hỏi cho 3 chặng của thì Hiện Tại Đơn (Conjugation: 15 câu, Error Hunting: 12 câu, Sentence Building: 12 câu) và áp dụng cơ chế chọn ngẫu nhiên tập con câu hỏi (lần lượt 8, 6, 6) mỗi phiên luyện tập. Lưu session ID trong `sessionStorage` để giữ nguyên bộ câu hỏi khi reload trang.

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Tailwind CSS, shadcn/ui, dnd-kit

**Storage**: localStorage (existing progress tracking), sessionStorage (new: question set persistence for active sessions)

**Testing**: Vitest + React Testing Library, Playwright

**Target Platform**: Web browsers

**Project Type**: Next.js Web application

**Performance Goals**: Minimal overhead for shuffling arrays of ~15-20 items on the client.

**Constraints**: Must maintain backward compatibility with old `localStorage` progress tracking (keep session lengths exactly 8, 6, and 6 questions). Must shuffle but keep the set stable upon page reload.

**Scale/Scope**: Expanding JSON data file to 39 total items, adding a randomize utility, updating the 3 stage components to use the utility + `sessionStorage`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Next.js App Router: Compliant (using existing `app/` architecture).
- TypeScript-First: Compliant.
- Component-Driven UI: Compliant (using Tailwind).
- Test-First: Compliant (unit tests for shuffle utility, UI tests for stages).
- Task Generation Standards: Compliant (workflow will follow standards).

**Result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/009-complete-present-simple/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── learn/present-simple/ # Existing route
├── components/
│   └── stages/               # Stage components to update with randomization
├── data/
│   └── tenses/
│       ├── present-simple.json # To expand
│       └── index.json          # To verify challengeCount
├── lib/
│   └── utils.ts              # Location for shuffle utility
└── hooks/
    └── useSessionQuestions.ts # Custom hook for sessionStorage logic (new)

tests/
├── unit/                     # Unit tests for shuffle and hooks
└── e2e/                      # Playwright tests
```

**Structure Decision**: Standard Next.js application structure following existing conventions.

