<script lang="ts">
  import { onMount } from 'svelte';
  import { cart } from '$lib/stores/cart';
  import CartItem from './CartItem.svelte';
  import { fade } from 'svelte/transition';
  
  export let isOpen = false;
  
  // Calculate cart total and item count
  $: cartTotal = $cart.items.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );
  
  $: itemCount = $cart.items.reduce((total, item) => total + item.quantity, 0);
  
  const handleCheckout = () => {
    // TODO: Implement checkout flow
    alert('Proceder al pago');
  };
  
  // Close drawer when pressing Escape key
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      isOpen = false;
    }
  };
  
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
  
  // Handle click outside to close
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (isOpen && !target.closest('.cart-drawer')) {
      isOpen = false;
    }
  }
  
  // Close drawer when clicking outside
  $: if (isOpen) {
    document.addEventListener('click', handleClickOutside);
  } else {
    document.removeEventListener('click', handleClickOutside);
  }
</script>

{#if isOpen}
  <div 
  class="cart-drawer-overlay" 
  role="dialog" 
  aria-modal="true"
  aria-labelledby="cart-drawer-title"
  tabindex="-1"
  on:click|self={() => (isOpen = false)}
  on:keydown={(e) => e.key === 'Escape' && (isOpen = false)}
>
    <div 
  class="cart-drawer"
  in:fade={{ duration: 200 }}
  out:fade
  role="document"
  transition:fade
>
      <div class="cart-header">
        <h2 id="cart-drawer-title" class="sr-only">Tu carrito</h2>
          <span class="text-lg font-medium" aria-hidden="true">Tu carrito</span>
        <button 
  on:click={() => (isOpen = false)} 
  class="close-button" 
  aria-label="Cerrar carrito"
  type="button"
>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="cart-content">
        {#if itemCount === 0}
          <div class="empty-cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Tu carrito está vacío</p>
            <button 
  on:click={() => (isOpen = false)} 
  class="continue-shopping"
  type="button"
>
  Seguir comprando
</button>
          </div>
        {:else}
          <div class="cart-items">
            {#each $cart.items as item (item.id)}
              <CartItem 
                {item} 
                on:remove={() => item.id && cart.removeItem(item.id)} 
              />
            {/each}
          </div>
          
          <div class="cart-summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span>Envío</span>
              <span>Se calcula al finalizar</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            
            <button 
  on:click={handleCheckout} 
  class="checkout-button"
  type="button"
  disabled={itemCount === 0}
  aria-disabled={itemCount === 0}
>
  Proceder al pago
</button>
            
            <div class="payment-methods">
              <p>Métodos de pago aceptados:</p>
              <div class="payment-icons">
                <span class="payment-icon">💳</span>
                <span class="payment-icon">📱</span>
                <span class="payment-icon">💰</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .cart-drawer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    justify-content: flex-end;
  }
  
  .cart-drawer {
    width: 100%;
    max-width: 480px;
    height: 100%;
    background-color: white;
    display: flex;
    flex-direction: column;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .cart-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }
  
  .close-button {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
  }
  
  .close-button:hover {
    background-color: #f3f4f6;
    color: #111827;
  }
  
  .cart-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
  }
  
  .empty-cart {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem 0;
    color: #6b7280;
  }
  
  .empty-cart svg {
    margin-bottom: 1rem;
    color: #d1d5db;
  }
  
  .continue-shopping {
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background-color: #111827;
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .continue-shopping:hover {
    background-color: #1f2937;
  }
  
  .cart-items {
    flex: 1;
    margin-bottom: 1.5rem;
  }
  
  .cart-summary {
    border-top: 1px solid #e5e7eb;
    padding-top: 1.5rem;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 0.95rem;
    color: #4b5563;
  }
  
  .summary-row.total {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    font-weight: 600;
    font-size: 1.125rem;
    color: #111827;
  }
  
  .checkout-button {
    width: 100%;
    padding: 1rem;
    background-color: #111827;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1.5rem;
    transition: background-color 0.2s;
  }
  
  .checkout-button:hover {
    background-color: #1f2937;
  }
  
  .payment-methods {
    margin-top: 1.5rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .payment-icons {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }
  
  .payment-icon {
    font-size: 1.5rem;
  }
  
  @media (max-width: 640px) {
    .cart-drawer {
      max-width: 100%;
    }
  }
</style>
