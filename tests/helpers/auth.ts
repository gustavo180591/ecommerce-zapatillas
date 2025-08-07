import { Page } from '@playwright/test';

/**
 * Creates a test user for end-to-end testing
 */
export async function createTestUser(page: Page, email: string, password: string) {
  // Navigate to registration page
  await page.goto('/register');
  
  // Fill registration form
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="passwordConfirm"]', password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for redirect to home page or dashboard
  await page.waitForURL('**/');
}

/**
 * Deletes a test user after tests
 */
export async function deleteTestUser(page: Page, email: string, password: string) {
  // This would normally call an API endpoint to delete the test user
  // For now, we'll just log that we would delete the user
  console.log(`[TEST CLEANUP] Would delete test user: ${email}`);
  
  // In a real implementation, you might do something like:
  // await page.request.post('/api/test/delete-user', {
  //   data: { email }
  // });
}

/**
 * Logs in a test user
 */
export async function loginTestUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/');
}
