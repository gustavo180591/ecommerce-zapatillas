import { test, expect, type Page } from '@playwright/test';
import { prisma } from '$lib/server/prisma';
import type { Product, Category, Brand } from '@prisma/client';

// Helper to create test data
export const createTestProduct = async (data: Partial<Product> = {}) => {
  return await prisma.product.create({
    data: {
      name: data.name || 'Test Product',
      description: data.description || 'Test description',
      price: data.price || 10000,
      stock: data.stock || 10,
      sku: data.sku || `TEST-${Date.now()}`,
      categoryId: data.categoryId || (await createTestCategory()).id,
      brandId: data.brandId || (await createTestBrand()).id,
      isActive: data.isActive ?? true,
    },
    include: {
      category: true,
      brand: true,
      images: true,
      variants: true
    }
  });
};

export const createTestCategory = async (data: Partial<Category> = {}) => {
  return await prisma.category.create({
    data: {
      name: data.name || `Test Category ${Date.now()}`,
      slug: data.slug || `test-category-${Date.now()}`,
      description: data.description || 'Test category description',
      isActive: data.isActive ?? true,
    }
  });
};

export const createTestBrand = async (data: Partial<Brand> = {}) => {
  return await prisma.brand.create({
    data: {
      name: data.name || `Test Brand ${Date.now()}`,
      slug: data.slug || `test-brand-${Date.now()}`,
      logoUrl: data.logoUrl || '/images/brand-logo.png',
      isActive: data.isActive ?? true,
    }
  });
};

// Helper to clean up test data
export const cleanupTestData = async () => {
  const deleteVariants = prisma.productVariant.deleteMany({});
  const deleteImages = prisma.productImage.deleteMany({});
  const deleteProducts = prisma.product.deleteMany({});
  const deleteCategories = prisma.category.deleteMany({});
  const deleteBrands = prisma.brand.deleteMany({});
  
  await prisma.$transaction([
    deleteVariants,
    deleteImages,
    deleteProducts,
    deleteCategories,
    deleteBrands,
  ]);
};

// Helper to login as admin for E2E tests
export const loginAsAdmin = async (page: Page) => {
  await page.goto('/admin/login');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin/dashboard');
};

// Helper to test search functionality
export const testSearch = async (page: Page, query: string, expectedResults: string[]) => {
  await page.fill('input[placeholder="Buscar productos..."]', query);
  await page.keyboard.press('Enter');
  
  // Wait for results to load
  await page.waitForSelector('[data-testid="product-grid"]');
  
  // Check if expected results are present
  for (const expected of expectedResults) {
    await expect(page.getByText(expected, { exact: false })).toBeVisible();
  }
};

// Helper to test filter application
export const testFilter = async (
  page: Page, 
  filterType: string, 
  filterValue: string, 
  expectedResults: string[]
) => {
  // Open filter panel if not already open
  const filterButton = page.getByRole('button', { name: /filtros/i });
  if (await filterButton.isVisible()) {
    await filterButton.click();
  }
  
  // Apply filter
  await page.getByLabel(new RegExp(`${filterType}.*${filterValue}`, 'i')).check();
  
  // Submit filters
  await page.getByRole('button', { name: /aplicar filtros/i }).click();
  
  // Wait for results to update
  await page.waitForLoadState('networkidle');
  
  // Check if expected results are present
  for (const expected of expectedResults) {
    await expect(page.getByText(expected, { exact: false })).toBeVisible();
  }
};
