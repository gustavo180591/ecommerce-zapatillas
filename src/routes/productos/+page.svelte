<script lang="ts">
  import { page } from '$app/stores';
  import { enhance } from '$app/forms';
  import { fade } from 'svelte/transition';
  import SearchInput from '$lib/components/SearchInput.svelte';
  import ProductFilterPanel from '$lib/components/ProductFilterPanel.svelte';
  import FilterChips from '$lib/components/FilterChips.svelte';
  import { ChevronDown, FunnelIcon, XMarkIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/vue/24/outline';

  // Load data from the server
  export let data;
  
  // State
  let loading = false;
  let error = data.error || null;
  let products = data.products || [];
  let meta = data.meta || { total: 0, currentPage: 1, totalPages: 1 };
  let currentFilters = data.currentFilters || {};
  let viewMode = 'grid'; // 'grid' or 'list'
  let showMobileFilters = false;
  
  // Get filter options from server data
  $: filterOptions = data.filterOptions || {
    categories: [],
    brands: [],
    sizes: [],
    colors: []
  };
  
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  // Get active filters for chips
  $: activeFilters = [
    ...(currentFilters.categories || []).map(id => ({
      id,
      label: id,
      groupId: 'categories',
      groupLabel: 'Categoría',
      value: id
    })),
    ...(currentFilters.brands || []).map(id => ({
      id,
      label: id,
      groupId: 'brands',
      groupLabel: 'Marca',
      value: id
    })),
    ...(currentFilters.sizes || []).map(id => ({
      id,
      label: id,
      groupId: 'sizes',
      groupLabel: 'Talla',
      value: id
    })),
    ...(currentFilters.colors || []).map(id => ({
      id,
      label: id,
      groupId: 'colors',
      groupLabel: 'Color',
      value: id
    })),
    ...(currentFilters.minPrice ? [{
      id: 'min-price',
      label: `Mín: $${currentFilters.minPrice}`,
      groupId: 'price',
      groupLabel: 'Precio',
      value: currentFilters.minPrice
    }] : []),
    ...(currentFilters.maxPrice ? [{
      id: 'max-price',
      label: `Máx: $${currentFilters.maxPrice}`,
      groupId: 'price',
      groupLabel: 'Precio',
      value: currentFilters.maxPrice
    }] : [])
  ];
  
  // Handle filter removal
  const removeFilter = (filter) => {
    const url = new URL(window.location.href);
    
    switch (filter.groupId) {
      case 'categories':
        url.searchParams.delete('category');
        currentFilters.categories = currentFilters.categories?.filter(c => c !== filter.id) || [];
        currentFilters.categories.forEach(cat => url.searchParams.append('category', cat));
        break;
      case 'brands':
        url.searchParams.delete('brand');
        currentFilters.brands = currentFilters.brands?.filter(b => b !== filter.id) || [];
        currentFilters.brands.forEach(brand => url.searchParams.append('brand', brand));
        break;
      case 'sizes':
        url.searchParams.delete('size');
        currentFilters.sizes = currentFilters.sizes?.filter(s => s !== filter.id) || [];
        currentFilters.sizes.forEach(size => url.searchParams.append('size', size));
        break;
      case 'colors':
        url.searchParams.delete('color');
        currentFilters.colors = currentFilters.colors?.filter(c => c !== filter.id) || [];
        currentFilters.colors.forEach(color => url.searchParams.append('color', color));
        break;
      case 'price':
        if (filter.id === 'min-price') {
          url.searchParams.delete('minPrice');
          delete currentFilters.minPrice;
        } else if (filter.id === 'max-price') {
          url.searchParams.delete('maxPrice');
          delete currentFilters.maxPrice;
        }
        break;
    }
    
    // Reset to first page when filters change
    url.searchParams.delete('page');
    window.location.href = url.toString();
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    const url = new URL(window.location.href);
    url.search = ''; // Remove all query parameters
    window.location.href = url.toString();
  };
  
  // Handle search
  const handleSearch = (event) => {
    const searchQuery = event.detail.value;
    const url = new URL(window.location.href);
    
    if (searchQuery) {
      url.searchParams.set('q', searchQuery);
    } else {
      url.searchParams.delete('q');
    }
    
    // Reset to first page on new search
    url.searchParams.delete('page');
    
    window.location.href = url.toString();
  };
  
  // Handle sort change
  const handleSortChange = (event) => {
    const sortBy = event.target.value;
    const url = new URL(window.location.href);
    
    if (sortBy && sortBy !== 'relevance') {
      url.searchParams.set('sortBy', sortBy);
    } else {
      url.searchParams.delete('sortBy');
    }
    
    window.location.href = url.toString();
  };
  
  // Handle page change
  const goToPage = (page) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.location.href = url.toString();
  };
  
  // Toggle mobile filters
  const toggleMobileFilters = () => {
    showMobileFilters = !showMobileFilters;
  };

	function calculateDiscount(originalPrice: number, currentPrice: number) {
		return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
	}
</script>

<svelte:head>
	<title>Productos - Ecommerce Zapatillas</title>
	<meta name="description" content="Explora nuestra colección completa de zapatillas" />
</svelte:head>

<div class="bg-gray-50 min-h-screen py-8">
	<div class="container mx-auto px-4">
		<!-- Breadcrumbs -->
		<nav class="mb-8">
			<ol class="flex items-center space-x-2 text-sm text-gray-600">
				<li><a href="/" class="hover:text-blue-600">Inicio</a></li>
				<li><span class="mx-2">/</span></li>
				<li class="text-gray-900">Productos</li>
			</ol>
		</nav>

		<div class="flex flex-col lg:flex-row gap-8">
			<!-- Filtros -->
			<div class="lg:w-1/4">
				<div class="bg-white rounded-lg shadow-lg p-6 sticky top-24">
					<div class="flex justify-between items-center mb-6">
						<h2 class="text-xl font-semibold text-gray-900">Filtros</h2>
						<button
							on:click={clearFilters}
							class="text-sm text-blue-600 hover:text-blue-800"
						>
							Limpiar
						</button>
					</div>

					<!-- Categoría -->
					<div class="mb-6">
						<h3 class="font-medium text-gray-900 mb-3">Categoría</h3>
						<div class="space-y-2">
							{#each categories as category}
								<label class="flex items-center">
									<input
										type="radio"
										bind:group={selectedCategory}
										value={category}
										class="mr-2"
									/>
									<span class="text-sm text-gray-700">{category}</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- Marca -->
					<div class="mb-6">
						<h3 class="font-medium text-gray-900 mb-3">Marca</h3>
						<div class="space-y-2">
							{#each brands as brand}
								<label class="flex items-center">
									<input
										type="radio"
										bind:group={selectedBrand}
										value={brand}
										class="mr-2"
									/>
									<span class="text-sm text-gray-700">{brand}</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- Precio -->
					<div class="mb-6">
						<h3 class="font-medium text-gray-900 mb-3">Precio</h3>
						<div class="space-y-2">
							{#each ['Todos', '0-10000', '10000-20000', '20000-30000', '30000+'] as range}
								<label class="flex items-center">
									<input
										type="radio"
										bind:group={selectedPriceRange}
										value={range}
										class="mr-2"
									/>
									<span class="text-sm text-gray-700">
										{range === 'Todos' ? 'Todos los precios' : 
										 range === '0-10000' ? 'Hasta $10.000' :
										 range === '10000-20000' ? '$10.000 - $20.000' :
										 range === '20000-30000' ? '$20.000 - $30.000' :
										 '$30.000+'}
									</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- Talla -->
					<div class="mb-6">
						<h3 class="font-medium text-gray-900 mb-3">Talla</h3>
						<div class="grid grid-cols-3 gap-2">
							{#each sizes as size}
								<label class="flex items-center">
									<input
										type="radio"
										bind:group={selectedSize}
										value={size}
										class="mr-1"
									/>
									<span class="text-sm text-gray-700">{size}</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- Color -->
					<div class="mb-6">
						<h3 class="font-medium text-gray-900 mb-3">Color</h3>
						<div class="space-y-2">
							{#each colors as color}
								<label class="flex items-center">
									<input
										type="radio"
										bind:group={selectedColor}
										value={color}
										class="mr-2"
									/>
									<span class="text-sm text-gray-700">{color}</span>
								</label>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Productos -->
			<div class="lg:w-3/4">
				<!-- Header de productos -->
				<div class="bg-white rounded-lg shadow-lg p-6 mb-6">
					<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<h1 class="text-2xl font-bold text-gray-900">Productos</h1>
							<p class="text-gray-600">{filteredProducts.length} productos encontrados</p>
						</div>
						
						<div class="flex items-center space-x-4">
							<!-- Ordenamiento -->
							<select
								bind:value={sortBy}
								class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="relevance">Relevancia</option>
								<option value="price-low">Precio: Menor a Mayor</option>
								<option value="price-high">Precio: Mayor a Menor</option>
								<option value="rating">Mejor Valorados</option>
								<option value="newest">Más Nuevos</option>
								<option value="name">Nombre A-Z</option>
							</select>

							<!-- Vista de cuadrícula -->
							<div class="flex border border-gray-300 rounded-lg">
								<button class="p-2 bg-blue-600 text-white rounded-l-lg">
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
									</svg>
								</button>
								<button class="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg">
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- Grid de productos -->
				{#if filteredProducts.length === 0}
					<div class="bg-white rounded-lg shadow-lg p-12 text-center">
						<div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<h2 class="text-2xl font-semibold text-gray-900 mb-4">No se encontraron productos</h2>
						<p class="text-gray-600 mb-8">Intenta ajustar los filtros para encontrar lo que buscas</p>
						<button
							on:click={clearFilters}
							class="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
						>
							Limpiar Filtros
						</button>
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{#each filteredProducts as product}
							<div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
								<!-- Badges -->
								<div class="relative">
									<img
										src={product.image}
										alt={product.name}
										class="w-full h-64 object-cover"
									/>
									<div class="absolute top-4 left-4 flex flex-col gap-2">
										{#if product.isNew}
											<span class="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
												NUEVO
											</span>
										{/if}
										{#if product.isOnSale && product.originalPrice}
											<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
												-{calculateDiscount(product.originalPrice, product.price)}%
											</span>
										{/if}
									</div>
								</div>

								<div class="p-6">
									<!-- Category y Brand -->
									<div class="flex justify-between items-start mb-2">
										<p class="text-sm text-blue-600 font-medium">{product.category}</p>
										<p class="text-sm text-gray-500">{product.brand}</p>
									</div>
									
									<!-- Title -->
									<h3 class="text-lg font-semibold text-gray-900 mb-2">
										<a href="/producto/{product.id}" class="hover:text-blue-600">
											{product.name}
										</a>
									</h3>

									<!-- Rating -->
									<div class="flex items-center mb-3">
										<div class="flex items-center">
											{#each Array(5) as _, i}
												<svg class="w-4 h-4 {i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
													<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
												</svg>
											{/each}
										</div>
										<span class="text-sm text-gray-600 ml-2">({product.reviews})</span>
									</div>

									<!-- Price -->
									<div class="flex items-center justify-between mb-4">
										<div class="flex items-center space-x-2">
											<span class="text-xl font-bold text-gray-900">${product.price.toLocaleString('es-AR')}</span>
											{#if product.originalPrice && product.originalPrice > product.price}
												<span class="text-lg text-gray-500 line-through">${product.originalPrice.toLocaleString('es-AR')}</span>
											{/if}
										</div>
									</div>

									<!-- Actions -->
									<div class="flex space-x-2">
										<a
											href="/producto/{product.id}"
											class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
										>
											Ver Detalle
										</a>
										<button
											class="bg-gray-100 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
										>
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
											</svg>
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>

					<!-- Paginación -->
					<div class="mt-12 flex justify-center">
						<nav class="flex items-center space-x-2">
							<button class="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
								</svg>
							</button>
							<button class="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
							<button class="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">2</button>
							<button class="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">3</button>
							<button class="px-3 py-2 text-gray-500 hover:text-gray-700">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</nav>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div> 