import { prisma } from '$lib/server/prisma';
import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { Review, ReviewStatus, Prisma } from '@prisma/client';

interface GetReviewsOptions {
  status?: ReviewStatus;
  search?: string;
  page?: number;
  limit?: number;
  productId?: string;
  userId?: string;
}

export async function getReviews(options: GetReviewsOptions = {}) {
  const {
    status,
    search,
    page = 1,
    limit = 10,
    productId,
    userId
  } = options;

  const skip = (page - 1) * limit;
  const take = limit;

  const where: Prisma.ReviewWhereInput = {};
  
  if (status) where.status = status;
  if (productId) where.productId = productId;
  if (userId) where.userId = userId;
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { comment: { contains: search, mode: 'insensitive' } },
      { product: { name: { contains: search, mode: 'insensitive' } } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } }
    ];
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: {
              take: 1,
              select: { url: true }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        images: true,
        _count: {
          select: { helpfulVotes: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.review.count({ where })
  ]);

  return {
    reviews: reviews.map(review => ({
      ...review,
      helpfulCount: review._count.helpfulVotes,
      _count: undefined
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: skip + reviews.length < total
  };
}

export async function getReviewById(id: string) {
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      },
      images: true,
      _count: {
        select: { helpfulVotes: true }
      }
    }
  });

  if (!review) return null;

  return {
    ...review,
    helpfulCount: review._count.helpfulVotes,
    _count: undefined
  };
}

export async function updateReviewStatus(id: string, status: ReviewStatus) {
  const review = await prisma.review.update({
    where: { id },
    data: { status },
    include: {
      product: {
        select: {
          id: true,
          slug: true
        }
      }
    }
  });

  // Update product rating stats if review is approved or rejected from approved
  if (status === 'APPROVED' || review.status === 'APPROVED') {
    await updateProductRatingStats(review.productId);
  }

  return review;
}

async function updateProductRatingStats(productId: string) {
  const [stats] = await Promise.all([
    prisma.review.aggregate({
      where: { 
        productId,
        status: 'APPROVED'
      },
      _avg: { rating: true },
      _count: { id: true }
    }),
    prisma.review.count({
      where: { 
        productId,
        status: 'APPROVED',
        rating: 5
      }
    }),
    prisma.review.count({
      where: { 
        productId,
        status: 'APPROVED',
        rating: 4
      }
    }),
    prisma.review.count({
      where: { 
        productId,
        status: 'APPROVED',
        rating: 3
      }
    }),
    prisma.review.count({
      where: { 
        productId,
        status: 'APPROVED',
        rating: 2
      }
    }),
    prisma.review.count({
      where: { 
        productId,
        status: 'APPROVED',
        rating: 1
      }
    })
  ]);

  const [fiveStar, fourStar, threeStar, twoStar, oneStar] = await Promise.all([
    prisma.review.count({
      where: { 
        productId,
        status: 'APPROVED',
        rating: 5
      }
    }),
    prisma.review.count({
      where: { 
        productId,
        status: 'APPROVED',
        rating: 4
      }
    }),
    prisma.review.count({
      where: { 
        productId,
        status: 'APPROVED',
        rating: 3
      }
    }),
    prisma.review.count({
      where: { 
        productId,
        status: 'APPROVED',
        rating: 2
      }
    }),
    prisma.review.count({
      where: { 
        productId,
        status: 'APPROVED',
        rating: 1
      }
    })
  ]);

  const totalReviews = fiveStar + fourStar + threeStar + twoStar + oneStar;
  const averageRating = totalReviews > 0 
    ? (5 * fiveStar + 4 * fourStar + 3 * threeStar + 2 * twoStar + 1 * oneStar) / totalReviews
    : 0;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: averageRating,
      reviewCount: totalReviews,
      ratingDistribution: [oneStar, twoStar, threeStar, fourStar, fiveStar]
    }
  });
}

export async function deleteReview(id: string) {
  const review = await prisma.review.delete({
    where: { id },
    include: {
      product: {
        select: {
          id: true
        }
      }
    }
  });

  // Update product rating stats
  await updateProductRatingStats(review.productId);

  return review;
}

export async function toggleHelpful(reviewId: string, userId: string) {
  const existingVote = await prisma.reviewHelpful.findUnique({
    where: {
      userId_reviewId: {
        userId,
        reviewId
      }
    }
  });

  if (existingVote) {
    await prisma.reviewHelpful.delete({
      where: {
        userId_reviewId: {
          userId,
          reviewId
        }
      }
    });
    return { voted: false };
  } else {
    await prisma.reviewHelpful.create({
      data: {
        userId,
        reviewId
      }
    });
    return { voted: true };
  }
}

export async function getReviewSummary(productId: string) {
  const [stats] = await Promise.all([
    prisma.review.aggregate({
      where: { 
        productId,
        status: 'APPROVED'
      },
      _avg: { rating: true },
      _count: { id: true }
    }),
    prisma.review.groupBy({
      by: ['rating'],
      where: { 
        productId,
        status: 'APPROVED'
      },
      _count: {
        rating: true
      },
      orderBy: {
        rating: 'desc'
      }
    })
  ]);

  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  };

  for (const group of await prisma.review.groupBy({
    by: ['rating'],
    where: { 
      productId,
      status: 'APPROVED'
    },
    _count: {
      rating: true
    }
  })) {
    ratingDistribution[group.rating as keyof typeof ratingDistribution] = group._count.rating;
  }

  return {
    averageRating: stats._avg.rating || 0,
    totalReviews: stats._count.id,
    ratingDistribution
  };
}
