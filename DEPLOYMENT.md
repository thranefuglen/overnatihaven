# Deployment Guide — Vercel + Postgres

## Forudsætninger

- En Vercel-konto
- Projektet pushet til GitHub

## Trin 1: Opret Vercel Postgres Database

1. Gå til dit Vercel-projekt → **Storage** → **Create Database** → **Postgres**
2. Vercel sætter automatisk disse env-variabler på dit projekt:
   - `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

## Trin 2: Initialiser Database-schema

I Vercel-dashboardet: **Storage** → **Postgres** → **Query**

Kør indholdet af `server/db/schema.postgres.sql`.

Alternativt via CLI:
```bash
vercel env pull .env.local
npx tsx server/db/seed.ts
```

## Trin 3: Sæt Environment Variabler

I Vercel-projektets **Settings** → **Environment Variables**:

```env
JWT_SECRET=din-super-hemmelige-nøgle
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://dit-projekt.vercel.app
VITE_API_URL=https://dit-projekt.vercel.app
```

## Trin 4: Deploy

### Via GitHub (anbefalet)
Forbind dit GitHub-repo til Vercel — deploy sker automatisk ved push til `main`.

### Via CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Trin 5: Verificer

```bash
curl https://dit-projekt.vercel.app/api/health
curl https://dit-projekt.vercel.app/api/gallery
```

## Lokal Udvikling med Vercel Postgres

```bash
vercel env pull .env.local
npm run dev:backend
```

## Fejlfinding

| Problem | Løsning |
|---------|---------|
| Database connection fejler | Tjek at `POSTGRES_URL` env-variablen er sat |
| API returnerer 404 | Verificer `vercel.json` routing og at `/api` routes er korrekte |
| CORS fejl | Opdater `CORS_ORIGIN` til din frontend-URL |
| Build fejler | Kør `npm run build` lokalt og ret TypeScript-fejl |

## Vigtige Noter

- **Admin password**: Ændr standardpassword efter første login
- **Billede-uploads**: Gemmes som URLs i databasen — overvej Vercel Blob Storage til filer
- **Database backup**: Opsæt regelmæssig backup via Vercel Postgres dashboard
- **Secrets**: Commit aldrig `.env.local` — `JWT_SECRET` må aldrig eksponeres
