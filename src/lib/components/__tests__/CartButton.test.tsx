import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import CartButton from '../CartButton.svelte';

// Mock the cart store
vi.mock('../../stores/cart', () => ({
  cart: {
    subscribe: vi.fn().mockImplementation((run) => {
      run({ count: 3, items: new Array(3) }); // Mock 3 items in cart
      return () => {};
    }),
  },
}));

describe('CartButton', () => {
  const mockOnClick = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the cart button with item count', () => {
    render(CartButton, { onClick: mockOnClick });
    
    const button = screen.getByRole('button', { name: /carrito/i });
    const badge = screen.getByText('3');
    
    expect(button).toBeInTheDocument();
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('absolute -top-2 -right-2');
  });

  it('calls onClick when clicked', async () => {
    render(CartButton, { onClick: mockOnClick });
    
    const button = screen.getByRole('button', { name: /carrito/i });
    await fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not show badge when count is zero', () => {
    // Override the cart store mock for this test
    vi.mocked(require('../../stores/cart').cart.subscribe).mockImplementationOnce((run) => {
      run({ count: 0, items: [] });
      return () => {};
    });
    
    render(CartButton, { onClick: mockOnClick });
    
    const badge = screen.queryByText('0');
    expect(badge).not.toBeInTheDocument();
  });

  it('applies custom class when provided', () => {
    const customClass = 'custom-class';
    render(CartButton, { onClick: mockOnClick, class: customClass });
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass(customClass);
  });

  it('has proper accessibility attributes', () => {
    render(CartButton, { onClick: mockOnClick });
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Ver carrito (3 productos)');
    
    const icon = button.querySelector('svg');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
});
