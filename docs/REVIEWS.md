# 📝 Sistema de Reseñas - Documentación Completa

> **Nota**: Este documento cubre la implementación, uso y personalización del sistema de reseñas.

## 🚀 Guía Rápida de Implementación

### 1. Instalación de Dependencias

Asegúrate de tener instaladas las dependencias necesarias:

```bash
# Dependencias principales
npm install @prisma/client date-fns

# Dependencias de UI (si usas componentes personalizados)
npm install lucide-svelte
```

### 2. Migración de Base de Datos

Ejecuta la migración para crear las tablas necesarias:

```bash
npx prisma migrate dev --name add_reviews_schema
```

## 📱 Capturas de Pantalla

### Panel de Moderación de Reseñas
![Moderación de Reseñas](/screenshots/reviews-admin.png)

### Formulario de Reseña
![Formulario de Reseña](/screenshots/review-form.png)

### Listado de Reseñas en Producto
![Reseñas en Producto](/screenshots/product-reviews.png)

## 🔧 Configuración Inicial

### 1. Configuración del Servidor

Crea un archivo de configuración para las reseñas:

```typescript
// src/lib/config/reviews.ts
export const reviewsConfig = {
  defaultPageSize: 10,
  maxImagesPerReview: 5,
  imageMaxSizeMB: 5,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  autoApproveThreshold: 4, // Reseñas con 4+ estrellas se aprueban automáticamente
};
```

### 2. Proveedor de Servicios

Crea un proveedor para los servicios de reseñas:

```typescript
// src/lib/services/reviewService.ts
import { prisma } from '../server/prisma';
import { reviewsConfig } from '../config/reviews';

export class ReviewService {
  async createReview(data: CreateReviewInput) {
    // Lógica para crear reseña
  }
  
  // Otros métodos del servicio...
}

export const reviewService = new ReviewService();
```

## 🎯 Ejemplos de Uso

### 1. Mostrar Reseñas en un Producto

```svelte
<!-- src/routes/producto/[slug]/+page.svelte -->
<script lang="ts">
  import { ReviewList, ReviewForm, ReviewSummary } from '$lib/components/reviews';
  import { page } from '$app/stores';
  
  // Obtener el ID del producto de la URL
  $: productId = $page.params.slug;
  
  // Estado del componente
  let showReviewForm = false;
  let reviews = [];
  let summary = { averageRating: 0, totalReviews: 0 };
  
  // Cargar reseñas al montar el componente
  async function loadReviews() {
    const response = await fetch(`/api/products/${productId}/reviews`);
    const data = await response.json();
    reviews = data.reviews;
    summary = data.summary;
  }
</script>

<!-- Sección de Reseñas -->
<section class="mt-12">
  <h2 class="text-2xl font-bold mb-6">Opiniones de Clientes</h2>
  
  <!-- Resumen de Valoraciones -->
  <ReviewSummary 
    {summary}
    onFilter={(rating) => filterByRating(rating)} 
  />
  
  <!-- Lista de Reseñas -->
  <ReviewList 
    {reviews}
    onLoadMore={loadMoreReviews}
  />
  
  <!-- Botón para agregar reseña -->
  <button 
    on:click={() => showReviewForm = true}
    class="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
  >
    Escribir una Reseña
  </button>
  
  <!-- Formulario de Reseña -->
  {#if showReviewForm}
    <div class="mt-8 p-6 bg-gray-50 rounded-lg">
      <h3 class="text-xl font-semibold mb-4">Escribe tu reseña</h3>
      <ReviewForm 
        productId={productId}
        onSuccess={() => {
          showReviewForm = false;
          loadReviews();
        }}
      />
    </div>
  {/if}
</section>
```

### 2. Panel de Administración

```svelte
<!-- src/routes/admin/reviews/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { ReviewList } from '$lib/components/reviews';
  
  let reviews = [];
  let loading = true;
  let currentFilter = 'PENDING';
  
  // Cargar reseñas con filtro
  async function loadReviews() {
    loading = true;
    try {
      const response = await fetch(`/api/admin/reviews?status=${currentFilter}`);
      const data = await response.json();
      reviews = data.reviews;
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      loading = false;
    }
  }
  
  // Cambiar estado de una reseña
  async function updateReviewStatus(reviewId: string, status: string) {
    try {
      await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await loadReviews(); // Recargar lista
    } catch (error) {
      console.error('Error updating review status:', error);
    }
  }
  
  // Cargar reseñas al montar
  onMount(loadReviews);
</script>

<div class="p-6">
  <h1 class="text-2xl font-bold mb-6">Moderación de Reseñas</h1>
  
  <!-- Filtros -->
  <div class="flex gap-4 mb-6">
    <select 
      bind:value={currentFilter}
      on:change={loadReviews}
      class="px-4 py-2 border rounded"
    >
      <option value="PENDING">Pendientes</option>
      <option value="APPROVED">Aprobadas</option>
      <option value="REJECTED">Rechazadas</option>
    </select>
  </div>
  
  <!-- Lista de Reseñas -->
  {#if loading}
    <p>Cargando reseñas...</p>
  {:else}
    <ReviewList 
      {reviews}
      onStatusChange={updateReviewStatus}
      showActions={true}
    />
  {/if}
</div>
```

## 🛠️ Personalización

### 1. Temas y Estilos

Puedes personalizar los estilos sobrescribiendo las clases de Tailwind:

```css
/* src/app.postcss */
.review-card {
  @apply bg-white p-6 rounded-lg shadow-sm border border-gray-100;
  transition: all 0.2s ease;
}

.review-card:hover {
  @apply shadow-md border-gray-200;
}

.rating-star {
  @apply text-yellow-400 w-5 h-5;
}

.rating-star.empty {
  @apply text-gray-300;
}
```

### 2. Internacionalización

Crea un archivo de traducciones:

```typescript
// src/lib/i18n/reviews.ts
export const reviewTranslations = {
  es: {
    writeReview: 'Escribe una reseña',
    yourRating: 'Tu valoración',
    submit: 'Enviar reseña',
    // Más traducciones...
  },
  en: {
    writeReview: 'Write a review',
    yourRating: 'Your rating',
    submit: 'Submit review',
    // More translations...
  }
};
```

## 🚨 Solución de Problemas Comunes

### 1. Las imágenes no se cargan

- Verifica los permisos del bucket de almacenamiento
- Asegúrate de que las URLs estén siendo generadas correctamente
- Revisa la configuración de CORS

### 2. Las reseñas no se actualizan en tiempo real

- Verifica que estés recargando los datos después de mutaciones
- Considera implementar WebSockets para actualizaciones en tiempo real

### 3. Problemas de validación

- Revisa los esquemas de validación en el servidor
- Asegúrate de que todos los campos requeridos estén presentes
- Verifica los tipos de datos en las solicitudes

## 📚 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Guía de Estilos de Svelte](https://svelte.dev/faq#styling)
- [Patrones de Diseño para Reseñas](https://www.nngroup.com/articles/rating-system-usability/)

---

## Sistema de Reseñas - Referencia Técnica


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
