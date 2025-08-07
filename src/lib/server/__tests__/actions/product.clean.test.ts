import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteProduct, updateInventory } from '$lib/server/actions/product';
import { prisma } from '$lib/server/__mocks__/prisma';
import { isAdmin } from '$lib/server/auth';

// Mock the auth module
vi.mock('$lib/server/auth', () => ({
  isAdmin: vi.fn().mockResolvedValue(true)
}));

describe('Product Server Actions', () => {
  const mockUserId = 'user-123';
  const mockProductId = 'prod-123';
  const mockVariantId = 'var-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteProduct', () => {
    it('should delete a product and its variants/inventory', async () => {
      // Arrange
      const mockProduct = {
        id: mockProductId,
        variants: [
          { id: mockVariantId, inventory: { id: 'inv-123' } }
        ]
      };

      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as any);
      
      const mockTransaction = vi.fn().mockImplementation((callback) => {
        return callback({
          inventory: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 })
          },
          variant: {
            deleteMany: vi.fn().mockResolvedValue({ count: 1 })
          },
          product: {
            delete: vi.fn().mockResolvedValue({ id: mockProductId, deleted: true })
          }
        });
      });
      
      vi.mocked(prisma.$transaction).mockImplementation(mockTransaction as any);

      // Act
      const result = await deleteProduct(mockProductId, mockUserId);

      // Assert
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockProductId },
        include: { variants: { include: { inventory: true } } }
      });
      expect(result).toEqual({ id: mockProductId, deleted: true });
    });

    it('should throw error if product not found', async () => {
      // Arrange
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(deleteProduct('non-existent', mockUserId))
        .rejects
        .toThrowError('Product not found');
    });

    it('should check admin permissions', async () => {
      // Arrange
      vi.mocked(isAdmin).mockResolvedValueOnce(false);

      // Act & Assert
      await expect(deleteProduct(mockProductId, mockUserId))
        .rejects
        .toThrowError('Unauthorized');
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
      
      vi.mocked(prisma.inventory.findUnique).mockResolvedValue(mockInventory);
      vi.mocked(prisma.inventory.update).mockResolvedValue({ 
        ...mockInventory, 
        available: 15 
      });

      // Act
      const result = await updateInventory(mockProductId, mockVariantId, 5, 'increment', mockUserId);

      // Assert
      expect(prisma.inventory.update).toHaveBeenCalledWith({
        where: { variantId: mockVariantId },
        data: {
          available: { increment: 5 },
          updatedBy: mockUserId,
          updatedAt: expect.any(Date)
        }
      });
      expect(result.available).toBe(15);
    });

    it('should create inventory if not exists', async () => {
      // Arrange
      vi.mocked(prisma.inventory.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.inventory.create).mockResolvedValue({ 
        id: 'inv-1', 
        variantId: mockVariantId,
        available: 10,
        updatedBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Act
      const result = await updateInventory(mockProductId, mockVariantId, 10, 'set', mockUserId);

      // Assert
      expect(prisma.inventory.create).toHaveBeenCalledWith({
        data: {
          variantId: mockVariantId,
          available: 10,
          updatedBy: mockUserId
        }
      });
      expect(result.available).toBe(10);
    });

    it('should handle decrement operation', async () => {
      // Arrange
      const mockInventory = { 
        id: 'inv-1', 
        variantId: mockVariantId, 
        available: 10,
        updatedBy: null,
        updatedAt: new Date()
      };
      
      vi.mocked(prisma.inventory.findUnique).mockResolvedValue(mockInventory);
      vi.mocked(prisma.inventory.update).mockResolvedValue({ 
        ...mockInventory, 
        available: 5 
      });

      // Act
      const result = await updateInventory(mockProductId, mockVariantId, 5, 'decrement', mockUserId);

      // Assert
      expect(prisma.inventory.update).toHaveBeenCalledWith({
        where: { variantId: mockVariantId },
        data: {
          available: { decrement: 5 },
          updatedBy: mockUserId,
          updatedAt: expect.any(Date)
        }
      });
      expect(result.available).toBe(5);
    });

    it('should handle set operation', async () => {
      // Arrange
      const mockInventory = { 
        id: 'inv-1', 
        variantId: mockVariantId, 
        available: 10,
        updatedBy: null,
        updatedAt: new Date()
      };
      
      vi.mocked(prisma.inventory.findUnique).mockResolvedValue(mockInventory);
      vi.mocked(prisma.inventory.update).mockResolvedValue({ 
        ...mockInventory, 
        available: 20 
      });

      // Act
      const result = await updateInventory(mockProductId, mockVariantId, 20, 'set', mockUserId);

      // Assert
      expect(prisma.inventory.update).toHaveBeenCalledWith({
        where: { variantId: mockVariantId },
        data: {
          available: 20,
          updatedBy: mockUserId,
          updatedAt: expect.any(Date)
        }
      });
      expect(result.available).toBe(20);
    });

    it('should throw error if inventory not found and operation is not set', async () => {
      // Arrange
      vi.mocked(prisma.inventory.findUnique).mockResolvedValue(null);

      // Act & Assert
      await expect(updateInventory(mockProductId, mockVariantId, 5, 'decrement', mockUserId))
        .rejects
        .toThrowError('Inventory not found');
    });
  });
});
