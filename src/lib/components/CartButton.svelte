<script lang="ts">
  import { cart } from '$lib/stores/cart';
  
  export let onClick: () => void;
  
  // Get the cart item count from the cart store
  $: itemCount = $cart.items.reduce((total, item) => total + item.quantity, 0);
</script>

<button 
  on:click={onClick}
  class="cart-button"
  aria-label="Ver carrito"
  aria-expanded="false"
>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
  
  {#if itemCount > 0}
    <span class="cart-count" aria-label={`${itemCount} items in cart`}>
      {itemCount}
    </span>
  {/if}
</button>

<style>
  .cart-button {
    position: relative;
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #374151;
    transition: color 0.2s;
  }
  
  .cart-button:hover {
    color: #111827;
  }
  
  .cart-count {
    position: absolute;
    top: -4px;
    right: -4px;
    background-color: #111827;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
  }
</style>
