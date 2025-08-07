# Admin Panel API Documentation

This document provides detailed information about the Admin Panel API endpoints, including request/response formats and example usage.

## Authentication

All API endpoints require authentication using a JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## Base URL

All API endpoints are prefixed with `/api/admin`.

## Error Responses

Common error responses:

- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have admin privileges
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Products

### List Products

**GET** `/products`

List all products with pagination and filtering.

#### Query Parameters

| Parameter | Type    | Required | Description                          |
|-----------|---------|----------|--------------------------------------|
| page      | integer | No       | Page number (default: 1)             |
| limit     | integer | No       | Items per page (default: 10, max: 50)|
| search    | string  | No       | Search term for product name/desc    |
| status    | string  | No       | Filter by status (active/draft)      |

#### Example Request

```http
GET /api/admin/products?page=1&limit=10&status=active
```

#### Example Response (200 OK)

```json
{
  "data": [
    {
      "id": "prod_123",
      "name": "Running Shoes",
      "description": "High-performance running shoes",
      "price": 129.99,
      "stock": 50,
      "status": "active",
      "category": "shoes",
      "images": ["image1.jpg", "image2.jpg"],
      "createdAt": "2023-08-01T12:00:00Z",
      "updatedAt": "2023-08-01T12:00:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### Get Product

**GET** `/products/:id`

Get a single product by ID.

#### Example Request

```http
GET /api/admin/products/prod_123
```

#### Example Response (200 OK)

```json
{
  "id": "prod_123",
  "name": "Running Shoes",
  "description": "High-performance running shoes",
  "price": 129.99,
  "stock": 50,
  "status": "active",
  "category": "shoes",
  "images": ["image1.jpg", "image2.jpg"],
  "variants": [
    {
      "id": "var_123",
      "size": "10",
      "color": "blue",
      "stock": 20
    }
  ],
  "createdAt": "2023-08-01T12:00:00Z",
  "updatedAt": "2023-08-01T12:00:00Z"
}
```

### Create Product

**POST** `/products`

Create a new product.

#### Request Body

```typescript
{
  name: string;           // Required
  description: string;    // Required
  price: number;          // Required, must be positive
  stock: number;          // Required, must be >= 0
  category: string;       // Required, must be a valid category
  status?: 'active' | 'draft' | 'archived'; // Default: 'draft'
  images?: string[];      // Array of image URLs
  variants?: Array<{      // Optional product variants
    size: string;
    color: string;
    stock: number;
  }>;
}
```

#### Example Request

```http
POST /api/admin/products
Content-Type: application/json

{
  "name": "New Running Shoes",
  "description": "Latest model of running shoes",
  "price": 149.99,
  "stock": 30,
  "category": "shoes",
  "status": "active"
}
```

#### Example Response (201 Created)

```json
{
  "id": "prod_124",
  "name": "New Running Shoes",
  "description": "Latest model of running shoes",
  "price": 149.99,
  "stock": 30,
  "status": "active",
  "category": "shoes",
  "images": [],
  "variants": [],
  "createdAt": "2023-08-06T15:30:00Z",
  "updatedAt": "2023-08-06T15:30:00Z"
}
```

### Update Product

**PATCH** `/products/:id`

Update an existing product.

#### Request Body

Same as Create Product, but all fields are optional.

#### Example Request

```http
PATCH /api/admin/products/prod_124
Content-Type: application/json

{
  "price": 139.99,
  "stock": 25
}
```

#### Example Response (200 OK)

```json
{
  "id": "prod_124",
  "name": "New Running Shoes",
  "description": "Latest model of running shoes",
  "price": 139.99,
  "stock": 25,
  "status": "active",
  "category": "shoes",
  "images": [],
  "variants": [],
  "createdAt": "2023-08-06T15:30:00Z",
  "updatedAt": "2023-08-06T16:45:00Z"
}
```

### Delete Product

**DELETE** `/products/:id`

Delete a product.

#### Example Request

```http
DELETE /api/admin/products/prod_124
```

#### Example Response (200 OK)

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

## Categories

### List Categories

**GET** `/categories`

Get all product categories.

#### Example Request

```http
GET /api/admin/categories
```

#### Example Response (200 OK)

```json
[
  {
    "id": "cat_1",
    "name": "Shoes",
    "slug": "shoes",
    "description": "Footwear products"
  },
  {
    "id": "cat_2",
    "name": "Accessories",
    "slug": "accessories",
    "description": "Sports accessories"
  }
]
```

## Orders

### List Orders

**GET** `/orders`

List all orders with filtering and pagination.

#### Query Parameters

| Parameter   | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| page        | integer | No       | Page number (default: 1)             |
| limit       | integer | No       | Items per page (default: 10, max: 50)|
| status      | string  | No       | Filter by order status               |
| customerId  | string  | No       | Filter by customer ID                |
| startDate   | string  | No       | Filter orders after this date (ISO)  |
| endDate     | string  | No       | Filter orders before this date (ISO) |

#### Example Request

```http
GET /api/admin/orders?status=completed&limit=5
```

#### Example Response (200 OK)

```json
{
  "data": [
    {
      "id": "order_123",
      "customerId": "cust_123",
      "status": "completed",
      "total": 299.98,
      "items": [
        {
          "productId": "prod_123",
          "name": "Running Shoes",
          "quantity": 2,
          "price": 149.99
        }
      ],
      "shippingAddress": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "USA"
      },
      "paymentStatus": "paid",
      "createdAt": "2023-08-05T10:30:00Z",
      "updatedAt": "2023-08-05T10:35:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 5,
    "totalPages": 1
  }
}
```

### Update Order Status

**PATCH** `/orders/:id/status`

Update the status of an order.

#### Request Body

```typescript
{
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;  // Required when status is 'shipped'
}
```

#### Example Request

```http
PATCH /api/admin/orders/order_123/status
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "1Z999AA1234567890"
}
```

#### Example Response (200 OK)

```json
{
  "success": true,
  "message": "Order status updated successfully",
  "order": {
    "id": "order_123",
    "status": "shipped",
    "trackingNumber": "1Z999AA1234567890",
    "updatedAt": "2023-08-06T14:20:00Z"
  }
}
```
