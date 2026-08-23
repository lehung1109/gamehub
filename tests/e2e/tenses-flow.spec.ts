import { test, expect } from "@playwright/test";

test.describe("Workplace English Tense Practice - User Story 1 & 2 Flows", () => {
  test("US1: navigates from homepage banner to 12-Tenses Hub and opens Present Simple lesson", async ({
    page,
  }) => {
    // 1. Visit Homepage
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("GameHub Tiếng Anh");

    // 2. Check for Workplace Tenses banner and click it
    const tensesBannerLink = page.getByRole("link", {
      name: /luyện thì tiếng anh cho người đi làm|khám phá hub 12 thì/i,
    });
    await expect(tensesBannerLink).toBeVisible();
    await tensesBannerLink.click();

    // 3. Verify landing on /tenses
    await expect(page).toHaveURL(/\/tenses$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /bản đồ 12 thì tiếng anh/i })
    ).toBeVisible();

    // 4. Verify 3 timeframe groups are rendered
    await expect(
      page.getByRole("heading", { level: 2, name: /hiện tại|present/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /quá khứ|past/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /tương lai|future/i })
    ).toBeVisible();

    // 5. Verify Present Simple card is active and click it
    const presentSimpleCard = page.getByRole("link", {
      name: /thì hiện tại đơn/i,
    });
    await expect(presentSimpleCard).toBeVisible();
    await presentSimpleCard.click();

    // 6. Verify landing on /tenses/present-simple
    await expect(page).toHaveURL(/\/tenses\/present-simple$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /thì hiện tại đơn/i })
    ).toBeVisible();

    // 7. Verify Tabs and Breadcrumbs
    const rulesTab = page.getByRole("tab", { name: /quy tắc cốt lõi/i });
    const practiceTab = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await expect(rulesTab).toBeVisible();
    await expect(practiceTab).toBeVisible();

    // Switch tab
    await practiceTab.click();
    await expect(practiceTab).toHaveAttribute("aria-selected", "true");

    await rulesTab.click();
    await expect(rulesTab).toHaveAttribute("aria-selected", "true");

    // 8. Test Breadcrumb navigation back to Hub
    const hubBreadcrumb = page.getByRole("link", { name: /hub 12 thì|12 thì/i });
    await expect(hubBreadcrumb).toBeVisible();
    await hubBreadcrumb.click();
    await expect(page).toHaveURL(/\/tenses$/);
  });

  test("US2: explores Quick Rules tab, filters categories, plays audio, and starts practice via CTA", async ({
    page,
  }) => {
    // 1. Navigate directly to Present Simple lesson
    await page.goto("/tenses/present-simple");
    await expect(
      page.getByRole("heading", { level: 1, name: /thì hiện tại đơn/i })
    ).toBeVisible();

    // 2. Verify Quick Rules tab is selected by default
    const rulesTab = page.getByRole("tab", { name: /quy tắc cốt lõi/i });
    await expect(rulesTab).toHaveAttribute("aria-selected", "true");

    // 3. Verify all 5 rule cards are present
    await expect(page.getByText("Động Từ To Be (Am / Is / Are)")).toBeVisible();
    await expect(page.getByText("Động Từ Thường (Action Verbs)")).toBeVisible();
    await expect(page.getByText("Quy Tắc Thêm Đuôi -s / -es")).toBeVisible();
    await expect(page.getByText("Trạng Từ Chỉ Tần Suất & Vị Trí Trong Câu")).toBeVisible();
    await expect(page.getByText("4 Tình Huống Công Sở Điển Hình")).toBeVisible();

    // 4. Verify workplace tips callout
    await expect(
      page.getByText(/Dùng 'I am responsible for\.\.\.' để giới thiệu vai trò công việc/i)
    ).toBeVisible();

    // 5. Test Category Filter
    const spellingFilterBtn = page.getByRole("button", { name: /quy tắc -s\/-es/i });
    await spellingFilterBtn.click();

    // Only Spelling Rules card should be visible
    await expect(page.getByText("Quy Tắc Thêm Đuôi -s / -es")).toBeVisible();
    await expect(page.getByText("Động Từ To Be (Am / Is / Are)")).not.toBeVisible();
    await expect(page.getByText("4 Tình Huống Công Sở Điển Hình")).not.toBeVisible();

    // Click "Tất cả" to restore
    const allFilterBtn = page.getByRole("button", { name: /tất cả/i });
    await allFilterBtn.click();
    await expect(page.getByText("Động Từ To Be (Am / Is / Are)")).toBeVisible();
    await expect(page.getByText("4 Tình Huống Công Sở Điển Hình")).toBeVisible();

    // 6. Test Audio Pronunciation button
    const speakButtons = page.getByRole("button", { name: /phát âm:/i });
    await expect(speakButtons.first()).toBeVisible();
    await speakButtons.first().click();

    // 7. Click bottom CTA button "Bắt đầu Luyện Tập 3 Chặng"
    const startPracticeCTA = page.getByRole("button", {
      name: /bắt đầu luyện tập 3 chặng/i,
    });
    await expect(startPracticeCTA).toBeVisible();
    await startPracticeCTA.click();

    // 8. Verify transition to Practice tab and Stage 1
    const practiceTab = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await expect(practiceTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText(/chặng 1 • chia động từ/i)).toBeVisible();
  });

  test("US3: completes Stage 1 (Conjugation) with multiple-choice, direct typing, audio, instant feedback, and storage saving", async ({
    page,
  }) => {
    // 1. Open Present Simple lesson page
    await page.goto("/tenses/present-simple");

    // 2. Go to Practice tab
    const practiceTab = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await practiceTab.click();

    // 3. Enter Stage 1
    const enterStage1Btn = page.getByRole("button", { name: /vào chặng 1/i });
    await expect(enterStage1Btn).toBeVisible();
    await enterStage1Btn.click();

    // 4. Verify Stage 1 UI
    await expect(page.getByText(/chặng 1 • chia động từ/i)).toBeVisible();
    await expect(page.getByText(/câu 1 \/ 8/i)).toBeVisible();
    await expect(page.getByText(/Email thông báo lịch họp định kỳ/i)).toBeVisible();
    await expect(page.getByText(/Weekly Sprint Planning Meeting/i)).toBeVisible();

    // 5. Test Multiple-Choice Selection on Q1
    const optionMeets = page.getByRole("button", { name: "meets", exact: true });
    await expect(optionMeets).toBeVisible();
    await optionMeets.click();

    const submitBtn = page.getByRole("button", { name: /kiểm tra đáp án/i });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 6. Verify Instant Feedback and Grammar Explanation
    await expect(page.getByText(/chính xác! \(\+10 điểm\)/i)).toBeVisible();
    await expect(page.getByText(/Quy tắc áp dụng:/i)).toBeVisible();
    await expect(page.getByText(/Chủ ngữ 'Our team'/i)).toBeVisible();

    // 7. Test Speech button
    const audioBtn = page.getByRole("button", { name: /nghe phát âm/i });
    await expect(audioBtn).toBeVisible();
    await audioBtn.click();

    // 8. Next to Q2
    const nextBtn = page.getByRole("button", { name: /câu tiếp theo/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // 9. Test Direct Typing & Enter key on Q2
    await expect(page.getByText(/câu 2 \/ 8/i)).toBeVisible();
    await expect(page.getByText(/Welcome our new Marketing Manager/i)).toBeVisible();

    const textInput = page.getByPlaceholder(/nhập dạng đúng của động từ/i);
    await expect(textInput).toBeVisible();
    await textInput.fill("manages");
    await textInput.press("Enter");

    await expect(page.getByText(/chính xác! \(\+10 điểm\)/i)).toBeVisible();
    await expect(page.getByText(/Ms\. Lan/i)).toBeVisible();

    // 10. Test Incorrect Answer feedback on Q3
    await page.getByRole("button", { name: /câu tiếp theo/i }).click();
    await expect(page.getByText(/câu 3 \/ 8/i)).toBeVisible();

    // Select incorrect choice "do not send"
    await page.getByRole("button", { name: "do not send", exact: true }).click();
    await page.getByRole("button", { name: /kiểm tra đáp án/i }).click();

    await expect(page.getByText(/chưa chính xác/i)).toBeVisible();
    await expect(page.getByText(/đáp án đúng:/i)).toBeVisible();
    await expect(page.getByText(/does not send/i)).toBeVisible();

    // 11. Loop through remaining questions (Q4 to Q8)
    const answers = [
      "verifies",           // Q4
      "does the CEO arrive",// Q5
      "deliver",            // Q6
      "have",               // Q7
      "does not exceed",    // Q8
    ];

    for (let i = 0; i < answers.length; i++) {
      await page.getByRole("button", { name: /câu tiếp theo/i }).click();
      const currentAns = answers[i];
      const optBtn = page.getByRole("button", { name: currentAns, exact: true });
      if (await optBtn.isVisible()) {
        await optBtn.click();
      } else {
        await page.getByPlaceholder(/nhập dạng đúng của động từ/i).fill(currentAns);
      }
      await page.getByRole("button", { name: /kiểm tra đáp án/i }).click();
      await expect(page.getByText(/chính xác! \(\+10 điểm\)/i)).toBeVisible();
    }

    // 12. Finish Stage 1 on last question
    const finishBtn = page.getByRole("button", { name: /xem kết quả chặng 1|hoàn thành/i });
    await expect(finishBtn).toBeVisible();
    await finishBtn.click();

    // 13. Verify return to stage list
    await expect(page.getByRole("button", { name: /vào chặng 1/i })).toBeVisible();

    // 14. Verify LocalStorage contains saved stage progress
    const progressInStorage = await page.evaluate(() => {
      return localStorage.getItem("gamehub_tense_progress_v1");
    });
    expect(progressInStorage).not.toBeNull();
    expect(progressInStorage).toContain('"conjugation"');
    expect(progressInStorage).toContain('"present-simple"');
  });
});
