import { Page } from '@playwright/test';

// Admin credentials for testing
export const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'password123'
};

/**
 * Logs in as an admin user
 * @param page - Playwright page instance
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login');
  
  // Fill in login form
  await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
  await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForURL('/admin/dashboard');
}

/**
 * Checks if the user is logged in as admin
 * @param page - Playwright page instance
 */
export async function isAdminLoggedIn(page: Page): Promise<boolean> {
  try {
    await page.waitForURL('/admin/**', { timeout: 1000 });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Ensures the user is logged in as admin
 * @param page - Playwright page instance
 */
export async function ensureAdminLoggedIn(page: Page): Promise<void> {
  if (!(await isAdminLoggedIn(page))) {
    await loginAsAdmin(page);
  }
}
