# Admin Panel Architecture and Usage Guide

## Overview

The Admin Panel is a comprehensive interface for managing the e-commerce platform's products, orders, and settings. It's built with SvelteKit 2, Svelte 5, and integrates with a backend API for data management.

## Architecture

### Tech Stack

- **Frontend**: SvelteKit 2, Svelte 5, TypeScript
- **Styling**: Tailwind CSS with custom theme
- **State Management**: Svelte stores
- **Form Handling**: Svelte-forms-lib
- **Data Fetching**: SvelteKit's `load` functions and `+page.server.ts`
- **Authentication**: JWT with role-based access control
- **Testing**: Vitest, Testing Library, Playwright

### Directory Structure

```
src/
├── lib/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Primitive components (buttons, inputs, etc.)
│   │   └── admin/       # Admin-specific components
│   ├── schemas/         # Validation schemas
│   ├── services/        # API services
│   └── utils/           # Utility functions
├── routes/
│   └── (admin)/         # Admin routes (protected)
│       ├── products/    # Product management
│       │   ├── [id]/    # Edit product
│       │   └── new      # Create product
│       ├── orders/      # Order management
│       ├── settings/    # Store settings
│       └── +layout.svelte # Admin layout
└── app.html             # Main HTML template
```

## Authentication & Authorization

The admin panel uses JWT-based authentication with role-based access control (RBAC).

### User Roles

- **admin**: Full access to all admin features
- **editor**: Can manage products but not users or settings
- **viewer**: Read-only access to admin panel

### Protected Routes

All admin routes are protected by the `(admin)` layout, which verifies the user's authentication status and permissions.

## Data Flow

1. **Data Fetching**:
   - Server-side data loading in `+page.server.ts` files
   - Client-side data fetching with `fetch` or service functions

2. **State Management**:
   - Local component state for UI state
   - Svelte stores for global application state
   - URL search params for filter/sort state

3. **Form Handling**:
   - Client-side validation with Zod schemas
   - Server-side validation in form actions
   - Optimistic UI updates where appropriate

## Key Features

### Product Management

- List, create, edit, and delete products
- Manage product variants, inventory, and pricing
- Bulk import/export products
- Product categorization and filtering

### Order Management

- View and filter orders
- Update order status
- Process refunds and cancellations
- Generate shipping labels

### Reporting

- Sales analytics
- Inventory reports
- Customer insights

## Development Workflow

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update the values in .env
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

### Testing

Run unit tests:
```bash
npm test
```

Run integration tests:
```bash
npm run test:integration
```

Run E2E tests:
```bash
npm run test:e2e
```

### Building for Production

```bash
npm run build
```

## Deployment

The admin panel is deployed as part of the main application. See the main `DEPLOYMENT.md` for details.

## Security Considerations

1. **Authentication**:
   - JWT tokens are stored in HTTP-only cookies
   - CSRF protection for all form submissions
   - Rate limiting on authentication endpoints

2. **Authorization**:
   - Role-based access control
   - Server-side validation of all requests
   - Principle of least privilege

3. **Data Protection**:
   - Input validation on both client and server
   - Output encoding to prevent XSS
   - Secure headers (CSP, HSTS, etc.)

## Performance Optimizations

- Code splitting with SvelteKit's built-in support
- Lazy loading of non-critical components
- Image optimization with `svelte-image`
- Caching strategies for API responses

## Error Handling

- Global error boundary in `+error.svelte`
- User-friendly error messages
- Error logging and monitoring
- Retry mechanisms for failed requests

## Internationalization (i18n)

The admin panel supports multiple languages using SvelteKit's i18n capabilities. Translations are stored in `src/lib/i18n/`.

## Accessibility (a11y)

- Semantic HTML5 elements
- ARIA attributes where needed
- Keyboard navigation
- Color contrast compliance
- Screen reader support

## Browser Support

The admin panel supports the latest versions of:
- Chrome
- Firefox
- Safari
- Edge

## Contributing

1. Create a new branch for your feature/fix
2. Write tests for your changes
3. Ensure all tests pass
4. Submit a pull request

## Troubleshooting

### Common Issues

1. **Authentication Issues**:
   - Clear cookies and local storage
   - Verify JWT secret matches between client and server

2. **API Errors**:
   - Check network tab in dev tools
   - Verify CORS headers

3. **Build Failures**:
   - Clear `node_modules` and reinstall dependencies
   - Check TypeScript errors

## Support

For support, please contact the development team or open an issue in the repository.

## License

[Your License Here]
