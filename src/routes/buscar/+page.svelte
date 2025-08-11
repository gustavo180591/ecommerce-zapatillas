<script lang="ts">
    import { goto } from '$app/navigation';
    let query = '';
    let resultados: { name: string; slug: string; price: number; image?: string }[] = [];
  
    const buscar = async () => {
      if (!query.trim()) return;
      // Simulación de búsqueda. En producción: fetch(`/api/productos?search=${query}`)
      resultados = [
        {
          name: 'Zapatilla Urban Classic',
          slug: 'zapatilla-urban-classic',
          price: 24999,
          image: '/img/demo-urban.jpg'
        }
      ];
    };
  </script>
  
  <h1 class="text-2xl font-semibold mb-6">Buscar productos</h1>
  
  <div class="flex gap-2 mb-6">
    <input
      type="text"
      placeholder="Buscar por nombre o categoría..."
      bind:value={query}
      class="flex-1 border rounded-xl px-4 py-2"
      on:keydown={(e) => e.key === 'Enter' && buscar()}
    />
    <button
      on:click={buscar}
      class="rounded-xl px-4 py-2 bg-black text-white hover:bg-gray-800"
    >
      Buscar
    </button>
  </div>
  
  {#if resultados.length > 0}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each resultados as p}
        <a href={`/productos/${p.slug}`} class="group rounded-2xl border bg-white hover:shadow-md overflow-hidden transition">
          <div class="aspect-[4/3] bg-gray-100">
            {#if p.image}
              <img src={p.image} alt={p.name} class="w-full h-full object-cover" />
            {/if}
          </div>
          <div class="p-4">
            <h2 class="font-medium group-hover:underline">{p.name}</h2>
            <p class="text-gray-600">${p.price.toLocaleString('es-AR')}</p>
          </div>
        </a>
      {/each}
    </div>
  {:else if query}
    <p class="text-gray-500">No se encontraron resultados para "{query}".</p>
  {/if}
  