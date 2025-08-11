// src/lib/payments.ts
/**
 * Integración básica con Mercado Pago:
 * - createPreference: genera preferencia de pago para una Order
 * - handleWebhook: placeholder para procesar notificaciones
 *
 * Requiere: MP_ACCESS_TOKEN en .env
 */
import { prisma } from './db';
import MercadoPago, { PreferenceCreateRequest } from 'mercadopago';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
if (!MP_ACCESS_TOKEN) {
  console.warn('[payments] MP_ACCESS_TOKEN vacío: configura tu .env');
}
const mpClient = new MercadoPago({
  accessToken: MP_ACCESS_TOKEN,
});

export async function createPreferenceForOrder(orderId: string, returnUrlBase: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { variant: { include: { product: true } } },
      },
    },
  });
  if (!order) throw new Error('Orden no encontrada');
  if (!order.items.length) throw new Error('La orden no tiene ítems');

  const items: PreferenceCreateRequest['items'] = order.items.map((it) => {
    const title =
      `${it.variant.product.name}` +
      (it.variant.size ? ` Talle ${it.variant.size}` : '') +
      (it.variant.color ? ` Color ${it.variant.color}` : '');
    return {
      title,
      quantity: it.quantity,
      unit_price: Number(it.unitPrice),
      currency_id: order.currency, // "ARS"
    };
  });

  const pref: PreferenceCreateRequest = {
    items,
    back_urls: {
      success: `${returnUrlBase}/checkout/success?order=${order.id}`,
      pending: `${returnUrlBase}/checkout/success?order=${order.id}&state=pending`,
      failure: `${returnUrlBase}/checkout/success?order=${order.id}&state=failure`,
    },
    auto_return: 'approved',
    notification_url: `${returnUrlBase}/api/pagos/webhook`,
    statement_descriptor: 'E-COM ZAPAS',
    external_reference: order.id,
  };

  const res = await mpClient.preference.create({ body: pref });
  // Guardar id de preferencia por si lo querés consultar
  await prisma.order.update({
    where: { id: order.id },
    data: { mpPrefId: res?.id || res?.body?.id || null },
  });

  // Links principales
  const initPoint =
    (res as any)?.body?.init_point || (res as any)?.init_point || (res as any)?.sandbox_init_point;

  return {
    id: res?.body?.id ?? res?.id,
    initPoint,
    raw: res?.body ?? res,
  };
}

/**
 * Webhook básico (depende de cómo configures tu endpoint)
 * - Debes validar el pago consultando a MP por payment_id.
 * - Luego actualizar el estado de la orden a PAID/SHIPPED, etc.
 */
export async function handleWebhook(payload: any) {
  // Ejemplo muy simplificado:
  // payload.type === 'payment', payload.data.id === payment_id
  // Consultar payment:
  // const payment = await mpClient.payment.get({ id: payload.data.id });
  // Verificar status === 'approved'
  // const orderId = payment.body.external_reference
  // await prisma.order.update({ where: { id: orderId }, data: { status: 'PAID' } });

  console.log('[webhook] recibido', payload);
  return { ok: true };
}
