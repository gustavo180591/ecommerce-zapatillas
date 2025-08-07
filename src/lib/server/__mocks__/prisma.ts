import { vi } from 'vitest';

export const prisma = {
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
  $transaction: vi.fn((callback) => callback(prisma)),
};

export default prisma;
