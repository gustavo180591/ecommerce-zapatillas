import { test, expect } from '@playwright/test';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Start the server before running tests
test.beforeAll(async () => {
  await app.prepare();
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });
  
  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      resolve();
    });
  });
});

test.describe('Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.clear();
    });
  });

  test('should add item to cart', async ({ page }) => {
    // Navigate to a product page
    await page.goto('/productos/1');
    
    // Select size and color
    await page.selectOption('select[name="size"]', '39');
    await page.click('button:text("Negro")');
    
    // Add to cart
    const addToCartButton = page.getByRole('button', { name: /agregar al carrito/i });
    await addToCartButton.click();
    
    // Verify cart count updates
    const cartCount = page.locator('.cart-count');
    await expect(cartCount).toHaveText('1');
    
    // Open cart drawer
    const cartButton = page.getByRole('button', { name: /carrito/i });
    await cartButton.click();
    
    // Verify item is in cart
    await expect(page.getByText('Zapatilla Deportiva')).toBeVisible();
    await expect(page.getByText('Talle: 39')).toBeVisible();
    await expect(page.getByText('Color: Negro')).toBeVisible();
  });

  test('should update item quantity in cart', async ({ page }) => {
    // Add an item to cart first
    await page.goto('/productos/1');
    await page.selectOption('select[name="size"]', '39');
    await page.click('button:text("Negro")');
    await page.getByRole('button', { name: /agregar al carrito/i }).click();
    
    // Open cart
    await page.getByRole('button', { name: /carrito/i }).click();
    
    // Increase quantity
    const increaseButton = page.getByLabel('Aumentar cantidad');
    await increaseButton.click();
    
    // Verify quantity updated
    const quantitySelect = page.locator('select[aria-label="Cantidad"]');
    await expect(quantitySelect).toHaveValue('2');
    
    // Verify total updated
    await expect(page.getByText('Total: $39,980.00')).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    // Add an item to cart first
    await page.goto('/productos/1');
    await page.selectOption('select[name="size"]', '39');
    await page.click('button:text("Negro")');
    await page.getByRole('button', { name: /agregar al carrito/i }).click();
    
    // Open cart
    await page.getByRole('button', { name: /carrito/i }).click();
    
    // Remove item
    const removeButton = page.getByLabel('Eliminar producto');
    await removeButton.click();
    
    // Verify cart is empty
    await expect(page.getByText('Tu carrito está vacío')).toBeVisible();
    await expect(page.getByRole('button', { name: /pagar/i })).toBeDisabled();
  });

  test('should show out of stock message when trying to add more than available', async ({ page }) => {
    // Add maximum available quantity to cart
    await page.goto('/productos/1');
    await page.selectOption('select[name="size"]', '38'); // Only 3 in stock for size 38
    await page.click('button:text("Negro")');
    
    // Try to add 5 items (more than available)
    const quantityInput = page.getByLabel('Cantidad');
    await quantityInput.fill('5');
    
    // Add to cart
    await page.getByRole('button', { name: /agregar al carrito/i }).click();
    
    // Verify error message
    await expect(page.getByText('Solo quedan 3 unidades disponibles')).toBeVisible();
    
    // Verify only available quantity was added
    await page.getByRole('button', { name: /carrito/i }).click();
    await expect(page.getByText('Cantidad: 3')).toBeVisible();
  });

  test('should persist cart between page reloads', async ({ page }) => {
    // Add item to cart
    await page.goto('/productos/1');
    await page.selectOption('select[name="size"]', '39');
    await page.click('button:text("Negro")');
    await page.getByRole('button', { name: /agregar al carrito/i }).click();
    
    // Reload page
    await page.reload();
    
    // Verify cart count is still there
    await expect(page.locator('.cart-count')).toHaveText('1');
    
    // Open cart and verify item is still there
    await page.getByRole('button', { name: /carrito/i }).click();
    await expect(page.getByText('Zapatilla Deportiva')).toBeVisible();
  });
});
