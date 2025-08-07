<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { debounce } from '$lib/utils/debounce';
  import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/vue/24/outline';

  export let value = '';
  export let placeholder = 'Buscar productos...';
  export let debounceMs = 300;
  export let className = '';
  
  const dispatch = createEventDispatcher<{
    search: { value: string };
    clear: void;
  }>();

  let inputEl: HTMLInputElement;
  let isFocused = false;

  const handleInput = debounce((e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    dispatch('search', { value });
  }, debounceMs);

  const clearSearch = () => {
    if (inputEl) {
      inputEl.value = '';
      inputEl.focus();
    }
    dispatch('clear');
  };

  // Focus the input when the component mounts if it's empty
  onMount(() => {
    if (!value && inputEl) {
      inputEl.focus();
    }
  });
</script>

<div
  class={`relative flex items-center ${className}`}
  class:ring-2
  class:ring-blue-500={isFocused}
  class:ring-transparent={!isFocused}
  class:rounded-lg
  class:transition-all
  class:duration-200
  class:bg-white
  class:dark:bg-gray-800
  class:border
  class:border-gray-300
  class:dark:border-gray-600
  class:focus-within:ring-2
  class:focus-within:ring-blue-500
  class:focus-within:border-transparent`}
>
  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
  </div>
  
  <input
    bind:this={inputEl}
    type="text"
    class="block w-full pl-10 pr-10 py-2 border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 sm:text-sm"
    placeholder={placeholder}
    on:input={handleInput}
    on:focus={() => (isFocused = true)}
    on:blur={() => (isFocused = false)}
    value={value}
    aria-label="Buscar productos"
  />
  
  {#if value}
    <button
      type="button"
      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
      on:click|stopPropagation={clearSearch}
      aria-label="Limpiar búsqueda"
    >
      <XMarkIcon class="h-5 w-5" />
    </button>
  {/if}
</div>
