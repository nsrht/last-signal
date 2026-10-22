import { test, expect } from '@playwright/test';

test.describe('LAST SIGNAL — E2E Player Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main command shell and canvas visualizer', async ({ page }) => {
    await expect(page.locator('.station-title')).toContainText('LAST SIGNAL');
    await expect(page.locator('#station-canvas')).toBeVisible();
  });

  test('should navigate between tabs and update right info panel', async ({ page }) => {
    await page.click('#btn-menu-new');
    await page.waitForTimeout(200);

    // Click Reactor tab
    await page.click('button[data-tab="reactor"]');
    await expect(page.locator('.right-info-panel')).toContainText('Reaktör Tanılama');

    // Click Life Support tab
    await page.click('button[data-tab="lifesupport"]');
    await expect(page.locator('.right-info-panel')).toContainText('Yaşam Desteği Tanılama');

    // Click Communications tab
    await page.click('button[data-tab="comms"]');
    await expect(page.locator('.right-info-panel')).toContainText('Sinyal Dekoderi');
  });

  test('should toggle simulation speed controls', async ({ page }) => {
    await page.click('#btn-menu-new');
    await page.waitForTimeout(200);

    await page.click('#speed-2x');
    await page.waitForTimeout(200);
    await expect(page.locator('#speed-2x')).toHaveClass(/btn-primary/);
  });

  test('should tune signal frequency and perform auto-lock', async ({ page }) => {
    await page.click('#btn-menu-new');
    await page.waitForTimeout(200);

    await page.click('button[data-tab="comms"]');
    await page.waitForTimeout(200);
    await page.click('#btn-tune-target');
    await page.waitForTimeout(200);
    await expect(page.locator('#comms-freq-text')).toContainText('1420.4 MHz');
  });

  test('should save game progress via settings tab', async ({ page }) => {
    await page.click('#btn-menu-new');
    await page.waitForTimeout(200);

    await page.click('button[data-tab="settings"]');
    await page.click('#btn-save-game');
    await expect(page.locator('.right-info-panel')).toContainText('Sistem Ayarları');
  });
});
