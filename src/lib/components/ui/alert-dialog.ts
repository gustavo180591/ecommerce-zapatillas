import { getContext, setContext } from 'svelte';
import type { Readable } from 'svelte/store';

const ALERT_DIALOG_CONTEXT = 'ALERT_DIALOG_CONTEXT';

type AlertDialogContext = {
  isOpen: Readable<boolean>;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export function setAlertDialogContext(context: AlertDialogContext) {
  setContext(ALERT_DIALOG_CONTEXT, context);
  return context;
}

export function getAlertDialogContext() {
  return getContext<AlertDialogContext>(ALERT_DIALOG_CONTEXT);
}

export { default as AlertDialog } from './AlertDialog.svelte';
export { default as AlertDialogAction } from './AlertDialogAction.svelte';
export { default as AlertDialogCancel } from './AlertDialogCancel.svelte';
export { default as AlertDialogContent } from './AlertDialogContent.svelte';
export { default as AlertDialogDescription } from './AlertDialogDescription.svelte';
export { default as AlertDialogFooter } from './AlertDialogFooter.svelte';
export { default as AlertDialogHeader } from './AlertDialogHeader.svelte';
export { default as AlertDialogTitle } from './AlertDialogTitle.svelte';
