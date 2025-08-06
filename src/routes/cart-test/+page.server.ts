import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // You can add any server-side logic here if needed
  // For now, we'll just return the user data
  return {
    user: locals.user || null
  };
};
