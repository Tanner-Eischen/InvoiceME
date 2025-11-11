# Invoicing System Deployment Guide

## Current Architecture
- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Java Spring Boot API (Port 8081)
- **Database**: SQLite with Drizzle ORM
- **Package Manager**: npm/pnpm

## Quick Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend) ⭐ RECOMMENDED

#### Frontend Deployment (Vercel)
1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend**:
   ```bash
   cd invoicing-system
   vercel
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app/api
   ```

#### Backend Deployment (Railway)
1. **Create Railway Account**: https://railway.app
2. **Connect GitHub Repository** containing your Java backend
3. **Set Environment Variables**:
   ```
   SPRING_PROFILES_ACTIVE=prod
   SERVER_PORT=8080
   ```
4. **Deploy**: Railway will auto-detect and build your Spring Boot app

### Option 2: Full Vercel Deployment

#### Update Vercel Configuration
Update your `vercel.json` for better Next.js support:

```json
{
  "builds": [
    {
      "src": "invoicing-system/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/invoicing-system/$1"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_BASE_URL": "@api_base_url"
  }
}
```

#### Deploy Steps
1. **Connect Repository** to Vercel
2. **Set Build Settings**:
   - Build Command: `cd invoicing-system && npm run build`
   - Output Directory: `invoicing-system/.next`
3. **Configure Environment Variables**
4. **Deploy**

### Option 3: Netlify Deployment

Your project already has Netlify configuration. To deploy:

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   cd invoicing-system
   netlify deploy --prod
   ```

3. **Set Environment Variables** in Netlify Dashboard

## Environment Variables Setup

### Frontend Variables
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.com/api
NEXT_PUBLIC_APP_URL=https://your-frontend-url.com
```

### Backend Variables
```bash
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=https://your-frontend-url.com
DATABASE_URL=your-production-database-url
```

## Database Migration

### For Production Deployment
1. **Switch from SQLite to PostgreSQL** (recommended for production)
2. **Update Database Configuration** in your backend
3. **Run Migrations**:
   ```bash
   cd invoicing-system
   npm run db:push
   ```

## Deployment Checklist

- [ ] Update API URLs in frontend code
- [ ] Configure CORS in backend for production domain
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Test API connectivity
- [ ] Set up SSL certificates
- [ ] Configure domain names
- [ ] Test payment integrations (if any)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

## Post-Deployment Testing

1. **Test API Endpoints**:
   ```bash
   curl https://your-backend-url.com/api/health
   ```

2. **Test Frontend**:
   - Navigate to your deployed frontend
   - Test user registration/login
   - Test invoice creation/editing
   - Test PDF generation

3. **Test Database Operations**:
   - Create test invoices
   - Update existing records
   - Test data persistence

## Troubleshooting

### Common Issues
1. **CORS Errors**: Update backend CORS configuration
2. **API Connection Issues**: Check environment variables
3. **Build Failures**: Verify Node.js version compatibility
4. **Database Connection**: Ensure proper database URL configuration

### Debug Commands
```bash
# Check frontend build
npm run build

# Test backend locally
java -jar target/invoicing-api-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# Check environment variables
printenv | grep -E "(API|DATABASE|SPRING)"
```

## Next Steps

1. Choose your preferred deployment option
2. Set up accounts on chosen platforms
3. Configure environment variables
4. Deploy and test your application
5. Set up monitoring and maintenance procedures

Need help with a specific deployment option? Let me know which platform you'd prefer and I can provide more detailed instructions!