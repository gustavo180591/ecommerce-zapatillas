<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { ArrowUpRight, Package, Users, DollarSign, ShoppingCart } from 'lucide-svelte';
  import { toast } from 'svelte-sonner';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';

  // Mock data - replace with actual API calls
  let stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0
  };
  
  let recentOrders = [];
  let loading = true;
  let error = null;

  // Fetch dashboard data
  onMount(async () => {
    try {
      // In a real app, you would fetch this from your API
      // const response = await fetch('/api/admin/dashboard');
      // const data = await response.json();
      
      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 800));
      
      stats = {
        totalProducts: 124,
        totalOrders: 89,
        totalRevenue: 12540.50,
        totalUsers: 256
      };
      
      recentOrders = [
        { id: 'ORD-1001', customer: 'Juan Pérez', amount: 245.99, status: 'completed' },
        { id: 'ORD-1002', customer: 'María García', amount: 189.50, status: 'processing' },
        { id: 'ORD-1003', customer: 'Carlos López', amount: 89.99, status: 'pending' },
        { id: 'ORD-1004', customer: 'Ana Martínez', amount: 320.00, status: 'completed' },
        { id: 'ORD-1005', customer: 'Luis Rodríguez', amount: 145.75, status: 'cancelled' }
      ];
      
    } catch (err) {
      console.error('Error loading dashboard:', err);
      error = 'No se pudo cargar el panel de control';
      toast.error(error);
    } finally {
      loading = false;
    }
  });
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };
  
  const getStatusBadgeClass = (status: string) => {
    const classes = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };
</script>

<svelte:head>
  <title>Panel de Administración - Dashboard</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Bienvenido de nuevo!</h2>
      <p class="text-muted-foreground">
        Aquí tienes un resumen de lo que está pasando en tu tienda.
      </p>
    </div>
    <div class="flex items-center space-x-2">
      <Button variant="outline">
        <span>Ver informe completo</span>
        <ArrowUpRight class="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
  
  {#if loading}
    <div class="flex items-center justify-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  {:else if error}
    <div class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          <div class="mt-4">
            <Button variant="outline" on:click={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Ingresos totales
          </CardTitle>
          <DollarSign class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          <p class="text-xs text-muted-foreground">
            +20.1% respecto al mes pasado
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Órdenes
          </CardTitle>
          <ShoppingCart class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">+{stats.totalOrders}</div>
          <p class="text-xs text-muted-foreground">
            +12% respecto al mes pasado
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Productos
          </CardTitle>
          <Package class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">+{stats.totalProducts}</div>
          <p class="text-xs text-muted-foreground">
            +5 desde el mes pasado
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Usuarios
          </CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">+{stats.totalUsers}</div>
          <p class="text-xs text-muted-foreground">
            +30 desde el mes pasado
          </p>
        </CardContent>
      </Card>
    </div>
    
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card class="col-span-4">
        <CardHeader>
          <CardTitle>Órdenes recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orden
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each recentOrders as order}
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(order.amount)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <div class="mt-4 text-right">
            <a href="/admin/orders" class="text-sm font-medium text-primary hover:text-primary/80">
              Ver todas las órdenes →
            </a>
          </div>
        </CardContent>
      </Card>
      
      <Card class="col-span-3">
        <CardHeader>
          <CardTitle>Ventas recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-8">
            {#each recentOrders.filter(o => o.status === 'completed').slice(0, 3) as order}
              <div class="flex items-center">
                <div class="ml-4 space-y-1">
                  <p class="text-sm font-medium leading-none">{order.customer}</p>
                  <p class="text-sm text-muted-foreground">
                    {order.id}
                  </p>
                </div>
                <div class="ml-auto font-medium">
                  {formatCurrency(order.amount)}
                </div>
              </div>
            {/each}
          </div>
        </CardContent>
      </Card>
    </div>
  {/if}
</div>
