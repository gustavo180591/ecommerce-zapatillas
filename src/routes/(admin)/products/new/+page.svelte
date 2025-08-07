<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import ProductForm from '$lib/components/forms/ProductForm.svelte';
  import PageHeader from '$lib/components/ui/page-header.svelte';
  import { Button } from '$lib/components/ui/button';
  import { ArrowLeft } from 'lucide-svelte';
  import { loadCategories } from '$lib/services/category.service';
  import type { PageData } from './$types';

  export let data: PageData;
  
  let categories = $state(data.categories || []);
  let isSubmitting = $state(false);

  const handleSubmit = async (values: any) => {
    try {
      isSubmitting = true;
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create product');
      }

      const product = await response.json();
      toast.success('Product created successfully');
      goto(`/admin/products/${product.id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.message || 'Failed to create product');
    } finally {
      isSubmitting = false;
    }
  };

  const handleCancel = () => {
    goto('/admin/products');
  };
</script>

<svelte:head>
  <title>New Product | Admin</title>
</svelte:head>

<PageHeader>
  <div class="flex items-center">
    <Button
      variant="ghost"
      size="icon"
      on:click={handleCancel}
      class="mr-2"
      aria-label="Back to products"
    >
      <ArrowLeft class="h-4 w-4" />
    </Button>
    <h1 class="text-2xl font-bold">New Product</h1>
  </div>
</PageHeader>

<div class="container mx-auto py-6 px-4">
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <ProductForm
      {categories}
      on:submit={handleSubmit}
      on:cancel={handleCancel}
      {isSubmitting}
    />
  </div>
</div>
