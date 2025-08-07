// Mock SvelteKit runtime module
import { vi } from 'vitest';
import { readable } from 'svelte/store';

// Mock $app/stores
vi.mock('$app/stores', async () => {
  const { readable } = await import('svelte/store');
  const page = {
    subscribe: readable({
      data: {
        user: {
          id: 'test-user',
          email: 'test@example.com',
          role: 'ADMIN'
        }
      }
    }).subscribe
  };
  
  return {
    page,
    navigating: readable(null).subscribe,
    updated: { subscribe: readable(false).subscribe, check: () => false },
    getStores: () => ({
      page,
      navigating: { subscribe: readable(null).subscribe },
      updated: { subscribe: readable(false).subscribe, check: () => false },
    })
  };
});

// Mock $app/navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
  pushState: vi.fn(),
  replaceState: vi.fn(),
  beforeNavigate: vi.fn(),
  afterNavigate: vi.fn(),
  onNavigate: vi.fn(),
  disableScrollHandling: vi.fn(),
  preloadData: vi.fn(),
  preloadCode: vi.fn()
}));

// Mock window.matchMedia which is not available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Reset all mocks before each test
afterEach(() => {
  vi.clearAllMocks();
  mockFetch.mockReset();
});
