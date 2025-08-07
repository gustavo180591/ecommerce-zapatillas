import type { Review } from '@prisma/client';

export const reviews = [
  {
    id: 'review-1',
    productId: 'product-1',
    userId: 'user-1',
    rating: 5,
    title: 'Excelente producto',
    comment: 'Funciona perfectamente, muy contento con la compra',
    status: 'PENDING',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    product: {
      id: 'product-1',
      name: 'Zapatillas Deportivas',
      slug: 'zapatillas-deportivas',
      images: [{ url: 'test1.jpg' }]
    },
    user: {
      id: 'user-1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      image: null
    },
    images: [],
    _count: { helpfulVotes: 2 }
  },
  {
    id: 'review-2',
    productId: 'product-2',
    userId: 'user-2',
    rating: 4,
    title: 'Buen producto',
    comment: 'Cómodas y ligeras, aunque un poco ajustadas',
    status: 'APPROVED',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    product: {
      id: 'product-2',
      name: 'Zapatillas Urbanas',
      slug: 'zapatillas-urbanas',
      images: [{ url: 'test2.jpg' }]
    },
    user: {
      id: 'user-2',
      name: 'Ana García',
      email: 'ana@example.com',
      image: 'profile.jpg'
    },
    images: [{ id: 'img1', url: 'review1.jpg', reviewId: 'review-2' }],
    _count: { helpfulVotes: 0 }
  }
] as unknown as Review[];
