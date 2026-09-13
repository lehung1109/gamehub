import { test, expect } from '@playwright/test';
import { mockAnonymousStudent } from './helpers/auth-helper';

test.describe('Curriculum Roadmap & Quest Journey Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockAnonymousStudent(page);
  });

  test('1. Viewing roadmap, inspecting HUD stars and World Selector tabs', async ({ page }) => {
    await page.goto('/roadmap');

    // Verify roadmap page header
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText(/Lộ Trình Học Tập|Lộ trình/i);

    // Verify HUD stars counter is visible and initially shows 0 stars
    const hudStars = page.locator('[data-testid="roadmap-hud-stars"]');
    await expect(hudStars).toBeVisible();
    await expect(hudStars).toContainText('0');

    // Verify World Selector tablist
    const tablist = page.getByRole('tablist', { name: /Chọn thế giới học tập/i });
    await expect(tablist).toBeVisible();

    // Verify tabs for worlds are displayed
    const tabs = tablist.getByRole('tab');
    await expect(tabs).toHaveCount(4);
    await expect(tabs.nth(0)).toContainText('Đảo Thám Hiểm');
    await expect(tabs.nth(1)).toContainText('Vương Quốc Ghép Từ');
    await expect(tabs.nth(2)).toContainText('Xứ Sở Ngữ Pháp & Tư Duy');
    await expect(tabs.nth(3)).toContainText('Đấu Trường Chuyên Nghiệp');

    // World 1 should be selected by default
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
  });

  test('2. Verifying node 1 (w1-n1) is unlocked while node 2 (w1-n2) and later nodes are initially locked', async ({
    page,
  }) => {
    await page.goto('/roadmap');

    // Verify node 1 (w1-n1) is unlocked
    const firstNode = page.locator('[data-testid="roadmap-node-w1-n1"]');
    await expect(firstNode).toBeVisible();
    await expect(firstNode.locator('[data-testid="node-locked-icon"]')).toHaveCount(0);
    await expect(firstNode).toHaveAttribute('aria-label', /Sẵn sàng chơi/i);

    // Verify node 2 (w1-n2) is locked
    const secondNode = page.locator('[data-testid="roadmap-node-w1-n2"]');
    await expect(secondNode).toBeVisible();
    await expect(secondNode.locator('[data-testid="node-locked-icon"]')).toBeVisible();
    await expect(secondNode).toHaveAttribute('aria-label', /Đang khóa/i);

    // Verify boss node (w1-n6) is locked and has boss crown
    const bossNode = page.locator('[data-testid="roadmap-node-w1-n6"]');
    await expect(bossNode).toBeVisible();
    await expect(bossNode.locator('[data-testid="node-boss-crown"]')).toBeVisible();
    await expect(bossNode.locator('[data-testid="node-locked-icon"]')).toBeVisible();
  });

  test('3. Clicking node 1 opens roadmap-node-modal displaying stage metadata and Chơi ngay CTA button', async ({
    page,
  }) => {
    await page.goto('/roadmap');

    const firstNode = page.locator('[data-testid="roadmap-node-w1-n1"]');
    await firstNode.click();

    // Verify modal is displayed
    const modal = page.locator('[data-testid="roadmap-node-modal"]');
    await expect(modal).toBeVisible();

    // Verify stage title and metadata
    await expect(modal.locator('#roadmap-modal-title')).toContainText('Chữ cái & Phonics');
    await expect(modal).toContainText('Chặng 1');
    await expect(modal).toContainText('alphabet');
    await expect(modal).toContainText('+50 XP');
    await expect(modal).toContainText('+5 Sao');

    // Verify 'Chơi ngay' CTA button is present and active
    const playCta = modal.getByRole('link', { name: /Chơi ngay/i });
    await expect(playCta).toBeVisible();
    await expect(playCta).toHaveAttribute('href', '/games/alphabet?roadmapNode=w1-n1');

    // Verify modal can be closed via close button
    const closeBtn = modal.getByRole('button', { name: /Đóng/i }).first();
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('4. Clicking Chơi ngay navigates to the target mini-game route with ?roadmapNode=w1-n1', async ({
    page,
  }) => {
    await page.goto('/roadmap');

    // Click Node 1
    const firstNode = page.locator('[data-testid="roadmap-node-w1-n1"]');
    await firstNode.click();

    const modal = page.locator('[data-testid="roadmap-node-modal"]');
    await expect(modal).toBeVisible();

    // Click 'Chơi ngay'
    const playCta = modal.getByRole('link', { name: /Chơi ngay/i });
    await playCta.click();

    // Verify URL contains target route and roadmapNode query parameter
    await expect(page).toHaveURL(/\/games\/alphabet\?roadmapNode=w1-n1/);

    // Verify the game page has loaded
    await expect(page.locator('h1')).toContainText(/Chữ cái & Phonics|Bảng chữ cái/i);
  });

  test('5. World gating verification: switching to a locked world displays locked indicator and disabled stage launch', async ({
    page,
  }) => {
    await page.goto('/roadmap');

    // World 2 tab
    const world2Tab = page.getByRole('tab', { name: /Vương Quốc Ghép Từ/i });
    await expect(world2Tab).toBeVisible();
    await expect(world2Tab).toContainText(/Cần 12 sao/i);

    // Click on World 2 tab
    await world2Tab.click();
    await expect(world2Tab).toHaveAttribute('aria-selected', 'true');

    // Check that World 2 stage 1 (w2-n1) is displayed as locked
    const w2FirstNode = page.locator('[data-testid="roadmap-node-w2-n1"]');
    await expect(w2FirstNode).toBeVisible();
    await expect(w2FirstNode.locator('[data-testid="node-locked-icon"]')).toBeVisible();

    // Click World 2 stage 1 node
    await w2FirstNode.click();

    // Verify modal opens with locked world alert message
    const modal = page.locator('[data-testid="roadmap-node-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(/Thế giới này chưa được mở khóa/i);

    // Verify the launch button is disabled with text "Chưa mở khóa"
    const disabledBtn = modal.getByRole('button', { name: /Chưa mở khóa/i });
    await expect(disabledBtn).toBeVisible();
    await expect(disabledBtn).toBeDisabled();
  });

  test('6. Direct access and homepage navigation via the 🗺️ Lộ trình học button', async ({
    page,
  }) => {
    // Start at homepage
    await page.goto('/');

    // Locate the roadmap link on homepage
    const roadmapLink = page.getByRole('link', { name: /Lộ trình học/i }).first();
    await expect(roadmapLink).toBeVisible();

    // Click the roadmap link
    await roadmapLink.click();

    // Verify navigation to /roadmap
    await expect(page).toHaveURL(/\/roadmap/);
    await expect(page.locator('h1')).toContainText(/Lộ Trình Học Tập|Lộ trình/i);

    // Verify map is rendered
    const firstNode = page.locator('[data-testid="roadmap-node-w1-n1"]');
    await expect(firstNode).toBeVisible();
  });
});
