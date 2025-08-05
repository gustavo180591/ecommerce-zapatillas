import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestProduct() {
	try {
		console.log('🛍️ Agregando producto de prueba...');

		const product = await prisma.product.upsert({
			where: { id: 999 }, // ID único para el producto de prueba
			update: {
				name: 'Zapatilla Urbana',
				price: 15000,
				image: 'https://example.com/zapatilla.jpg',
				sizes: ['38', '39'],
				colors: ['Negro'],
				stock: 10
			},
			create: {
				id: 999, // ID único para el producto de prueba
				name: 'Zapatilla Urbana',
				price: 15000,
				image: 'https://example.com/zapatilla.jpg',
				sizes: ['38', '39'],
				colors: ['Negro'],
				stock: 10
			}
		});

		console.log('✅ Producto agregado exitosamente!');
		console.log('📋 Detalles del producto:');
		console.log(`   ID: ${product.id}`);
		console.log(`   Nombre: ${product.name}`);
		console.log(`   Precio: $${product.price}`);
		console.log(`   Stock: ${product.stock}`);
		console.log(`   Tallas: ${product.sizes.join(', ')}`);
		console.log(`   Colores: ${product.colors.join(', ')}`);

		return product;
	} catch (error) {
		console.error('❌ Error al agregar el producto:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

addTestProduct(); 