<script lang="ts">
    // En el futuro, esto vendrá desde load() o una API
    const productos = [
      {
        id: '1',
        name: 'Zapatilla Urban Classic',
        price: 24999,
        image: '/img/demo-urban.jpg',
        slug: 'zapatilla-urban-classic'
      },
      {
        id: '2',
        name: 'Running Pro Max',
        price: 32999,
        image: '/img/demo-running.jpg',
        slug: 'running-pro-max'
      }
    ];
  </script>
  
  <h1 class="text-2xl font-semibold mb-6">Catálogo de Productos</h1>
  
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each productos as p}
      <a href={`/productos/${p.slug}`} class="group rounded-2xl border bg-white hover:shadow-md overflow-hidden transition">
        <div class="aspect-[4/3] bg-gray-100">
          {#if p.image}
            <img src={p.image} alt={p.name} class="w-full h-full object-cover" />
          {/if}
        </div>
        <div class="p-4">
          <h2 class="font-medium group-hover:underline">{p.name}</h2>
          <p class="text-gray-600">${p.price.toLocaleString('es-AR')}</p>
          <button class="mt-3 w-full rounded-xl border px-3 py-2 hover:bg-gray-50">
            Agregar al carrito
          </button>
        </div>
      </a>
    {/each}
  </div>
  