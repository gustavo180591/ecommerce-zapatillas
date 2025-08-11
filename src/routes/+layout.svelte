<script lang="ts">
    export let data;
    // data.siteName y data.user vienen de +layout.ts
  </script>
  
  <!-- Layout base: navbar + slot + footer -->
  <div class="min-h-screen bg-gray-50 text-gray-900">
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div class="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <a href="/" class="font-semibold text-lg tracking-tight">
          {data.siteName ?? 'ecommerce-zapatillas'}
        </a>
  
        <nav class="hidden md:flex items-center gap-6 text-sm">
          <a href="/productos" class="hover:opacity-80">Productos</a>
          <a href="/buscar" class="hover:opacity-80">Buscar</a>
          <a href="/cuenta" class="hover:opacity-80">Mi cuenta</a>
          <a href="/carrito" class="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 border hover:bg-gray-100">
            🛒 <span>Carrito</span>
          </a>
        </nav>
  
        <div class="md:hidden">
          <!-- menú móvil mínimo -->
          <details class="relative">
            <summary class="list-none cursor-pointer rounded-xl px-3 py-1.5 border">Menú</summary>
            <div class="absolute right-0 mt-2 w-44 rounded-xl border bg-white shadow">
              <a class="block px-4 py-2 hover:bg-gray-50" href="/productos">Productos</a>
              <a class="block px-4 py-2 hover:bg-gray-50" href="/buscar">Buscar</a>
              <a class="block px-4 py-2 hover:bg-gray-50" href="/cuenta">Mi cuenta</a>
              <a class="block px-4 py-2 hover:bg-gray-50" href="/carrito">Carrito</a>
            </div>
          </details>
        </div>
      </div>
    </header>
  
    <main class="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <slot />
    </main>
  
    <footer class="border-t py-10 mt-12">
      <div class="max-w-7xl mx-auto px-4 lg:px-6 text-sm text-gray-600 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} {data.siteName ?? 'ecommerce-zapatillas'}. Todos los derechos reservados.</p>
        <div class="flex items-center gap-4">
          <a href="/envios" class="hover:opacity-80">Envíos y devoluciones</a>
          <a href="/mayoristas" class="hover:opacity-80">Mayoristas</a>
          <a href="/contacto" class="hover:opacity-80">Contacto</a>
        </div>
      </div>
    </footer>
  </div>
  