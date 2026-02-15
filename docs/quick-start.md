# GitVitals Quick Start Guide

Get GitVitals running on your local machine in under 10 minutes.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
- Python 3.11+ (for ML features)

## Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/GitVitals2/GitVitals.git
cd GitVitals
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Required: PostgreSQL database
DATABASE_URL="postgresql://username:password@localhost:5432/gitvitals"

# Required: Supabase for authentication
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Optional: Canvas LMS integration
CANVAS_API_KEY=""
CANVAS_API_URL=""
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Train ML Model

```bash
cd ml
pip install -r requirements.txt
python train.py
cd ..
```

### 5. Start Development Servers

#### Terminal 1: Next.js App

```bash
npm run dev
```

Visit http://localhost:3000

#### Terminal 2: ML Service

```bash
cd ml
uvicorn service.api:app --host 0.0.0.0 --port 8004 --reload
```

ML API available at http://localhost:8004

## Using Docker (Alternative)

Skip steps 2-5 and run:

```bash
cp .env.example .env.local
# Edit .env.local with your settings
docker-compose up
```

This starts:
- Next.js app on http://localhost:3000
- PostgreSQL database
- ML service on http://localhost:8004

## First Steps

### Create Your First User

1. Visit http://localhost:3000/register
2. Fill in the registration form
3. Choose role: Student or Instructor
4. Submit and login

### For Students

1. Go to "Submit Vitals"
2. Create a patient (classmate or family member)
3. Enter vital signs
4. Submit for review

### For Instructors

1. Go to "Review Submissions"
2. View student submissions
3. Set correct baseline vitals for classmates
4. Grade student submissions

## Testing

Run the test suite:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

Build for production:

```bash
npm run build
npm start
```

## Troubleshooting

### Build fails with "supabaseUrl is required"

Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in your `.env` file.

### Prisma errors

```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

### ML service errors

```bash
# Verify Python dependencies
pip install -r ml/requirements.txt

# Retrain the model
cd ml && python train.py
```

### Port already in use

Change ports in your terminal:

```bash
# Next.js on different port
PORT=3001 npm run dev

# ML service on different port
uvicorn service.api:app --port 8005
```

## Project Structure

```
GitVitals/
├── app/                 # Next.js pages and API routes
│   ├── api/            # Backend API endpoints
│   ├── dashboard/      # Dashboard page
│   ├── login/          # Authentication pages
│   └── ...
├── components/          # Reusable React components
│   ├── ui/             # UI component library
│   └── forms/          # Form components
├── lib/                 # Utility functions
│   ├── prisma.js       # Database client
│   └── supabase.js     # Auth client
├── ml/                  # Machine learning service
│   ├── service/        # FastAPI application
│   ├── train.py        # Model training
│   └── predict.py      # Prediction logic
├── prisma/              # Database schema and migrations
└── docs/                # Documentation

```

## Next Steps

- Read [deployment-checklist.md](./deployment-checklist.md) for production deployment
- Check [instructor-api.md](./instructor-api.md) for API documentation
- Review [class-diagram.md](./class-diagram.md) for data model

## Getting Help

- Check existing issues on GitHub
- Create a new issue with detailed error information
- Include logs, screenshots, and steps to reproduce

---

Happy coding! 🚀
