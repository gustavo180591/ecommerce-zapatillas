import type { RequestHandler } from '@sveltejs/kit';
import { CheckoutSchema } from '$lib/zod-schemas';
import { prisma } from '$lib/db';
import { getOrCreateUserCart, cartTotalsFromCookie, parseCookieCart } from '$lib/cart';
import { createPreferenceForOrder } from '$lib/payments';

export const POST: RequestHandler = async ({ request, locals, url, cookies }) => {
  try {
    const body = await request.json();
    const data = CheckoutSchema.parse(body);

    let orderId: string;

    if (locals.user?.id) {
      const order = await getOrCreateUserCart(locals.user.id);
      // Actualizar dirección si querés persistirla
      // Crear Address si no existe y asociar a user...
      orderId = order.id;
    } else {
      // Anónimo — convertir carrito cookie en Order (simple)
      const cart = parseCookieCart(cookies.get('cart'));
      if (!cart) throw new Error('Carrito vacío');

      // Crear orden con items a partir del cookie cart
      const totals = await cartTotalsFromCookie(cart);
      const order = await prisma.order.create({
        data: {
          status: 'PENDING',
          total: totals.total,
          currency: 'ARS',
          items: {
            create: totals.items.map((it) => ({
              variantId: it.variant.id,
              quantity: it.qty,
              unitPrice: it.unitPrice
            }))
          }
        },
        include: { items: true }
      });
      orderId = order.id;
    }

    const base = `${url.protocol}//${url.host}`;
    const pref = await createPreferenceForOrder(orderId, base);

    return new Response(JSON.stringify({ orderId, preference: pref }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'Error en checkout' }), { status: 400 });
  }
};
