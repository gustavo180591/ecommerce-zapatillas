import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/db';
// import MercadoPago from 'mercadopago'; // si luego consultás el payment real

export const POST: RequestHandler = async ({ request }) => {
  try {
    const payload = await request.json();

    // Ejemplos de payload de MP:
    // { action: 'payment.created', data: { id: '123' }, ... }
    if (payload?.type === 'payment' || payload?.action?.startsWith('payment')) {
      const paymentId = String(payload?.data?.id ?? '');

      // TODO: consultar a MP el pago:
      // const mp = new MercadoPago({ accessToken: process.env.MP_ACCESS_TOKEN! });
      // const payment = await mp.payment.get({ id: paymentId });
      // const status = payment.body.status; // 'approved', etc.
      // const orderId = payment.body.external_reference;

      // Por ahora, inferimos usando external_reference si viene:
      const orderId = payload?.data?.id /* placeholder */;

      if (orderId) {
        // Marca como pagado (placeholder) — en real, chequea status === 'approved'
        await prisma.order.updateMany({
          where: { id: String(orderId) },
          data: { status: 'PAID' }
        });
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Webhook MP error:', err);
    return new Response('error', { status: 500 });
  }
};

// MP reintenta sobre GET a veces
export const GET: RequestHandler = async () => {
  return new Response('ok', { status: 200 });
};
