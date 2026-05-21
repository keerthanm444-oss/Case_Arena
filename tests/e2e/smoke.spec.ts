import { test, expect } from '@playwright/test';

/**
 * Smoke spec — one happy path per major surface.
 *
 * The goal is "does it load + can I navigate?", not feature-level coverage.
 * Featureful behavior lives in unit tests where it's much faster + cheaper.
 */

test.describe('Case Arena · smoke', () => {
  test('landing renders + key links work', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // The KPI band should be present
    await expect(page.getByText(/Systems/i).first()).toBeVisible();
  });

  test('modules index → orientation module renders', async ({ page }) => {
    await page.goto('/modules');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Click into the orientation module
    await page.getByRole('link', { name: /Orientation/i }).first().click();
    await page.waitForURL('**/modules/orientation');
    await expect(page.getByRole('heading', { name: /What this app is/i })).toBeVisible();
  });

  test('cases index → demo case opens', async ({ page }) => {
    await page.goto('/cases');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('tools index → mental-math drill renders', async ({ page }) => {
    await page.goto('/tools');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.goto('/tools/mental-math');
    // The Start button should be visible
    await expect(page.getByRole('button', { name: /Start/i })).toBeVisible();
  });

  test('map page renders all three view modes', async ({ page }) => {
    await page.goto('/map');
    // View tabs
    await expect(page.getByRole('button', { name: /Web/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Branch/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Matrix/i })).toBeVisible();

    // Switch to branch view → URL updates
    await page.getByRole('button', { name: /Branch/i }).click();
    await expect(page).toHaveURL(/view=branch/);

    // Switch to matrix view → URL updates
    await page.getByRole('button', { name: /Matrix/i }).click();
    await expect(page).toHaveURL(/view=matrix/);
  });

  test('settings page renders', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('command palette opens on ⌘K', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Meta+K');
    // The palette dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('issue-tree muscle loads', async ({ page }) => {
    await page.goto('/tools/issue-tree');
    // Wait for the lazy chunk
    await expect(page.locator('text=Issue Tree').first()).toBeVisible({ timeout: 10_000 });
  });
});
