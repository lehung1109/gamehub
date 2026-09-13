# Design Specification: Phase 26 - Phonics Safari & Wildlife Nature Expedition

## 1. Overview & Vision
The **Phonics Safari & Wildlife Nature Expedition** (`/safari`) transports young ESL learners into a thrilling wildlife photography and field zoology adventure. Guided by **Ranger Leo 🦁 & Guide Maya 🧭**, students embark on safaris across 4 worldwide biomes to spot animals through binoculars, snap photos through a camera viewfinder, solve phonics & phonemic spelling challenges, and fill their **Wildlife Field Guide (Sổ Tay Bách Khoa Động Vật)**.

---

## 2. Core Feature Requirements

### 2.1 4 Worldwide Biomes (`SafariBiome`)
1. **African Savanna (Thảo Nguyên Savanna)** (`savanna`):
   - **Target Phonics**: Consonant Digraphs & Initial Blends (`PH`, `GR`, `BR`, `FL`).
   - **Animals**:
     - 🦁 **Lion** (Phonics: /l-aɪ-ən/, king of beasts)
     - 🐘 **Elephant** (Phonics: Digraph `PH` sounding like /f/)
     - 🦒 **Giraffe** (Phonics: Soft 'G' /dʒ/)
     - 🦓 **Zebra** (Phonics: Initial /z/)
   - **Theme**: Golden grasslands, acacia trees, warm sunset.

2. **Amazon Rainforest (Rừng Nhiệt Đới Amazon)** (`rainforest`):
   - **Target Phonics**: Vowel Teams & R-controlled Vowels (`AR`, `EY`, `FR`, `OA`).
   - **Animals**:
     - 🦜 **Parrot** (Phonics: R-controlled `AR`)
     - 🐒 **Monkey** (Phonics: Diphthong ending `EY`)
     - 🐸 **Frog** (Phonics: Initial blend `FR`)
     - 🐆 **Jaguar** (Phonics: Soft 'G' & blend `U-AR`)
   - **Theme**: Lush emerald canopy, giant vines, misty waterfall.

3. **Arctic Polar Glacier (Băng Đảo Bắc Cực)** (`arctic`):
   - **Target Phonics**: Long Vowels, Vowel Teams & Silent Letters (`EA`, `NG`, `AI`).
   - **Animals**:
     - 🐻‍❄️ **Polar Bear** (Phonics: Vowel team `EA`)
     - 🐧 **Penguin** (Phonics: Nasal blend `NG` & `QU`)
     - 🦭 **Seal** (Phonics: Long `EA` /i:/)
     - 🦊 **Arctic Fox** (Phonics: CVC word `FOX`)
   - **Theme**: Snow-capped icebergs, crystal blue glaciers, aurora borealis.

4. **Coral Reef Ocean (Rạn San Hô Đại Dương)** (`ocean`):
   - **Target Phonics**: Compound Words & Multi-syllable Segmentation.
   - **Animals**:
     - 🐬 **Dolphin** (Phonics: Digraph `PH` /f/)
     - 🦈 **Shark** (Phonics: Digraph `SH` /ʃ/ + `AR`)
     - 🐢 **Sea Turtle** (Phonics: Compound & R-controlled `UR`)
     - 🐙 **Octopus** (Phonics: 3-syllable segmentation `OC-TO-PUS`)
   - **Theme**: Sunlit turquoise waters, vibrant coral reefs, bubbling sea plants.

---

### 2.2 Explorer Mechanics & Viewfinder Camera Loop
1. **Interactive Habitat Panorama**:
   - Each biome renders an immersive landscape where 4 animal hotspots are distributed naturally.
   - Unphotographed animals appear as curious silhouetted / animated creatures with subtle motion.
   - Already photographed animals show a golden camera badge 📸 and full-color portrait.
2. **Camera Shutter & Phonics Challenge Modal**:
   - Clicking an animal activates the **Safari Camera Viewfinder** (lens crosshair, flash effect).
   - Audio prompt plays via `useSpeech`: *"Can you spot the animal? Let's identify the phonics sound to take a clear photo!"*
   - Audio feedback synthesizer plays a mechanical camera shutter sound (white noise + snappy transient).
   - Multi-choice phonics question:
     - Target question (e.g., *"Which digraph makes the /f/ sound in ELE___ANT?"*).
     - 3-4 interactive options with clear pronunciation buttons.
     - On correct answer: Camera flash animation plays, shutter clicks, animal photo is captured in full clarity, awarding **Safari Film Rolls 🎞️** and **Wildlife Badges**.
3. **Wildlife Field Guide (Sổ Tay Bách Khoa Động Vật)**:
   - Accessible from any biome via a persistent guide tab/button.
   - Shows total progress (e.g. `8/16 Động vật đã khám phá`).
   - Displays collectible animal cards with:
     - Animal portrait & bilingual name (English + Vietnamese).
     - Phonics focus rule and phonetic syllable breakdown.
     - Pronunciation audio button via `useSpeech`.
     - Animal sound effect / fun fact.
4. **Safari Explorer Ranks**:
   - **Junior Scout (Thám Tử Nhí) 🧭**: 0 - 3 animals photographed.
   - **Wild Ranger (Kiểm Lâm Viên) 🚙**: 4 - 11 animals photographed.
   - **Safari Master (Bậc Thầy Thám Hiểm) 🦁**: 12 - 16 animals photographed.

---

### 2.3 Strict Kid-Friendly Typography Policy
- Minimum font size: strictly $\ge 16$px (`text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.).
- Strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.
- Large touch-friendly tap targets ($\ge 48$px).

---

### 2.4 TypeScript 5 Contracts & Pure Engine
- All types strictly defined in `src/types/phonics-safari.ts` with zero `any`.
- Pure business logic in `src/lib/phonics-safari-engine.ts`:
  - Biome definitions & animal listings.
  - Photography validation & progress calculation.
  - Explorer rank computation.
- Server Actions in `src/app/actions/phonics-safari.ts`.
