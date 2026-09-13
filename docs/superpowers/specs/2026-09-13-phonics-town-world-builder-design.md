# Design Specification: Phase 25 - Phonics Town & Interactive Vocabulary World Builder

## 1. Overview & Vision
The **Phonics Town & Interactive World Builder** (`/town`) is the grand meta-progression hub of the GameHub ecosystem. It transforms language learning into an immersive world-building simulation where children become **Mayor of Phonics Town (Thị trưởng Ngữ âm) 🏙️**.

Students construct, upgrade, and manage thematic buildings (Bakery, Zoo, Hospital, Library, Spaceport, Police Station) on an interactive town grid using **Building Bricks 🧱** and **Prosperity Stars 🌟** earned across all games and resident mini-quests. Each building introduces animated resident NPCs who give voiced vocabulary missions, turning vocabulary acquisition into active community management!

---

## 2. Core Feature Requirements

### 2.1 Thematic Buildings (`TownBuilding`)
1. **Sunny Bakery (Tiệm Bánh Nắng Mai)** (`bakery`):
   - **Phonics & Vocab Target**: CVC Words & Baking Ingredients (`CAKE`, `BREAD`, `MILK`, `EGG`, `JAM`).
   - **Resident NPC**: Baker Bob 👨‍🍳 ("Hello little Mayor! I need ingredients with short /e/ sound!").
   - **Levels**: Level 1 (Bakery Cart) $\rightarrow$ Level 2 (Cozy Pastry Shop) $\rightarrow$ Level 3 (Grand Dessert Palace).
2. **Safari Zoo (Vườn Thú Safari)** (`zoo`):
   - **Phonics & Vocab Target**: Animals, Habitats & Consonant Blends (`FROG`, `CRAB`, `ELEPHANT`, `TIGER`, `GIRAFFE`).
   - **Resident NPC**: Ranger Rick 🦁.
   - **Levels**: Level 1 (Petting Meadow) $\rightarrow$ Level 2 (Wild Jungle Reserve) $\rightarrow$ Level 3 (World Wonder Safari).
3. **Caring Hospital (Bệnh Viện Yêu Thương)** (`hospital`):
   - **Phonics & Vocab Target**: Body Parts & Health Words (`HEART`, `HEAD`, `HAND`, `MEDICINE`).
   - **Resident NPC**: Doctor Daisy 👩‍⚕️.
   - **Levels**: Level 1 (First-Aid Clinic) $\rightarrow$ Level 2 (City Medical Center) $\rightarrow$ Level 3 (High-Tech Health Dome).
4. **Wonder Library (Thư Viện Kỳ Diệu)** (`library`):
   - **Phonics & Vocab Target**: Vowel Teams, Stories & Sight Words (`BOOK`, `STORY`, `READ`, `MAGIC`).
   - **Resident NPC**: Librarian Luna 🧙‍♀️.
   - **Levels**: Level 1 (Book Kiosk) $\rightarrow$ Level 2 (Grand Reading Hall) $\rightarrow$ Level 3 (Crystal Archive Tower).
5. **Cosmic Spaceport (Sân Bay Vũ Trụ)** (`spaceport`):
   - **Phonics & Vocab Target**: Compound Words & Astronomy (`SPACESHIP`, `STARLIGHT`, `PLANET`, `ROCKET`).
   - **Resident NPC**: Astronaut Alex 👨‍🚀.
   - **Levels**: Level 1 (Launch Pad) $\rightarrow$ Level 2 (Orbital Hangar) $\rightarrow$ Level 3 (Galactic Gateway).
6. **Hero Police Station (Đồn Cảnh Sát Hiệp Sĩ)** (`police-station`):
   - **Phonics & Vocab Target**: Action Verbs & Community Safety (`HELP`, `STOP`, `SAVE`, `BADGE`).
   - **Resident NPC**: Officer Sam 👮‍♂️.
   - **Levels**: Level 1 (Watch Post) $\rightarrow$ Level 2 (Community Station) $\rightarrow$ Level 3 (High-Tech Guardian Citadel).

### 2.2 Town Grid & Construction Mechanics
- **Grid Layout**: Responsive 6-slot construction site (2 rows $\times$ 3 columns) with animated ground tiles, pathways, trees, and floating weather elements (clouds, sun, birds).
- **Brick Currency 🧱 & Prosperity Stars 🌟**:
  - Each building costs a specific number of Bricks (e.g. 50 Bricks for Lv1, 100 for Lv2, 150 for Lv3).
  - Building/upgrading grants Town Prosperity Stars 🌟 and boosts Town EXP.
- **Local & Cloud Persistence**:
  - Automatically saves town layout, unlocked building levels, and brick inventory in localStorage (`gamehub_phonics_town_state`) and syncs via server actions.

### 2.3 Resident Mini-Quests (Nhiệm vụ Cư dân)
- Clicking on a constructed building opens the **Resident Quest Modal**:
  - Voiced greeting from the resident NPC via `useSpeech`.
  - Multiple-choice phonics riddle matching the building's vocabulary target.
  - Solving awards immediate Bricks (`+25 🧱`) and Prosperity (`+10 🌟`).
- Instant Web Audio feedback (chimes for upgrades and quest completions).

### 2.4 Strict Kid-Friendly Typography Policy
- Minimum font size $\ge 16$px across all components (`text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.).
- Strictly zero tolerance for `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.

### 2.5 TypeScript 5 Strict Architecture
- Strict interfaces in `src/types/phonics-town.ts`.
- Pure engine in `src/lib/phonics-town-engine.ts`.
- Server actions in `src/app/actions/phonics-town.ts`.
- UI components in `src/components/town/`.
- Dynamic and hub route `/town`.
- 100% test coverage with Vitest unit tests and Playwright E2E tests.
