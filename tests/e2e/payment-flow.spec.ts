import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser } from '../helpers/auth';
import { addProductToCart } from '../helpers/cart';

// Test user credentials
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'Test123!';

// Test product details
const TEST_PRODUCT = {
  id: 1, // Assuming we have a test product with ID 1
  name: 'Zapatilla Deportiva',
  price: 199.99,
  size: '42',
  color: 'Negro'
};

// Test shipping information
const SHIPPING_INFO = {
  name: 'Test User',
  email: TEST_EMAIL,
  phone: '1122334455',
  address: 'Calle Falsa 123',
  city: 'Buenos Aires',
  state: 'Buenos Aires',
  postalCode: 'C1406',
  country: 'Argentina'
};

test.describe('Payment Flow', () => {
  test.beforeAll(async ({ browser }) => {
    // Create a test user before all tests
    const page = await browser.newPage();
    await createTestUser(page, TEST_EMAIL, TEST_PASSWORD);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', TEST_EMAIL);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // Add a product to the cart
    await addProductToCart(page, TEST_PRODUCT.id, TEST_PRODUCT.size, TEST_PRODUCT.color);
    
    // Go to checkout
    await page.goto('/checkout');
  });

  test.afterAll(async ({ browser }) => {
    // Clean up test user after all tests
    const page = await browser.newPage();
    await deleteTestUser(page, TEST_EMAIL, TEST_PASSWORD);
    await page.close();
  });

  test('should complete checkout with MercadoPago', async ({ page }) => {
    // Fill shipping information
    await fillShippingInfo(page, SHIPPING_INFO);
    await page.click('button:has-text("Continuar a pago")');
    
    // Select MercadoPago as payment method
    await page.waitForSelector('h1:has-text("Método de pago")');
    await page.click('label[for="mercadopago"]');
    
    // Mock the payment creation response
    await page.route('**/api/payments/create', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orderId: 'TEST-ORDER-123',
          initPoint: 'https://mercadopago-test.com/checkout?pref_id=TEST-123'
        })
      });
    });
    
    // Click on complete payment
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('button:has-text("Realizar pago")')
    ]);
    
    // Verify redirection to MercadoPago
    await expect(newPage).toHaveURL(/mercadopago/);
    await newPage.close();
    
    // Simulate successful payment callback
    await page.goto('/checkout/confirmation?payment_status=approved&order_id=TEST-ORDER-123');
    
    // Verify order confirmation
    await expect(page.getByText('¡Pedido completado con éxito!')).toBeVisible();
    await expect(page.getByText(`Número de pedido: #TEST-ORDER-123`)).toBeVisible();
  });

  test('should complete checkout with Stripe', async ({ page }) => {
    // Fill shipping information
    await fillShippingInfo(page, SHIPPING_INFO);
    await page.click('button:has-text("Continuar a pago")');
    
    // Select Stripe as payment method
    await page.waitForSelector('h1:has-text("Método de pago")');
    await page.click('label[for="stripe"]');
    
    // Mock the payment creation response
    await page.route('**/api/payments/create', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orderId: 'TEST-ORDER-456',
          clientSecret: 'cs_test_123'
        })
      });
    });
    
    // Mock Stripe.js
    await page.addInitScript(() => {
      window.Stripe = () => ({
        redirectToCheckout: async () => ({
          error: null
        })
      });
    });
    
    // Click on complete payment
    await page.click('button:has-text("Realizar pago")');
    
    // Simulate successful payment callback
    await page.goto('/checkout/confirmation?payment_intent=pi_123&payment_intent_client_secret=pi_123_secret_456');
    
    // Verify order confirmation
    await expect(page.getByText('¡Pedido completado con éxito!')).toBeVisible();
    await expect(page.getByText(`Número de pedido: #TEST-ORDER-456`)).toBeVisible();
  });

  test('should handle payment failure', async ({ page }) => {
    // Fill shipping information
    await fillShippingInfo(page, SHIPPING_INFO);
    await page.click('button:has-text("Continuar a pago")');
    
    // Select MercadoPago as payment method
    await page.waitForSelector('h1:has-text("Método de pago")');
    await page.click('label[for="mercadopago"]');
    
    // Mock payment failure
    await page.route('**/api/payments/create', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Payment failed',
          details: 'Insufficient funds'
        })
      });
    });
    
    // Click on complete payment and verify error
    await page.click('button:has-text("Realizar pago")');
    await expect(page.getByText('Error al procesar el pago')).toBeVisible();
  });

  test('should show order status updates', async ({ page }) => {
    // Fill shipping information
    await fillShippingInfo(page, SHIPPING_INFO);
    await page.click('button:has-text("Continuar a pago")');
    
    // Select MercadoPago as payment method
    await page.waitForSelector('h1:has-text("Método de pago")');
    await page.click('label[for="mercadopago"]');
    
    // Mock the payment creation response
    await page.route('**/api/payments/create', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orderId: 'TEST-ORDER-789',
          initPoint: 'https://mercadopago-test.com/checkout?pref_id=TEST-789'
        })
      });
    });
    
    // Mock order status endpoint
    await page.route('**/api/orders/*/status', async (route, request) => {
      // First request returns PENDING status
      if (request.url().includes('TEST-ORDER-789')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'PENDING',
            paymentStatus: 'PENDING',
            updatedAt: new Date().toISOString()
          })
        });
      }
    });
    
    // Click on complete payment
    const [newPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.click('button:has-text("Realizar pago")')
    ]);
    await newPage.close();
    
    // Verify initial status
    await expect(page.getByText('Pago pendiente')).toBeVisible();
    
    // Mock order status update to PAID
    await page.route('**/api/orders/*/status', async (route, request) => {
      if (request.url().includes('TEST-ORDER-789')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'PAID',
            paymentStatus: 'PAID',
            updatedAt: new Date().toISOString()
          })
        });
      }
    });
    
    // Verify status update
    await expect(page.getByText('Pago exitoso')).toBeVisible();
  });
});

async function fillShippingInfo(page, info) {
  await page.fill('input[name="name"]', info.name);
  await page.fill('input[name="email"]', info.email);
  await page.fill('input[name="phone"]', info.phone);
  await page.fill('input[name="address"]', info.address);
  await page.fill('input[name="city"]', info.city);
  await page.fill('input[name="state"]', info.state);
  await page.fill('input[name="postalCode"]', info.postalCode);
  await page.selectOption('select[name="country"]', info.country);
}
