import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { createMercadoPagoClient } from '$lib/utils/mercadopago';
import { STRIPE_SECRET_KEY, MERCADOPAGO_ACCESS_TOKEN } from '$env/static/private';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Initialize MercadoPago
const mp = createMercadoPagoClient(MERCADOPAGO_ACCESS_TOKEN);

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.email) {
    return json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const { cartId, paymentMethod } = await request.json();
    
    // Validate payment method
    if (!['stripe', 'mercadopago'].includes(paymentMethod)) {
      return json({ error: 'Método de pago no soportado' }, { status: 400 });
    }

    // Get user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return json({ error: 'Carrito vacío o no encontrado' }, { status: 400 });
    }

    // Calculate total
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const tax = subtotal * 0.21; // 21% IVA
    const shippingCost = 1500; // Fixed shipping cost for now
    const total = subtotal + tax + shippingCost;

    // Create order in database with DRAFT status
    const order = await prisma.order.create({
      data: {
        user: { connect: { email: session.user.email } },
        status: 'DRAFT',
        subtotal,
        tax,
        shippingCost,
        total,
        contactInfo: {
          email: session.user.email,
          name: session.user.name || '',
        },
        items: {
          create: cart.items.map((item) => ({
            product: { connect: { id: item.productId } },
            quantity: item.quantity,
            price: item.product.price,
            size: item.size,
            color: item.color,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Process payment based on selected method
    if (paymentMethod === 'stripe') {
      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Convert to cents
        currency: 'usd', // or 'ars' for Argentine Peso
        metadata: { orderId: order.id },
      });

      // Update order with payment info
      await prisma.payment.create({
        data: {
          order: { connect: { id: order.id } },
          amount: total,
          currency: 'usd',
          status: 'REQUIRES_ACTION',
          paymentMethod: 'card',
          paymentProvider: 'stripe',
          providerId: paymentIntent.id,
        },
      });

      return json({
        clientSecret: paymentIntent.client_secret,
        orderId: order.id,
        paymentMethod: 'stripe',
      });
    } else if (paymentMethod === 'mercadopago') {
      // Create MercadoPago preference
      const preference = await mp.createPreference({
        items: cart.items.map((item) => ({
          id: item.product.id.toString(),
          title: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.price,
          description: `Talle: ${item.size}, Color: ${item.color}`,
          currency_id: 'ARS', // or 'USD' if needed
        })),
        back_urls: {
          success: `${new URL(request.url).origin}/order/${order.id}/success`,
          failure: `${new URL(request.url).origin}/order/${order.id}/failure`,
          pending: `${new URL(request.url).origin}/order/${order.id}/pending`,
        },
        auto_return: 'approved',
        external_reference: order.id.toString(),
        notification_url: `${new URL(request.url).origin}/api/payments/webhook/mercadopago`,
      });

      // Update order with payment info
      await prisma.payment.create({
        data: {
          order: { connect: { id: order.id } },
          amount: total,
          currency: 'ARS',
          status: 'REQUIRES_ACTION',
          paymentMethod: 'card',
          paymentProvider: 'mercadopago',
          providerId: preference.id,
          metadata: {
            init_point: preference.init_point,
            sandbox_init_point: preference.sandbox_init_point,
          },
        },
      });

      return json({
        initPoint: preference.init_point || preference.sandbox_init_point,
        orderId: order.id,
        paymentMethod: 'mercadopago',
      });
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    return json(
      { error: 'Error al procesar el pago', details: error.message },
      { status: 500 }
    );
  }
};
