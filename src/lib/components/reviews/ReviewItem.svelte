<script lang="ts">
  import { format } from 'date-fns';
  import { es } from 'date-fns/locale';
  import { CheckCircle, ThumbsUp } from 'lucide-svelte';
  import RatingDisplay from '$lib/components/ui/rating/RatingDisplay.svelte';
  
  export let review: {
    id: string;
    rating: number;
    title: string;
    comment: string;
    status: string;
    isVerified: boolean;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
    images: Array<{ url: string }>;
    _count?: {
      helpfulVoters: number;
    };
  };
  
  export let currentUserId: string | null = null;
  export let onHelpfulClick: (reviewId: string) => Promise<void>;
  export let onEdit: (reviewId: string) => void;
  export let onDelete: (reviewId: string) => Promise<void>;
  
  let isHelpfulLoading = false;
  let isDeleteLoading = false;
  let showFullComment = false;
  
  const maxCommentLength = 300;
  
  $: displayComment = showFullComment 
    ? review.comment 
    : review.comment.length > maxCommentLength 
      ? review.comment.substring(0, maxCommentLength) + '...' 
      : review.comment;
  
  $: canShowMore = review.comment.length > maxCommentLength && !showFullComment;
  
  async function handleHelpfulClick() {
    if (!currentUserId) return;
    isHelpfulLoading = true;
    try {
      await onHelpfulClick(review.id);
    } finally {
      isHelpfulLoading = false;
    }
  }
  
  async function handleDelete() {
    if (confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      isDeleteLoading = true;
      try {
        await onDelete(review.id);
      } finally {
        isDeleteLoading = false;
      }
    }
  }
</script>

<article class="border-b border-gray-200 py-6 first:pt-0 last:border-b-0 dark:border-gray-700">
  <div class="flex items-start">
    <div class="flex-shrink-0 mr-4">
      <div class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
        {review.user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()}
      </div>
    </div>
    
    <div class="flex-1 min-w-0">
      <div class="flex items-center mb-1">
        <h3 class="font-medium text-gray-900 dark:text-white">
          {review.user.name}
        </h3>
        
        {#if review.isVerified}
          <span 
            class="ml-2 inline-flex items-center text-xs text-green-600 dark:text-green-400"
            title="Comprador verificado"
          >
            <CheckCircle class="w-3.5 h-3.5 mr-0.5" />
            Verificado
          </span>
        {/if}
      </div>
      
      <div class="flex items-center mb-2">
        <RatingDisplay 
          rating={review.rating} 
          size="sm" 
          readonly 
          class="mr-2" 
        />
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(review.createdAt), 'd MMMM yyyy', { locale: es })}
        </span>
      </div>
      
      <h4 class="font-medium text-gray-900 dark:text-white mb-2">
        {review.title}
      </h4>
      
      <p class="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line">
        {displayComment}
      </p>
      
      {#if canShowMore}
        <button 
          on:click={() => showFullComment = true}
          class="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-3"
        >
          Leer más
        </button>
      {/if}
      
      {#if review.images && review.images.length > 0}
        <div class="flex flex-wrap gap-2 mt-2 mb-3">
          {#each review.images as image, i}
            <button 
              on:click={() => {
                // TODO: Open image in lightbox/modal
                console.log('Open image:', image.url);
              }}
              class="w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition-colors"
            >
              <img 
                src={image.url} 
                alt={`Imagen ${i + 1} de la reseña`}
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          {/each}
        </div>
      {/if}
      
      <div class="flex items-center justify-between mt-3">
        <div class="flex items-center space-x-4">
          <button
            on:click={handleHelpfulClick}
            disabled={isHelpfulLoading}
            class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Esta reseña me resultó útil"
          >
            <ThumbsUp class="w-4 h-4 mr-1" />
            <span>Útil</span>
            {#if review._count?.helpfulVoters > 0}
              <span class="ml-1">({review._count.helpfulVoters})</span>
            {/if}
          </button>
        </div>
        
        {#if currentUserId === review.user.id}
          <div class="flex items-center space-x-3">
            <button
              on:click={() => onEdit(review.id)}
              class="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Editar
            </button>
            <button
              on:click={handleDelete}
              disabled={isDeleteLoading}
              class="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleteLoading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</article>
