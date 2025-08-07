<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
  import { cart } from '$lib/stores/cart';
  import { formatPrice } from '$lib/checkout';
  import { get } from 'svelte/store';

  export let initialData = {
    name: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Argentina',
    phone: '',
    email: ''
  };

  const dispatch = createEventDispatcher<{
    next: { shippingData: typeof initialData };
  }>();

  let formData = { ...initialData };
  let isLoading = false;
  let error = '';

  const cartTotal = get(cart)?.total || 0;
  const shippingCost = cartTotal > 10000 ? 0 : 1500;
  const tax = cartTotal * 0.21;
  const total = cartTotal + tax + shippingCost;

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.address || !formData.city || 
        !formData.state || !formData.postalCode || !formData.email) {
      error = 'Por favor completa todos los campos obligatorios';
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      error = 'Por favor ingresa un email válido';
      return;
    }

    dispatch('next', { shippingData: formData });
  };
</script>

<div class="max-w-4xl mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6">Información de envío</h1>
  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}

  <form on:submit={handleSubmit} class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Contact Information -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Información de contacto</h2>
        
        <div class="space-y-2">
          <Label for="email">Email *</Label>
          <Input 
            bind:value={formData.email}
            type="email" 
            id="email" 
            placeholder="tu@email.com" 
            required 
          />
        </div>
        
        <div class="space-y-2">
          <Label for="phone">Teléfono *</Label>
          <Input 
            bind:value={formData.phone}
            type="tel" 
            id="phone" 
            placeholder="+54 9 11 1234-5678" 
            required 
          />
        </div>
      </div>

      <!-- Shipping Address -->
      <div class="space-y-4">
        <h2 class="text-lg font-semibold">Dirección de envío</h2>
        
        <div class="space-y-2">
          <Label for="name">Nombre completo *</Label>
          <Input 
            bind:value={formData.name}
            type="text" 
            id="name" 
            placeholder="Juan Pérez" 
            required 
          />
        </div>
        
        <div class="space-y-2">
          <Label for="address">Dirección *</Label>
          <Input 
            bind:value={formData.address}
            type="text" 
            id="address" 
            placeholder="Av. Corrientes 1234" 
            required 
          />
        </div>
        
        <div class="space-y-2">
          <Label for="address2">Departamento, piso, etc. (opcional)</Label>
          <Input 
            bind:value={formData.address2}
            type="text" 
            id="address2" 
            placeholder="Piso 2, Depto. B" 
          />
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="city">Ciudad *</Label>
            <Input 
              bind:value={formData.city}
              type="text" 
              id="city" 
              placeholder="Buenos Aires" 
              required 
            />
          </div>
          
          <div class="space-y-2">
            <Label for="state">Provincia *</Label>
            <Input 
              bind:value={formData.state}
              type="text" 
              id="state" 
              placeholder="Buenos Aires" 
              required 
            />
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="postalCode">Código postal *</Label>
            <Input 
              bind:value={formData.postalCode}
              type="text" 
              id="postalCode" 
              placeholder="C1043" 
              required 
            />
          </div>
          
          <div class="space-y-2">
            <Label for="country">País</Label>
            <Select value={formData.country} on:change={(e) => formData.country = e.detail}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Argentina">Argentina</SelectItem>
                <SelectItem value="Uruguay">Uruguay</SelectItem>
                <SelectItem value="Chile">Chile</SelectItem>
                <SelectItem value="Brasil">Brasil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Summary -->
    <div class="border-t pt-6 mt-8">
      <h2 class="text-lg font-semibold mb-4">Resumen del pedido</h2>
      
      <div class="bg-gray-50 p-4 rounded-lg space-y-2">
        <div class="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>
        <div class="flex justify-between">
          <span>Envío</span>
          <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
        </div>
        <div class="flex justify-between">
          <span>Impuestos (21%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div class="border-t pt-2 mt-2 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-4">
      <Button type="submit" class="w-full md:w-auto" disabled={isLoading}>
        {isLoading ? 'Procesando...' : 'Continuar al pago'}
      </Button>
    </div>
  </form>
</div>
