# Thiết kế Kỹ thuật Game 3: Odd One Out: Semantic Master (Truy Tìm Kẻ Lạc Loài)

## 1. Tổng quan Trò chơi (Executive Overview)
- **Tên tiếng Việt:** Truy Tìm Kẻ Lạc Loài
- **Tên tiếng Anh:** Odd One Out: Semantic Master
- **Đường dẫn (Route):** /games/odd-one-out
- **Biểu tượng (Emoji):** 🎯
- **Thứ tự ưu tiên (Priority):** 16
- **Mục tiêu giáo dục:**
  - Rèn luyện tư duy phân tích ngữ nghĩa (semantic reasoning), phân biệt trường từ vựng (lexical fields, hypernyms/hyponyms), từ loại (parts of speech), và các thuộc tính đặc trưng của từ.
  - Sau mỗi câu hỏi, cung cấp lời giải thích song ngữ (Anh - Việt) vì sao từ đó là kẻ lạc loài, giúp học sinh ghi nhớ sâu sắc bản chất từ vựng và ngữ cảnh sử dụng.

---

## 2. Cơ chế Chơi & Trải nghiệm Người dùng (Core Gameplay & UX)

### 2.1. Vòng lặp Trò chơi (Game Loop)
1. **Trưng bày câu hỏi:**
   - Hiển thị 4 thẻ từ vựng trực quan (gồm Chữ tiếng Anh, Emoji minh họa, Phiên âm IPA, và nút nghe phát âm).
   - Manh mối chủ đề ẩn hoặc gợi mở tùy chế độ.
2. **Suy luận & Chọn thẻ:**
   - Người chơi quan sát, nhấp nghe phát âm các từ nếu cần, suy luận điểm chung của nhóm và nhấp chọn 1 từ không thuộc về nhóm.
3. **Phản hồi tức thì & Giải thích giáo dục:**
   - Nếu chọn đúng: Thẻ được làm nổi bật (màu xanh lá, hiệu ứng chúc mừng), âm thanh vui tai vang lên, hộp giải thích song ngữ xuất hiện:
     * Ví dụ: *Chính xác! 'Carrot' là củ (vegetable), trong khi 'Apple', 'Banana', 'Orange' đều là trái cây (fruits)!*
     * Cộng điểm thưởng và chuỗi combo (streak).
   - Nếu chọn sai: Rung nhẹ thẻ (shake animation), âm thanh báo sai, người chơi có thể thử lại hoặc xem gợi ý.
4. **Hệ thống Trợ giúp (Hints / Power-ups):**
   - 💡 **Manh mối chủ đề (Category Clue):** Tiết lộ điểm chung của nhóm (Ví dụ: *Các từ còn lại đều là Động vật có vú*).
   - ✂️ **50/50:** Loại trừ bớt 2 phương án chắc chắn thuộc nhóm, chỉ còn lại 2 thẻ để chọn.
   - 🔊 **Phát âm tự động:** Đọc to lần lượt tất cả các từ vựng để hỗ trợ học sinh học phát âm.
5. **Tổng kết Màn & Thẻ Học Tập:**
   - Hoàn thành bộ 5–10 câu hỏi/màn chơi: Bảng kết quả hiển thị số sao (1–3 sao), điểm số, tỉ lệ chính xác, và toàn bộ danh sách từ vựng đã học kèm nghĩa tiếng Việt và audio.

---

## 3. Kiến trúc Dữ liệu & Kiểu dữ liệu (src/types/odd-one-out.ts)

`	ypescript
export interface SemanticWordItem {
  id: string;
  word: string;
  vietnameseMeaning: string;
  phonetic: string;
  partOfSpeech: string;
  emoji: string;
  isOdd: boolean;
  reasonVi?: string;
  reasonEn?: string;
}

export interface OddOneOutQuestion {
  id: string;
  difficulty: easy | medium | hard;
  themeVi: string;
  themeEn: string;
  commonTraitVi: string;
  commonTraitEn: string;
  explanationVi: string;
  explanationEn: string;
  items: SemanticWordItem[]; // 4 items (3 common, 1 odd)
}

export interface OddOneOutState {
  questions: OddOneOutQuestion[];
  currentIndex: number;
  score: number;
  streak: number;
  selectedId: string | null;
  isAnswerChecked: boolean;
  isCorrect: boolean | null;
  eliminatedIds: string[]; // for 50/50 hint
  showThemeHint: boolean;
  hintsUsed: number;
  isCompleted: boolean;
  answersHistory: {
    questionId: string;
    selectedId: string;
    isCorrect: boolean;
    timeSpentMs: number;
  }[];
}
`

---

## 4. Cấu trúc Thành phần (Component Hierarchy)

`
src/app/games/odd-one-out/
├── page.tsx                           # Main Controller & Game Coordinator
└── components/
    ├── OddOneOutHeader.tsx            # Navigation, progress bar, streak, score, hints
    ├── WordCardGrid.tsx               # Lưới 4 thẻ từ vựng tương tác
    ├── SemanticWordCard.tsx           # Thẻ từ vựng đơn lẻ với âm thanh, emoji, IPA
    ├── ExplanationBanner.tsx          # Băng giải thích song ngữ sau khi trả lời
    ├── OddOneOutResultDialog.tsx      # Hộp thoại tổng kết, đánh giá sao, bảng ôn tập từ vựng
    └── OddOneOutGuideModal.tsx        # Hướng dẫn cách chơi và các mẹo tư duy
`

---

## 5. Chiến lược Kiểm thử Tự động (Testing Strategy)
1. **Unit Tests:**
   - 	ests/unit/odd-one-out/engine.test.ts: Kiểm thử logic kiểm tra đáp án, áp dụng 50/50, tính điểm combo streak, chuyển câu hỏi.
   - 	ests/unit/odd-one-out/challenges-data.test.ts: Kiểm tra tính toàn vẹn của dữ liệu: mỗi câu hỏi phải có đúng 1 từ isOdd === true, đủ 4 từ, có nghĩa tiếng Việt, phiên âm IPA, lý do giải thích.
2. **Component Tests:**
   - 	ests/components/odd-one-out/OddOneOutUI.test.tsx: Render các thẻ, hiệu ứng chọn, loại trừ 50/50, giải thích song ngữ.
3. **Integration Tests:**
   - 	ests/app/games/odd-one-out/page.test.tsx: Luồng chơi hoàn chỉnh từ câu 1 đến câu cuối, tích hợp useGameTracking và useSpeech.
