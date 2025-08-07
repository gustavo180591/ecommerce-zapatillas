import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { createServer } from '$lib/server';
import { prisma } from '$lib/server/prisma';
import { createTestProduct, createTestCategory, createTestBrand, cleanupTestData } from '$lib/test-utils';

const app = createServer();

// Test data
let testCategory: any;
let testBrand: any;
let testProducts: any[] = [];

describe('Search API', () => {
  beforeAll(async () => {
    // Create test data
    testCategory = await createTestCategory({ name: 'Test Category', slug: 'test-category' });
    testBrand = await createTestBrand({ name: 'Test Brand', slug: 'test-brand' });
    
    // Create test products with different attributes
    testProducts = await Promise.all([
      createTestProduct({
        name: 'Running Shoes Pro',
        description: 'High performance running shoes',
        price: 15000,
        stock: 10,
        sku: 'RUN-001',
        categoryId: testCategory.id,
        brandId: testBrand.id,
      }),
      createTestProduct({
        name: 'Casual Sneakers',
        description: 'Comfortable sneakers for everyday use',
        price: 12000,
        stock: 15,
        sku: 'CSN-001',
        categoryId: testCategory.id,
        brandId: testBrand.id,
      }),
      createTestProduct({
        name: 'Basketball High Tops',
        description: 'Professional basketball shoes with ankle support',
        price: 20000,
        stock: 5,
        sku: 'BKT-001',
        categoryId: testCategory.id,
        brandId: testBrand.id,
      }),
    ]);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestData();
  });

  afterAll(async () => {
    // Close Prisma connection
    await prisma.$disconnect();
  });

  describe('GET /api/products/search', () => {
    it('should return all products when no filters are applied', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/search',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(3);
      expect(data.data.meta.total).toBe(3);
    });

    it('should filter products by search query', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/search?q=running',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(1);
      expect(data.data.products[0].name).toContain('Running Shoes');
    });

    it('should filter products by category', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/api/products/search?category=${testCategory.id}`,
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(3);
    });

    it('should filter products by price range', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/search?minPrice=10000&maxPrice=15000',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(2);
      expect(data.data.products.every((p: any) => p.price >= 10000 && p.price <= 15000)).toBe(true);
    });

    it('should sort products by price ascending', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/search?sortBy=price-asc',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      const prices = data.data.products.map((p: any) => p.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    it('should return paginated results', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/search?page=1&limit=2',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(2);
      expect(data.data.meta).toMatchObject({
        currentPage: 1,
        itemsPerPage: 2,
        totalPages: 2,
        totalItems: 3,
      });
    });

    it('should return empty array when no products match the search', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/products/search?q=nonexistent',
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.body);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(0);
      expect(data.data.meta.total).toBe(0);
    });
  });
});
