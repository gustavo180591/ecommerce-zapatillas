import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { requireAdmin } from '$lib/server/auth';

export const load = async ({ params, locals }) => {
  // Require admin authentication
  const session = await requireAdmin(locals);
  const productId = params.id;

  try {
    // Load the product with its variants
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: true,
        images: true,
        category: true,
      },
    });

    if (!product) {
      throw error(404, 'Product not found');
    }

    // Load categories for the form
    const categories = await prisma.category.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    });

    // Transform the product data for the form
    const formData = {
      ...product,
      categoryId: product.categoryId,
      images: product.images.map(img => img.url),
      variants: product.variants || [],
    };

    return {
      product: formData,
      categories,
      user: session.user,
    };
  } catch (err) {
    console.error(`Error loading product ${productId}:`, err);
    if (err.status === 404) {
      throw error(404, 'Product not found');
    }
    throw error(500, 'Failed to load product');
  }
};
