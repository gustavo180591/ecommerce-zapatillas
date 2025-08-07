<script lang="ts">
  import { Star, StarHalf } from 'lucide-svelte';
  
  export let rating: number;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let showNumber: boolean = false;
  export let max: number = 5;
  export let readonly: boolean = false;
  export let interactive: boolean = false;
  
  // Calculate full and half stars
  $: fullStars = Math.floor(rating);
  $: hasHalfStar = rating % 1 >= 0.5;
  $: emptyStars = max - fullStars - (hasHalfStar ? 1 : 0);
  
  // For interactive mode
  let hoverRating = 0;
  let isHovering = false;
  
  const sizes = {
    sm: { size: 16, class: 'h-4 w-4' },
    md: { size: 20, class: 'h-5 w-5' },
    lg: { size: 24, class: 'h-6 w-6' }
  };
  
  const currentSize = sizes[size];
  
  function handleClick(newRating: number) {
    if (!interactive || readonly) return;
    const event = new CustomEvent('rate', { detail: newRating });
    dispatchEvent(event);
  }
  
  function handleMouseEnter(starIndex: number) {
    if (!interactive || readonly) return;
    hoverRating = starIndex + 1;
    isHovering = true;
  }
  
  function handleMouseLeave() {
    if (!interactive || readonly) return;
    isHovering = false;
  }
</script>

<div 
  class="flex items-center gap-0.5"
  class:pointer-events-none={!interactive || readonly}
  on:mouseleave={handleMouseLeave}
>
  {#each Array(fullStars) as _, i}
    <button
      class={`${currentSize.class} text-yellow-400 hover:scale-110 transition-transform`}
      on:click={() => handleClick(i + 1)}
      on:mouseenter={() => handleMouseEnter(i)}
      aria-label={`Calificar con ${i + 1} ${i === 0 ? 'estrella' : 'estrellas'}`}
    >
      <Star size={currentSize.size} fill="currentColor" />
    </button>
  {/each}
  
  {#if hasHalfStar}
    <button
      class={`${currentSize.class} text-yellow-400 hover:scale-110 transition-transform`}
      on:click={() => handleClick(fullStars + 0.5)}
      on:mouseenter={() => handleMouseEnter(fullStars)}
      aria-label={`Calificar con ${fullStars + 0.5} estrellas`}
    >
      <StarHalf size={currentSize.size} fill="currentColor" />
    </button>
  {/if}
  
  {#each Array(emptyStars) as _, i}
    <button
      class={`${currentSize.class} text-yellow-400 hover:scale-110 transition-transform`}
      on:click={() => handleClick(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
      on:mouseenter={() => handleMouseEnter(fullStars + (hasHalfStar ? 1 : 0) + i)}
      aria-label={`Calificar con ${fullStars + (hasHalfStar ? 1 : 0) + i + 1} ${i === 0 ? 'estrella' : 'estrellas'}`}
    >
      <Star size={currentSize.size} />
    </button>
  {/each}
  
  {#if showNumber}
    <span class="ml-1 text-sm font-medium text-gray-900 dark:text-white">
      {rating.toFixed(1)}
    </span>
  {/if}
  
  {#if interactive && !readonly}
    <span class="sr-only">
      Calificación: {isHovering ? hoverRating : rating} de {max} estrellas
    </span>
  {/if}
</div>
