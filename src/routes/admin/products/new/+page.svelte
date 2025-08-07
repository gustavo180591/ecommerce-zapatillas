<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import ProductForm from '$lib/components/admin/ProductForm.svelte';
  import { Button } from '$lib/components/ui/button';
  import { ChevronLeft } from 'lucide-svelte';

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
  let product = {
    name: '',
    description: '',
    price: 0,
    sku: '',
    stock: 0,
    status: 'draft',
    category: '',
    images: []
  };

  const handleSubmit = async (e: CustomEvent<Product>) => {
    const productData = e.detail;
    loading = true;
    
    try {
      // In a real app, this would be an API call
      console.log('Creating product:', productData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Producto creado exitosamente');
      goto('/admin/products');
      
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error al crear el producto');
    } finally {
      loading = false;
    }
  };

  const handleCancel = () => {
    if (confirm('¿Estás seguro de que deseas descartar los cambios?')) {
      goto('/admin/products');
    }
  };
</script>

<svelte:head>
  <title>Nuevo Producto - Panel de Administración</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center space-x-4">
    <Button variant="ghost" size="icon" on:click={handleCancel}>
      <ChevronLeft class="h-5 w-5" />
      <span class="sr-only">Volver</span>
    </Button>
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Nuevo Producto</h2>
      <p class="text-muted-foreground">
        Completa la información del producto
      </p>
    </div>
  </div>

  <ProductForm
    bind:product
    {categories}
    {loading}
    on:submit={handleSubmit}
    on:cancel={handleCancel}
  />
</div>
