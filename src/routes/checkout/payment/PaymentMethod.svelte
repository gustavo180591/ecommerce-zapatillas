<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
  import { Label } from '$lib/components/ui/label';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { CreditCard, Wallet } from 'lucide-svelte';
  import { formatPrice } from '$lib/checkout';
  import { cart } from '$lib/stores/cart';
  import { get } from 'svelte/store';

  export let orderTotal: number;
  export let shippingData: any;
  
  const dispatch = createEventDispatcher<{
    back: void;
    submit: { paymentMethod: 'stripe' | 'mercadopago' };
  }>();

  let selectedMethod: 'stripe' | 'mercadopago' = 'mercadopago';
  let isLoading = false;
  let error = '';

  const cartItems = get(cart)?.items || [];
  const cartTotal = get(cart)?.total || 0;
  const shippingCost = cartTotal > 10000 ? 0 : 1500;
  const tax = cartTotal * 0.21;
  const total = orderTotal || cartTotal + tax + shippingCost;

  const handleSubmit = () => {
    if (!selectedMethod) {
      error = 'Por favor selecciona un método de pago';
      return;
    }
    
    dispatch('submit', { paymentMethod: selectedMethod });
  };
</script>

<div class="max-w-4xl mx-auto p-4">
  <div class="mb-6">
    <h1 class="text-2xl font-bold">Método de pago</h1>
    <p class="text-gray-600">Selecciona cómo deseas pagar tu pedido</p>
  </div>
  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
      {error}
    </div>
  {/if}

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Payment Methods -->
    <div class="md:col-span-2 space-y-6">
      <RadioGroup 
        bind:value={selectedMethod} 
        class="space-y-4"
      >
        <!-- MercadoPago -->
        <Card class="cursor-pointer hover:border-primary {selectedMethod === 'mercadopago' ? 'border-2 border-primary' : ''}">
          <CardContent class="p-4 flex items-center space-x-4">
            <RadioGroupItem value="mercadopago" id="mercadopago" class="mt-1" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <Label for="mercadopago" class="text-base font-medium cursor-pointer">
                  MercadoPago
                </Label>
                <div class="h-8 w-12 relative">
                  <img 
                    src="/payment-logos/mercadopago.png" 
                    alt="MercadoPago" 
                    class="h-full w-full object-contain"
                  />
                </div>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                Paga con MercadoPago usando tarjeta de crédito, débito o saldo.
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Stripe -->
        <Card class="cursor-pointer hover:border-primary {selectedMethod === 'stripe' ? 'border-2 border-primary' : ''}">
          <CardContent class="p-4 flex items-center space-x-4">
            <RadioGroupItem value="stripe" id="stripe" class="mt-1" />
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <Label for="stripe" class="text-base font-medium cursor-pointer">
                  Tarjeta de crédito o débito
                </Label>
                <div class="flex space-x-1">
                  <div class="h-6 w-8 relative">
                    <img 
                      src="/payment-logos/visa.png" 
                      alt="Visa" 
                      class="h-full w-full object-contain"
                    />
                  </div>
                  <div class="h-6 w-8 relative">
                    <img 
                      src="/payment-logos/mastercard.png" 
                      alt="Mastercard" 
                      class="h-full w-full object-contain"
                    />
                  </div>
                  <div class="h-6 w-8 relative">
                    <img 
                      src="/payment-logos/amex.png" 
                      alt="American Express" 
                      class="h-full w-full object-contain"
                    />
                  </div>
                </div>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                Paga con tarjeta de crédito o débito de forma segura.
              </p>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>

      <!-- Payment Details (shown when Stripe is selected) -->
      {#if selectedMethod === 'stripe'}
        <div class="border rounded-lg p-4 mt-6">
          <h3 class="font-medium mb-4 flex items-center">
            <CreditCard class="h-5 w-5 mr-2" />
            Detalles de la tarjeta
          </h3>
          <div id="card-element" class="p-3 border rounded">
            <!-- Stripe Elements will be inserted here -->
          </div>
          <p class="text-xs text-gray-500 mt-2">
            El pago se procesará de forma segura a través de Stripe.
          </p>
        </div>
      {/if}
    </div>

    <!-- Order Summary -->
    <div class="space-y-6">
      <div class="border rounded-lg p-4">
        <h3 class="font-medium mb-4">Resumen del pedido</h3>
        
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">Subtotal</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Envío</span>
            <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Impuestos (21%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div class="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span class="text-lg">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">Pago seguro</h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>Tus datos de pago están encriptados y protegidos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Navigation Buttons -->
  <div class="flex justify-between mt-8 pt-6 border-t">
    <Button 
      type="button" 
      variant="outline" 
      on:click={() => dispatch('back')}
    >
      Volver a envío
    </Button>
    <Button 
      type="button" 
      on:click={handleSubmit}
      disabled={isLoading}
    >
      {isLoading ? 'Procesando...' : 'Realizar pago'}
    </Button>
  </div>
</div>
