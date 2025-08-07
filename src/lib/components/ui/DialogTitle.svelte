<script lang="ts">
  import { cn } from '$lib/utils';
  
  export let class: string = '';
</script>

<h3 class={cn('text-lg font-semibold leading-none tracking-tight', class)}>
  <slot />
</h3>
