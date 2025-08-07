import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import ProductFilterPanel from '../ProductFilterPanel.svelte';

describe('ProductFilterPanel', () => {
  const mockOnApply = vi.fn();
  const mockOnReset = vi.fn();
  
  const filterGroups = [
    {
      id: 'category',
      name: 'Categoría',
      type: 'checkbox',
      options: [
        { id: 'running', name: 'Running', count: 5 },
        { id: 'casual', name: 'Casual', count: 3 },
        { id: 'basketball', name: 'Basketball', count: 2 },
      ],
    },
    {
      id: 'brand',
      name: 'Marca',
      type: 'radio',
      options: [
        { id: 'nike', name: 'Nike', count: 4 },
        { id: 'adidas', name: 'Adidas', count: 3 },
        { id: 'puma', name: 'Puma', count: 2 },
      ],
    },
    {
      id: 'price',
      name: 'Precio',
      type: 'range',
      min: 1000,
      max: 50000,
      step: 1000,
      value: { min: 5000, max: 20000 },
    },
  ];

  const selectedFilters = {
    category: ['running'],
    brand: ['nike'],
    price: { min: 5000, max: 20000 },
  };

  beforeEach(() => {
    mockOnApply.mockClear();
    mockOnReset.mockClear();
  });

  it('renders all filter groups', () => {
    render(ProductFilterPanel, {
      props: {
        filterGroups,
        selectedFilters: {},
        onApply: mockOnApply,
        onReset: mockOnReset,
      },
    });

    // Check that all filter groups are rendered
    expect(screen.getByText('Categoría')).toBeInTheDocument();
    expect(screen.getByText('Marca')).toBeInTheDocument();
    expect(screen.getByText('Precio')).toBeInTheDocument();
    
    // Check that filter options are rendered
    expect(screen.getByLabelText('Running (5)')).toBeInTheDocument();
    expect(screen.getByLabelText('Nike (4)')).toBeInTheDocument();
    
    // Check that apply and reset buttons are rendered
    expect(screen.getByRole('button', { name: /aplicar filtros/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /limpiar/i })).toBeInTheDocument();
  });

  it('applies selected filters when apply button is clicked', async () => {
    render(ProductFilterPanel, {
      props: {
        filterGroups,
        selectedFilters: {},
        onApply: mockOnApply,
        onReset: mockOnReset,
      },
    });

    // Select a filter option
    const runningCheckbox = screen.getByLabelText('Running (5)');
    await fireEvent.click(runningCheckbox);

    // Click apply button
    const applyButton = screen.getByRole('button', { name: /aplicar filtros/i });
    await fireEvent.click(applyButton);

    // Verify onApply was called with the selected filters
    expect(mockOnApply).toHaveBeenCalledTimes(1);
    expect(mockOnApply).toHaveBeenCalledWith({
      category: ['running'],
    });
  });

  it('resets filters when reset button is clicked', async () => {
    render(ProductFilterPanel, {
      props: {
        filterGroups,
        selectedFilters,
        onApply: mockOnApply,
        onReset: mockOnReset,
      },
    });

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /limpiar/i });
    await fireEvent.click(resetButton);

    // Verify onReset was called
    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('updates price range when sliders are moved', async () => {
    render(ProductFilterPanel, {
      props: {
        filterGroups,
        selectedFilters: {},
        onApply: mockOnApply,
        onReset: mockOnReset,
      },
    });

    // Get the min and max price inputs
    const minPriceInput = screen.getByLabelText('Precio mínimo');
    const maxPriceInput = screen.getByLabelText('Precio máximo');

    // Update min price
    await fireEvent.input(minPriceInput, { target: { value: '10000' } });
    await fireEvent.input(maxPriceInput, { target: { value: '30000' } });

    // Click apply button
    const applyButton = screen.getByRole('button', { name: /aplicar filtros/i });
    await fireEvent.click(applyButton);

    // Verify onApply was called with the updated price range
    expect(mockOnApply).toHaveBeenCalledTimes(1);
    expect(mockOnApply).toHaveBeenCalledWith({
      price: { min: 10000, max: 30000 },
    });
  });

  it('toggles filter group expansion', async () => {
    render(ProductFilterPanel, {
      props: {
        filterGroups,
        selectedFilters: {},
        onApply: mockOnApply,
        onReset: mockOnReset,
      },
    });

    // Initially, filter options should be visible
    expect(screen.getByLabelText('Running (5)')).toBeInTheDocument();

    // Click on the category header to collapse
    const categoryHeader = screen.getByText('Categoría').closest('button');
    if (categoryHeader) {
      await fireEvent.click(categoryHeader);
      
      // After clicking, the options should no longer be visible
      expect(screen.queryByLabelText('Running (5)')).not.toBeInTheDocument();
      
      // Click again to expand
      await fireEvent.click(categoryHeader);
      expect(screen.getByLabelText('Running (5)')).toBeInTheDocument();
    }
  });

  it('disables apply button when no changes are made', () => {
    render(ProductFilterPanel, {
      props: {
        filterGroups,
        selectedFilters,
        onApply: mockOnApply,
        onReset: mockOnReset,
      },
    });

    // When no changes are made, apply button should be disabled
    const applyButton = screen.getByRole('button', { name: /aplicar filtros/i });
    expect(applyButton).toBeDisabled();
  });

  it('enables apply button when filters are changed', async () => {
    render(ProductFilterPanel, {
      props: {
        filterGroups,
        selectedFilters: {},
        onApply: mockOnApply,
        onReset: mockOnReset,
      },
    });

    // Initially, apply button should be disabled
    const applyButton = screen.getByRole('button', { name: /aplicar filtros/i });
    expect(applyButton).toBeDisabled();

    // Select a filter option
    const runningCheckbox = screen.getByLabelText('Running (5)');
    await fireEvent.click(runningCheckbox);

    // After changing a filter, apply button should be enabled
    expect(applyButton).not.toBeDisabled();
  });
});
