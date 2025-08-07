import { getContext, setContext } from 'svelte';
import { writable, type Readable } from 'svelte/store';

const DIALOG_CONTEXT = 'DIALOG_CONTEXT';

type DialogContext = {
  isOpen: Readable<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export function setDialogContext(context: DialogContext) {
  setContext(DIALOG_CONTEXT, context);
  return context;
}

export function getDialogContext() {
  return getContext<DialogContext>(DIALOG_CONTEXT);
}

export { default as Dialog } from './Dialog.svelte';
export { default as DialogTrigger } from './DialogTrigger.svelte';
export { default as DialogContent } from './DialogContent.svelte';
export { default as DialogHeader } from './DialogHeader.svelte';
export { default as DialogTitle } from './DialogTitle.svelte';
export { default as DialogDescription } from './DialogDescription.svelte';
export { default as DialogFooter } from './DialogFooter.svelte';
