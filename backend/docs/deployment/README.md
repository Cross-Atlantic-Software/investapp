# 🚀 Deployment Guide

This guide covers deployment strategies and configurations for the InvestApp backend.

## 🌐 Deployment Options

### 1. Traditional Server Deployment
- VPS/Cloud Server (AWS EC2, DigitalOcean, etc.)
- Docker containers
- PM2 process management

### 2. Cloud Platform Deployment
- AWS Elastic Beanstalk
- Google Cloud Run
- Heroku
- Railway

### 3. Container Deployment
- Docker with Docker Compose
- Kubernetes
- AWS ECS/Fargate

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8888

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8888:8888"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=investapp
      - DB_PASSWORD=secure_password
      - DB_NAME=investapp
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=investapp
      - MYSQL_USER=investapp
      - MYSQL_PASSWORD=secure_password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

## ☁️ Cloud Deployment

### AWS Elastic Beanstalk
1. Create application in AWS Console
2. Upload application bundle
3. Configure environment variables
4. Set up RDS database
5. Configure load balancer

### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/investapp-backend
gcloud run deploy --image gcr.io/PROJECT-ID/investapp-backend --platform managed
```

### Heroku
```bash
# Install Heroku CLI
# Login and create app
heroku login
heroku create investapp-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
# ... other environment variables

# Deploy
git push heroku main
```

## 🔧 Environment Configuration

### Production Environment Variables
```env
NODE_ENV=production
PORT=8888

# Database
DB_HOST=your-production-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
DB_NAME=investapp_production

# JWT
TOKEN_SECRET=your-super-secure-jwt-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

# Email
SMTP_MAIL=your-production-email@domain.com
SMTP_PASSWORD=your-email-password
```

## 🛡️ Security Considerations

### SSL/TLS
- Use HTTPS in production
- Configure SSL certificates
- Redirect HTTP to HTTPS

### Database Security
- Use strong passwords
- Enable SSL connections
- Restrict database access
- Regular backups

### API Security
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention

## 📊 Monitoring & Logging

### Application Monitoring
- Health check endpoints
- Performance metrics
- Error tracking
- Uptime monitoring

### Logging
```javascript
// Production logging configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build application
      run: npm run build
      
    - name: Deploy to production
      run: |
        # Your deployment commands here
```

## 📈 Performance Optimization

### Database Optimization
- Connection pooling
- Query optimization
- Indexing
- Caching

### Application Optimization
- Compression middleware
- Static file serving
- Memory management
- Process clustering

## 🔍 Troubleshooting

### Common Deployment Issues
1. **Port Configuration**: Ensure correct port mapping
2. **Environment Variables**: Verify all required variables are set
3. **Database Connection**: Check network connectivity and credentials
4. **SSL Certificates**: Ensure certificates are valid and properly configured

### Health Checks
```bash
# Check application health
curl https://yourdomain.com/api/health/health

# Check database connection
curl https://yourdomain.com/api/health/test-db

# Check system information
curl https://yourdomain.com/api/health/system-info
```

## 📞 Support

For deployment issues:
1. Check application logs
2. Verify environment configuration
3. Test database connectivity
4. Review security settings
5. Monitor resource usage
