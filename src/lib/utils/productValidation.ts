import { prisma } from '$lib/server/prisma';

type StockCheck = {
  productId: number;
  size: string;
  color: string;
  quantity: number;
};

export async function checkProductAvailability(items: StockCheck[]) {
  const productIds = [...new Set(items.map(item => item.productId))];
  
  // Get all products with their variants
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      stock: true,
      sizes: true,
      colors: true,
      variants: {
        select: {
          id: true,
          size: true,
          color: true,
          stock: true
        }
      }
    }
  });

  const errors: string[] = [];
  const availableItems = [];
  
  for (const item of items) {
    const product = products.find(p => p.id === item.productId);
    
    if (!product) {
      errors.push(`El producto con ID ${item.productId} no existe`);
      continue;
    }
    
    // Check if size is available
    if (!product.sizes.includes(item.size)) {
      errors.push(`El talle ${item.size} no está disponible para el producto ${product.id}`);
      continue;
    }
    
    // Check if color is available
    if (!product.colors.includes(item.color)) {
      errors.push(`El color ${item.color} no está disponible para el producto ${product.id}`);
      continue;
    }
    
    // Find the specific variant
    const variant = product.variants.find(
      v => v.size === item.size && v.color === item.color
    );
    
    if (!variant) {
      errors.push(`No se encontró la variante con talle ${item.size} y color ${item.color} para el producto ${product.id}`);
      continue;
    }
    
    // Check stock
    if (variant.stock < item.quantity) {
      errors.push(`Solo quedan ${variant.stock} unidades disponibles para el producto ${product.id} en talle ${item.size} y color ${item.color}`);
      continue;
    }
    
    // If we got here, the item is available
    availableItems.push({
      ...item,
      availableStock: variant.stock
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    availableItems
  };
}

// Helper function to validate a single item
export async function validateCartItem(productId: number, size: string, color: string, quantity: number) {
  const result = await checkProductAvailability([{ productId, size, color, quantity }]);
  return {
    isValid: result.isValid,
    error: result.errors[0] || null,
    availableStock: result.availableItems[0]?.availableStock || 0
  };
}
