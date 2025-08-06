<script lang="ts">
  import { cart } from '$lib/stores/cart';
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  
  const dispatch = createEventDispatcher<{
    remove: { id: number };
    quantityChange: { id: number; quantity: number };
  }>();
  
  export let item: {
    id: number;
    productId: number;
    product: {
      name: string;
      price: number;
      image: string;
    };
    quantity: number;
    size: string;
    color: string;
    availableStock?: number;
  };
  
  let isUpdating = false;
  let error: string | null = null;
  
  // Generate quantity options based on available stock (max 10)
  const getQuantityOptions = () => {
    const maxQuantity = Math.min(item.availableStock || 10, 10);
    return Array.from({ length: maxQuantity }, (_, i) => i + 1);
  };
  
  // Handle quantity change
  async function handleQuantityChange(newQuantity: number) {
    if (newQuantity === item.quantity) return;
    
    isUpdating = true;
    error = null;
    
    try {
      // This will trigger the validation in the cart store
      await cart.updateQuantity(item.id, newQuantity);
      dispatch('quantityChange', { id: item.id, quantity: newQuantity });
    } catch (err) {
      error = err instanceof Error ? err.message : 'Error al actualizar la cantidad';
      console.error('Error updating quantity:', err);
    } finally {
      isUpdating = false;
    }
  }
  
  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(price);
  };
  
  // Calculate total price for the item
  $: totalPrice = item.product.price * item.quantity;
  $: isLowStock = (item.availableStock || 0) <= 3;
</script>

<div class="cart-item relative p-4 border-b border-gray-200" transition:fade={{ duration: 200 }}>
  {#if isUpdating}
    <div class="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  {/if}
  
  <div class="flex gap-4">
    <div class="item-image flex-shrink-0">
      <img 
        src={item.product.image} 
        alt={item.product.name}
        class="w-20 h-20 object-cover rounded-md"
        loading="lazy"
        width="80"
        height="80"
      />
    </div>
    
    <div class="item-details flex-1 min-w-0">
      <div class="flex justify-between items-start">
        <h3 class="font-medium text-gray-900 truncate pr-2">
          {item.product.name}
        </h3>
        <button 
          on:click={() => dispatch('remove', { id: item.id })}
          class="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          aria-label="Eliminar producto"
          disabled={isUpdating}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      <div class="text-sm text-gray-500 mt-1">
        Talle: <span class="font-medium">{item.size}</span> | 
        Color: <span class="font-medium">{item.color}</span>
      </div>
      
      {#if item.availableStock !== undefined}
        <div class="mt-1 text-sm {isLowStock ? 'text-amber-600' : 'text-gray-500'}">
          {#if isLowStock}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          {/if}
          {item.availableStock > 0 
            ? `${item.availableStock} ${item.availableStock === 1 ? 'unidad' : 'unidades'} disponible${item.availableStock === 1 ? '' : 's'}`
            : 'Sin stock'}
        </div>
      {/if}
      
      {#if error}
        <div class="mt-1 text-sm text-red-600">
          {error}
        </div>
      {/if}
      
      <div class="mt-2 flex items-center justify-between">
        <div class="flex items-center">
          <label for={`quantity-${item.id}`} class="sr-only">Cantidad</label>
          <select 
            id={`quantity-${item.id}`}
            value={item.quantity}
            on:change={(e) => handleQuantityChange(parseInt(e.currentTarget.value))}
            class="mr-4 border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Cantidad"
            disabled={isUpdating}
          >
            {#each getQuantityOptions() as quantity}
              <option value={quantity}>
                {quantity}
              </option>
            {/each}
          </select>
          
          <button 
            on:click={() => handleQuantityChange(item.quantity - 1)}
            class="text-gray-500 hover:text-blue-600 p-1"
            disabled={item.quantity <= 1 || isUpdating}
            aria-label="Reducir cantidad"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>
          
          <span class="mx-1 text-sm w-6 text-center">
            {item.quantity}
          </span>
          
          <button 
            on:click={() => handleQuantityChange(item.quantity + 1)}
            class="text-gray-500 hover:text-blue-600 p-1"
            disabled={isUpdating || (item.availableStock !== undefined && item.quantity >= item.availableStock)}
            aria-label="Aumentar cantidad"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <div class="text-sm font-medium text-gray-900">
          {formatPrice(totalPrice)}
        </div>
      </div>

        <span class="sr-only">Eliminar</span>
      </button>
    </div>
  </div>
  
  <div class="item-total">
    <span class="sr-only">Total:</span>
    {formatPrice(itemTotal)}
  </div>
</div>

<style>
  .cart-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .item-image {
    width: 80px;
    height: 80px;
    flex-shrink: 0;
    background: #f3f4f6;
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .item-details {
    flex-grow: 1;
  }
  
  .item-details h3 {
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    font-size: 0.95rem;
  }
  
  .item-price {
    font-weight: 600;
    color: #111827;
  }
  
  .quantity-select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background-color: white;
    font-size: 0.875rem;
  }
  
  .remove-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    background: none;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 0.2s;
  }
  
  .remove-button:hover {
    color: #ef4444;
    background-color: #fef2f2;
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
