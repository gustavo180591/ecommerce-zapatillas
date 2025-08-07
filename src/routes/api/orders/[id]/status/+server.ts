import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const GET: RequestHandler = async ({ params, locals }) => {
  const session = await locals.getSession();
  if (!session?.user?.email) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return json({ error: 'ID de orden inválido' }, { status: 400 });
    }

    // Get order with payment information
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        user: {
          email: session.user.email
        }
      },
      include: {
        payment: true
      }
    });

    if (!order) {
      return json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    return json({
      status: order.status,
      paymentStatus: order.payment?.status || 'PENDING',
      updatedAt: order.updatedAt.toISOString(),
      paymentMethod: order.payment?.paymentMethod,
      paymentProvider: order.payment?.paymentProvider
    });

  } catch (error) {
    console.error('Error fetching order status:', error);
    return json(
      { error: 'Error al obtener el estado del pedido' },
      { status: 500 }
    );
  }
};
