import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import '@testing-library/jest-dom';
import type { SvelteComponent } from 'svelte';
import ProductsPage from '../+page.svelte';

// Mock SvelteKit modules
vi.mock('$app/stores', () => ({
  page: {
    subscribe: (fn: (value: unknown) => void) => {
      fn({ 
        data: { 
          user: { 
            id: 'admin-1', 
            email: 'admin@example.com', 
            role: 'ADMIN' 
          } 
        } 
      });
      return () => {};
    }
  }
}));

// Mock navigation
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({
  goto: mockGoto,
  invalidate: vi.fn()
}));

// Mock toast
const mockToast = {
  success: vi.fn(),
  error: vi.fn()
};
vi.mock('svelte-sonner', () => ({
  toast: mockToast
}));

// Mock the page store
vi.mock('$app/stores', () => ({
  page: {
    subscribe: (fn: any) => {
      fn({ data: { user: { id: 'admin-1', email: 'admin@example.com', role: 'ADMIN' } } });
      return () => {};
    }
  }
}));

// Mock navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn()
}));

// Mock toast
vi.mock('svelte-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock the product actions
const mockDeleteProduct = vi.fn().mockResolvedValue({ id: 'prod-1', deleted: true });
vi.mock('$lib/server/actions/product', () => ({
  deleteProduct: mockDeleteProduct
}));

// Type for our mock product
type ProductStatus = 'active' | 'draft' | 'archived';

interface MockProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
}

interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: ProductStatus;
  images: string[];
  variants: MockProductVariant[];
  createdAt: string;
  updatedAt: string;
}

describe('Admin Products Page', () => {
  // Create a test wrapper component to handle the Svelte component properly
  const TestComponent = ProductsPage as unknown as new (args: { target: HTMLElement }) => {
    $destroy: () => void;
  };
  const mockProducts = [
    {
      id: 'prod-1',
      name: 'Test Product 1',
      description: 'Test Description 1',
      price: 99.99,
      stock: 10,
      category: 'Shoes',
      status: 'active',
      images: ['/test.jpg'],
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-2',
      name: 'Test Product 2',
      description: 'Test Description 2',
      price: 199.99,
      stock: 5,
      category: 'Accessories',
      status: 'draft',
      images: ['/test2.jpg'],
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock fetch for products
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    ) as any;
  });

  it('renders the products page with a list of products', async () => {
    render(TestComponent, {});
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Productos')).toBeInTheDocument();
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });
  });

  it('allows searching for products', async () => {
    render(TestComponent, {});
    
    // Wait for products to load
    await screen.findByText('Test Product 1');
    
    // Find search input and type a query
    const searchInput = screen.getByPlaceholderText('Buscar productos...');
    await fireEvent.input(searchInput, { target: { value: 'Test Product 1' } });
    
    // Verify the search was performed
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('search=Test+Product+1'),
      expect.any(Object)
    );
  });

  it('navigates to edit page when edit button is clicked', async () => {
    render(TestComponent, {});
    
    // Wait for products to load
    await screen.findByText('Test Product 1');
    
    // Find and click the edit button for the first product
    const editButtons = screen.getAllByLabelText('Editar producto');
    await fireEvent.click(editButtons[0]);
    
    // Verify navigation
    expect(goto).toHaveBeenCalledWith('/admin/products/prod-1');
  });

  it('shows delete confirmation dialog when delete button is clicked', async () => {
    render(TestComponent, {});
    
    // Wait for products to load
    await screen.findByText('Test Product 1');
    
    // Find and click the delete button for the first product
    const deleteButtons = screen.getAllByLabelText('Eliminar producto');
    await fireEvent.click(deleteButtons[0]);
    
    // Verify the confirmation dialog is shown
    expect(screen.getByText('¿Estás seguro de que deseas eliminar este producto?')).toBeInTheDocument();
  });

  it('allows creating a new product', async () => {
    render(TestComponent, {});
    
    // Find and click the "Nuevo producto" button
    const newProductButton = screen.getByText('Nuevo producto');
    await fireEvent.click(newProductButton);
    
    // Verify navigation to new product page
    expect(mockGoto).toHaveBeenCalledWith('/admin/products/new');
  });

  it('displays loading state while fetching products', async () => {
    // Mock a slow response
    const mockFetch = vi.fn() as Mock;
    global.fetch = mockFetch;
    
    // Create a promise that won't resolve immediately
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    mockFetch.mockImplementationOnce(() => ({
      ok: true,
      json: () => promise.then(() => mockProducts),
    }));
    
    render(TestComponent, {});
    
    // Verify loading state is shown
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // Resolve the promise
    resolvePromise!(mockProducts);
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Verify loading state is gone and products are shown
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
    });
    
    // This part is now handled in the test above
  });
});
