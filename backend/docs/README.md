# 📚 Backend Documentation

This directory contains all the documentation for the InvestApp backend services.

## 📋 Documentation Index

### 🔐 Authentication & Authorization
- **[Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)** - Complete guide for setting up Google OAuth 2.0 authentication
- **[Auth Integration](./AUTH_INTEGRATION.md)** - Frontend-backend authentication integration guide

### 🏗️ Architecture
- **[Controller Structure](../src/controllers/)** - Modular controller architecture
  - `auth/` - Authentication services (register, login, verify email, complete profile)
  - `googleAuth/` - Google OAuth services (auth, callback, token verification)
  - `health/` - Health check and monitoring services

### 🛠️ Development
- **[Backend README](../README.md)** - Main backend documentation
- **[API Routes](../src/routes/)** - API endpoint definitions
- **[Database Models](../src/Models/)** - Database schema and models
- **[Utilities](../src/utils/)** - Helper functions and utilities

## 🚀 Quick Start

1. **Environment Setup**: Copy `.env.example` to `.env` and configure your environment variables
2. **Dependencies**: Run `npm install` to install all dependencies
3. **Database**: Ensure your database is running and accessible
4. **Development**: Run `npm run dev` to start the development server

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/complete-profile` - Profile completion
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/google/verify` - Google token verification

### Health Check Endpoints
- `GET /api/health/health` - Basic health check
- `GET /api/health/pool-status` - Database pool status
- `GET /api/health/system-info` - System information
- `GET /api/health/test-db` - Database connection test

## 🔧 Configuration

### Environment Variables
```env
# Database Configuration
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name

# JWT Configuration
TOKEN_SECRET=your-jwt-secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8888/api/auth/google/callback

# Email Configuration
SMTP_MAIL=your-email@example.com
SMTP_PASSWORD=your-email-password
```

## 📝 Contributing

1. Follow the modular controller structure
2. Add proper error handling and logging
3. Update documentation for new features
4. Test all endpoints before submitting

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Check your database credentials and connection
2. **Google OAuth**: Verify your Google Cloud Console configuration
3. **JWT Tokens**: Ensure TOKEN_SECRET is set in environment variables
4. **Email Service**: Check SMTP configuration for email verification

### Debug Mode
Enable debug logging by setting `NODE_ENV=development` in your environment variables.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the specific documentation files
3. Check the backend logs for error details
4. Ensure all environment variables are properly configured
