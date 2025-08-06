import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import { vi } from 'vitest';
import CartItem from '../CartItem.svelte';
import { cart } from '../../stores/cart';

// Mock the cart store
vi.mock('../../stores/cart', () => ({
  cart: {
    subscribe: vi.fn().mockImplementation((run) => {
      run({ items: [] });
      return () => {};
    }),
    updateQuantity: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('CartItem', () => {
  const mockItem = {
    id: 1,
    productId: 1,
    product: {
      id: 1,
      name: 'Zapatilla Deportiva',
      price: 19990,
      image: '/images/shoe1.jpg',
    },
    quantity: 1,
    size: '39',
    color: 'Negro',
    availableStock: 5,
  };

  it('renders the cart item with correct information', () => {
    render(CartItem, { item: mockItem });
    
    expect(screen.getByText('Zapatilla Deportiva')).toBeInTheDocument();
    expect(screen.getByText('Talle: 39 | Color: Negro')).toBeInTheDocument();
    expect(screen.getByText('$19,990.00')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('1');
    expect(screen.getByText('5 unidades disponibles')).toBeInTheDocument();
  });

  it('allows changing quantity via select', async () => {
    render(CartItem, { item: mockItem });
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '3' } });
    
    await waitFor(() => {
      expect(cart.updateQuantity).toHaveBeenCalledWith(mockItem.id, 3);
    });
  });

  it('allows increasing quantity with plus button', async () => {
    render(CartItem, { item: mockItem });
    
    const plusButton = screen.getByLabelText('Aumentar cantidad');
    await fireEvent.click(plusButton);
    
    await waitFor(() => {
      expect(cart.updateQuantity).toHaveBeenCalledWith(mockItem.id, 2);
    });
  });

  it('allows decreasing quantity with minus button', async () => {
    const itemWithMultipleQuantity = { ...mockItem, quantity: 2 };
    render(CartItem, { item: itemWithMultipleQuantity });
    
    const minusButton = screen.getByLabelText('Reducir cantidad');
    await fireEvent.click(minusButton);
    
    await waitFor(() => {
      expect(cart.updateQuantity).toHaveBeenCalledWith(mockItem.id, 1);
    });
  });

  it('disables minus button when quantity is 1', () => {
    render(CartItem, { item: mockItem });
    
    const minusButton = screen.getByLabelText('Reducir cantidad');
    expect(minusButton).toBeDisabled();
  });

  it('disables plus button when quantity reaches available stock', () => {
    const itemWithMaxQuantity = { ...mockItem, quantity: 5, availableStock: 5 };
    render(CartItem, { item: itemWithMaxQuantity });
    
    const plusButton = screen.getByLabelText('Aumentar cantidad');
    expect(plusButton).toBeDisabled();
  });

  it('shows low stock warning when stock is low', () => {
    const lowStockItem = { ...mockItem, availableStock: 2 };
    render(CartItem, { item: lowStockItem });
    
    expect(screen.getByText('2 unidades disponibles')).toHaveClass('text-amber-600');
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // Warning icon
  });

  it('shows out of stock message when no stock is available', () => {
    const outOfStockItem = { ...mockItem, availableStock: 0 };
    render(CartItem, { item: outOfStockItem });
    
    expect(screen.getByText('Sin stock')).toBeInTheDocument();
  });

  it('dispatches remove event when delete button is clicked', async () => {
    const { component } = render(CartItem, { item: mockItem });
    const onRemove = vi.fn();
    component.$on('remove', onRemove);
    
    const deleteButton = screen.getByLabelText('Eliminar producto');
    await fireEvent.click(deleteButton);
    
    expect(onRemove).toHaveBeenCalledWith(expect.objectContaining({
      detail: { id: mockItem.id }
    }));
  });

  it('shows loading state when updating quantity', async () => {
    // Mock the update to take some time
    (cart.updateQuantity as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    const { container } = render(CartItem, { item: mockItem });
    
    const plusButton = screen.getByLabelText('Aumentar cantidad');
    await fireEvent.click(plusButton);
    
    // Check for loading spinner
    const loadingOverlay = container.querySelector('.absolute.inset-0');
    expect(loadingOverlay).toBeInTheDocument();
    
    // Wait for the update to complete
    await waitFor(() => {
      expect(loadingOverlay).not.toBeInTheDocument();
    }, { timeout: 200 });
  });
});
