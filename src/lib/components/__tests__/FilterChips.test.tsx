import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import FilterChips from '../FilterChips.svelte';

describe('FilterChips', () => {
  const mockOnRemove = vi.fn();
  const mockOnClearAll = vi.fn();
  
  const filters = [
    { id: 'cat1', label: 'Running', groupId: 'category', groupLabel: 'Categoría' },
    { id: 'brand1', label: 'Nike', groupId: 'brand', groupLabel: 'Marca' },
    { id: 'size42', label: '42', groupId: 'size', groupLabel: 'Talla' },
  ];

  beforeEach(() => {
    mockOnRemove.mockClear();
    mockOnClearAll.mockClear();
  });

  it('renders all filter chips', () => {
    render(FilterChips, { 
      props: { 
        filters,
        onRemove: mockOnRemove,
        onClearAll: mockOnClearAll
      } 
    });

    // Check that all filters are rendered
    expect(screen.getByText('Categoría: Running')).toBeInTheDocument();
    expect(screen.getByText('Marca: Nike')).toBeInTheDocument();
    expect(screen.getByText('Talla: 42')).toBeInTheDocument();
    
    // Check that clear all button is visible
    expect(screen.getByText('Limpiar todo')).toBeInTheDocument();
  });

  it('calls onRemove when a chip is removed', async () => {
    render(FilterChips, { 
      props: { 
        filters,
        onRemove: mockOnRemove,
        onClearAll: mockOnClearAll
      } 
    });

    // Find and click the remove button on the first chip
    const firstChipRemoveButton = screen.getAllByRole('button', { name: /eliminar/i })[0];
    await fireEvent.click(firstChipRemoveButton);

    // Verify onRemove was called with the correct filter
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith(filters[0]);
  });

  it('calls onClearAll when clear all button is clicked', async () => {
    render(FilterChips, { 
      props: { 
        filters,
        onRemove: mockOnRemove,
        onClearAll: mockOnClearAll
      } 
    });

    // Click the clear all button
    const clearAllButton = screen.getByText('Limpiar todo');
    await fireEvent.click(clearAllButton);

    // Verify onClearAll was called
    expect(mockOnClearAll).toHaveBeenCalledTimes(1);
  });

  it('does not render clear all button when showClearAll is false', () => {
    render(FilterChips, { 
      props: { 
        filters,
        showClearAll: false,
        onRemove: mockOnRemove,
        onClearAll: mockOnClearAll
      } 
    });

    // Check that clear all button is not rendered
    expect(screen.queryByText('Limpiar todo')).not.toBeInTheDocument();
  });

  it('applies custom class to the container', () => {
    const customClass = 'custom-class';
    render(FilterChips, { 
      props: { 
        filters: [],
        class: customClass,
        onRemove: mockOnRemove,
        onClearAll: mockOnClearAll
      } 
    });

    // Check that the custom class is applied to the container
    const container = screen.getByRole('region', { name: /filtros aplicados/i });
    expect(container).toHaveClass(customClass);
  });

  it('renders empty state when no filters are provided', () => {
    render(FilterChips, { 
      props: { 
        filters: [],
        onRemove: mockOnRemove,
        onClearAll: mockOnClearAll
      } 
    });

    // Check that no filters message is shown
    expect(screen.queryByText('Filtros aplicados:')).not.toBeInTheDocument();
    expect(screen.queryByText('Limpiar todo')).not.toBeInTheDocument();
  });

  it('renders custom empty state when no filters are provided and showEmptyState is true', () => {
    const emptyMessage = 'No hay filtros aplicados';
    render(FilterChips, { 
      props: { 
        filters: [],
        showEmptyState: true,
        emptyStateText: emptyMessage,
        onRemove: mockOnRemove,
        onClearAll: mockOnClearAll
      } 
    });

    // Check that custom empty state is shown
    expect(screen.getByText(emptyMessage)).toBeInTheDocument();
  });
});
