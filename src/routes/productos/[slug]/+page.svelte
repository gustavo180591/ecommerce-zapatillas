<script lang="ts">
    import { page } from '$app/stores';
  
    let slug: string;
    $: slug = $page.params.slug;
  
    // Demo temporal
    const producto = {
      name: 'Zapatilla Urban Classic',
      price: 24999,
      description: 'Zapatilla urbana cómoda y versátil, ideal para uso diario.',
      image: '/img/demo-urban.jpg',
      sizes: ['38', '39', '40', '41', '42']
    };
  
    let talleSeleccionado = '';
  </script>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
    <div>
      <div class="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
        {#if producto.image}
          <img src={producto.image} alt={producto.name} class="w-full h-full object-cover" />
        {/if}
      </div>
    </div>
  
    <div>
      <h1 class="text-3xl font-semibold">{producto.name}</h1>
      <p class="mt-2 text-gray-600">${producto.price.toLocaleString('es-AR')}</p>
  
      <p class="mt-4">{producto.description}</p>
  
      <div class="mt-6">
        <label for="talle" class="block font-medium mb-2">Talle</label>
        <select id="talle" bind:value={talleSeleccionado} class="border rounded-xl px-3 py-2 w-full">
          <option value="">Seleccionar talle</option>
          {#each producto.sizes as size}
            <option value={size}>{size}</option>
          {/each}
        </select>
      </div>
  
      <button
        disabled={!talleSeleccionado}
        class="mt-6 w-full rounded-xl px-4 py-2.5 bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Agregar al carrito
      </button>
    </div>
  </div>
  