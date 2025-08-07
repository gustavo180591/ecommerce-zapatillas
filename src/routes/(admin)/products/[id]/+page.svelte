<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import ProductForm from '$lib/components/forms/ProductForm.svelte';
  import PageHeader from '$lib/components/ui/page-header.svelte';
  import { Button } from '$lib/components/ui/button';
  import { ArrowLeft, Trash2 } from 'lucide-svelte';
  import { loadCategories } from '$lib/services/category.service';
  import DeleteProductDialog from '$lib/components/products/DeleteProductDialog.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  
  let product = $state(data.product);
  let categories = $state(data.categories || []);
  let isSubmitting = $state(false);
  let showDeleteDialog = $state(false);

  const handleSubmit = async (values: any) => {
    try {
      isSubmitting = true;
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update product');
      }

      const updatedProduct = await response.json();
      product = updatedProduct;
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Failed to update product');
    } finally {
      isSubmitting = false;
    }
  };

  const handleDelete = async () => {
    try {
      isSubmitting = true;
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }

      toast.success('Product deleted successfully');
      goto('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    } finally {
      isSubmitting = false;
      showDeleteDialog = false;
    }
  };

  const handleCancel = () => {
    goto('/admin/products');
  };
</script>

<svelte:head>
  <title>Edit {product?.name} | Admin</title>
</svelte:head>

<PageHeader>
  <div class="flex items-center justify-between w-full">
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
      <h1 class="text-2xl font-bold">Edit Product</h1>
    </div>
    <Button
      variant="destructive"
      size="sm"
      on:click={() => showDeleteDialog = true}
      class="text-white bg-red-600 hover:bg-red-700"
    >
      <Trash2 class="h-4 w-4 mr-2" />
      Delete Product
    </Button>
  </div>
</PageHeader>

<div class="container mx-auto py-6 px-4">
  {#if product}
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <ProductForm
        product={product}
        {categories}
        on:submit={handleSubmit}
        on:cancel={handleCancel}
        {isSubmitting}
      />
    </div>
  {:else}
    <div class="text-center py-12">
      <p class="text-gray-500">Product not found</p>
    </div>
  {/if}
</div>

<DeleteProductDialog
  isOpen={showDeleteDialog}
  productName={product?.name}
  onClose={() => showDeleteDialog = false}
  onConfirm={handleDelete}
  isLoading={isSubmitting}
/>
