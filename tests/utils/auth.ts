import { Page } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  // Mock the login process
  await page.route('**/api/auth/session', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'ADMIN'
        }
      })
    });
  });

  // Mock the isAdmin check
  await page.route('**/api/admin/check', (route) => {
    return route.fulfill({
      status: 200,
      body: JSON.stringify({ isAdmin: true })
    });
  });

  // Navigate to the admin page which will trigger the auth check
  await page.goto('/admin');
  
  // Wait for the admin layout to load
  await page.waitForSelector('text=Panel de Administración');
}

export async function loginAsUser(page: Page) {
  // Similar to loginAsAdmin but with regular user permissions
  await page.route('**/api/auth/session', (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'user@example.com',
          role: 'USER'
        }
      })
    });
  });

  // Mock the isAdmin check to return false
  await page.route('**/api/admin/check', (route) => {
    return route.fulfill({
      status: 403,
      body: JSON.stringify({ error: 'Unauthorized' })
    });
  });

  // Navigate to the home page which will trigger the auth check
  await page.goto('/');
  await page.waitForLoadState('networkidle');
}
