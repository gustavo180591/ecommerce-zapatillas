import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth module
vi.mock('$lib/server/auth', () => ({
  isAdmin: vi.fn().mockResolvedValue(true)
}));

// Mock the prisma client
const mockPrisma = {
  product: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  inventory: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn((callback) => 
    callback({
      inventory: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
      variant: { deleteMany: vi.fn().mockResolvedValue({ count: 1 }) },
      product: { delete: vi.fn().mockResolvedValue({ id: 'prod-123', deleted: true }) }
    })
  ),
};

vi.mock('$lib/server/prisma', () => ({
  prisma: mockPrisma
}));

// Import the functions to test after setting up the mocks
import { deleteProduct, updateInventory } from '$lib/server/actions/product';

describe('Product Server Actions - Simple', () => {
  const mockUserId = 'user-123';
  const mockProductId = 'prod-123';
  const mockVariantId = 'var-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      // Arrange
      mockPrisma.product.findUnique.mockResolvedValue({
        id: mockProductId,
        variants: [{ id: mockVariantId, inventory: { id: 'inv-123' } }]
      });

      // Act
      const result = await deleteProduct(mockProductId, mockUserId);

      // Assert
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockProductId },
        include: { variants: { include: { inventory: true } } }
      });
      expect(result).toEqual({ id: mockProductId, deleted: true });
    });
  });

  describe('updateInventory', () => {
    it('should update inventory for a variant', async () => {
      // Arrange
      const mockInventory = { 
        id: 'inv-1', 
        variantId: mockVariantId, 
        available: 10,
        updatedBy: null,
        updatedAt: new Date()
      };
      
      mockPrisma.inventory.findUnique.mockResolvedValue(mockInventory);
      mockPrisma.inventory.update.mockResolvedValue({ 
        ...mockInventory, 
        available: 15 
      });

      // Act
      const result = await updateInventory(mockProductId, mockVariantId, 5, 'increment', mockUserId);

      // Assert
      expect(mockPrisma.inventory.update).toHaveBeenCalledWith({
        where: { variantId: mockVariantId },
        data: {
          available: { increment: 5 },
          updatedBy: mockUserId,
          updatedAt: expect.any(Date)
        }
      });
      expect(result.available).toBe(15);
    });
  });
});
