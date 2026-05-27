# Google OAuth 2.0 Integration Guide

This guide explains how to set up and use Google OAuth 2.0 authentication in your InvestApp.

## Prerequisites

1. **Google Cloud Console Setup**
   - Project created in Google Cloud Console
   - Google Identity Toolkit API enabled
   - OAuth 2.0 credentials configured

2. **Environment Variables**
   - Backend `.env` file configured with Google credentials
   - Redirect URIs properly set in Google Console

## Environment Configuration

### Backend (.env)
```env
# ===========================================
# GOOGLE OAUTH CONFIGURATION
# ===========================================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8888/api/auth/google/callback
```

> ⚠️ **Security Warning**: Replace the placeholder values above with your actual Google OAuth credentials. Never commit real secrets to version control!

### Frontend (.env.local)
```env
# ===========================================
# GOOGLE OAUTH CONFIGURATION (Frontend)
# ===========================================
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

> ⚠️ **Security Warning**: Replace the placeholder value above with your actual Google Client ID. The Client ID can be public, but ensure your Client Secret is never exposed in frontend code!

## Google Cloud Console Configuration

### Authorized JavaScript Origins
```
http://localhost:3000
http://localhost:8888
```

### Authorized Redirect URIs
```
http://localhost:8888/api/auth/google/callback
```

## Implementation Overview

### Backend Structure

1. **GoogleAuthController** (`/backend/src/controllers/GoogleAuthController.ts`)
   - Handles Google OAuth flow
   - Manages user creation/login with Google accounts
   - Generates JWT tokens for authenticated users

2. **Auth Routes** (`/backend/src/routes/auth-routes.ts`)
   - `GET /api/auth/google` - Initiate Google OAuth
   - `GET /api/auth/google/callback` - Handle OAuth callback
   - `POST /api/auth/google/verify` - Verify Google ID token

### Frontend Structure

1. **Auth API** (`/frontend/lib/api/auth.ts`)
   - `googleAuth()` - Get Google OAuth URL
   - `googleTokenVerify()` - Verify Google ID token

2. **Auth Context** (`/frontend/lib/contexts/AuthContext.tsx`)
   - Provides Google authentication methods
   - Manages authentication state

3. **Google Auth Pages**
   - `/auth/google/success` - Success callback handler
   - `/auth/google/error` - Error callback handler

## How It Works

### Authentication Flow

1. **User clicks "Register with Google"**
   - Frontend calls `googleAuth()` from AuthContext
   - Backend generates Google OAuth URL
   - User is redirected to Google's consent screen

2. **User authorizes the application**
   - Google redirects to backend callback URL
   - Backend exchanges authorization code for tokens
   - Backend verifies user identity with Google
   - Backend creates/updates user in database
   - Backend generates JWT token
   - User is redirected to frontend success page with token

3. **Frontend processes the authentication**
   - Success page extracts token from URL parameters
   - Token is stored in localStorage
   - User is redirected to dashboard

### User Data Handling

- **New Users**: Created with Google profile information
- **Existing Users**: Updated to link Google account
- **Email Verification**: Google accounts are pre-verified
- **Password**: Random password generated for Google users

### Database Integration

Users created via Google OAuth have:
- `auth_provider`: "Google"
- `email_verified`: 1 (pre-verified)
- `first_name` and `last_name` from Google profile
- Random generated password

## Usage

### Frontend Component
```tsx
import { useAuth } from '@/lib/contexts/AuthContext';

function LoginComponent() {
  const { googleAuth, isLoading, error } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await googleAuth();
    } catch (err) {
      console.error('Google auth failed:', err);
    }
  };

  return (
    <button onClick={handleGoogleLogin} disabled={isLoading}>
      {isLoading ? 'Connecting...' : 'Sign in with Google'}
    </button>
  );
}
```

### API Endpoints

#### Get Google OAuth URL
```bash
GET /api/auth/google
```

**Response:**
```json
{
  "status": true,
  "message": "Google OAuth URL generated successfully",
  "authUrl": "https://accounts.google.com/oauth/authorize?..."
}
```

#### OAuth Callback
```bash
GET /api/auth/google/callback?code=...&state=...
```

**Response:** Redirects to frontend with token

#### Verify Google ID Token
```bash
POST /api/auth/google/verify
Content-Type: application/json

{
  "idToken": "google_id_token_here"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Google authentication successful",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "auth_provider": "Google",
    "email_verified": 1
  },
  "token": "jwt_token_here"
}
```

## Error Handling

### Frontend Error Handling
- Network errors are caught and displayed to users
- Authentication failures redirect to error page
- Loading states prevent multiple requests

### Backend Error Handling
- Invalid tokens return appropriate HTTP status codes
- Database errors are logged and handled gracefully
- OAuth callback errors redirect to frontend error page

## Security Features

1. **Token Verification**: All Google ID tokens are verified server-side
2. **CSRF Protection**: State parameter used in OAuth flow
3. **Secure Storage**: JWT tokens stored securely in localStorage
4. **Input Validation**: All user inputs validated before processing
5. **Error Logging**: Failed authentication attempts are logged

## Testing

### Test Users
Add test users in Google Cloud Console OAuth consent screen:
- `your-test-email@example.com` (configure in Google Console)

### Development URLs
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8888`

## Production Deployment

### Update Environment Variables
```env
# Production backend .env
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

# Production frontend .env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-client-id
```

### Update Google Cloud Console
1. Add production domains to Authorized JavaScript origins
2. Add production callback URL to Authorized redirect URIs
3. Update OAuth consent screen with production URLs

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check Google Console redirect URI configuration
   - Ensure exact match with backend URL

2. **"Token verification failed"**
   - Verify Google Client ID in environment variables
   - Check if ID token is properly formatted

3. **"User creation failed"**
   - Check database connection
   - Verify User model accepts Google provider

4. **Frontend redirect issues**
   - Ensure callback pages exist at correct paths
   - Check URL parameter parsing in success/error pages

### Debug Mode
Enable debug logging by adding console.log statements in:
- `GoogleAuthController.ts` methods
- Frontend auth API calls
- Auth context error handlers

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify environment variables are correctly set
3. Test with Google OAuth Playground for token validation
4. Review Google Cloud Console audit logs
