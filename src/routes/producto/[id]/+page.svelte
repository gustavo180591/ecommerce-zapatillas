<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { ReviewSummary, ReviewList } from '$lib/components/reviews';

	// Obtener el ID del producto de la URL
	$: productId = $page.params.id as string;

	// Estado del componente
	let selectedSize = '';
	let selectedColor = '';
	let quantity = 1;
	let isLoading = false;
	let error = '';

	// Producto de ejemplo (en producción vendría de la base de datos)
	let product = {
		id: productId,
		name: 'Zapatilla Urbana Premium',
		price: 15000,
		originalPrice: 18000,
		description: 'Zapatilla urbana de alta calidad, perfecta para uso diario. Fabricada con materiales premium que garantizan comodidad y durabilidad. Ideal para caminar por la ciudad o para un look casual elegante.',
		features: [
			'Suela de goma antideslizante',
			'Plantilla removible y lavable',
			'Material transpirable',
			'Peso ligero (280g)',
			'Garantía de 6 meses'
		],
		sizes: ['38', '39', '40', '41', '42', '43', '44'],
		colors: [
			{ name: 'Negro', code: '#000000', available: true },
			{ name: 'Blanco', code: '#FFFFFF', available: true },
			{ name: 'Gris', code: '#808080', available: false },
			{ name: 'Azul', code: '#0000FF', available: true }
		],
		images: [
			'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
			'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop',
			'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=500&fit=crop',
			'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=500&h=500&fit=crop'
		],
		stock: 15,
		rating: 4.5,
		reviews: 128
	};

	let selectedImage = 0;

	function selectImage(index: number) {
		selectedImage = index;
	}

	function selectSize(size: string) {
		selectedSize = size;
	}

	function selectColor(color: any) {
		if (color.available) {
			selectedColor = color.name;
		}
	}

	function addToCart() {
		if (!selectedSize) {
			error = 'Por favor selecciona una talla';
			return;
		}
		if (!selectedColor) {
			error = 'Por favor selecciona un color';
			return;
		}
		
		error = '';
		// En producción aquí se agregaría al carrito
		console.log('Agregando al carrito:', {
			product: product,
			size: selectedSize,
			color: selectedColor,
			quantity: quantity
		});
		
		// Simular agregado al carrito
		alert('Producto agregado al carrito');
	}

	function buyNow() {
		if (!selectedSize || !selectedColor) {
			addToCart();
			return;
		}
		
		// Redirigir al checkout
		window.location.href = '/checkout';
	}

	// Calcular descuento
	$: discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
</script>

<svelte:head>
	<title>{product.name} - Ecommerce Zapatillas</title>
	<meta name="description" content={product.description} />
</svelte:head>

<div class="bg-gray-50 min-h-screen py-8">
	<div class="container mx-auto px-4">
		<!-- Breadcrumbs -->
		<nav class="mb-8">
			<ol class="flex items-center space-x-2 text-sm text-gray-600">
				<li><a href="/" class="hover:text-blue-600">Inicio</a></li>
				<li><span class="mx-2">/</span></li>
				<li><a href="/productos" class="hover:text-blue-600">Productos</a></li>
				<li><span class="mx-2">/</span></li>
				<li class="text-gray-900">{product.name}</li>
			</ol>
		</nav>

		<div class="bg-white rounded-lg shadow-lg overflow-hidden">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
				<!-- Galería de Imágenes -->
				<div class="space-y-4">
					<!-- Imagen Principal -->
					<div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
						<img
							src={product.images[selectedImage]}
							alt={product.name}
							class="w-full h-full object-cover"
						/>
					</div>
					
					<!-- Miniaturas -->
					<div class="grid grid-cols-4 gap-2">
						{#each product.images as image, index}
							<button
								on:click={() => selectImage(index)}
								class="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 {selectedImage === index ? 'border-blue-500' : 'border-transparent'}"
							>
								<img
									src={image}
									alt={`${product.name} - Vista ${index + 1}`}
									class="w-full h-full object-cover"
								/>
							</button>
						{/each}
					</div>
				</div>

				<!-- Información del Producto -->
				<div class="space-y-6">
					<!-- Título y Precio -->
					<div>
						<h1 class="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
						
						<!-- Rating -->
						<div class="flex items-center space-x-2 mb-4">
							<div class="flex items-center">
								{#each Array(5) as _, i}
									<svg class="w-5 h-5 {i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								{/each}
							</div>
							<span class="text-sm text-gray-600">{product.rating} ({product.reviews} reseñas)</span>
						</div>

						<!-- Precios -->
						<div class="flex items-center space-x-3">
							<span class="text-3xl font-bold text-gray-900">${product.price.toLocaleString('es-AR')}</span>
							{#if product.originalPrice > product.price}
								<span class="text-xl text-gray-500 line-through">${product.originalPrice.toLocaleString('es-AR')}</span>
								<span class="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
									-{discount}%
								</span>
							{/if}
						</div>

						<!-- Stock -->
						<div class="mt-2">
							<span class="text-sm text-gray-600">
								Stock disponible: <span class="font-medium text-green-600">{product.stock} unidades</span>
							</span>
						</div>
					</div>

					<!-- Descripción -->
					<div>
						<h3 class="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
						<p class="text-gray-600 leading-relaxed">{product.description}</p>
					</div>

					<!-- Características del Producto -->
					<div class="mt-8">
						<h3 class="text-lg font-semibold text-gray-900 mb-4">Características</h3>
						<ul class="space-y-2">
							{#each product.features as feature}
								<li class="flex items-start">
									<svg class="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									<span class="text-gray-700">{feature}</span>
								</li>
							{/each}
						</ul>
					</div>

					<!-- Sección de Reseñas -->
					<div class="mt-12 pt-8 border-t border-gray-200">
						<h2 class="text-2xl font-bold text-gray-900 mb-6">Opiniones de clientes</h2>
						
						<!-- Resumen de Reseñas -->
						<div class="mb-8">
							<ReviewSummary 
								averageRating={product.rating} 
								totalReviews={product.reviews}
								ratingDistribution={{
									5: Math.floor(product.reviews * 0.7), // 70% 5 estrellas
						<div class="grid grid-cols-4 gap-2">
							{#each product.sizes as size}
								<button
									on:click={() => selectSize(size)}
									class="py-2 px-4 border-2 rounded-lg text-center font-medium transition-colors {selectedSize === size ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}"
								>
									{size}
								</button>
							{/each}
						</div>
					</div>

					<!-- Selector de Color -->
					<div>
						<h3 class="text-lg font-semibold text-gray-900 mb-2">Color</h3>
						<div class="flex space-x-3">
							{#each product.colors as color}
								<button
									on:click={() => selectColor(color)}
									class="relative w-12 h-12 rounded-full border-2 transition-all {selectedColor === color.name ? 'border-blue-500 scale-110' : 'border-gray-300'} {!color.available ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}"
									style="background-color: {color.code}"
									disabled={!color.available}
								>
									{#if !color.available}
										<div class="absolute inset-0 bg-gray-400 opacity-50 rounded-full"></div>
									{/if}
								</button>
							{/each}
						</div>
						<p class="text-sm text-gray-600 mt-2">Color seleccionado: <span class="font-medium">{selectedColor || 'Ninguno'}</span></p>
					</div>

					<!-- Cantidad -->
					<div>
						<h3 class="text-lg font-semibold text-gray-900 mb-2">Cantidad</h3>
						<div class="flex items-center space-x-3">
							<button
								on:click={() => quantity > 1 && quantity--}
								class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
								disabled={quantity <= 1}
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
								</svg>
							</button>
							<span class="w-16 text-center font-medium">{quantity}</span>
							<button
								on:click={() => quantity < product.stock && quantity++}
								class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
								disabled={quantity >= product.stock}
							>
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
							</button>
						</div>
					</div>

					<!-- Error -->
					{#if error}
						<div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
							{error}
						</div>
					{/if}

					<!-- Botones de Acción -->
					<div class="space-y-3">
						<button
							on:click={buyNow}
							class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
						>
							Comprar Ahora
						</button>
						<button
							on:click={addToCart}
							class="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
						>
							Agregar al Carrito
						</button>
					</div>

					<!-- Información Adicional -->
					<div class="border-t pt-6 space-y-4">
						<div class="flex items-center text-sm text-gray-600">
							<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
							</svg>
							Envío gratis en compras superiores a $50.000
						</div>
						<div class="flex items-center text-sm text-gray-600">
							<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							Garantía de 6 meses
						</div>
						<div class="flex items-center text-sm text-gray-600">
							<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
							Devolución gratuita en 30 días
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div> 