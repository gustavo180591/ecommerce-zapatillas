import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad } from './$types';
import type { User } from '@prisma/client';

export async function isAdmin(userId?: string) {
  if (!userId) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });
  
  return user?.role === 'ADMIN';
}

export const adminGuard: PageServerLoad = async ({ locals, url }) => {
  const session = await locals.auth.validate();
  
  if (!session) {
    throw redirect(302, `/login?redirectTo=${url.pathname}`);
  }
  
  const hasAdminAccess = await isAdmin(session.user.userId);
  
  if (!hasAdminAccess) {
    throw redirect(302, '/unauthorized');
  }
  
  return {
    user: session.user as User
  };
};

// Add this to your existing auth exports
export { auth } from '$lib/server/lucia';
export { default as handle } from './hooks.server';
