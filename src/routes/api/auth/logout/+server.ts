import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete('session', { path: '/' });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
