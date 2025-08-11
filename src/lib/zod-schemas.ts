// src/lib/zod-schemas.ts
import { z } from 'zod';

// Auth
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(60).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Catálogo / filtros
export const ProductFiltersSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  min: z.coerce.number().min(0).optional(),
  max: z.coerce.number().min(0).optional(),
  sort: z.enum(['new', 'price_asc', 'price_desc']).optional(),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(60).default(24),
});

// Carrito
export const AddToCartSchema = z.object({
  variantId: z.string().cuid(),
  qty: z.coerce.number().min(1).max(20).default(1),
});

export const UpdateCartItemSchema = z.object({
  variantId: z.string().cuid(),
  qty: z.coerce.number().min(0).max(20), // 0 = remove
});

// Checkout
export const CheckoutSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6).max(30).optional(),
  address: z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().default('AR'),
  }),
  notes: z.string().max(500).optional(),
});
