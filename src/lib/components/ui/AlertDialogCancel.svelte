<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { getAlertDialogContext } from './alert-dialog';
  
  export let as: string = 'button';
  export let variant = 'outline';
  export let class: string = '';
  
  const { close } = getAlertDialogContext();
</script>

<Button
  variant={variant}
  class={class}
  on:click={close}
  {...$$restProps}
>
  <slot>Cancel</slot>
</Button>
