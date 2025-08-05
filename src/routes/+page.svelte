<script lang="ts">
	import { onMount } from 'svelte';

	let products = [
		{
			id: 999,
			name: 'Zapatilla Urbana',
			price: 15000,
			image: 'https://example.com/zapatilla.jpg',
			description: 'Zapatilla urbana cómoda y elegante para uso diario'
		}
	];
</script>

<svelte:head>
	<title>Ecommerce Zapatillas - Inicio</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<header class="bg-white shadow-sm">
		<div class="container mx-auto px-4 py-4">
			<div class="flex justify-between items-center">
				<h1 class="text-2xl font-bold text-gray-900">Ecommerce Zapatillas</h1>
				<nav class="space-x-4">
					<a href="/" class="text-gray-600 hover:text-gray-900">Inicio</a>
					<a href="/checkout" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
						Ir al Checkout
					</a>
				</nav>
			</div>
		</div>
	</header>

	<!-- Hero Section -->
	<div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
		<div class="container mx-auto px-4 text-center">
			<h2 class="text-4xl font-bold mb-4">Las mejores zapatillas de Argentina</h2>
			<p class="text-xl mb-8">Calidad, comodidad y estilo en cada paso</p>
			<a
				href="/checkout"
				class="bg-white text-blue-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors inline-block"
			>
				Comprar Ahora
			</a>
		</div>
	</div>

	<!-- Productos -->
	<div class="container mx-auto px-4 py-12">
		<h3 class="text-3xl font-bold text-gray-900 mb-8 text-center">Nuestros Productos</h3>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each products as product}
				<div class="bg-white rounded-lg shadow-md overflow-hidden">
					<div class="h-48 bg-gray-200 flex items-center justify-center">
						<span class="text-gray-500">Imagen del producto</span>
					</div>
					<div class="p-6">
						<h4 class="text-xl font-semibold text-gray-900 mb-2">{product.name}</h4>
						<p class="text-gray-600 mb-4">{product.description}</p>
						<div class="flex justify-between items-center">
							<span class="text-2xl font-bold text-blue-600">
								${product.price.toLocaleString('es-AR')}
							</span>
							<a
								href="/checkout"
								class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
							>
								Comprar
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Información de Mercado Pago -->
	<div class="bg-gray-100 py-12">
		<div class="container mx-auto px-4">
			<div class="text-center">
				<h3 class="text-2xl font-bold text-gray-900 mb-4">Pago Seguro con Mercado Pago</h3>
				<p class="text-gray-600 mb-6">
					Aceptamos todos los métodos de pago disponibles en Argentina
				</p>
				<div class="flex justify-center space-x-4 text-sm text-gray-500">
					<span>💳 Tarjetas de crédito y débito</span>
					<span>🏦 Transferencias bancarias</span>
					<span>💵 Efectivo (Rapipago, Pago Fácil)</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<footer class="bg-gray-800 text-white py-8">
		<div class="container mx-auto px-4">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div>
					<h4 class="text-lg font-semibold mb-4">Ecommerce Zapatillas</h4>
					<p class="text-gray-300">
						Las mejores zapatillas con envío a todo Argentina.
					</p>
				</div>
				<div>
					<h4 class="text-lg font-semibold mb-4">Contacto</h4>
					<p class="text-gray-300">📧 soporte@ecommerce-zapatillas.com</p>
					<p class="text-gray-300">📞 +54 11 1234-5678</p>
				</div>
				<div>
					<h4 class="text-lg font-semibold mb-4">Enlaces</h4>
					<div class="space-y-2">
						<a href="/checkout" class="block text-gray-300 hover:text-white">Checkout</a>
						<a href="/success" class="block text-gray-300 hover:text-white">Pago Exitoso</a>
						<a href="/failure" class="block text-gray-300 hover:text-white">Error en Pago</a>
					</div>
				</div>
			</div>
			<div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
				<p>&copy; 2024 Ecommerce Zapatillas. Todos los derechos reservados.</p>
			</div>
		</div>
	</footer>
</div>
