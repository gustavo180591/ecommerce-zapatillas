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
	<title>Pago Pendiente - Ecommerce Zapatillas</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center py-8">
	<div class="container mx-auto px-4 max-w-md">
		<div class="bg-white rounded-lg shadow-lg p-8 text-center">
			<!-- Ícono de pendiente -->
			<div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
				<svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>

			<h1 class="text-2xl font-bold text-gray-900 mb-2">Pago Pendiente</h1>
			<p class="text-gray-600 mb-6">
				Tu pago está siendo procesado. Te notificaremos cuando se confirme.
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

			<!-- Información sobre pagos pendientes -->
			<div class="bg-blue-50 rounded-lg p-4 mb-6">
				<h3 class="font-semibold text-blue-900 mb-2">¿Por qué está pendiente?</h3>
				<ul class="text-sm text-blue-800 space-y-1">
					<li>• Transferencia bancaria en proceso</li>
					<li>• Pago en efectivo pendiente de confirmación</li>
					<li>• Verificación de datos requerida</li>
					<li>• Procesamiento del banco emisor</li>
				</ul>
			</div>

			<!-- Tiempo estimado -->
			<div class="bg-green-50 rounded-lg p-4 mb-6">
				<h3 class="font-semibold text-green-900 mb-2">Tiempo estimado:</h3>
				<p class="text-sm text-green-800">
					La confirmación puede tardar entre 1-3 días hábiles, dependiendo del método de pago utilizado.
				</p>
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
				<p class="text-xs text-gray-500 mb-2">
					¿Tienes alguna pregunta sobre tu pago?
				</p>
				<p class="text-xs text-gray-500">
					📧 <a href="mailto:soporte@ecommerce-zapatillas.com" class="text-blue-600 hover:underline">
						soporte@ecommerce-zapatillas.com
					</a>
				</p>
			</div>
		</div>
	</div>
</div> 