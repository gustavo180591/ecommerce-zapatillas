<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
  import { Plus, Search, Edit, Trash2, Eye, Filter, ChevronLeft, ChevronRight, PackagePlus, PackageMinus } from 'lucide-svelte';
  import DeleteProductDialog from '$lib/components/admin/DeleteProductDialog.svelte';
  import { toast } from 'svelte-sonner';
  import { deleteProduct } from '$lib/server/actions/product';
  import { enhance } from '$app/forms';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';

  // Types
  type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    status: 'active' | 'draft' | 'archived';
    images: string[];
    createdAt: string;
    updatedAt: string;
  };

  // State
  let products: Product[] = [];
  let loading = true;
  let error: string | null = null;
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 10;
  
  // Mock data - replace with actual API calls
  const mockProducts: (Product & { variants: any[] })[] = Array.from({ length: 25 }, (_, i) => ({
    id: `prod_${i + 1}`,
    name: `Zapato Deportivo ${i + 1}`,
    description: `Zapato deportivo de alta calidad para todo tipo de actividades. Modelo ${i + 1}`,
    price: 199.99 + (i * 10),
    stock: 50 - i,
    category: i % 2 === 0 ? 'Deportivos' : 'Casuales',
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'draft' : 'archived',
    images: ['/placeholder-shoe.jpg'],
    variants: i % 4 === 0 ? [
      { id: `var_${i}_1`, name: 'Talle 42', stock: 10 },
      { id: `var_${i}_2`, name: 'Talle 43', stock: 15 }
    ] : [],
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - i * 43200000).toISOString(),
    deletedAt: i % 5 === 0 ? new Date().toISOString() : null
  }));
  
  // State for delete dialog
  let showDeleteDialog = false;
  let productToDelete: (typeof mockProducts)[number] | null = null;
  let isDeleting = false;

  // Computed
  $: filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  $: paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Methods
  const fetchProducts = async () => {
    try {
      loading = true;
      // In a real app: const response = await fetch('/api/admin/products');
      // products = await response.json();
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 800));
      products = [...mockProducts];
      
    } catch (err) {
      console.error('Error fetching products:', err);
      error = 'No se pudieron cargar los productos';
      toast.error(error);
    } finally {
      loading = false;
    }
  };

  const handleDeleteClick = (product: Product) => {
    productToDelete = product;
    showDeleteDialog = true;
  };

  const handleConfirmDelete = async (event: CustomEvent) => {
    const { id, hardDelete } = event.detail;
    isDeleting = true;
    
    try {
      // In a real app, this would be a form submission or API call
      console.log(`Deleting product ${id}, hard delete: ${hardDelete}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock deletion
      if (hardDelete) {
        products = products.filter(p => p.id !== id);
        toast.success('Producto eliminado permanentemente');
      } else {
        // Soft delete
        products = products.map(p => 
          p.id === id ? { ...p, status: 'archived', deletedAt: new Date().toISOString() } : p
        );
        toast.success('Producto archivado correctamente');
      }
      
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    } finally {
      isDeleting = false;
      showDeleteDialog = false;
      productToDelete = null;
    }
  };
  
  const updateStock = async (productId: string, change: number) => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      products = products.map(p => 
        p.id === productId 
          ? { ...p, stock: Math.max(0, p.stock + change) } 
          : p
      );
      
      toast.success(`Stock actualizado correctamente`);
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Error al actualizar el stock');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  // Lifecycle
  onMount(() => {
    fetchProducts();
  });
</script>

<svelte:head>
  <title>Productos - Panel de Administración</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Productos</h2>
      <p class="text-muted-foreground">
        Gestiona los productos de tu tienda
      </p>
    </div>
    <Button on:click={() => goto('/admin/products/new')}>
      <Plus class="mr-2 h-4 w-4" />
      Nuevo Producto
    </Button>
  </div>

  <Card>
    <CardHeader class="pb-3">
      <div class="flex justify-between items-center">
        <div>
          <CardTitle>Productos</CardTitle>
          <CardDescription>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'} en total
          </CardDescription>
        </div>
        <div class="flex items-center space-x-2">
          <div class="relative w-64">
            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar productos..."
              class="pl-8"
              bind:value={searchQuery}
            />
          </div>
          <Select>
            <SelectTrigger class="w-[180px]">
              <Filter class="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
              <SelectItem value="archived">Archivados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {#if loading && products.length === 0}
        <div class="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      {:else if error}
        <div class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div class="mt-4">
                <Button variant="outline" on:click={fetchProducts}>
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      {:else if products.length === 0}
        <div class="text-center py-12">
          <Package class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
          <p class="mt-1 text-sm text-gray-500">Empieza creando un nuevo producto.</p>
          <div class="mt-6">
            <Button on:click={() => goto('/admin/products/new')}>
              <Plus class="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </div>
        </div>
      {:else}
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead class="text-right">Precio</TableHead>
                <TableHead class="text-right">Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Actualizado</TableHead>
                <TableHead class="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {#each paginatedProducts as product}
                <TableRow>
                  <TableCell class="font-medium">
                    <div class="flex items-center space-x-3">
                      <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={product.images[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          class="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div>
                        <div class="font-medium">{product.name}</div>
                        <div class="text-sm text-gray-500 line-clamp-1">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell class="text-right font-medium">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <td class="text-right">
                    <div class="flex items-center justify-end space-x-2">
                      <button 
                        type="button"
                        on:click|stopPropagation={() => updateStock(product.id, -1)}
                        class="text-gray-400 hover:text-primary focus:outline-none"
                        disabled={product.stock <= 0}
                        title="Reducir stock"
                      >
                        <PackageMinus class="h-4 w-4" />
                      </button>
                      <span class="w-8 text-center">
                        {product.stock}
                      </span>
                      <button 
                        type="button"
                        on:click|stopPropagation={() => updateStock(product.id, 1)}
                        class="text-gray-400 hover:text-primary focus:outline-none"
                        title="Aumentar stock"
                      >
                        <PackagePlus class="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <TableCell>
                    <span class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(product.status)}`}>
                      {product.status === 'active' ? 'Activo' : product.status === 'draft' ? 'Borrador' : 'Archivado'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div class="text-sm text-gray-500">
                      {formatDate(product.updatedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div class="flex space-x-2">
                      <Button variant="ghost" size="icon" on:click={() => goto(`/admin/products/${product.id}`)}>
                        <Eye class="h-4 w-4" />
                        <span class="sr-only">Ver</span>
                      </Button>
                      <Button variant="ghost" size="icon" on:click={() => goto(`/admin/products/${product.id}/edit`)}>
                        <Edit class="h-4 w-4" />
                        <span class="sr-only">Editar</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        on:click={() => handleDeleteClick(product)}
                        class={product.status === 'archived' ? 'text-gray-400' : 'text-red-500 hover:text-red-700'}
                        title={product.status === 'archived' ? 'Este producto está archivado' : 'Eliminar producto'}
                        disabled={product.status === 'archived'}
                      >
                        <Trash2 class="h-4 w-4" />
                        <span class="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              {/each}
            </TableBody>
          </Table>
        </div>

        {#if totalPages > 1}
          <div class="flex items-center justify-between px-2 py-4">
            <div class="text-sm text-muted-foreground">
              Mostrando <span class="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a <span class="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
              </span> de <span class="font-medium">{filteredProducts.length}</span> productos
            </div>
            <div class="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                on:click={() => currentPage > 1 && currentPage--}
                disabled={currentPage === 1}
              >
                <ChevronLeft class="h-4 w-4" />
                <span>Anterior</span>
              </Button>
              <div class="flex items-center space-x-1">
                {#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return pageNum;
                }) as number[]}
                  <Button
                    variant={currentPage === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    on:click={() => currentPage = pageNum}
                  >
                    {pageNum}
                  </Button>
                {/each}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span class="px-2">...</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                on:click={() => currentPage < totalPages && currentPage++}
                disabled={currentPage === totalPages}
              >
                <span>Siguiente</span>
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </div>
        {/if}
    </CardContent>
  </Card>
</div>

<!-- Delete Confirmation Dialog -->
{#if productToDelete}
  <DeleteProductDialog
    bind:open={showDeleteDialog}
    product={productToDelete}
    loading={isDeleting}
    on:confirm={handleConfirmDelete}
  />
{/if}
