# Thiết Kế Chi Tiết Kỹ Thuật: Word Connect (Vòng Xoay Nối Chữ)

* **Ngày lập:** 2026-09-10
* **Dự án:** GameHub
* **Tài liệu:** `docs/superpowers/specs/2026-09-10-word-connect-design.md`
* **Trạng thái:** Đã phê duyệt (Approved by User)

---

## 1. Tổng quan Dự án (Executive Summary)

**Word Connect** (Vòng Xoay Nối Chữ) là mini-game thứ hai trong bộ ba game mới của GameHub. Trò chơi lấy cảm hứng từ thể loại Anagram / Wordscapes nổi tiếng toàn cầu, giúp người học phát triển khả năng nhận diện các họ từ (word families), cấu trúc ngữ pháp (số nhiều, dạng động từ), cải thiện chính tả và phản xạ từ vựng tiếng Anh.

Học viên được cung cấp một vòng tròn chứa từ 3 đến 6 chữ cái rời rạc. Nhiệm vụ là nối các chữ cái (qua thao tác kéo vuốt chạm hoặc click chuột) để tạo thành các từ tiếng Anh có nghĩa, lấp đầy các hàng ô chữ mục tiêu trên bảng.

---

## 2. Tính năng Chính & Cơ chế Gameplay (Core Mechanics)

1. **Vòng Xoay Chữ Cái (Interactive Letter Wheel):**
   * Bố trí các chữ cái đối xứng hình tròn.
   * Hỗ trợ cả hai cơ chế tương tác:
     * **Kéo vuốt (Touch / Mouse Drag):** Vẽ đường nối SVG tương tác theo thời gian thực nối các ký tự.
     * **Click / Tap tuần tự:** Bấm từng chữ cái theo thứ tự trên di động/máy tính, có nút Backspace và Clear.
   * **Nút Xáo Trộn (Shuffle 🔀):** Xoay đổi ngẫu nhiên vị trí các chữ cái trên vòng xoay giúp người chơi đổi góc nhìn khi bí ý tưởng.

2. **Bảng Ô Chữ Mục Tiêu (Word Grid Slots):**
   * Hiển thị các khối ô chữ theo độ dài (ví dụ: một từ 3 chữ, hai từ 4 chữ).
   * Khi người chơi nối đúng một từ mục tiêu:
     * Hoạt ảnh từ bay từ vòng tròn lên đúng vị trí trên bảng.
     * Phát âm âm thanh chuẩn (Web Speech API).
     * Phát âm thanh chime chúc mừng.

3. **Hũ Từ Vựng Thưởng (Bonus Words Jar 🏺):**
   * Nếu người chơi nối được một từ tiếng Anh hoàn toàn hợp lệ trong từ điển nhưng không nằm trong danh sách từ chính của màn chơi, từ đó sẽ bay vào "Hũ từ thưởng".
   * Tích lũy đủ số từ thưởng giúp người chơi nhận thêm XP và sao thưởng.

4. **Hệ thống Gợi ý (Hint System 💡):**
   * Nút Gợi ý (💡) tự động mở một chữ cái ngẫu nhiên trên một ô chữ còn trống chưa đoán được.
   * Giới hạn gợi ý hoặc trừ nhẹ điểm XP thưởng.

5. **Hộp Thoại Tổng Kết Vòng Chơi (Level Completion Dialog):**
   * Đánh giá 1–3 sao dựa trên số gợi ý đã dùng và thời gian hoàn thành.
   * Thẻ ôn tập từ vựng: Liệt kê toàn bộ các từ đã giải được trong màn kèm phiên âm IPA, nghĩa tiếng Việt và nút loa phát âm từng từ.
   * Nút "Màn tiếp theo" (Next Level) để học sinh tiếp tục chuỗi học tập.

6. **Tích hợp Nền tảng:**
   * Đăng ký vào `src/data/games.json` (`id: "word-connect"`, `route: "/games/word-connect"`, `emoji: "🔄"`, `priority: 15`).
   * Hướng dẫn chơi chuẩn trong `src/data/game-instructions.ts`.
   * Cấu hình giáo viên trong `src/lib/game-config-schema.ts`.
   * Ghi nhận điểm số, từ vựng và phiên học qua `useGameTracking`.

---

## 3. Cấu trúc Dữ liệu & Mô hình Màn chơi (Data Models)

### 3.1. Dữ liệu Màn chơi (`WordConnectLevel`)

```typescript
export interface WordConnectWordInfo {
  word: string;             // Viết hoa chuẩn, ví dụ: "STAR"
  vietnameseMeaning: string;// Nghĩa tiếng Việt, ví dụ: "Ngôi sao"
  phonetic: string;         // IPA, ví dụ: "/stɑːr/"
  partOfSpeech: string;     // "noun" | "verb" | "adjective"
  exampleSentence: string;  // Ví dụ ngữ cảnh
}

export interface WordConnectLevel {
  id: string;
  levelNumber: number;
  letters: string[];                  // Các chữ cái trên vòng xoay, ví dụ: ["A", "C", "T", "S"]
  targetWords: WordConnectWordInfo[]; // Các từ mục tiêu cần điền trên bảng ô chữ
  bonusWords?: string[];              // Danh sách từ phụ hợp lệ nhận thêm điểm
  theme?: string;                     // Chủ đề (animals, school, daily-life, etc.)
  difficulty: "easy" | "medium" | "hard";
}
```

### 3.2. Trạng thái Trò chơi (`useWordConnectGame`)

```typescript
export interface WordConnectState {
  currentLevel: WordConnectLevel;
  levelIndex: number;
  selectedLetters: number[];          // Danh sách chỉ số các chữ cái đang được chọn theo thứ tự
  solvedWords: string[];              // Các từ mục tiêu đã được giải
  foundBonusWords: string[];          // Các từ phụ đã tìm thấy
  revealedHints: Record<string, number[]>; // { [word]: [index đã lộ] }
  currentInput: string;               // Từ đang ghép hiện tại
  errorShake: boolean;                // Báo rung khi từ không đúng hoặc đã giải rồi
  statusMessage: string | null;       // "Đã tìm thấy!", "Từ đã giải rồi", "Chưa chính xác"
  isCompleted: boolean;
  score: number;
  hintsUsedCount: number;
}
```

---

## 4. Kiến trúc Thành phần (Component Hierarchy)

```
src/app/games/word-connect/
├── page.tsx                           # Main Controller & Page
└── components/
    ├── WordConnectHeader.tsx          # Level, theme, stats, guide modal trigger
    ├── WordSlotsBoard.tsx             # Bảng hiển thị các hàng ô chữ mục tiêu
    ├── WordSlotRow.tsx                # Hàng ô chữ cho 1 từ
    ├── LetterWheel.tsx                # Vòng xoay chữ cái cảm ứng và SVG drag line
    ├── WordConnectControls.tsx        # Nút Shuffle, Hint, Clear, Backspace
    ├── BonusWordsModal.tsx            # Modal xem danh sách từ vựng thưởng đã tìm
    └── WordConnectResultDialog.tsx    # Hộp thoại chúc mừng, đánh giá sao, bảng từ vựng
```

---

## 5. Chiến lược Kiểm thử Tự động (Testing Strategy)

1. **Unit Tests (`tests/unit/word-connect/engine.test.ts`):**
   * Kiểm thử logic nối chữ: đúng từ mục tiêu, từ phụ (bonus word), từ không hợp lệ, từ đã đoán rồi.
   * Kiểm thử tính toán mở chữ cái khi dùng gợi ý (Hint).
   * Kiểm thử logic xáo trộn (Shuffle) không làm mất hoặc thay đổi các ký tự gốc.
2. **Component Tests (`tests/components/word-connect/WordConnectUI.test.tsx`):**
   * Kiểm thử hiển thị LetterWheel và các ô chữ WordSlotsBoard.
   * Kiểm thử tương tác bấm phím và các nút Shuffle / Hint.
3. **Integration Tests (`tests/app/games/word-connect/page.test.tsx`):**
   * Kiểm thử hoàn thành màn chơi, hiển thị kết quả và tích hợp `useGameTracking`.
