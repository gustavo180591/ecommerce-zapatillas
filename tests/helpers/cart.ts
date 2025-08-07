import { Page } from '@playwright/test';

interface ProductToAdd {
  id: number;
  size: string;
  color: string;
  quantity?: number;
}

/**
 * Adds a product to the cart
 */
export async function addProductToCart(
  page: Page, 
  product: ProductToAdd
) {
  // Navigate to product page
  await page.goto(`/products/${product.id}`);
  
  // Select size and color if provided
  if (product.size) {
    await page.selectOption('select[name="size"]', product.size);
  }
  
  if (product.color) {
    await page.click(`button[data-testid="color-${product.color.toLowerCase()}"]`);
  }
  
  // Set quantity if provided, otherwise default to 1
  const quantity = product.quantity || 1;
  if (quantity > 1) {
    const quantityInput = page.locator('input[name="quantity"]');
    await quantityInput.fill(quantity.toString());
  }
  
  // Click add to cart button
  await page.click('button:has-text("Agregar al carrito")');
  
  // Wait for cart to update (assuming there's a cart counter or notification)
  await page.waitForSelector('[data-testid="cart-count"]');
}

/**
 * Gets the current cart count
 */
export async function getCartCount(page: Page): Promise<number> {
  const countText = await page.textContent('[data-testid="cart-count"]');
  return countText ? parseInt(countText, 10) : 0;
}

/**
 * Removes an item from the cart
 */
export async function removeFromCart(page: Page, itemIndex: number) {
  await page.goto('/cart');
  await page.click(`[data-testid="remove-item-${itemIndex}"]`);
  
  // Wait for cart to update
  await page.waitForLoadState('networkidle');
}

/**
 * Updates the quantity of an item in the cart
 */
export async function updateCartItemQuantity(
  page: Page, 
  itemIndex: number, 
  newQuantity: number
) {
  await page.goto('/cart');
  const quantityInput = page.locator(`[data-testid="quantity-${itemIndex}"]`);
  await quantityInput.fill(newQuantity.toString());
  await quantityInput.press('Enter');
  
  // Wait for cart to update
  await page.waitForLoadState('networkidle');
}
