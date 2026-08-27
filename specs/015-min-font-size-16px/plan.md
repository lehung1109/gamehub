# Implementation Plan: Đảm bảo Font Size không nhỏ hơn 16px Toàn Ứng Dụng

**Branch**: `015-min-font-size-16px` | **Date**: 2026-08-27 | **Spec**: [spec.md](file:///F:/projects/gamehub/specs/015-min-font-size-16px/spec.md)

**Input**: Feature specification from `/specs/015-min-font-size-16px/spec.md`

## Summary

Enforce a strict minimum font size of 16px (1rem) across the entire GameHub application (games, student profile widgets, admin dashboard, forms, and shared UI components). The technical approach leverages Tailwind CSS v4 `@theme inline` font-size overrides in `globals.css` (mapping `text-xs` and `text-sm` to 1rem/16px and line-height 1.5rem/24px), a base HTML/body typography declaration, replacement of hardcoded sub-16px arbitrary classes, and targeted padding/min-height adjustments for compact UI components (Button sm, Toggle sm, Badge, Tooltip) to prevent text clipping and maintain visual hierarchy.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Next.js 16.3.1 (App Router), React 19.2.8, Tailwind CSS v4 (via `@tailwindcss/postcss`), shadcn/ui v4.18.0

**Storage**: N/A — purely frontend styling and typography design system

**Testing**: Vitest 4.x + Testing Library 16.x (unit tests), Playwright 1.62.x (e2e tests)

**Target Platform**: Web browsers on desktop, tablet, and mobile (responsive 320px – 1920px+)

**Project Type**: Educational web application (games hub for children and school management)

**Performance Goals**: Zero increase in bundle size, 0 layout shifts (CLS), instantaneous CSS compilation

**Constraints**: Font size MUST never be $< 16\text{px}$ anywhere; no text clipping or overflow; visual hierarchy preserved via weight, color contrast, and badge containers

**Scale/Scope**: `globals.css`, ~8 components with hardcoded sub-16px styles, UI primitives (`button.tsx`, `toggle.tsx`, `badge.tsx`, `tooltip.tsx`), and automated test suites

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Next.js App Router | ✅ PASS | All changes remain in `app/` and `components/` structure |
| II. TypeScript-First | ✅ PASS | Strict TypeScript adhered to; zero `any` usage |
| III. Component-Driven UI (Tailwind + shadcn) | ✅ PASS | Utilizes Tailwind v4 `@theme inline` tokens and shadcn primitives; no custom ad-hoc CSS files |
| IV. Drag-and-Drop (dnd-kit) | ✅ PASS | dnd-kit boards maintained and tested for layout spacing compatibility |
| V. Test-First (NON-NEGOTIABLE) | ✅ PASS | Verification tests for font size invariant and component rendering included |
| VI. Task Generation Standards | ✅ PASS | Ready for structured decomposition into isolated subagent phases and review loops |

**Gate Result**: ✅ ALL GATES PASS — no violations, no complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/015-min-font-size-16px/
├── spec.md                              # Feature specification (approved)
├── plan.md                              # This file (/speckit-plan output)
├── research.md                          # Phase 0 output — theme & typography research
├── data-model.md                        # Phase 1 output — typography token model & sizing rules
├── quickstart.md                        # Phase 1 output — runnable validation guide
├── contracts/
│   └── typography-contract.md           # Phase 1 output — computed font size & UI contracts
├── checklists/
│   └── requirements.md                  # Spec quality checklist
└── tasks.md                             # Phase 2 output (/speckit-tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css                      # @theme inline: --text-xs, --text-sm, base rules
│   └── games/
│       └── numbers-colors/page.tsx      # Replace sub-16px arbitrary classes
├── components/
│   ├── ui/
│   │   ├── button.tsx                   # Update sm size height & font-size
│   │   ├── toggle.tsx                   # Update sm size height & font-size
│   │   ├── badge.tsx                    # Ensure padding & line-height
│   │   └── tooltip.tsx                  # Ensure padding & min font size
│   ├── StudentProfileBadge.tsx          # Replace text-[10px] with text-xs (16px)
│   ├── student/
│   │   └── StudentBadge.tsx             # Replace text-[10px], text-[11px]
│   └── tenses/
│       ├── TenseLessonContainer.tsx     # Replace text-[10px] badges
│       └── QuickRulesTab.tsx            # Replace text-[10px], text-[11px] formulas
tests/
├── unit/                                # Unit tests verifying font-size computed values
└── e2e/                                 # Visual and navigation e2e test suite
```

**Structure Decision**: Single Next.js project. Modifications are confined to `globals.css`, UI primitives in `src/components/ui/`, and specific game/widget components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations. Table omitted.)*
