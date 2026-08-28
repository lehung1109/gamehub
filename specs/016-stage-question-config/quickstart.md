# Quickstart Validation Guide: Tùy Chọn Số Lượng Câu Hỏi Từng Chặng & Đảm Bảo Không Trùng Lặp

This guide provides steps to validate the correct implementation of the stage question configuration and de-duplication feature.

## Prerequisites

- Project running locally via `npm run dev`
- Access to the `/tenses/present-simple` route
- Browser DevTools open (Application tab -> Session Storage) to monitor history arrays

## Validation Scenarios

### Scenario 1: Dynamic Options Rendering

1. Navigate to `/tenses/present-simple`.
2. Click on the "Luyện Tập 4 Chặng" tab.
3. Observe the Stage Cards.
4. **Verify**: Each card should display a chip selector with valid options (e.g., 5 câu, 10 câu, 15 câu, Tất cả). The default selected chip should be 10 (or the max if fewer than 10).
5. **Verify**: Text below the title should display something like `(Còn 20 câu mới)`.

### Scenario 2: Starting a Custom Session

1. On Chặng 1, click the "5 câu" chip.
2. Click "Vào Chặng 1".
3. **Verify**: The quiz starts. The progress indicator at the top should say `1/5`.
4. Answer the 5 questions to finish the stage.
5. **Verify**: The completion screen calculates the score out of 5.

### Scenario 3: History Tracking and De-duplication

1. Return to the practice dashboard.
2. Observe Chặng 1's card.
3. **Verify**: The "câu mới" counter should now display `(Còn 15 câu mới)`.
4. Select "10 câu" and click "Luyện lại Chặng 1".
5. Answer the 10 questions.
6. **Verify**: None of the 10 questions presented are the same as the 5 questions answered in Scenario 2.

### Scenario 4: Pool Wrap-Around

1. Return to the practice dashboard.
2. Observe Chặng 1's card. The counter should display `(Còn 5 câu mới)`.
3. Select "10 câu" and click "Luyện lại Chặng 1".
4. **Verify**: The quiz successfully loads 10 questions without crashing.
5. **Verify**: The 10 questions contain the 5 previously unseen questions, plus 5 randomly selected questions from the previously seen pool.
6. Return to the practice dashboard.
7. **Verify**: The "câu mới" counter should now display `(Còn 10 câu mới)` because the history pool was reset and 10 questions were drawn.

### Scenario 5: Session Persistence (Page Reload)

1. Start Chặng 2 with "5 câu".
2. Answer 2 questions (progress `3/5`).
3. Reload the browser (F5).
4. **Verify**: The quiz resumes at `3/5`. The current question and the remaining sequence are identical to before the reload.
