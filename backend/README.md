# Roomy Backend

Hono + Bun API Server for Roomy.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: Supabase (PostgreSQL 15+ with pgvector)
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: Clerk
- **AI**: OpenAI GPT-4

## Quick Start

### 1. Database Setup

Follow the comprehensive database setup guide:

**[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Supabase project creation, pgvector activation, and Prisma migrations.

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp ../.env.example ../.env
```

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

### 4. Run Migrations

```bash
bun run db:migrate:dev
```

### 5. Start Development Server

```bash
bun run dev
```

Server runs at `http://localhost:3001`

## Available Scripts

### Development
- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run start` - Start production server

### Testing
- `bun test` - Run tests
- `bun test:watch` - Run tests in watch mode

### Database
- `bun run db:generate` - Generate Prisma Client
- `bun run db:migrate:dev` - Run migrations in development
- `bun run db:migrate:deploy` - Deploy migrations in production
- `bun run db:migrate:reset` - Reset database (dev only)
- `bun run db:studio` - Open Prisma Studio
- `bun run db:seed` - Seed database with sample data
- `bun run db:test` - Test database connection

### Code Quality
- `bun run lint` - Lint code with ESLint
- `bun run typecheck` - Type check with TypeScript

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── schemas/          # Zod validation schemas
│   ├── middleware/       # Hono middleware
│   └── lib/              # Utilities
├── tests/                # Test files
├── prisma/
│   ├── schema.prisma     # Prisma schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Seed data
├── scripts/
│   └── test-db-connection.ts  # DB connection test
└── DATABASE_SETUP.md     # Supabase setup guide
```

## API Documentation

API endpoints are documented in the code using Zod schemas.

### Base URL
- Development: `http://localhost:3001`
- Production: TBD

### Authentication
All routes require Clerk authentication except public guide views.

## Testing Database Connection

To verify your Supabase connection:

```bash
bun run db:test
```

This will check:
- Database connectivity
- Table accessibility
- pgvector extension status
- PostgreSQL version

## Troubleshooting

See [DATABASE_SETUP.md - Troubleshooting](./DATABASE_SETUP.md#6-트러블슈팅) for common issues and solutions.

## License

Proprietary - Roomy Project
