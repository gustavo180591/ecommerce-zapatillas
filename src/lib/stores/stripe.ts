import { writable } from 'svelte/store';

type StripePromise = ReturnType<typeof import('@stripe/stripe-js').loadStripe>;

export const stripePromise = writable<Promise<StripePromise | null> | null>(null);

export async function initStripe(): Promise<StripePromise | null> {
  try {
    // Only initialize once
    const existingPromise = get(stripePromise);
    if (existingPromise) {
      return existingPromise;
    }

    // Load Stripe.js asynchronously
    const loadPromise = (async () => {
      try {
        const stripeJs = await import('@stripe/stripe-js');
        const stripe = await stripeJs.loadStripe(
          import.meta.env.VITE_STRIPE_PUBLIC_KEY
        );
        return stripe;
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        return null;
      }
    })();

    // Store the promise
    stripePromise.set(loadPromise);
    return loadPromise;
  } catch (error) {
    console.error('Error initializing Stripe:', error);
    return null;
  }
}

// Helper to get the current value of a store
export function get<T>(store: { subscribe: any }): T {
  let value: T;
  store.subscribe((v: T) => (value = v))();
  return value!;
}
