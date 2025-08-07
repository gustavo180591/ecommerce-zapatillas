import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteProduct, updateInventory } from '$lib/server/actions/product';
import { prisma } from '$lib/server/__mocks__/prisma';
import '../setup';

// Type for the transaction callback parameter
type TransactionCallback = (tx: {
  inventory: {
    deleteMany: () => Promise<{ count: number }>;
  };
  variant: {
    deleteMany: () => Promise<{ count: number }>;
  };
  product: {
    delete: () => Promise<{ id: string; deleted: boolean }>;
  };
}) => Promise<unknown>;

describe('Product Server Actions', () => {
  const mockUserId = 'user-123';
  const mockProductId = 'prod-123';
  const mockVariantId = 'var-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteProduct', () => {
    it('should throw 403 if user is not admin', async () => {
      // Arrange
      const { isAdmin } = await import('$lib/server/auth');
      vi.mocked(isAdmin).mockResolvedValueOnce(false);

      // Act & Assert
      await expect(deleteProduct(mockProductId, 'non-admin-user'))
        .rejects
        .toThrowError('No autorizado');
    });

    it('should throw 404 if product is not found', async () => {
      // Arrange
      vi.mocked(prisma.product.findUnique).mockResolvedValueOnce(null);

      // Act & Assert
      await expect(deleteProduct('non-existent-id', mockUserId))
        .rejects
        .toThrowError('Producto no encontrado');
    });

    it('should soft delete product with orders', async () => {
      // Arrange
      const mockProduct = {
        id: mockProductId,
        orderItems: [{ id: 'order-1' }],
        variants: []
      };
      vi.mocked(prisma.product.findUnique).mockResolvedValueOnce(mockProduct);
      vi.mocked(prisma.product.update).mockResolvedValueOnce({ 
        ...mockProduct, 
        status: 'ARCHIVED',
        deletedAt: new Date()
      });

      // Act
      const result = await deleteProduct(mockProductId, mockUserId);

      // Assert
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: {
          status: 'ARCHIVED',
          deletedAt: expect.any(Date)
        }
      });
      expect(result.status).toBe('ARCHIVED');
    });

    it('should hard delete product without orders', async () => {
      // Arrange
      const mockProduct = {
        id: mockProductId,
        orderItems: [],
        variants: [
          { id: 'var-1', orderItems: [] }
        ]
      };
      vi.mocked(prisma.product.findUnique).mockResolvedValueOnce(mockProduct);
      // Mock the transaction to return a successful result
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
      
      vi.mocked(prisma.$transaction).mockImplementationOnce(mockTransaction as unknown as typeof prisma.$transaction);
      );

      // Act
      const result = await deleteProduct(mockProductId, mockUserId);

      // Assert
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toEqual({ id: mockProductId, deleted: true });
    });
  });

  describe('updateInventory', () => {
    it('should update inventory for a variant', async () => {
      // Arrange
      const mockInventory = { id: 'inv-1', variantId: mockVariantId, available: 10 };
      vi.mocked(prisma.inventory.findUnique).mockResolvedValueOnce(mockInventory);
      vi.mocked(prisma.inventory.update).mockResolvedValueOnce({ ...mockInventory, available: 15 });

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
      vi.mocked(prisma.inventory.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.inventory.create).mockResolvedValueOnce({ 
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
      const mockInventory = { id: 'inv-1', variantId: mockVariantId, available: 10 };
      vi.mocked(prisma.inventory.findUnique).mockResolvedValueOnce(mockInventory);
      vi.mocked(prisma.inventory.update).mockResolvedValueOnce({ ...mockInventory, available: 5 });

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
      const mockInventory = { id: 'inv-1', variantId: mockVariantId, available: 10 };
      vi.mocked(prisma.inventory.findUnique).mockResolvedValueOnce(mockInventory);
      vi.mocked(prisma.inventory.update).mockResolvedValueOnce({ ...mockInventory, available: 20 });

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
      vi.mocked(prisma.inventory.findUnique).mockResolvedValueOnce(null);

      // Act & Assert
      await expect(updateInventory(mockProductId, mockVariantId, 5, 'decrement', mockUserId))
        .rejects
        .toThrowError('Inventory not found');
    });
  });
});
