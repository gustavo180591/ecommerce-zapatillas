<script lang="ts">
  import { cn } from '$lib/utils';
  
  export let class: string = '';
</script>

<div
  class={cn('flex flex-col space-y-2 text-center sm:text-left', class)}
  {...$$restProps}
>
  <slot />
</div>
