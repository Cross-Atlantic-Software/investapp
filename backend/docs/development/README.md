# 🛠️ Development Guide

This guide covers development setup, coding standards, and best practices for the InvestApp backend.

## 🚀 Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MySQL database
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd investapp/backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables
# Edit .env with your database and service credentials

# Start development server
npm run dev
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── controllers/          # Modular controllers
│   │   ├── auth/            # Authentication services
│   │   ├── googleAuth/      # Google OAuth services
│   │   └── health/          # Health check services
│   ├── Models/              # Database models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   └── app.ts               # Main application file
├── docs/                    # Documentation
├── package.json
└── tsconfig.json
```

## 📝 Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces for all data structures
- Use type annotations for function parameters and return types
- Avoid `any` type unless absolutely necessary

### Code Organization
- Follow modular controller structure
- Separate concerns into different service files
- Use dependency injection where appropriate
- Keep functions small and focused

### Error Handling
- Use try-catch blocks for async operations
- Provide meaningful error messages
- Log errors for debugging
- Return appropriate HTTP status codes

### Database
- Use Sequelize ORM for database operations
- Define proper model relationships
- Use transactions for complex operations
- Validate data before database operations

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- Unit tests for individual functions
- Integration tests for API endpoints
- Mock external dependencies
- Test error scenarios

## 🔧 Development Tools

### Linting
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Type Checking
```bash
# Run TypeScript compiler
npm run build

# Check types without building
npx tsc --noEmit
```

## 📦 Dependencies

### Core Dependencies
- `express` - Web framework
- `sequelize` - ORM for database operations
- `jsonwebtoken` - JWT token handling
- `bcryptjs` - Password hashing
- `google-auth-library` - Google OAuth integration

### Development Dependencies
- `typescript` - TypeScript compiler
- `ts-node-dev` - Development server with hot reload
- `@types/*` - TypeScript type definitions
- `eslint` - Code linting

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set:
- Database configuration
- JWT secret
- Google OAuth credentials
- Email service configuration

### Build Process
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🐛 Debugging

### Logging
- Use `console.log` for development debugging
- Implement proper logging levels
- Log important operations and errors
- Use structured logging format

### Common Issues
1. **Database Connection**: Check connection string and credentials
2. **JWT Issues**: Verify TOKEN_SECRET is set
3. **Google OAuth**: Check redirect URIs and client credentials
4. **Email Service**: Verify SMTP configuration

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
