<script lang="ts">
  import { getDialogContext } from './dialog';
  import { onMount } from 'svelte';

  const { open } = getDialogContext();

  export let as: string = 'button';
  export let class: string = '';
</script>

<svelte:element
  this={as}
  on:click|preventDefault={open}
  class={class}
  {...$$restProps}
>
  <slot />
</svelte:element>
