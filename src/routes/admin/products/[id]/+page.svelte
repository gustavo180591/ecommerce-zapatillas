<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import ProductForm from '$lib/components/admin/ProductForm.svelte';
  import { Button } from '$lib/components/ui/button';
  import { ChevronLeft, Loader2 } from 'lucide-svelte';
  import type { PageData } from './$types';

  // This will be populated by the load function
  export let data: PageData;

  // Mock categories - in a real app, these would come from an API
  const categories = [
    'Zapatillas Deportivas',
    'Zapatos Casuales',
    'Zapatos Formales',
    'Botas',
    'Sandalias',
    'Zapatillas de Running',
    'Zapatillas de Baloncesto',
    'Zapatillas de Fútbol'
  ];

  let loading = false;
  let product = data?.product || {
    name: '',
    description: '',
    price: 0,
    sku: '',
    stock: 0,
    status: 'draft',
    category: '',
    images: []
  };

  const handleSubmit = async (e: CustomEvent) => {
    const productData = e.detail;
    loading = true;
    
    try {
      // In a real app, this would be an API call
      console.log('Updating product:', productData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Producto actualizado exitosamente');
      goto('/admin/products');
      
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    } finally {
      loading = false;
    }
  };

  const handleCancel = () => {
    if (confirm('¿Estás seguro de que deseas descartar los cambios?')) {
      goto('/admin/products');
    }
  };

  // Set the initial product data when the component mounts
  onMount(() => {
    if (data?.product) {
      product = { ...data.product };
    }
  });
</script>

<svelte:head>
  <title>Editar Producto - Panel de Administración</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center space-x-4">
    <Button variant="ghost" size="icon" on:click={handleCancel}>
      <ChevronLeft class="h-5 w-5" />
      <span class="sr-only">Volver</span>
    </Button>
    <div>
      <h2 class="text-2xl font-bold tracking-tight">
        {loading ? 'Cargando...' : `Editar: ${product.name || 'Producto'}`}
      </h2>
      <p class="text-muted-foreground">
        Actualiza la información del producto
      </p>
    </div>
  </div>

  {#if !data?.product && !loading}
    <div class="rounded-md bg-yellow-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Producto no encontrado</h3>
          <div class="mt-2 text-sm text-yellow-700">
            <p>No se pudo cargar el producto solicitado.</p>
          </div>
          <div class="mt-4">
            <Button variant="outline" on:click={() => goto('/admin/products')}>
              Volver a la lista de productos
            </Button>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <ProductForm
      bind:product
      {categories}
      {loading}
      on:submit={handleSubmit}
      on:cancel={handleCancel}
    />
  {/if}
</div>
