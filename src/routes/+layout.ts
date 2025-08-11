// src/routes/+layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
  // Aquí podrías hidratar datos globales (usuario en sesión, config de tienda, etc.)
  // Si luego usás hooks.server.ts para setear locals.user, podés pasarlo desde el +layout.server.ts.
  return {
    siteName: 'ecommerce-zapatillas',
    user: data?.user ?? null
  };
};
