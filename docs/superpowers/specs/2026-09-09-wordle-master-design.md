# Thiết Kế Chi Tiết Kỹ Thuật: Wordle Master (Thử Thách Đoán Từ)

* **Ngày lập:** 2026-09-09
* **Dự án:** GameHub
* **Tài liệu:** `docs/superpowers/specs/2026-09-09-wordle-master-design.md`
* **Trạng thái:** Đã phê duyệt (Approved Design)

---

## 1. Tổng quan Dự án (Executive Summary)

**Wordle Master** là một mini-game giáo dục mới được tích hợp vào GameHub nhằm rèn luyện tư duy logic, khả năng nhớ chính tả (spelling), mở rộng vốn từ vựng và phản xạ phát âm tiếng Anh cho học sinh ESL và người học ngoại ngữ.

Lấy cảm hứng từ cơ chế đoán từ kinh điển của Wordle, Wordle Master được nâng cấp toàn diện với các yếu tố giáo dục:
* Hỗ trợ đa dạng độ dài từ (4, 5, 6 chữ cái).
* Phân loại theo các chủ đề từ vựng quen thuộc (*Động vật, Trường học, Công nghệ, Đời sống*) và chế độ luyện tập ngẫu nhiên.
* Hệ thống gợi ý chủ động 3 nấc cân bằng (*Phát âm Audio -> Nghĩa & Từ loại tiếng Việt -> Tiết lộ 1 chữ cái*).
* Thuật toán so khớp ký tự chính xác tuyệt đối (xử lý chuẩn các trường hợp chữ cái lặp lại).
* Tích hợp sâu vào hệ sinh thái GameHub: âm thanh Web Audio API, phát âm Web Speech API, theo dõi tiến độ học viên qua Supabase (`useGameTracking`) và cấu hình lớp học tùy biến cho giáo viên.

---

## 2. Mục tiêu & Giới hạn Phạm vi (Goals & Non-Goals)

### 2.1. Mục tiêu (Goals)
* Cung cấp trải nghiệm đoán từ mượt mà trên cả máy tính (bàn phím cơ) và thiết bị di động/máy tính bảng (bàn phím ảo cảm ứng).
* Tự động phản hồi màu sắc trực quan (Xanh lá - Vàng - Xám) kèm hoạt ảnh lật ô 3D (3D flip animation) và rung lắc (shake) khi từ không hợp lệ.
* Kiểm tra từ điển tức thì $O(1)$ để ngăn chặn việc spam ký tự vô nghĩa.
* Gắn kết việc học từ vựng sau mỗi ván: hiển thị giải nghĩa tiếng Việt, phiên âm IPA, phát âm bản ngữ và câu ví dụ ngữ cảnh.
* Đồng bộ phiên chơi, tính điểm sao (1-3 sao), cập nhật chuỗi thắng (streak) và lưu các từ chưa giải được vào danh sách "Từ vựng khó" của lớp học.

### 2.2. Giới hạn phạm vi (Non-Goals)
* Không tích hợp chế độ nhiều người chơi trực tiếp cùng lúc qua websocket trong ván này (giữ nguyên mô hình mini-game độc lập đồng bộ của GameHub).
* Không phụ thuộc vào API từ điển bên thứ ba từ bên ngoài để đảm bảo tính sẵn sàng cao, hoạt động mượt mà offline/mạng yếu và an toàn học đường.

---

## 3. Kiến trúc Hệ thống & Danh mục Tệp (Architecture & File Inventory)

### 3.1. Sơ đồ Cấu trúc Thành phần (Component Hierarchy)

```
src/app/games/wordle/
├── page.tsx                      # Main Page: Khởi tạo dữ liệu, bọc Layout và Game Controller
└── components/
    ├── WordleHeader.tsx          # Thanh điều hướng, chọn chủ đề, số chữ cái, nút gợi ý & thống kê
    ├── WordleGrid.tsx            # Lưới ma trận 6 hàng chứa các ô chữ
    ├── WordleRow.tsx             # Hàng từ gồm N ô chữ (hỗ trợ hiệu ứng rung lắc shake & wave)
    ├── WordleTile.tsx            # Từng ô chữ đơn lẻ (hoạt ảnh 3D flip, viền sáng pop)
    ├── WordleKeyboard.tsx        # Bàn phím ảo QWERTY đổi màu động, phím to dễ bấm
    ├── WordleHintsBar.tsx        # Bộ công cụ gợi ý 3 nấc (Audio, Nghĩa, Tiết lộ chữ)
    ├── WordleStatsModal.tsx      # Modal thống kê chuỗi streak & biểu đồ phân bổ lượt đoán
    └── WordleResultDialog.tsx    # Hộp thoại chúc mừng, đánh giá sao, thẻ từ vựng & chia sẻ
```

### 3.2. Danh mục Tệp Logic, Dữ liệu & Kiểm thử

* **Dữ liệu:**
  * `src/data/wordle/words.json`: Danh mục từ vựng mục tiêu chất lượng cao theo chủ đề & độ dài (4, 5, 6 ký tự).
  * `src/data/wordle/valid-dictionary.ts`: Danh sách từ điển tiếng Anh hợp lệ cho việc kiểm tra $O(1)$.
* **Hooks & Logic Engine:**
  * `src/hooks/use-wordle-game.ts`: Custom hook quản lý máy trạng thái game, bàn phím và gợi ý.
  * `src/lib/wordle/evaluator.ts`: Thuật toán so khớp ký tự thuần túy (pure function) xử lý chữ cái lặp lại.
* **Tích hợp Nền tảng:**
  * `src/data/games.json`: Đăng ký game mới vào menu hệ thống.
  * `src/data/game-instructions.ts`: Đăng ký hướng dẫn luật chơi chi tiết.
  * `src/lib/game-config-schema.ts`: Mở rộng schema cấu hình cho giáo viên.
* **Kiểm thử Tự động:**
  * `tests/games/wordle-evaluator.test.ts`: Vitest unit test cho thuật toán so khớp, duplicate letters và validation.
  * `tests/games/use-wordle-game.test.ts`: Vitest hook test cho luồng chơi, trừ điểm gợi ý và kết thúc ván.

---

## 4. Mô hình Dữ liệu (Data Models)

### 4.1. Từ vựng Mục tiêu (`WordleTargetWord`)

```typescript
export interface WordleTargetWord {
  id: string;
  word: string;             // Viết hoa chuẩn, ví dụ: "APPLE", "TIGER", "SERVER"
  length: 4 | 5 | 6;        // Độ dài từ
  category: "animals" | "school" | "technology" | "daily-life" | "workplace" | "fruits";
  vietnameseMeaning: string;// Nghĩa tiếng Việt ngắn gọn, ví dụ: "Quả táo"
  phonetic: string;         // Phiên âm quốc tế IPA, ví dụ: "/ˈæp.əl/"
  partOfSpeech: "noun" | "verb" | "adjective";
  exampleSentence: string;  // Câu tiếng Anh ngữ cảnh: "She eats a fresh apple every day."
  difficulty: "easy" | "medium" | "hard";
}
```

### 4.2. Trạng thái Ký tự & Lưới (`LetterEvaluation`)

```typescript
export type LetterStatus = "correct" | "present" | "absent" | "empty" | "tbd";

export interface EvaluatedLetter {
  char: string;
  status: LetterStatus;
}

export type EvaluatedRow = EvaluatedLetter[];
```

---

## 5. Thuật toán So khớp Ký tự Lặp (Duplicate Letter Evaluation Algorithm)

Thuật toán đảm bảo tính công bằng và chuẩn xác tuyệt đối của luật Wordle quốc tế thông qua 2 giai đoạn quét độc lập:

```typescript
export function evaluateWordleGuess(guess: string, target: string): EvaluatedLetter[] {
  const g = guess.toUpperCase();
  const t = target.toUpperCase();
  const len = t.length;
  const result: EvaluatedLetter[] = Array.from({ length: len }, (_, i) => ({
    char: g[i] || "",
    status: "absent",
  }));

  // Đếm tần suất các ký tự khả dụng trong từ mục tiêu
  const targetLetterCounts: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const char = t[i];
    targetLetterCounts[char] = (targetLetterCounts[char] || 0) + 1;
  }

  // Pass 1: Kiểm tra các vị trí khớp chính xác (Green - correct)
  for (let i = 0; i < len; i++) {
    if (g[i] === t[i]) {
      result[i].status = "correct";
      targetLetterCounts[g[i]] -= 1;
    }
  }

  // Pass 2: Kiểm tra các ký tự có xuất hiện nhưng khác vị trí (Yellow - present)
  for (let i = 0; i < len; i++) {
    if (result[i].status !== "correct") {
      const char = g[i];
      if (targetLetterCounts[char] && targetLetterCounts[char] > 0) {
        result[i].status = "present";
        targetLetterCounts[char] -= 1;
      } else {
        result[i].status = "absent";
      }
    }
  }

  return result;
}
```

---

## 6. Máy Trạng thái Trò chơi (`useWordleGame`)

### 6.1. Quản lý Trạng thái (State Store)

```typescript
export interface WordleGameState {
  targetWord: WordleTargetWord;
  wordLength: 4 | 5 | 6;
  maxAttempts: number;                 // Mặc định: 6
  guesses: string[];                   // Các từ hợp lệ đã nộp
  currentGuess: string;                // Từ đang nhập ở hàng hiện tại
  gameStatus: "playing" | "won" | "lost";
  isShaking: boolean;                  // Rung lắc hàng khi lỗi
  errorMessage: string | null;         // Thông báo lỗi ngắn (toast)
  revealedPositions: Record<number, string>; // Gợi ý ký tự theo vị trí
  hintsUsed: {
    audio: boolean;
    meaning: boolean;
    letter: boolean;
  };
  keyboardStatus: Record<string, LetterStatus>;
}
```

### 6.2. Quy tắc Gợi ý 3 Nấc & Cân bằng Điểm số

1. **Nấc 1: Phát âm Audio (Web Speech API):**
   * Học viên bấm nút loa để nghe giọng đọc chuẩn US/UK của từ mục tiêu.
   * Không trừ điểm số sao cuối ván.
2. **Nấc 2: Gợi ý Nghĩa tiếng Việt & Từ loại:**
   * Hiển thị banner/tooltip nghĩa tiếng Việt và từ loại để học viên định hướng từ vựng.
   * Giảm 10% điểm thưởng XP.
3. **Nấc 3: Tiết lộ 1 Ký tự ngẫu nhiên:**
   * Tự động chọn 1 vị trí chưa được tìm ra (`status !== 'correct'`) và điền ký tự đúng vào vị trí đó.
   * Giới hạn tối đa 1 lần/ván. Giảm 20% điểm thưởng XP.

### 6.3. Đánh giá Kết quả & Sao

* **3 Sao:** Đoán đúng trong lượt 1 hoặc 2 (hoặc lượt 3 nếu không dùng gợi ý nấc 3).
* **2 Sao:** Đoán đúng trong lượt 3 hoặc 4.
* **1 Sao:** Đoán đúng trong lượt 5 hoặc 6.
* **0 Sao:** Hết 6 lượt không tìm ra từ mục tiêu $\rightarrow$ hiển thị thẻ học tập đầy đủ và lưu vào mục ôn tập.

---

## 7. Thiết kế Giao diện & Trải nghiệm Người dùng (UI/UX)

### 7.1. Lưới Ô chữ (`WordleGrid` & `WordleTile`)
* Tối ưu kích thước tự co giãn (fluid scale) từ màn hình nhỏ nhất (320px) đến màn hình máy tính lớn.
* Ô chữ bo góc tròn nhẹ (`rounded-xl`), font chữ `font-black text-2xl md:text-3xl tracking-wider`.
* Bảng màu chuẩn:
  * **Xanh lá (Correct):** `bg-emerald-600 text-white border-emerald-600 shadow-sm`
  * **Vàng hổ phách (Present):** `bg-amber-500 text-white border-amber-500 shadow-sm`
  * **Xám tối (Absent):** `bg-slate-700 dark:bg-slate-800 text-slate-300 border-slate-700`
  * **Chưa đoán:** `border-2 border-slate-300 dark:border-slate-700 text-foreground`

### 7.2. Hoạt ảnh Chuyển động (Animations)
* **Tile Pop:** `@keyframes pop { 0%: scale(1); 50%: scale(1.15); 100%: scale(1); }`
* **Row Shake:** `@keyframes shake { 0%, 100%: translateX(0); 20%, 60%: translateX(-6px); 40%, 80%: translateX(6px); }`
* **Flip 3D:** Sử dụng CSS `perspective: 1000px` và `rotateX(90deg)` lật mượt mà với `animation-delay` tăng dần 200ms cho từng ô.
* **Victory Bounce:** Làn sóng nhảy tưng tưng khi chiến thắng.

### 7.3. Bàn phím Ảo (`WordleKeyboard`)
* 3 hàng phím với độ nhạy chạm cao (`touch-manipulation`, chống zoom double-tap trên iOS).
* Tự động phản hồi xúc giác nhẹ (Haptic feedback nếu thiết bị hỗ trợ) và âm thanh click phím gõ.
* Đồng bộ 1-1 với sự kiện bàn phím máy tính `window.addEventListener('keydown')`.

---

## 8. Tích hợp Theo dõi & Báo cáo Lớp học (Platform Integration)

* Khi ván chơi kết thúc, `useGameTracking` tự động lưu bản ghi phiên chơi:
  ```typescript
  trackGameSession({
    gameId: "wordle",
    targetWord: targetWord.word,
    attempts: guesses.length,
    isSuccess: gameStatus === "won",
    hintsUsed: hintsUsed,
    durationSeconds: elapsedSeconds,
    starsEarned: stars,
  });
  ```
* Nếu học viên thua cuộc, từ vựng được tự động đẩy vào danh sách phân tích *"Từ vựng cần khắc phục"* trong Dashboard của giáo viên để dễ dàng tạo bài tập ôn luyện.

---

## 9. Chiến lược Kiểm thử Tự động (Testing Strategy)

1. **Unit Test Thuật toán (`tests/games/wordle-evaluator.test.ts`):**
   * Đoán từ hoàn hảo: 100% Correct.
   * Đoán từ hoàn toàn sai: 100% Absent.
   * Test case chữ cái lặp lại:
     * Target: `APPLE`, Guess: `PAPER` $\rightarrow$ P[0] yellow, A[1] yellow, P[2] green, E[3] green, R[4] gray.
     * Target: `LION`, Guess: `LLAMA` $\rightarrow$ L[0] green, L[1] gray.
     * Target: `SPEED`, Guess: `ERASE` $\rightarrow$ E[0] yellow, R[1] gray, A[2] gray, S[3] yellow, E[4] yellow (hoặc đúng quy tắc đếm tần suất).
   * Test kiểm tra từ trong từ điển và xử lý viết hoa/viết thường.
2. **Hook Test (`tests/games/use-wordle-game.test.ts`):**
   * Luồng nhập ký tự, xóa backspace, nộp phán đoán khi chưa đủ chữ cái.
   * Luồng chiến thắng và cập nhật chuỗi streak.
   * Luồng sử dụng 3 nấc gợi ý.
3. **E2E Smoke Test:**
   * Mở trang `/games/wordle`, gõ từ và hiển thị đúng màu ô chữ.

---

## 10. Lộ trình Triển khai (Next Steps)
Sau khi bản thiết kế kỹ thuật này được xác nhận, hệ thống sẽ kích hoạt skill `writing-plans` để lập kế hoạch triển khai chi tiết từng bước với mô hình Test-Driven Development (TDD).
