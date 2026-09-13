# Design Specification: Phase 24 - Phonics Mystery Escape Room & Detective Quest

## 1. Overview & Vision
The **Phonics Mystery Escape Room & Detective Quest** (`/escape-room`) immerses young English learners into high-stakes, interactive puzzle rooms where solving phonics riddles is the key to unlocking doors, cracking ciphers, and escaping safely before the countdown timer expires.

Students step into the shoes of **Detective Sunny 🔍** to explore locked themed chambers (Ancient Egyptian Tomb, Enchanted Library, Orbital Space Station). In each room, they inspect interactive hot-spots, decode secret phonics clues (digraphs, vowel teams, compound words), assemble the master password on the cipher lock keypad, and earn **Golden Skeleton Keys 🗝️** and Detective Badges!

---

## 2. Core Feature Requirements

### 2.1 Thematic Escape Rooms (`EscapeRoom`)
1. **The Pharaoh's Tomb (Lăng Mộ Pharaoh Bí Ẩn)** (`pharaoh-tomb`):
   - **Phonics Target**: Consonant Digraphs & Blends (`SH`, `CH`, `TH`, `WH`, `PH`).
   - **Theme**: Ancient Egyptian Pyramid chamber with glowing hieroglyph torches and stone sarcophagus.
   - **Clues**:
     - *Clue 1 (Hieroglyph Scroll)*: "Find the animal with digraph /ʃ/ (sh): `SH__P`".
     - *Clue 2 (Golden Scarab)*: "Which sound begins the word `CHEST` (/tʃ/)?".
     - *Clue 3 (Sarcophagus Inscription)*: "Find the word with voiceless /θ/ (th): `TH__N`".
   - **Master Password**: `SH-CH-TH` combined into a 3-letter cipher code `SCT` or keyword `SHIP`.

2. **The Enchanted Midnight Library (Thư Viện Ma Thuật Đêm Khuya)** (`haunted-library`):
   - **Phonics Target**: Vowel Teams & Diphthongs (`EE`, `EA`, `OA`, `AI`, `OI`, `OY`).
   - **Theme**: Mysterious library with floating spellbooks, glowing crystal balls, and grandfather clock.
   - **Clues**:
     - *Clue 1 (Dusty Spellbook)*: "Find the vowel team in `BOAT` (/oʊ/)".
     - *Clue 2 (Grandfather Clock)*: "Find the rhyming pair with /i:/: `TREE` & `FREE`".
     - *Clue 3 (Crystal Ball)*: "Which sound makes joy in `BOY` (/ɔɪ/)?".
   - **Master Password**: Keyword `BOAT` or code `OAE`.

3. **The Orbital Space Station (Trạm Không Gian Bị Khóa)** (`space-station`):
   - **Phonics Target**: Compound Words & Syllable Stress (`SUNLIGHT`, `SPACESHIP`, `STARFISH`, `MOONLIGHT`).
   - **Theme**: Sci-fi starship airlock with blinking radar terminals, emergency alarm, and robot assistant.
   - **Clues**:
     - *Clue 1 (Nav Computer)*: "SPACE + SHIP = ?".
     - *Clue 2 (Airlock Valve)*: "SUN + LIGHT = ?".
     - *Clue 3 (Astro Radar)*: "STAR + FISH = ?".
   - **Master Password**: Keyword `STAR` or `SHIP`.

### 2.2 Detective Investigation Room Interface
- **Interactive Clue Hot-spots**:
  - Clicking on hot-spots (e.g. sarcophagus, glowing hieroglyph, spellbook, computer terminal) opens an investigative Clue Inspection Modal.
  - Interactive phonics puzzle within each hot-spot. Solving it adds the unlocked letter/fragment to the **Detective Clue Notebook 📓**.
- **Cipher Keypad / Lock Box Modal**:
  - Students type or tap the decoded password letters into the master door lock.
  - Instant validation with satisfying lock-opening audio feedback.
- **Dynamic Timer & Kid-Friendly Tension**:
  - Configurable countdown timer (e.g., 300 seconds / 5 minutes).
  - Gentle audio cues, pause button, and kid-safe fallback (if timer runs out, Detective Sunny provides an emergency key with no penalty, encouraging a growth mindset).
- **Golden Skeleton Key 🗝️ & Detective Certificate**:
  - Escaping awards 1 to 3 Golden Keys, bonus EXP, and a printable/downloadable Detective Clearance Certificate.

### 2.3 Strict Kid-Friendly Typography Policy
- Minimum font size $\ge 16$px across all components (`text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.).
- Strictly zero tolerance for `text-xs`, `text-sm`, `text-[10px]`, `text-[12px]`, `text-[14px]`.

### 2.4 TypeScript 5 Strict Architecture
- Strict interfaces in `src/types/phonics-escape-room.ts`.
- Pure engine in `src/lib/phonics-escape-room-engine.ts`.
- Server actions in `src/app/actions/phonics-escape-room.ts`.
- Components in `src/components/escape-room/`.
- Dynamic route `/escape-room/[roomId]` with Next.js 16 SSG `generateStaticParams()`.
- 100% test coverage with unit and Playwright E2E tests.
