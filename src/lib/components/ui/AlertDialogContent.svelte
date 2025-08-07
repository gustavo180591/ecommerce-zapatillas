<script lang="ts">
  import { getAlertDialogContext } from './alert-dialog';
  import { Button } from '$lib/components/ui/button';
  import { X } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { onMount } from 'svelte';

  export let class: string = '';
  export let showCloseButton: boolean = true;
  
  const { close } = getAlertDialogContext();
  
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }
  
  onMount(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });
</script>

<div
  class={cn(
    'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
    class
  )}
  on:click|stopPropagation
>
  {#if showCloseButton}
    <Button
      type="button"
      variant="ghost"
      size="icon"
      on:click={close}
      class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
    >
      <X class="h-4 w-4" />
      <span class="sr-only">Cerrar</span>
    </Button>
  {/if}
  <slot />
</div>
