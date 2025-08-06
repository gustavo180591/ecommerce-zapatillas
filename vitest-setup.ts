import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import matchers from '@testing-library/jest-dom/matchers';
import { server } from './src/mocks/server';

// Extend Vitest's expect with Jest DOM matchers
expect.extend(matchers);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock the browser's localStorage
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the browser's sessionStorage
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });

// Mock the browser's fetch
// @ts-ignore
global.fetch = vi.fn();

// Start MSW server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
});

// Close MSW server after all tests
afterAll(() => server.close());
