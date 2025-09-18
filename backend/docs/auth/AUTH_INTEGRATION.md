# Authentication Integration

This document describes the authentication integration implemented for the InvestApp project.

## Overview

The authentication system includes:
- User registration
- Email verification
- User login
- Protected routes
- Session management

## API Endpoints

The integration connects to the following backend endpoints:
- `POST http://localhost:8888/api/auth/register` - User registration
- `POST http://localhost:8888/api/auth/verify-email` - Email verification
- `POST http://localhost:8888/api/auth/login` - User login

## Files Added/Modified

### New Files
- `lib/api/auth.ts` - API service functions for authentication
- `lib/contexts/AuthContext.tsx` - React context for authentication state management
- `components/auth/ProtectedRoute.tsx` - Component for protecting routes that require authentication

### Modified Files
- `app/layout.tsx` - Added AuthProvider wrapper
- `app/(auth)/login/page.tsx` - Integrated login API
- `app/(auth)/register/step-1/page.tsx` - Integrated registration API
- `app/(auth)/register/step-2/page.tsx` - Integrated email verification API
- `app/(site)/dashboard/layout.tsx` - Added protected route wrapper
- `components/dashboard/dashboardSidebar.tsx` - Added user info and logout functionality

## Features

### Registration Flow
1. User enters email and password on `/register/step-1`
2. Form submits to registration API
3. On success, email is stored in localStorage and user is redirected to `/register/step-2`
4. User enters verification code on `/register/step-2`
5. Form submits to email verification API
6. On success, user can continue to step 3

### Login Flow
1. User enters email and password on `/login`
2. Form submits to login API
3. On success, user data and token are stored in localStorage and context
4. User is redirected to `/dashboard`

### Protected Routes
- Dashboard routes are protected by the `ProtectedRoute` component
- Unauthenticated users are redirected to `/login`
- Loading state is shown while checking authentication

### Session Management
- User data and token are stored in localStorage
- Authentication state is managed through React context
- Logout clears all stored data and redirects to login

## Error Handling

- API errors are caught and displayed to users
- Network errors are handled gracefully
- Form validation prevents invalid submissions
- Loading states prevent multiple submissions

## Usage

### Using the Auth Context
```tsx
import { useAuth } from '@/lib/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, error } = useAuth();
  
  // Use authentication state and methods
}
```

### Protecting Routes
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

## Backend Requirements

The backend should return responses in the following format:

### Registration Response
```json
{
  "status": true,
  "message": "User registered successfully",
  "token": "jwt_token",
  "data": {
    "role": 12,
    "auth_provider": "Email",
    "status": 1,
    "email_verified": 0,
    "phone_verified": 0,
    "id": 18,
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Login Response
```json
{
  "status": true,
  "message": "Login successful",
  "token": "jwt_token",
  "data": {
    "role": 12,
    "auth_provider": "Email",
    "status": 1,
    "email_verified": 1,
    "phone_verified": 0,
    "id": 18,
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Email Verification Response
```json
{
  "status": true,
  "message": "Email verified successfully"
}
```

## Environment Setup

Make sure your backend is running on `http://localhost:8888` or update the `API_BASE_URL` in `lib/api/auth.ts` to match your backend URL.
