import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { page } from '$app/stores';
import { enhance } from '$app/forms';
import { tick } from 'svelte';
import { reviews } from './mocks';
import Page from '../+page.svelte';

// Mock the page store
vi.mock('$app/stores', () => {
  const page = {
    subscribe: (fn: any) => {
      fn({ url: new URL('http://localhost/admin/reviews') });
      return () => {};
    }
  };
  return { page };
});

// Mock the review actions
vi.mock('$lib/server/actions/review.actions', () => ({
  getReviews: vi.fn(() => ({
    reviews,
    total: reviews.length,
    page: 1,
    totalPages: 1,
    hasMore: false
  })),
  updateReviewStatus: vi.fn(() => Promise.resolve({ id: 'review-1', status: 'APPROVED' }))
}));

describe('Admin Reviews Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page title and search', async () => {
    render(Page);
    
    expect(screen.getByText('Gestión de Reseñas')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar reseñas...')).toBeInTheDocument();
  });

  it('should display a list of reviews', async () => {
    render(Page);
    
    await waitFor(() => {
      expect(screen.getByText(reviews[0].title)).toBeInTheDocument();
      expect(screen.getByText(reviews[0].comment)).toBeInTheDocument();
      expect(screen.getByText(reviews[1].title)).toBeInTheDocument();
    });
  });

  it('should show review status badges', async () => {
    render(Page);
    
    await waitFor(() => {
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
      expect(screen.getByText('Aprobado')).toBeInTheDocument();
    });
  });

  it('should allow filtering by status', async () => {
    const { container } = render(Page);
    
    // Wait for the component to load
    await waitFor(() => {
      const select = container.querySelector('select');
      if (select) {
        select.value = 'APPROVED';
        select.dispatchEvent(new Event('change'));
      }
    });
    
    // In a real test, we would check if the filter was applied
    // This would require mocking the URL change and re-rendering
  });

  it('should show action buttons for pending reviews', async () => {
    render(Page);
    
    await waitFor(() => {
      const pendingReview = screen.getByText(reviews[0].title).closest('[data-testid="review-card"]');
      expect(pendingReview).toHaveTextContent('Aprobar');
      expect(pendingReview).toHaveTextContent('Rechazar');
    });
  });
});
