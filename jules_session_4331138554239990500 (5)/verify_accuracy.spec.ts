
import { test, expect } from '@playwright/test';

test('Verify food search and manual accuracy correction', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Login
  await page.getByPlaceholder(/Name/i).fill('Accuracy Tester');
  await page.getByPlaceholder(/Email/i).fill('test@accuracy.com');
  await page.getByPlaceholder(/Password/i).fill('password123');
  await page.getByRole('button', { name: /INITIALIZE SESSION|GRANT ACCESS/i }).click();

  // Onboarding
  const startButton = page.getByRole('button', { name: /COMMENCE PROTOCOL/i });
  if (await startButton.isVisible()) {
      await startButton.click();
      await page.getByRole('button', { name: /SYNC IDENTITY/i }).click();
  }

  // Search for apple in header
  await page.getByPlaceholder(/Search nutrients|Locate habit/i).first().fill('apple');
  await page.keyboard.press('Enter');

  // Wait for result
  await expect(page.getByText(/Apple/i)).toBeVisible();
  await expect(page.getByText(/52/)).toBeVisible(); // Default apple calories

  // Correct identity
  await page.getByRole('button', { name: /Correct Identity/i }).click();

  // Change calories
  const caloriesInput = page.locator('input[type="number"]').first();
  await caloriesInput.clear();
  await caloriesInput.fill('100');

  // Save identity
  await page.getByRole('button', { name: /Save Identity/i }).click();
  await expect(page.getByText(/100/)).toBeVisible();

  // Commit
  await page.getByRole('button', { name: /Commit Intake Record/i }).click();

  // Verify totals in dashboard (which we should be on or navigate to)
  await page.getByRole('button', { name: /Dashboard/i }).click();
  await expect(page.locator('text=100').first()).toBeVisible(); // Should show up in today's totals
});
