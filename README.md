# ecommerce-zapatillas

> Objetivo: lanzar una tienda de zapatillas/indumentaria con UX moderna, base de datos sólida, checkout ágil y diferenciadores claros, usando **SvelteKit 2 + Svelte 5**, **Prisma**, **PostgreSQL**, **Docker** y **Tailwind CSS 4**. Inspirado en referencias del mercado, pero 100% original.

---

## 1) Principios de diseño
- **Originalidad**: estética y contenido propios; cero copia literal.
- **Performance**: SSR + cachés, imágenes optimizadas, CDN y edge donde sume.
- **Escalabilidad**: modelo de datos extensible y versionado con migraciones.
- **DX**: entorno Docker reproducible; seeds, scripts y CI desde el día 1.
- **Accesibilidad**: WCAG AA mínima y componentes semánticos.
- **Seguridad**: JWT/Session HttpOnly, CSRF, validación Zod en borde.

---

## 2) Mapa funcional (MVP)
- **Home**: hero, categorías destacadas, novedades, promos, testimonios.
- **Catálogo** `/productos`: filtros (categoría, talle, color, precio), orden y paginación.
- **Ficha** `/productos/[slug]`: galería, variantes (talle/color), stock por variante, guía de talles, productos sugeridos.
- **Búsqueda** `/buscar`: full‑text (Postgres) con sugerencias.
- **Carrito** persistente (anónimo + logueado), recuperación server‑side.
- **Checkout**: datos, envío, pago (AR: Mercado Pago/transferencia), confirmación.
- **Cuenta** `/cuenta`: pedidos, direcciones, favoritos, devoluciones.
- **Admin** `/admin`: CRUD de productos, stock, órdenes, cupones.
- **Contenido**: guía de talles, envíos/devoluciones, contacto, mayoristas.

**Diferenciadores rápidos**
- Recomendador básico ("también te puede gustar").
- Comparador de talles equivalente entre marcas/modelos.
- Notificaciones de reposición por variante (talle/color).

---

## 3) Arquitectura
- **Frontend/SSR**: SvelteKit 2 (Svelte 5 runes), rutas + load() para datos.
- **Backend**: Endpoints SvelteKit + Prisma para capa de datos.
- **DB**: PostgreSQL.
- **Auth**: Lucia/Auth.js (sessions HttpOnly) + Roles (admin, staff, cliente).
- **Pago**: SDK oficial de Mercado Pago (modo test/producción).
- **Archivos/Imágenes**: almacenamiento S3‑compatible (MinIO o provider).
- **Infra**: Docker Compose dev; despliegue en VPS/Kubernetes más adelante.

---

## 4) Estructura de carpetas (monorepo simple)
```plaintext
ecommerce-zapatillas/
├─ docker/
│  ├─ postgres/
│  │  └─ init.sql v
│  └─ minio/
├─ prisma/
│  ├─ schema.prisma v
│  └─ seeds/
│     └─ seed.ts v
├─ src/
│  ├─ lib/
│  │  ├─ db.ts v
│  │  ├─ auth.ts v
│  │  ├─ zod-schemas.ts v
│  │  ├─ cart.ts v
│  │  └─ payments.ts v
│  ├─ routes/
│  │  ├─ +layout.svelte v
│  │  ├─ +layout.ts v
│  │  ├─ +page.svelte v
│  │  ├─ productos/
│  │  │  ├─ +page.svelte v
│  │  │  └─ [slug]/+page.svelte v
│  │  ├─ buscar/+page.svelte
│  │  ├─ carrito/+page.svelte
│  │  ├─ checkout/
│  │  │  ├─ +page.svelte
│  │  │  └─ success/+page.svelte
│  │  ├─ cuenta/
│  │  │  ├─ +layout.svelte
│  │  │  ├─ +page.svelte
│  │  │  ├─ pedidos/+page.svelte
│  │  │  └─ direcciones/+page.svelte
│  │  ├─ admin/
│  │  │  ├─ +layout.svelte
│  │  │  ├─ productos/+page.svelte
│  │  │  ├─ ordenes/+page.svelte
│  │  │  └─ cupones/+page.svelte
│  │  └─ api/
│  │     ├─ auth/
│  │     │  ├─ login/+server.ts v
│  │     │  └─ logout/+server.ts v
│  │     ├─ cart/+server.ts v
│  │     ├─ checkout/+server.ts v
│  │     └─ webhooks/
│  │        └─ mercadopago/+server.ts v
│  ├─ hooks.server.ts v
│  └─ app.d.ts v
├─ static/
├─ .env.example v
├─ docker-compose.yml v
├─ package.json
└─ README.md v

```

---

## 5) Docker Compose (dev)
```yaml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
      POSTGRES_DB: ecommerce
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
  web:
    build: .
    command: npm run dev
    env_file:
      - .env
    ports:
      - "5173:5173"
    depends_on:
      - db
volumes:
  db_data:
  minio_data:
```

---

## 6) Variables de entorno (.env)
```env
DATABASE_URL="postgresql://app:app@localhost:5432/ecommerce?schema=public"
AUTH_SECRET="cambia-esto"
MP_ACCESS_TOKEN="TEST-..."
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="minio"
S3_SECRET_KEY="minio123"
S3_BUCKET="ecommerce-media"
```

---

## 7) Prisma: modelo base (resumen)
*(Ver contenido completo en blueprint original)*

---

## 8) Comandos útiles
```bash
yarn || npm i
docker compose up -d
npx prisma migrate dev
npx prisma db seed
npm run dev
```