import { render, screen, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import SearchInput from '../SearchInput.svelte';

describe('SearchInput', () => {
  const mockOnSearch = vi.fn();
  const props = {
    placeholder: 'Buscar productos...',
    value: '',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnSearch.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with default props', () => {
    render(SearchInput, { props });
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('updates input value when user types', async () => {
    render(SearchInput, { 
      props: { 
        ...props,
        onSearch: mockOnSearch 
      } 
    });
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    
    await fireEvent.input(input, { target: { value: 'zapatillas' } });
    
    // Fast-forward time for debounce
    vi.advanceTimersByTime(300);
    
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('zapatillas');
  });

  it('debounces search input', async () => {
    render(SearchInput, { 
      props: { 
        ...props,
        debounce: 500,
        onSearch: mockOnSearch 
      } 
    });
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    
    // Type multiple characters quickly
    await fireEvent.input(input, { target: { value: 'z' } });
    await fireEvent.input(input, { target: { value: 'za' } });
    await fireEvent.input(input, { target: { value: 'zap' } });
    
    // Not called yet (debounce not passed)
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast-forward time
    vi.advanceTimersByTime(500);
    
    // Should only be called once with the last value
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
    expect(mockOnSearch).toHaveBeenCalledWith('zap');
  });

  it('clears input when clear button is clicked', async () => {
    render(SearchInput, { 
      props: { 
        ...props,
        value: 'test',
        onSearch: mockOnSearch 
      } 
    });
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    const clearButton = screen.getByRole('button', { name: /limpiar búsqueda/i });
    
    await fireEvent.click(clearButton);
    
    expect(input).toHaveValue('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('submits search when Enter is pressed', async () => {
    const mockOnSubmit = vi.fn();
    
    render(SearchInput, { 
      props: { 
        ...props,
        onSearch: mockOnSearch,
        onSubmit: mockOnSubmit 
      } 
    });
    
    const input = screen.getByPlaceholderText('Buscar productos...');
    
    await fireEvent.input(input, { target: { value: 'zapatillas' } });
    await fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith('zapatillas');
  });
});
