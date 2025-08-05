<script lang="ts">
	import { onMount } from 'svelte';

	// Productos de ejemplo
	let products = [
		{
			id: 1,
			name: 'Zapatilla Urbana Premium',
			price: 15000,
			originalPrice: 18000,
			image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
			category: 'Urbana',
			rating: 4.5,
			reviews: 128,
			isNew: true,
			isOnSale: true
		},
		{
			id: 2,
			name: 'Zapatilla Deportiva Runner',
			price: 22000,
			image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop',
			category: 'Deportiva',
			rating: 4.8,
			reviews: 95,
			isNew: false,
			isOnSale: false
		},
		{
			id: 3,
			name: 'Zapatilla Casual Comfort',
			price: 12000,
			originalPrice: 15000,
			image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop',
			category: 'Casual',
			rating: 4.3,
			reviews: 67,
			isNew: false,
			isOnSale: true
		},
		{
			id: 4,
			name: 'Zapatilla Elegante Classic',
			price: 18000,
			image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400&h=400&fit=crop',
			category: 'Elegante',
			rating: 4.7,
			reviews: 89,
			isNew: true,
			isOnSale: false
		},
		{
			id: 5,
			name: 'Zapatilla Outdoor Adventure',
			price: 25000,
			originalPrice: 30000,
			image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
			category: 'Outdoor',
			rating: 4.6,
			reviews: 156,
			isNew: false,
			isOnSale: true
		},
		{
			id: 6,
			name: 'Zapatilla Minimalist Design',
			price: 16000,
			image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
			category: 'Minimalista',
			rating: 4.4,
			reviews: 73,
			isNew: true,
			isOnSale: false
		}
	];

	let categories = [
		{ name: 'Todas', count: products.length },
		{ name: 'Urbana', count: products.filter(p => p.category === 'Urbana').length },
		{ name: 'Deportiva', count: products.filter(p => p.category === 'Deportiva').length },
		{ name: 'Casual', count: products.filter(p => p.category === 'Casual').length },
		{ name: 'Elegante', count: products.filter(p => p.category === 'Elegante').length },
		{ name: 'Outdoor', count: products.filter(p => p.category === 'Outdoor').length },
		{ name: 'Minimalista', count: products.filter(p => p.category === 'Minimalista').length }
	];

	let selectedCategory = 'Todas';
	let filteredProducts = products;

	// Filtrar productos por categoría
	$: filteredProducts = selectedCategory === 'Todas' 
		? products 
		: products.filter(p => p.category === selectedCategory);

	function selectCategory(category: string) {
		selectedCategory = category;
	}

	function calculateDiscount(originalPrice: number, currentPrice: number) {
		return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
	}
</script>

<svelte:head>
	<title>Ecommerce Zapatillas - Las mejores zapatillas de Argentina</title>
	<meta name="description" content="Encuentra las mejores zapatillas con envío a todo Argentina. Pago seguro con Mercado Pago." />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Hero Section -->
	<div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
		<div class="container mx-auto px-4 text-center">
			<h1 class="text-5xl md:text-6xl font-bold mb-6">
				Las mejores zapatillas de Argentina
			</h1>
			<p class="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
				Calidad, comodidad y estilo en cada paso. Envío gratis en compras superiores a $50.000
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a
					href="/productos"
					class="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
				>
					Ver Productos
				</a>
				<a
					href="/ofertas"
					class="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-lg"
				>
					Ver Ofertas
				</a>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div class="py-16 bg-white">
		<div class="container mx-auto px-4">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div class="text-center">
					<div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-2">Envío Gratis</h3>
					<p class="text-gray-600">En compras superiores a $50.000 a todo Argentina</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-2">Garantía</h3>
					<p class="text-gray-600">6 meses de garantía en todos nuestros productos</p>
				</div>
				<div class="text-center">
					<div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					</div>
					<h3 class="text-xl font-semibold text-gray-900 mb-2">Devolución Gratuita</h3>
					<p class="text-gray-600">30 días para cambiar o devolver tu compra</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Categories Section -->
	<div class="py-16 bg-gray-50">
		<div class="container mx-auto px-4">
			<h2 class="text-3xl font-bold text-gray-900 text-center mb-12">Categorías</h2>
			<div class="flex flex-wrap justify-center gap-4">
				{#each categories as category}
					<button
						on:click={() => selectCategory(category.name)}
						class="px-6 py-3 rounded-full font-medium transition-colors {selectedCategory === category.name ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}"
					>
						{category.name} ({category.count})
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Products Section -->
	<div class="py-16 bg-white">
		<div class="container mx-auto px-4">
			<div class="flex justify-between items-center mb-12">
				<h2 class="text-3xl font-bold text-gray-900">
					{selectedCategory === 'Todas' ? 'Todos los Productos' : `Zapatillas ${selectedCategory}`}
				</h2>
				<span class="text-gray-600">{filteredProducts.length} productos</span>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
							<!-- Category -->
							<p class="text-sm text-blue-600 font-medium mb-2">{product.category}</p>
							
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

			<!-- Load More Button -->
			<div class="text-center mt-12">
				<button class="bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
					Cargar Más Productos
				</button>
			</div>
		</div>
	</div>

	<!-- Newsletter Section -->
	<div class="py-16 bg-blue-600">
		<div class="container mx-auto px-4 text-center">
			<h2 class="text-3xl font-bold text-white mb-4">¡Mantente al día!</h2>
			<p class="text-blue-100 mb-8 max-w-2xl mx-auto">
				Suscríbete a nuestro newsletter y recibe las mejores ofertas, nuevos productos y consejos de estilo directamente en tu email.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
				<input
					type="email"
					placeholder="Tu email"
					class="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
				/>
				<button class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
					Suscribirse
				</button>
			</div>
		</div>
	</div>

	<!-- Payment Methods Section -->
	<div class="py-16 bg-gray-100">
		<div class="container mx-auto px-4">
			<div class="text-center">
				<h2 class="text-3xl font-bold text-gray-900 mb-4">Métodos de Pago</h2>
				<p class="text-gray-600 mb-8">
					Aceptamos todos los métodos de pago disponibles en Argentina
				</p>
				<div class="flex flex-wrap justify-center items-center gap-8">
					<div class="flex items-center space-x-2 text-gray-600">
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
						</svg>
						<span>Tarjetas de crédito y débito</span>
					</div>
					<div class="flex items-center space-x-2 text-gray-600">
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
						</svg>
						<span>Transferencias bancarias</span>
					</div>
					<div class="flex items-center space-x-2 text-gray-600">
						<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
						</svg>
						<span>Efectivo (Rapipago, Pago Fácil)</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
