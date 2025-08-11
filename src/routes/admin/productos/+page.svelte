<script lang="ts">
    // Placeholder de productos — en prod: fetch desde /api/admin/products
    let productos = [
      { id: 1, name: 'Urban Classic', price: 24999, stock: 12 },
      { id: 2, name: 'Running Pro Max', price: 32999, stock: 5 }
    ];
  
    let nuevo = { name: '', price: 0, stock: 0 };
  
    const agregar = () => {
      if (!nuevo.name || nuevo.price <= 0) return;
      productos = [{ id: Date.now(), ...nuevo }, ...productos];
      nuevo = { name: '', price: 0, stock: 0 };
    };
  
    const eliminar = (id: number) => {
      productos = productos.filter((p) => p.id !== id);
    };
  </script>
  
  <h1 class="text-2xl font-semibold mb-4">Productos</h1>
  
  <div class="rounded-2xl border bg-white p-5 mb-6">
    <h2 class="font-medium mb-3">Agregar producto</h2>
    <div class="grid grid-cols-3 gap-3">
      <input placeholder="Nombre" bind:value={nuevo.name} class="border rounded-xl px-3 py-2" />
      <input type="number" placeholder="Precio" bind:value={nuevo.price} class="border rounded-xl px-3 py-2" />
      <input type="number" placeholder="Stock" bind:value={nuevo.stock} class="border rounded-xl px-3 py-2" />
    </div>
    <button class="mt-3 rounded-xl px-4 py-2.5 bg-black text-white hover:bg-gray-800" on:click={agregar}>
      Agregar
    </button>
  </div>
  
  <div class="space-y-3">
    {#each productos as p}
      <div class="rounded-xl border bg-white p-3 flex items-center justify-between">
        <div>
          <div class="font-medium">{p.name}</div>
          <div class="text-sm text-gray-500">Stock: {p.stock} — ${p.price.toLocaleString('es-AR')}</div>
        </div>
        <button class="text-red-600 hover:underline text-sm" on:click={() => eliminar(p.id)}>Eliminar</button>
      </div>
    {/each}
  </div>
  