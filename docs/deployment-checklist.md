# Production Deployment Checklist

This document provides a step-by-step checklist for deploying GitVitals to production.

## Prerequisites

- [ ] PostgreSQL database (cloud provider or self-hosted)
- [ ] Supabase account for authentication
- [ ] Node.js 18+ and npm installed (for local development)
- [ ] Python 3.11+ (for ML service)

## Environment Configuration

### 1. Database Setup

- [ ] Create production PostgreSQL database
- [ ] Note down connection string
- [ ] Run Prisma migrations: `npx prisma migrate deploy`
- [ ] Verify database connectivity

### 2. Supabase Setup

- [ ] Create a new Supabase project
- [ ] Enable email authentication
- [ ] Copy project URL and API keys
- [ ] Configure Row Level Security (RLS) policies if needed
- [ ] Set up auth redirects for your production domain

### 3. Machine Learning Service

- [ ] Install Python dependencies: `pip install -r ml/requirements.txt`
- [ ] Train the model: `python ml/train.py`
- [ ] Verify artifacts are generated in `ml/artifacts/`
- [ ] Test the ML API locally: `uvicorn service.api:app --host 0.0.0.0 --port 8004`
- [ ] Deploy ML service to cloud (AWS, GCP, Azure, or container platform)
- [ ] Note the ML service URL

## Deployment Options

### Option A: Vercel (Recommended for Next.js)

#### Step 1: Deploy Frontend to Vercel

- [ ] Push code to GitHub
- [ ] Import repository in Vercel
- [ ] Configure build settings:
  - Framework Preset: Next.js
  - Build Command: `npm run build`
  - Output Directory: `.next`
- [ ] Add environment variables in Vercel dashboard:
  ```
  DATABASE_URL=your-postgres-connection-string
  NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
  SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
  ML_API_URL=https://your-ml-service.com/predict
  ```
- [ ] Deploy and verify

#### Step 2: Deploy ML Service Separately

Choose one:
- [ ] **AWS Lambda/ECS**: Package ML service as Docker container
- [ ] **Google Cloud Run**: Deploy from container registry
- [ ] **Railway/Render**: Connect GitHub repo for ml/ directory
- [ ] **DigitalOcean App Platform**: Deploy from source

### Option B: Docker Compose (All-in-one)

- [ ] Clone repository on production server
- [ ] Create `.env.local` with all required variables
- [ ] Train ML model: `cd ml && python train.py && cd ..`
- [ ] Start services: `docker-compose up -d`
- [ ] Configure reverse proxy (Nginx/Caddy) for SSL
- [ ] Set up domain and SSL certificate
- [ ] Configure firewall rules

## Post-Deployment

### Security

- [ ] Verify all environment variables are set correctly
- [ ] Ensure `.env` files are not committed to git
- [ ] Set up SSL/HTTPS
- [ ] Configure CORS policies
- [ ] Review database connection security
- [ ] Enable Supabase RLS policies
- [ ] Set up rate limiting
- [ ] Configure Content Security Policy headers

### Monitoring

- [ ] Set up application monitoring (Sentry, LogRocket, etc.)
- [ ] Configure database monitoring
- [ ] Set up uptime monitoring
- [ ] Create alerts for errors and downtime
- [ ] Monitor ML service health endpoint

### Database

- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Seed initial data if needed
- [ ] Set up database backups
- [ ] Configure connection pooling if needed
- [ ] Verify database indexes are optimized

### Testing

- [ ] Test user registration flow
- [ ] Test user login flow
- [ ] Test student vitals submission
- [ ] Test instructor review workflow
- [ ] Test ML prediction integration
- [ ] Verify email notifications work
- [ ] Test on mobile devices
- [ ] Verify all API endpoints are accessible

### Performance

- [ ] Enable Next.js caching
- [ ] Configure CDN for static assets
- [ ] Optimize database queries
- [ ] Set up database connection pooling
- [ ] Monitor and optimize ML prediction latency

## Rollback Plan

- [ ] Document current production version
- [ ] Keep previous deployment artifacts
- [ ] Test rollback procedure in staging
- [ ] Document rollback steps

## Maintenance

- [ ] Schedule regular dependency updates
- [ ] Plan for database backup testing
- [ ] Schedule security audits
- [ ] Monitor application logs regularly
- [ ] Keep documentation up to date

## Support Contacts

- Development Team: _____________
- Database Admin: _____________
- DevOps/Infrastructure: _____________
- Security Contact: _____________

---

**Last Updated**: February 2026
**Version**: 1.0
