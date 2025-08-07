<script lang="ts">
  import { cn } from '$lib/utils';
  
  export let class: string = '';
</script>

<p
  class={cn('text-sm text-muted-foreground', class)}
  {...$$restProps}
>
  <slot />
</p>
