<script lang="ts">
  import { onMount } from 'svelte';
  import { cart } from '$lib/stores/cart';
  import { get } from 'svelte/store';
  import { initStripe } from '$lib/stores/stripe';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  
  // Import checkout components
  import ShippingForm from './shipping/ShippingForm.svelte';
  import PaymentMethod from './payment/PaymentMethod.svelte';
  import OrderConfirmation from './review/OrderConfirmation.svelte';
  
  // Checkout steps
  type CheckoutStep = 'shipping' | 'payment' | 'confirmation';
  
  // State
  let currentStep: CheckoutStep = 'shipping';
  let order: any = null;
  let isLoading = false;
  let error = '';
  
  // Form data
  let shippingData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Argentina'
  };
  
  // Initialize Stripe
  onMount(async () => {
    await initStripe();
    
    // Check if cart is empty
    const cartItems = get(cart)?.items || [];
    if (cartItems.length === 0) {
      toast.error('Tu carrito está vacío');
      goto('/cart');
    }
  });
  
  // Handle shipping form submission
  function handleShippingSubmit(event: CustomEvent) {
    shippingData = event.detail.shippingData;
    currentStep = 'payment';
    window.scrollTo(0, 0);
  }
  
  // Handle payment method submission
  async function handlePaymentSubmit(event: CustomEvent) {
    const { paymentMethod } = event.detail;
    isLoading = true;
    error = '';
    
    try {
      const cartData = get(cart);
      if (!cartData) throw new Error('Carrito no encontrado');
      
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartId: cartData.id,
          paymentMethod,
          shippingData
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el pago');
      }
      
      const result = await response.json();
      
      // Handle redirect for MercadoPago
      if (paymentMethod === 'mercadopago' && result.initPoint) {
        window.location.href = result.initPoint;
        return;
      }
      
      // For Stripe, we'll handle the redirect client-side
      if (paymentMethod === 'stripe' && result.clientSecret) {
        const stripe = await import('@stripe/stripe-js');
        const stripeInstance = await stripe.loadStripe(
          import.meta.env.VITE_STRIPE_PUBLIC_KEY
        );
        
        if (!stripeInstance) throw new Error('Error al cargar Stripe');
        
        const { error: stripeError } = await stripeInstance.redirectToCheckout({
          sessionId: result.clientSecret,
        });
        
        if (stripeError) throw stripeError;
      }
      
      // If we get here, the order was created successfully
      order = {
        id: result.orderId,
        status: 'PENDING',
        total: cartData.total,
        items: cartData.items.map(item => ({
          ...item,
          price: item.product.price,
          image: item.product.images?.[0] || '/placeholder-product.jpg'
        })),
        shipping: shippingData,
        payment: {
          method: paymentMethod,
          status: 'PENDING'
        }
      };
      
      currentStep = 'confirmation';
      window.scrollTo(0, 0);
      
    } catch (err) {
      console.error('Checkout error:', err);
      error = err.message || 'Error al procesar el pago';
      toast.error(error);
    } finally {
      isLoading = false;
    }
  }
  
  // Handle back button
  function handleBack() {
    if (currentStep === 'payment') {
      currentStep = 'shipping';
    } else if (currentStep === 'confirmation') {
      currentStep = 'payment';
    } else {
      goto('/cart');
    }
    window.scrollTo(0, 0);
  }
  
  // Handle successful order
  function handleOrderSuccess() {
    // Reset cart and navigate to home
    cart.clear();
    goto('/');
  }
</script>

<div class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Progress Steps -->
    <nav class="flex items-center justify-center mb-12">
      <ol class="flex items-center w-full max-w-md">
        <!-- Shipping Step -->
        <li class="flex items-center w-full">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center {currentStep === 'shipping' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'} font-medium">
              1
            </div>
            <span class="ml-2 text-sm font-medium text-gray-900">Envío</span>
          </div>
          <div class="flex-1 h-0.5 bg-gray-200 ml-2"></div>
        </li>
        
        <!-- Payment Step -->
        <li class="flex items-center w-full">
          <div class="flex items-center">
            <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center {['payment', 'confirmation'].includes(currentStep) ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'} font-medium">
              2
            </div>
            <span class="ml-2 text-sm font-medium text-gray-900">Pago</span>
          </div>
          <div class="flex-1 h-0.5 bg-gray-200 ml-2"></div>
        </li>
        
        <!-- Confirmation Step -->
        <li class="flex items-center">
          <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center {currentStep === 'confirmation' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'} font-medium">
            3
          </div>
          <span class="ml-2 text-sm font-medium text-gray-900">Confirmación</span>
        </li>
      </ol>
    </nav>
    
    <!-- Main Content -->
    <div class="bg-white rounded-lg shadow-lg overflow-hidden">
      {#if currentStep === 'shipping'}
        <ShippingForm 
          initialData={shippingData}
          on:next={handleShippingSubmit}
        />
      
      {:else if currentStep === 'payment'}
        <PaymentMethod 
          orderTotal={get(cart)?.total || 0}
          shippingData={shippingData}
          on:back={handleBack}
          on:submit={handlePaymentSubmit}
          bind:isLoading
        />
      
      {:else if currentStep === 'confirmation' && order}
        <OrderConfirmation 
          {order}
          on:continue={handleOrderSuccess}
        />
      {/if}
    </div>
    
    <!-- Error Message -->
    {#if error}
      <div class="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
        <p class="font-medium">Error</p>
        <p class="text-sm">{error}</p>
      </div>
    {/if}
  </div>
</div>
