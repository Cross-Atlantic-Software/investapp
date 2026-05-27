# Admin CMS Backend Implementation

This document describes the backend implementation for the Admin CMS system that supports the NextAdmin.co-style admin panel.

## Overview

The Admin CMS provides comprehensive backend APIs for managing users and stocks, designed to work with a NextAdmin.co-style frontend admin panel. The system includes:

- **User Management**: CRUD operations for user accounts
- **Stock Management**: CRUD operations for stock/products
- **Admin Authentication**: JWT-based authentication with role-based access control
- **Statistics & Analytics**: Dashboard data for admin panels
- **Bulk Operations**: Efficient bulk operations for managing multiple records

## Architecture

### Models

#### User Model (`src/Models/User.ts`)
- Manages user accounts with role-based access
- Supports multiple authentication providers (Email, Google, Phone)
- Includes email/phone verification status
- Password hashing with bcrypt

#### Product Model (`src/Models/Product.ts`)
- Manages stock/product information
- Links to users via foreign key relationship
- Stores financial data (price, valuation, changes)

### Controllers

#### User Management (`src/controllers/admin/userManagement.ts`)
- `getAllUsers`: Paginated user listing with search
- `getUserById`: Get specific user details
- `createUser`: Create new user accounts
- `updateUser`: Update existing user information
- `deleteUser`: Remove user accounts (with admin protection)
- `getUserStats`: Dashboard statistics for users

#### Stock Management (`src/controllers/admin/stockManagement.ts`)
- `getAllStocks`: Paginated stock listing with search
- `getStockById`: Get specific stock details
- `createStock`: Create new stock entries
- `updateStock`: Update existing stock information
- `deleteStock`: Remove stock entries
- `getStockStats`: Dashboard statistics for stocks
- `bulkDeleteStocks`: Delete multiple stocks at once

### Routes

#### Admin Routes (`src/routes/admin-routes.ts`)
All admin routes are prefixed with `/api/admin` and protected by admin middleware:

**User Management:**
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/stats` - User statistics
- `GET /api/admin/users/:id` - Get user by ID
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

**Stock Management:**
- `GET /api/admin/stocks` - List all stocks
- `GET /api/admin/stocks/stats` - Stock statistics
- `GET /api/admin/stocks/:id` - Get stock by ID
- `POST /api/admin/stocks` - Create new stock
- `PUT /api/admin/stocks/:id` - Update stock
- `DELETE /api/admin/stocks/:id` - Delete stock
- `DELETE /api/admin/stocks/bulk` - Bulk delete stocks

### Authentication & Authorization

#### Admin Middleware (`src/utils/middleware/admin-middleware.ts`)
- Validates JWT tokens from request headers
- Ensures only Admin (role: 10) or SuperAdmin (role: 11) users can access admin endpoints
- Attaches user information to request object

#### Role System
The system supports multiple user roles:
- **Frontend Users**: RetailInvestor, HNIs_UHNIs, NRI, InstitutionalInvestor, Intermediary_Broker
- **Backend CMS Users**: Admin, SuperAdmin, Blogger, SiteManager

## Database Schema

### Users Table (Frontend Users)
```sql
CREATE TABLE users (
  id INTEGER UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role INTEGER NOT NULL DEFAULT 3,
  phone VARCHAR(255),
  status INTEGER DEFAULT 1,
  country_code VARCHAR(255),
  email_verified INTEGER DEFAULT 0,
  phone_verified INTEGER DEFAULT 0,
  auth_provider VARCHAR(255) NOT NULL DEFAULT 'Email',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### CMS Users Table (Admin-Created Users)
```sql
CREATE TABLE cms_users (
  id INTEGER UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role INTEGER NOT NULL DEFAULT 12,
  phone VARCHAR(255),
  status INTEGER DEFAULT 1,
  country_code VARCHAR(255),
  email_verified INTEGER DEFAULT 1,
  phone_verified INTEGER DEFAULT 0,
  auth_provider VARCHAR(255) NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(255),
  company_name VARCHAR(255),
  price_per_share VARCHAR(255),
  valuation VARCHAR(255),
  price_change VARCHAR(255),
  percentage_change VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API Features

### Pagination
All list endpoints support pagination:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Search
User and stock listing endpoints support search:
- **Users**: Search by first name, last name, email, or phone
- **Stocks**: Search by title or company name

### Statistics
Comprehensive statistics for dashboard widgets:
- **User Stats**: Total users, verified users, active users, users by role/provider
- **Stock Stats**: Total stocks, stocks by company, recent stocks, price statistics

### Error Handling
Consistent error responses across all endpoints:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Ensure your `.env` file includes:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database
   TOKEN_SECRET=your_jwt_secret
   ```

3. **Database Setup**
   The system will automatically create tables on startup in development mode.

4. **Create Admin User**
   Create an admin user in your database with role = 10 (Admin) or 11 (SuperAdmin).

5. **Start Server**
   ```bash
   npm start
   ```

## Testing

Use the provided test script to verify admin functionality:

1. Update `test-admin-api.js` with a valid admin JWT token
2. Run the test:
   ```bash
   node test-admin-api.js
   ```

## Frontend Integration

This backend is designed to work seamlessly with NextAdmin.co-style admin panels. The API responses are structured to support:

- **Data Tables**: Paginated lists with search and sorting
- **Dashboard Widgets**: Statistics and analytics data
- **Form Handling**: Create and update operations
- **Bulk Operations**: Efficient multi-record management
- **Real-time Updates**: Consistent data structure for frontend state management

## Security Considerations

- All admin endpoints require valid JWT authentication
- Role-based access control prevents unauthorized access
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection protection via Sequelize ORM
- Admin users cannot be deleted for security

## Performance Features

- Database connection pooling
- Pagination to handle large datasets
- Efficient queries with proper indexing
- Bulk operations for better performance
- Optimized statistics queries

## Monitoring

The system includes health check endpoints for monitoring:
- `GET /api/health/health` - Basic health check
- `GET /api/health/poolStatus` - Database connection pool status
- `GET /api/health/systemInfo` - System information

## Future Enhancements

- Audit logging for admin actions
- Advanced filtering and sorting options
- Export functionality for data
- Real-time notifications
- Advanced analytics and reporting
- Multi-tenant support
