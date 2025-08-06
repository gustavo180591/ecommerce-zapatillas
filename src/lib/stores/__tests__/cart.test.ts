import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cart } from '../cart';
import { get } from 'svelte/store';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock as Storage;

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset the cart before each test
    cart.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty cart', () => {
    const $cart = get(cart);
    expect($cart.items).toHaveLength(0);
    expect($cart.total).toBe(0);
    expect($cart.count).toBe(0);
  });

  it('should add item to cart', async () => {
    const item = {
      productId: 1,
      product: {
        id: 1,
        name: 'Test Product',
        price: 19990,
        image: '/test.jpg',
      },
      quantity: 1,
      size: '39',
      color: 'Negro',
    };

    await cart.addItem(item);
    
    const $cart = get(cart);
    expect($cart.items).toHaveLength(1);
    expect($cart.items[0]).toMatchObject({
      productId: 1,
      quantity: 1,
      size: '39',
      color: 'Negro',
    });
    expect($cart.total).toBe(19990);
    expect($cart.count).toBe(1);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should update item quantity', async () => {
    // First add an item
    const item = {
      productId: 1,
      product: {
        id: 1,
        name: 'Test Product',
        price: 19990,
        image: '/test.jpg',
      },
      quantity: 1,
      size: '39',
      color: 'Negro',
    };

    await cart.addItem(item);
    
    // Then update its quantity
    const cartItem = get(cart).items[0];
    await cart.updateQuantity(cartItem.id, 2);
    
    const $cart = get(cart);
    expect($cart.items[0].quantity).toBe(2);
    expect($cart.total).toBe(39980); // 19990 * 2
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should remove item from cart', async () => {
    // First add an item
    const item = {
      productId: 1,
      product: {
        id: 1,
        name: 'Test Product',
        price: 19990,
        image: '/test.jpg',
      },
      quantity: 1,
      size: '39',
      color: 'Negro',
    };

    await cart.addItem(item);
    
    // Then remove it
    const cartItem = get(cart).items[0];
    cart.removeItem(cartItem.id);
    
    const $cart = get(cart);
    expect($cart.items).toHaveLength(0);
    expect($cart.total).toBe(0);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should clear the cart', async () => {
    // Add some items
    const item1 = {
      productId: 1,
      product: { id: 1, name: 'Test 1', price: 19990, image: '/test1.jpg' },
      quantity: 1,
      size: '39',
      color: 'Negro',
    };
    
    const item2 = {
      productId: 2,
      product: { id: 2, name: 'Test 2', price: 15000, image: '/test2.jpg' },
      quantity: 2,
      size: '40',
      color: 'Blanco',
    };

    await cart.addItem(item1);
    await cart.addItem(item2);
    
    // Clear the cart
    cart.clear();
    
    const $cart = get(cart);
    expect($cart.items).toHaveLength(0);
    expect($cart.total).toBe(0);
    expect($cart.count).toBe(0);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should calculate totals correctly', async () => {
    const items = [
      {
        productId: 1,
        product: { id: 1, name: 'Test 1', price: 19990, image: '/test1.jpg' },
        quantity: 2,
        size: '39',
        color: 'Negro',
      },
      {
        productId: 2,
        product: { id: 2, name: 'Test 2', price: 15000, image: '/test2.jpg' },
        quantity: 1,
        size: '40',
        color: 'Blanco',
      },
    ];

    // Add all items
    for (const item of items) {
      await cart.addItem(item);
    }
    
    const $cart = get(cart);
    const expectedTotal = (19990 * 2) + (15000 * 1);
    expect($cart.total).toBe(expectedTotal);
    expect($cart.count).toBe(3); // 2 + 1 items
  });

  it('should prevent adding items with invalid stock', async () => {
    const item = {
      productId: 1,
      product: {
        id: 1,
        name: 'Test Product',
        price: 19990,
        image: '/test.jpg',
      },
      quantity: 5, // More than available stock (3 in mock)
      size: '38',
      color: 'Negro',
    };

    await expect(cart.addItem(item)).rejects.toThrow('No hay suficiente stock disponible');
    
    const $cart = get(cart);
    expect($cart.items).toHaveLength(0);
  });
});
