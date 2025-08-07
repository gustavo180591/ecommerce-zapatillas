import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../utils/auth';

test.describe('Admin Reviews', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/reviews');
  });

  test('should display reviews list', async ({ page }) => {
    // Check if the page title is visible
    await expect(page.getByRole('heading', { name: 'Gestión de Reseñas' })).toBeVisible();
    
    // Check if the search input is present
    await expect(page.getByPlaceholder('Buscar reseñas...')).toBeVisible();
    
    // Check if the status filter is present
    await expect(page.getByRole('combobox', { name: 'Filtrar por estado' })).toBeVisible();
  });

  test('should filter reviews by status', async ({ page }) => {
    // Mock the API response for filtered reviews
    await page.route('**/api/admin/reviews?status=APPROVED', async route => {
      const response = await route.fetch();
      const json = [];
      await route.fulfill({ response, json });
    });

    // Select 'Approved' from the status filter
    await page.getByRole('combobox', { name: 'Filtrar por estado' }).selectOption('APPROVED');
    
    // Check if the URL was updated with the filter
    await expect(page).toHaveURL(/status=APPROVED/);
  });

  test('should approve a pending review', async ({ page }) => {
    // Mock the API response for updating a review
    await page.route('**/api/admin/reviews/*', async route => {
      if (route.request().method() === 'PATCH') {
        const json = { id: 'review-1', status: 'APPROVED' };
        await route.fulfill({ json });
      }
    });

    // Find and click the 'Approve' button for the first pending review
    const reviewCard = page.locator('[data-testid="review-card"]').first();
    await reviewCard.getByRole('button', { name: 'Aprobar' }).click();
    
    // Check if the success toast is shown
    await expect(page.getByText('Estado de la reseña actualizado')).toBeVisible();
  });

  test('should search for reviews', async ({ page }) => {
    const searchTerm = 'excelente';
    
    // Mock the API response for search
    await page.route(`**/api/admin/reviews?search=${searchTerm}`, async route => {
      const response = await route.fetch();
      const json = [];
      await route.fulfill({ response, json });
    });

    // Type in the search input and press Enter
    await page.getByPlaceholder('Buscar reseñas...').fill(searchTerm);
    await page.keyboard.press('Enter');
    
    // Check if the URL was updated with the search term
    await expect(page).toHaveURL(new RegExp(`search=${searchTerm}`));
  });

  test('should navigate to product page from review', async ({ page, context }) => {
    // Mock the API response for reviews
    await page.route('**/api/admin/reviews**', async route => {
      const response = await route.fetch();
      const json = [{
        id: 'review-1',
        title: 'Great product!',
        product: { id: 'product-1', name: 'Test Product', slug: 'test-product' }
      }];
      await route.fulfill({ response, json });
    });

    // Reload the page to get the mocked data
    await page.reload();
    
    // Click on the product name in the review
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: 'Test Product' }).click()
    ]);
    
    // Check if the new page has the correct URL
    await newPage.waitForLoadState();
    await expect(newPage).toHaveURL(/producto/test-product/);
  });
});
