import type { Page } from '@playwright/test';

/**
 * Initializes the browser context with an anonymous student session
 * so games can be tested without the StudentJoinPopup modal blocking interaction.
 */
export async function mockAnonymousStudent(page: Page) {
  await page.addInitScript(() => {
    window.sessionStorage.setItem(
      'gamehub_student_session',
      JSON.stringify({ isAnonymous: true })
    );
  });
}
