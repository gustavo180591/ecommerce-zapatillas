import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import type { CartItem } from '@prisma/client';

export const GET: RequestHandler = async ({ locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    return json({ items: [] });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true
              }
            }
          }
        }
      }
    });

    if (!cart) {
      return json({ items: [] });
    }

    return json({
      items: cart.items.map(item => ({
        ...item,
        product: item.product,
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }))
    });
  } catch (err) {
    console.error('Error fetching cart:', err);
    throw error(500, 'Error fetching cart');
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await locals.auth.validate();
  if (!session) {
    throw error(401, 'Unauthorized');
  }

  const { items } = await request.json();
  if (!Array.isArray(items)) {
    throw error(400, 'Invalid cart data');
  }

  try {
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get or create user's cart
      let cart = await tx.cart.findUnique({
        where: { userId: session.user.userId },
        include: { items: true }
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: {
            userId: session.user.userId,
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color
              }))
            }
          },
          include: { items: true }
        });
      } else {
        // Update existing cart
        // First, delete all existing items
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id }
        });

        // Then add the new items
        await tx.cart.update({
          where: { id: cart.id },
          data: {
            items: {
              create: items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color
              }))
            }
          }
        });
      }

      // Return the updated cart with product details
      return await tx.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  image: true
                }
              }
            }
          }
        }
      });
    });

    return json({
      items: result?.items.map(item => ({
        ...item,
        product: item.product,
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      })) || []
    });
  } catch (err) {
    console.error('Error updating cart:', err);
    throw error(500, 'Error updating cart');
  }
};

// Add this type for better type safety
type CartItemWithProduct = CartItem & {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
};

// Add this type for the API response
type CartResponse = {
  items: Array<CartItemWithProduct>;
};
