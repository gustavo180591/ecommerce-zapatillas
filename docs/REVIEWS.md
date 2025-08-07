# Sistema de Reseñas - Documentación

## Tabla de Contenidos
- [Componentes](#componentes)
  - [ReviewList](#reviewlist)
  - [ReviewItem](#reviewitem)
  - [ReviewForm](#reviewform)
  - [ReviewSummary](#reviewsummary)
  - [RatingDisplay](#ratingdisplay)
- [API](#api)
  - [Obtener Reseñas](#obtener-reseñas)
  - [Crear Reseña](#crear-reseña)
  - [Actualizar Estado de Reseña](#actualizar-estado-de-reseña)
  - [Eliminar Reseña](#eliminar-reseña)
  - [Marcar como Útil](#marcar-como-útil)
  - [Obtener Resumen de Reseñas](#obtener-resumen-de-reseñas)

## Componentes

### ReviewList
Muestra una lista paginada de reseñas.

**Props:**
- `productId: string` - ID del producto (opcional, para filtrar por producto)
- `initialReviews: Review[]` - Lista inicial de reseñas
- `initialHasMore: boolean` - Indica si hay más reseñas por cargar
- `showProductInfo: boolean` - Muestra la información del producto (por defecto: false)

**Uso:**
```svelte
<script>
  import { ReviewList } from '$lib/components/reviews';
</script>

<ReviewList 
  productId="123" 
  initialReviews={[]} 
  initialHasMore={false} 
/>
```

### ReviewItem
Muestra una reseña individual.

**Props:**
- `review: Review` - Objeto de la reseña
- `editable: boolean` - Permite edición (por defecto: false)
- `onUpdate: (updatedReview: Review) => void` - Callback al actualizar
- `onDelete: (reviewId: string) => void` - Callback al eliminar

### ReviewForm
Formulario para crear o editar una reseña.

**Props:**
- `productId: string` - ID del producto
- `existingReview?: Review` - Reseña existente para edición (opcional)
- `onSubmit: (review: ReviewFormData) => Promise<void>` - Callback al enviar

### ReviewSummary
Muestra un resumen de las valoraciones de un producto.

**Props:**
- `averageRating: number` - Puntuación media (1-5)
- `totalReviews: number` - Número total de reseñas
- `ratingDistribution: Record<number, number>` - Distribución de puntuaciones
- `onFilterByRating?: (rating: number) => void` - Callback al filtrar por puntuación

### RatingDisplay
Muestra las estrellas de valoración.

**Props:**
- `rating: number` - Valoración (0-5)
- `size?: 'sm' | 'md' | 'lg'` - Tamaño del componente
- `readonly?: boolean` - Modo solo lectura (por defecto: true)
- `onRate?: (rating: number) => void` - Callback al valorar

## API

### Obtener Reseñas
Obtiene una lista paginada de reseñas con filtros opcionales.

**Endpoint:** `GET /api/reviews`

**Parámetros de consulta:**
- `productId?: string` - Filtrar por producto
- `status?: ReviewStatus` - Filtrar por estado (PENDING, APPROVED, REJECTED)
- `search?: string` - Buscar en título o comentario
- `page?: number` - Página actual (por defecto: 1)
- `limit?: number` - Resultados por página (por defecto: 10)

**Respuesta:**
```typescript
{
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}
```

### Crear Reseña
Crea una nueva reseña para un producto.

**Endpoint:** `POST /api/reviews`

**Cuerpo de la petición:**
```typescript
{
  productId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  images?: File[]; // Imágenes opcionales
}
```

**Respuesta:**
```typescript
{
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  // ...otros campos de la reseña
}
```

### Actualizar Estado de Reseña
Actualiza el estado de una reseña (solo administradores).

**Endpoint:** `PATCH /api/reviews/:id/status`

**Cuerpo de la petición:**
```typescript
{
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
}
```

### Eliminar Reseña
Elimina una reseña (solo administradores).

**Endpoint:** `DELETE /api/reviews/:id`

### Marcar como Útil
Marca una reseña como útil o quita el voto.

**Endpoint:** `POST /api/reviews/:id/helpful`

**Respuesta:**
```typescript
{
  voted: boolean; // true si se agregó el voto, false si se quitó
  helpfulCount: number; // Nuevo contador de votos
}
```

### Obtener Resumen de Reseñas
Obtiene estadísticas de reseñas para un producto.

**Endpoint:** `GET /api/products/:productId/reviews/summary`

**Respuesta:**
```typescript
{
  averageRating: number; // 0-5
  totalReviews: number;
  ratingDistribution: {
    1: number; // Cantidad de reseñas con 1 estrella
    2: number; // Cantidad de reseñas con 2 estrellas
    3: number; // Cantidad de reseñas con 3 estrellas
    4: number; // Cantidad de reseñas con 4 estrellas
    5: number; // Cantidad de reseñas con 5 estrellas
  };
}
```

## Tipos

```typescript
interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: Array<{ url: string }>;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  images: Array<{
    id: string;
    url: string;
  }>;
  _count?: {
    helpfulVotes: number;
  };
}
```

## Consideraciones de Seguridad

1. Solo los usuarios autenticados pueden crear reseñas
2. Los usuarios solo pueden editar/eliminar sus propias reseñas
3. Solo los administradores pueden cambiar el estado de las reseñas
4. Las reseñas con imágenes están sujetas a moderación automática
5. Se aplica rate limiting para evitar spam
