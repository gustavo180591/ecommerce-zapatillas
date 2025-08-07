# Búsqueda y Filtrado de Productos

Esta documentación cubre la funcionalidad de búsqueda y filtrado implementada en el sistema de e-commerce.

## Tabla de Contenidos
- [Visión General](#visión-general)
- [API de Búsqueda](#api-de-búsqueda)
  - [Endpoint](#endpoint)
  - [Parámetros de Consulta](#parámetros-de-consulta)
  - [Respuesta](#respuesta)
- [Componentes de Interfaz de Usuario](#componentes-de-interfaz-de-usuario)
  - [SearchInput](#searchinput)
  - [ProductFilterPanel](#productfilterpanel)
  - [FilterChips](#filterchips)
- [Personalización](#personalización)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Consideraciones de Rendimiento](#consideraciones-de-rendimiento)

## Visión General

El sistema de búsqueda y filtrado permite a los usuarios encontrar productos de manera eficiente mediante:

- Búsqueda por texto completo en nombres, descripciones y SKUs
- Filtrado por múltiples criterios (categoría, marca, precio, etc.)
- Ordenamiento por relevancia, precio, novedades, etc.
- Paginación de resultados

## API de Búsqueda

### Endpoint

```
GET /api/products/search
```

### Parámetros de Consulta

| Parámetro   | Tipo       | Requerido | Descripción |
|------------|------------|-----------|-------------|
| `q`        | string     | No        | Término de búsqueda |
| `category` | string[]   | No        | IDs de categorías |
| `brand`    | string[]   | No        | IDs de marcas |
| `minPrice` | number     | No        | Precio mínimo |
| `maxPrice` | number     | No        | Precio máximo |
| `size`     | string[]   | No        | Tallas disponibles |
| `color`    | string[]   | No        | Colores disponibles |
| `page`     | number     | No        | Número de página (por defecto: 1) |
| `limit`    | number     | No        | Resultados por página (por defecto: 12) |
| `sortBy`   | string     | No        | Campo para ordenar (price-asc, price-desc, newest, rating, name-asc, name-desc) |

### Respuesta

```typescript
{
  success: boolean;
  data: {
    products: Product[];
    meta: {
      total: number;
      currentPage: number;
      totalPages: number;
      itemsPerPage: number;
    };
    filters: {
      categories: FilterOption[];
      brands: FilterOption[];
      sizes: string[];
      colors: string[];
      priceRange: {
        min: number;
        max: number;
      };
    };
  };
}
```

## Componentes de Interfaz de Usuario

### SearchInput

Componente de entrada de búsqueda con funcionalidad de debounce.

**Props:**

```typescript
interface SearchInputProps {
  placeholder?: string;
  value?: string;
  debounce?: number; // Tiempo en ms para el debounce
  onSearch: (query: string) => void;
  onSubmit?: (query: string) => void; // Se dispara al presionar Enter
}
```

**Uso:**

```svelte
<SearchInput
  placeholder="Buscar productos..."
  debounce={300}
  onSearch={(query) => handleSearch(query)}
  on:submit={(e) => handleSearchSubmit(e.detail)}
/>
```

### ProductFilterPanel

Panel de filtros desplegable con soporte para diferentes tipos de filtros.

**Props:**

```typescript
interface FilterGroup {
  id: string;
  name: string;
  type: 'checkbox' | 'radio' | 'range' | 'color' | 'size';
  options?: Array<{
    id: string;
    name: string;
    count?: number;
    color?: string; // Para filtros de color
  }>;
  min?: number;     // Para rangos
  max?: number;     // Para rangos
  step?: number;    // Para rangos
}

interface ProductFilterPanelProps {
  filterGroups: FilterGroup[];
  selectedFilters: Record<string, any>;
  onApply: (filters: Record<string, any>) => void;
  onReset: () => void;
}
```

**Uso:**

```svelte
<script lang="ts">
  import ProductFilterPanel from '$lib/components/ProductFilterPanel.svelte';
  
  const filterGroups = [
    {
      id: 'category',
      name: 'Categoría',
      type: 'checkbox',
      options: [
        { id: '1', name: 'Running', count: 5 },
        { id: '2', name: 'Casual', count: 3 },
      ],
    },
    // ... más grupos de filtros
  ];
  
  function handleApply(filters) {
    // Aplicar filtros
  }
  
  function handleReset() {
    // Restablecer filtros
  }
</script>

<ProductFilterPanel
  {filterGroups}
  selectedFilters={$filters}
  onApply={handleApply}
  onReset={handleReset}
/>
```

### FilterChips

Muestra los filtros activos como chips y permite eliminarlos.

**Props:**

```typescript
interface FilterChip {
  id: string;
  label: string;
  groupId: string;
  groupLabel: string;
  value: any;
}

interface FilterChipsProps {
  filters: FilterChip[];
  showClearAll?: boolean;
  showEmptyState?: boolean;
  emptyStateText?: string;
  onRemove: (filter: FilterChip) => void;
  onClearAll: () => void;
}
```

**Uso:**

```svelte
<FilterChips
  filters={activeFilters}
  showClearAll
  onRemove={handleRemoveFilter}
  onClearAll={handleClearAllFilters}
/>
```

## Personalización

### Estilos

Los componentes utilizan clases de Tailwind CSS y pueden ser personalizados mediante las clases de utilidad de Tailwind o sobrescribiendo los estilos.

### Internacionalización

Los textos están definidos como props en los componentes para facilitar la internacionalización.

## Ejemplos de Uso

### Búsqueda Básica

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import SearchInput from '$lib/components/SearchInput.svelte';
  
  let searchQuery = $page.url.searchParams.get('q') || '';
  
  function handleSearch(query: string) {
    const url = new URL($page.url);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    url.searchParams.delete('page'); // Resetear a primera página
    window.location.href = url.toString();
  }
</script>

<SearchInput
  placeholder="Buscar productos..."
  value={searchQuery}
  onSearch={handleSearch}
/>
```

### Filtrado Avanzado

```svelte
<script lang="ts">
  import { page } from '$app/stores';
  import ProductFilterPanel from '$lib/components/ProductFilterPanel.svelte';
  import FilterChips from '$lib/components/FilterChips.svelte';
  
  // Datos de ejemplo
  const filterGroups = [
    {
      id: 'category',
      name: 'Categoría',
      type: 'checkbox',
      options: [
        { id: '1', name: 'Running', count: 5 },
        { id: '2', name: 'Casual', count: 3 },
      ],
    },
    {
      id: 'price',
      name: 'Precio',
      type: 'range',
      min: 0,
      max: 100000,
      step: 1000,
    },
  ];
  
  // Obtener filtros actuales de la URL
  $: currentFilters = {
    category: $page.url.searchParams.getAll('category'),
    minPrice: $page.url.searchParams.get('minPrice'),
    maxPrice: $page.url.searchParams.get('maxPrice'),
  };
  
  // Convertir a formato de chips
  $: activeFilters = [
    ...currentFilters.category.map(id => ({
      id,
      label: filterGroups[0].options.find(o => o.id === id)?.name || id,
      groupId: 'category',
      groupLabel: 'Categoría',
      value: id,
    })),
    ...(currentFilters.minPrice || currentFilters.maxPrice ? [{
      id: 'price',
      label: `$${currentFilters.minPrice || '0'} - $${currentFilters.maxPrice || '∞'}`,
      groupId: 'price',
      groupLabel: 'Precio',
      value: { min: currentFilters.minPrice, max: currentFilters.maxPrice },
    }] : []),
  ];
  
  function applyFilters(filters) {
    const url = new URL($page.url);
    
    // Actualizar parámetros de la URL
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        url.searchParams.delete(key);
        value.forEach(v => url.searchParams.append(key, v));
      } else if (value && typeof value === 'object') {
        if (value.min) url.searchParams.set('minPrice', value.min);
        else url.searchParams.delete('minPrice');
        
        if (value.max) url.searchParams.set('maxPrice', value.max);
        else url.searchParams.delete('maxPrice');
      } else if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    
    // Resetear a primera página al cambiar filtros
    url.searchParams.delete('page');
    
    // Navegar a la nueva URL
    window.location.href = url.toString();
  }
  
  function removeFilter(filter) {
    const newFilters = { ...$currentFilters };
    
    if (Array.isArray(newFilters[filter.groupId])) {
      newFilters[filter.groupId] = newFilters[filter.groupId].filter(
        (id) => id !== filter.value
      );
    } else if (filter.groupId === 'price') {
      delete newFilters.minPrice;
      delete newFilters.maxPrice;
    }
    
    applyFilters(newFilters);
  }
  
  function clearAllFilters() {
    applyFilters({});
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
  <!-- Panel de filtros -->
  <div class="md:col-span-1">
    <ProductFilterPanel
      {filterGroups}
      selectedFilters={currentFilters}
      onApply={applyFilters}
      onReset={clearAllFilters}
    />
  </div>
  
  <!-- Contenido principal -->
  <div class="md:col-span-3">
    <!-- Filtros activos -->
    {#if activeFilters.length > 0}
      <FilterChips
        {activeFilters}
        showClearAll
        onRemove={removeFilter}
        onClearAll={clearAllFilters}
      />
    {/if}
    
    <!-- Lista de productos -->
    <!-- ... -->
  </div>
</div>
```

## Consideraciones de Rendimiento

1. **Paginación**: Siempre utiliza paginación para limitar la cantidad de resultados devueltos.
2. **Índices**: Asegúrate de tener índices en las columnas utilizadas para filtrar y ordenar.
3. **Caché**: Considera implementar caché para resultados de búsqueda frecuentes.
4. **Debounce**: Usa debounce en las búsquedas mientras el usuario escribe.
5. **Lazy Loading**: Carga los filtros de forma asíncrona para mejorar el tiempo de carga inicial.

## Solución de Problemas

### Los filtros no se aplican correctamente
- Verifica que los nombres de los parámetros coincidan entre el frontend y el backend.
- Asegúrate de que los tipos de datos sean los correctos (ej: números vs cadenas).

### La búsqueda es lenta
- Revisa los índices de la base de datos.
- Considera usar un motor de búsqueda dedicado como Elasticsearch o MeiliSearch para grandes volúmenes de datos.

### Los filtros no se muestran en la URL
- Asegúrate de que las actualizaciones de la URL se manejen correctamente en el cliente.
- Verifica que no haya conflictos con el enrutamiento de SvelteKit.
