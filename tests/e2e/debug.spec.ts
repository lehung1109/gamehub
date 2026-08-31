import { test, expect } from '@playwright/test';

test("Debug Error Hunter Q1", async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  await page.goto("http://localhost:3000/tenses/present-simple");
  
  await page.evaluate(() => {
    sessionStorage.setItem(
      'gamehub-session-present-simple-errorHunting',
      JSON.stringify(["err-01", "err-02", "err-03", "err-04", "err-05", "err-06", "err-07", "err-08", "err-09", "err-10"])
    );
  });
  
  const beforeClick = await page.evaluate(() => sessionStorage.getItem('gamehub-session-present-simple-errorHunting'));
  console.log("BEFORE CLICK:", beforeClick);
  
  await page.getByRole("tab", { name: /luyện tập \d+ chặng/i }).click();
  
  const afterTab = await page.evaluate(() => sessionStorage.getItem('gamehub-session-present-simple-errorHunting'));
  console.log("AFTER TAB:", afterTab);
  
  await page.getByRole("button", { name: /vào chặng 2/i }).click();
  
  await expect(page.getByText(/câu 1 \/ 10/i)).toBeVisible();
});
