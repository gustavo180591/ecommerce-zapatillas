<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { CheckCircle, Clock, AlertCircle, XCircle, Loader2 } from 'lucide-svelte';
  import { formatPrice } from '$lib/checkout';
  import { cart } from '$lib/stores/cart';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { pollPaymentStatus, clearCurrentOrder, getStatusMessage } from '$lib/utils/paymentStatus';
  import { toast } from 'svelte-sonner';

  export let order: {
    id: string;
    status: string;
    total: number;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      size: string;
      color: string;
      image: string;
    }>;
    shipping: {
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
    payment: {
      method: string;
      transactionId?: string;
      status: string;
    };
  };
  
  let currentStatus = order.status;
  let isLoading = true;
  let stopPolling: (() => void) | null = null;
  
  // Get status icon based on status
  function getStatusIcon() {
    if (['COMPLETED', 'DELIVERED', 'PAID'].includes(currentStatus)) {
      return CheckCircle;
    } else if (['FAILED', 'CANCELLED', 'DECLINED'].includes(currentStatus)) {
      return XCircle;
    } else if (['PENDING', 'PROCESSING', 'SHIPPED'].includes(currentStatus)) {
      return Clock;
    }
    return AlertCircle;
  }
  
  // Get status color based on status
  function getStatusColor() {
    if (['COMPLETED', 'DELIVERED', 'PAID'].includes(currentStatus)) {
      return 'text-green-600';
    } else if (['FAILED', 'CANCELLED', 'DECLINED'].includes(currentStatus)) {
      return 'text-red-600';
    } else if (['PENDING', 'PROCESSING', 'SHIPPED'].includes(currentStatus)) {
      return 'text-amber-600';
    }
    return 'text-gray-600';
  }
  
  // Handle status updates
  function handleStatusUpdate(status: any) {
    isLoading = false;
    if (status && status.status) {
      currentStatus = status.status;
      
      // Show toast notification on status change
      if (status.title && status.message) {
        if (status.type === 'success') {
          toast.success(status.title, { description: status.message });
        } else if (status.type === 'error') {
          toast.error(status.title, { description: status.message });
        } else if (status.type === 'warning') {
          toast.warning(status.title, { description: status.message });
        } else {
          toast(status.title, { description: status.message });
        }
      }
      
      // Stop polling if order is in a final state
      if (!['PENDING', 'PROCESSING'].includes(currentStatus) && stopPolling) {
        stopPolling();
        stopPolling = null;
      }
    }
  }
  
  // Start polling for status updates
  onMount(() => {
    // Only poll if order is not in a final state
    if (['PENDING', 'PROCESSING'].includes(order.status)) {
      stopPolling = pollPaymentStatus(order.id.toString(), handleStatusUpdate);
    } else {
      isLoading = false;
    }
    
    // Clear current order from session storage when component is destroyed
    return () => {
      if (stopPolling) {
        stopPolling();
      }
      clearCurrentOrder();
    };
  });
  
  // Format date to local string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get status message
  const statusMessage = $derived(getStatusMessage(currentStatus));
  const StatusIcon = $derived(getStatusIcon());
  const statusColor = $derived(getStatusColor());
  
  // Handle continue shopping
  function handleContinueShopping() {
    goto('/');
  }
  
  // Handle track order
  function handleTrackOrder() {
    goto(`/orders/${order.id}`);
  }

  // Clear cart on successful order
  onMount(() => {
    if (order.status === 'COMPLETED' || order.status === 'PROCESSING') {
      cart.clear();
    }
  });
</script>

<div class="max-w-4xl mx-auto p-4">
  <div class="text-center py-8">
    <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
      {#if isLoading}
        <Loader2 class="h-8 w-8 text-gray-600 animate-spin" />
      {:else}
        <StatusIcon class={`h-10 w-10 ${statusColor}`} />
      {/if}
    </div>
    <h1 class="mt-4 text-2xl font-bold text-gray-900">
      {isLoading 
        ? 'Verificando estado del pedido...'
        : statusMessage.title}
    </h1>
    <p class="mt-2 text-gray-600">
      {isLoading 
        ? 'Estamos verificando el estado más reciente de tu pedido.'
        : statusMessage.message}
    </p>
    <div class="mt-4 p-3 bg-gray-50 rounded-lg inline-block">
      <p class="font-medium">
        Número de pedido: <span class="text-primary">#{order.id}</span>
      </p>
      <p class="text-sm text-gray-500 mt-1">
        Estado actual: <span class={`font-medium ${statusColor}`}>
          {currentStatus.replace(/_/g, ' ').toLowerCase()}
        </span>
      </p>
      <p class="text-sm text-gray-500">
        Fecha: {formatDate(new Date().toISOString())}
      </p>
    </div>
    
    {#if ['FAILED', 'CANCELLED', 'DECLINED'].includes(currentStatus)}
      <div class="mt-4">
        <Button on:click={() => goto('/checkout')} variant="outline" class="mr-2">
          Reintentar pago
        </Button>
        <Button on:click={handleContinueShopping}>
          Seguir comprando
        </Button>
      </div>
    {/if}
  </div>

  <div class="mt-8 border-t pt-8">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Order Summary -->
      <div class="md:col-span-2">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Resumen del pedido</h2>
        <div class="bg-gray-50 rounded-lg overflow-hidden">
          <ul class="divide-y divide-gray-200">
            {#each order.items as item}
              <li class="p-4 flex">
                <div class="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={item.image}
                    alt={item.name}
                    class="h-full w-full object-cover object-center"
                  />
                </div>

                <div class="ml-4 flex flex-1 flex-col">
                  <div>
                    <div class="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.name}</h3>
                      <p class="ml-4">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <p class="mt-1 text-sm text-gray-500">
                      Talle: {item.size} | Color: {item.color}
                    </p>
                  </div>
                  <div class="flex flex-1 items-end justify-between text-sm">
                    <p class="text-gray-500">Cantidad: {item.quantity}</p>
                  </div>
                </div>
              </li>
            {/each}
          </ul>

          <div class="border-t border-gray-200 p-4">
            <div class="flex justify-between text-base font-medium text-gray-900">
              <p>Total</p>
              <p>{formatPrice(order.total)}</p>
            </div>
            <p class="mt-0.5 text-sm text-gray-500">
              {order.payment.method === 'mercadopago' ? 'MercadoPago' : 'Tarjeta de crédito'}
              {order.payment.transactionId && ` • ${order.payment.transactionId}`}
            </p>
          </div>
        </div>
      </div>

      <!-- Shipping Information -->
      <div>
        <h2 class="text-lg font-medium text-gray-900 mb-4">Dirección de envío</h2>
        <div class="bg-gray-50 rounded-lg p-4">
          <address class="not-italic">
            <div class="font-medium">{order.shipping.name}</div>
            <div>{order.shipping.address}</div>
            {#if order.shipping.address2}
              <div>{order.shipping.address2}</div>
            {/if}
            <div>
              {order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}
            </div>
            <div>{order.shipping.country}</div>
            <div class="mt-2">
              <div class="font-medium">Teléfono:</div>
              <div>{order.shipping.phone}</div>
            </div>
            <div class="mt-1">
              <div class="font-medium">Email:</div>
              <div>{order.shipping.email}</div>
            </div>
          </address>
        </div>

        <div class="mt-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Estado del pedido</h2>
          <div class="bg-white border rounded-lg p-4">
            <div class="space-y-4">
              <div class="flex items-start">
                <div class={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                  ['PENDING', 'PROCESSING', 'COMPLETED'].includes(order.status) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <span class="text-xs font-medium">1</span>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-gray-900">Pedido confirmado</h3>
                  <p class="text-sm text-gray-500">Hemos recibido tu pedido</p>
                </div>
              </div>

              <div class="border-l-2 border-gray-200 h-6 ml-3"></div>

              <div class="flex items-start">
                <div class={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                  ['PROCESSING', 'COMPLETED'].includes(order.status) 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <span class="text-xs font-medium">2</span>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-gray-900">En preparación</h3>
                  <p class="text-sm text-gray-500">Estamos preparando tu pedido</p>
                </div>
              </div>

              <div class="border-l-2 border-gray-200 h-6 ml-3"></div>

              <div class="flex items-start">
                <div class={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                  order.status === 'COMPLETED' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <span class="text-xs font-medium">3</span>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-gray-900">En camino</h3>
                  <p class="text-sm text-gray-500">Tu pedido está en camino</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-12 flex flex-col sm:flex-row justify-center gap-4">
    <Button 
      variant="outline" 
      on:click={handleContinueShopping}
      class="w-full sm:w-auto"
    >
      Seguir comprando
    </Button>
    {#if !['FAILED', 'CANCELLED', 'DECLINED'].includes(currentStatus)}
      <Button 
        on:click={handleTrackOrder}
        class="w-full sm:w-auto"
      >
        {isLoading ? 'Cargando...' : 'Ver estado del pedido'}
      </Button>
    {/if}
  </div>
</div>
