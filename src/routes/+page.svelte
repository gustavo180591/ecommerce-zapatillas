<script lang="ts">
    // Home minimalista con hero + secciones placeholder
    const destacados = [
      { title: 'Zapatillas Urbanas', href: '/productos?category=urbanas' },
      { title: 'Running', href: '/productos?category=running' },
      { title: 'Sandalias', href: '/productos?category=sandalias' }
    ];
  </script>
  
  <section class="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-700 text-white px-8 py-14 shadow">
    <div class="max-w-3xl">
      <h1 class="text-3xl md:text-5xl font-bold leading-tight">
        Zapatillas que combinan estilo y rendimiento.
      </h1>
      <p class="mt-4 text-white/80 md:text-lg">
        Descubrí modelos nuevos cada semana. Comprá fácil, recibí rápido, cambiá sin drama.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <a href="/productos" class="inline-flex items-center rounded-xl px-4 py-2.5 bg-white text-gray-900 font-medium hover:opacity-90">
          Ver catálogo
        </a>
        <a href="/buscar" class="inline-flex items-center rounded-xl px-4 py-2.5 border border-white/30 hover:bg-white/10">
          Buscar modelos
        </a>
      </div>
    </div>
  </section>
  
  <section class="mt-10">
    <h2 class="text-xl font-semibold mb-4">Categorías destacadas</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {#each destacados as c}
        <a href={c.href} class="group rounded-2xl border bg-white p-6 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium">{c.title}</h3>
            <span class="opacity-60 group-hover:translate-x-0.5 transition">→</span>
          </div>
          <p class="mt-2 text-sm text-gray-600">Ver productos {c.title.toLowerCase()}.</p>
        </a>
      {/each}
    </div>
  </section>
  
  <section class="mt-12">
    <h2 class="text-xl font-semibold mb-4">Novedades</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Placeholders de cards de producto -->
      {#each Array(3) as _, i}
        <div class="rounded-2xl border overflow-hidden bg-white">
          <div class="aspect-[4/3] bg-gray-100"></div>
          <div class="p-4">
            <div class="flex items-center justify-between">
              <h3 class="font-medium">Producto #{i + 1}</h3>
              <span class="text-sm text-gray-500">$00.000</span>
            </div>
            <button class="mt-3 w-full rounded-xl border px-3 py-2 hover:bg-gray-50">
              Agregar al carrito
            </button>
          </div>
        </div>
      {/each}
    </div>
  </section>
  