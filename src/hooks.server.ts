// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { prisma } from '$lib/db';
import { verifyToken } from '$lib/auth';

export const handle: Handle = async ({ event, resolve }) => {
  // 1) Inyectar Prisma en locals (tipado en app.d.ts)
  event.locals.prisma = prisma;

  // 2) Resolver usuario desde cookie 'session' (JWT)
  const token = event.cookies.get('session');
  if (token) {
    const user = await verifyToken(token);
    event.locals.user = user as any; // tip: si tu verifyToken retorna UserSafe, mapealo a tu tipo deseado
  } else {
    event.locals.user = null;
  }

  // 3) (Opcional) Proteger rutas admin:
  // if (event.url.pathname.startsWith('/admin') && event.locals.user?.role !== 'ADMIN') {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  // 4) (Opcional) Security headers básicos
  const response = await resolve(event, {
    filterSerializedResponseHeaders: (name) => name === 'content-type'
  });

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
};
