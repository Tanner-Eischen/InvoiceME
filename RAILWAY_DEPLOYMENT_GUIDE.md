# Railway Deployment Guide for Invoicing System

## 🚂 Overview
This guide will walk you through deploying your full-stack invoicing system to Railway.

## 📋 Prerequisites
- Railway account (https://railway.app)
- GitHub account connected to Railway
- Railway CLI installed (optional but recommended)

## 🏗️ Architecture
- **Backend**: Java Spring Boot API (Port 8080)
- **Frontend**: Next.js 15 with TypeScript
- **Database**: Railway PostgreSQL
- **Deployment**: Railway with Docker (backend) and Nixpacks (frontend)

## 🔧 Backend Deployment (Java Spring Boot)

### 1. Create Railway Project
```bash
# Navigate to backend directory
cd invoicing-api

# Login to Railway (if using CLI)
railway login

# Initialize Railway project
railway init --name invoicing-api
```

### 2. Configure Environment Variables
Copy the template and set your values:
```bash
cp .env.railway.template .env
# Edit .env with your actual values
```

**Required Environment Variables:**
```
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.up.railway.app
DATABASE_URL=jdbc:postgresql://your-railway-host:5432/railway
DATABASE_USERNAME=your-railway-username
DATABASE_PASSWORD=your-railway-password
```

### 3. Deploy Backend
```bash
# Add PostgreSQL service
railway add --service --postgres

# Deploy the backend
railway up --detach

# Check deployment status
railway status
```

### 4. Verify Backend Health
```bash
# Get the backend URL
railway domain

# Test health endpoint
curl https://your-backend-domain.up.railway.app/api/health
```

## 🎨 Frontend Deployment (Next.js)

### 1. Create Railway Project
```bash
# Navigate to frontend directory
cd invoicing-system

# Initialize Railway project
railway init --name invoicing-system
```

### 2. Configure Environment Variables
Copy the template and set your values:
```bash
cp .env.railway.template .env
# Edit .env with your actual values
```

**Required Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.up.railway.app/api
NEXTAUTH_URL=https://your-frontend-domain.up.railway.app
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

### 3. Deploy Frontend
```bash
# Deploy the frontend
railway up --detach

# Check deployment status
railway status
```

### 4. Verify Frontend
```bash
# Get the frontend URL
railway domain

# Open in browser
open https://your-frontend-domain.up.railway.app
```

## 🔗 Connect Frontend to Backend

### Update CORS Configuration
Make sure your backend `CORS_ALLOWED_ORIGINS` matches your frontend Railway domain:
```
CORS_ALLOWED_ORIGINS=https://invoicing-system-production.up.railway.app
```

### Update Frontend API URL
Ensure your frontend `NEXT_PUBLIC_API_BASE_URL` points to your backend:
```
NEXT_PUBLIC_API_BASE_URL=https://invoicing-api-production.up.railway.app/api
```

## 📊 Database Setup

### Automatic PostgreSQL Setup
Railway automatically provisions PostgreSQL when you add it to your project. The connection details are available in:
- Railway Dashboard → Your Project → PostgreSQL Service
- Environment variables are automatically injected

### Database Migration
```bash
# Connect to your database (from Railway dashboard)
# Or use Railway CLI
railway run -- psql -h your-host -U your-user -d railway
```

## 🧪 Testing Your Deployment

### Backend Tests
```bash
# Test health endpoint
curl https://your-backend-domain.up.railway.app/api/health

# Test API endpoints
curl https://your-backend-domain.up.railway.app/api/clients
curl https://your-backend-domain.up.railway.app/api/invoices
```

### Frontend Tests
1. Navigate to your frontend URL
2. Test user registration/login
3. Create a test invoice
4. Generate a PDF
5. Test all CRUD operations

## 🔍 Monitoring and Logs

### View Logs
```bash
# Backend logs
railway logs --service invoicing-api

# Frontend logs
railway logs --service invoicing-system
```

### Monitor Performance
- Railway Dashboard → Your Project → Metrics
- Set up alerts for CPU, memory, and database usage

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `CORS_ALLOWED_ORIGINS` in backend
   - Ensure frontend domain is allowed

2. **Database Connection Issues**
   - Verify `DATABASE_URL` format
   - Check PostgreSQL service status

3. **Build Failures**
   - Check build logs in Railway dashboard
   - Verify environment variables

4. **Port Conflicts**
   - Ensure backend uses port 8080
   - Frontend automatically handles port assignment

### Debug Commands
```bash
# Check service status
railway status

# View environment variables
railway variables

# Test database connection
railway run -- psql $DATABASE_URL

# Check service logs
railway logs --tail 100
```

## 🔄 Deployment Workflow

### Update Deployments
```bash
# Backend update
cd invoicing-api
railway up

# Frontend update
cd invoicing-system
railway up
```

### Rollback
```bash
# View deployment history
railway deployments

# Rollback to previous version
railway rollback <deployment-id>
```

## 🛡️ Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Use Railway's managed PostgreSQL
3. **HTTPS**: Railway provides automatic SSL
4. **Secrets**: Use Railway's secret management
5. **CORS**: Configure specific origins, not wildcards

## 📈 Scaling

### Vertical Scaling
- Upgrade service plans in Railway dashboard
- Increase CPU and memory allocation

### Horizontal Scaling
- Railway automatically handles scaling
- Monitor performance metrics

## 🎯 Next Steps

1. Set up custom domain names
2. Configure monitoring alerts
3. Set up backup strategies
4. Implement CI/CD pipeline
5. Add performance monitoring

## 📞 Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app

---

**🎉 Congratulations!** Your invoicing system is now deployed on Railway with full backend API, frontend, and PostgreSQL database.