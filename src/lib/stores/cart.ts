import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { page } from '$app/stores';
import type { CartItem } from '@prisma/client';
import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { checkProductAvailability, validateCartItem } from '$lib/utils/productValidation';

// Types
interface ProductInfo {
  id: number;
  name: string;
  price: number;
  image: string;
  availableStock?: number;
}

type CartItemInput = Omit<CartItem, 'id' | 'cartId' | 'createdAt' | 'updatedAt'> & {
  id?: number;
  product: ProductInfo;
  availableStock?: number;
};

type CartStore = {
  items: CartItemInput[];
  cartId?: number;
  userId?: number;
  isSynced: boolean;
  isLoading: boolean;
  error: string | null;
};

// Helper functions
const CART_STORAGE_KEY = 'ecommerce_cart';

// Load cart from localStorage if available
const loadCartFromStorage = (): Partial<CartStore> => {
  if (!browser) return {};
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : {};
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return {};
  }
};

// Save cart to localStorage
const saveCartToStorage = (cart: CartStore) => {
  if (!browser) return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

// Initialize cart store
const createCartStore = () => {
  const initialCart: CartStore = {
    items: [],
    isSynced: false,
    isLoading: false,
    error: null,
    ...loadCartFromStorage()
  };

  const { subscribe, update } = writable<CartStore>(initialCart);
  
  // Custom set function that also saves to localStorage
  const setCart = (newCart: CartStore) => {
    update(() => {
      saveCartToStorage(newCart);
      return newCart;
    });
  };

  // Subscribe to changes and persist to localStorage
  if (browser) {
    subscribe((cart) => {
      saveCartToStorage(cart);
    });
  }

  // Sync cart with server
  const syncWithServer = async () => {
    if (!browser) return;
    
    const currentCart = get(cart);
    if (currentCart.isLoading) return;
    
    try {
      // Set loading state
      update(cart => ({ ...cart, isLoading: true, error: null }));
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: currentCart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync cart with server');
      }
      
      const data = await response.json();
      
      // Update cart with server response
      update(cart => ({
        ...cart,
        items: data.items,
        isSynced: true,
        isLoading: false,
        error: null
      }));
      
    } catch (err) {
      console.error('Error syncing cart:', err);
      update(cart => ({
        ...cart,
        isSynced: false,
        isLoading: false,
        error: 'Error syncing cart with server'
      }));
    }
  };
  
  // Load cart from server
  const loadFromServer = async () => {
    if (!browser) return;
    
    try {
      update(cart => ({ ...cart, isLoading: true, error: null }));
      
      const response = await fetch('/api/cart');
      
      if (!response.ok) {
        throw new Error('Failed to load cart from server');
      }
      
      const data = await response.json();
      
      update(cart => ({
        ...cart,
        items: data.items || [],
        isSynced: true,
        isLoading: false,
        error: null
      }));
      
    } catch (err) {
      console.error('Error loading cart:', err);
      update(cart => ({
        ...cart,
        isSynced: false,
        isLoading: false,
        error: 'Error loading cart from server'
      }));
    }
  };
  
  // Initialize cart when user logs in
  if (browser) {
    // Listen to auth state changes
    const unsubscribe = page.subscribe(($page) => {
      const user = $page.data?.user;
      const currentUser = get(cart).userId;
      
      if (user?.id && user.id !== currentUser) {
        // User logged in or changed
        update(cart => ({
          ...cart,
          userId: user.id,
          isSynced: false
        }));
        loadFromServer();
      } else if (!user && currentUser) {
        // User logged out
        update(cart => ({
          ...cart,
          userId: undefined,
          isSynced: false
        }));
      }
    });
    
    // Cleanup on unmount
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', unsubscribe);
    }
  }
  
  return {
    subscribe,
    // Add item to cart with stock validation
    addItem: async (item: Omit<CartItemInput, 'id' | 'cartId'>) => {
      try {
        // First validate the item
        const validation = await validateCartItem(
          item.productId,
          item.size,
          item.color,
          item.quantity
        );

        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid item');
        }

        update((cart) => {
          const existingItemIndex = cart.items.findIndex(
            (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
          );

          let updatedItems;
          if (existingItemIndex >= 0) {
            // Check if we can add more of this item
            const newQuantity = cart.items[existingItemIndex].quantity + item.quantity;
            const availableStock = validation.availableStock;
            
            if (newQuantity > availableStock) {
              throw new Error(`Solo quedan ${availableStock} unidades disponibles`);
            }
            
            // Update quantity if item already exists
            updatedItems = [...cart.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: newQuantity,
              availableStock: validation.availableStock
            };
          } else {
            // Add new item with available stock info
            updatedItems = [
              ...cart.items, 
              { 
                ...item, 
                id: Date.now(),
                availableStock: validation.availableStock
              }
            ];
          }

          const updatedCart = { 
            ...cart, 
            items: updatedItems,
            error: null 
          };
          
          saveCartToStorage(updatedCart);
          return updatedCart;
        });
      } catch (error) {
        console.error('Error adding item to cart:', error);
        update(cart => ({
          ...cart,
          error: error instanceof Error ? error.message : 'Error al agregar al carrito'
        }));
        throw error; // Re-throw to allow UI to handle the error
      }
    },
    // Remove item from cart
    removeItem: (itemId: number) => {
      update((cart) => {
        const updatedItems = cart.items.filter((item) => item.id !== itemId);
        const updatedCart = { ...cart, items: updatedItems };
        saveCartToStorage(updatedCart);
        return updatedCart;
      });
    },
    // Update item quantity with stock validation
    updateQuantity: async (itemId: number, newQuantity: number) => {
      if (newQuantity <= 0) {
        cart.removeItem(itemId);
        return;
      }

      try {
        const currentCart = get(cart);
        const itemToUpdate = currentCart.items.find(item => item.id === itemId);
        
        if (!itemToUpdate) {
          throw new Error('El ítem no se encontró en el carrito');
        }
        
        // Validate stock before updating
        const validation = await validateCartItem(
          itemToUpdate.productId,
          itemToUpdate.size,
          itemToUpdate.color,
          newQuantity
        );
        
        if (!validation.isValid) {
          throw new Error(validation.error || 'No hay suficiente stock disponible');
        }
        
        if (newQuantity > validation.availableStock) {
          throw new Error(`Solo quedan ${validation.availableStock} unidades disponibles`);
        }
        
        update((cart) => {
          const updatedItems = cart.items.map((item) =>
            item.id === itemId 
              ? { 
                  ...item, 
                  quantity: newQuantity,
                  availableStock: validation.availableStock
                } 
              : item
          );
          
          const updatedCart = { 
            ...cart, 
            items: updatedItems,
            error: null 
          };
          
          saveCartToStorage(updatedCart);
          return updatedCart;
        });
      } catch (error) {
        console.error('Error updating quantity:', error);
        update(cart => ({
          ...cart,
          error: error instanceof Error ? error.message : 'Error al actualizar la cantidad'
        }));
        throw error; // Re-throw to allow UI to handle the error
      }
    },
    // Clear the cart
    clear: () => {
      const emptyCart = { 
        items: [], 
        isSynced: false,
        isLoading: false,
        error: null
      };
      saveCartToStorage(emptyCart);
      update(() => emptyCart);
      
      // Sync with server if user is logged in
      if (browser && get(cart).userId) {
        syncWithServer();
      }
    },
    // Sync cart with server
    syncWithServer,
    
    // Load cart from server
    loadFromServer,
    // Update the entire cart
    update: (updater: (cart: CartStore) => CartStore) => {
      update((currentCart) => {
        const updatedCart = updater(currentCart);
        saveCartToStorage(updatedCart);
        return updatedCart;
      });
    }
  };
};

export const cart = createCartStore();

// Calculate cart total
export const cartTotal = (items: CartItemInput[]): number => {
  return items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
};

// Calculate cart item count
export const cartItemCount = (items: CartItemInput[]): number => {
  return items.reduce((count, item) => count + item.quantity, 0);
};
