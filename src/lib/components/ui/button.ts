import { getContext, setContext } from 'svelte';
import { get, type Writable } from 'svelte/store';
import { derived, type Readable } from 'svelte/store';
import { isFunction, isInterface } from 'svelte/internal';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  class?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
};

const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline'
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10'
};

export function createButtonState(initial: Partial<ButtonProps> = {}) {
  const state = $state({
    variant: 'default' as ButtonVariant,
    size: 'default' as ButtonSize,
    class: '',
    disabled: false,
    type: 'button' as const,
    loading: false,
    ...initial
  });

  return {
    get variant() {
      return state.variant;
    },
    set variant(value: ButtonVariant) {
      state.variant = value;
    },
    get size() {
      return state.size;
    },
    set size(value: ButtonSize) {
      state.size = value;
    },
    get class() {
      return state.class;
    },
    set class(value: string) {
      state.class = value;
    },
    get disabled() {
      return state.disabled;
    },
    set disabled(value: boolean) {
      state.disabled = value;
    },
    get type() {
      return state.type;
    },
    set type(value: 'button' | 'submit' | 'reset') {
      state.type = value;
    },
    get loading() {
      return state.loading;
    },
    set loading(value: boolean) {
      state.loading = value;
    },
    get props() {
      return {
        class: `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${buttonVariants[state.variant]} ${buttonSizes[state.size]} ${state.class}`,
        disabled: state.disabled,
        type: state.type,
        'aria-disabled': state.disabled,
        'data-loading': state.loading ? 'true' : undefined
      };
    }
  };
}

export type ButtonState = ReturnType<typeof createButtonState>;

const BUTTON_CONTEXT = Symbol('button');

export function setButtonContext(state: ButtonState) {
  setContext(BUTTON_CONTEXT, state);
  return state;
}

export function getButtonContext() {
  return getContext<ButtonState>(BUTTON_CONTEXT);
}

export { default as Button } from './Button.svelte';
