<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
  } from '$lib/components/ui/alert-dialog';
  import { Trash2 } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';

  export let open = false;
  export let product: {
    id: string;
    name: string;
    variants: { id: string; name: string }[];
  } = {
    id: '',
    name: '',
    variants: []
  };
  export let loading = false;

  const dispatch = createEventDispatcher<{
    confirm: { id: string; hardDelete: boolean };
  }>();

  let hardDelete = false;

  function handleDelete() {
    dispatch('confirm', {
      id: product.id,
      hardDelete
    });
  }
</script>

<AlertDialog bind:open>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>
        {hardDelete ? 'Eliminación permanente' : 'Archivar producto'}
      </AlertDialogTitle>
      <AlertDialogDescription>
        {#if hardDelete}
          <p class="mb-4">
            <span class="font-semibold">¡Advertencia!</span> Esta acción no se puede deshacer.
            El producto se eliminará permanentemente del sistema.
          </p>
        {:else}
          <p class="mb-4">
            ¿Estás seguro de que deseas {product.variants?.length > 0 ? 'archivar' : 'eliminar'} este producto?
          </p>
          {#if product.variants?.length > 0}
            <p class="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
              <span class="font-medium">Nota:</span> Este producto tiene {product.variants.length} 
              variante{product.variants.length === 1 ? '' : 's'}. 
              {product.variants.length === 1 ? 'La variante' : 'Las variantes'} también se {product.variants.length === 1 ? 'archivará' : 'archivarán'}.
            </p>
          {/if}
        {/if}
        
        <div class="mt-4 space-y-2">
          <div class="flex items-start space-x-2">
            <input
              type="checkbox"
              id="hardDelete"
              bind:checked={hardDelete}
              class="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label for="hardDelete" class="text-sm font-medium text-gray-700">
              Eliminar permanentemente
            </label>
          </div>
          {#if hardDelete}
            <p class="text-xs text-red-600 pl-6">
              Solo selecciona esta opción si estás completamente seguro. 
              Esta acción no se puede deshacer.
            </p>
          {/if}
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        variant="destructive"
        on:click|preventDefault={handleDelete}
        disabled={loading}
      >
        {#if loading}
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        {:else}
          <Trash2 class="mr-2 h-4 w-4" />
        {/if}
        {hardDelete ? 'Eliminar permanentemente' : product.variants?.length > 0 ? 'Archivar' : 'Eliminar'}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
