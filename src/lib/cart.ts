// src/lib/cart.ts
/**
 * Cart utilities:
 * - Soporta carrito en cookie (anónimo) y en DB para usuario logueado.
 * - Calcula precios usando Product.price + Variant.priceDiff (si existe).
 *
 * NOTA: Para carrito 100% en DB con anónimos, conviene agregar
 * `sessionId` a Order o crear tablas Cart/CartItem.
 */
import { prisma } from './db';
import type { Order, OrderItem, Variant, Product } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export type CookieCartItem = { variantId: string; qty: number };
export type CookieCart = { id: string; items: CookieCartItem[] };

export function newCookieCart(): CookieCart {
  return { id: uuidv4(), items: [] };
}

export function addToCookieCart(cart: CookieCart, variantId: string, qty = 1): CookieCart {
  const idx = cart.items.findIndex((i) => i.variantId === variantId);
  if (idx === -1) cart.items.push({ variantId, qty });
  else cart.items[idx].qty = Math.min(cart.items[idx].qty + qty, 20);
  return cart;
}

export function updateCookieCart(cart: CookieCart, variantId: string, qty: number): CookieCart {
  if (qty <= 0) {
    cart.items = cart.items.filter((i) => i.variantId !== variantId);
  } else {
    const idx = cart.items.findIndex((i) => i.variantId === variantId);
    if (idx === -1) cart.items.push({ variantId, qty });
    else cart.items[idx].qty = Math.min(qty, 20);
  }
  return cart;
}

export function serializeCookieCart(cart: CookieCart): string {
  return JSON.stringify(cart);
}

export function parseCookieCart(val: string | null | undefined): CookieCart | null {
  if (!val) return null;
  try {
    const parsed = JSON.parse(val) as CookieCart;
    if (!parsed.id || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function priceForVariant(variantId: string): Promise<{ unit: number; product: Product; variant: Variant }> {
  const variant = await prisma.variant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant) throw new Error('Variante no encontrada');
  const base = Number(variant.product.price);
  const diff = variant.priceDiff ? Number(variant.priceDiff) : 0;
  return { unit: base + diff, product: variant.product, variant };
}

export async function cartTotalsFromCookie(cart: CookieCart) {
  let subtotal = 0;
  const enriched = [];
  for (const item of cart.items) {
    const { unit, product, variant } = await priceForVariant(item.variantId);
    const line = unit * item.qty;
    subtotal += line;
    enriched.push({
      ...item,
      unitPrice: unit,
      lineTotal: line,
      product,
      variant,
    });
  }
  return {
    items: enriched,
    subtotal,
    shipping: 0, // placeholder
    total: subtotal,
  };
}

/**
 * Carrito en DB para usuario logueado, usando Order como "cart" PENDING.
 * Requiere que el user esté autenticado.
 */
export async function getOrCreateUserCart(userId: string) {
  let order = await prisma.order.findFirst({
    where: { userId, status: 'PENDING' },
    include: { items: true },
  });
  if (!order) {
    order = await prisma.order.create({
      data: { userId, status: 'PENDING', total: 0, currency: 'ARS' },
      include: { items: true },
    });
  }
  return order;
}

export async function addItemToUserCart(userId: string, variantId: string, qty = 1) {
  const order = await getOrCreateUserCart(userId);
  // precio actual
  const { unit } = await priceForVariant(variantId);

  const existing = order.items.find((i) => i.variantId === variantId);
  if (existing) {
    await prisma.orderItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + qty, unitPrice: unit },
    });
  } else {
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        variantId,
        quantity: qty,
        unitPrice: unit,
      },
    });
  }
  return await recomputeOrderTotal(order.id);
}

export async function updateItemQtyInUserCart(userId: string, variantId: string, qty: number) {
  const order = await getOrCreateUserCart(userId);
  const existing = order.items.find((i) => i.variantId === variantId);
  if (!existing) return await recomputeOrderTotal(order.id);
  if (qty <= 0) {
    await prisma.orderItem.delete({ where: { id: existing.id } });
  } else {
    const { unit } = await priceForVariant(variantId);
    await prisma.orderItem.update({
      where: { id: existing.id },
      data: { quantity: qty, unitPrice: unit },
    });
  }
  return await recomputeOrderTotal(order.id);
}

export async function recomputeOrderTotal(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: { include: { product: true } },
        },
      },
    },
  });
  if (!order) throw new Error('Orden no encontrada');
  const subtotal = order.items.reduce((acc, it) => acc + Number(it.unitPrice) * it.quantity, 0);
  const total = subtotal; // + envío/descuentos si aplica
  await prisma.order.update({ where: { id: orderId }, data: { total } });
  return { ...order, subtotal, total };
}
