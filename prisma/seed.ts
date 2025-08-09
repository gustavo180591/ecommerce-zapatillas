import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Iniciando seed de la base de datos...');

	// Crear usuarios de ejemplo
	const users = await Promise.all([
		prisma.user.upsert({
			where: { id: 1 },
			update: {},
			create: {
				id: 1,
				email: 'usuario1@ejemplo.com',
				name: 'Usuario de Prueba 1',
				password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
				role: 'USER'
			}
		}),
		prisma.user.upsert({
			where: { id: 2 },
			update: {},
			create: {
				id: 2,
				email: 'usuario2@ejemplo.com',
				name: 'Usuario de Prueba 2',
				password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
				role: 'USER'
			}
		}),
		prisma.user.upsert({
			where: { id: 3 },
			update: {},
			create: {
				id: 3,
				email: 'admin@ejemplo.com',
				name: 'Administrador',
				password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
				role: 'ADMIN'
			}
		})
	]);

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
				items: {
					create: [
						{
							product: { connect: { id: 1 } },
							quantity: 2,
							size: '40',
							color: 'Negro',
							price: 129.99
						},
						{
							product: { connect: { id: 3 } },
							quantity: 1,
							size: '41',
							color: 'Blanco',
							price: 189.99
						}
					]
				},
				total: 349.97,
				subtotal: 319.97,
				tax: 30.00,
				shippingCost: 0.00,
				status: 'PENDING',
				contactInfo: {
					name: 'Cliente de Prueba',
					email: 'cliente@ejemplo.com',
					phone: '+5491122334455',
					address: 'Calle Falsa 123',
					city: 'Buenos Aires',
					country: 'Argentina',
					zipCode: 'C1234ABC'
				}
			}
		}),
		prisma.order.upsert({
			where: { id: 2 },
			update: {},
			create: {
				id: 2,
				userId: 2,
				items: {
					create: [
						{
							product: { connect: { id: 2 } },
							quantity: 1,
							size: '42',
							color: 'Azul',
							price: 159.99
						}
					]
				},
				total: 179.99,
				subtotal: 159.99,
				tax: 20.00,
				shippingCost: 0.00,
				status: 'SHIPPED',
				contactInfo: {
					name: 'Otro Cliente',
					email: 'otro@ejemplo.com',
					phone: '+5491166778899',
					address: 'Avenida Siempreviva 742',
					city: 'Córdoba',
					country: 'Argentina',
					zipCode: 'X5000'
				}
			}
		})
	]);

	console.log('✅ Seed completado exitosamente!');
	console.log(`📊 Creados: ${users.length} usuarios, ${products.length} productos, ${orders.length} órdenes`);
}

main()
	.catch((e) => {
		console.error('❌ Error durante el seed:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	}); 