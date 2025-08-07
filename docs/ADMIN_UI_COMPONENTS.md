# Admin Panel UI Components

This document provides documentation and usage examples for the reusable UI components in the admin panel.

## Table of Contents

1. [DataTable](#datatable)
2. [ProductForm](#productform)
3. [DeleteDialog](#deletedialog)
4. [StatusBadge](#statusbadge)
5. [Pagination](#pagination)
6. [Toast Notifications](#toast-notifications)
7. [Form Components](#form-components)

## DataTable

A reusable data table component for displaying tabular data with sorting, filtering, and pagination.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `columns` | `ColumnDef[]` | Yes | - | Column definitions for the table |
| `data` | `T[]` | Yes | - | Array of data objects |
| `loading` | `boolean` | No | `false` | Show loading state |
| `pagination` | `PaginationState` | No | - | Pagination state |
| `onPaginationChange` | `(pagination: PaginationState) => void` | No | - | Pagination change handler |
| `onSortingChange` | `(sorting: SortingState) => void` | No | - | Sorting change handler |
| `onRowClick` | `(row: T) => void` | No | - | Row click handler |

### Example Usage

```svelte
<script lang="ts">
  import { DataTable } from '$lib/components/ui/data-table';
  import { createColumnHelper } from '@tanstack/table-core';
  
  type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
    status: 'active' | 'draft' | 'archived';
  };
  
  const products: Product[] = [
    { id: '1', name: 'Running Shoes', price: 129.99, stock: 50, status: 'active' },
    // ... more products
  ];
  
  const columnHelper = createColumnHelper<Product>();
  
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('price', {
      header: 'Price',
      cell: (info) => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => `<StatusBadge status={info.getValue()} />`,
    }),
    // ... more columns
  ];
  
  const handleRowClick = (product: Product) => {
    // Handle row click
  };
</script>

<DataTable
  {columns}
  {data}
  on:rowClick={handleRowClick}
/>
```

## ProductForm

A form component for creating and editing products.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `product` | `Product | null` | No | `null` | Product to edit, or null for new product |
| `categories` | `Category[]` | Yes | - | Available categories |
| `onSubmit` | `(values: ProductFormValues) => Promise<void>` | Yes | - | Form submission handler |
| `onCancel` | `() => void` | No | - | Cancel handler |
| `isSubmitting` | `boolean` | No | `false` | Form submission state |

### Example Usage

```svelte
<script lang="ts">
  import { ProductForm } from '$lib/components/forms/ProductForm';
  
  let isSubmitting = false;
  
  const categories = [
    { id: '1', name: 'Shoes', slug: 'shoes' },
    { id: '2', name: 'Accessories', slug: 'accessories' },
  ];
  
  const handleSubmit = async (values) => {
    isSubmitting = true;
    try {
      // Handle form submission
      await updateProduct(values);
      showToast('Product updated successfully');
    } catch (error) {
      showToast('Failed to update product', 'error');
    } finally {
      isSubmitting = false;
    }
  };
  
  const handleCancel = () => {
    // Handle cancel
  };
</script>

<ProductForm
  product={currentProduct}
  {categories}
  on:submit={handleSubmit}
  on:cancel={handleCancel}
  {isSubmitting}
/>
```

## DeleteDialog

A confirmation dialog for delete actions.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isOpen` | `boolean` | Yes | - | Whether the dialog is open |
| `onClose` | `() => void` | Yes | - | Close handler |
| `onConfirm` | `() => Promise<void>` | Yes | - | Confirmation handler |
| `title` | `string` | No | 'Delete Item' | Dialog title |
| `description` | `string` | No | 'Are you sure you want to delete this item?' | Dialog description |
| `confirmText` | `string` | No | 'Delete' | Confirm button text |
| `cancelText` | `string` | No | 'Cancel' | Cancel button text |
| `isLoading` | `boolean` | No | `false` | Loading state |

### Example Usage

```svelte
<script lang="ts">
  import { DeleteDialog } from '$lib/components/ui/delete-dialog';
  
  let isDeleteDialogOpen = false;
  let isDeleting = false;
  let productToDelete: Product | null = null;
  
  const handleDeleteClick = (product: Product) => {
    productToDelete = product;
    isDeleteDialogOpen = true;
  };
  
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    isDeleting = true;
    try {
      await deleteProduct(productToDelete.id);
      showToast('Product deleted successfully');
      isDeleteDialogOpen = false;
    } catch (error) {
      showToast('Failed to delete product', 'error');
    } finally {
      isDeleting = false;
    }
  };
</script>

<DeleteDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => isDeleteDialogOpen = false}
  onConfirm={handleDeleteConfirm}
  title="Delete Product"
  description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
  {isLoading: isDeleting}
/>
```

## StatusBadge

A component for displaying status badges with different colors.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `status` | `string` | Yes | - | Status value |
| `variant` | `'default' | 'outline' | 'secondary'` | No | 'default' | Badge variant |

### Example Usage

```svelte
<script lang="ts">
  import { StatusBadge } from '$lib/components/ui/status-badge';
</script>

<StatusBadge status="active" />
<StatusBadge status="draft" variant="outline" />
<StatusBadge status="archived" variant="secondary" />
```

## Pagination

A reusable pagination component.

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `page` | `number` | Yes | - | Current page number (1-based) |
| `pageSize` | `number` | Yes | - | Number of items per page |
| `total` | `number` | Yes | - | Total number of items |
| `onPageChange` | `(page: number) => void` | Yes | - | Page change handler |
| `pageSizeOptions` | `number[]` | No | `[10, 20, 50, 100]` | Available page sizes |
| `onPageSizeChange` | `(size: number) => void` | No | - | Page size change handler |

### Example Usage

```svelte
<script lang="ts">
  import { Pagination } from '$lib/components/ui/pagination';
  
  let page = 1;
  let pageSize = 10;
  let totalItems = 100;
  
  const handlePageChange = (newPage: number) => {
    page = newPage;
    // Fetch data for new page
  };
  
  const handlePageSizeChange = (newSize: number) => {
    pageSize = newSize;
    page = 1; // Reset to first page when changing page size
    // Fetch data with new page size
  };
</script>

<Pagination
  {page}
  {pageSize}
  {total}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  pageSizeOptions={[10, 20, 50]}
/>
```

## Toast Notifications

A toast notification system for showing feedback to users.

### Usage

```typescript
// Show success toast
showToast('Operation completed successfully');

// Show error toast
showToast('An error occurred', 'error');

// Show toast with custom duration
showToast('This will disappear in 10 seconds', 'success', { duration: 10000 });

// Show toast with action
showToast('Item deleted', 'success', {
  action: {
    label: 'Undo',
    onClick: () => {
      // Handle undo
    },
  },
});
```

## Form Components

### Input

A reusable input component with validation support.

#### Example Usage

```svelte
<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  
  let name = '';
  let error = '';
</script>

<Input
  type="text"
  label="Product Name"
  bind:value={name}
  error={error}
  required
  placeholder="Enter product name"
  helpText="The name of the product as it will appear in the store."
/>
```

### Select

A reusable select component.

#### Example Usage

```svelte
<script lang="ts">
  import { Select } from '$lib/components/ui/select';
  
  let category = '';
  const categories = [
    { value: 'shoes', label: 'Shoes' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'accessories', label: 'Accessories' },
  ];
</script>

<Select
  label="Category"
  bind:value={category}
  options={categories}
  placeholder="Select a category"
  required
/>
```

### FileUpload

A file upload component with preview support.

#### Example Usage

```svelte
<script lang="ts">
  import { FileUpload } from '$lib/components/ui/file-upload';
  
  let files: File[] = [];
  
  const handleFiles = (newFiles: File[]) => {
    files = [...files, ...newFiles];
  };
  
  const handleRemove = (index: number) => {
    files = files.filter((_, i) => i !== index);
  };
</script>

<FileUpload
  label="Product Images"
  accept="image/*"
  multiple
  maxFiles={5}
  maxSize={5 * 1024 * 1024} // 5MB
  on:files={handleFiles}
  on:remove={handleRemove}
  helpText="Upload up to 5 images (max 5MB each)"
/>
```

## Best Practices

1. **Consistent Styling**: Use the provided theme variables for consistent colors, spacing, and typography.
2. **Accessibility**: Ensure all interactive elements are keyboard navigable and have proper ARIA attributes.
3. **Loading States**: Always show loading states for async operations.
4. **Error Handling**: Provide clear error messages and recovery options.
5. **Responsive Design**: Ensure components work well on all screen sizes.
6. **Performance**: Use `svelte:window` for global event listeners and clean them up when components are destroyed.
7. **Testing**: Write tests for all components, especially those with complex logic.

## Theme Customization

To customize the look and feel of the admin panel, modify the theme variables in `src/app.css`:

```css
:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --secondary: #6b7280;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --background: #ffffff;
  --foreground: #111827;
  --muted: #f3f4f6;
  --border: #e5e7eb;
  --radius: 0.5rem;
  --spacing-unit: 0.5rem;
}

.dark {
  --background: #111827;
  --foreground: #f9fafb;
  --muted: #1f2937;
  --border: #374151;
}
```
