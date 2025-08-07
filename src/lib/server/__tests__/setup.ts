import { vi, beforeEach } from 'vitest';
import { prisma } from '$lib/server/__mocks__/prisma';

// Mock the auth module
vi.mock('$lib/server/auth', () => ({
  isAdmin: vi.fn().mockResolvedValue(true)
}));

// Mock the prisma client
vi.mock('$lib/server/prisma', () => ({
  __esModule: true,
  prisma: {
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    variant: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    inventory: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
    },
    orderItem: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn((callback) => 
      callback({
        inventory: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 })
        },
        variant: {
          deleteMany: vi.fn().mockResolvedValue({ count: 1 })
        },
        product: {
          delete: vi.fn().mockResolvedValue({ id: 'prod-123', deleted: true })
        }
      })
    ),
  }
}));

// Clear all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  
  // Reset all mocked functions to their initial state
  vi.mocked(prisma.product.findUnique).mockReset();
  vi.mocked(prisma.product.update).mockReset();
  vi.mocked(prisma.product.delete).mockReset();
  vi.mocked(prisma.variant.deleteMany).mockReset();
  vi.mocked(prisma.inventory.deleteMany).mockReset();
  vi.mocked(prisma.$transaction).mockImplementation((callback) => 
    callback({
      inventory: {
        deleteMany: vi.fn().mockResolvedValue({ count: 1 })
      },
      variant: {
        deleteMany: vi.fn().mockResolvedValue({ count: 1 })
      },
      product: {
        delete: vi.fn().mockResolvedValue({ id: 'prod-123', deleted: true })
      }
    })
  );
});
