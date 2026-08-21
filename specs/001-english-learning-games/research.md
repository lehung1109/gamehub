# Research: English Learning Games for Kids

**Feature Branch**: `001-english-learning-games` | **Date**: 2026-08-20

## 1. Framework & Runtime

### Decision: Next.js 16.x with App Router

- **Version**: Next.js 16.3.x (latest stable, August 2026)
- **Runtime**: Node.js 20.9.0+ (required minimum)
- **Bundler**: Turbopack (default in 16.x — 2-5x faster builds, sub-second HMR)
- **React**: React 19.2 with Server Components by default

**Rationale**: Next.js 16 is the latest stable release with mature App Router, Turbopack as default, and React 19.2 support. The App Router provides file-based routing, layouts, loading states, and error boundaries that map perfectly to the game hub's page-per-game architecture.

**Alternatives Considered**:
- Next.js 15.x: Previous stable, superseded by 16. Missing Turbopack as default bundler, proxy.ts, and latest React 19.2 features.
- Pages Router: Legacy routing paradigm. Lacks React Server Components, streaming, and Server Actions.
- Vite + React Router: More manual setup, no built-in SSG/ISR, no file-based routing.

## 2. Language & Type System

### Decision: TypeScript (strict mode)

- **Config**: `strict: true` in `tsconfig.json`
- **Approach**: All source files as `.ts` / `.tsx`

**Rationale**: User requirement. TypeScript provides compile-time safety for the data models (words, letters, numbers, colors, sentences) and ensures prop type correctness across game components.

## 3. Styling

### Decision: Tailwind CSS v4.x (CSS-first architecture)

- **Version**: Tailwind CSS v4.3.x (latest stable)
- **Setup**: CSS-first via `@import "tailwindcss"` + `@theme` directive — **no `tailwind.config.js`**
- **Build**: Uses `@tailwindcss/postcss` plugin with Lightning CSS engine
- **Content Detection**: Automatic (no `content` array needed)

**Rationale**: User requirement. Tailwind v4's CSS-first approach simplifies setup significantly. The `@theme` directive allows defining custom kid-friendly colors and animations directly in CSS. Lightning CSS engine provides sub-millisecond hot reload.

**Key Setup**:
```css
@import "tailwindcss";

@theme {
  --color-game-green: #58cc02;
  --color-game-red: #ff4b4b;
  --color-game-blue: #1cb0f6;
  --color-game-yellow: #ffc800;
  --color-game-purple: #ce82ff;
  --color-game-orange: #ff9600;
}
```

> **Note**: shadcn/ui theming uses OKLCH color variables in `globals.css` alongside Tailwind v4's `@theme` directive for perceptually uniform, wide-gamut colors across the kid-friendly palette.

**Alternatives Considered**:
- Tailwind CSS v3: Superseded. Uses legacy JS config, manual content array, slower builds.
- CSS Modules: More boilerplate, less utility-first, harder to maintain consistency.
- Styled Components / Emotion: Runtime overhead, not needed for static rendering.

## 4. Rendering Strategy

### Decision: Static Site Generation (SSG) with `output: 'export'`

- **Mode**: Full static HTML export for Vercel deployment
- **Dynamic Routes**: `generateStaticParams()` with `dynamicParams = false`
- **Data Source**: JSON files imported at build time — zero server runtime needed

**Rationale**: All game data is static JSON. No user accounts, no database, no server-side logic. Static export ensures:
- Fastest possible page loads (pre-rendered HTML)
- Zero server costs on Vercel free tier
- Works offline after initial page load (static assets cached by browser)

**Important Notes**:
- `params` in Next.js 16 is a `Promise` — must `await params` in Server Components
- `fetch()` defaults to `cache: 'no-store'` in Next.js 16 (not relevant since we import JSON directly)

## 5. Speech / Pronunciation

### Decision: Web Speech API (SpeechSynthesis) via custom React hook

- **API**: `window.speechSynthesis` (browser-native, zero dependencies)
- **Implementation**: `useSpeech()` custom hook with `'use client'` directive
- **Overlap Prevention**: `speechSynthesis.cancel()` before each new utterance (FR-016)
- **Rate**: `utterance.rate = 0.8` for children's comprehension
- **Browser Support Check**: `'speechSynthesis' in window` → fallback message (FR-018)

**Rationale**: Zero cost, zero external API calls, works offline on most browsers. The spec explicitly requires Web Speech API. System emoji + Web Speech API = true zero-asset architecture.

**Alternatives Considered**:
- Cloud TTS (Google Cloud, AWS Polly, ElevenLabs): Higher quality voices but adds API costs, latency, and network dependency.
- Pre-recorded audio files: Requires audio assets, increases bundle size, harder to extend.

## 6. Drag & Drop

### Decision: @dnd-kit library

- **Packages**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Bundle**: ~12kb gzipped total
- **Usage**:
  - Spelling game (letter-to-slot): `@dnd-kit/core` with `useDraggable` + `useDroppable`
  - Sentence building (word reorder): `@dnd-kit/sortable` with `SortableContext`
- **Sensors**: `TouchSensor` (delay: 50ms, tolerance: 8px) + `MouseSensor` (distance: 5px) + `KeyboardSensor`
- **Collision**: `closestCenter` for forgiving drop zones (important for kids)
- **Fallback**: Tap-to-select alternative for children who struggle with drag

**Rationale**: @dnd-kit is purpose-built for React, supports touch + mouse + keyboard natively, lightweight, and highly customizable. The `DragOverlay` component enables scaled/animated drag previews. `closestCenter` collision detection is forgiving for children's imprecise motor control.

**Alternatives Considered**:
- Native HTML5 DnD API + polyfill: Broken on mobile/touch, rigid visual previews, no built-in accessibility.
- react-beautiful-dnd: Deprecated/archived by Atlassian in 2024. Incompatible with React 19.
- @hello-pangea/dnd: Fork of rbd, limited to 1D lists — can't handle letter-to-slot dropping.
- Pragmatic DnD (Atlassian): Framework-agnostic, low-level, high boilerplate.
- Custom Pointer Events: Maximum effort, high bug risk, reinventing solved problems.

## 7. UI Component System

### Decision: shadcn/ui (latest, CLI v4) with Tailwind CSS v4

- **Framework**: shadcn/ui — copy-paste component collection, not a runtime dependency
- **CLI**: `npx shadcn@latest` (CLI v4, agent-aware with `--dry-run`, `--diff`, `--view`)
- **Primitives**: Base UI (default) with Radix UI fallback support
- **Color Format**: OKLCH (Lightness, Chroma, Hue) — perceptually uniform, wide gamut
- **Styling**: `data-slot` attribute for standardized styling hooks
- **Theming**: CSS variables in `globals.css`, compatible with Tailwind v4 `@theme inline` directive

**Components to Use**:

| Component | Use Case in GameHub |
|-----------|---------------------|
| `Button` | Navigation, speak buttons, quiz option buttons, back button |
| `Card` | Homepage game cards, flashcard display |
| `Tabs` | Numbers/Colors tab switching, Learn/Quiz mode switching |
| `Badge` | Topic labels, score indicators |
| `Dialog` | Feedback overlays (correct/wrong), speech unsupported warnings |
| `Progress` | Progress tracking within game sessions |
| `Toggle` | Learn/Quiz mode toggle |
| `Toggle Group` | Multiple choice quiz options |
| `Separator` | Visual section breaks between game areas |
| `Tooltip` | Hints and helper text for children |

**Setup**:
```bash
# Initialize shadcn in project
npx shadcn@latest init

# Add required components
npx shadcn@latest add button card tabs badge dialog progress toggle toggle-group separator tooltip
```

**Theming** (kid-friendly OKLCH palette in `globals.css`):
```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --primary: oklch(0.72 0.22 145);          /* Game Green (#58cc02) */
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.68 0.16 240);        /* Game Blue (#1cb0f6) */
  --secondary-foreground: oklch(1 0 0);
  --accent: oklch(0.85 0.18 85);            /* Game Yellow (#ffc800) */
  --accent-foreground: oklch(0.2 0 0);
  --destructive: oklch(0.63 0.24 25);       /* Game Red (#ff4b4b) */
  --destructive-foreground: oklch(1 0 0);
  --radius: 1.25rem;                        /* Bubbly rounded corners */
}
```

**Rationale**: shadcn/ui provides accessible, well-designed UI primitives with zero runtime dependency (components are copied into the project). It integrates natively with Tailwind CSS v4 and provides consistent styling through OKLCH CSS variables. Using shadcn components reduces custom UI code while maintaining full customization control. The `data-slot` attribute enables targeted styling. Components like `Dialog`, `Tabs`, and `Button` already handle accessibility (ARIA, keyboard navigation, focus management) via Radix/Base UI primitives.

**Alternatives Considered**:
- Custom components from scratch: More work, less consistent, no accessibility out-of-box.
- Chakra UI / Mantine: Runtime dependencies, larger bundle, conflict with Tailwind.
- Headless UI: Fewer components, less ecosystem support.
- Material UI: Heavy runtime, opinionated design system, conflicts with flat Duolingo style.

## 8. UI Design System

### Decision: Duolingo-style flat design with 3D tactile buttons

- **Touch Targets**: Minimum 48px, ideally 56-64px (`h-14` / `h-16`) for 6-7 year olds
- **Corners**: `rounded-2xl` / `rounded-3xl` for soft, friendly feel
- **Buttons**: Chunky 3D "push" buttons with `border-b-4` + `active:translate-y-1`
- **Colors**: High-saturation Duolingo-inspired palette (green, blue, yellow, orange, purple)
- **Typography**: `font-bold` / `font-extrabold`, base `text-lg` to `text-2xl`
- **Spacing**: Generous `p-4` to `p-8`, `gap-4` to `gap-6`
- **Emoji**: System emoji at `text-6xl` to `text-8xl` for illustrations
- **Feedback Animations**:
  - Correct: `animate-celebrate` / `animate-pop` + green background
  - Wrong: `animate-shake` / `animate-wiggle` + red background
  - Card flip: CSS `rotateY` transform with perspective
  - Rewards: `animate-bounce` on ⭐🎉

**Integration with shadcn/ui**: The Duolingo-style design will be applied as custom className overrides on shadcn components:
- `Button`: Add `border-b-4 active:translate-y-1 active:border-b-0` for 3D push effect
- `Card`: Add `rounded-3xl shadow-lg` for soft, friendly cards
- `Tabs`/`Toggle`: Custom kid-friendly sizing with `h-14` minimum touch targets
- All components: Override with custom OKLCH color variables for the game palette

**Rationale**: Children 6-7 need large, clearly distinguishable targets with immediate visual feedback. Duolingo's design is proven effective for language learning apps. Tactile 3D buttons provide clear affordance — children understand "this is pressable."

## 9. Testing Strategy

### Decision: Vitest (unit/component) + Playwright (E2E)

- **Unit/Component**: Vitest + React Testing Library + jsdom
- **E2E**: Playwright (Chromium, Firefox, WebKit — matching target browsers)
- **Coverage**: Component tests for game logic hooks; E2E for user flows

**Rationale**: Vitest is faster than Jest with native ESM/TS support. Playwright is recommended by Next.js and supports multi-browser testing including touch simulation. React Testing Library enables testing game hooks (useSpeech) and component interactions.

**Alternatives Considered**:
- Jest: Slower, requires complex ESM workarounds for Next.js App Router.
- Cypress: Heavier resource footprint, fewer browser targets than Playwright.

## 10. Responsive Design

### Decision: Mobile-first with Tailwind breakpoints

- **Base**: Styles for 360px (smallest mobile target)
- **Breakpoints**: `sm:` (640px), `md:` (768px tablets), `lg:` (1024px desktop)
- **Viewport**: `min-h-dvh` (dynamic viewport height — handles mobile browser chrome)
- **Safe Areas**: `env(safe-area-inset-*)` for notched devices
- **Orientation**: Support both portrait and landscape
- **Container Queries**: Available in Tailwind v4 for responsive game cards

**Rationale**: Target audience primarily uses tablets and phones. Mobile-first ensures the core experience is optimized for the most common device. Dynamic viewport units prevent layout jumps on mobile Safari/Chrome.

## 11. Deployment

### Decision: Vercel (free tier)

- **Output**: Static export (`output: 'export'` in `next.config.ts`)
- **Build**: `next build` generates static HTML/CSS/JS to `out/` directory
- **CDN**: Vercel Edge Network for global distribution
- **Cost**: Free tier supports static sites

**Rationale**: User requirement. Vercel is the native platform for Next.js. Static export on free tier has generous limits for an educational project. Zero server costs, zero ops.
