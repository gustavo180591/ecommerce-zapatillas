import { goto } from '$app/navigation';
import { cart } from '$lib/stores/cart';
import { get } from 'svelte/store';

type CheckoutOptions = {
  paymentMethod: 'stripe' | 'mercadopago';
  shippingAddress: {
    name: string;
    address: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
  };
};

export async function initiateCheckout({ paymentMethod, shippingAddress }: CheckoutOptions) {
  const currentCart = get(cart);
  
  if (!currentCart?.items?.length) {
    throw new Error('El carrito está vacío');
  }

  try {
    // Create payment intent
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cartId: currentCart.id,
        paymentMethod,
        shippingAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar el pago');
    }

    const result = await response.json();

    // Handle different payment methods
    if (paymentMethod === 'stripe') {
      // Redirect to Stripe Checkout
      const stripe = (await import('@stripe/stripe-js')).loadStripe(
        import.meta.env.VITE_STRIPE_PUBLIC_KEY
      );
      
      const { error } = await (await stripe).redirectToCheckout({
        sessionId: result.clientSecret,
      });

      if (error) {
        throw error;
      }
    } else if (paymentMethod === 'mercadopago') {
      // Redirect to MercadoPago
      window.location.href = result.initPoint;
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}

// Utility to format price
// Example: formatPrice(1000) -> "$ 1.000,00"
export function formatPrice(amount: number, currency: string = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Utility to calculate cart totals
export function calculateCartTotals(items: Array<{ price: number; quantity: number }>) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.21; // 21% IVA
  const shipping = subtotal > 10000 ? 0 : 1500; // Free shipping for orders over $10,000
  const total = subtotal + tax + shipping;

  return {
    subtotal,
    tax,
    shipping,
    total,
  };
}
