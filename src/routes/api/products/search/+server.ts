import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { RequestHandler } from './$types';

// Types for search parameters
type SearchParams = {
  query?: string;
  categories?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export const GET: RequestHandler = async ({ url }) => {
  try {
    // Parse query parameters
    const query = url.searchParams.get('q') || '';
    const categories = url.searchParams.getAll('category');
    const brands = url.searchParams.getAll('brand');
    const minPrice = Number(url.searchParams.get('minPrice')) || undefined;
    const maxPrice = Number(url.searchParams.get('maxPrice')) || undefined;
    const sizes = url.searchParams.getAll('size');
    const colors = url.searchParams.getAll('color');
    const sortBy = url.searchParams.get('sortBy') || 'relevance';
    const sortOrder = (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 24));
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      status: 'ACTIVE', // Only show active products
      stock: { gt: 0 }  // Only show in-stock items
    };

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } }
      ];
    }

    // Category filter
    if (categories.length > 0) {
      where.categoryId = { in: categories };
    }

    // Brand filter
    if (brands.length > 0) {
      where.brand = { in: brands };
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Sizes and colors would require joins in a real implementation
    // This is a simplified version
    if (sizes.length > 0 || colors.length > 0) {
      where.variants = {
        some: {}
      };
      if (sizes.length > 0) {
        where.variants.some.size = { in: sizes };
      }
      if (colors.length > 0) {
        where.variants.some.color = { in: colors };
      }
    }

    // Build sorting
    let orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy.price = sortOrder;
        break;
      case 'rating':
        orderBy.averageRating = sortOrder;
        break;
      case 'newest':
        orderBy.createdAt = sortOrder;
        break;
      case 'name':
        orderBy.name = sortOrder;
        break;
      case 'relevance':
      default:
        if (query) {
          // Add text match relevance for full-text search
          orderBy = {
            _relevance: {
              fields: ['name', 'description'],
              search: query,
              sort: 'desc'
            }
          };
        } else {
          orderBy = { createdAt: 'desc' };
        }
    }

    // Execute search
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          images: {
            take: 1,
            where: { isPrimary: true },
            select: { url: true, alt: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return json({
      data: items,
      meta: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
};
