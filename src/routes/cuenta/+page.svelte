<script lang="ts">
    // Placeholder de datos. En producción, usar load() server para traer user + últimos pedidos.
    const user = { name: 'Gustavo', email: 'gustavo@example.com' };
    const ultimosPedidos = [
      { id: 'ORD-1001', fecha: '2025-08-01', total: 57999, estado: 'PAID' },
      { id: 'ORD-0999', fecha: '2025-07-20', total: 32999, estado: 'DELIVERED' }
    ];
  </script>
  
  <h1 class="text-2xl font-semibold mb-4">Resumen</h1>
  
  <div class="grid gap-6 md:grid-cols-2">
    <div class="rounded-2xl border bg-white p-5">
      <h2 class="font-medium mb-2">Datos de la cuenta</h2>
      <p class="text-sm text-gray-600">Nombre: <span class="font-medium text-gray-800">{user.name}</span></p>
      <p class="text-sm text-gray-600">Email: <span class="font-medium text-gray-800">{user.email}</span></p>
      <a href="/cuenta/direcciones" class="inline-block mt-4 text-sm rounded-xl border px-3 py-1.5 hover:bg-gray-50">Gestionar direcciones</a>
    </div>
  
    <div class="rounded-2xl border bg-white p-5">
      <h2 class="font-medium mb-3">Últimos pedidos</h2>
      <div class="space-y-3">
        {#each ultimosPedidos as p}
          <a href="/cuenta/pedidos" class="block rounded-xl border px-4 py-3 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium">{p.id}</span>
              <span class="text-xs rounded-full px-2 py-0.5 border">{p.estado}</span>
            </div>
            <div class="text-xs text-gray-600 mt-1">{p.fecha} — ${p.total.toLocaleString('es-AR')}</div>
          </a>
        {/each}
      </div>
    </div>
  </div>
  