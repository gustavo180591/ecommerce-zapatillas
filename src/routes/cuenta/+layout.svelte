<script lang="ts">
    export let data;
    // data.user podría venir de +layout.server.ts o de locals (hooks)
  </script>
  
  <div class="grid gap-6 md:grid-cols-[260px_1fr]">
    <aside class="rounded-2xl border bg-white p-4 h-max">
      <h2 class="text-sm font-semibold text-gray-700 mb-3">Mi cuenta</h2>
      <nav class="space-y-1 text-sm">
        <a href="/cuenta" class="block rounded-lg px-3 py-2 hover:bg-gray-50">Resumen</a>
        <a href="/cuenta/pedidos" class="block rounded-lg px-3 py-2 hover:bg-gray-50">Mis pedidos</a>
        <a href="/cuenta/direcciones" class="block rounded-lg px-3 py-2 hover:bg-gray-50">Direcciones</a>
        <hr class="my-2" />
        <form method="POST" action="/api/auth/logout">
          <button class="w-full text-left rounded-lg px-3 py-2 hover:bg-gray-50">Cerrar sesión</button>
        </form>
      </nav>
    </aside>
  
    <section>
      <slot />
    </section>
  </div>
  