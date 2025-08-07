<script lang="ts">
  import { createForm } from 'svelte-forms-lib';
  import { z } from 'zod';
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Select } from '$lib/components/ui/select';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Label } from '$lib/components/ui/label';
  import FileUpload from '$lib/components/ui/file-upload/FileUpload.svelte';
  import { toast } from 'svelte-sonner';
  import type { Category, Product, ProductVariant } from '@prisma/client';

  export let product: Product & { variants?: ProductVariant[] } | null = null;
  export let categories: Category[] = [];
  export let isSubmitting = false;
  export let onCancel: () => void = () => {};

  // Form schema
  const productSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().positive('Price must be positive'),
    compareAtPrice: z.number().positive('Compare at price must be positive').optional().or(z.literal('')),
    costPerItem: z.number().positive('Cost must be positive').optional().or(z.literal('')),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    quantity: z.number().int().min(0, 'Quantity cannot be negative'),
    categoryId: z.string().min(1, 'Category is required'),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
    trackQuantity: z.boolean(),
    allowOutOfStockPurchases: z.boolean(),
    requiresShipping: z.boolean(),
    weight: z.number().min(0, 'Weight cannot be negative').optional(),
    weightUnit: z.enum(['g', 'kg', 'lb', 'oz']).optional(),
    images: z.array(z.string()).default([]),
    variants: z.array(
      z.object({
        id: z.string().optional(),
        option1: z.string().optional(),
        option2: z.string().optional(),
        option3: z.string().optional(),
        price: z.number().positive('Variant price must be positive'),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        quantity: z.number().int().min(0, 'Quantity cannot be negative'),
        requiresShipping: z.boolean().optional(),
        taxable: z.boolean().optional(),
        weight: z.number().min(0, 'Weight cannot be negative').optional(),
      })
    ).optional(),
  });

  type ProductFormData = z.infer<typeof productSchema>;

  // Initialize form with default values or product data
  const initialValues: ProductFormData = {
    name: '',
    description: '',
    price: 0,
    compareAtPrice: undefined,
    costPerItem: undefined,
    sku: '',
    barcode: '',
    quantity: 0,
    categoryId: categories[0]?.id || '',
    status: 'DRAFT',
    trackQuantity: true,
    allowOutOfStockPurchases: false,
    requiresShipping: true,
    weight: undefined,
    weightUnit: 'g',
    images: [],
    variants: [],
    ...(product ? {
      ...product,
      categoryId: product.categoryId || '',
      quantity: product.quantity || 0,
      variants: product.variants || [],
    } : {})
  };

  const {
    form,
    errors,
    state,
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    resetForm
  } = createForm({
    initialValues,
    validationSchema: productSchema,
    onSubmit: async (values) => {
      try {
        const method = product ? 'PATCH' : 'POST';
        const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to save product');
        }

        const result = await response.json();
        toast.success(product ? 'Product updated successfully' : 'Product created successfully');
        return result;
      } catch (error) {
        console.error('Error saving product:', error);
        toast.error(error.message || 'Failed to save product');
        throw error;
      }
    }
  });

  // Handle file uploads
  const handleFileUpload = async (files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const { urls } = await response.json();
      setFieldValue('images', [...form.images, ...urls]);
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    setFieldValue('images', newImages);
  };

  // Add/remove variants
  const addVariant = () => {
    const newVariant = {
      option1: '',
      option2: '',
      option3: '',
      price: form.price,
      sku: '',
      quantity: 0,
      requiresShipping: form.requiresShipping,
      taxable: true,
    };
    setFieldValue('variants', [...(form.variants || []), newVariant]);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...(form.variants || [])];
    newVariants.splice(index, 1);
    setFieldValue('variants', newVariants);
  };

  // Update variant field
  const updateVariantField = (index: number, field: string, value: any) => {
    const newVariants = [...(form.variants || [])];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFieldValue('variants', newVariants);
  };

  // Calculate total quantity from variants if tracking variants
  $: {
    if (form.variants?.length) {
      const totalQuantity = form.variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
      if (form.quantity !== totalQuantity) {
        setFieldValue('quantity', totalQuantity);
      }
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
  <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
    <!-- Main Product Info -->
    <div class="space-y-6 md:col-span-2">
      <!-- Basic Info Card -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
        
        <div class="space-y-4">
          <Input
            label="Product Name"
            name="name"
            bind:value={$form.name}
            error={$errors.name}
            required
          />

          <Textarea
            label="Description"
            name="description"
            bind:value={$form.description}
            error={$errors.description}
            rows={4}
            helpText="Include details about the product, features, and benefits"
          />

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="SKU (Stock Keeping Unit)"
              name="sku"
              bind:value={$form.sku}
              error={$errors.sku}
            />
            <Input
              label="Barcode (ISBN, UPC, GTIN, etc.)"
              name="barcode"
              bind:value={$form.barcode}
              error={$errors.barcode}
            />
          </div>
        </div>
      </div>

      <!-- Pricing Card -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Pricing</h2>
        
        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              type="number"
              label="Price"
              name="price"
              bind:value={$form.price}
              error={$errors.price}
              min="0"
              step="0.01"
              required
            />
            <Input
              type="number"
              label="Compare at price"
              name="compareAtPrice"
              bind:value={$form.compareAtPrice}
              error={$errors.compareAtPrice}
              min="0"
              step="0.01"
              helpText="To show a reduced price, move the product's original price to Compare at price"
            />
            <Input
              type="number"
              label="Cost per item"
              name="costPerItem"
              bind:value={$form.costPerItem}
              error={$errors.costPerItem}
              min="0"
              step="0.01"
              helpText="Customers won't see this"
            />
          </div>
        </div>
      </div>

      <!-- Inventory Card -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Inventory</h2>
        
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="trackQuantity"
              bind:checked={$form.trackQuantity}
              on:change={() => setFieldValue('trackQuantity', !$form.trackQuantity)}
            />
            <Label for="trackQuantity">Track quantity</Label>
          </div>

          {!$form.variants?.length && (
            <Input
              type="number"
              label="Quantity"
              name="quantity"
              bind:value={$form.quantity}
              error={$errors.quantity}
              min="0"
              step="1"
              disabled={!$form.trackQuantity}
            />
          )}

          <div class="flex items-center space-x-2">
            <Checkbox
              id="allowOutOfStockPurchases"
              bind:checked={$form.allowOutOfStockPurchases}
              on:change={() => setFieldValue('allowOutOfStockPurchases', !$form.allowOutOfStockPurchases)}
            />
            <Label for="allowOutOfStockPurchases">Continue selling when out of stock</Label>
          </div>
        </div>
      </div>

      <!-- Variants -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">Variants</h2>
          <Button type="button" variant="outline" size="sm" on:click={addVariant}>
            Add Variant
          </Button>
        </div>
        
        {#if $form.variants?.length}
          <div class="space-y-4">
            {#each $form.variants as variant, i}
              <div class="border rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <h3 class="font-medium">Variant {i + 1}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    on:click={() => removeVariant(i)}
                    class="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </Button>
                </div>
                
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Option 1 (e.g., Size)"
                    value={variant.option1 || ''}
                    on:input={(e) => updateVariantField(i, 'option1', e.target.value)}
                  />
                  <Input
                    label="Option 2 (e.g., Color)"
                    value={variant.option2 || ''}
                    on:input={(e) => updateVariantField(i, 'option2', e.target.value)}
                  />
                  <Input
                    type="number"
                    label="Price"
                    value={variant.price}
                    on:input={(e) => updateVariantField(i, 'price', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                  <Input
                    type="number"
                    label="Quantity"
                    value={variant.quantity}
                    on:input={(e) => updateVariantField(i, 'quantity', parseInt(e.target.value) || 0)}
                    min="0"
                    step="1"
                  />
                  <Input
                    label="SKU"
                    value={variant.sku || ''}
                    on:input={(e) => updateVariantField(i, 'sku', e.target.value)}
                  />
                  <Input
                    label="Barcode"
                    value={variant.barcode || ''}
                    on:input={(e) => updateVariantField(i, 'barcode', e.target.value)}
                  />
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <!-- Status Card -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Status</h2>
        
        <div class="space-y-4">
          <Select
            label="Status"
            options={[
              { value: 'DRAFT', label: 'Draft' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'ARCHIVED', label: 'Archived' },
            ]}
            bind:value={$form.status}
            error={$errors.status}
          />

          <Select
            label="Category"
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            bind:value={$form.categoryId}
            error={$errors.categoryId}
            required
          />
        </div>
      </div>

      <!-- Images Card -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Images</h2>
        
        <FileUpload
          accept="image/*"
          multiple
          maxFiles={10}
          maxSize={5 * 1024 * 1024} // 5MB
          on:files={handleFileUpload}
          on:remove={({ detail: index }) => handleRemoveImage(index)}
        >
          <div class="grid grid-cols-3 gap-2 mt-2">
            {#each $form.images as image, i}
              <div class="relative group">
                <img
                  src={image}
                  alt={`Preview ${i + 1}`}
                  class="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  on:click|stopPropagation={() => handleRemoveImage(i)}
                >
                  ×
                </button>
              </div>
            {/each}
          </div>
        </FileUpload>
      </div>

      <!-- Shipping Card -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Shipping</h2>
        
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <Checkbox
              id="requiresShipping"
              bind:checked={$form.requiresShipping}
              on:change={() => setFieldValue('requiresShipping', !$form.requiresShipping)}
            />
            <Label for="requiresShipping">This is a physical product</Label>
          </div>

          {#if $form.requiresShipping}
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                type="number"
                label="Weight"
                name="weight"
                bind:value={$form.weight}
                error={$errors.weight}
                min="0"
                step="0.01"
              />
              <Select
                label="Unit"
                options={[
                  { value: 'g', label: 'Grams (g)' },
                  { value: 'kg', label: 'Kilograms (kg)' },
                  { value: 'lb', label: 'Pounds (lb)' },
                  { value: 'oz', label: 'Ounces (oz)' },
                ]}
                bind:value={$form.weightUnit}
                error={$errors.weightUnit}
              />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Form Actions -->
  <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
    <Button
      type="button"
      variant="outline"
      on:click={onCancel}
      disabled={isSubmitting}
    >
      Cancel
    </Button>
    <Button
      type="submit"
      disabled={isSubmitting}
      loading={isSubmitting}
    >
      {product ? 'Update Product' : 'Create Product'}
    </Button>
  </div>
</form>
