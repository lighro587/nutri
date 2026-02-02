
import { test, expect } from '@playwright/test';

test('Nutrition page responsiveness and terminology', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Handle onboarding if it shows up (since it's a new browser instance)
  // Or just check if we are on Auth page and log in
  const loginButton = page.getByRole('button', { name: /INITIALIZE SESSION|GRANT ACCESS/i });
  if (await loginButton.isVisible()) {
    await page.getByPlaceholder(/Name/i).fill('Test User');
    await page.getByPlaceholder(/Email/i).fill('test@example.com');
    await page.getByPlaceholder(/Password/i).fill('password123');
    await loginButton.click();
    
    // Finish onboarding if needed
    const startButton = page.getByRole('button', { name: /COMMENCE PROTOCOL/i });
    if (await startButton.isVisible()) {
        await startButton.click();
        await page.getByRole('button', { name: /SYNC IDENTITY/i }).click();
    }
  }

  // Navigate to Nutrition
  await page.getByRole('button', { name: /Nutrition/i }).click();

  // Check for "Calories" instead of "Energy"
  await expect(page.locator('body')).toContainText(/Calories/i);
  await expect(page.locator('body')).not.toContainText(/Energy Units/i);

  // Take screenshots at different breakpoints
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    // Wait for animations
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `nutrition_${vp.name}.png`, fullPage: true });
  }
});
