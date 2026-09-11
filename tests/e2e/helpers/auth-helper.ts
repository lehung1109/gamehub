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

/**
 * Initializes the browser context with an authenticated classroom student session
 * so class gamification, badges, and leaderboards can be tested.
 */
export async function mockClassStudent(
  page: Page,
  options: { classCode: string; studentName: string; className?: string } = {
    classCode: 'TEST101',
    studentName: 'Bé An',
    className: 'Lớp 1A',
  }
) {
  await page.addInitScript((opts) => {
    const session = {
      classCode: opts.classCode,
      studentName: opts.studentName,
      className: opts.className || 'Lớp 1A',
      isAnonymous: false,
    };
    window.sessionStorage.setItem('gamehub_student_session', JSON.stringify(session));
    window.localStorage.setItem('gamehub_student_session', JSON.stringify(session));
  }, options);
}
