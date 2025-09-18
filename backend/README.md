# InvestApp Backend

A robust Node.js backend service for the InvestApp platform, providing authentication, user management, and API services.

## 📚 Documentation

For comprehensive documentation, visit the [docs](./docs/) directory:

- **[📖 Main Documentation](./docs/README.md)** - Complete documentation index
- **[🔐 Authentication](./docs/auth/)** - Google OAuth and authentication setup
- **[🔌 API Reference](./docs/api/)** - Detailed API endpoint documentation
- **[🛠️ Development Guide](./docs/development/)** - Development setup and standards
- **[🚀 Deployment Guide](./docs/deployment/)** - Production deployment strategies

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## 🏗️ Architecture

The backend follows a modular controller architecture:

- **Authentication Services** - User registration, login, email verification
- **Google OAuth Integration** - Seamless Google authentication
- **Health Monitoring** - System health checks and monitoring
- **Database Management** - MySQL with Sequelize ORM

## 🔧 Key Features

- ✅ JWT-based authentication
- ✅ Google OAuth 2.0 integration
- ✅ Email verification system
- ✅ Modular controller architecture
- ✅ Comprehensive error handling
- ✅ Health check endpoints
- ✅ Database connection pooling
- ✅ TypeScript support

## 📞 Support

For issues and questions, check the documentation in the `docs/` directory or review the troubleshooting guides.