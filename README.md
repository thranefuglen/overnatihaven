# Elins Overnatningshave

En hjemmeside og API til Elins overnatningshave, hvor cyklister kan booke overnatning i en smuk have i Ribe.

## Tech Stack

| Lag | Teknologi |
|-----|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | Vercel Postgres |
| Hosting | Vercel (Serverless Functions) |
| Auth | JWT + bcrypt |
| Validering | Zod |
| Email | Nodemailer |
| Logging | Winston |

## Hurtig Start

```bash
npm install
cp .env.example .env   # Tilpas værdier
npm run dev            # Frontend på http://localhost:5173
npm run dev:backend    # Backend på http://localhost:3000
```

## Kommandoer

```bash
# Development
npm run dev              # Frontend (Vite)
npm run dev:backend      # Backend (ts-node)

# Build
npm run build            # Frontend + server TypeScript

# Test
npm test                 # Jest
npm test -- --watch      # Watch mode
npm test -- --coverage   # Med coverage

# Lint
npm run lint

# Preview
npm run preview
```

## Projektstruktur

```
├── api/               # Vercel serverless entry point
├── server/
│   ├── config/        # Env-konfiguration og logger
│   ├── controllers/   # Request handlers
│   ├── db/            # Postgres setup og schema
│   ├── middleware/    # Auth middleware
│   ├── repositories/  # Data access (Postgres)
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── types/         # TypeScript types og Zod-schemas
├── src/               # React frontend
│   ├── components/    # UI-komponenter
│   ├── config/        # API URL-konfiguration
│   ├── data/          # Fallback-data
│   └── types/         # Frontend typer
└── vercel.json        # Vercel routing-konfiguration
```

## Admin Panel

Tilgås via `/admin/login`.

Standard credentials (skift efter første login):
- Brugernavn: `admin`
- Password: `admin123`

### Admin funktioner
- **Galleri** (`/admin/gallery`): Upload/rediger/slet/sorter billeder
- **Forespørgsler** (`/admin/inquiries`): Se og opdater booking-status
- **Kontaktbeskeder** (`/admin/contacts`): Læs og administrer beskeder

JWT-tokens udløber efter 7 dage. Alle admin-endpoints kræver `Authorization: Bearer <token>`.

## Environment Variabler

```env
# Database (sættes automatisk af Vercel Postgres)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Auth
JWT_SECRET=skift-denne-hemmelighed
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://dit-domæne.vercel.app

# Frontend
VITE_API_URL=https://dit-domæne.vercel.app

# Email (valgfrit)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=din-email@gmail.com
SMTP_PASS=dit-app-password
EMAIL_FROM=din-email@gmail.com
EMAIL_TO=elin@overnatihaven.dk
```

## Sikkerhed

- Helmet (HTTP-headers)
- CORS (kun tilladt origin)
- Rate limiting (100 req/15 min per IP)
- Input-validering med Zod
- Prepared statements (SQL injection-beskyttelse)

## Licens

ISC
