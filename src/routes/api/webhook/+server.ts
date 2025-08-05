import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import type { RequestEvent } from '@sveltejs/kit';

// @ts-ignore - Ignorar errores de tipos para Mercado Pago
const mercadopago = require('mercadopago');

export async function POST({ request }: RequestEvent) {
	try {
		const { type, data } = await request.json();

		console.log('Webhook recibido:', { type, data });

		if (type === 'payment') {
			const paymentId = data.id;
			
			// Consultar el estado del pago
			// @ts-ignore - Ignorar errores de tipos para Mercado Pago
			const payment = await mercadopago.payment.findById(paymentId);
			const status = payment.body.status; // Ej. "approved", "pending", "rejected"

			console.log('Estado del pago:', status);

			// Actualizar el pedido en la base de datos
			await prisma.order.updateMany({
				where: { paymentId: paymentId.toString() },
				data: { status }
			});

			console.log('Orden actualizada con estado:', status);
		}

		return json({ status: 'received' }, { status: 200 });
	} catch (error) {
		console.error('Error en webhook:', error);
		return json({ error: 'Webhook error' }, { status: 500 });
	}
} 