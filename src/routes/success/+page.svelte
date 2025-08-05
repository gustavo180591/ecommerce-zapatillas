<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

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
	<title>Pago Exitoso - Ecommerce Zapatillas</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-8">
	<div class="container mx-auto px-4 max-w-md">
		<div class="bg-white rounded-lg shadow-lg p-8 text-center">
			<!-- Ícono de éxito -->
			<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
				<svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
				</svg>
			</div>

			<h1 class="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h1>
			<p class="text-gray-600 mb-6">
				Gracias por tu compra. Tu pago ha sido procesado correctamente.
			</p>

			<!-- Detalles del pago -->
			{#if orderId || paymentId}
				<div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
					<h3 class="font-semibold text-gray-900 mb-2">Detalles del pago:</h3>
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

			<!-- Información adicional -->
			<div class="bg-blue-50 rounded-lg p-4 mb-6">
				<h3 class="font-semibold text-blue-900 mb-2">Próximos pasos:</h3>
				<ul class="text-sm text-blue-800 space-y-1">
					<li>• Recibirás un email con la confirmación</li>
					<li>• Procesaremos tu pedido en 24-48 horas</li>
					<li>• Te enviaremos el número de seguimiento</li>
				</ul>
			</div>

			<!-- Botones de acción -->
			<div class="space-y-3">
				<a
					href="/"
					class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors inline-block"
				>
					Volver al inicio
				</a>
				<a
					href="/checkout"
					class="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md font-medium hover:bg-gray-300 transition-colors inline-block"
				>
					Hacer otra compra
				</a>
			</div>

			<!-- Información de contacto -->
			<div class="mt-6 pt-6 border-t border-gray-200">
				<p class="text-xs text-gray-500">
					¿Tienes alguna pregunta? Contáctanos en{' '}
					<a href="mailto:soporte@ecommerce-zapatillas.com" class="text-blue-600 hover:underline">
						soporte@ecommerce-zapatillas.com
					</a>
				</p>
			</div>
		</div>
	</div>
</div> 