# Design Specification: Phase 27 - Phonics Kitchen & Junior MasterChef Academy

## 1. Overview & Vision
The **Phonics Kitchen & Junior MasterChef Academy** (`/kitchen`) immerses young learners into an interactive, culinary-themed English language adventure. Hosted by **Head Chef Pierre 🧑‍🍳 & Sous-Chef Bella 👩‍🍳**, students step into the bustling kitchen of a world-class restaurant to prepare delicious dishes across 4 culinary stations.

By identifying phonetic ingredients, blending onsets and rimes, recognizing vowel teams, and segmenting syllables, students cook signature dishes, serve eager guests, and climb the ranks from **Apprentice Cook (Phụ Bếp Nhí)** to **Executive MasterChef (Bếp Trưởng Thần Bếp)**!

---

## 2. Core Feature Requirements

### 2.1 4 Culinary Stations & Recipes (`KitchenStation`)
1. **Italian Pizzeria & Pasta Stand (`pizzeria`)**:
   - **Phonics Target**: Short Vowels & CVC Word Blending.
   - **Dishes**:
     - 🍕 *Margherita Pizza*: Ingredient blend `H-A-M` (Ham) + `F-I-G` (Fig).
     - 🍝 *Creamy Pasta*: Ingredient blend `E-G-G` (Egg) + `P-O-T` (Pot).
     - 🥖 *Garlic Bread*: Ingredient blend `B-U-N` (Bun) + `J-A-M` (Jam).
   - **Theme**: Warm terracotta oven, rolling pins, basil leaves.

2. **Tokyo Sushi & Noodle Bar (`sushi-bar`)**:
   - **Phonics Target**: Consonant Digraphs & Initial Blends (`SH`, `CH`, `CR`, `BL`).
   - **Dishes**:
     - 🍣 *Salmon Nigiri*: Digraph `SH` in `FI-SH` + `CH` in `CHOP`.
     - 🍤 *Crispy Tempura*: Blend `CR` in `CRAB` + `SHR` in `SHRIMP`.
     - 🍜 *Hot Ramen Bowl*: Blend `BL` in `BLACK PEPPER` + `CH` in `CHICKEN`.
   - **Theme**: Bamboo cutting boards, ceramic bowls, nori seaweed.

3. **Parisian Bakery & Sweet Desserts (`bakery-dessert`)**:
   - **Phonics Target**: Vowel Teams & Silent Magic E (`AI`, `EA`, `OA`, `A_E`, `I_E`).
   - **Dishes**:
     - 🎂 *Birthday Cake*: Magic E `C-A-K-E` + `L-I-M-E`.
     - 🥧 *Fruit Pie*: Vowel team `P-I-E` + `P-E-A-C-H`.
     - 🥞 *Fluffy Pancakes*: Vowel team `C-R-E-A-M` + `T-O-A-S-T`.
   - **Theme**: Pastel mixing bowls, golden ovens, sprinkle jars.

4. **Fiesta Taco & Fresh Cantina (`taco-cantina`)**:
   - **Phonics Target**: Multi-Syllable Segmentation & Compound Food Words.
   - **Dishes**:
     - 🌮 *Crispy Taco*: Syllable count `A-VO-CA-DO` (4 syllables) + `SAL-SA` (2 syllables).
     - 🌯 *Super Burrito*: Compound word `PAN-CAKE` + `WATER-MELON`.
     - 🍹 *Tropical Smoothie*: Syllable count `STRAW-BER-RY` (3 syllables) + `MAN-GO` (2 syllables).
   - **Theme**: Colorful sombreros, lime wedges, vibrant kitchen counters.

---

### 2.2 Interactive Cooking Loop (`KitchenStationModal` & `CookingWorkbench`)
1. **Selecting a Dish**:
   - Within each station, 3 signature recipes are displayed.
   - Mastered recipes display a Golden Cloche Cover / Chef Star ⭐.
2. **Ingredient Preparation & Phonics Challenge**:
   - Chef Pierre prompts via `useSpeech`: *"To bake this dish, which phonetic ingredient do we need next?"*
   - Visual culinary preparation area: Mixing pot / Sizzling pan / Baking oven.
   - Multi-choice phonetic options (e.g. "Pick the ingredient with digraph /ʃ/: `FISH`, `BEEF`, `PORK`").
   - Instant audio & visual feedback:
     - Correct: Sizzling/bubbling chime sound, ingredient drops into the pot with splash animation.
     - Incorrect: Warning sound, Chef encourages: "Check the sound carefully and try again!".
3. **Dish Completion & Plating Fanfare**:
   - When all ingredients are successfully added, the completed dish is plated with sparkle animations.
   - Awards **MasterChef Stars ⭐** and updates the recipe in the **MasterChef Recipe Book (Sổ Tay Công Thức)**.
4. **MasterChef Ranks**:
   - **Apprentice Cook (Phụ Bếp Nhí) 🥄**: 0 - 3 recipes mastered.
   - **Sous Chef (Bếp Phó Tài Ba) 🍳**: 4 - 8 recipes mastered.
   - **Executive MasterChef (Bếp Trưởng Thần Bếp) 🌟**: 9 - 12 recipes mastered.

---

### 2.3 Strict Kid-Friendly Typography Policy
- Minimum font size: strictly $\ge 16$px (`text-base`, `text-lg`, `text-xl`, etc.).
- Strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.
- Large touch targets ($\ge 48$px).

---

### 2.4 TypeScript 5 Contracts & Pure Engine
- All types strictly defined in `src/types/phonics-kitchen.ts` with zero `any`.
- Pure business logic in `src/lib/phonics-kitchen-engine.ts`.
- Server Actions in `src/app/actions/phonics-kitchen.ts`.
