<script lang="ts">
    export let data;
    // data.user podría venir del +layout.server.ts para validar rol
  </script>
  
  <div class="grid gap-6 md:grid-cols-[240px_1fr]">
    <aside class="rounded-2xl border bg-white p-4 h-max">
      <h2 class="text-sm font-semibold text-gray-700 mb-3">Panel Admin</h2>
      <nav class="space-y-1 text-sm">
        <a href="/admin/productos" class="block rounded-lg px-3 py-2 hover:bg-gray-50">Productos</a>
        <a href="/admin/ordenes" class="block rounded-lg px-3 py-2 hover:bg-gray-50">Órdenes</a>
        <a href="/admin/cupones" class="block rounded-lg px-3 py-2 hover:bg-gray-50">Cupones</a>
        <hr class="my-2" />
        <a href="/" class="block rounded-lg px-3 py-2 hover:bg-gray-50">Volver a tienda</a>
      </nav>
    </aside>
  
    <section>
      <slot />
    </section>
  </div>
  