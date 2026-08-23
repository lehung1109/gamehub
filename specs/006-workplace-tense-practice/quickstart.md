# Quickstart & Validation Guide: Workplace English Tense Practice

This document provides step-by-step instructions and runnable validation scenarios to verify the feature end-to-end.

---

## 1. Prerequisites & Environment Setup

Ensure Node.js `>= 20.x` and project dependencies are installed.

```bash
# Verify dependencies
npm install

# Run the development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 2. Validation Scenarios

### Scenario 1: Homepage Entry & Hub Exploration
1. Open `http://localhost:3000`.
2. Verify the prominent workplace learning banner/card is visible: **"Luyện Thì Tiếng Anh Cho Người Đi Làm & Sinh Viên"**.
3. Click the banner to navigate to `/tenses`.
4. **Expected Outcome**:
   - URL changes to `http://localhost:3000/tenses`.
   - 12 tenses are grouped into 3 sections: **Hiện Tại (Present)**, **Quá Khứ (Past)**, **Tương Lai (Future)**.
   - **Thì Hiện Tại Đơn (Present Simple)** has an active status card with level `A1-A2` and challenge count.
   - Other 11 tenses display disabled state with `Sắp ra mắt` badges.

---

### Scenario 2: Quick Rules & Audio Pronunciation
1. Click the **Thì Hiện Tại Đơn** card to navigate to `/tenses/present-simple`.
2. Select the **"Quy Tắc Cốt Lõi"** tab.
3. Review rule cards: To Be, Action Verbs, Spelling rules (`-s/-es`), and Adverbs of Frequency.
4. Click the speaker icon next to any workplace example sentence (e.g., *"She manages the marketing team"*).
5. **Expected Outcome**:
   - Audio pronounces the sentence cleanly at natural pacing (en-US, rate ~0.9).
   - If Web Speech is unsupported, a subtle notice is displayed without crashing or blocking the UI.

---

### Scenario 3: Stage 1 - Email Conjugation Practice
1. Switch to the **"Luyện Tập"** tab (defaults to **Chặng 1: Chia Động Từ Email & Ngữ Cảnh**).
2. Answer the first workplace email question:
   - Select or type the correct conjugated verb.
   - Click **"Kiểm tra"** (Check).
3. **Expected Outcome**:
   - Immediate positive green feedback appears.
   - Detailed grammar breakdown explaining subject-verb agreement is displayed.
   - Score increments by 1.
4. Complete all 8 questions in Stage 1.
5. Click **"Chuyển sang Chặng 2"**.

---

### Scenario 4: Stage 2 - Workplace Error Hunter
1. In **Chặng 2: Săn Lỗi Sai Văn Phòng**:
   - Read the flawed sentence (e.g., *"The CEO always attend the Monday briefing."*).
   - Click on the word token `"attend"`.
   - From the dropdown/popover, select the correct form `"attends"`.
2. **Expected Outcome**:
   - Sentence turns green and displays the corrected full sentence.
   - Workplace grammar tip explains why singular 3rd person requires `-s/-es`.
3. Complete all 6 questions in Stage 2.
4. Advance to Stage 3.

---

### Scenario 5: Stage 3 - Sentence Builder with dnd-kit & Tap-to-Place
1. In **Chặng 3: Ghép Câu Lịch Trình & Giao Tiếp**:
   - Read the Vietnamese prompt (e.g., *"Công ty chúng tôi luôn tổ chức buổi họp toàn thể vào sáng thứ Hai."*).
   - Tap or drag tokens into the correct sequential slots.
   - Click **"Kiểm tra"** (or auto-check on slot fill).
2. **Expected Outcome**:
   - Correct sentence is evaluated, sentence is pronounced aloud.
   - Adverb of frequency position rule is highlighted.
3. Complete all 6 questions in Stage 3.

---

### Scenario 6: Completion Dashboard & LocalStorage Persistence
1. Complete Stage 3 and transition to the **Completion Dashboard**.
2. **Expected Outcome**:
   - Total score and accuracy percentage are calculated across all 3 stages.
   - Stage breakdown (Conjugation: 8/8, Error Hunter: 6/6, Sentence Builder: 6/6) is shown.
3. Click **"Quay về Hub 12 Thì"** (`/tenses`).
4. **Expected Outcome**:
   - Present Simple card now displays the **"Đã hoàn thành • 100%"** progress badge.
   - Refresh the page (`F5`) to confirm state remains persisted via `localStorage`.

---

## 3. Automated Test Execution

Run the complete test suite:

```bash
# Run unit & integration tests
npm run test:run

# Run type checks
npx tsc --noEmit

# Run linter
npm run lint

# Run E2E tests (Playwright)
npm run test:e2e
```
