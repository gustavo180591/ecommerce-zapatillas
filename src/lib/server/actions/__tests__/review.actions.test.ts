import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '$lib/server/prisma';
import {
  getReviews,
  updateReviewStatus,
  deleteReview,
  toggleHelpful,
  getReviewSummary
} from '../review.actions';
import { ReviewStatus } from '@prisma/client';

// Mock the Prisma client
vi.mock('$lib/server/prisma', () => ({
  prisma: {
    review: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
    reviewHelpful: {
      findUnique: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
    },
    product: {
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

describe('Review Actions', () => {
  const mockReview = {
    id: 'review-1',
    productId: 'product-1',
    userId: 'user-1',
    rating: 5,
    title: 'Great product!',
    comment: 'Works as expected',
    status: 'PENDING' as ReviewStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { helpfulVotes: 0 },
    product: {
      id: 'product-1',
      name: 'Test Product',
      slug: 'test-product',
      images: [{ url: 'test.jpg' }]
    },
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
      image: null
    },
    images: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReviews', () => {
    it('should fetch reviews with default pagination', async () => {
      // Mock the Prisma responses
      (prisma.review.findMany as any).mockResolvedValue([mockReview]);
      (prisma.review.count as any).mockResolvedValue(1);

      const result = await getReviews();

      expect(prisma.review.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      });
      expect(result).toEqual({
        reviews: [{
          ...mockReview,
          helpfulCount: 0,
          _count: undefined
        }],
        total: 1,
        page: 1,
        totalPages: 1,
        hasMore: false
      });
    });

    it('should apply status filter', async () => {
      (prisma.review.findMany as any).mockResolvedValue([]);
      (prisma.review.count as any).mockResolvedValue(0);

      await getReviews({ status: 'APPROVED' });

      expect(prisma.review.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: 'APPROVED' }
      }));
    });
  });

  describe('updateReviewStatus', () => {
    it('should update review status and return updated review', async () => {
      const updatedReview = { ...mockReview, status: 'APPROVED' };
      (prisma.review.update as any).mockResolvedValue(updatedReview);

      const result = await updateReviewStatus('review-1', 'APPROVED');

      expect(prisma.review.update).toHaveBeenCalledWith({
        where: { id: 'review-1' },
        data: { status: 'APPROVED' },
        include: { product: { select: { id: true, slug: true } } }
      });
      expect(result).toEqual(updatedReview);
    });
  });

  describe('deleteReview', () => {
    it('should delete a review and update product stats', async () => {
      (prisma.review.delete as any).mockResolvedValue({
        ...mockReview,
        product: { id: 'product-1' }
      });

      await deleteReview('review-1');

      expect(prisma.review.delete).toHaveBeenCalledWith({
        where: { id: 'review-1' },
        include: { product: { select: { id: true } } }
      });
    });
  });

  describe('toggleHelpful', () => {
    it('should add a helpful vote when none exists', async () => {
      (prisma.reviewHelpful.findUnique as any).mockResolvedValue(null);
      (prisma.reviewHelpful.create as any).mockResolvedValue({});

      const result = await toggleHelpful('review-1', 'user-1');

      expect(result).toEqual({ voted: true });
      expect(prisma.reviewHelpful.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          reviewId: 'review-1'
        }
      });
    });

    it('should remove a helpful vote when it exists', async () => {
      (prisma.reviewHelpful.findUnique as any).mockResolvedValue({});
      (prisma.reviewHelpful.delete as any).mockResolvedValue({});

      const result = await toggleHelpful('review-1', 'user-1');

      expect(result).toEqual({ voted: false });
      expect(prisma.reviewHelpful.delete).toHaveBeenCalledWith({
        where: {
          userId_reviewId: {
            userId: 'user-1',
            reviewId: 'review-1'
          }
        }
      });
    });
  });

  describe('getReviewSummary', () => {
    it('should return review summary for a product', async () => {
      const mockAggregate = {
        _avg: { rating: 4.5 },
        _count: { id: 10 }
      };
      
      const mockGroupBy = [
        { rating: 5, _count: 5 },
        { rating: 4, _count: 3 },
        { rating: 3, _count: 1 },
        { rating: 2, _count: 1 },
        { rating: 1, _count: 0 }
      ];

      (prisma.review.aggregate as any).mockResolvedValue(mockAggregate);
      (prisma.review.groupBy as any).mockResolvedValue(mockGroupBy);

      const result = await getReviewSummary('product-1');

      expect(prisma.review.aggregate).toHaveBeenCalledWith({
        where: { 
          productId: 'product-1',
          status: 'APPROVED'
        },
        _avg: { rating: true },
        _count: { id: true }
      });

      expect(result).toEqual({
        averageRating: 4.5,
        totalReviews: 10,
        ratingDistribution: {
          5: 5,
          4: 3,
          3: 1,
          2: 1,
          1: 0
        }
      });
    });
  });
});
