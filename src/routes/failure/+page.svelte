<script lang="ts">
	import { onMount } from 'svelte';

	let orderId = '';
	let paymentId = '';

	onMount(() => {
		// Obtener parámetros de la URL
		const urlParams = new URLSearchParams(window.location.search);
		orderId = urlParams.get('external_reference') || '';
		paymentId = urlParams.get('payment_id') || '';
	});
</script>

<svelte:head>
	<title>Error en el Pago - Ecommerce Zapatillas</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-8">
	<div class="container mx-auto px-4 max-w-md">
		<div class="bg-white rounded-lg shadow-lg p-8 text-center">
			<!-- Ícono de error -->
			<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
				<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</div>

			<h1 class="text-2xl font-bold text-gray-900 mb-2">Error en el Pago</h1>
			<p class="text-gray-600 mb-6">
				Hubo un problema con tu pago. Por favor, intenta de nuevo o contacta con soporte.
			</p>

			<!-- Detalles del error -->
			{#if orderId || paymentId}
				<div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
					<h3 class="font-semibold text-gray-900 mb-2">Detalles del intento:</h3>
					{#if orderId}
						<p class="text-sm text-gray-600">
							<strong>Orden:</strong> {orderId}
						</p>
					{/if}
					{#if paymentId}
						<p class="text-sm text-gray-600">
							<strong>ID de Pago:</strong> {paymentId}
						</p>
					{/if}
				</div>
			{/if}

			<!-- Posibles causas -->
			<div class="bg-yellow-50 rounded-lg p-4 mb-6">
				<h3 class="font-semibold text-yellow-900 mb-2">Posibles causas:</h3>
				<ul class="text-sm text-yellow-800 space-y-1">
					<li>• Fondos insuficientes en la cuenta</li>
					<li>• Tarjeta bloqueada o vencida</li>
					<li>• Datos incorrectos ingresados</li>
					<li>• Problema temporal del sistema</li>
				</ul>
			</div>

			<!-- Botones de acción -->
			<div class="space-y-3">
				<a
					href="/checkout"
					class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors inline-block"
				>
					Intentar de nuevo
				</a>
				<a
					href="/"
					class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-300 transition-colors inline-block"
				>
					Volver al inicio
				</a>
			</div>

			<!-- Información de contacto -->
			<div class="mt-6 pt-6 border-t border-gray-200">
				<p class="text-xs text-gray-500 mb-2">
					¿Necesitas ayuda? Contáctanos:
				</p>
				<div class="space-y-1">
					<p class="text-xs text-gray-500">
						📧 <a href="mailto:soporte@ecommerce-zapatillas.com" class="text-blue-600 hover:underline">
							soporte@ecommerce-zapatillas.com
						</a>
					</p>
					<p class="text-xs text-gray-500">
						📞 +54 11 1234-5678
					</p>
				</div>
			</div>
		</div>
	</div>
</div> 