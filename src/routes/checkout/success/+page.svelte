<script lang="ts">
    import { goto } from '$app/navigation';
  
    const volverInicio = () => {
      goto('/');
    };
  </script>
  
  <div class="text-center py-20">
    <div class="text-green-500 text-6xl mb-4">✔</div>
    <h1 class="text-3xl font-semibold mb-2">¡Compra exitosa!</h1>
    <p class="text-gray-600 mb-6">Tu pedido ha sido procesado correctamente.</p>
    <button
      on:click={volverInicio}
      class="rounded-xl px-6 py-2.5 bg-black text-white hover:bg-gray-800"
    >
      Volver al inicio
    </button>
  </div>
  