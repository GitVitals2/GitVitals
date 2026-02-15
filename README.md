# GitVitals

A medical vitals tracking web application designed for medical assisting students to practice taking and submitting patient vitals, with instructor review and grading capabilities.

## 🎯 Purpose

GitVitals allows:
- **Students**: Practice taking vitals from classmates (readings 1-25) and family members (readings 26-50)
- **Instructors**: Review, grade submissions, and set correct baseline vitals for classmates
- **Integration**: Canvas LMS integration for seamless workflow

## 🛠️ Technology Stack

- **Frontend & Backend**: Next.js 16.1.1 (JavaScript, App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma 7.2.0
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or higher
- npm or yarn package manager
- PostgreSQL database (local or cloud instance)

## 🚀 Getting Started

**Quick Start**: See [docs/quick-start.md](docs/quick-start.md) for a streamlined setup guide.

### 1. Clone the Repository

```bash
git clone https://github.com/GitVitals2/GitVitals.git
cd GitVitals
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory by copying from `.env.example`:

```bash
cp .env.example .env
```

Then update the `.env` file with your actual values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/gitvitals"

# Canvas LMS Integration (optional)
CANVAS_API_KEY=""
CANVAS_API_URL=""
```

### 4. Set Up the Database

Initialize your PostgreSQL database and run Prisma migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations (when database is ready)
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view/edit data
npx prisma studio
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📁 Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (future)
│   ├── dashboard/         # Dashboard page
│   ├── student/           # Student-specific pages (future)
│   ├── instructor/        # Instructor-specific pages (future)
│   ├── layout.js          # Root layout
│   ├── page.js            # Home/landing page
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # UI components (future)
│   └── forms/            # Form components (future)
├── lib/                   # Utility functions and shared code
│   └── prisma.js         # Prisma client singleton
├── prisma/                # Prisma ORM files
│   └── schema.prisma     # Database schema
├── public/                # Static assets
├── .env                   # Environment variables (not in git)
├── .env.example          # Example environment variables
├── next.config.mjs       # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Project dependencies
```

## 💾 Database Schema

The application uses the following main models:

### User
Core user model for students and instructors

### Student
Extended profile for students with cohort information

### Patient
Patients (classmates or family members) for whom vitals are recorded

### VitalReading
Individual vital readings submitted by students (50 total per student)

### CorrectVitals
Instructor-set correct baseline vitals for classmates (readings 1-25)

## 🔧 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🗃️ Prisma Commands

- `npx prisma generate` - Generate Prisma Client
- `npx prisma migrate dev` - Create and apply migrations in development
- `npx prisma migrate deploy` - Apply migrations in production
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma db push` - Push schema changes without migrations (development only)

## 🌐 Deployment

### Deploying with Docker Compose

The easiest way to run the full stack (Next.js app, PostgreSQL, ML service):

```bash
# Create environment file
cp .env.example .env.local
# Edit .env.local with your settings

# Train the ML model first
cd ml && python train.py && cd ..

# Start all services
docker-compose up -d
```

This will start:
- Next.js app on http://localhost:3000
- PostgreSQL database
- ML prediction service on http://localhost:8004

### Deploying to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Detect Next.js framework
- Install dependencies
- Build the application
- Deploy to production

**Note**: When deploying to Vercel, you'll need to host the ML service separately (e.g., on AWS, Google Cloud, or a separate container service) and set the `ML_API_URL` environment variable to point to it.

### Environment Variables for Production

Make sure to set these in your Vercel dashboard or `.env.local`:
- `DATABASE_URL` - Your production PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `ML_API_URL` - URL to your ML prediction service (default: http://localhost:8004/predict)
- `CANVAS_API_KEY` - Canvas LMS API key (optional)
- `CANVAS_API_URL` - Canvas LMS API URL (optional)

## 🎓 Key Features (Planned)

- [ ] Student: Submit vitals for 25 classmates
- [ ] Student: Submit vitals for 25 family members
- [ ] Student: View submission history and grades
- [ ] Instructor: Review and grade student submissions
- [ ] Instructor: Set correct baseline vitals for classmates
- [ ] Canvas LMS integration
- [ ] Real-time grading feedback
- [ ] Progress tracking and analytics

## 🤖 Machine Learning Integration

GitVitals includes a FastAPI-based machine learning service for risk prediction based on vital signs.

### Training the Model

Before running the application, you need to train the ML model:

```bash
cd ml
python train.py
```

This generates:
- `artifacts/model.joblib` - Trained logistic regression model
- `artifacts/metrics.json` - Model performance metrics
- `artifacts/eval_report.json` - Detailed evaluation report

The training script uses synthetic data by default. For production, modify `data_loader.py` to load real patient data from your database.

### Running the ML Service

```bash
cd ml
pip install -r requirements.txt
uvicorn service.api:app --host 0.0.0.0 --port 8004
```

Or use Docker Compose (see Deployment section below).

## 📝 Development Notes

- This project uses **JavaScript** (not TypeScript) for accessibility to developers new to the stack
- Uses Next.js 16.1.1 with **App Router** (not Pages Router)
- Uses Prisma 7.2.0 with the new configuration pattern (datasource URL in prisma.config.ts)
- Code includes comments to help developers understand the structure
- Prisma schema follows PostgreSQL best practices
- Students must complete 50 total vitals: 1-25 (classmates), 26-50 (family members)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Contact the development team

---

Built with ❤️ for medical assisting education

## 📚 Documentation

- [Quick Start Guide](docs/quick-start.md) - Get up and running in 10 minutes
- [Deployment Checklist](docs/deployment-checklist.md) - Production deployment guide
- [Instructor API](docs/instructor-api.md) - API documentation for instructors
- [Class Diagram](docs/class-diagram.md) - Database schema and relationships
