// src/app.d.ts
// Este archivo extiende los tipos globales de SvelteKit

import type { PrismaClient, User } from '@prisma/client';

declare global {
	namespace App {
		// Lo que guardamos en locals (disponible en load() server y endpoints)
		interface Locals {
			user: User | null; // Usuario autenticado
			prisma: PrismaClient; // Instancia Prisma para DB
		}

		// Datos que podemos devolver en load()
		interface PageData {
			user?: User | null;
			flash?: { type: 'success' | 'error'; message: string };
		}

		// Si usás sessionStorage/cookies
		interface Session {
			user?: Pick<User, 'id' | 'email' | 'name'>;
		}

		// Parámetros dinámicos de rutas
		interface PageParams {
			slug?: string;
			id?: string;
		}

		// Para env variables públicas
		// Variables que empiezan con PUBLIC_ están disponibles en el cliente
		interface PublicEnv {
			PUBLIC_API_URL: string;
		}
	}
}

export {};
