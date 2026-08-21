import { test, expect } from "@playwright/test";

test.describe("US5 - Student Default Game Experience (Zero Auth / Full Content)", () => {
  test("Homepage displays all 6 games without requiring login or showing admin controls", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toContainText("GameHub Tiếng Anh");

    // Verify all 6 games are present
    const games = [
      { name: /Học từ vựng/i, url: "/games/flashcard" },
      { name: /Chữ cái & Phonics/i, url: "/games/alphabet" },
      { name: /Nghe hiểu/i, url: "/games/listening" },
      { name: /Đánh vần/i, url: "/games/spelling" },
      { name: /Số & Màu sắc/i, url: "/games/numbers-colors" },
      { name: /Câu đơn giản/i, url: "/games/sentences" },
    ];

    for (const game of games) {
      const link = page.getByRole("link", { name: game.name });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", game.url);
    }

    // Ensure no admin dashboard controls are leaked on student homepage
    await expect(page.getByText("Quản trị hệ thống")).not.toBeVisible();
    await expect(page.getByRole("button", { name: /Đăng xuất/i })).not.toBeVisible();
  });

  test("Flashcard game: displays all 5 default topics and allows learning cards without restrictions", async ({
    page,
  }) => {
    await page.goto("/games/flashcard");

    await expect(
      page.getByRole("heading", { level: 1, name: /Học từ vựng qua Flashcard/i })
    ).toBeVisible();

    // Verify all 5 default topics are displayed
    const expectedTopics = [
      /Động vật/i,
      /Trái cây/i,
      /Gia đình/i,
      /Trường học/i,
      /Cơ thể/i,
    ];

    for (const topicPattern of expectedTopics) {
      await expect(page.getByRole("link", { name: topicPattern })).toBeVisible();
    }

    // Click into Animals topic
    await page.getByRole("link", { name: /Động vật/i }).click();
    await expect(page).toHaveURL(/\/games\/flashcard\/animals/);

    // Verify flashcard default interaction (front -> flip to back -> next)
    await expect(page.getByText("Mặt trước", { exact: true })).toBeVisible();
    const flashcard = page.locator("#flashcard-interactive");
    await flashcard.click();
    await expect(page.getByText("Mặt sau", { exact: true })).toBeVisible();

    const nextBtn = page.getByRole("button", { name: /Tiếp/i });
    await nextBtn.click();
    await expect(page.getByText("2 /")).toBeVisible();

    // Back to topic selection
    await page.getByRole("link", { name: /Chọn chủ đề/i }).click();
    await expect(page).toHaveURL(/\/games\/flashcard/);
  });

  test("Alphabet game: loads all 26 letters (A-Z) in Learn mode and operates Quiz mode normally", async ({
    page,
  }) => {
    await page.goto("/games/alphabet");

    await expect(
      page.getByRole("heading", { level: 1, name: /Chữ cái & Phonics/i })
    ).toBeVisible();

    // Verify letter A and letter Z exist in default grid
    await expect(page.getByRole("button", { name: /^Chữ A\b/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Chữ Z\b/i })).toBeVisible();

    // Switch to Letter B
    const letterB = page.getByRole("button", { name: /^Chữ B\b/i });
    await letterB.click();
    await expect(page.getByLabel(/Từ ví dụ: Ball/i)).toBeVisible();

    // Switch to Quiz mode
    const quizTab = page.getByRole("tab", { name: /Luyện tập \(Quiz\)/i });
    await quizTab.click();
    await expect(page.getByText(/Câu 1 \/ 10/i)).toBeVisible();
    await expect(page.getByText(/Bé hãy nghe và chọn chữ cái đúng nhé!/i)).toBeVisible();
  });

  test("Listening game: provides full word pool and topic filters in default mode", async ({
    page,
  }) => {
    await page.goto("/games/listening");

    await expect(
      page.getByRole("heading", { level: 1, name: /Nghe hiểu/i })
    ).toBeVisible();

    // Verify "Tất cả" filter is present and selected by default
    const allFilter = page.getByRole("button", { name: /Tất cả \(/i });
    await expect(allFilter).toBeVisible();

    // Verify topic filter buttons
    await expect(page.getByRole("button", { name: /Động vật/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Trái cây/i })).toBeVisible();

    // Verify audio replay button and question prompt
    await expect(page.getByRole("button", { name: /Nghe lại âm thanh/i })).toBeVisible();
    await expect(page.getByText(/Bé hãy lắng nghe và chọn hình ảnh đúng nhé!/i)).toBeVisible();
  });

  test("Numbers & Colors game: provides both Numbers (1-20) and Colors (10 colors) with Learn and Quiz modes", async ({
    page,
  }) => {
    await page.goto("/games/numbers-colors");

    await expect(
      page.getByRole("heading", { level: 1, name: /Số & Màu sắc/i })
    ).toBeVisible();

    // Numbers tab default
    await expect(page.getByRole("button", { name: /Số 1 \(One\)/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Số 20 \(Twenty\)/i })).toBeVisible();

    // Switch to Colors category tab
    const colorsTab = page.getByRole("tab", { name: /Màu sắc/i });
    await colorsTab.click();

    // Verify color options
    await expect(page.getByRole("button", { name: /Màu Red \(Đỏ\)/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Màu Blue \(Xanh dương\)/i })).toBeVisible();

    // Switch to Quiz mode under Colors
    const quizTab = page.getByRole("tab", { name: /Luyện tập \(Quiz\)/i });
    await quizTab.click();
    await expect(page.getByText(/Thử thách nhận diện màu sắc/i)).toBeVisible();
  });

  test("Sentences game: provides categories, situation prompt and interactive word board in default mode", async ({
    page,
  }) => {
    await page.goto("/games/sentences");

    await expect(
      page.getByRole("heading", { level: 1, name: /Luyện câu đơn giản/i })
    ).toBeVisible();

    // Verify category filters
    await expect(page.getByRole("button", { name: /Tất cả \(/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Hành động/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Động vật/i })).toBeVisible();

    // Verify question prompt and word bank slots
    await expect(page.getByText(/Câu 1 \//i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Nghe câu mẫu/i })).toBeVisible();
  });

  test("Spelling game: provides topic filters, visual prompt and interactive letter bank in default mode", async ({
    page,
  }) => {
    await page.goto("/games/spelling");

    await expect(
      page.getByRole("heading", { level: 1, name: /Đánh vần & Ghép từ/i })
    ).toBeVisible();

    // Verify topic filters
    await expect(page.getByRole("button", { name: /Tất cả \(/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Động vật/i })).toBeVisible();

    // Verify question prompt and audio button
    await expect(page.getByText(/Từ 1 \//i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Nghe phát âm/i })).toBeVisible();
  });

  test("Direct URL access with undefined or unexpected query params gracefully falls back to default game", async ({
    page,
  }) => {
    // Access with undefined query param or arbitrary params
    await page.goto("/games/alphabet?config=undefined&custom=null");
    await expect(page.getByRole("heading", { level: 1, name: /Chữ cái & Phonics/i })).toBeVisible();

    await page.goto("/games/flashcard?unknown_param=123");
    await expect(page.getByRole("heading", { level: 1, name: /Học từ vựng qua Flashcard/i })).toBeVisible();

    await page.goto("/games/listening?foo=bar");
    await expect(page.getByRole("heading", { level: 1, name: /Nghe hiểu/i })).toBeVisible();
  });
});
