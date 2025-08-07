<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';
  import { setAlertDialogContext } from './alert-dialog';
  import { writable } from 'svelte/store';
  import { Button } from '$lib/components/ui/button';
  import { X } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import * as Dialog from '$lib/components/ui/dialog';

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

  const context = setAlertDialogContext({
    isOpen,
    open: openDialog,
    close,
    toggle
  });
</script>

<Dialog.Root bind:open={isOpen} onOpenChange={onOpenChange}>
  <Dialog.Trigger bind:open={isOpen} onOpenChange={onOpenChange}>
    <slot name="trigger" />
  </Dialog.Trigger>
  <Dialog.Content
    transition:fly={{
      y: 20,
      duration: 200
    }}
    class="sm:max-w-[425px]"
  >
    <slot />
  </Dialog.Content>
</Dialog.Root>
