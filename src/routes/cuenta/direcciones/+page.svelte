<script lang="ts">
    // Placeholder — luego reemplazar por fetch a /api/addresses
    let direcciones = [
      { id: 'addr_1', street: 'Av. Siempre Viva 742', city: 'Posadas', state: 'Misiones', zip: '3300', country: 'AR' }
    ];
  
    let form = { street: '', city: '', state: '', zip: '', country: 'AR' };
  
    const guardar = () => {
      if (!form.street || !form.city) return;
      direcciones = [{ id: crypto.randomUUID(), ...form }, ...direcciones];
      form = { street: '', city: '', state: '', zip: '', country: 'AR' };
    };
  
    const eliminar = (id: string) => {
      direcciones = direcciones.filter((d) => d.id !== id);
    };
  </script>
  
  <h1 class="text-2xl font-semibold mb-4">Direcciones</h1>
  
  <div class="grid gap-6 md:grid-cols-2">
    <div class="rounded-2xl border bg-white p-5">
      <h2 class="font-medium mb-3">Agregar nueva</h2>
      <div class="space-y-3">
        <div>
          <label class="block text-sm mb-1">Calle y número</label>
          <input class="border rounded-xl w-full px-3 py-2" bind:value={form.street} />
        </div>
        <div>
          <label class="block text-sm mb-1">Ciudad</label>
          <input class="border rounded-xl w-full px-3 py-2" bind:value={form.city} />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm mb-1">Provincia</label>
            <input class="border rounded-xl w-full px-3 py-2" bind:value={form.state} />
          </div>
          <div>
            <label class="block text-sm mb-1">Código Postal</label>
            <input class="border rounded-xl w-full px-3 py-2" bind:value={form.zip} />
          </div>
        </div>
        <div>
          <label class="block text-sm mb-1">País</label>
          <input class="border rounded-xl w-full px-3 py-2" bind:value={form.country} />
        </div>
        <button class="w-full rounded-xl px-4 py-2.5 bg-black text-white hover:bg-gray-800" on:click={guardar}>
          Guardar dirección
        </button>
      </div>
    </div>
  
    <div class="rounded-2xl border bg-white p-5">
      <h2 class="font-medium mb-3">Mis direcciones</h2>
      {#if direcciones.length > 0}
        <div class="space-y-3">
          {#each direcciones as d}
            <div class="rounded-xl border p-3 flex items-start justify-between">
              <div class="text-sm">
                <div class="font-medium">{d.street}</div>
                <div class="text-gray-600">{d.city}, {d.state} {d.zip}</div>
                <div class="text-gray-500">País: {d.country}</div>
              </div>
              <button class="text-red-600 text-sm hover:underline" on:click={() => eliminar(d.id)}>Eliminar</button>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-gray-500">No tenés direcciones guardadas.</p>
      {/if}
    </div>
  </div>
  