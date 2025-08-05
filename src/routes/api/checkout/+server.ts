import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';

// Configurar Mercado Pago
// @ts-ignore - Ignorar errores de tipos para Mercado Pago
const mercadopago = require('mercadopago');
mercadopago.configure({
	access_token: env.MERCADO_PAGO_ACCESS_TOKEN || 'TEST-TU_ACCESS_TOKEN'
});

export async function POST({ request }: RequestEvent) {
	try {
		const { items, payer } = await request.json();

		// Validar datos requeridos
		if (!items || !Array.isArray(items) || items.length === 0) {
			return json({ error: 'Items requeridos' }, { status: 400 });
		}

		if (!payer || !payer.email || !payer.dni) {
			return json({ error: 'Datos del pagador requeridos (email y DNI)' }, { status: 400 });
		}

		// Crear preferencia de pago
		const preference = {
			items: items.map((item) => ({
				title: item.name,
				unit_price: Number(item.price), // En ARS
				quantity: Number(item.quantity),
				currency_id: 'ARS', // Moneda en pesos argentinos
				picture_url: item.image || undefined
			})),
			payer: {
				email: payer.email,
				identification: {
					type: 'DNI', // Requerido en Argentina
					number: payer.dni
				},
				name: payer.name || undefined,
				surname: payer.surname || undefined
			},
			back_urls: {
				success: 'http://localhost:3000/success',
				failure: 'http://localhost:3000/failure',
				pending: 'http://localhost:3000/pending'
			},
			auto_return: 'approved',
			notification_url: 'http://localhost:3000/api/webhook', // Para notificaciones de pago
			external_reference: `order_${Date.now()}`, // Referencia única para la orden
			expires: true,
			expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Expira en 24 horas
		};

		console.log('Creando preferencia de pago:', preference);

		// @ts-ignore - Ignorar errores de tipos para Mercado Pago
		const response = await mercadopago.preferences.create(preference);

		// Crear orden en la base de datos
		const order = await prisma.order.create({
			data: {
				userId: 1, // Usuario por defecto para pruebas
				products: items,
				total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
				status: 'pending',
				paymentId: response.body.id
			}
		});

		console.log('Orden creada:', order);

		return json(
			{
				id: response.body.id,
				init_point: response.body.init_point, // URL para redirigir al cliente
				orderId: order.id
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error creating preference:', error);
		return json({ error: 'Error creating preference' }, { status: 500 });
	}
} 