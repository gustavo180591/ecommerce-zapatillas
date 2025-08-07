import { test, expect } from '@playwright/test';
import { createTestProduct, createTestCategory, createTestBrand, loginAsAdmin } from '$lib/test-utils';

test.describe('Product Search and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin to have necessary permissions
    await loginAsAdmin(page);
    
    // Navigate to the products page
    await page.goto('/productos');
    await page.waitForLoadState('networkidle');
  });

  test('should display all products by default', async ({ page }) => {
    // Check if products are loaded
    const productGrid = page.locator('[data-testid="product-grid"]');
    await expect(productGrid).toBeVisible();
    
    // Check if pagination info is visible
    const paginationInfo = page.locator('[data-testid="pagination-info"]');
    await expect(paginationInfo).toContainText('Mostrando');
  });

  test('should filter products by search term', async ({ page }) => {
    // Search for a specific product
    const searchInput = page.locator('input[placeholder="Buscar productos..."]');
    await searchInput.fill('Running Shoes');
    await searchInput.press('Enter');
    
    // Wait for results to load
    await page.waitForLoadState('networkidle');
    
    // Check if only matching products are shown
    const productTitles = page.locator('[data-testid="product-title"]');
    const count = await productTitles.count();
    
    for (let i = 0; i < count; i++) {
      const title = await productTitles.nth(i).textContent();
      expect(title).toContain('Running');
    }
  });

  test('should filter products by category', async ({ page }) => {
    // Open filter panel
    await page.getByRole('button', { name: /filtros/i }).click();
    
    // Select a category
    const categoryCheckbox = page.locator('label', { hasText: 'Running' }).first();
    await categoryCheckbox.click();
    
    // Apply filters
    await page.getByRole('button', { name: /aplicar filtros/i }).click();
    
    // Wait for results to load
    await page.waitForLoadState('networkidle');
    
    // Verify filtered results
    const productCategories = page.locator('[data-testid="product-category"]');
    const count = await productCategories.count();
    
    for (let i = 0; i < count; i++) {
      const category = await productCategories.nth(i).textContent();
      expect(category).toBe('Running');
    }
  });

  test('should filter products by price range', async ({ page }) => {
    // Open filter panel
    await page.getByRole('button', { name: /filtros/i }).click();
    
    // Set price range
    const minPriceInput = page.locator('input[name="minPrice"]');
    const maxPriceInput = page.locator('input[name="maxPrice"]');
    
    await minPriceInput.fill('10000');
    await maxPriceInput.fill('15000');
    
    // Apply filters
    await page.getByRole('button', { name: /aplicar filtros/i }).click();
    
    // Wait for results to load
    await page.waitForLoadState('networkidle');
    
    // Verify filtered results
    const productPrices = page.locator('[data-testid="product-price"]');
    const count = await productPrices.count();
    
    for (let i = 0; i < count; i++) {
      const priceText = await productPrices.nth(i).textContent();
      const price = parseInt(priceText?.replace(/[^0-9]/g, '') || '0');
      expect(price).toBeGreaterThanOrEqual(10000);
      expect(price).toBeLessThanOrEqual(15000);
    }
  });

  test('should sort products by price', async ({ page }) => {
    // Select sort option
    const sortSelect = page.locator('select[name="sort"]');
    await sortSelect.selectOption('price-asc');
    
    // Wait for results to load
    await page.waitForLoadState('networkidle');
    
    // Verify sorted results
    const productPrices = page.locator('[data-testid="product-price"]');
    const count = await productPrices.count();
    let prevPrice = 0;
    
    for (let i = 0; i < count; i++) {
      const priceText = await productPrices.nth(i).textContent();
      const price = parseInt(priceText?.replace(/[^0-9]/g, '') || '0');
      
      if (i > 0) {
        expect(price).toBeGreaterThanOrEqual(prevPrice);
      }
      
      prevPrice = price;
    }
  });

  test('should update URL when filters are applied', async ({ page }) => {
    // Apply a filter
    await page.getByRole('button', { name: /filtros/i }).click();
    await page.locator('label', { hasText: 'Running' }).first().click();
    await page.getByRole('button', { name: /aplicar filtros/i }).click();
    
    // Check if URL was updated
    await page.waitForURL(/category=/);
    const url = page.url();
    expect(url).toContain('category=');
  });

  test('should display no results message when no products match', async ({ page }) => {
    // Search for non-existent product
    const searchInput = page.locator('input[placeholder="Buscar productos..."]');
    await searchInput.fill('nonexistentproduct123');
    await searchInput.press('Enter');
    
    // Check for no results message
    await expect(page.getByText('No se encontraron productos')).toBeVisible();
  });

  test('should clear all filters', async ({ page }) => {
    // Apply a filter
    await page.getByRole('button', { name: /filtros/i }).click();
    await page.locator('label', { hasText: 'Running' }).first().click();
    await page.getByRole('button', { name: /aplicar filtros/i }).click();
    
    // Clear all filters
    await page.getByRole('button', { name: /limpiar filtros/i }).click();
    
    // Verify URL is clean
    await page.waitForURL(/\?$|\?$/);
    const url = page.url();
    expect(url).not.toContain('category=');
  });
});

test.describe('Mobile Search and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Login and navigate to products page
    await loginAsAdmin(page);
    await page.goto('/productos');
    await page.waitForLoadState('networkidle');
  });

  test('should open mobile filter panel', async ({ page }) => {
    // Open mobile filter panel
    await page.getByRole('button', { name: /filtros/i }).click();
    
    // Check if panel is visible
    const filterPanel = page.locator('[data-testid="mobile-filter-panel"]');
    await expect(filterPanel).toBeVisible();
  });

  test('should apply filters on mobile', async ({ page }) => {
    // Open mobile filter panel
    await page.getByRole('button', { name: /filtros/i }).click();
    
    // Apply a filter
    await page.locator('label', { hasText: 'Running' }).first().click();
    await page.getByRole('button', { name: /aplicar/i }).click();
    
    // Verify results
    await page.waitForLoadState('networkidle');
    const productTitles = page.locator('[data-testid="product-title"]');
    await expect(productTitles.first()).toBeVisible();
  });
});
