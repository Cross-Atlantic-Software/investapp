# Postman Collection - InvestApp Backend APIs

## Base URL
```
http://localhost:3000/api
```

## Environment Variables
Create these variables in Postman:
- `base_url`: `http://localhost:3000/api`
- `frontend_token`: (JWT token for frontend user)
- `admin_token`: (JWT token for admin user)

---

## 🔐 Frontend Authentication APIs

### 1. User Registration
**POST** `{{base_url}}/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "country_code": "+1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "role": 1,
    "status": 1,
    "email_verified": 0,
    "phone_verified": 0,
    "auth_provider": "Email",
    "createdAt": "2025-01-18T10:00:00.000Z",
    "updatedAt": "2025-01-18T10:00:00.000Z"
  }
}
```

### 2. User Login
**POST** `{{base_url}}/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "role": 1,
      "auth_provider": "Email",
      "phone": "+1234567890",
      "status": 1,
      "country_code": "+1",
      "email_verified": 0,
      "phone_verified": 0,
      "createdAt": "2025-01-18T10:00:00.000Z",
      "updatedAt": "2025-01-18T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Verify Email
**POST** `{{base_url}}/auth/verify-email`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john.doe@example.com",
  "verification_code": "123456"
}
```

### 4. Complete Profile
**POST** `{{base_url}}/auth/complete-profile`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{frontend_token}}
```

**Body:**
```json
{
  "phone": "+1234567890",
  "country_code": "+1",
  "date_of_birth": "1990-01-01",
  "address": "123 Main St, City, State",
  "kyc_status": "pending"
}
```

---

## 🔧 Admin CMS APIs

### 1. CMS User Login
**POST** `{{base_url}}/admin/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "superadmin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "first_name": "Super",
      "last_name": "Admin",
      "email": "superadmin@example.com",
      "role": 11,
      "auth_provider": "Admin",
      "phone": null,
      "status": 1,
      "country_code": null,
      "email_verified": 1,
      "phone_verified": 0,
      "createdAt": "2025-01-18T10:00:00.000Z",
      "updatedAt": "2025-01-18T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 👥 User Management APIs (Admin Only)

### 1. Get All CMS Users
**GET** `{{base_url}}/admin/users`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Query Parameters:**
```
page=1&limit=10&search=john&role=10&status=1
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": 1,
        "first_name": "Super",
        "last_name": "Admin",
        "email": "superadmin@example.com",
        "role": 11,
        "auth_provider": "Admin",
        "phone": null,
        "status": 1,
        "country_code": null,
        "email_verified": 1,
        "phone_verified": 0,
        "createdAt": "2025-01-18T10:00:00.000Z",
        "updatedAt": "2025-01-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalUsers": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get CMS User by ID
**GET** `{{base_url}}/admin/users/1`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "first_name": "Super",
    "last_name": "Admin",
    "email": "superadmin@example.com",
    "role": 11,
    "auth_provider": "Admin",
    "phone": null,
    "status": 1,
    "country_code": null,
    "email_verified": 1,
    "phone_verified": 0,
    "createdAt": "2025-01-18T10:00:00.000Z",
    "updatedAt": "2025-01-18T10:00:00.000Z"
  }
}
```

### 3. Create New CMS User
**POST** `{{base_url}}/admin/users`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body:**
```json
{
  "first_name": "John",
  "last_name": "Manager",
  "email": "john.manager@example.com",
  "password": "password123",
  "role": 10,
  "phone": "+1234567890",
  "country_code": "+1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "first_name": "John",
    "last_name": "Manager",
    "email": "john.manager@example.com",
    "role": 10,
    "auth_provider": "Admin",
    "phone": "+1234567890",
    "status": 1,
    "country_code": "+1",
    "email_verified": 0,
    "phone_verified": 0,
    "createdAt": "2025-01-18T10:00:00.000Z",
    "updatedAt": "2025-01-18T10:00:00.000Z"
  }
}
```

### 4. Update CMS User
**PUT** `{{base_url}}/admin/users/2`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

**Body:**
```json
{
  "first_name": "John Updated",
  "last_name": "Manager Updated",
  "phone": "+9876543210",
  "role": 12,
  "status": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 2,
    "first_name": "John Updated",
    "last_name": "Manager Updated",
    "email": "john.manager@example.com",
    "role": 12,
    "auth_provider": "Admin",
    "phone": "+9876543210",
    "status": 1,
    "country_code": "+1",
    "email_verified": 0,
    "phone_verified": 0,
    "createdAt": "2025-01-18T10:00:00.000Z",
    "updatedAt": "2025-01-18T10:01:00.000Z"
  }
}
```

### 5. Delete CMS User
**DELETE** `{{base_url}}/admin/users/2`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 6. Get User Statistics
**GET** `{{base_url}}/admin/users/stats`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Response:**
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "totalUsers": 5,
    "activeUsers": 4,
    "inactiveUsers": 1,
    "roleDistribution": {
      "Admin": 1,
      "SuperAdmin": 1,
      "Blogger": 2,
      "SiteManager": 1
    }
  }
}
```

---

## 📈 Stock Management APIs (Admin Only)

### 1. Get All Stocks
**GET** `{{base_url}}/admin/stocks`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Query Parameters:**
```
page=1&limit=10&search=apple&sortBy=createdAt&sortOrder=DESC
```

**Response:**
```json
{
  "success": true,
  "message": "Stocks retrieved successfully",
  "data": {
    "stocks": [
      {
        "id": 1,
        "title": "Apple Inc.",
        "icon": "https://example.com/apple-icon.png",
        "company_name": "Apple Inc.",
        "price_per_share": "$150.00",
        "valuation": "$2.5T",
        "price_change": "+$2.50",
        "percentage_change": "+1.69%",
        "createdAt": "2025-01-18T10:00:00.000Z",
        "updatedAt": "2025-01-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalStocks": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### 2. Get Stock by ID
**GET** `{{base_url}}/admin/stocks/1`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock retrieved successfully",
  "data": {
    "id": 1,
    "title": "Apple Inc.",
    "icon": "https://example.com/apple-icon.png",
    "company_name": "Apple Inc.",
    "price_per_share": "$150.00",
    "valuation": "$2.5T",
    "price_change": "+$2.50",
    "percentage_change": "+1.69%",
    "createdAt": "2025-01-18T10:00:00.000Z",
    "updatedAt": "2025-01-18T10:00:00.000Z"
  }
}
```

### 3. Create New Stock
**POST** `{{base_url}}/admin/stocks`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Body (Form Data):**
```
title: Microsoft Corporation
company_name: Microsoft Corporation
price_per_share: $300.00
valuation: $2.2T
price_change: +$5.20
percentage_change: +1.76%
icon: [FILE] (optional - upload image file)
```

**Note:** Use `form-data` in Postman, not `raw` JSON. The `icon` field should be a file upload.

**Response:**
```json
{
  "success": true,
  "message": "Stock created successfully",
  "data": {
    "id": 2,
    "title": "Microsoft Corporation",
    "icon": "https://example.com/microsoft-icon.png",
    "company_name": "Microsoft Corporation",
    "price_per_share": "$300.00",
    "valuation": "$2.2T",
    "price_change": "+$5.20",
    "percentage_change": "+1.76%",
    "createdAt": "2025-01-18T10:00:00.000Z",
    "updatedAt": "2025-01-18T10:00:00.000Z"
  }
}
```

### 4. Update Stock
**PUT** `{{base_url}}/admin/stocks/2`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Body (Form Data):**
```
title: Microsoft Corporation Updated
price_per_share: $305.00
price_change: +$10.20
percentage_change: +3.46%
icon: [FILE] (optional - upload new image file)
```

**Note:** Use `form-data` in Postman, not `raw` JSON. The `icon` field should be a file upload. If no file is provided, the existing icon will be kept.

**Response:**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "id": 2,
    "title": "Microsoft Corporation Updated",
    "icon": "https://example.com/microsoft-icon.png",
    "company_name": "Microsoft Corporation",
    "price_per_share": "$305.00",
    "valuation": "$2.2T",
    "price_change": "+$10.20",
    "percentage_change": "+3.46%",
    "createdAt": "2025-01-18T10:00:00.000Z",
    "updatedAt": "2025-01-18T10:01:00.000Z"
  }
}
```

### 5. Delete Stock
**DELETE** `{{base_url}}/admin/stocks/2`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock deleted successfully"
}
```

### 6. Get Stock Statistics
**GET** `{{base_url}}/admin/stocks/stats`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock statistics retrieved successfully",
  "data": {
    "totalStocks": 10,
    "activeStocks": 8,
    "inactiveStocks": 2,
    "averagePrice": "$250.50",
    "totalValuation": "$25.5T"
  }
}
```

---

## 🏥 Health Check APIs

### 1. Basic Health Check
**GET** `{{base_url}}/health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-18T10:00:00.000Z",
    "uptime": "2h 30m 15s"
  }
}
```

### 2. Database Status
**GET** `{{base_url}}/health/database`

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "status": "connected",
    "database": "investapp",
    "host": "localhost",
    "port": 5432,
    "responseTime": "15ms"
  }
}
```

### 3. System Information
**GET** `{{base_url}}/health/system`

**Response:**
```json
{
  "success": true,
  "message": "System information retrieved",
  "data": {
    "nodeVersion": "v18.17.0",
    "platform": "win32",
    "arch": "x64",
    "memoryUsage": {
      "rss": "45.2 MB",
      "heapTotal": "8.1 MB",
      "heapUsed": "6.2 MB",
      "external": "1.1 MB"
    },
    "uptime": "2h 30m 15s"
  }
}
```

---

## 📝 Postman Collection Setup

### 1. Create Environment
1. Click on "Environments" in Postman
2. Click "Create Environment"
3. Name it "InvestApp Backend"
4. Add these variables:
   - `base_url`: `http://localhost:3000/api`
   - `frontend_token`: (leave empty, will be set after login)
   - `admin_token`: (leave empty, will be set after login)

### 2. Create Collection
1. Click "Collections" in Postman
2. Click "Create Collection"
3. Name it "InvestApp Backend APIs"
4. Create folders:
   - `Frontend Auth`
   - `Admin CMS`
   - `User Management`
   - `Stock Management`
   - `Health Check`

### 3. Import Collection
You can also import this collection by copying the JSON structure and importing it into Postman.

---

## 🔑 Authentication Flow

### For Frontend Users:
1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login` → Get `frontend_token`
3. Use `frontend_token` in Authorization header for protected routes

### For Admin Users:
1. Login: `POST /api/admin/login` → Get `admin_token`
2. Use `admin_token` in Authorization header for admin routes

---

## ⚠️ Important Notes

1. **Separate Systems**: Frontend and Admin are completely separate
2. **Different Tokens**: Use appropriate token for each system
3. **Role-Based Access**: Admin routes require Admin/SuperAdmin roles
4. **Environment Variables**: Set up Postman environment for easy testing
5. **Error Handling**: All APIs return consistent error format
6. **Pagination**: List endpoints support pagination with `page` and `limit` parameters
7. **File Uploads**: Stock creation/update supports icon uploads to AWS S3
8. **S3 Configuration**: Ensure AWS credentials are properly configured in environment variables

---

## 🚀 Quick Start Testing

1. **Start the server**: `npm run dev`
2. **Test health**: `GET /api/health`
3. **Create admin user** (if not exists): Use the create user API
4. **Login as admin**: `POST /api/admin/login`
5. **Copy the token** to `admin_token` variable
6. **Test admin APIs** with the token in Authorization header
