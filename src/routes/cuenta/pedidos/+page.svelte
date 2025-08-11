<script lang="ts">
    // En producción: fetch desde /api/orders del user autenticado
    const pedidos = [
      {
        id: 'ORD-1001',
        fecha: '2025-08-01',
        estado: 'PAID',
        total: 57999,
        items: [
          { name: 'Urban Classic', qty: 1, price: 24999 },
          { name: 'Running Pro Max', qty: 1, price: 33000 }
        ]
      },
      {
        id: 'ORD-0999',
        fecha: '2025-07-20',
        estado: 'DELIVERED',
        total: 32999,
        items: [{ name: 'Running Pro Max', qty: 1, price: 32999 }]
      }
    ];
  </script>
  
  <h1 class="text-2xl font-semibold mb-4">Mis pedidos</h1>
  
  {#if pedidos.length > 0}
    <div class="space-y-4">
      {#each pedidos as p}
        <div class="rounded-2xl border bg-white p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="text-sm">
              <div class="font-medium">{p.id}</div>
              <div class="text-gray-500">{p.fecha}</div>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs rounded-full px-2 py-0.5 border">{p.estado}</span>
              <span class="font-medium">${p.total.toLocaleString('es-AR')}</span>
            </div>
          </div>
  
          <div class="mt-3 divide-y text-sm">
            {#each p.items as it}
              <div class="py-2 flex items-center justify-between">
                <span>{it.name} (x{it.qty})</span>
                <span>${(it.price * it.qty).toLocaleString('es-AR')}</span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <p class="text-gray-500">Todavía no registrás pedidos.</p>
  {/if}
  