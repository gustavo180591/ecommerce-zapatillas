import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
  // Get initial filter values from URL
  const searchQuery = url.searchParams.get('q') || '';
  const categories = url.searchParams.getAll('category');
  const brands = url.searchParams.getAll('brand');
  const minPrice = url.searchParams.get('minPrice');
  const maxPrice = url.searchParams.get('maxPrice');
  const sizes = url.searchParams.getAll('size');
  const colors = url.searchParams.getAll('color');
  const sortBy = url.searchParams.get('sortBy') || 'relevance';
  const page = parseInt(url.searchParams.get('page') || '1');
  
  try {
    // Build the API URL with all query parameters
    const apiUrl = new URL('/api/products/search', url.origin);
    if (searchQuery) apiUrl.searchParams.set('q', searchQuery);
    categories.forEach(cat => apiUrl.searchParams.append('category', cat));
    brands.forEach(brand => apiUrl.searchParams.append('brand', brand));
    if (minPrice) apiUrl.searchParams.set('minPrice', minPrice);
    if (maxPrice) apiUrl.searchParams.set('maxPrice', maxPrice);
    sizes.forEach(size => apiUrl.searchParams.append('size', size));
    colors.forEach(color => apiUrl.searchParams.append('color', color));
    apiUrl.searchParams.set('sortBy', sortBy);
    apiUrl.searchParams.set('page', page.toString());
    
    // Fetch products from the API
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const { data: products, meta } = await response.json();
    
    // Get available filter options (this could be optimized with a separate endpoint)
    const filtersResponse = await fetch('/api/products/search/filters');
    const filterOptions = filtersResponse.ok ? await filtersResponse.json() : {};
    
    return {
      products,
      meta,
      filterOptions,
      currentFilters: {
        searchQuery,
        categories,
        brands,
        minPrice,
        maxPrice,
        sizes,
        colors,
        sortBy,
        page
      }
    };
  } catch (error) {
    console.error('Error loading products:', error);
    return {
      products: [],
      meta: { total: 0, totalPages: 0, currentPage: 1 },
      filterOptions: {},
      currentFilters: {
        searchQuery,
        categories,
        brands,
        minPrice,
        maxPrice,
        sizes,
        colors,
        sortBy,
        page: 1
      },
      error: 'No se pudieron cargar los productos. Por favor, inténtalo de nuevo más tarde.'
    };
  }
};

// This would be called when the form is submitted
export const actions = {
  search: async ({ request, url }) => {
    const data = await request.formData();
    const searchQuery = data.get('q') as string;
    
    // Reset to first page on new search
    url.searchParams.set('q', searchQuery);
    url.searchParams.delete('page');
    
    throw redirect(303, url.toString());
  },
  
  filter: async ({ request, url }) => {
    const data = await request.formData();
    
    // Update URL with new filter values
    url.searchParams.delete('category');
    url.searchParams.delete('brand');
    url.searchParams.delete('minPrice');
    url.searchParams.delete('maxPrice');
    url.searchParams.delete('size');
    url.searchParams.delete('color');
    url.searchParams.delete('sortBy');
    url.searchParams.delete('page');
    
    // Add all filter values
    data.getAll('category').forEach(cat => {
      if (cat) url.searchParams.append('category', cat.toString());
    });
    
    data.getAll('brand').forEach(brand => {
      if (brand) url.searchParams.append('brand', brand.toString());
    });
    
    const minPrice = data.get('minPrice');
    const maxPrice = data.get('maxPrice');
    
    if (minPrice) url.searchParams.set('minPrice', minPrice.toString());
    if (maxPrice) url.searchParams.set('maxPrice', maxPrice.toString());
    
    data.getAll('size').forEach(size => {
      if (size) url.searchParams.append('size', size.toString());
    });
    
    data.getAll('color').forEach(color => {
      if (color) url.searchParams.append('color', color.toString());
    });
    
    const sortBy = data.get('sortBy');
    if (sortBy) url.searchParams.set('sortBy', sortBy.toString());
    
    throw redirect(303, url.toString());
  }
};
