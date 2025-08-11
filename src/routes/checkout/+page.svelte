<script lang="ts">
    // Normalmente vendría desde un store o desde load() en server
    let carrito = [
      { id: '1', name: 'Zapatilla Urban Classic', price: 24999, quantity: 1, size: '40' },
      { id: '2', name: 'Running Pro Max', price: 32999, quantity: 2, size: '42' }
    ];
  
    $: total = carrito.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
    let nombre = '';
    let direccion = '';
    let ciudad = '';
    let pago = 'tarjeta';
  
    const finalizarCompra = () => {
      // Acá iría la integración con tu API de pagos
      alert('Compra finalizada con éxito!');
    };
  </script>
  
  <h1 class="text-2xl font-semibold mb-6">Finalizar compra</h1>
  
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
    <!-- Formulario -->
    <div class="lg:col-span-2 space-y-6">
      <div>
        <label class="block mb-2 font-medium">Nombre completo</label>
        <input type="text" bind:value={nombre} class="border rounded-xl px-3 py-2 w-full" />
      </div>
  
      <div>
        <label class="block mb-2 font-medium">Dirección</label>
        <input type="text" bind:value={direccion} class="border rounded-xl px-3 py-2 w-full" />
      </div>
  
      <div>
        <label class="block mb-2 font-medium">Ciudad</label>
        <input type="text" bind:value={ciudad} class="border rounded-xl px-3 py-2 w-full" />
      </div>
  
      <div>
        <label class="block mb-2 font-medium">Método de pago</label>
        <select bind:value={pago} class="border rounded-xl px-3 py-2 w-full">
          <option value="tarjeta">Tarjeta de crédito/débito</option>
          <option value="transferencia">Transferencia bancaria</option>
          <option value="mercadopago">MercadoPago</option>
        </select>
      </div>
    </div>
  
    <!-- Resumen -->
    <div class="border rounded-2xl p-6 space-y-4">
      <h2 class="text-lg font-semibold">Resumen de compra</h2>
      {#each carrito as item}
        <div class="flex justify-between text-sm">
          <span>{item.name} (x{item.quantity})</span>
          <span>${(item.price * item.quantity).toLocaleString('es-AR')}</span>
        </div>
      {/each}
      <hr />
      <div class="flex justify-between font-medium">
        <span>Total</span>
        <span>${total.toLocaleString('es-AR')}</span>
      </div>
      <button
        on:click={finalizarCompra}
        class="w-full mt-4 rounded-xl px-4 py-2.5 bg-black text-white hover:bg-gray-800"
      >
        Pagar ahora
      </button>
    </div>
  </div>
  