import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Iniciando seed de la base de datos...');

	// Crear productos de ejemplo
	const products = await Promise.all([
		prisma.product.upsert({
			where: { id: 1 },
			update: {},
			create: {
				id: 1,
				name: 'Nike Air Max 270',
				price: 129.99,
				image: '/images/products/nike-air-max-270.jpg',
				sizes: ['38', '39', '40', '41', '42', '43'],
				colors: ['Negro', 'Blanco', 'Gris'],
				stock: 50
			}
		}),
		prisma.product.upsert({
			where: { id: 2 },
			update: {},
			create: {
				id: 2,
				name: 'Adidas Ultraboost 22',
				price: 179.99,
				image: '/images/products/adidas-ultraboost-22.jpg',
				sizes: ['39', '40', '41', '42', '43', '44'],
				colors: ['Negro', 'Azul', 'Blanco'],
				stock: 30
			}
		}),
		prisma.product.upsert({
			where: { id: 3 },
			update: {},
			create: {
				id: 3,
				name: 'Puma RS-X',
				price: 89.99,
				image: '/images/products/puma-rs-x.jpg',
				sizes: ['38', '39', '40', '41', '42'],
				colors: ['Negro', 'Blanco', 'Rojo'],
				stock: 40
			}
		}),
		prisma.product.upsert({
			where: { id: 4 },
			update: {},
			create: {
				id: 4,
				name: 'New Balance 574',
				price: 99.99,
				image: '/images/products/new-balance-574.jpg',
				sizes: ['39', '40', '41', '42', '43', '44'],
				colors: ['Gris', 'Azul', 'Negro'],
				stock: 35
			}
		}),
		prisma.product.upsert({
			where: { id: 5 },
			update: {},
			create: {
				id: 5,
				name: 'Nike LeBron 19',
				price: 199.99,
				image: '/images/products/nike-lebron-19.jpg',
				sizes: ['40', '41', '42', '43', '44', '45'],
				colors: ['Negro', 'Dorado', 'Blanco'],
				stock: 25
			}
		})
	]);

	// Crear órdenes de ejemplo
	const orders = await Promise.all([
		prisma.order.upsert({
			where: { id: 1 },
			update: {},
			create: {
				id: 1,
				userId: 1,
				products: [
					{ productId: 1, quantity: 2, size: '40', color: 'Negro' },
					{ productId: 3, quantity: 1, size: '41', color: 'Blanco' }
				],
				total: 349.97,
				status: 'pendiente'
			}
		}),
		prisma.order.upsert({
			where: { id: 2 },
			update: {},
			create: {
				id: 2,
				userId: 2,
				products: [
					{ productId: 2, quantity: 1, size: '42', color: 'Azul' }
				],
				total: 179.99,
				status: 'enviado'
			}
		})
	]);

	console.log('✅ Seed completado exitosamente!');
	console.log(`📊 Creados: ${products.length} productos, ${orders.length} órdenes`);
}

main()
	.catch((e) => {
		console.error('❌ Error durante el seed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	}); 