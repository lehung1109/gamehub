# Quickstart Validation Guide

Follow these steps to validate the Stage Result Review feature end-to-end.

## Prerequisites
Ensure the development server is running:
```bash
npm run dev
```

## Scenario 1: Verify Stage Result UI displays
1. Navigate to `http://localhost:3000/tenses/present-simple`
2. Click "Vào Chặng 1" (Conjugation).
3. Answer all 10 questions.
4. **Expected Outcome**: Instead of being immediately kicked back to the 3-card stage list, you should see a new "Stage Result Summary" screen displaying your score out of 10.

## Scenario 2: Verify Detailed History Review
1. On the "Stage Result Summary" screen from Scenario 1, click "Xem chi tiết".
2. **Expected Outcome**: You should see a vertical list of the 10 questions you just answered. Each item must show your chosen answer, the correct answer, and an explanation.

## Scenario 3: Verify Persistence
1. Refresh the page (F5) or close and reopen the browser.
2. Ensure you are back on `http://localhost:3000/tenses/present-simple` (or click "Xem bảng tổng kết").
3. Click to view details for Chặng 1.
4. **Expected Outcome**: Your exact 10 questions and answers from Scenario 1 are still displayed correctly, proving they were saved to Local Storage.

## Scenario 4: Verify Question Bank Randomization
1. From the Stage Result Summary or Completion Dashboard, click "Làm lại chặng này" (Replay) for Chặng 1.
2. Note the first 2-3 questions.
3. Finish the stage rapidly, click Replay again.
4. **Expected Outcome**: The 10 questions presented should be a different random selection from the 20-question bank.
