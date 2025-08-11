import type { RequestHandler } from '@sveltejs/kit';
import { AddToCartSchema, UpdateCartItemSchema } from '$lib/zod-schemas';
import { addItemToUserCart, updateItemQtyInUserCart, cartTotalsFromCookie, parseCookieCart, newCookieCart, addToCookieCart, updateCookieCart, serializeCookieCart } from '$lib/cart';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
  try {
    const { action, payload } = await request.json() as {
      action: 'add' | 'update' | 'remove' | 'totals';
      payload?: any;
    };

    const isLogged = !!locals.user?.id;

    if (action === 'add') {
      const data = AddToCartSchema.parse(payload);
      if (isLogged) {
        const order = await addItemToUserCart(locals.user!.id, data.variantId, data.qty ?? 1);
        return new Response(JSON.stringify({ order }), { status: 200 });
      } else {
        // Cookie cart
        const current = parseCookieCart(cookies.get('cart')) ?? newCookieCart();
        const updated = addToCookieCart(current, data.variantId, data.qty ?? 1);
        cookies.set('cart', serializeCookieCart(updated), { path: '/', httpOnly: true, sameSite: 'lax' });
        const totals = await cartTotalsFromCookie(updated);
        return new Response(JSON.stringify({ cart: updated, totals }), { status: 200 });
      }
    }

    if (action === 'update' || action === 'remove') {
      const data = UpdateCartItemSchema.parse(payload);
      const qty = action === 'remove' ? 0 : data.qty;

      if (isLogged) {
        const order = await updateItemQtyInUserCart(locals.user!.id, data.variantId, qty);
        return new Response(JSON.stringify({ order }), { status: 200 });
      } else {
        const current = parseCookieCart(cookies.get('cart')) ?? newCookieCart();
        const updated = updateCookieCart(current, data.variantId, qty);
        cookies.set('cart', serializeCookieCart(updated), { path: '/', httpOnly: true, sameSite: 'lax' });
        const totals = await cartTotalsFromCookie(updated);
        return new Response(JSON.stringify({ cart: updated, totals }), { status: 200 });
      }
    }

    if (action === 'totals') {
      if (isLogged) {
        // podrías recomputar totales buscando la order PENDING
        return new Response(JSON.stringify({ note: 'Implementar totales para usuario logueado' }), { status: 200 });
      } else {
        const current = parseCookieCart(cookies.get('cart')) ?? newCookieCart();
        const totals = await cartTotalsFromCookie(current);
        return new Response(JSON.stringify({ cart: current, totals }), { status: 200 });
      }
    }

    return new Response(JSON.stringify({ error: 'Acción no soportada' }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'Error carrito' }), { status: 400 });
  }
};
