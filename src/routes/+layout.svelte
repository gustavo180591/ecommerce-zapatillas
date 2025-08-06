<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import CartDrawer from '$lib/components/CartDrawer.svelte';
	import CartButton from '$lib/components/CartButton.svelte';
	import { cart, cartItemCount } from '$lib/stores/cart';

	let isMenuOpen = false;
	let isCartOpen = false;

	onMount(() => {
		// Cargar carrito desde localStorage al montar
		try {
			const savedCart = localStorage.getItem('ecommerce_cart');
			if (savedCart) {
				const parsedCart = JSON.parse(savedCart);
				cart.set(parsedCart);
			}
		} catch (error) {
			console.error('Error loading cart from localStorage:', error);
		}

		// Sincronizar con el servidor si el usuario está autenticado
		// TODO: Implementar sincronización con el backend
	});

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function toggleCart() {
		isCartOpen = !isCartOpen;
		// Cerrar el menú móvil si está abierto
		if (isMenuOpen) {
			isMenuOpen = false;
		}
	}
</script>

<svelte:head>
	<title>Ecommerce Zapatillas - Las mejores zapatillas de Argentina</title>
	<meta name="description" content="Encuentra las mejores zapatillas con envío a todo Argentina. Pago seguro con Mercado Pago." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div class="min-h-screen flex flex-col">
	<!-- Header -->
	<header class="bg-white shadow-sm sticky top-0 z-50">
		<div class="container mx-auto px-4">
			<div class="flex justify-between items-center py-4">
				<!-- Logo -->
				<a href="/" class="flex items-center space-x-2">
					<div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
						<span class="text-white font-bold text-lg">Z</span>
					</div>
					<span class="text-xl font-bold text-gray-900">Zapatillas</span>
				</a>

				<!-- Desktop Navigation -->
				<nav class="hidden md:flex items-center space-x-8">
					<a href="/" class="text-gray-600 hover:text-gray-900 transition-colors">Inicio</a>
					<a href="/productos" class="text-gray-600 hover:text-gray-900 transition-colors">Productos</a>
					<a href="/categorias" class="text-gray-600 hover:text-gray-900 transition-colors">Categorías</a>
					<a href="/ofertas" class="text-gray-600 hover:text-gray-900 transition-colors">Ofertas</a>
					<a href="/contacto" class="text-gray-600 hover:text-gray-900 transition-colors">Contacto</a>
				</nav>

				<!-- Desktop Actions -->
				<div class="hidden md:flex items-center space-x-4">
					<!-- Search -->
					<button class="p-2 text-gray-600 hover:text-gray-900 transition-colors">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</button>

					<!-- User -->
					<button class="p-2 text-gray-600 hover:text-gray-900 transition-colors">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</button>

					<!-- Cart Button -->
					<CartButton on:click={toggleCart} itemCount={$cartItemCount} />
				</div>

				<!-- Mobile menu button -->
				<button
					on:click={toggleMenu}
					class="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>

			<!-- Mobile Navigation -->
			{#if isMenuOpen}
				<div class="md:hidden py-4 border-t border-gray-200">
					<nav class="flex flex-col space-y-4">
						<a href="/" class="text-gray-600 hover:text-gray-900 transition-colors">Inicio</a>
						<a href="/productos" class="text-gray-600 hover:text-gray-900 transition-colors">Productos</a>
						<a href="/categorias" class="text-gray-600 hover:text-gray-900 transition-colors">Categorías</a>
						<a href="/ofertas" class="text-gray-600 hover:text-gray-900 transition-colors">Ofertas</a>
						<a href="/contacto" class="text-gray-600 hover:text-gray-900 transition-colors">Contacto</a>
						<div class="flex items-center space-x-4 pt-4">
							<button class="p-2 text-gray-600 hover:text-gray-900 transition-colors">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
							</button>
							<button class="p-2 text-gray-600 hover:text-gray-900 transition-colors">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</button>
							<a href="/carrito" class="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
								</svg>
								{#if cartItemCount > 0}
									<span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
										{cartItemCount}
									</span>
								{/if}
							</a>
						</div>
					</nav>
				</div>
			{/if}
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1">
		<slot />
		</main>

	<!-- Cart Drawer -->
	<CartDrawer bind:isOpen={isCartOpen} />

	<!-- Footer -->
	<footer class="bg-gray-800 text-white">
		<div class="container mx-auto px-4 py-12">
			<div class="grid grid-cols-1 md:grid-cols-4 gap-8">
				<!-- Company Info -->
				<div class="col-span-1 md:col-span-2">
					<div class="flex items-center space-x-2 mb-4">
						<div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<span class="text-white font-bold text-lg">Z</span>
						</div>
						<span class="text-xl font-bold">Zapatillas</span>
					</div>
					<p class="text-gray-300 mb-4">
						Las mejores zapatillas con envío a todo Argentina. Calidad, comodidad y estilo en cada paso.
					</p>
					<div class="flex space-x-4">
						<a href="#" class="text-gray-300 hover:text-white transition-colors">
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
							</svg>
						</a>
						<a href="#" class="text-gray-300 hover:text-white transition-colors">
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
							</svg>
						</a>
						<a href="#" class="text-gray-300 hover:text-white transition-colors">
							<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
							</svg>
						</a>
					</div>
				</div>

				<!-- Quick Links -->
				<div>
					<h3 class="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
					<ul class="space-y-2">
						<li><a href="/" class="text-gray-300 hover:text-white transition-colors">Inicio</a></li>
						<li><a href="/productos" class="text-gray-300 hover:text-white transition-colors">Productos</a></li>
						<li><a href="/categorias" class="text-gray-300 hover:text-white transition-colors">Categorías</a></li>
						<li><a href="/ofertas" class="text-gray-300 hover:text-white transition-colors">Ofertas</a></li>
						<li><a href="/checkout" class="text-gray-300 hover:text-white transition-colors">Checkout</a></li>
					</ul>
				</div>

				<!-- Contact -->
				<div>
					<h3 class="text-lg font-semibold mb-4">Contacto</h3>
					<div class="space-y-2 text-gray-300">
						<p>📧 soporte@ecommerce-zapatillas.com</p>
						<p>📞 +54 11 1234-5678</p>
						<p>📍 Buenos Aires, Argentina</p>
					</div>
				</div>
			</div>

			<!-- Bottom Footer -->
			<div class="border-t border-gray-700 mt-8 pt-8">
				<div class="flex flex-col md:flex-row justify-between items-center">
					<p class="text-gray-300 text-sm">
						&copy; 2024 Ecommerce Zapatillas. Todos los derechos reservados.
					</p>
					<div class="flex space-x-6 mt-4 md:mt-0">
						<a href="/terminos" class="text-gray-300 hover:text-white text-sm transition-colors">Términos</a>
						<a href="/privacidad" class="text-gray-300 hover:text-white text-sm transition-colors">Privacidad</a>
						<a href="/envios" class="text-gray-300 hover:text-white text-sm transition-colors">Envíos</a>
						<a href="/devoluciones" class="text-gray-300 hover:text-white text-sm transition-colors">Devoluciones</a>
					</div>
				</div>
			</div>
		</div>
	</footer>
</div>
