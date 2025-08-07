import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { createMercadoPagoClient } from '$lib/utils/mercadopago';
import { MERCADOPAGO_ACCESS_TOKEN } from '$env/static/private';

// Initialize MercadoPago
const mp = createMercadoPagoClient(MERCADOPAGO_ACCESS_TOKEN);

// Helper to verify webhook signature
function verifyWebhookSignature(signature: string, payload: any, secret: string): boolean {
  // Implementation depends on MercadoPago's webhook signature verification
  // This is a placeholder - you'll need to implement actual verification
  return true; // For development only
}

export const POST: RequestHandler = async ({ request, url }) => {
  try {
    // Get the signature from headers
    const signature = request.headers.get('x-signature') || '';
    const payload = await request.json();

    // Verify the webhook signature (in production)
    if (process.env.NODE_ENV === 'production') {
      const isValid = verifyWebhookSignature(
        signature,
        payload,
        MERCADOPAGO_ACCESS_TOKEN
      );
      
      if (!isValid) {
        console.error('Invalid webhook signature');
        return json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Handle different types of notifications
    const { type, data } = payload;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Get payment details from MercadoPago
      const payment = await mp.getPayment(paymentId);
      
      // Find the order using external_reference
      const orderId = parseInt(payment.external_reference);
      if (!orderId) {
        throw new Error('No order ID found in payment data');
      }

      // Update order and payment status
      await prisma.$transaction(async (tx) => {
        // Update payment status
        await tx.payment.updateMany({
          where: { providerId: paymentId },
          data: {
            status: mapMercadoPagoStatus(payment.status),
            metadata: payment,
            ...(payment.status === 'approved' && { paidAt: new Date() }),
            ...(payment.status === 'rejected' && { failedAt: new Date() }),
          },
        });

        // Update order status based on payment status
        if (payment.status === 'approved') {
          await tx.order.update({
            where: { id: orderId },
            data: {
              status: 'PROCESSING',
              paidAt: new Date(),
            },
          });
          
          // TODO: Send order confirmation email
          // TODO: Update inventory
        } else if (payment.status === 'rejected') {
          await tx.order.update({
            where: { id: orderId },
            data: { status: 'FAILED' },
          });
        }
      });
    }

    return json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return json(
      { error: 'Error processing webhook', details: error.message },
      { status: 500 }
    );
  }
};

// Map MercadoPago status to our PaymentStatus enum
function mapMercadoPagoStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: 'PROCESSING',
    approved: 'SUCCEEDED',
    authorized: 'REQUIRES_CAPTURE',
    in_process: 'PROCESSING',
    in_mediation: 'REQUIRES_ACTION',
    rejected: 'FAILED',
    cancelled: 'CANCELED',
    refunded: 'REFUNDED',    
    charged_back: 'DISPUTED',
  };

  return statusMap[status] || 'REQUIRES_ACTION';
}
