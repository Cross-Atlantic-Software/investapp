# Admin CMS API Documentation

This document describes the admin CMS API endpoints for managing users and stocks.

**IMPORTANT:** This is a completely separate system from the frontend user authentication. CMS users and frontend users are stored in different tables and have different login systems.

## Authentication

All admin endpoints require authentication via JWT token in the `token` header. The user must be a CMS user with Admin (role: 10) or SuperAdmin (role: 11) role.

### CMS Login
- **POST** `/api/admin/login`
- **Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "first_name": "Admin",
      "last_name": "User",
      "email": "admin@example.com",
      "role": 10,
      "status": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## Base URL

All admin endpoints are prefixed with `/api/admin`

## User Management

### Get All Users
- **GET** `/api/admin/users`
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term for name, email, or phone

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Get User by ID
- **GET** `/api/admin/users/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "role": 1,
    "phone": "+1234567890",
    "status": 1,
    "email_verified": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create User
- **POST** `/api/admin/users`
- **Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": 12,
  "phone": "+1234567890",
  "country_code": "+1",
}
```

**Note:** `auth_provider` is automatically set to "Admin" for all admin-created users.

### Update User
- **PUT** `/api/admin/users/:id`
- **Body:** (all fields optional)
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "password": "newpassword123",
  "role": 2,
  "phone": "+0987654321",
  "status": 1,
  "email_verified": 1,
  "phone_verified": 0
}
```

### Delete User
- **DELETE** `/api/admin/users/:id`

### Get User Statistics
- **GET** `/api/admin/users/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "verifiedUsers": 85,
    "activeUsers": 90,
    "usersByRole": [...],
    "usersByProvider": [...]
  }
}
```

## Stock Management

### Get All Stocks
- **GET** `/api/admin/stocks`
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search term for title or company name

**Response:**
```json
{
  "success": true,
  "data": {
    "stocks": [
      {
        "id": 1,
        "title": "Apple Inc.",
        "icon": "apple-icon.png",
        "company_name": "Apple Inc.",
        "price_per_share": "150.00",
        "valuation": "2.5T",
        "price_change": "+2.50",
        "percentage_change": "+1.69%",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalStocks": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Get Stock by ID
- **GET** `/api/admin/stocks/:id`

### Create Stock
- **POST** `/api/admin/stocks`
- **Body:**
```json
{
  "title": "Apple Inc.",
  "icon": "apple-icon.png",
  "company_name": "Apple Inc.",
  "price_per_share": "150.00",
  "valuation": "2.5T",
  "price_change": "+2.50",
  "percentage_change": "+1.69%"
}
```

### Update Stock
- **PUT** `/api/admin/stocks/:id`
- **Body:** (all fields optional)
```json
{
  "title": "Apple Inc. Updated",
  "price_per_share": "155.00",
  "valuation": "2.6T",
  "price_change": "+5.00",
  "percentage_change": "+3.33%"
}
```

### Delete Stock
- **DELETE** `/api/admin/stocks/:id`

### Get Stock Statistics
- **GET** `/api/admin/stocks/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStocks": 100,
    "stocksByCompany": [...],
    "recentStocks": [...],
    "priceStats": {
      "avgPrice": "125.50",
      "minPrice": "10.00",
      "maxPrice": "500.00"
    }
  }
}
```

### Bulk Delete Stocks
- **DELETE** `/api/admin/stocks/bulk`
- **Body:**
```json
{
  "stockIds": [1, 2, 3, 4, 5]
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## User Roles

- `1`: Retail Investor
- `2`: HNIs/UHNIs
- `3`: NRI
- `4`: Institutional Investor
- `5`: Intermediary/Broker
- `10`: Admin
- `11`: Super Admin
- `12`: Blogger
- `13`: Site Manager

## Notes

- All timestamps are in ISO 8601 format
- Passwords are automatically hashed before storage
- Admin-created users are automatically email verified
- Admin users cannot be deleted
- All endpoints support pagination for list operations
- Search functionality is case-insensitive
