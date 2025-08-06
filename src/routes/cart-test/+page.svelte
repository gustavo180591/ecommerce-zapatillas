<script lang="ts">
  import { onMount } from 'svelte';
  import { cart } from '$lib/stores/cart';
  import { page } from '$app/stores';
  
  let localCart = [];
  let serverCart = [];
  let isLoggedIn = false;
  
  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(price);
  };
  
  // Load test data
  onMount(() => {
    // Subscribe to cart changes
    const unsubscribe = cart.subscribe(($cart) => {
      localCart = $cart.items;
      isLoggedIn = $cart.userId !== undefined;
    });
    
    // Load server cart if logged in
    if ($page.data.user) {
      loadServerCart();
    }
    
    return () => unsubscribe();
  });
  
  // Load cart from server
  async function loadServerCart() {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        serverCart = data.items || [];
      }
    } catch (error) {
      console.error('Error loading server cart:', error);
    }
  }
  
  // Add test item to cart
  function addTestItem() {
    cart.addItem({
      productId: Math.floor(Math.random() * 1000),
      product: {
        id: Math.floor(Math.random() * 1000),
        name: 'Producto de prueba',
        price: Math.floor(Math.random() * 1000) + 100,
        image: 'https://via.placeholder.com/150'
      },
      quantity: 1,
      size: 'M',
      color: 'Azul'
    });
  }
  
  // Sync cart with server
  async function syncCart() {
    await cart.syncWithServer();
    await loadServerCart();
  }
  
  // Clear cart
  function clearCart() {
    cart.clear();
    serverCart = [];
  }
</script>

<div class="container mx-auto p-6">
  <h1 class="text-2xl font-bold mb-6">Prueba de Sincronización del Carrito</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Local Cart -->
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Carrito Local</h2>
        <div class="flex space-x-2">
          <button 
            on:click={addTestItem}
            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            + Item
          </button>
          <button 
            on:click={clearCart}
            class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Limpiar
          </button>
          <button 
            on:click={syncCart}
            class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            disabled={!isLoggedIn}
          >
            Sincronizar
          </button>
        </div>
      </div>
      
      <div class="space-y-2">
        {#if localCart.length === 0}
          <p class="text-gray-500 italic">El carrito está vacío</p>
        {:else}
          {#each localCart as item}
            <div class="border-b pb-2">
              <div class="flex justify-between">
                <span>{item.product.name}</span>
                <span>{formatPrice(item.product.price * item.quantity)}</span>
              </div>
              <div class="text-sm text-gray-500">
                Cantidad: {item.quantity} | Talle: {item.size} | Color: {item.color}
              </div>
            </div>
          {/each}
          <div class="pt-2 font-semibold">
            Total: {formatPrice(localCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))}
          </div>
        {/if}
      </div>
      
      <div class="mt-4 text-sm">
        <p>Estado: {isLoggedIn ? 'Usuario autenticado' : 'Usuario invitado'}</p>
        <p>ID de usuario: {$page.data.user?.id || 'N/A'}</p>
      </div>
    </div>
    
    <!-- Server Cart -->
    <div class="bg-gray-50 p-6 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">Carrito en el Servidor</h2>
      
      {#if !isLoggedIn}
        <div class="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
          <p class="text-yellow-700">Inicia sesión para ver el carrito del servidor</p>
        </div>
      {:else if $cart.isLoading}
        <p class="text-gray-500 italic">Cargando...</p>
      {:else if serverCart.length === 0}
        <p class="text-gray-500 italic">No hay elementos en el carrito del servidor</p>
      {:else}
        <div class="space-y-2">
          {#each serverCart as item}
            <div class="border-b pb-2">
              <div class="flex justify-between">
                <span>{item.product.name}</span>
                <span>{formatPrice(item.product.price * item.quantity)}</span>
              </div>
              <div class="text-sm text-gray-500">
                Cantidad: {item.quantity} | Talle: {item.size} | Color: {item.color}
              </div>
            </div>
          {/each}
          <div class="pt-2 font-semibold">
            Total: {formatPrice(serverCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0))}
          </div>
        </div>
      {/if}
      
      <div class="mt-4 text-sm">
        <p>Estado: {isLoggedIn ? 'Conectado' : 'Desconectado'}</p>
        <p>Última sincronización: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  </div>
  
  <!-- Debug Info -->
  <div class="mt-8 p-4 bg-gray-100 rounded-lg">
    <h3 class="font-semibold mb-2">Información de Depuración</h3>
    <pre class="text-xs bg-white p-2 rounded overflow-auto max-h-40">
      {JSON.stringify({
        localCart: $cart,
        isSynced: $cart.isSynced,
        isLoading: $cart.isLoading,
        error: $cart.error,
        user: $page.data.user
      }, null, 2)}
    </pre>
  </div>
  
  <!-- Instructions -->
  <div class="mt-8 p-4 bg-blue-50 rounded-lg">
    <h3 class="font-semibold text-blue-800 mb-2">Instrucciones de Prueba</h3>
    <ol class="list-decimal list-inside space-y-2 text-sm text-blue-700">
      <li>Agrega ítems al carrito local usando el botón "+ Item"</li>
      <li>Inicia sesión para ver la sincronización automática</li>
      <li>Usa el botón "Sincronizar" para forzar la sincronización</li>
      <li>Verifica que los ítems se muestren correctamente en el carrito del servidor</li>
      <li>Prueba a cerrar sesión y verifica que el carrito local se mantenga</li>
    </ol>
  </div>
</div>
