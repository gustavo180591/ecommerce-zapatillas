# Configuración de Prisma para el Ecommerce

## Descripción General

Este proyecto utiliza Prisma como ORM para manejar la base de datos PostgreSQL. El esquema está simplificado para facilitar el desarrollo y mantenimiento del ecommerce de zapatillas.

## Modelos de Base de Datos

### 🏪 **Entidades Principales**

#### **Product**
- `id`: Identificador único (autoincrement)
- `name`: Nombre del producto
- `price`: Precio en formato Float
- `image`: URL de la imagen principal
- `sizes`: Array de tallas disponibles (ej: ["38", "39", "40"])
- `colors`: Array de colores disponibles (ej: ["Negro", "Blanco"])
- `stock`: Cantidad total en stock
- `createdAt`: Fecha de creación

#### **Order**
- `id`: Identificador único (autoincrement)
- `userId`: ID del usuario que realizó la orden
- `products`: JSON con lista de productos (ID, cantidad, talla, color)
- `total`: Total de la orden
- `status`: Estado de la orden (ej: "pendiente", "enviado")
- `createdAt`: Fecha de creación

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
DATABASE_URL="postgresql://usuario:contraseña@localhost:5435/ecommerce_zapatillas"
```

## Estructura del Esquema

### Características del Diseño Simplificado
- **IDs autoincrement**: Uso de enteros para IDs más simples
- **Arrays para tallas y colores**: Fácil manejo de variantes
- **JSON para productos en órdenes**: Flexibilidad en la estructura de datos
- **Sin relaciones complejas**: Diseño más directo y fácil de mantener

### Ventajas del Esquema Simplificado
- ✅ **Fácil de entender**: Menos modelos y relaciones
- ✅ **Rápido de implementar**: Menos complejidad
- ✅ **Flexible**: JSON permite estructuras dinámicas
- ✅ **Mantenible**: Menos código para mantener

## Datos de Ejemplo

El seed incluye:
- **5 productos**: Nike Air Max 270, Adidas Ultraboost 22, Puma RS-X, New Balance 574, Nike LeBron 19
- **2 órdenes**: Ejemplos de pedidos con diferentes productos
- **Múltiples tallas y colores**: Arrays con opciones variadas

## Uso en SvelteKit

### Importar el Cliente
```typescript
import { prisma } from '$lib/prisma';
```

### Ejemplos de Consultas
```typescript
// Obtener todos los productos
const products = await prisma.product.findMany();

// Obtener producto por ID
const product = await prisma.product.findUnique({
  where: { id: 1 }
});

// Obtener productos con stock disponible
const availableProducts = await prisma.product.findMany({
  where: {
    stock: {
      gt: 0
    }
  }
});

// Obtener órdenes de un usuario
const userOrders = await prisma.order.findMany({
  where: {
    userId: 1
  }
});

// Crear nueva orden
const newOrder = await prisma.order.create({
  data: {
    userId: 1,
    products: [
      { productId: 1, quantity: 2, size: '40', color: 'Negro' }
    ],
    total: 259.98,
    status: 'pendiente'
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

## Estructura de Datos JSON

### Formato de Productos en Órdenes
```json
[
  {
    "productId": 1,
    "quantity": 2,
    "size": "40",
    "color": "Negro"
  },
  {
    "productId": 3,
    "quantity": 1,
    "size": "41",
    "color": "Blanco"
  }
]
```

### Formato de Tallas y Colores
```typescript
// Tallas disponibles
sizes: ["38", "39", "40", "41", "42", "43"]

// Colores disponibles
colors: ["Negro", "Blanco", "Gris", "Azul", "Rojo"]
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
5. Implementar funcionalidades de carrito y checkout 