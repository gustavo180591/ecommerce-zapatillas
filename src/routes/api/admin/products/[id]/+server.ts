import { json, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { requireAdmin } from '$lib/server/auth';
import { productSchema } from '../+server';

// GET /api/admin/products/[id] - Get a single product
export const GET = async ({ params, locals }) => {
  await requireAdmin(locals);
  const { id } = params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      throw error(404, 'Product not found');
    }

    return json(product);
  } catch (err) {
    console.error(`Error fetching product ${id}:`, err);
    if (err.status === 404) {
      throw error(404, 'Product not found');
    }
    throw error(500, 'Failed to fetch product');
  }
};

// PATCH /api/admin/products/[id] - Update a product
export const PATCH = async ({ request, params, locals }) => {
  const session = await requireAdmin(locals);
  const { id } = params;

  try {
    const data = await request.json();
    const result = productSchema.partial().safeParse(data);

    if (!result.success) {
      console.error('Validation error:', result.error);
      throw error(422, {
        message: 'Validation failed',
        errors: result.error.format(),
      });
    }

    const { images, variants, ...productData } = result.data;

    // Start a transaction to ensure data consistency
    const updatedProduct = await prisma.$transaction(async (prisma) => {
      // Update the product
      const product = await prisma.product.update({
        where: { id },
        data: {
          ...productData,
          updatedAt: new Date(),
          updatedById: session.user.id,
        },
      });

      // Update images if provided
      if (images) {
        // First, delete existing images
        await prisma.productImage.deleteMany({
          where: { productId: id },
        });

        // Then add the new ones
        if (images.length > 0) {
          await prisma.productImage.createMany({
            data: images.map((url, index) => ({
              productId: id,
              url,
              alt: `${productData.name || 'Product'} - Image ${index + 1}`,
              isPrimary: index === 0,
            })),
          });
        }
      }

      // Update variants if provided
      if (variants) {
        // First, delete existing variants
        await prisma.productVariant.deleteMany({
          where: { productId: id },
        });

        // Then add the new ones
        if (variants.length > 0) {
          await prisma.productVariant.createMany({
            data: variants.map((variant) => ({
              ...variant,
              productId: id,
            })),
          });
        }
      }

      // Return the updated product with relations
      return prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          variants: true,
          category: true,
        },
      });
    });

    return json(updatedProduct);
  } catch (err) {
    console.error(`Error updating product ${id}:`, err);
    if (err.status === 404) {
      throw error(404, 'Product not found');
    }
    if (err.status === 422) {
      throw err; // Re-throw validation errors
    }
    throw error(500, 'Failed to update product');
  }
};

// DELETE /api/admin/products/[id] - Delete a product
export const DELETE = async ({ params, locals }) => {
  await requireAdmin(locals);
  const { id } = params;

  try {
    // First check if the product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw error(404, 'Product not found');
    }

    // Use a transaction to ensure all related data is deleted
    await prisma.$transaction([
      // Delete related data first to avoid foreign key constraints
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.productVariant.deleteMany({ where: { productId: id } }),
      // Then delete the product
      prisma.product.delete({ where: { id } }),
    ]);

    return json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error(`Error deleting product ${id}:`, err);
    if (err.status === 404) {
      throw error(404, 'Product not found');
    }
    throw error(500, 'Failed to delete product');
  }
};
