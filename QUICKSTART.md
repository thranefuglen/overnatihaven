# 🚀 Quickstart Guide

Kom hurtigt i gang med backend til Elins Overnatningshave.

## Forudsætninger

- Node.js (v18 eller nyere)
- npm eller yarn

## Installation (5 minutter)

### 1. Installer dependencies

```bash
npm install
```

### 2. Opret environment fil

Kopier `.env.example` til `.env`:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### 3. Kør database migrationer

```bash
npm run db:migrate
```

Du skulle se:
```
[INFO]: Starting database migration...
[INFO]: Database migrations completed successfully
[INFO]: Migration completed successfully
```

### 4. Start serveren

```bash
npm run dev:backend
```

Du skulle se:
```
[INFO]: Server started successfully
[INFO]: API available at http://localhost:3000/api
[INFO]: Health check: http://localhost:3000/api/health
```

## Test at det virker

### 1. Health Check

Åbn din browser eller brug cURL:

```bash
curl http://localhost:3000/api/health
```

Forventet response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

### 2. Test booking forespørgsel

```bash
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"arrivalDate\":\"2025-07-01\",\"departureDate\":\"2025-07-03\",\"numPeople\":2}"
```

### 3. Tjek tilgængelighed

```bash
curl "http://localhost:3000/api/inquiries/availability?arrivalDate=2025-07-01&departureDate=2025-07-03"
```

## Næste Skridt

### Email Konfiguration (Valgfrit)

For at aktivere email notifikationer, opdater `.env` filen:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=din-email@gmail.com
SMTP_PASS=dit-app-password
EMAIL_FROM=din-email@gmail.com
EMAIL_TO=elin@example.com
```

**Gmail brugere:** Du skal oprette et [App Password](https://support.google.com/accounts/answer/185833).

### Tilpas CORS

Hvis din frontend kører på en anden URL end `http://localhost:5173`, opdater i `.env`:

```env
CORS_ORIGIN=https://din-frontend-url.com
```

## Mapper og Filer

Efter installation har du:

```
C:\Code\overnatihaven\
├── server/              # Backend kode
│   ├── config/          # Konfiguration
│   ├── controllers/     # Request handlers
│   ├── db/              # Database
│   ├── middleware/      # Express middleware
│   ├── repositories/    # Data access
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── types/           # TypeScript types
├── data/                # Database fil (auto-genereret)
│   └── overnatihaven.db
├── logs/                # Log filer (auto-genereret)
│   ├── error.log
│   └── combined.log
└── .env                 # Din konfiguration
```

## Almindelige Kommandoer

```bash
# Start development server
npm run dev:backend

# Build til production
npm run build:backend

# Start production server
npm run start:backend

# Kør tests
npm test

# Kør database migrationer
npm run db:migrate

# Lint kode
npm run lint
```

## Fejlfinding

### Port allerede i brug

Hvis port 3000 er optaget, ændr i `.env`:

```env
PORT=3001
```

### Database fejl

Hvis du får database fejl, slet `data/overnatihaven.db` og kør migrationer igen:

```bash
# Windows
del data\overnatihaven.db
npm run db:migrate

# Mac/Linux
rm data/overnatihaven.db
npm run db:migrate
```

### Email virker ikke

Email er valgfrit. Hvis email ikke virker, vil serveren stadig fungere - du ser bare en warning i logs:

```
[WARN]: Email not configured. Email notifications will not be sent.
```

## API Dokumentation

Se [API.md](./API.md) for komplet API dokumentation.

## Hjælp og Support

- **Backend kode:** Se kommentarer i `server/` filerne
- **API endpoints:** Se [API.md](./API.md)
- **Database schema:** Se `server/db/schema.sql`
- **Logs:** Tjek `logs/` mappen for fejl

## 🎉 Du er klar!

Din backend kører nu og er klar til at modtage booking forespørgsler!

Næste skridt:
1. Byg frontend til at kalde API'en
2. Konfigurer email notifikationer
3. Tilføj admin dashboard (fremtidigt)
4. Deploy til production server
