import { json, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { requireAdmin } from '$lib/server/auth';
import { z } from 'zod';

// Schema for product creation/update
const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional().nullable(),
  costPerItem: z.number().positive().optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  quantity: z.number().int().min(0),
  categoryId: z.string().min(1),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  trackQuantity: z.boolean(),
  allowOutOfStockPurchases: z.boolean(),
  requiresShipping: z.boolean(),
  weight: z.number().min(0).optional().nullable(),
  weightUnit: z.enum(['g', 'kg', 'lb', 'oz']).optional().nullable(),
  images: z.array(z.string().url()).default([]),
  variants: z.array(
    z.object({
      id: z.string().optional(),
      option1: z.string().optional().nullable(),
      option2: z.string().optional().nullable(),
      option3: z.string().optional().nullable(),
      price: z.number().positive(),
      sku: z.string().optional().nullable(),
      barcode: z.string().optional().nullable(),
      quantity: z.number().int().min(0),
      requiresShipping: z.boolean().optional(),
      taxable: z.boolean().optional(),
      weight: z.number().min(0).optional().nullable(),
    })
  ).optional(),
});

// GET /api/admin/products - List products with pagination
export const GET = async ({ url, locals }) => {
  await requireAdmin(locals);

  try {
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status');
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
              alt: true,
              isPrimary: true,
            },
            orderBy: { isPrimary: 'desc' },
          },
          _count: {
            select: { variants: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return json({
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    throw error(500, 'Failed to fetch products');
  }
};

// POST /api/admin/products - Create a new product
export const POST = async ({ request, locals }) => {
  const session = await requireAdmin(locals);

  try {
    const data = await request.json();
    const result = productSchema.safeParse(data);

    if (!result.success) {
      console.error('Validation error:', result.error);
      throw error(422, {
        message: 'Validation failed',
        errors: result.error.format(),
      });
    }

    const { images, variants, ...productData } = result.data;

    // Start a transaction to ensure data consistency
    const product = await prisma.$transaction(async (prisma) => {
      // Create the product
      const newProduct = await prisma.product.create({
        data: {
          ...productData,
          createdById: session.user.id,
        },
      });

      // Add images if any
      if (images && images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((url, index) => ({
            productId: newProduct.id,
            url,
            alt: `${productData.name} - Image ${index + 1}`,
            isPrimary: index === 0,
          })),
        });
      }

      // Add variants if any
      if (variants && variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map((variant) => ({
            ...variant,
            productId: newProduct.id,
          })),
        });
      }

      // Return the product with relations
      return prisma.product.findUnique({
        where: { id: newProduct.id },
        include: {
          images: true,
          variants: true,
          category: true,
        },
      });
    });

    return json(product, { status: 201 });
  } catch (err) {
    console.error('Error creating product:', err);
    if (err.status === 422) {
      throw err; // Re-throw validation errors
    }
    throw error(500, 'Failed to create product');
  }
};
