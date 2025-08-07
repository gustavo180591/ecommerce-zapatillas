import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');
  
  if (!signature) {
    return json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      // Add more event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return json({ error: 'Webhook handler failed' }, { status: 500 });
  }
};

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  
  if (!orderId) {
    console.error('No order ID in payment intent metadata');
    return;
  }

  await prisma.$transaction([
    // Update payment status
    prisma.payment.updateMany({
      where: { providerId: paymentIntent.id },
      data: {
        status: 'SUCCEEDED',
        paidAt: new Date(),
        metadata: paymentIntent as any,
      },
    }),
    
    // Update order status
    prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status: 'PROCESSING',
        paidAt: new Date(),
      },
    }),
  ]);
  
  // TODO: Send order confirmation email
  // TODO: Update inventory
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  
  if (!orderId) return;

  await prisma.$transaction([
    // Update payment status
    prisma.payment.updateMany({
      where: { providerId: paymentIntent.id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        metadata: paymentIntent as any,
      },
    }),
    
    // Update order status
    prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: 'FAILED' },
    }),
  ]);
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === 'string' 
    ? charge.payment_intent 
    : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  await prisma.payment.updateMany({
    where: { providerId: paymentIntentId },
    data: {
      status: charge.refunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      metadata: charge as any,
    },
  });
  
  // If this was a full refund, update the order status
  if (charge.refunded) {
    await prisma.order.update({
      where: { payment: { providerId: paymentIntentId } },
      data: { status: 'REFUNDED' },
    });
  }
}
