# Design Specification: Phase 28 - Phonics Space Odyssey & Cosmic Planet Explorer

## 1. Overview & Vision
The **Phonics Space Odyssey & Cosmic Planet Explorer** (`/space`) propels young ESL learners on an epic interstellar voyage across the cosmos aboard the **Starship Discovery**. Accompanied by **Commander Cosmo 👨‍🚀 & Star AI Nova 🛰️**, students chart unknown celestial bodies, land robotic exploration rovers, decode extraterrestrial radio frequencies through phonics mastery, and compile the ultimate **Cosmic Space Compendium (Bách Khoa Thiên Văn & Sổ Tay Tinh Tú)**.

---

## 2. Core Feature Requirements

### 2.1 4 Planetary Sectors & Space Missions (`SpaceSector`)
1. **Red Desert Mars (`mars`)**:
   - **Phonics Target**: Short Vowels & Rocket Fuel CVC Blends (`ROCK`, `RED`, `HOT`, `JET`, `GAS`).
   - **Missions**:
     - 🚀 *Rover Landing*: CVC word `R-O-C-K` (Rock) + `R-E-D` (Red).
     - 🌋 *Crater Exploration*: Short /ɒ/ in `H-O-T` (Hot) + `P-O-T` (Pot).
     - ⛽ *Fuel Depots*: Short /æ/ & /e/ in `G-A-S` (Gas) + `J-E-T` (Jet).
   - **Theme**: Rust-red rocky terrain, canyon ridges, twin moons.

2. **Ringed Wonder Saturn (`saturn`)**:
   - **Phonics Target**: Consonant Digraphs & Blends (`RING`, `SHINE`, `STAR`, `GLOW`, `MOON`).
   - **Missions**:
     - 🪐 *Ring Scanner*: Nasal blend `NG` in `R-I-N-G` (Ring) + `W-I-N-G` (Wing).
     - ✨ *Starlight Sensor*: Digraph `SH` in `S-H-I-N-E` (Shine) + `S-H-I-P` (Ship).
     - 🌟 *Constellation Beacon*: Blend `ST` in `S-T-A-R` (Star) + `G-L` in `G-L-O-W` (Glow).
   - **Theme**: Golden crystalline rings, shimmering atmospheric bands, cosmic dust.

3. **Frozen Giant Neptune (`neptune`)**:
   - **Phonics Target**: Vowel Teams & Magic Silent E (`ICE`, `BLUE`, `FREEZE`, `STORM`, `SPACE`).
   - **Missions**:
     - ❄️ *Ice Core Drilling*: Magic E `I-C-E` (Ice) + `S-P-A-C-E` (Space).
     - 🌪️ *Storm Chaser*: Vowel team `E-E` in `F-R-E-E-Z-E` (Freeze) + `B-L-U-E` (Blue).
     - 🌌 *Dark Vortex*: R-controlled `O-R` in `S-T-O-R-M` (Storm).
   - **Theme**: Deep azure storms, supersonic winds, diamond rain.

4. **Starlight Galaxy Nebula (`galaxy`)**:
   - **Phonics Target**: Multi-Syllable Space Words & Compound Words.
   - **Missions**:
     - 🛸 *Alien Mothership*: Compound word `S-P-A-C-E-S-H-I-P` (Space + Ship).
     - 🔭 *Deep Space Telescope*: Syllable segmentation `TEL-E-SCOPE` (3 syllables).
     - 🧑‍🚀 *Astronaut Spacewalk*: Syllable segmentation `AS-TRO-NAUT` (3 syllables).
   - **Theme**: Spiraling rainbow nebulae, dazzling supernovas, distant galaxies.

---

### 2.2 Astronaut Gameplay Loop (`CosmicRoverModal`)
1. **Selecting a Mission**:
   - Each sector features 3 planetary missions.
   - Completed missions display a glowing Space Crystal 💎 and Golden Astro Badge 🌟.
2. **Rover Landing & Audio Signal Decoding**:
   - Commander Cosmo prompts via `useSpeech`: *"Astronaut, decode this radio beacon to establish communications!"*
   - Audio feedback synthesizer plays cosmic space thrusters & futuristic chimes.
   - Multiple choice phonics challenge:
     - Target question (e.g., *"Which compound word joins SPACE and SHIP?"*).
     - 3-4 interactive options with clear tap targets.
     - On correct answer: Rover lands successfully, cosmic crystals are awarded (+3 💎), and planet data is logged.
     - On incorrect answer: Warning sound, friendly retry encouragement.
3. **Cosmic Space Compendium (Bách Khoa Thiên Văn)**:
   - Unlocks planetary cards with real-world astronomy fun facts, syllable breakdowns, and pronunciation buttons.
4. **Astronaut Explorer Ranks**:
   - **Cadet Explorer (Thiếu Sinh Quân Vũ Trụ) 🚀**: 0 - 3 missions completed.
   - **Fleet Commander (Chỉ Huy Phi Đội) 🛸**: 4 - 8 missions completed.
   - **Intergalactic Star Lord (Chúa Tể Thiên Hà) 🌌**: 9 - 12 missions completed.

---

### 2.3 Strict Kid-Friendly Typography Policy
- Minimum font size: strictly $\ge 16$px (`text-base`, `text-lg`, `text-xl`, etc.).
- Strictly zero `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.
- Large touch targets ($\ge 48$px).

---

### 2.4 TypeScript 5 Contracts & Pure Engine
- All types defined in `src/types/phonics-space.ts` with zero `any`.
- Pure business logic in `src/lib/phonics-space-engine.ts`.
- Server Actions in `src/app/actions/phonics-space.ts`.
