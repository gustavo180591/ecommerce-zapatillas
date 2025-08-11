# Plan de Desarrollo — ecommerce-zapatillas

Este plan describe todas las etapas para construir el sistema desde 0% hasta 100%, con checklist de tareas.

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
- [x] Crear migraciones iniciales
- [x] Configurar relaciones entre modelos
- [x] Preparar scripts de seed
- [x] Probar conexión a DB en local
- [x] Configurar variables de entorno para desarrollo local

## 3. Backend (SvelteKit endpoints)
- [x] Configurar autenticación (Lucia/Auth.js)
- [x] Endpoints públicos: listar productos, ver producto
- [ ] Endpoints carrito: agregar, quitar, actualizar
- [ ] Endpoint checkout: crear orden y preferencia MP
- [ ] Webhook Mercado Pago
- [ ] Endpoints admin protegidos

## 4. Frontend — UX/UI
- [x] Layout base + Tailwind config
- [ ] Página Home
- [ ] Página catálogo con filtros
- [ ] Página detalle de producto
- [ ] Carrito persistente
- [ ] Checkout y confirmación
- [ ] Área de usuario (pedidos, direcciones, favoritos)
- [ ] Panel Admin CRUD

## 5. Funcionalidades clave
- [ ] Búsqueda con PostgreSQL full-text
- [ ] Comparador de talles
- [ ] Notificaciones de reposición
- [ ] Dark mode
- [x] Validación Zod en formularios

## 6. Seguridad y rendimiento
- [x] Middleware de autenticación
- [ ] Rate limiting en rutas sensibles
- [ ] Sanitización de datos
- [ ] Configuración de cache
- [ ] Optimización de imágenes

## 7. SEO y analítica
- [ ] Metadatos y Open Graph
- [ ] Sitemap y RSS
- [ ] Integrar Plausible/GA4

## 8. Testing y calidad
- [ ] Tests unitarios (Vitest)
- [ ] Tests E2E (Playwright)
- [x] Linter y formateo automático
- [ ] Configuración CI/CD

## 9. Despliegue
- [ ] Configurar variables en producción
- [ ] Desplegar en VPS/Kubernetes
- [ ] Probar integraciones en producción

## 10. Extras futuros
- [ ] Recomendaciones con embeddings
- [ ] CMS headless para contenido
- [ ] Multi-moneda
- [ ] Integración logística
