# 🚀 E-commerce de Zapatillas - Proyecto Full Stack

## 🎯 Visión General
Plataforma de comercio electrónico especializada en zapatillas, construida con tecnologías modernas para ofrecer una experiencia de compra excepcional.

## 🎯 Buyer Persona
- **Edad**: 16 a 35 años
- **Perfiles**:
  - Fanáticos de sneakers
  - Coleccionistas
  - Deportistas urbanos
  - Entusiastas de moda urbana

## 🚀 MVP (Producto Mínimo Viable)
- Catálogo de productos con talles y stock
- Carrito de compras persistente
- Registro/Login seguro
- Checkout con MercadoPago o Stripe
- Panel administrativo mínimo

## ✨ Diferenciadores
- UX fluida y minimalista
- Enfoque mobile-first
- Experiencia visual atractiva
- Rendimiento óptimo

## 🏗️ Arquitectura del Sistema

### 🛠️ Stack Tecnológico
- **Frontend**: SvelteKit 2 + Svelte 5
- **Estilos**: Tailwind CSS 4
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma
- **Autenticación**: JWT + cookies seguras
- **Pagos**: Stripe/MercadoPago
- **Infraestructura**: Docker

### 📁 Estructura de Carpetas
```
/apps
  /web                # Frontend SvelteKit
  /api                # Backend opcional
/packages
  /ui                 # Componentes UI compartidos
/prisma              # Schema + migraciones
/docker              # Configuración Docker
```

## 🗄️ Modelo de Datos (Prisma)

### Entidades Principales
- **User**: Gestión de usuarios y autenticación
- **Product**: Catálogo de productos
- **Category**: Categorías de productos
- **Stock**: Control de inventario
- **Cart**:## 🛒 Carrito de Compras

### Características Principales

- **Persistencia**: El carrito se guarda automáticamente en el localStorage del navegador
- **Sincronización**: Se sincroniza con el servidor cuando el usuario inicia sesión
- **Validación en Tiempo Real**: Verificación de stock y talles disponibles
- **Interfaz de Usuario Intuitiva**: Fácil de usar en dispositivos móviles y escritorio

### Componentes Principales

1. **CartStore** (`src/lib/stores/cart.ts`)
   - Gestión centralizada del estado del carrito
   - Sincronización con la API
   - Validación de stock

2. **CartDrawer** (`src/lib/components/CartDrawer.svelte`)
   - Vista deslizable del carrito
   - Lista de productos
   - Resumen de compra

3. **CartItem** (`src/lib/components/CartItem.svelte`)
   - Elemento individual del carrito
   - Selector de cantidad
   - Eliminación de productos

4. **CartButton** (`src/lib/components/CartButton.svelte`)
   - Botón flotante del carrito
   - Contador de productos

### API del Carrito

#### Obtener Carrito
```http
GET /api/cart
```

#### Actualizar Carrito
```http
POST /api/cart
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "size": "39",
      "color": "Negro"
    }
  ]
}
```

### Flujo de Validación

1. **Al Agregar un Producto**:
   - Se verifica el stock disponible
   - Se valida que el talle esté disponible
   - Se actualiza la interfaz de usuario

2. **Al Actualizar Cantidad**:
   - Se verifica que la nueva cantidad no supere el stock
   - Se actualiza el total del carrito

3. **Al Iniciar Sesión**:
   - Se combina el carrito local con el del usuario
   - Se resuelven conflictos de stock

### Manejo de Errores

- **Sin Stock**: Muestra un mensaje claro al usuario
- **Talle No Disponible**: Ofrece alternativas
- **Error de Red**: Reintenta la operación automáticamente

### Personalización

Puedes personalizar el comportamiento del carrito a través de las opciones del store:

```typescript
const cart = createCartStore({
  storageKey: 'my-cart',
  maxItems: 50,
  syncOnAuth: true
});
```

### Integración con Checkout

El carrito se integra directamente con el proceso de pago, permitiendo una transición fluida hacia el checkout.
- **Order**: Órdenes de compra
- **Payment**: Transacciones de pago

## 🎨 Diseño UI/UX
- **Enfoque**: Mobile-first
- **Temas**: Dark/Light mode
- **Accesibilidad**: Navegación con teclado, ARIA
- **Componentes clave**:
  - ProductCard
  - ProductGrid
  - Navbar
  - CarritoDrawer
  - CheckoutSteps

## 🚀 Despliegue
- **Plataformas soportadas**:
  - Vercel (SSR automático)
  - Railway
  - Render
- **Requisitos**:
  - Node.js 18+
  - PostgreSQL
  - Variables de entorno configuradas

## 🛠️ Desarrollo

### Requisitos Previos
- Node.js 18+
- pnpm
- Docker (opcional para desarrollo local)

### Instalación
```bash
# Clonar repositorio
git clone [repo-url]
cd ecommerce-zapatillas

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar base de datos (Docker)
docker-compose up -d

# Aplicar migraciones
pnpm prisma migrate dev

# Iniciar servidor de desarrollo
pnpm dev
```

## 📚 Documentación Adicional
- [Guía de Contribución](./CONTRIBUTING.md)
- [Código de Conducta](./CODE_OF_CONDUCT.md)
- [Documentación de la API](./docs/API.md)

## 📄 Licencia
MIT

## 🛠️ Configuración del Entorno

### Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de Datos
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce?schema=public"

# Autenticación
AUTH_SECRET="secreto-muy-seguro"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="secreto-nextauth"

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=""
MERCADOPAGO_PUBLIC_KEY=""
MERCADOPAGO_WEBHOOK_SECRET=""

# Stripe (opcional)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=""

# SMTP para correos
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASSWORD="password"
SMTP_FROM="no-reply@tudominio.com"

# Entorno
NODE_ENV="development"
```

## 🚀 Inicio Rápido

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/ecommerce-zapatillas.git
   cd ecommerce-zapatillas
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar base de datos**
   ```bash
   # Iniciar contenedor de PostgreSQL
   docker-compose up -d
   
   # Aplicar migraciones
   pnpm prisma migrate dev
   
   # Poblar datos iniciales
   pnpm prisma db seed
   ```

4. **Iniciar servidor de desarrollo**
   ```bash
   pnpm dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 📦 Scripts Disponibles

- `dev`: Inicia el servidor de desarrollo
- `build`: Compila para producción
- `start`: Inicia el servidor de producción
- `lint`: Ejecuta ESLint
- `format`: Formatea el código con Prettier
- `prisma:generate`: Genera cliente de Prisma
- `prisma:migrate`: Ejecuta migraciones
- `prisma:studio`: Abre el cliente visual de Prisma
- `test`: Ejecuta pruebas unitarias
- `test:watch`: Ejecuta pruebas en modo watch
- `test:coverage`: Genera informe de cobertura
- `test:e2e`: Ejecuta pruebas end-to-end
- `test:e2e:ui`: Abre el inspector de pruebas E2E
- `test:e2e:report`: Genera reporte HTML de pruebas E2E

## 🧪 Testing

### Configuración de Pruebas

El proyecto incluye un conjunto completo de pruebas unitarias, de integración y end-to-end para garantizar la calidad del código y la funcionalidad del carrito de compras.

#### Prerequisitos
- Node.js 18+
- Navegadores compatibles con Playwright (se instalan automáticamente)

#### Estructura de Pruebas
```
tests/
  cart.spec.ts           # Pruebas E2E del flujo del carrito
src/
  lib/
    components/
      __tests__/         # Pruebas unitarias de componentes
        CartItem.test.tsx
        CartButton.test.tsx
        CartDrawer.test.tsx
    stores/
      __tests__/         # Pruebas del store del carrito
        cart.test.ts
    mocks/               # Datos y servidor mock para pruebas
      server.ts
      data.ts
```

#### Ejecutando las Pruebas

1. **Pruebas Unitarias**
   ```bash
   # Ejecutar todas las pruebas unitarias
   pnpm test
   
   # Ejecutar pruebas en modo watch
   pnpm test:watch
   
   # Generar cobertura de código
   pnpm test:coverage
   ```

2. **Pruebas End-to-End**
   ```bash
   # Instalar navegadores para Playwright (solo primera vez)
   npx playwright install
   
   # Ejecutar pruebas E2E
   pnpm test:e2e
   
   # Abrir el inspector de pruebas
   pnpm test:e2e:ui
   
   # Generar reporte HTML
   pnpm test:e2e:report
   ```

#### Escribiendo Pruebas

1. **Pruebas Unitarias (Vitest + Testing Library)**
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/svelte';
   import { describe, it, expect, vi } from 'vitest';
   import Component from './Component.svelte';
   
   describe('Component', () => {
     it('should render correctly', () => {
       render(Component, { props: { initialCount: 0 } });
       expect(screen.getByText('Count: 0')).toBeInTheDocument();
     });
   });
   ```

2. **Pruebas E2E (Playwright)**
   ```typescript
   import { test, expect } from '@playwright/test';
   
   test('should add item to cart', async ({ page }) => {
     await page.goto('/products/1');
     await page.click('button:has-text("Add to Cart")');
     await expect(page.locator('.cart-count')).toHaveText('1');
   });
   ```

#### Mocks y Datos de Prueba

El proyecto incluye un servidor mock configurado con MSW (Mock Service Worker) para simular respuestas de la API durante las pruebas:

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/products', (req, res, ctx) => {
    return res(ctx.json(mockProducts));
  }),
  // ... más handlers
];

export const server = setupServer(...handlers);
```

#### Cobertura de Código

El proyecto incluye configuración para generar informes de cobertura de código. Ejecuta:

```bash
pnpm test:coverage
```

Esto generará un informe en `coverage/` que puedes ver en tu navegador.

### Integración Continua

El proyecto incluye configuración para GitHub Actions que ejecuta las pruebas automáticamente en cada push a las ramas principales. El flujo de trabajo incluye:

1. Instalación de dependencias
2. Ejecución de linting
3. Ejecución de pruebas unitarias
4. Ejecución de pruebas E2E
5. Subida de cobertura de código

### Depuración de Pruebas

Para depurar pruebas:

1. **Pruebas Unitarias**: Usa `console.log` o el depurador de VS Code
2. **Pruebas E2E**: Usa `page.pause()` o el inspector de Playwright

### Mejores Prácticas

1. **Nombrado de Pruebas**: Usa `should` para describir el comportamiento esperado
2. **AAA Pattern**: Organiza las pruebas en Arrange-Act-Assert
3. **Pruebas Aisladas**: Cada prueba debe ser independiente
4. **Mocks**: Usa mocks para dependencias externas
5. **Selectores**: Usa selectores accesibles (roles, texto, etc.)

### Recursos Adicionales

- [Documentación de Testing Library](https://testing-library.com/)
- [Documentación de Playwright](https://playwright.dev/)
- [Guía de Vitest](https://vitest.dev/)
- [MSW - API Mocking](https://mswjs.io/)

```bash
# Ejecutar tests unitarios
pnpm test:unit

# Ejecutar tests E2E
pnpm test:e2e

# Ejecutar tests de cobertura
pnpm test:coverage
```

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

## 📞 Contacto

Tu Nombre - [@tuusuario](https://twitter.com/tuusuario) - email@ejemplo.com

Enlace del proyecto: [https://github.com/tuusuario/ecommerce-zapatillas](https://github.com/tuusuario/ecommerce-zapatillas)

## 🙏 Agradecimientos

- [Svelte](https://svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [MercadoPago](https://www.mercadopago.com.ar/developers/es)
- [Stripe](https://stripe.com/)
