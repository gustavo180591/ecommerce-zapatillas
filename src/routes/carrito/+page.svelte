<script lang="ts">
	import { onMount } from 'svelte';

	// Estado del carrito (en producción vendría de un store)
	let cartItems = [
		{
			id: 1,
			name: 'Zapatilla Urbana Premium',
			price: 15000,
			originalPrice: 18000,
			image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop',
			size: '42',
			color: 'Negro',
			quantity: 1,
			stock: 15
		},
		{
			id: 2,
			name: 'Zapatilla Deportiva Runner',
			price: 22000,
			image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop',
			size: '41',
			color: 'Blanco',
			quantity: 2,
			stock: 8
		}
	];

	let isLoading = false;

	// Calcular totales
	$: subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	$: discount = cartItems.reduce((sum, item) => {
		const itemDiscount = item.originalPrice ? (item.originalPrice - item.price) * item.quantity : 0;
		return sum + itemDiscount;
	}, 0);
	$: shipping = subtotal > 50000 ? 0 : 2000;
	$: total = subtotal - discount + shipping;
	$: totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

	function updateQuantity(itemId: number, newQuantity: number) {
		const item = cartItems.find(item => item.id === itemId);
		if (item) {
			if (newQuantity <= 0) {
				removeItem(itemId);
			} else if (newQuantity <= item.stock) {
				item.quantity = newQuantity;
			}
		}
	}

	function removeItem(itemId: number) {
		cartItems = cartItems.filter(item => item.id !== itemId);
	}

	function clearCart() {
		cartItems = [];
	}

	function proceedToCheckout() {
		if (cartItems.length === 0) {
			alert('Tu carrito está vacío');
			return;
		}
		window.location.href = '/checkout';
	}

	function continueShopping() {
		window.location.href = '/';
	}
</script>

<svelte:head>
	<title>Carrito de Compras - Ecommerce Zapatillas</title>
	<meta name="description" content="Revisa tu carrito de compras y finaliza tu pedido" />
</svelte:head>

<div class="bg-gray-50 min-h-screen py-8">
	<div class="container mx-auto px-4">
		<!-- Breadcrumbs -->
		<nav class="mb-8">
			<ol class="flex items-center space-x-2 text-sm text-gray-600">
				<li><a href="/" class="hover:text-blue-600">Inicio</a></li>
				<li><span class="mx-2">/</span></li>
				<li class="text-gray-900">Carrito de Compras</li>
			</ol>
		</nav>

		<h1 class="text-3xl font-bold text-gray-900 mb-8">Carrito de Compras</h1>

		{#if cartItems.length === 0}
			<!-- Carrito Vacío -->
			<div class="bg-white rounded-lg shadow-lg p-12 text-center">
				<div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
					</svg>
				</div>
				<h2 class="text-2xl font-semibold text-gray-900 mb-4">Tu carrito está vacío</h2>
				<p class="text-gray-600 mb-8">Agrega algunos productos para comenzar a comprar</p>
				<button
					on:click={continueShopping}
					class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
				>
					Comenzar a Comprar
				</button>
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<!-- Lista de Productos -->
				<div class="lg:col-span-2">
					<div class="bg-white rounded-lg shadow-lg overflow-hidden">
						<div class="p-6 border-b border-gray-200">
							<div class="flex justify-between items-center">
								<h2 class="text-xl font-semibold text-gray-900">Productos ({totalItems})</h2>
								<button
									on:click={clearCart}
									class="text-red-600 hover:text-red-800 text-sm font-medium"
								>
									Vaciar Carrito
								</button>
							</div>
						</div>

						<div class="divide-y divide-gray-200">
							{#each cartItems as item}
								<div class="p-6">
									<div class="flex items-center space-x-4">
										<!-- Imagen -->
										<div class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
											<img
												src={item.image}
												alt={item.name}
												class="w-full h-full object-cover"
											/>
										</div>

										<!-- Información del Producto -->
										<div class="flex-1 min-w-0">
											<h3 class="text-lg font-semibold text-gray-900 mb-1">
												<a href="/producto/{item.id}" class="hover:text-blue-600">
													{item.name}
												</a>
											</h3>
											<div class="text-sm text-gray-600 space-y-1">
												<p>Talla: {item.size}</p>
												<p>Color: {item.color}</p>
												{#if item.originalPrice && item.originalPrice > item.price}
													<p class="text-red-600 font-medium">
														Oferta: ${item.price.toLocaleString('es-AR')} 
														<span class="line-through text-gray-500">
															${item.originalPrice.toLocaleString('es-AR')}
														</span>
													</p>
												{:else}
													<p class="font-medium">${item.price.toLocaleString('es-AR')}</p>
												{/if}
											</div>
										</div>

										<!-- Cantidad -->
										<div class="flex items-center space-x-2">
											<button
												on:click={() => updateQuantity(item.id, item.quantity - 1)}
												class="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
												disabled={item.quantity <= 1}
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
												</svg>
											</button>
											<span class="w-12 text-center font-medium">{item.quantity}</span>
											<button
												on:click={() => updateQuantity(item.id, item.quantity + 1)}
												class="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
												disabled={item.quantity >= item.stock}
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
												</svg>
											</button>
										</div>

										<!-- Precio Total -->
										<div class="text-right">
											<p class="text-lg font-semibold text-gray-900">
												${(item.price * item.quantity).toLocaleString('es-AR')}
											</p>
											{#if item.originalPrice && item.originalPrice > item.price}
												<p class="text-sm text-gray-500 line-through">
													${(item.originalPrice * item.quantity).toLocaleString('es-AR')}
												</p>
											{/if}
										</div>

										<!-- Botón Eliminar -->
										<button
											on:click={() => removeItem(item.id)}
											class="text-red-600 hover:text-red-800 p-2"
										>
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
											</svg>
										</button>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<!-- Resumen del Pedido -->
				<div class="lg:col-span-1">
					<div class="bg-white rounded-lg shadow-lg p-6 sticky top-24">
						<h2 class="text-xl font-semibold text-gray-900 mb-6">Resumen del Pedido</h2>

						<div class="space-y-4">
							<!-- Subtotal -->
							<div class="flex justify-between">
								<span class="text-gray-600">Subtotal ({totalItems} items)</span>
								<span class="font-medium">${subtotal.toLocaleString('es-AR')}</span>
							</div>

							<!-- Descuento -->
							{#if discount > 0}
								<div class="flex justify-between text-green-600">
									<span>Descuento</span>
									<span>-${discount.toLocaleString('es-AR')}</span>
								</div>
							{/if}

							<!-- Envío -->
							<div class="flex justify-between">
								<span class="text-gray-600">Envío</span>
								{#if shipping === 0}
									<span class="text-green-600 font-medium">Gratis</span>
								{:else}
									<span class="font-medium">${shipping.toLocaleString('es-AR')}</span>
								{/if}
							</div>

							<!-- Línea divisoria -->
							<hr class="border-gray-200" />

							<!-- Total -->
							<div class="flex justify-between text-lg font-semibold">
								<span>Total</span>
								<span>${total.toLocaleString('es-AR')}</span>
							</div>

							<!-- Información adicional -->
							<div class="text-sm text-gray-600 space-y-2">
								{#if shipping > 0}
									<p>🆓 Envío gratis en compras superiores a $50.000</p>
								{/if}
								<p>🔒 Pago seguro con Mercado Pago</p>
								<p>📦 Envío a todo Argentina</p>
							</div>
						</div>

						<!-- Botones de Acción -->
						<div class="mt-6 space-y-3">
							<button
								on:click={proceedToCheckout}
								class="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
								disabled={isLoading}
							>
								{isLoading ? 'Procesando...' : 'Proceder al Checkout'}
							</button>
							<button
								on:click={continueShopping}
								class="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
							>
								Seguir Comprando
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div> 