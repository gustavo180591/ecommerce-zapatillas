import { error, fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { isAdmin } from '$lib/server/auth';

export const deleteProduct = async (productId: string, userId: string) => {
  // Verify user is admin
  const hasAdminAccess = await isAdmin(userId);
  if (!hasAdminAccess) {
    throw error(403, 'No autorizado');
  }

  try {
    // First, check if there's any inventory or orders for this product
    const productWithInventory = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          include: {
            inventory: true,
            orderItems: true
          }
        },
        orderItems: true
      }
    });

    if (!productWithInventory) {
      throw error(404, 'Producto no encontrado');
    }

    // Check if product has any orders
    const hasOrders = productWithInventory.orderItems.length > 0 || 
      productWithInventory.variants.some(v => v.orderItems.length > 0);

    if (hasOrders) {
      // Soft delete if there are orders
      return await prisma.product.update({
        where: { id: productId },
        data: {
          status: 'ARCHIVED',
          deletedAt: new Date()
        }
      });
    } else {
      // Hard delete if no orders exist
      // First delete related records
      await prisma.$transaction([
        // Delete variant inventory
        ...productWithInventory.variants.map(variant => 
          prisma.inventory.deleteMany({
            where: { variantId: variant.id }
          })
        ),
        // Delete variants
        prisma.variant.deleteMany({
          where: { productId }
        }),
        // Delete product images
        prisma.productImage.deleteMany({
          where: { productId }
        }),
        // Finally delete the product
        prisma.product.delete({
          where: { id: productId }
        })
      ]);
      
      return { id: productId, deleted: true };
    }
  } catch (err) {
    console.error('Error deleting product:', err);
    throw error(500, 'Error al eliminar el producto');
  }
};

export const updateInventory = async (
  productId: string, 
  variantId: string | null, 
  quantity: number,
  operation: 'increment' | 'decrement' | 'set',
  userId: string
) => {
  // Verify user is admin
  const hasAdminAccess = await isAdmin(userId);
  if (!hasAdminAccess) {
    throw error(403, 'No autorizado');
  }

  try {
    const data = {
      available: operation === 'increment' 
        ? { increment: quantity }
        : operation === 'decrement'
          ? { decrement: quantity }
          : quantity
    };

    // If variantId is provided, update variant inventory
    if (variantId) {
      // Check if inventory record exists
      const existingInventory = await prisma.inventory.findUnique({
        where: { variantId }
      });

      if (!existingInventory) {
        // Create new inventory record if it doesn't exist
        return await prisma.inventory.create({
          data: {
            variantId,
            available: operation === 'set' ? quantity : 0,
            ...(operation === 'increment' && { available: quantity }),
            ...(operation === 'decrement' && { available: -quantity }),
            updatedBy: userId
          }
        });
      }

      // Update existing inventory
      return await prisma.inventory.update({
        where: { variantId },
        data: {
          ...data,
          updatedBy: userId,
          updatedAt: new Date()
        }
      });
    } 
    // Update product inventory if no variantId
    else {
      const existingInventory = await prisma.inventory.findUnique({
        where: { productId }
      });

      if (!existingInventory) {
        return await prisma.inventory.create({
          data: {
            productId,
            available: operation === 'set' ? quantity : 0,
            ...(operation === 'increment' && { available: quantity }),
            ...(operation === 'decrement' && { available: -quantity }),
            updatedBy: userId
          }
        });
      }

      return await prisma.inventory.update({
        where: { productId },
        data: {
          ...data,
          updatedBy: userId,
          updatedAt: new Date()
        }
      });
    }
  } catch (err) {
    console.error('Error updating inventory:', err);
    throw error(500, 'Error al actualizar el inventario');
  }
};
