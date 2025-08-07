<script lang="ts">
  import { cn } from '$lib/utils';
  
  export let class: string = '';
</script>

<h2
  class={cn('text-lg font-semibold', class)}
  {...$$restProps}
>
  <slot />
</h2>
