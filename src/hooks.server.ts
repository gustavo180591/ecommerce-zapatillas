import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import { prisma } from '$lib/server/prisma';

const authentication: Handle = async ({ event, resolve }) => {
  // Get the session from the auth system
  event.locals.auth = auth.handleRequest(event);
  const session = await event.locals.auth.validate();
  
  // If there's a session, get the user data
  if (session) {
    event.locals.user = await prisma.user.findUnique({
      where: { id: session.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        cart: {
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
        }
      }
    });
  } else {
    event.locals.user = null;
  }

  const response = await resolve(event);
  return response;
};

const syncCart: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Only handle GET requests and only if the user is authenticated
  if (event.request.method !== 'GET' || !event.locals.user) {
    return response;
  }

  // Get the cart from cookies if it exists
  const cartCookie = event.cookies.get('cart');
  if (!cartCookie) {
    return response;
  }

  try {
    const localCart = JSON.parse(cartCookie);
    
    // If there are items in the local cart, sync them with the server
    if (localCart.items && localCart.items.length > 0) {
      // Get the user's server cart
      const serverCart = event.locals.user.cart;
      
      // Merge local and server carts
      const mergedItems = [...(serverCart?.items || [])];
      
      for (const localItem of localCart.items) {
        const existingItemIndex = mergedItems.findIndex(
          item => item.productId === localItem.productId && 
                 item.size === localItem.size && 
                 item.color === localItem.color
        );
        
        if (existingItemIndex >= 0) {
          // Update quantity if item exists
          mergedItems[existingItemIndex].quantity += localItem.quantity;
        } else {
          // Add new item
          mergedItems.push({
            ...localItem,
            id: undefined, // Let the database generate the ID
            cartId: serverCart?.id || undefined,
            product: {
              id: localItem.productId,
              name: localItem.product?.name || '',
              price: localItem.product?.price || 0,
              image: localItem.product?.image || ''
            }
          });
        }
      }
      
      // Update the server cart
      if (serverCart) {
        await prisma.$transaction([
          // Delete existing items
          prisma.cartItem.deleteMany({
            where: { cartId: serverCart.id }
          }),
          // Add merged items
          ...mergedItems.map(item => 
            prisma.cartItem.create({
              data: {
                cartId: serverCart.id,
                productId: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color
              }
            })
          )
        ]);
      } else if (event.locals.user) {
        // Create a new cart if it doesn't exist
        await prisma.cart.create({
          data: {
            userId: event.locals.user.id,
            items: {
              create: mergedItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color
              }))
            }
          }
        });
      }
      
      // Clear the local cart cookie
      event.cookies.delete('cart', { path: '/' });
    }
  } catch (error) {
    console.error('Error syncing cart:', error);
    // Don't fail the request if cart sync fails
  }
  
  return response;
};

export const handle = sequence(authentication, syncCart);
