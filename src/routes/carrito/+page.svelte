<script lang="ts">
    // Esto vendría del store/cart.ts o desde un load() en el server
    let carrito = [
      {
        id: '1',
        name: 'Zapatilla Urban Classic',
        slug: 'zapatilla-urban-classic',
        price: 24999,
        quantity: 1,
        image: '/img/demo-urban.jpg',
        size: '40'
      }
    ];
  
    $: total = carrito.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
    const eliminarItem = (id: string) => {
      carrito = carrito.filter((item) => item.id !== id);
    };
  
    const actualizarCantidad = (id: string, cantidad: number) => {
      carrito = carrito.map((item) =>
        item.id === id ? { ...item, quantity: cantidad } : item
      );
    };
  </script>
  
  <h1 class="text-2xl font-semibold mb-6">Carrito</h1>
  
  {#if carrito.length > 0}
    <div class="space-y-6">
      {#each carrito as item}
        <div class="flex gap-4 border-b pb-4">
          <div class="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden">
            {#if item.image}
              <img src={item.image} alt={item.name} class="w-full h-full object-cover" />
            {/if}
          </div>
          <div class="flex-1">
            <a href={`/productos/${item.slug}`} class="font-medium hover:underline">
              {item.name}
            </a>
            <p class="text-sm text-gray-500">Talle: {item.size}</p>
            <p class="text-gray-600">${item.price.toLocaleString('es-AR')}</p>
  
            <div class="mt-2 flex items-center gap-2">
              <label class="text-sm text-gray-500">Cantidad:</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                on:change={(e) => actualizarCantidad(item.id, parseInt(e.currentTarget.value))}
                class="w-16 border rounded-xl px-2 py-1"
              />
              <button on:click={() => eliminarItem(item.id)} class="text-red-500 text-sm hover:underline">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      {/each}
  
      <div class="flex justify-between items-center mt-6">
        <p class="text-lg font-semibold">Total:</p>
        <p class="text-lg font-semibold">${total.toLocaleString('es-AR')}</p>
      </div>
  
      <a
        href="/checkout"
        class="block text-center mt-4 rounded-xl px-4 py-2.5 bg-black text-white font-medium hover:bg-gray-800"
      >
        Ir a pagar
      </a>
    </div>
  {:else}
    <p class="text-gray-500">Tu carrito está vacío.</p>
  {/if}
  