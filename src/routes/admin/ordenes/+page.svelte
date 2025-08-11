<script lang="ts">
    // Placeholder — en prod: fetch desde /api/admin/orders
    let ordenes = [
      { id: 'ORD-1001', cliente: 'Juan Pérez', fecha: '2025-08-01', total: 57999, estado: 'PAID' },
      { id: 'ORD-1002', cliente: 'María Gómez', fecha: '2025-08-05', total: 32999, estado: 'DELIVERED' }
    ];
  
    const cambiarEstado = (id: string, estado: string) => {
      ordenes = ordenes.map((o) => (o.id === id ? { ...o, estado } : o));
    };
  </script>
  
  <h1 class="text-2xl font-semibold mb-4">Órdenes</h1>
  
  <div class="space-y-3">
    {#each ordenes as o}
      <div class="rounded-xl border bg-white p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="font-medium">{o.id} — {o.cliente}</div>
            <div class="text-gray-500 text-sm">{o.fecha}</div>
          </div>
          <div class="flex items-center gap-2">
            <select bind:value={o.estado} on:change={(e) => cambiarEstado(o.id, e.target.value)} class="border rounded-xl px-2 py-1 text-sm">
              <option value="PENDING">Pendiente</option>
              <option value="PAID">Pagado</option>
              <option value="SHIPPED">Enviado</option>
              <option value="DELIVERED">Entregado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
            <span class="font-medium">${o.total.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>
  