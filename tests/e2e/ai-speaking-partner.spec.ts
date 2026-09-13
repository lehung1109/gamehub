import { test, expect } from '@playwright/test';
import { mockAnonymousStudent } from './helpers/auth-helper';

test.describe('AI Speaking Partner E2E Journey', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page);
  });

  test('navigates from homepage to AI speaking hub via topbar link and hero CTA', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. Verify and click topbar speaking link
    const topbarLink = page.locator('[data-testid="speaking-topbar-link"]');
    await expect(topbarLink).toBeVisible();
    await topbarLink.click();

    await expect(page).toHaveURL('/speaking');
    await expect(page.locator('[data-testid="speaking-hub"]')).toBeVisible();

    // 2. Return to homepage and test hero CTA button
    await page.goto('/');
    const ctaButton = page.locator('[data-testid="speaking-cta-button"]');
    await expect(ctaButton).toBeVisible();
    await ctaButton.click();

    await expect(page).toHaveURL('/speaking');
    await expect(page.locator('[data-testid="speaking-hub"]')).toBeVisible();
  });

  test('filters scenarios by CEFR level and supports persona selection in Speaking Hub', async ({
    page,
  }) => {
    await page.goto('/speaking');
    await expect(page.locator('[data-testid="speaking-hub"]')).toBeVisible();

    // Verify all CEFR filter chips are present
    const filterAll = page.locator('[data-testid="filter-all"]');
    const filterA1 = page.locator('[data-testid="filter-a1"]');
    const filterA2 = page.locator('[data-testid="filter-a2"]');
    const filterB1 = page.locator('[data-testid="filter-b1"]');
    const filterB2 = page.locator('[data-testid="filter-b2"]');

    await expect(filterAll).toBeVisible();
    await expect(filterA1).toBeVisible();
    await expect(filterA2).toBeVisible();
    await expect(filterB1).toBeVisible();
    await expect(filterB2).toBeVisible();

    // Click A1 filter chip
    await filterA1.click();

    // A1 scenarios should remain visible
    await expect(page.locator('[data-testid="scenario-card-ordering-cafe"]')).toBeVisible();
    await expect(page.locator('[data-testid="scenario-card-making-friends"]')).toBeVisible();

    // Non-A1 scenarios should be hidden
    await expect(page.locator('[data-testid="scenario-card-asking-directions"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="scenario-card-hotel-checkin"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="scenario-card-free-talk"]')).not.toBeVisible();

    // Switch back to "All levels"
    await filterAll.click();
    await expect(page.locator('[data-testid="scenario-card-hotel-checkin"]')).toBeVisible();
    await expect(page.locator('[data-testid="scenario-card-free-talk"]')).toBeVisible();

    // Verify persona selector interactivity
    const personaSelector = page.locator('[data-testid="persona-selector"]');
    await expect(personaSelector).toBeVisible();

    const personaEmma = page.locator('[data-testid="persona-barista-emma"]');
    await expect(personaEmma).toBeVisible();
    await personaEmma.click();

    // Persona should have active styling (border-amber-500)
    await expect(personaEmma).toHaveClass(/border-amber-500/);
  });

  test('enters Speaking Arena, interacts with hints, and completes an interactive dialogue turn', async ({
    page,
  }) => {
    await page.goto('/speaking');

    // Launch ordering-cafe scenario
    const startCafeBtn = page.locator('[data-testid="start-scenario-ordering-cafe"]');
    await expect(startCafeBtn).toBeVisible();
    await startCafeBtn.click();

    // Verify URL and Speaking Arena loaded
    await expect(page).toHaveURL(/\/speaking\/ordering-cafe/);
    await expect(page.locator('[data-testid="speaking-arena"]')).toBeVisible();

    // Verify initial tutor opening message
    const tutorBubble = page.locator('[data-testid="turn-tutor"]').first();
    await expect(tutorBubble).toBeVisible();
    await expect(tutorBubble).toContainText('Sunshine Café');

    // Verify scaffolding hints
    const hintsContainer = page.locator('[data-testid="scaffolding-hints"]');
    await expect(hintsContainer).toBeVisible();

    const starterHint = page.locator('[data-testid="hint-starter"]');
    await expect(starterHint).toBeVisible();
    await expect(starterHint).toContainText('A hot coffee, please.');

    // Clicking starter hint populates the text fallback input
    await starterHint.click();
    const textInput = page.locator('[data-testid="text-input-fallback"]');
    await expect(textInput).toHaveValue('A hot coffee, please.');

    // Submit turn
    const submitBtn = page.locator('[data-testid="text-submit-button"]');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Verify student turn bubble appears with accuracy score
    const studentBubble = page.locator('[data-testid="turn-student"]').first();
    await expect(studentBubble).toBeVisible();
    await expect(studentBubble).toContainText('A hot coffee, please.');

    const accuracyScore = studentBubble.locator('[data-testid="turn-accuracy-score"]');
    await expect(accuracyScore).toBeVisible();
    await expect(accuracyScore).toContainText('%');

    // Verify next tutor response arrives
    const secondTutorBubble = page.locator('[data-testid="turn-tutor"]').nth(1);
    await expect(secondTutorBubble).toBeVisible({ timeout: 10000 });
    await expect(secondTutorBubble).toContainText(/Great choice|hot or iced/i);
  });

  test('allows returning to speaking hub from the arena using the back button', async ({
    page,
  }) => {
    await page.goto('/speaking/ordering-cafe');
    await expect(page.locator('[data-testid="speaking-arena"]')).toBeVisible();

    const backBtn = page.locator('[data-testid="back-to-hub-link"]');
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    await expect(page).toHaveURL('/speaking');
    await expect(page.locator('[data-testid="speaking-hub"]')).toBeVisible();
  });

  test('completes a full dialogue session and displays the podium modal with star rating', async ({
    page,
  }) => {
    await page.goto('/speaking/ordering-cafe');
    await expect(page.locator('[data-testid="speaking-arena"]')).toBeVisible();

    const turnsToSend = [
      'A hot coffee, please.',
      'Hot and medium size, please.',
      'A croissant, please.',
      "I'll pay with cash.",
    ];

    const input = page.locator('[data-testid="text-input-fallback"]');
    const submit = page.locator('[data-testid="text-submit-button"]');

    for (let i = 0; i < turnsToSend.length; i++) {
      const phrase = turnsToSend[i];
      await input.fill(phrase);
      await submit.click();

      // Wait for student turn to be recorded
      await expect(page.locator('[data-testid="turn-student"]')).toHaveCount(i + 1, {
        timeout: 10000,
      });

      if (i < turnsToSend.length - 1) {
        // Wait for tutor response before next turn
        await expect(page.locator('[data-testid="turn-tutor"]')).toHaveCount(i + 2, {
          timeout: 10000,
        });
      }
    }

    // After 4 turns, the podium modal should appear
    const podiumModal = page.locator('[data-testid="speaking-podium-modal"]');
    await expect(podiumModal).toBeVisible({ timeout: 10000 });

    await expect(podiumModal.locator('[data-testid="star-rating"]')).toBeVisible();
    await expect(podiumModal.locator('[data-testid="overall-score-badge"]')).toBeVisible();
    await expect(podiumModal.locator('[data-testid="pronunciation-score-badge"]')).toBeVisible();

    // Click back to hub button inside podium modal
    const modalBackBtn = podiumModal.locator('[data-testid="back-to-hub-button"]');
    await expect(modalBackBtn).toBeVisible();
    await modalBackBtn.click();

    await expect(page).toHaveURL('/speaking');
    await expect(page.locator('[data-testid="speaking-hub"]')).toBeVisible();
  });
});
