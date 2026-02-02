
import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

for (const viewport of viewports) {
  test(`capture screenshot for ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('http://localhost:3000');
    
    // Wait for the app to load (Auth screen initially)
    await page.waitForSelector('h1:has-text("NutriPulse")');
    
    // Capture Auth screen
    await page.screenshot({ path: `auth_${viewport.name}.png` });
    
    // Log in (demo mode allows any email)
    await page.fill('input[type="email"]', 'demo@nutripulse.io');
    await page.fill('input[type="password"]', 'password');
    await page.click('button:has-text("LOG IN")');
    
    // Wait for Onboarding or Dashboard
    await page.waitForTimeout(2000); // Wait for transition
    
    if (await page.isVisible('h1:has-text("Let\'s build your profile")')) {
        await page.screenshot({ path: `onboarding_${viewport.name}.png` });
        
        // Skip through onboarding
        await page.fill('input[placeholder="Your name"]', 'Demo User');
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(500);
        await page.click('button:has-text("Continue")');
        await page.waitForTimeout(500);
        await page.click('button:has-text("Enter Dashboard")');
    }
    
    // Now on Dashboard
    await page.waitForSelector('h1:has-text("Good")'); // Greeting
    await page.screenshot({ path: `dashboard_${viewport.name}.png`, fullPage: true });
    
    // Check mobile menu if on mobile/tablet
    if (viewport.width < 1024) {
        // Use the aria-label we just added
        await page.click('button[aria-label="Open Menu"]');
        await page.waitForTimeout(500);
        await page.screenshot({ path: `sidebar_mobile_${viewport.name}.png` });
        // Close it
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
    }
  });
}
