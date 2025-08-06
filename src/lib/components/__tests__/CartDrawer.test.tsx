import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import CartDrawer from '../CartDrawer.svelte';
import { cart } from '../../stores/cart';

// Mock the cart store
vi.mock('../../stores/cart', () => ({
  cart: {
    subscribe: vi.fn().mockImplementation((run) => {
      run({ 
        items: [
          {
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
          }
        ],
        total: 19990,
        count: 1,
        error: null,
      });
      return () => {};
    }),
    clear: vi.fn(),
  },
}));

describe('CartDrawer', () => {
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the cart drawer with items when open', () => {
    render(CartDrawer, { isOpen: true, onClose: mockOnClose });
    
    expect(screen.getByText('Tu Carrito')).toBeInTheDocument();
    expect(screen.getByText('Zapatilla Deportiva')).toBeInTheDocument();
    expect(screen.getByText('Total: $19,990.00')).toBeInTheDocument();
    expect(screen.getByText('Pagar')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(CartDrawer, { isOpen: false, onClose: mockOnClose });
    
    // The drawer should be in the DOM but not visible
    const drawer = container.querySelector('.fixed.inset-0');
    expect(drawer).toHaveClass('opacity-0', 'invisible');
  });

  it('calls onClose when clicking the close button', async () => {
    render(CartDrawer, { isOpen: true, onClose: mockOnClose });
    
    const closeButton = screen.getByLabelText('Cerrar carrito');
    await fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when clicking the overlay', async () => {
    const { container } = render(CartDrawer, { isOpen: true, onClose: mockOnClose });
    
    const overlay = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    await fireEvent.click(overlay as Element);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays empty state when cart is empty', () => {
    // Override the cart store mock for this test
    (cart as any).subscribe = vi.fn().mockImplementation((run) => {
      run({ items: [], total: 0, count: 0, error: null });
      return () => {};
    });
    
    render(CartDrawer, { isOpen: true, onClose: mockOnClose });
    
    expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
    expect(screen.getByText('Comienza a agregar productos a tu carrito')).toBeInTheDocument();
    expect(screen.getByText('Seguir comprando')).toBeInTheDocument();
  });

  it('calls cart.clear() when clicking the clear cart button', async () => {
    render(CartDrawer, { isOpen: true, onClose: mockOnClose });
    
    const clearButton = screen.getByText('Vaciar carrito');
    await fireEvent.click(clearButton);
    
    expect(cart.clear).toHaveBeenCalled();
  });

  it('disables the checkout button when cart is empty', () => {
    // Override the cart store mock for this test
    (cart as any).subscribe = vi.fn().mockImplementation((run) => {
      run({ items: [], total: 0, count: 0, error: null });
      return () => {};
    });
    
    render(CartDrawer, { isOpen: true, onClose: mockOnClose });
    
    const checkoutButton = screen.getByText('Pagar');
    expect(checkoutButton).toBeDisabled();
  });

  it('displays an error message when there is an error', () => {
    // Override the cart store mock for this test
    (cart as any).subscribe = vi.fn().mockImplementation((run) => {
      run({ 
        items: [], 
        total: 0, 
        count: 0, 
        error: 'Error al cargar el carrito' 
      });
      return () => {};
    });
    
    render(CartDrawer, { isOpen: true, onClose: mockOnClose });
    
    expect(screen.getByText('Error al cargar el carrito')).toBeInTheDocument();
  });
});
