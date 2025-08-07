<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { ChevronDown, ChevronUp, XMarkIcon } from '@heroicons/vue/24/outline';

  export interface FilterOption {
    id: string;
    name: string;
    count?: number;
    selected?: boolean;
  }

  export interface FilterGroup {
    id: string;
    name: string;
    options: FilterOption[];
    type?: 'radio' | 'checkbox' | 'range' | 'color' | 'size';
    isOpen?: boolean;
  }

  export let filterGroups: FilterGroup[] = [];
  export let className = '';
  export let showClearButton = true;

  const dispatch = createEventDispatcher<{
    update: { groupId: string; optionId: string; value: boolean };
    clear: { groupId?: string };
  }>();

  const toggleGroup = (groupId: string) => {
    filterGroups = filterGroups.map((group) =>
      group.id === groupId ? { ...group, isOpen: !group.isOpen } : group
    );
  };

  const handleFilterChange = (groupId: string, optionId: string, value: boolean) => {
    dispatch('update', { groupId, optionId, value });
  };

  const clearFilters = (groupId?: string) => {
    dispatch('clear', { groupId });
  };
</script>

<div class={`bg-white rounded-lg shadow p-4 ${className}`}>
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-lg font-medium text-gray-900">Filtros</h3>
    {#if showClearButton}
      <button
        type="button"
        on:click|stopPropagation={() => clearFilters()}
        class="text-sm text-blue-600 hover:text-blue-800"
      >
        Limpiar todo
      </button>
    {/if}
  </div>

  <div class="divide-y divide-gray-200">
    {#each filterGroups as group (group.id)}
      <div class="py-3">
        <button
          type="button"
          on:click|stopPropagation={() => toggleGroup(group.id)}
          class="w-full flex justify-between items-center text-left text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          aria-expanded={group.isOpen}
          aria-controls={`filter-section-${group.id}`}
        >
          <span>{group.name}</span>
          {#if group.isOpen}
            <ChevronUp class="h-5 w-5 text-gray-500" />
          {:else}
            <ChevronDown class="h-5 w-5 text-gray-500" />
          {/if}
        </button>

        {#if group.isOpen}
          <div id={`filter-section-${group.id}`} class="pt-4">
            {#if group.type === 'range'}
              <!-- Range input for price or other numeric ranges -->
              <div class="space-y-4">
                <div class="flex items-center justify-between space-x-4">
                  <div class="flex-1">
                    <label for={`${group.id}-min`} class="block text-sm font-medium text-gray-700 mb-1">
                      Mínimo
                    </label>
                    <div class="relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name={`${group.id}-min`}
                        id={`${group.id}-min`}
                        class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0"
                        bind:value={group.options[0]?.value || ''}
                        on:input={(e) => handleFilterChange(group.id, 'min', e.target.value)}
                      />
                    </div>
                  </div>
                  <div class="flex-1">
                    <label for={`${group.id}-max`} class="block text-sm font-medium text-gray-700 mb-1">
                      Máximo
                    </label>
                    <div class="relative rounded-md shadow-sm">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name={`${group.id}-max`}
                        id={`${group.id}-max`}
                        class="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="100000"
                        bind:value={group.options[1]?.value || ''}
                        on:input={(e) => handleFilterChange(group.id, 'max', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            {:else if group.type === 'color'}
              <!-- Color swatches -->
              <div class="grid grid-cols-4 gap-2">
                {#each group.options as option (option.id)}
                  <button
                    type="button"
                    class={`w-8 h-8 rounded-full border-2 ${option.selected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    style={`background-color: ${option.id};`}
                    title={option.name}
                    aria-label={`Color ${option.name}`}
                    on:click|stopPropagation={() => handleFilterChange(group.id, option.id, !option.selected)}
                  >
                    {#if option.selected}
                      <div class="w-full h-full flex items-center justify-center text-white">
                        <XMarkIcon class="h-4 w-4" />
                      </div>
                    {/if}
                  </button>
                {/each}
              </div>
            {:else if group.type === 'size'}
              <!-- Size selector -->
              <div class="grid grid-cols-4 gap-2">
                {#each group.options as option (option.id)}
                  <button
                    type="button"
                    class={`w-full py-2 text-sm font-medium rounded-md border ${
                      option.selected
                        ? 'bg-blue-600 text-white border-transparent'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    on:click|stopPropagation={() => handleFilterChange(group.id, option.id, !option.selected)}
                  >
                    {option.name}
                  </button>
                {/each}
              </div>
            {:else}
              <!-- Default checkbox/radio list -->
              <div class="space-y-2">
                {#each group.options as option (option.id)}
                  <div class="flex items-center">
                    <input
                      id={`${group.id}-${option.id}`}
                      name={group.id}
                      type={group.type === 'radio' ? 'radio' : 'checkbox'}
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={option.selected}
                      on:change={() => handleFilterChange(group.id, option.id, !option.selected)}
                    />
                    <label
                      for={`${group.id}-${option.id}`}
                      class="ml-3 text-sm text-gray-600 flex items-center justify-between w-full"
                    >
                      <span>{option.name}</span>
                      {option.count !== undefined && (
                        <span class="text-xs text-gray-500 ml-2">({option.count})</span>
                      )}
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
