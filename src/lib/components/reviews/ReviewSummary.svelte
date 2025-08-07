<script lang="ts">
  import RatingDisplay from '$lib/components/ui/rating/RatingDisplay.svelte';
  import { formatNumber } from '$lib/utils/formatters';
  
  export let averageRating: number = 0;
  export let totalReviews: number = 0;
  export let ratingDistribution: Record<number, number> = {};
  export let onFilterByRating: (rating: number) => void = () => {};
  
  // Calculate percentage for each star rating
  $: distributionPercent = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: ratingDistribution[rating] || 0,
    percent: totalReviews > 0 ? Math.round(((ratingDistribution[rating] || 0) / totalReviews) * 100) : 0
  }));
  
  // Calculate the width of the filled portion of the rating bar
  $: getRatingBarWidth = (rating: number) => {
    const count = ratingDistribution[rating] || 0;
    return totalReviews > 0 ? `${(count / totalReviews) * 100}%` : '0%';
  };
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
  <h2 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
    Valoración general
  </h2>
  
  <div class="flex flex-col md:flex-row gap-8">
    <!-- Average Rating -->
    <div class="flex flex-col items-center justify-center text-center p-4">
      <div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
        {averageRating.toFixed(1)}
      </div>
      <div class="mb-2">
        <RatingDisplay 
          rating={averageRating} 
          size="lg" 
          showNumber={false}
          readonly 
        />
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-300">
        {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
      </div>
    </div>
    
    <!-- Rating Distribution -->
    <div class="flex-1 space-y-3">
      {#each distributionPercent as { rating, count, percent }}
        <div class="flex items-center group">
          <button
            on:click={() => onFilterByRating(rating)}
            class="flex items-center w-full text-left group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            aria-label={`Ver las ${count} reseñas de ${rating} estrellas`}
          >
            <span class="w-8 text-sm font-medium text-gray-900 dark:text-white">
              {rating}
            </span>
            <span class="w-10 text-right text-sm text-gray-500 dark:text-gray-400 mr-2">
              {percent}%
            </span>
            <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
              <div 
                class="h-full bg-yellow-400 dark:bg-yellow-500" 
                style={`width: ${getRatingBarWidth(rating)}`}
                aria-hidden="true"
              ></div>
            </div>
          </button>
          <span class="ml-2 text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
            {count}
          </span>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Review Filters -->
  <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
    <div class="flex flex-wrap gap-2">
      <button
        on:click={() => onFilterByRating(0)}
        class="px-3 py-1.5 text-sm font-medium rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors"
      >
        Todas
      </button>
      {#each [5, 4, 3, 2, 1] as rating}
        <button
          on:click={() => onFilterByRating(rating)}
          class="px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
        >
          <span>{rating}</span>
          <svg class="w-4 h-4 ml-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span class="ml-1">
            {ratingDistribution[rating] || 0}
          </span>
        </button>
      {/each}
    </div>
  </div>
</div>
