# 🔌 API Documentation

This directory contains detailed API documentation for all backend endpoints.

## 📋 API Endpoints Overview

### Authentication API (`/api/auth`)
- **POST** `/register` - User registration
- **POST** `/login` - User login  
- **POST** `/verify-email` - Email verification
- **POST** `/complete-profile` - Profile completion
- **GET** `/google` - Google OAuth initiation
- **GET** `/google/callback` - Google OAuth callback
- **POST** `/google/verify` - Google token verification

### Health Check API (`/api/health`)
- **GET** `/health` - Basic health check
- **GET** `/pool-status` - Database pool status
- **GET** `/system-info` - System information
- **GET** `/test-db` - Database connection test
- **POST** `/pool-monitoring/:action` - Pool monitoring control

## 📝 Request/Response Examples

### User Registration
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### User Login
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Google OAuth
```json
GET /api/auth/google
Response: {
  "status": true,
  "message": "Google OAuth URL generated successfully",
  "authUrl": "https://accounts.google.com/oauth/authorize?..."
}
```

## 🔒 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Response Format

All API responses follow this format:

```json
{
  "status": true|false,
  "message": "Success/Error message",
  "data": {}, // Optional data object
  "token": "jwt-token" // Optional for auth endpoints
}
```

## 🚨 Error Handling

Error responses include detailed information:

```json
{
  "status": false,
  "error": {
    "code": 400,
    "message": "Validation error",
    "details": "Specific error details"
  }
}
```

## 🔄 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
- `503` - Service Unavailable
