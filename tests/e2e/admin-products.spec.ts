import { test, expect, type APIResponse } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { ensureAdminLoggedIn } from './utils/auth';

// Enable retries for flaky tests
test.describe.configure({ mode: 'serial' });

test.describe('Admin Products Management', () => {
  // Test product data
  const testProduct = {
    name: `Test Product ${faker.commerce.productName().substring(0, 30)}`,
    description: faker.commerce.productDescription().substring(0, 100),
    price: faker.commerce.price(10, 200, 2),
    stock: faker.datatype.number({ min: 1, max: 100 }),
    category: 'shoes' // Using a fixed category that exists in the app
  };

  test.beforeEach(async ({ page }) => {
    // Ensure we're logged in as admin
    await ensureAdminLoggedIn(page);
    
    // Navigate to products page
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');
  });

  test('should display products list', async ({ page }) => {
    // Check if products table is visible
    await expect(page.locator('h1')).toContainText('Productos');
    await expect(page.locator('table')).toBeVisible();
    
    // Check if table has at least one row (header + data)
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCountGreaterThan(0);
  });

  test('should create and delete a product', async ({ page }) => {
    // Navigate to new product page
    await page.click('text=Nuevo producto');
    await page.waitForURL('/admin/products/new');
    
    // Fill in product form
    await page.fill('input[name="name"]', testProduct.name);
    await page.fill('textarea[name="description"]', testProduct.description);
    await page.fill('input[name="price"]', testProduct.price);
    await page.fill('input[name="stock"]', testProduct.stock.toString());
    await page.selectOption('select[name="category"]', { label: 'Zapatillas' });
    
    // Submit the form
    const responsePromise = page.waitForResponse((response: APIResponse) => 
      response.url().includes('/api/products') && response.request().method() === 'POST'
    );
    
    await page.click('button[type="submit"]');
    const response = await responsePromise;
    
    // Verify successful creation
    expect(response.status()).toBe(201);
    await expect(page).toHaveURL(/\/admin\/products\/[\w-]+/);
    await expect(page.locator('.alert-success')).toContainText('Producto creado exitosamente');
    
    // Now test deletion
    await page.click('text=Volver a la lista');
    await page.waitForURL('/admin/products');
    
    // Find and click delete button for our test product
    const productRow = page.locator('tr', { hasText: testProduct.name });
    await expect(productRow).toBeVisible();
    
    await productRow.locator('button:has-text("Eliminar")').click();
    
    // Confirm deletion
    const deleteResponsePromise = page.waitForResponse((response: APIResponse) => 
      response.url().includes('/api/products/') && response.request().method() === 'DELETE'
    );
    
    await page.click('button:has-text("Confirmar eliminación")');
    const deleteResponse = await deleteResponsePromise;
    
    // Verify successful deletion
    expect(deleteResponse.status()).toBe(200);
    await expect(page.locator('.alert-success')).toContainText('Producto eliminado exitosamente');
    await expect(productRow).not.toBeVisible();
  });

  test('should update an existing product', async ({ page }) => {
    // Navigate to the first product's edit page
    const firstProductRow = page.locator('table tbody tr').first();
    const productName = await firstProductRow.locator('td').first().textContent();
    
    await firstProductRow.locator('button:has-text("Editar")').click();
    await page.waitForURL(/\/admin\/products\/[\w-]+/);
    
    // Update the product name
    const updatedName = `Updated ${productName?.substring(0, 20)}`;
    await page.fill('input[name="name"]', updatedName);
    
    // Submit the form
    const responsePromise = page.waitForResponse((response: APIResponse) => 
      response.url().includes('/api/products/') && response.request().method() === 'PATCH'
    );
    
    await page.click('button[type="submit"]');
    const response = await responsePromise;
    
    // Verify success message and updated name
    expect(response.status()).toBe(200);
    await expect(page.locator('.alert-success')).toContainText('Producto actualizado exitosamente');
    await expect(page.locator('h1')).toContainText(updatedName);
  });

  test('should update product stock', async ({ page }) => {
    // Navigate to the first product's edit page
    const firstProductRow = page.locator('table tbody tr').first();
    const productName = await firstProductRow.locator('td').first().textContent();
    
    await firstProductRow.locator('button:has-text("Editar")').click();
    await page.waitForURL(/\/admin\/products\/[\w-]+/);
    
    // Update the stock
    const newStock = faker.datatype.number({ min: 1, max: 100 });
    await page.fill('input[name="stock"]', newStock.toString());
    
    // Submit the form
    const responsePromise = page.waitForResponse((response: APIResponse) => 
      response.url().includes('/api/products/') && response.request().method() === 'PATCH'
    );
    
    await page.click('button[type="submit"]');
    const response = await responsePromise;
    
    // Verify success message
    expect(response.status()).toBe(200);
    await expect(page.locator('.alert-success')).toContainText('Producto actualizado exitosamente');
    
    // Navigate back to products list
    await page.click('text=Volver a la lista');
    await page.waitForURL('/admin/products');
    
    // Find the product in the table and verify stock
    const updatedProductRow = page.locator(`tr:has-text("${productName}")`).first();
    await expect(updatedProductRow).toContainText(newStock.toString());
  });
  
  test('should filter products by search', async ({ page }) => {
    // Get the name of the first product
    const firstProductName = await page.locator('table tbody tr:first-child td:first-child').textContent();
    const searchTerm = firstProductName?.substring(0, 5) || 'test';
    
    // Type in the search input
    await page.fill('input[placeholder="Buscar productos..."]', searchTerm);
    
    // Wait for the search to complete
    await page.waitForResponse((response: APIResponse) => 
      response.url().includes('/api/products?search=') && response.request().method() === 'GET'
    );
    
    // Verify that at least one product matches the search
    const matchingProducts = page.locator('table tbody tr');
    await expect(matchingProducts).toHaveCountGreaterThan(0);
    
    // Verify all visible products contain the search term
    const count = await matchingProducts.count();
    for (let i = 0; i < count; i++) {
      const productName = await matchingProducts.nth(i).locator('td:first-child').textContent();
      expect(productName?.toLowerCase()).toContain(searchTerm.toLowerCase());
    }
  });
});
