import { error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { requireAdmin } from '$lib/server/auth';

export const load = async ({ locals }) => {
  // Require admin authentication
  const session = await requireAdmin(locals);

  try {
    // Load categories for the form
    const categories = await prisma.category.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    });

    return {
      categories,
      user: session.user,
    };
  } catch (err) {
    console.error('Error loading new product page:', err);
    throw error(500, 'Failed to load new product page');
  }
};
