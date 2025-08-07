<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { isAdmin } from '$lib/server/auth';
  import { toast } from 'svelte-sonner';
  import LoadingSpinner from '$lib/components/ui/LoadingSpinner.svelte';
  import AdminSidebar from './_components/AdminSidebar.svelte';
  
  let loading = true;
  
  // Check admin status on mount
  onMount(async () => {
    const admin = await isAdmin();
    if (!admin) {
      toast.error('Acceso no autorizado');
      goto('/');
      return;
    }
    loading = false;
  });
</script>

<div class="min-h-screen bg-gray-50 flex">
  {#if loading}
    <div class="flex-1 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  {:else}
    <AdminSidebar />
    <main class="flex-1 p-6 overflow-auto">
      <div class="max-w-7xl mx-auto">
        <slot />
      </div>
    </main>
  {/if}
</div>
