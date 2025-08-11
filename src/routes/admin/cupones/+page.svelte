<script lang="ts">
    // Placeholder — en prod: fetch desde /api/admin/coupons
    let cupones = [
      { code: 'SALE10', discount: 10, active: true },
      { code: 'WELCOME', discount: 15, active: false }
    ];
  
    let nuevo = { code: '', discount: 0, active: true };
  
    const agregar = () => {
      if (!nuevo.code || nuevo.discount <= 0) return;
      cupones = [{ ...nuevo }, ...cupones];
      nuevo = { code: '', discount: 0, active: true };
    };
  
    const eliminar = (code: string) => {
      cupones = cupones.filter((c) => c.code !== code);
    };
  </script>
  
  <h1 class="text-2xl font-semibold mb-4">Cupones</h1>
  
  <div class="rounded-2xl border bg-white p-5 mb-6">
    <h2 class="font-medium mb-3">Crear cupón</h2>
    <div class="grid grid-cols-3 gap-3">
      <input placeholder="Código" bind:value={nuevo.code} class="border rounded-xl px-3 py-2" />
      <input type="number" placeholder="% Descuento" bind:value={nuevo.discount} class="border rounded-xl px-3 py-2" />
      <select bind:value={nuevo.active} class="border rounded-xl px-3 py-2">
        <option value={true}>Activo</option>
        <option value={false}>Inactivo</option>
      </select>
    </div>
    <button class="mt-3 rounded-xl px-4 py-2.5 bg-black text-white hover:bg-gray-800" on:click={agregar}>
      Crear
    </button>
  </div>
  
  <div class="space-y-3">
    {#each cupones as c}
      <div class="rounded-xl border bg-white p-3 flex items-center justify-between">
        <div>
          <div class="font-medium">{c.code}</div>
          <div class="text-sm text-gray-500">{c.discount}% — {c.active ? 'Activo' : 'Inactivo'}</div>
        </div>
        <button class="text-red-600 hover:underline text-sm" on:click={() => eliminar(c.code)}>Eliminar</button>
      </div>
    {/each}
  </div>
  