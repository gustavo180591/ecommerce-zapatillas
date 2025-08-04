import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Iniciando seed de la base de datos...');

	// Crear categorías
	const categories = await Promise.all([
		prisma.category.upsert({
			where: { name: 'Running' },
			update: {},
			create: {
				name: 'Running',
				description: 'Zapatillas para correr y entrenamiento',
				image: '/images/categories/running.jpg'
			}
		}),
		prisma.category.upsert({
			where: { name: 'Basketball' },
			update: {},
			create: {
				name: 'Basketball',
				description: 'Zapatillas para baloncesto',
				image: '/images/categories/basketball.jpg'
			}
		}),
		prisma.category.upsert({
			where: { name: 'Casual' },
			update: {},
			create: {
				name: 'Casual',
				description: 'Zapatillas casuales para uso diario',
				image: '/images/categories/casual.jpg'
			}
		}),
		prisma.category.upsert({
			where: { name: 'Soccer' },
			update: {},
			create: {
				name: 'Soccer',
				description: 'Botines para fútbol',
				image: '/images/categories/soccer.jpg'
			}
		})
	]);

	// Crear marcas
	const brands = await Promise.all([
		prisma.brand.upsert({
			where: { name: 'Nike' },
			update: {},
			create: {
				name: 'Nike',
				description: 'Just Do It',
				logo: '/images/brands/nike.png'
			}
		}),
		prisma.brand.upsert({
			where: { name: 'Adidas' },
			update: {},
			create: {
				name: 'Adidas',
				description: 'Impossible is Nothing',
				logo: '/images/brands/adidas.png'
			}
		}),
		prisma.brand.upsert({
			where: { name: 'Puma' },
			update: {},
			create: {
				name: 'Puma',
				description: 'Forever Faster',
				logo: '/images/brands/puma.png'
			}
		}),
		prisma.brand.upsert({
			where: { name: 'New Balance' },
			update: {},
			create: {
				name: 'New Balance',
				description: 'Fearlessly Independent',
				logo: '/images/brands/new-balance.png'
			}
		})
	]);

	// Crear tallas
	const sizes = await Promise.all([
		prisma.size.upsert({
			where: { name: 'US 7' },
			update: {},
			create: {
				name: 'US 7',
				euSize: '40',
				ukSize: '6.5'
			}
		}),
		prisma.size.upsert({
			where: { name: 'US 8' },
			update: {},
			create: {
				name: 'US 8',
				euSize: '41',
				ukSize: '7.5'
			}
		}),
		prisma.size.upsert({
			where: { name: 'US 9' },
			update: {},
			create: {
				name: 'US 9',
				euSize: '42',
				ukSize: '8.5'
			}
		}),
		prisma.size.upsert({
			where: { name: 'US 10' },
			update: {},
			create: {
				name: 'US 10',
				euSize: '43',
				ukSize: '9.5'
			}
		}),
		prisma.size.upsert({
			where: { name: 'US 11' },
			update: {},
			create: {
				name: 'US 11',
				euSize: '44',
				ukSize: '10.5'
			}
		})
	]);

	// Crear productos
	const products = await Promise.all([
		prisma.product.upsert({
			where: { sku: 'NIKE-AIR-MAX-001' },
			update: {},
			create: {
				name: 'Nike Air Max 270',
				description: 'Zapatillas de running con tecnología Air Max para máxima comodidad',
				price: 129.99,
				salePrice: 99.99,
				sku: 'NIKE-AIR-MAX-001',
				stock: 50,
				images: [
					'/images/products/nike-air-max-270-1.jpg',
					'/images/products/nike-air-max-270-2.jpg',
					'/images/products/nike-air-max-270-3.jpg'
				],
				categoryId: categories[0].id, // Running
				brandId: brands[0].id // Nike
			}
		}),
		prisma.product.upsert({
			where: { sku: 'ADIDAS-ULTRABOOST-001' },
			update: {},
			create: {
				name: 'Adidas Ultraboost 22',
				description: 'Zapatillas de running con tecnología Boost para energía reactiva',
				price: 179.99,
				salePrice: 149.99,
				sku: 'ADIDAS-ULTRABOOST-001',
				stock: 30,
				images: [
					'/images/products/adidas-ultraboost-22-1.jpg',
					'/images/products/adidas-ultraboost-22-2.jpg'
				],
				categoryId: categories[0].id, // Running
				brandId: brands[1].id // Adidas
			}
		}),
		prisma.product.upsert({
			where: { sku: 'NIKE-LEBRON-001' },
			update: {},
			create: {
				name: 'Nike LeBron 19',
				description: 'Zapatillas de baloncesto con tecnología de amortiguación avanzada',
				price: 199.99,
				sku: 'NIKE-LEBRON-001',
				stock: 25,
				images: [
					'/images/products/nike-lebron-19-1.jpg',
					'/images/products/nike-lebron-19-2.jpg'
				],
				categoryId: categories[1].id, // Basketball
				brandId: brands[0].id // Nike
			}
		}),
		prisma.product.upsert({
			where: { sku: 'PUMA-RS-X-001' },
			update: {},
			create: {
				name: 'Puma RS-X',
				description: 'Zapatillas casuales con diseño retro y estilo urbano',
				price: 89.99,
				salePrice: 69.99,
				sku: 'PUMA-RS-X-001',
				stock: 40,
				images: [
					'/images/products/puma-rs-x-1.jpg',
					'/images/products/puma-rs-x-2.jpg'
				],
				categoryId: categories[2].id, // Casual
				brandId: brands[2].id // Puma
			}
		})
	]);

	// Crear relaciones producto-talla con stock
	for (const product of products) {
		for (const size of sizes) {
			await prisma.productSize.upsert({
				where: {
					productId_sizeId: {
						productId: product.id,
						sizeId: size.id
					}
				},
				update: {},
				create: {
					productId: product.id,
					sizeId: size.id,
					stock: Math.floor(Math.random() * 10) + 1 // Stock aleatorio entre 1-10
				}
			});
		}
	}

	// Crear usuario admin de ejemplo
	const adminUser = await prisma.user.upsert({
		where: { email: 'admin@ecommerce.com' },
		update: {},
		create: {
			email: 'admin@ecommerce.com',
			name: 'Administrador',
			password: '$2b$10$example.hash.here', // En producción usar bcrypt
			role: 'ADMIN'
		}
	});

	console.log('✅ Seed completado exitosamente!');
	console.log(`📊 Creados: ${categories.length} categorías, ${brands.length} marcas, ${sizes.length} tallas, ${products.length} productos`);
}

main()
	.catch((e) => {
		console.error('❌ Error durante el seed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	}); 