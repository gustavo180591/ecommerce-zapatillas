import type { RequestHandler } from '@sveltejs/kit';
import { loginUser } from '$lib/auth';
import { LoginSchema } from '$lib/zod-schemas';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const parsed = LoginSchema.parse(body);

    const { user, token } = await loginUser(parsed);

    // Cookie de sesión (JWT) — HttpOnly
    cookies.set('session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });

    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'Login inválido' }), { status: 400 });
  }
};
