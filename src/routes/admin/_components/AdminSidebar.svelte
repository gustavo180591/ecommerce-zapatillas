<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { signOut } from '@auth/sveltekit/client';
  import { 
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Home
  } from 'lucide-svelte';

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Productos', href: '/admin/products', icon: Package },
    { name: 'Órdenes', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Usuarios', href: '/admin/users', icon: Users },
    { name: 'Configuración', href: '/admin/settings', icon: Settings }
  ];

  const isActive = (path: string) => {
    return $page.url.pathname.startsWith(path) ? 'bg-gray-100 text-primary' : 'text-gray-600 hover:bg-gray-50';
  };

  const handleSignOut = async () => {
    await signOut({ redirectTo: '/' });
  };
</script>

<aside class="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed">
  <div class="p-4 border-b border-gray-200">
    <h1 class="text-xl font-bold text-gray-900">Admin Panel</h1>
  </div>
  
  <nav class="flex-1 px-2 py-4 space-y-1">
    {#each navItems as item}
      <a 
        href={item.href}
        class={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${isActive(item.href)}`}
      >
        <svelte:component 
          this={item.icon} 
          class={`mr-3 h-5 w-5 flex-shrink-0 ${isActive(item.href).includes('text-primary') ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`}
        />
        {item.name}
      </a>
    {/each}
  </nav>
  
  <div class="p-4 border-t border-gray-200">
    <button 
      on:click={handleSignOut}
      class="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
    >
      <LogOut class="mr-3 h-5 w-5 text-red-500" />
      Cerrar sesión
    </button>
    
    <div class="mt-4 pt-4 border-t border-gray-200">
      <a 
        href="/" 
        class="flex items-center text-sm text-gray-600 hover:text-primary"
      >
        <Home class="mr-2 h-4 w-4" />
        Volver a la tienda
      </a>
    </div>
  </div>
</aside>
