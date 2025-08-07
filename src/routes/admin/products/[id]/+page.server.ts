import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  // In a real app, you would fetch the product from your database
  // For now, we'll return mock data
  const mockProduct = {
    id: params.id,
    name: 'Zapatillas Deportivas Pro',
    description: 'Zapatillas deportivas de alta calidad para todo tipo de actividades físicas.',
    price: 199.99,
    compareAtPrice: 249.99,
    costPerItem: 120.50,
    sku: 'ZDP-' + params.id.slice(-4).toUpperCase(),
    barcode: '123456789012',
    stock: 50,
    weight: 0.5,
    status: 'active',
    category: 'Zapatillas Deportivas',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=698&q=80'
    ],
    variants: [
      {
        id: 'var_1',
        name: 'Talle 42, Negro',
        price: 199.99,
        sku: 'ZDP-42-BLK',
        stock: 20,
        options: [
          { name: 'Talle', value: '42' },
          { name: 'Color', value: 'Negro' }
        ]
      },
      {
        id: 'var_2',
        name: 'Talle 43, Negro',
        price: 199.99,
        sku: 'ZDP-43-BLK',
        stock: 15,
        options: [
          { name: 'Talle', value: '43' },
          { name: 'Color', value: 'Negro' }
        ]
      },
      {
        id: 'var_3',
        name: 'Talle 42, Blanco',
        price: 199.99,
        sku: 'ZDP-42-WHT',
        stock: 15,
        options: [
          { name: 'Talle', value: '42' },
          { name: 'Color', value: 'Blanco' }
        ]
      }
    ],
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: new Date().toISOString()
  };

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // In a real app, you would do something like:
  // const product = await prisma.product.findUnique({
  //   where: { id: params.id },
  //   include: { variants: true }
  // });

  // if (!product) {
  //   throw error(404, 'Producto no encontrado');
  // }

  return {
    product: mockProduct
  };
};
