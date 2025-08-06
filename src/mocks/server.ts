import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock data
const mockProducts = [
  {
    id: 1,
    name: 'Zapatilla Deportiva',
    price: 19990,
    image: '/images/shoe1.jpg',
    stock: 10,
    sizes: ['38', '39', '40', '41', '42'],
    colors: ['Negro', 'Blanco', 'Azul'],
    variants: [
      { id: 1, size: '38', color: 'Negro', stock: 3 },
      { id: 2, size: '39', color: 'Negro', stock: 5 },
      { id: 3, size: '40', color: 'Negro', stock: 2 },
    ]
  },
  // Add more mock products as needed
];

const mockCart = {
  id: 1,
  userId: 'user-123',
  items: [
    {
      id: 1,
      productId: 1,
      quantity: 1,
      size: '39',
      color: 'Negro',
      product: {
        id: 1,
        name: 'Zapatilla Deportiva',
        price: 19990,
        image: '/images/shoe1.jpg'
      }
    }
  ]
};

// Mock API handlers
export const handlers = [
  // Get cart
  rest.get('/api/cart', (req, res, ctx) => {
    return res(ctx.json(mockCart));
  }),
  
  // Update cart
  rest.post('/api/cart', async (req, res, ctx) => {
    const { items } = await req.json();
    
    // Validate items
    const validatedItems = items.map((item: any) => {
      const product = mockProducts.find(p => p.id === item.productId);
      if (!product) {
        return res(
          ctx.status(400),
          ctx.json({ error: `Producto no encontrado: ${item.productId}` })
        );
      }
      
      const variant = product.variants.find(
        (v: any) => v.size === item.size && v.color === item.color
      );
      
      if (!variant || variant.stock < item.quantity) {
        return res(
          ctx.status(400),
          ctx.json({ error: 'No hay suficiente stock disponible' })
        );
      }
      
      return {
        ...item,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image
        }
      };
    });
    
    // Update mock cart
    mockCart.items = validatedItems;
    
    return res(ctx.json(mockCart));
  }),
  
  // Get product details
  rest.get('/api/products/:id', (req, res, ctx) => {
    const product = mockProducts.find(p => p.id === Number(req.params.id));
    
    if (!product) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Producto no encontrado' })
      );
    }
    
    return res(ctx.json(product));
  })
];

export const server = setupServer(...handlers);
