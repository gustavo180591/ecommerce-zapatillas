# Configuración de Prisma para el Ecommerce

## Descripción General

Este proyecto utiliza Prisma como ORM para manejar la base de datos PostgreSQL. El esquema incluye todos los modelos necesarios para un ecommerce de zapatillas.

## Modelos de Base de Datos

### 🏪 **Entidades Principales**
- **User**: Usuarios del sistema (clientes y administradores)
- **Product**: Productos (zapatillas) con información detallada
- **Category**: Categorías de productos (Running, Basketball, etc.)
- **Brand**: Marcas de zapatillas (Nike, Adidas, etc.)
- **Order**: Órdenes de compra
- **OrderItem**: Items individuales en cada orden

### 📏 **Gestión de Tallas**
- **Size**: Definición de tallas (US, EU, UK)
- **ProductSize**: Relación producto-talla con stock específico

### 📍 **Información de Usuario**
- **Address**: Direcciones de envío de usuarios
- **Review**: Reseñas de productos

## Comandos de Base de Datos

### 🔧 **Configuración Inicial**
```bash
# Generar el cliente de Prisma
npm run db:generate

# Sincronizar esquema con la base de datos
npm run db:push

# Crear y aplicar migraciones
npm run db:migrate
```

### 🌱 **Poblar Datos**
```bash
# Ejecutar seed con datos de ejemplo
npm run db:seed
```

### 🖥️ **Interfaz Visual**
```bash
# Abrir Prisma Studio
npm run db:studio
```

## Variables de Entorno

Asegúrate de tener configurada la variable `DATABASE_URL` en tu archivo `.env`:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/ecommerce_zapatillas"
```

## Estructura del Esquema

### Relaciones Principales
- **Product** → **Category** (muchos a uno)
- **Product** → **Brand** (muchos a uno)
- **Product** ↔ **Size** (muchos a muchos a través de ProductSize)
- **User** → **Order** (uno a muchos)
- **Order** → **OrderItem** (uno a muchos)
- **Product** → **Review** (uno a muchos)

### Características Especiales
- **Stock por talla**: Cada producto puede tener stock diferente por talla
- **Precios de oferta**: Campo `salePrice` para descuentos
- **Múltiples imágenes**: Array de URLs para cada producto
- **Estados de orden**: Enum con diferentes estados de pedido
- **Roles de usuario**: USER y ADMIN

## Datos de Ejemplo

El seed incluye:
- **4 categorías**: Running, Basketball, Casual, Soccer
- **4 marcas**: Nike, Adidas, Puma, New Balance
- **5 tallas**: US 7-11 con equivalencias EU/UK
- **4 productos**: Zapatillas de ejemplo con imágenes
- **1 usuario admin**: admin@ecommerce.com

## Uso en SvelteKit

### Importar el Cliente
```typescript
import { prisma } from '$lib/prisma';
```

### Ejemplos de Consultas
```typescript
// Obtener productos con categoría y marca
const products = await prisma.product.findMany({
  include: {
    category: true,
    brand: true,
    sizes: {
      include: {
        size: true
      }
    }
  }
});

// Obtener productos por categoría
const runningShoes = await prisma.product.findMany({
  where: {
    category: {
      name: 'Running'
    }
  }
});

// Obtener stock de un producto por talla
const stock = await prisma.productSize.findFirst({
  where: {
    productId: 'product-id',
    size: {
      name: 'US 9'
    }
  }
});
```

## Migraciones

### Crear Nueva Migración
```bash
npm run db:migrate
```

### Aplicar Migraciones Existentes
```bash
npx prisma migrate deploy
```

### Resetear Base de Datos
```bash
npx prisma migrate reset
```

## Troubleshooting

### Problemas Comunes
1. **Error de conexión**: Verificar `DATABASE_URL` en `.env`
2. **Esquema desactualizado**: Ejecutar `npm run db:generate`
3. **Datos corruptos**: Ejecutar `npm run db:seed` para repoblar

### Logs de Prisma
```bash
# Habilitar logs detallados
export DEBUG="prisma:*"
npm run db:seed
```

## Próximos Pasos

1. Configurar base de datos PostgreSQL
2. Ejecutar migraciones iniciales
3. Poblar con datos de ejemplo
4. Integrar con la aplicación SvelteKit 