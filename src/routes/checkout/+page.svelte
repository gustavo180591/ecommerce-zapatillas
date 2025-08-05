<script lang="ts">
	import { onMount } from 'svelte';

	let checkoutUrl = '';
	let email = '';
	let dni = '';
	let name = '';
	let surname = '';
	let address = '';
	let isLoading = false;
	let error = '';

	// Producto de ejemplo (en producción vendría del carrito)
	const cartItems = [
		{
			id: 999,
			name: 'Zapatilla Urbana',
			price: 15000,
			quantity: 1,
			image: 'https://example.com/zapatilla.jpg'
		}
	];

	async function createCheckout(event: Event) {
		event.preventDefault();
		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: cartItems,
					payer: { email, dni, name, surname }
				})
			});

			const data = await response.json();
			if (data.error) {
				error = data.error;
			} else {
				checkoutUrl = data.init_point;
				// Redirigir automáticamente a Mercado Pago
				window.location.href = data.init_point;
			}
		} catch (err) {
			error = 'Error al procesar el pago';
			console.error('Error:', err);
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Checkout - Ecommerce Zapatillas</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="container mx-auto px-4 max-w-2xl">
		<div class="bg-white rounded-lg shadow-lg p-6">
			<h1 class="text-3xl font-bold text-gray-900 mb-6">Finalizar Compra</h1>

			<!-- Resumen del carrito -->
			<div class="mb-6 p-4 bg-gray-50 rounded-lg">
				<h2 class="text-lg font-semibold mb-3">Resumen de tu compra</h2>
				{#each cartItems as item}
					<div class="flex justify-between items-center py-2">
						<div>
							<p class="font-medium">{item.name}</p>
							<p class="text-sm text-gray-600">Cantidad: {item.quantity}</p>
						</div>
						<p class="font-semibold">${item.price.toLocaleString('es-AR')}</p>
					</div>
				{/each}
				<hr class="my-3" />
				<div class="flex justify-between items-center font-bold text-lg">
					<span>Total:</span>
					<span>${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('es-AR')}</span>
				</div>
			</div>

			<!-- Formulario de datos personales -->
			<form class="space-y-4" on:submit={createCheckout}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 mb-1">
							Nombre *
						</label>
						<input
							type="text"
							id="name"
							bind:value={name}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							required
						/>
					</div>
					<div>
						<label for="surname" class="block text-sm font-medium text-gray-700 mb-1">
							Apellido *
						</label>
						<input
							type="text"
							id="surname"
							bind:value={surname}
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							required
						/>
					</div>
				</div>

				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-1">
						Email *
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						required
					/>
				</div>

				<div>
					<label for="dni" class="block text-sm font-medium text-gray-700 mb-1">
						DNI *
					</label>
					<input
						type="text"
						id="dni"
						bind:value={dni}
						placeholder="12345678"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						required
					/>
					<p class="text-xs text-gray-500 mt-1">DNI requerido para pagos en Argentina</p>
				</div>

				<div>
					<label for="address" class="block text-sm font-medium text-gray-700 mb-1">
						Dirección de envío
					</label>
					<input
						type="text"
						id="address"
						bind:value={address}
						placeholder="Calle, número, ciudad, provincia"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				{#if error}
					<div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
						{error}
					</div>
				{/if}

				<button
					type="submit"
					class="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					disabled={isLoading}
				>
					{#if isLoading}
						<div class="flex items-center justify-center">
							<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Procesando...
						</div>
					{:else}
						Pagar con Mercado Pago
					{/if}
				</button>
			</form>

			<!-- Información de seguridad -->
			<div class="mt-6 p-4 bg-blue-50 rounded-lg">
				<div class="flex items-start">
					<svg class="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
					</svg>
					<div>
						<h3 class="text-sm font-medium text-blue-900">Pago seguro</h3>
						<p class="text-sm text-blue-700 mt-1">
							Tus datos están protegidos. Utilizamos Mercado Pago, la plataforma de pagos más segura de Argentina.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</div> 