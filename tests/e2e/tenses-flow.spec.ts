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
    await expect(page.getByText("Ms. Lan", { exact: true }).first()).toBeVisible();

    // 10. Test Incorrect Answer feedback on Q3
    await page.getByRole("button", { name: /câu tiếp theo/i }).click();
    await expect(page.getByText(/câu 3 \/ 8/i)).toBeVisible();

    // Select incorrect choice "do not send"
    await page.getByRole("button", { name: "do not send", exact: true }).click();
    await page.getByRole("button", { name: /kiểm tra đáp án/i }).click();

    await expect(page.getByText(/chưa chính xác/i)).toBeVisible();
    await expect(page.getByText(/đáp án đúng:/i)).toBeVisible();
    await expect(page.getByText(/does not send/i).first()).toBeVisible();

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

  test("US4: completes Stage 2 (Error Hunter) with token clicking, non-error hints, replacement selection, workplace impact feedback, and storage saving", async ({
    page,
  }) => {
    // 1. Navigate to /tenses/present-simple
    await page.goto("/tenses/present-simple");

    // 2. Go to Practice tab
    const practiceTab = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await practiceTab.click();

    // 3. Enter Stage 2
    const enterStage2Btn = page.getByRole("button", { name: /vào chặng 2/i });
    await expect(enterStage2Btn).toBeVisible();
    await enterStage2Btn.click();

    // 4. Verify Stage 2 UI & Q1
    await expect(page.getByText(/chặng 2 • săn lỗi sai văn phòng/i)).toBeVisible();
    await expect(page.getByText(/câu 1 \/ 6/i)).toBeVisible();
    await expect(page.getByText(/Trao đổi ý kiến về đề xuất của khách hàng/i)).toBeVisible();
    await expect(page.getByText(/Cô ấy không đồng ý với đề xuất mới của khách hàng/i)).toBeVisible();

    // 5. Click a non-error token ("She") -> verify helper notice (Acceptance Scenario 4)
    const tokenShe = page.getByRole("button", { name: "She", exact: true });
    await expect(tokenShe).toBeVisible();
    await tokenShe.click();
    await expect(
      page.getByText(/vị trí này không có lỗi|từ "she" đã đúng ngữ pháp/i)
    ).toBeVisible();

    // Submit button is disabled because no error token / replacement chosen
    const submitBtn = page.getByRole("button", { name: /xác nhận sửa lỗi/i });
    await expect(submitBtn).toBeDisabled();

    // 6. Click the error token ("don't") -> verify step 2 options appear
    const tokenDont = page.getByRole("button", { name: "don't", exact: true });
    await expect(tokenDont).toBeVisible();
    await tokenDont.click();

    await expect(page.getByText(/chọn phương án sửa đúng/i)).toBeVisible();
    const optDoesnt = page.getByRole("button", { name: "doesn't", exact: true });
    await expect(optDoesnt).toBeVisible();
    await optDoesnt.click();

    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 7. Verify positive feedback, full correct sentence, explanations, and audio button
    await expect(page.getByText(/chính xác! \(\+10 điểm\)/i)).toBeVisible();
    await expect(page.getByText(/Phân tích lỗi sai:/i)).toBeVisible();
    await expect(page.getByText(/Tác động công sở:/i)).toBeVisible();
    await expect(page.getByText("She doesn't agree with the client's new proposal.")).toBeVisible();

    const audioBtn = page.getByRole("button", { name: /nghe phát âm câu chuẩn/i });
    await expect(audioBtn).toBeVisible();
    await audioBtn.click();

    // 8. Next to Q2
    const nextBtn = page.getByRole("button", { name: /câu tiếp theo/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // 9. Q2: CEO always attend -> "attends"
    await expect(page.getByText(/câu 2 \/ 6/i)).toBeVisible();
    await page.getByRole("button", { name: "attend", exact: true }).click();
    await page.getByRole("button", { name: "attends", exact: true }).click();
    await page.getByRole("button", { name: /xác nhận sửa lỗi/i }).click();
    await expect(page.getByText(/chính xác! \(\+10 điểm\)/i)).toBeVisible();

    // 10. Q3: Test incorrect replacement choice (Error token "provide", choose "is provide")
    await page.getByRole("button", { name: /câu tiếp theo/i }).click();
    await expect(page.getByText(/câu 3 \/ 6/i)).toBeVisible();
    await page.getByRole("button", { name: "provide", exact: true }).click();
    await page.getByRole("button", { name: "is provide", exact: true }).click();
    await page.getByRole("button", { name: /xác nhận sửa lỗi/i }).click();

    await expect(page.getByText(/chưa chính xác/i)).toBeVisible();
    await expect(page.getByText(/sửa đúng là:/i)).toBeVisible();
    await expect(page.getByText(/provides/i).first()).toBeVisible();

    // 11. Loop through remaining questions Q4 to Q6
    const errorStages = [
      { errorToken: "do", correctReplacement: "does" },       // Q4
      { errorToken: "teach", correctReplacement: "teaches" }, // Q5
      { errorToken: "make", correctReplacement: "makes" },    // Q6
    ];

    for (let i = 0; i < errorStages.length; i++) {
      await page.getByRole("button", { name: /câu tiếp theo/i }).click();
      const { errorToken, correctReplacement } = errorStages[i];
      await page.getByRole("button", { name: errorToken, exact: true }).click();
      await page.getByRole("button", { name: correctReplacement, exact: true }).click();
      await page.getByRole("button", { name: /xác nhận sửa lỗi/i }).click();
      await expect(page.getByText(/chính xác! \(\+10 điểm\)/i)).toBeVisible();
    }

    // 12. Finish Stage 2 on last question
    const finishStage2Btn = page.getByRole("button", { name: /xem kết quả chặng 2|hoàn thành/i });
    await expect(finishStage2Btn).toBeVisible();
    await finishStage2Btn.click();

    // 13. Verify return to stage list
    await expect(page.getByRole("button", { name: /vào chặng 2/i })).toBeVisible();

    // 14. Verify LocalStorage has errorHunting progress saved
    const progressInStorage = await page.evaluate(() => {
      return localStorage.getItem("gamehub_tense_progress_v1");
    });
    expect(progressInStorage).not.toBeNull();
    expect(progressInStorage).toContain('"errorHunting"');
  });

  test("US5: completes Stage 3 (Sentence Builder) with tap-to-place, tap-to-remove, reset, audio pronunciation, grammar tips, and storage saving", async ({
    page,
  }) => {
    // 1. Navigate to /tenses/present-simple
    await page.goto("/tenses/present-simple");

    // 2. Go to Practice tab
    const practiceTab = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await practiceTab.click();

    // 3. Enter Stage 3
    const enterStage3Btn = page.getByRole("button", { name: /vào chặng 3/i });
    await expect(enterStage3Btn).toBeVisible();
    await enterStage3Btn.click();

    // 4. Verify Stage 3 UI & Q1
    await expect(page.getByText(/chặng 3 • ghép câu lịch trình & giao tiếp/i)).toBeVisible();
    await expect(page.getByText(/câu 1 \/ 6/i)).toBeVisible();
    await expect(page.getByText(/Lịch trình họp giao ban đầu tuần của công ty/i)).toBeVisible();
    await expect(
      page.getByText(/Công ty chúng tôi luôn tổ chức buổi họp toàn thể vào sáng thứ Hai/i)
    ).toBeVisible();

    // Verify initial placeholder
    await expect(page.getByText(/chạm hoặc kéo thả các từ bên dưới vào đây/i)).toBeVisible();

    // Verify submit button disabled initially
    const submitBtn = page.getByRole("button", { name: /kiểm tra câu/i });
    await expect(submitBtn).toBeDisabled();

    // 5. Test Tap-to-Place tokens
    await page.getByRole("button", { name: /thêm "our company"/i }).click();
    await page.getByRole("button", { name: /thêm "always"/i }).click();

    // Verify placeholder disappears and placed tokens are visible
    await expect(page.getByText(/chạm hoặc kéo thả các từ bên dưới vào đây/i)).not.toBeVisible();
    await expect(page.getByRole("button", { name: /xóa "our company"/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /xóa "always"/i })).toBeVisible();

    // 6. Test Tap-to-Remove token
    await page.getByRole("button", { name: /xóa "always"/i }).click();
    await expect(page.getByRole("button", { name: /thêm "always"/i })).toBeVisible();

    // 7. Test "Đặt lại câu" (Reset button)
    const resetBtn = page.getByRole("button", { name: /đặt lại câu/i });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    await expect(page.getByText(/chạm hoặc kéo thả các từ bên dưới vào đây/i)).toBeVisible();
    await expect(submitBtn).toBeDisabled();

    // 8. Place tokens in correct order for Q1
    const q1Tokens = [
      "Our company",
      "always",
      "holds",
      "an all-hands meeting",
      "on Monday morning.",
    ];
    for (const tok of q1Tokens) {
      await page.getByRole("button", { name: new RegExp(`thêm "${tok}"`, "i") }).click();
    }

    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 9. Verify positive feedback, full sentence, grammar tips, and audio button
    await expect(page.getByText(/chính xác! \(\+10 điểm\)/i)).toBeVisible();
    await expect(
      page.getByText("Our company always holds an all-hands meeting on Monday morning.")
    ).toBeVisible();
    await expect(page.getByText(/Mẹo ngữ pháp \(Vị trí trạng từ chỉ tần suất\):/i)).toBeVisible();

    const audioBtn = page.getByRole("button", { name: /nghe phát âm câu chuẩn/i });
    await expect(audioBtn).toBeVisible();
    await audioBtn.click();

    // 10. Next to Q2
    const nextBtn = page.getByRole("button", { name: /câu tiếp theo/i });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();

    // 11. Test Incorrect Answer order on Q2
    await expect(page.getByText(/câu 2 \/ 6/i)).toBeVisible();
    await page.getByRole("button", { name: /thêm "before the interview\."/i }).click();
    await page.getByRole("button", { name: /thêm "candidate resumes"/i }).click();
    await page.getByRole("button", { name: /kiểm tra câu/i }).click();

    await expect(page.getByText(/chưa chính xác/i)).toBeVisible();
    await expect(page.getByText(/câu chuẩn xác là:/i)).toBeVisible();
    await expect(
      page.getByText("The HR manager regularly reviews candidate resumes before the interview.")
    ).toBeVisible();
    await expect(page.getByText(/Mẹo ngữ pháp \(Chủ ngữ số ít và trạng từ\):/i)).toBeVisible();

    // 12. Loop through remaining questions Q3 to Q6 with correct answers
    const sentenceStages = [
      // Q3
      [
        "We",
        "usually",
        "send",
        "the project progress report",
        "to the client",
        "on Friday.",
      ],
      // Q4
      [
        "The IT support team",
        "never",
        "ignores",
        "urgent requests",
        "from customers.",
      ],
      // Q5
      [
        "The project director",
        "rarely",
        "approves",
        "plans",
        "without a clear budget estimate.",
      ],
      // Q6
      [
        "The branch office",
        "opens",
        "at 8:00 AM",
        "and closes",
        "at 6:00 PM",
        "every day.",
      ],
    ];

    for (let i = 0; i < sentenceStages.length; i++) {
      await page.getByRole("button", { name: /câu tiếp theo/i }).click();
      const currentTokens = sentenceStages[i];
      for (const tok of currentTokens) {
        await page.getByRole("button", { name: new RegExp(`thêm "${tok}"`, "i") }).click();
      }
      await page.getByRole("button", { name: /kiểm tra câu/i }).click();
      await expect(page.getByText(/chính xác! \(\+10 điểm\)/i)).toBeVisible();
    }

    // 13. Finish Stage 3 on last question
    const finishStage3Btn = page.getByRole("button", { name: /xem kết quả chặng 3|hoàn thành/i });
    await expect(finishStage3Btn).toBeVisible();
    await finishStage3Btn.click();

    // 14. Verify return to stage list
    await expect(page.getByRole("button", { name: /vào chặng 3/i })).toBeVisible();

    // 15. Verify LocalStorage has sentenceBuilding progress saved
    const progressInStorage = await page.evaluate(() => {
      return localStorage.getItem("gamehub_tense_progress_v1");
    });
    expect(progressInStorage).not.toBeNull();
    expect(progressInStorage).toContain('"sentenceBuilding"');
  });
});
