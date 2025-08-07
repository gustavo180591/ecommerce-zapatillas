<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { setDialogContext } from './dialog';
  import { writable } from 'svelte/store';
  import { cn } from '$lib/utils';

  export let open = false;
  export let onOpenChange: (open: boolean) => void = () => {};

  const isOpen = writable(open);
  
  const dispatch = createEventDispatcher<{
    open: boolean;
    close: () => void;
  }>();

  const close = () => {
    isOpen.set(false);
    onOpenChange(false);
    dispatch('close');
  };

  const openDialog = () => {
    isOpen.set(true);
    onOpenChange(true);
    dispatch('open', true);
  };

  const toggle = () => {
    if (open) {
      close();
    } else {
      openDialog();
    }
  };

  $: if (open !== $isOpen) {
    open ? openDialog() : close();
  }

  const context = setDialogContext({
    isOpen,
    open: openDialog,
    close,
    toggle
  });
</script>

<div class="relative z-50">
  <slot />
</div>
