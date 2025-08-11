# Plan de Desarrollo — ecommerce-zapatillas

Este plan describe todas las etapas para construir el sistema desde 0% hasta 100%, con checklist de tareas.  
Las tareas marcadas con [ ] están pendientes, [x] completadas.

## 1. Preparación del entorno
- [x] Definir stack tecnológico (SvelteKit 2, Svelte 5, Prisma, PostgreSQL, Docker, Tailwind CSS 4)
- [x] Crear repositorio inicial
- [x] Configurar entorno Docker (PostgreSQL, MinIO)
- [x] Configurar Prisma y base de datos
- [x] Crear estructura de carpetas base
- [x] Agregar README.md inicial

## 2. Base de datos y ORM
- [x] Definir schema.prisma completo
- [x] Configurar Prisma Client
- [x] Crear migraciones iniciales (`npx prisma migrate dev --name init`)
- [x] Configurar relaciones entre modelos
- [x] Preparar scripts de seed (`prisma/seed.ts`)
- [x] Probar conexión a DB en local
- [x] Configurar variables de entorno para desarrollo local

## 3. Backend (SvelteKit endpoints)
- [x] Configurar autenticación (JWT implementado)
- [x] Endpoints públicos: listar productos, ver producto
- [x] Endpoints carrito: agregar, quitar, actualizar
- [x] Endpoint checkout: crear orden
- [ ] Webhook Mercado Pago (`src/routes/api/webhooks/mercadopago/+server.ts`)
- [x] Endpoints admin protegidos (middleware en `hooks.server.ts`)

## 4. Frontend — UX/UI
- [x] Layout base + Tailwind config
- [x] Página Home (`src/routes/+page.svelte`)
- [x] Página catálogo con filtros (`src/routes/productos/+page.svelte`)
- [x] Página detalle de producto (`src/routes/productos/[slug]/+page.svelte`)
- [x] Carrito persistente (`src/lib/cart.ts`)
- [x] Checkout y confirmación (`src/routes/checkout/+page.svelte`)
- [x] Área de usuario (pedidos, direcciones, favoritos)
- [x] Panel Admin CRUD (productos, órdenes, cupones)

## 5. Funcionalidades clave
- [ ] Búsqueda con PostgreSQL full-text (`src/routes/buscar/+page.svelte` + query Prisma raw)
- [ ] Comparador de talles
- [ ] Notificaciones de reposición
- [ ] Dark mode (Tailwind + toggle persistente)
- [x] Validación Zod en formularios (`src/lib/zod-schemas.ts`)

## 6. Seguridad y rendimiento
- [x] Middleware de autenticación (`hooks.server.ts`)
- [ ] Rate limiting en rutas sensibles (Redis o in-memory store)
- [ ] Sanitización de datos en endpoints
- [ ] Configuración de cache HTTP y SvelteKit
- [ ] Optimización de imágenes (MinIO + sharp)

## 7. SEO y analítica
- [ ] Metadatos y Open Graph (`+layout.ts` y `+page.ts`)
- [ ] Sitemap y RSS
- [ ] Integrar Plausible o Google Analytics 4

## 8. Testing y calidad
- [ ] Tests unitarios (Vitest)
- [ ] Tests E2E (Playwright)
- [x] Linter y formateo automático (ESLint + Prettier)
- [ ] Configuración CI/CD (GitHub Actions o GitLab CI)

## 9. Despliegue
- [ ] Configurar variables en producción
- [ ] Desplegar en VPS/Kubernetes
- [ ] Probar integraciones en producción (pagos, envíos, emails)

## 10. Extras futuros
- [ ] Recomendaciones con embeddings (IA)
- [ ] CMS headless para contenido (ej. Strapi, Sanity)
- [ ] Multi-moneda
- [ ] Integración logística (Andreani, Correo Argentino, etc.)
