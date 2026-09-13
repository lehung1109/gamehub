# Phase 30 Design Spec: Phonics Magic Academy & Wizard Spellcraft Studio (Học Viện Phép Thuật & Thần Chú Ngữ Âm)

## 1. Overview & Pedagogical Purpose
**Phonics Magic Academy** (`/magic`) is an enchanting spellcraft and wizardry learning experience where young apprentices enroll in the ancient school of magic guided by **Archmage Merlin 🧙‍♂️** and his mystical owl familiar **Oliver 🦉**.

Apprentices channel their linguistic powers across 4 Elemental Towers (Fire, Water, Air, Earth) to assemble phonics runes, cast elemental spells in the Wand Incantation Chamber, unlock mystical creatures, and compile the **Ancient Grimoire (Sách Ma Thuật Cổ)**.

### Key Pedagogical Pillars
1. **Systematic Phonics Spellcraft Progression**:
   - **Fire Tower (Tháp Lửa)**: Short vowels & CVC ignition runes (`HOT`, `RED`, `SUN`).
   - **Water Tower (Tháp Nước)**: Consonant digraphs & liquid consonant blends (`SPLASH`, `RAIN`, `WAVE`).
   - **Air Tower (Tháp Gió)**: Vowel teams, long vowels & Magic E (`BREEZE`, `CLOUD`, `STORM`).
   - **Earth Tower (Tháp Đất)**: Compound words & multi-syllabic runic incantations (`CRYSTAL`, `MUSHROOM`, `EARTHQUAKE`).
2. **Multi-Sensory Audio-Visual Feedback**:
   - Spoken spell pronunciation and phonics breakdown powered by `useSpeech`.
   - Sparkling wand glow animations, rune bubble tile clicks, and mystical sound synthesizer chimes.
3. **Ancient Grimoire (Sách Ma Thuật Cổ)**:
   - Dynamic modal compendium showcasing all 12 elemental spells with syllable breakdown, phonics rules, and mystical lore.
4. **Kid-Friendly Typography Standard**:
   - Minimum font size $\ge 16$px (`text-base`, `text-lg`, `text-xl`, etc.) throughout all components.
   - Strictly zero `text-xs`, `text-sm`, or sub-16px inline values.

---

## 2. Architecture & Data Contracts

### 2.1 Type Definitions (`src/types/phonics-magic.ts`)
```typescript
export type ElementalTowerId = 'fire' | 'water' | 'air' | 'earth';

export type WizardRank = 'apprentice_wizard' | 'master_sorcerer' | 'grand_archmage';

export interface MagicChallenge {
  targetWord: string;
  phonicsFocus: string;
  vietnameseMeaning: string;
  phoneticBreakdown: string[];
  audioHint: string;
  magicalLore: string;
  runeScramble: string[];
}

export interface MagicSpell {
  id: string;
  towerId: ElementalTowerId;
  nameEn: string;
  nameVi: string;
  spellEmoji: string;
  incantationName: string;
  manaCost: number;
  descriptionVi: string;
  challenge: MagicChallenge;
}

export interface ElementalTowerDefinition {
  id: ElementalTowerId;
  nameEn: string;
  nameVi: string;
  elementEmoji: string;
  themeColor: string;
  bgGradient: string;
  descriptionVi: string;
  requiredSpells: number;
}

export interface MagicProgress {
  completedSpellIds: string[];
  currentTower: ElementalTowerId;
  manaCrystals: number;
  wizardRank: WizardRank;
  lastPlayedAt: string;
}
```

### 2.2 Curated Dataset (`src/data/magic/spells.ts`)
- 4 elemental towers:
  - `fire`: 3 spells (`HOT`, `RED`, `SUN`)
  - `water`: 3 spells (`SPLASH`, `RAIN`, `WAVE`)
  - `air`: 3 spells (`BREEZE`, `CLOUD`, `STORM`)
  - `earth`: 3 spells (`CRYSTAL`, `MUSHROOM`, `EARTHQUAKE`)
- Total: 12 curated elemental magic spells.

### 2.3 Pure Engine (`src/lib/phonics-magic-engine.ts`)
- `getAllTowers()`: Returns 4 elemental tower definitions.
- `getTowerById(id)`: Returns specific tower definition.
- `getAllSpells()`: Returns all 12 spells.
- `getSpellById(id)`: Returns specific spell by ID.
- `getSpellsByTower(towerId)`: Returns spells filtered by elemental tower.
- `calculateWizardRank(completedCount)`:
  - $< 4$: `apprentice_wizard` (Pháp Sư Tập Sự 🪄)
  - $4 - 8$: `master_sorcerer` (Phù Thủy Tinh Anh 🔮)
  - $9 - 12$: `grand_archmage` (Đại Pháp Sư Tối Cao 🧙‍♂️)
- `getDefaultMagicProgress()`: Initial progress state.
- `completeMagicSpell(progress, spellId)`: Pure function updating completed spells, mana crystals (+50), and rank.

### 2.4 Server Actions (`src/app/actions/phonics-magic.ts`)
- `getMagicProgressAction()`: Safely retrieves progress or default.
- `saveMagicProgressAction(progress)`: Validates and persists progress.

---

## 3. Component Hierarchy (`src/components/magic/`)
1. `MagicHeaderBar`:
   - Wizard Rank Badge with icon, Spell Counter (`X/12`), Mana Crystals counter (`🔮`), Grimoire trigger button (`📜 Sách Ma Thuật`), Reset button.
2. `MagicTowerSelector`:
   - 4 elemental tower tabs with element emojis, required spell thresholds, and lock/unlock indicators.
3. `WandIncantationModal`:
   - Interactive spellcasting chamber.
   - Elemental spell animation, Archmage audio pronunciation via `useSpeech`, floating rune tiles, clear and cast buttons.
4. `AncientGrimoireModal`:
   - Mystical grimoire book displaying all 12 elemental spell parchment cards with pronunciations, syllables, and magic lore.
5. `PhonicsMagicExperience`:
   - Orchestrates tower selection, spell launching, incantation modal, grimoire modal, and synthesizer audio feedback.

---

## 4. UI/UX & Strict Typography Standards
- Mystical wizard dark fantasy theme (`bg-slate-950`, `border-purple-500/30`, `text-purple-200`, `text-amber-300`).
- Strict minimum font size $\ge 16$px (`text-base` minimum, headings `text-xl` to `text-4xl`).
- High-contrast interactive elements $\ge 48$px touch targets.
- Stable CSS animations (no `animate-bounce` on interactive clickable elements).

---

## 5. Verification Strategy
1. **TypeScript Verification**: `npx tsc --noEmit` (zero errors).
2. **ESLint Verification**: `npm run lint` (zero warnings, zero errors).
3. **Vitest Unit & Component Tests**:
   - `tests/unit/types/phonics-magic-types.test.ts`
   - `tests/unit/lib/phonics-magic-engine.test.ts`
   - `tests/unit/actions/phonics-magic.test.ts`
   - `tests/components/magic/PhonicsMagicExperience.test.tsx`
   - `tests/app/magic/page.test.tsx`
4. **Playwright E2E Test**:
   - `tests/e2e/phonics-magic-academy.spec.ts` (navigates from homepage, casts spell, unlocks grimoire, audits typography $\ge 16$px).
5. **Full Regression & Build**:
   - `npm run test:run` (100% passing across 380+ test files).
   - `npm run build` (Turbopack production build passing 96+ routes).
