<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { createButtonState, type ButtonVariant, type ButtonSize } from './button';

  export let variant: ButtonVariant = 'default';
  export let size: ButtonSize = 'default';
  export let class: string = '';
  export let disabled: boolean = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let loading: boolean = false;
  export let as: string = 'button';

  const dispatch = createEventDispatcher<{
    click: MouseEvent;
  }>();

  const state = createButtonState({
    variant,
    size,
    class,
    disabled,
    type,
    loading
  });

  // Update state when props change
  $effect(() => {
    state.variant = variant;
    state.size = size;
    state.class = class;
    state.disabled = disabled || loading;
    state.type = type;
    state.loading = loading;
  });

  function handleClick(event: MouseEvent) {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    dispatch('click', event);
  }
</script>

<button
  {...state.props}
  on:click={handleClick}
  class={$$props.class}
  disabled={disabled || loading}
  type={type}
  aria-busy={loading}
>
  <slot>
    {#if loading}
      <svg
        class="mr-2 h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    {/if}
    <slot name="icon"></slot>
  </slot>
</button>
