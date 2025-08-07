<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { getAlertDialogContext } from './alert-dialog';
  import { onMount } from 'svelte';

  export let as: string = 'button';
  export let variant = 'default';
  export let class: string = '';
  
  const { close } = getAlertDialogContext();
</script>

<Button
  variant={variant}
  class={class}
  on:click={close}
  {...$$restProps}
>
  <slot />
</Button>
