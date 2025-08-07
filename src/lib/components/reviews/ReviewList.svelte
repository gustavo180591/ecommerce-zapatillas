<script lang="ts">
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import { Button } from '$lib/components/ui/button';
  import ReviewItem from './ReviewItem.svelte';
  import ReviewForm from './ReviewForm.svelte';
  import { getProductReviews, toggleHelpfulVote, deleteReview } from '$lib/server/actions/review.actions';
  import { getProductById } from '$lib/server/actions/product.actions';
  import { auth } from '$lib/server/auth';
  
  export let productId: number;
  export let initialReviews: any[] = [];
  export let initialHasMore: boolean = false;
  export let pageSize: number = 5;
  
  let reviews = $state([...initialReviews]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let hasMore = $state(initialHasMore);
  let page = $state(1);
  let showReviewForm = $state(false);
  let editingReviewId = $state<string | null>(null);
  let productName = $state('');
  let currentUser = $state<{ id: string } | null>(null);
  
  // Load product name and current user
  async function loadProductAndUser() {
    try {
      const [product, session] = await Promise.all([
        getProductById(productId),
        auth()
      ]);
      
      if (product) {
        productName = product.name;
      }
      
      if (session?.user) {
        currentUser = { id: session.user.id };
      }
    } catch (err) {
      console.error('Error loading product or user:', err);
    }
  }
  
  // Load more reviews
  async function loadMore() {
    if (isLoading || !hasMore) return;
    
    isLoading = true;
    error = null;
    
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/products/${productId}/reviews?page=${nextPage}&limit=${pageSize}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar más reseñas');
      }
      
      const newReviews = await response.json();
      reviews = [...reviews, ...newReviews];
      hasMore = newReviews.length >= pageSize;
      page = nextPage;
    } catch (err) {
      console.error('Error loading more reviews:', err);
      error = 'No se pudieron cargar más reseñas. Por favor, inténtalo de nuevo.';
    } finally {
      isLoading = false;
    }
  }
  
  // Handle review submission
  async function handleReviewSubmit(event: CustomEvent) {
    const { detail } = event;
    
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: detail.rating,
          title: detail.title,
          comment: detail.comment,
          images: detail.images,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al enviar la reseña');
      }
      
      const newReview = await response.json();
      
      // If editing, update the existing review, otherwise prepend the new one
      if (editingReviewId) {
        reviews = reviews.map(review => 
          review.id === editingReviewId ? { ...review, ...newReview } : review
        );
      } else {
        reviews = [newReview, ...reviews];
      }
      
      showReviewForm = false;
      editingReviewId = null;
    } catch (err) {
      console.error('Error submitting review:', err);
      error = err instanceof Error ? err.message : 'Error al enviar la reseña';
    }
  }
  
  // Handle review edit
  function handleEditReview(reviewId: string) {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    
    editingReviewId = reviewId;
    showReviewForm = true;
    
    // Scroll to form
    setTimeout(() => {
      const formElement = document.getElementById('review-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }
  
  // Handle review deletion
  async function handleDeleteReview(reviewId: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar la reseña');
      }
      
      // Remove the review from the list
      reviews = reviews.filter(review => review.id !== reviewId);
    } catch (err) {
      console.error('Error deleting review:', err);
      error = 'No se pudo eliminar la reseña. Por favor, inténtalo de nuevo.';
    }
  }
  
  // Toggle helpful vote
  async function handleToggleHelpful(reviewId: string) {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar el voto');
      }
      
      const { helpfulCount } = await response.json();
      
      // Update the review's helpful count
      reviews = reviews.map(review => {
        if (review.id === reviewId) {
          return {
            ...review,
            _count: {
              ...review._count,
              helpfulVoters: helpfulCount,
            },
          };
        }
        return review;
      });
    } catch (err) {
      console.error('Error toggling helpful vote:', err);
      error = 'No se pudo registrar tu voto. Por favor, inténtalo de nuevo.';
    }
  }
  
  // Initialize
  $effect(() => {
    reviews = [...initialReviews];
    hasMore = initialHasMore;
    page = 1;
    loadProductAndUser();
  });
</script>

<div class="space-y-8">
  <!-- Header with title and write review button -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
      Reseñas de clientes
    </h2>
    
    {#if currentUser}
      <Button
        on:click={() => {
          showReviewForm = true;
          editingReviewId = null;
        }}
        class="w-full sm:w-auto"
        disabled={showReviewForm && !editingReviewId}
      >
        Escribir una reseña
      </Button>
    {/if}
  </div>
  
  <!-- Error message -->
  {#if error}
    <div 
      class="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
      role="alert"
    >
      {error}
    </div>
  {/if}
  
  <!-- Review Form -->
  {#if showReviewForm}
    <div 
      id="review-form"
      class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
      transition:fade
    >
      <ReviewForm
        productName={productName}
        initialData={{
          rating: editingReviewId ? reviews.find(r => r.id === editingReviewId)?.rating || 0 : 0,
          title: editingReviewId ? reviews.find(r => r.id === editingReviewId)?.title || '' : '',
          comment: editingReviewId ? reviews.find(r => r.id === editingReviewId)?.comment || '' : '',
          images: editingReviewId ? reviews.find(r => r.id === editingReviewId)?.images?.map((i: any) => i.url) || [] : [],
        }}
        on:submit={handleReviewSubmit}
        on:cancel={() => {
          showReviewForm = false;
          editingReviewId = null;
        }}
      />
    </div>
  {/if}
  
  <!-- Reviews List -->
  <div class="space-y-6 divide-y divide-gray-200 dark:divide-gray-700">
    {#if reviews.length === 0 && !showReviewForm}
      <div class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400 mb-4">
          Aún no hay reseñas para este producto.
        </p>
        {#if currentUser}
          <Button on:click={() => showReviewForm = true}>
            Sé el primero en opinar
          </Button>
        {:else}
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Inicia sesión para dejar tu reseña.
          </p>
        {/if}
      </div>
    {:else}
      {#each reviews as review (review.id)}
        <div 
          transition:fade
          class="pt-6 first:pt-0"
        >
          <ReviewItem
            {review}
            currentUserId={currentUser?.id || null}
            onHelpfulClick={handleToggleHelpful}
            onEdit={handleEditReview}
            onDelete={handleDeleteReview}
          />
        </div>
      {/each}
    {/if}
  </div>
  
  <!-- Load More Button -->
  {#if hasMore}
    <div class="flex justify-center pt-4">
      <Button
        on:click={loadMore}
        variant="outline"
        disabled={isLoading}
      >
        {isLoading ? 'Cargando...' : 'Cargar más reseñas'}
      </Button>
    </div>
  {/if}
</div>
