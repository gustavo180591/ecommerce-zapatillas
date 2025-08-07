<script lang="ts">
  import { XMarkIcon } from '@heroicons/vue/24/outline';
  
  export interface FilterChip {
    id: string;
    label: string;
    groupId: string;
    groupLabel?: string;
    value: string;
    removable?: boolean;
  }

  export let filters: FilterChip[] = [];
  export let onRemove: (filter: FilterChip) => void = () => {};
  export let onClearAll: () => void = () => {};
  export let className = '';
  export let showClearAll = true;
</script>

{#if filters.length > 0}
  <div class={`flex flex-wrap items-center gap-2 ${className}`}>
    <span class="text-sm font-medium text-gray-700">Filtros:</span>
    
    {#each filters as filter (filter.id)}
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {filter.groupLabel ? `${filter.groupLabel}: ` : ''}{filter.label}
        {#if filter.removable !== false}
          <button
            type="button"
            class="flex-shrink-0 ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-600 hover:bg-blue-200 hover:text-blue-800 focus:outline-none focus:bg-blue-200 focus:text-blue-800"
            on:click|stopPropagation={() => onRemove(filter)}
            aria-label={`Eliminar filtro ${filter.label}`}
          >
            <XMarkIcon class="h-3 w-3" />
          </button>
        {/if}
      </span>
    {/each}
    
    {#if showClearAll && filters.length > 1}
      <button
        type="button"
        class="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
        on:click|stopPropagation={onClearAll}
      >
        Limpiar todo
      </button>
    {/if}
  </div>
{/if}
