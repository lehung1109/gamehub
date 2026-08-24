import { test, expect } from "@playwright/test";

test.describe("Present Simple Conjugation - Randomization & Session Persistence", () => {
  test("US1 - Conjugation Expansion: F5 reload preserves questions, but a new session resets them", async ({
    page,
    browser,
  }) => {
    // 1. Visit the Present Simple lesson and go to Practice tab -> Stage 1
    await page.goto("/tenses/present-simple");
    const practiceTab = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await practiceTab.click();

    const enterStage1Btn = page.getByRole("button", { name: /vào chặng 1/i });
    await expect(enterStage1Btn).toBeVisible();
    await enterStage1Btn.click();

    await expect(page.getByText(/chặng 1 • chia động từ/i)).toBeVisible();

    // 2. Grab the text of the first question (the scenario or the sentence before) to identify it
    // The scenario is rendered in a <p> with class line-clamp-1 xl:line-clamp-2
    // We can just get the text of the sentence block.
    // Let's get the scenario text which is unique per question.
    // It's the text inside the p tag with class line-clamp-1
    const scenarioLocator = page.locator("p.line-clamp-1, p.line-clamp-2");
    await expect(scenarioLocator).toBeVisible();
    const firstSessionScenario = await scenarioLocator.textContent();

    // 3. Reload the page (F5)
    await page.reload();

    // Go back to Stage 1
    const practiceTabAfterReload = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await practiceTabAfterReload.click();
    
    // Check if progress is saved or we need to enter Stage 1 again
    // Usually it resets the stage view, so we need to click "Vào Chặng 1" again unless we implemented URL persistence.
    // According to TenseLessonContainer, it doesn't persist currentStage on reload, so we click enter again.
    const enterStage1BtnAfterReload = page.getByRole("button", { name: /vào chặng 1/i });
    await expect(enterStage1BtnAfterReload).toBeVisible();
    await enterStage1BtnAfterReload.click();

    await expect(page.getByText(/chặng 1 • chia động từ/i)).toBeVisible();

    // 4. Verify the question is exactly the same after F5
    const reloadedScenarioLocator = page.locator("p.line-clamp-1, p.line-clamp-2");
    await expect(reloadedScenarioLocator).toBeVisible();
    const reloadedScenario = await reloadedScenarioLocator.textContent();
    
    expect(reloadedScenario).toEqual(firstSessionScenario);

    // 5. Simulate a new session by clearing sessionStorage or opening a new context
    // The easiest way is to use a new browser context.
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto("/tenses/present-simple");
    const newPracticeTab = newPage.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await newPracticeTab.click();

    const newEnterStage1Btn = newPage.getByRole("button", { name: /vào chặng 1/i });
    await expect(newEnterStage1Btn).toBeVisible();
    await newEnterStage1Btn.click();

    await expect(newPage.getByText(/chặng 1 • chia động từ/i)).toBeVisible();

    // 6. Verify the question in the new session is NOT the same (most of the time, due to randomization)
    // Note: there is a small chance (1/15) that the first question is the same by random chance.
    // But since it's an E2E test, we could check the whole set of 8 questions, or just accept the slight flakiness,
    // OR we could check the set of 8 questions. Let's just check the first one for simplicity, 
    // or collect all 8 scenarios and compare the arrays.
    
    // Better: collect all 8 scenarios in session 1, and all 8 in session 2, and compare arrays to ensure they are different.
    // Wait, the test might be too slow if we click next 8 times. We can just evaluate sessionStorage!
    const session1Storage = await page.evaluate(() => sessionStorage.getItem('gamehub-session-present-simple-conjugation'));
    const session2Storage = await newPage.evaluate(() => sessionStorage.getItem('gamehub-session-present-simple-conjugation'));

    expect(session1Storage).toBeTruthy();
    expect(session2Storage).toBeTruthy();
    
    // We expect the stored question IDs to be different because they are randomized
    expect(session1Storage).not.toEqual(session2Storage);

    await newContext.close();
  });

  test("US2 - Error Hunting Expansion: F5 reload preserves questions, but a new session resets them", async ({
    page,
    browser,
  }) => {
    await page.goto("/tenses/present-simple");
    const practiceTab = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await practiceTab.click();

    const enterStage2Btn = page.getByRole("button", { name: /vào chặng 2/i });
    await expect(enterStage2Btn).toBeVisible();
    await enterStage2Btn.click();

    await expect(page.getByText(/chặng 2 • săn lỗi sai/i)).toBeVisible();

    const scenarioLocator = page.locator("p.line-clamp-1, p.line-clamp-2");
    await expect(scenarioLocator).toBeVisible();
    const firstSessionScenario = await scenarioLocator.textContent();

    await page.reload();

    const practiceTabAfterReload = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await practiceTabAfterReload.click();
    
    const enterStage2BtnAfterReload = page.getByRole("button", { name: /vào chặng 2/i });
    await expect(enterStage2BtnAfterReload).toBeVisible();
    await enterStage2BtnAfterReload.click();

    await expect(page.getByText(/chặng 2 • săn lỗi sai/i)).toBeVisible();

    const reloadedScenarioLocator = page.locator("p.line-clamp-1, p.line-clamp-2");
    await expect(reloadedScenarioLocator).toBeVisible();
    const reloadedScenario = await reloadedScenarioLocator.textContent();
    
    expect(reloadedScenario).toEqual(firstSessionScenario);

    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto("/tenses/present-simple");
    const newPracticeTab = newPage.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await newPracticeTab.click();

    const newEnterStage2Btn = newPage.getByRole("button", { name: /vào chặng 2/i });
    await expect(newEnterStage2Btn).toBeVisible();
    await newEnterStage2Btn.click();

    await expect(newPage.getByText(/chặng 2 • săn lỗi sai/i)).toBeVisible();

    const session1Storage = await page.evaluate(() => sessionStorage.getItem('gamehub-session-present-simple-errorHunting'));
    const session2Storage = await newPage.evaluate(() => sessionStorage.getItem('gamehub-session-present-simple-errorHunting'));

    expect(session1Storage).toBeTruthy();
    expect(session2Storage).toBeTruthy();
    
    expect(session1Storage).not.toEqual(session2Storage);

    await newContext.close();
  });

  test("US3 - Sentence Building Expansion: F5 reload preserves questions, but a new session resets them", async ({
    page,
    browser,
  }) => {
    await page.goto("/tenses/present-simple");
    const practiceTab = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await practiceTab.click();

    const enterStage3Btn = page.getByRole("button", { name: /vào chặng 3/i });
    await expect(enterStage3Btn).toBeVisible();
    await enterStage3Btn.click();

    await expect(page.getByText(/chặng 3 • ghép câu/i)).toBeVisible();

    const scenarioLocator = page.locator("p.line-clamp-1, p.line-clamp-2");
    await expect(scenarioLocator).toBeVisible();
    const firstSessionScenario = await scenarioLocator.textContent();

    await page.reload();

    const practiceTabAfterReload = page.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await practiceTabAfterReload.click();
    
    const enterStage3BtnAfterReload = page.getByRole("button", { name: /vào chặng 3/i });
    await expect(enterStage3BtnAfterReload).toBeVisible();
    await enterStage3BtnAfterReload.click();

    await expect(page.getByText(/chặng 3 • ghép câu/i)).toBeVisible();

    const reloadedScenarioLocator = page.locator("p.line-clamp-1, p.line-clamp-2");
    await expect(reloadedScenarioLocator).toBeVisible();
    const reloadedScenario = await reloadedScenarioLocator.textContent();
    
    expect(reloadedScenario).toEqual(firstSessionScenario);

    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    await newPage.goto("/tenses/present-simple");
    const newPracticeTab = newPage.getByRole("tab", { name: /luyện tập 3 chặng/i });
    await newPracticeTab.click();

    const newEnterStage3Btn = newPage.getByRole("button", { name: /vào chặng 3/i });
    await expect(newEnterStage3Btn).toBeVisible();
    await newEnterStage3Btn.click();

    await expect(newPage.getByText(/chặng 3 • ghép câu/i)).toBeVisible();

    const session1Storage = await page.evaluate(() => sessionStorage.getItem('gamehub-session-present-simple-sentenceBuilding'));
    const session2Storage = await newPage.evaluate(() => sessionStorage.getItem('gamehub-session-present-simple-sentenceBuilding'));

    expect(session1Storage).toBeTruthy();
    expect(session2Storage).toBeTruthy();
    
    expect(session1Storage).not.toEqual(session2Storage);

    await newContext.close();
  });
});
