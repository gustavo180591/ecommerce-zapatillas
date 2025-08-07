<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Checkbox } from '$lib/components/ui/checkbox';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
  import { Plus, X, Upload, Image as ImageIcon } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import { v4 as uuidv4 } from 'uuid';

  // Types
  export type Product = {
    id?: string;
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    costPerItem?: number;
    sku: string;
    barcode?: string;
    stock: number;
    weight?: number;
    status: 'active' | 'draft' | 'archived';
    category: string;
    images: string[];
    variants?: Variant[];
  };

  export type Variant = {
    id: string;
    name: string;
    price: number;
    sku: string;
    stock: number;
    options: {
      name: string;
      value: string;
    }[];
  };

  // Props
  export let product: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    sku: '',
    stock: 0,
    status: 'draft',
    category: '',
    images: []
  };

  export let loading = false;
  export let categories: string[] = [];

  // State
  let error: string | null = null;
  let selectedImageIndex = 0;
  let showVariantForm = false;
  let newVariant: Partial<Variant> = {
    id: uuidv4(),
    name: '',
    price: product.price || 0,
    sku: '',
    stock: 0,
    options: []
  };

  // Event dispatcher
  const dispatch = createEventDispatcher<{
    submit: Product;
    cancel: void;
  }>();

  // Methods
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    // Basic validation
    if (!product.name) {
      toast.error('El nombre del producto es requerido');
      return;
    }
    
    if (product.price === undefined || product.price < 0) {
      toast.error('El precio es inválido');
      return;
    }
    
    // Dispatch submit event with product data
    dispatch('submit', {
      ...product,
      id: product.id || uuidv4(),
      status: product.status || 'draft',
      images: product.images || [],
      variants: product.variants || []
    } as Product);
  };

  const handleImageUpload = (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    const newImages = Array.from(files).map(file => {
      return URL.createObjectURL(file);
    });

    product.images = [...(product.images || []), ...newImages];
  };

  const removeImage = (index: number) => {
    product.images = product.images?.filter((_, i) => i !== index);
    if (selectedImageIndex >= (product.images?.length || 0)) {
      selectedImageIndex = Math.max(0, (product.images?.length || 1) - 1);
    }
  };

  const addVariant = () => {
    if (!newVariant.name || !newVariant.sku) {
      toast.error('Nombre y SKU son requeridos para la variante');
      return;
    }

    if (!product.variants) {
      product.variants = [];
    }

    product.variants.push({
      id: newVariant.id || uuidv4(),
      name: newVariant.name,
      price: newVariant.price || 0,
      sku: newVariant.sku,
      stock: newVariant.stock || 0,
      options: [...(newVariant.options || [])]
    } as Variant);

    // Reset form
    newVariant = {
      id: uuidv4(),
      name: '',
      price: product.price || 0,
      sku: '',
      stock: 0,
      options: []
    };
    
    showVariantForm = false;
  };

  const removeVariant = (id: string) => {
    if (product.variants) {
      product.variants = product.variants.filter(v => v.id !== id);
    }
  };
</script>

<div class="space-y-6">
  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Left column -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Basic Info -->
        <Card>
          <CardHeader>
            <CardTitle>Información del Producto</CardTitle>
            <CardDescription>Información básica del producto</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="name">Nombre del producto</Label>
              <Input
                id="name"
                bind:value={product.name}
                placeholder="Ej: Zapatillas Deportivas Pro"
                required
              />
            </div>
            
            <div class="space-y-2">
              <Label for="description">Descripción</Label>
              <Textarea
                id="description"
                bind:value={product.description}
                rows={4}
                placeholder="Describe el producto en detalle..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle>Imágenes</CardTitle>
            <CardDescription>Agrega imágenes del producto</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
              {#each product.images || [] as image, index}
                <div class="relative group">
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    class="h-32 w-full rounded-md object-cover cursor-pointer"
                    class:ring-2={selectedImageIndex === index}
                    class:ring-primary={selectedImageIndex === index}
                    on:click={() => selectedImageIndex = index}
                  />
                  <button
                    type="button"
                    on:click|stopPropagation={() => removeImage(index)}
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X class="h-3 w-3" />
                  </button>
                </div>
              {/each}
              
              <label
                class="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50"
              >
                <Upload class="h-8 w-8 text-gray-400" />
                <span class="mt-2 text-sm text-gray-600">Agregar imagen</span>
                <input
                  type="file"
                  class="sr-only"
                  accept="image/*"
                  multiple
                  on:change={handleImageUpload}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Variants */}
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>Variantes</CardTitle>
                <CardDescription>Agrega variantes como talles y colores</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                on:click={() => showVariantForm = !showVariantForm}
              >
                <Plus class="mr-2 h-4 w-4" />
                {showVariantForm ? 'Cancelar' : 'Agregar variante'}
              </Button>
            </div>
          </CardHeader>
          
          {#if showVariantForm}
            <CardContent class="space-y-4 border-b">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="variant-name">Nombre de la variante</Label>
                  <Input
                    id="variant-name"
                    bind:value={newVariant.name}
                    placeholder="Ej: Talle 42, Rojo"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="variant-sku">SKU</Label>
                  <Input
                    id="variant-sku"
                    bind:value={newVariant.sku}
                    placeholder="Ej: PROD-42-RED"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="variant-price">Precio</Label>
                  <Input
                    id="variant-price"
                    type="number"
                    min="0"
                    step="0.01"
                    bind:value={newVariant.price}
                  />
                </div>
                <div class="space-y-2">
                  <Label for="variant-stock">Stock</Label>
                  <Input
                    id="variant-stock"
                    type="number"
                    min="0"
                    bind:value={newVariant.stock}
                  />
                </div>
              </div>
              <div class="flex justify-end space-x-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  on:click={() => showVariantForm = false}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  on:click={addVariant}
                >
                  Agregar variante
                </Button>
              </div>
            </CardContent>
          {/if}
          
          {#if product.variants && product.variants.length > 0}
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variante
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th class="relative px-6 py-3">
                      <span class="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  {#each product.variants as variant}
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {variant.name}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {variant.sku}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${variant.price.toFixed(2)}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {variant.stock}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          on:click={() => removeVariant(variant.id)}
                          class="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </Card>
      </div>

      {/* Right column */}
      <div class="space-y-6">
        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="status">Estado del producto</Label>
                <Select bind:value={product.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="archived">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="flex items-center space-x-2">
                <Checkbox id="track-inventory" />
                <Label for="track-inventory">Rastrear inventario</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Organización</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="category">Categoría</Label>
              <Select bind:value={product.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {#each categories as category}
                    <SelectItem value={category}>{category}</SelectItem>
                  {/each}
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label for="sku">SKU</Label>
              <Input id="sku" bind:value={product.sku} placeholder="Ej: PROD-001" />
            </div>
            <div class="space-y-2">
              <Label for="barcode">Código de barras (opcional)</Label>
              <Input
                id="barcode"
                bind:value={product.barcode}
                placeholder="Ej: 123456789012"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Precio</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="price">Precio</Label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  bind:value={product.price}
                  class="pl-7"
                  required
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label for="compare-at-price">Precio de comparación (opcional)</Label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <Input
                  id="compare-at-price"
                  type="number"
                  min="0"
                  step="0.01"
                  bind:value={product.compareAtPrice}
                  class="pl-7"
                />
              </div>
              <p class="text-xs text-gray-500">
                Muestra el precio tachado al lado del precio actual
              </p>
            </div>
            <div class="space-y-2">
              <Label for="cost-per-item">Costo por ítem (opcional)</Label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <Input
                  id="cost-per-item"
                  type="number"
                  min="0"
                  step="0.01"
                  bind:value={product.costPerItem}
                  class="pl-7"
                />
              </div>
              <p class="text-xs text-gray-500">
                Los clientes no verán esto
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                bind:value={product.stock}
                placeholder="0"
              />
            </div>
            <div class="space-y-2">
              <Label for="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                step="0.01"
                bind:value={product.weight}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <div class="flex justify-end space-x-4 pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        on:click={() => dispatch('cancel')}
        disabled={loading}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar producto'}
      </Button>
    </div>
  </form>
</div>
