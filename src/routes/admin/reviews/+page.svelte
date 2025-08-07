<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getReviews, updateReviewStatus, type Review, type ReviewStatus } from '$lib/server/actions/review.actions';
  import { toast } from 'svelte-sonner';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
  import { format } from 'date-fns';
  import { es } from 'date-fns/locale';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';

  let loading = true;
  let reviews: Review[] = [];
  let statusFilter: ReviewStatus | 'ALL' = 'PENDING';
  let searchQuery = '';
  let currentPage = 1;
  const itemsPerPage = 10;

  // Load reviews on mount and when filters change
  $: loadReviews();

  async function loadReviews() {
    try {
      loading = true;
      const response = await getReviews({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: searchQuery || undefined,
        page: currentPage,
        limit: itemsPerPage
      });
      reviews = response.reviews;
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Error al cargar las reseñas');
    } finally {
      loading = false;
    }
  }

  async function handleStatusChange(reviewId: string, newStatus: ReviewStatus) {
    try {
      await updateReviewStatus(reviewId, newStatus);
      toast.success('Estado de la reseña actualizado');
      await loadReviews(); // Refresh the list
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Error al actualizar la reseña');
    }
  }

  function getStatusBadgeVariant(status: ReviewStatus) {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'destructive';
      case 'PENDING':
      default:
        return 'secondary';
    }
  }

  function getStatusDisplayName(status: ReviewStatus) {
    switch (status) {
      case 'APPROVED':
        return 'Aprobado';
      case 'REJECTED':
        return 'Rechazado';
      case 'PENDING':
      default:
        return 'Pendiente';
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Gestión de Reseñas</h1>
      <p class="text-muted-foreground">Revisa y gestiona las reseñas de los productos</p>
    </div>
    <div class="flex items-center gap-2">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Buscar reseñas..."
        class="px-3 py-2 border rounded-md w-full md:w-64"
        on:keydown={(e) => e.key === 'Enter' && loadReviews()}
      />
      <Button on:click={loadReviews} variant="outline">
        Buscar
      </Button>
    </div>
  </div>

  <div class="flex items-center gap-4 mb-6">
    <Select bind:value={statusFilter} on:change={loadReviews}>
      <SelectTrigger class="w-[180px]">
        <SelectValue placeholder="Filtrar por estado" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Todos los estados</SelectItem>
        <SelectItem value="PENDING">Pendientes</SelectItem>
        <SelectItem value="APPROVED">Aprobadas</SelectItem>
        <SelectItem value="REJECTED">Rechazadas</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {#if loading && reviews.length === 0}
    <div class="flex justify-center items-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  {:else if reviews.length === 0}
    <div class="text-center py-12">
      <p class="text-muted-foreground">No se encontraron reseñas con los filtros actuales</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each reviews as review (review.id)}
        <Card>
          <CardHeader>
            <div class="flex justify-between items-start">
              <div>
                <CardTitle class="text-lg">
                  {review.product.name}
                </CardTitle>
                <CardDescription class="mt-1">
                  Por {review.user?.name || 'Usuario anónimo'} • 
                  {format(new Date(review.createdAt), 'PPP', { locale: es })}
                </CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(review.status)}>
                {getStatusDisplayName(review.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-2">
              <div class="flex">
                {#each Array(5) as _, i}
                  <span class={`text-2xl ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                  </span>
                {/each}
              </div>
              <span class="font-medium">{review.title}</span>
            </div>
            <p class="text-gray-700">{review.comment}</p>
            
            {#if review.images && review.images.length > 0}
              <div class="flex flex-wrap gap-2 mt-3">
                {#each review.images as image}
                  <img 
                    src={image.url} 
                    alt="Imagen de la reseña" 
                    class="h-20 w-20 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                    on:click={() => window.open(image.url, '_blank')}
                  />
                {/each}
              </div>
            {/if}
          </CardContent>
          <CardFooter class="flex justify-end gap-2 border-t pt-4">
            {#if review.status === 'PENDING'}
              <Button 
                variant="outline" 
                size="sm" 
                on:click={() => handleStatusChange(review.id, 'REJECTED')}
              >
                Rechazar
              </Button>
              <Button 
                size="sm" 
                on:click={() => handleStatusChange(review.id, 'APPROVED')}
              >
                Aprobar
              </Button>
            {:else}
              <Select 
                value={review.status} 
                on:change={(e) => handleStatusChange(review.id, e.detail as ReviewStatus)}
              >
                <SelectTrigger class="w-[180px]">
                  <SelectValue placeholder="Cambiar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pendiente</SelectItem>
                  <SelectItem value="APPROVED">Aprobado</SelectItem>
                  <SelectItem value="REJECTED">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            {/if}
          </CardFooter>
        </Card>
      {/each}
    </div>
  {/if}
</div>
