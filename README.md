# overnatihaven
A simple webpage for bicycle riders who wants to stay, camping in a beautiful garden
# Elins Overnatningshave

En moderne hjemmeside og backend API til Elins overnatningshave, hvor cyklister kan booke overnatning i en smuk have.

## 🌟 Features

### Frontend
- **Responsivt Design**: Fungerer perfekt på mobil, tablet og desktop
- **Billedgalleri**: Interaktivt galleri med lightbox-funktionalitet
- **Kontaktformular**: Nem booking og kontakt med validering
- **Moderne UI**: Bygget med React, TypeScript og Tailwind CSS
- **Tilgængelighed**: WCAG-kompatibelt design
- **Performance**: Optimeret for hurtig loading og god brugeroplevelse

### Backend
- **Booking forespørgsler**: Cyklister kan oprette booking forespørgsler
- **Kontaktformular**: Generel kontaktformular til spørgsmål
- **Tilgængelighedstjek**: Tjek om datoer er ledige
- **Email notifikationer**: Automatiske emails til både ejer og gæster
- **Rate limiting**: Beskyttelse mod spam
- **Validering**: Robust input validering med Zod
- **Logging**: Struktureret logging med Winston
- **Database**: SQLite database til simpel administration

## 📋 Teknologi Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool og dev server
- **ESLint** - Code linting

### Backend
- **Runtime**: Node.js med TypeScript
- **Framework**: Express
- **Database**: SQLite (better-sqlite3)
- **Validering**: Zod
- **Email**: Nodemailer
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## 🛠️ Installation

1. **Klon projektet og installer dependencies:**

```bash
npm install
```

2. **Konfigurer environment variabler (valgfrit for backend):**

Kopier `.env.example` til `.env` og tilpas værdierne:

```bash
cp .env.example .env
```

Vigtige variabler:
- `PORT`: Server port (default: 3000)
- `DATABASE_PATH`: Sti til SQLite database
- `SMTP_*`: Email konfiguration (valgfrit)
- `CORS_ORIGIN`: Frontend URL

3. **Kør database migrationer (hvis du vil bruge backend):**

```bash
npm run db:migrate
```

## 🎯 Anvendelse

### Development

**Frontend only:**
```bash
npm run dev
```
Åbn [http://localhost:5173](http://localhost:5173)

**Frontend + Backend:**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run dev:backend
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:3000`

### Production

**Build alt:**
```bash
npm run build
```

**Start backend:**
```bash
npm run start:backend
```

**Preview frontend build:**
```bash
npm run preview
```

### Tests

Kør tests:

```bash
npm test
```

### Linting

Kør ESLint:

```bash
npm run lint
```

## 📱 Frontend Struktur

### Sider
- **Hjem (Hero)**: Velkommen-sektion med call-to-action
- **Om Haven**: Information om haven og Elin
- **Faciliteter**: Oversigt over tilgængelige faciliteter
- **Galleri**: Billedgalleri med lightbox
- **Priser**: Prisoversigt og pakker
- **Kontakt**: Kontaktformular og information

### Komponenter
- `Header`: Navigation med smooth scroll og mobile menu
- `Hero`: Hero-sektion med baggrundsbillede
- `About`: Om-sektion med billede og tekst
- `Facilities`: Grid af faciliteter med ikoner
- `Gallery`: Responsivt galleri med lightbox
- `Pricing`: Priskort med forskellige pakker
- `Contact`: Kontaktformular med validering
- `Footer`: Footer med links og information

### Design
- Grønne primærfarver (#22c55e) for naturlig feel
- Moderne, minimalistisk layout
- Store, læsbare skrifttyper (Inter)
- Smooth animationer og transitions
- Mobile-first responsivt design

### Tilgængelighed
- Semantisk HTML
- ARIA labels og roller
- Keyboard navigation
- Focus indicators
- Sufficient color contrast (WCAG AA)
- Screen reader support

## 📡 API Endpoints

### Health Check

```
GET /api/health
```

Tjek om serveren kører.

### Booking Forespørgsler

#### Opret booking forespørgsel
```
POST /api/inquiries
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+45 12345678",
  "arrivalDate": "2025-07-01",
  "departureDate": "2025-07-03",
  "numPeople": 2,
  "message": "Vi glæder os til at besøge haven!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Din forespørgsel er modtaget...",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    ...
  }
}
```

#### Tjek tilgængelighed
```
GET /api/inquiries/availability?arrivalDate=2025-07-01&departureDate=2025-07-03
```

**Response:**
```json
{
  "success": true,
  "data": {
    "available": true,
    "message": "Perioden er tilgængelig"
  }
}
```

#### Hent alle forespørgsler (admin)
```
GET /api/inquiries?status=pending&limit=10
```

#### Hent specifik forespørgsel (admin)
```
GET /api/inquiries/:id
```

### Kontaktbeskeder

#### Opret kontaktbesked
```
POST /api/contacts
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Spørgsmål om faciliteter",
  "message": "Jeg vil gerne vide mere om..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tak for din besked...",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    ...
  }
}
```

#### Hent alle beskeder (admin)
```
GET /api/contacts?isRead=false&limit=20
```

#### Hent specifik besked (admin)
```
GET /api/contacts/:id
```

## 🔒 Sikkerhed

Backend implementerer flere sikkerhedsforanstaltninger:

- **Helmet**: Sætter sikkerhedsrelaterede HTTP headers
- **CORS**: Konfigureret til kun at acceptere requests fra frontend
- **Rate Limiting**: Max 10 requests per 15 minutter per IP
- **Input Validering**: Alle inputs valideres med Zod
- **SQL Injection**: Beskyttet via prepared statements
- **Error Handling**: Ingen følsomme fejlbeskeder i production

## 📊 Database Schema

### inquiries
- `id`: INTEGER PRIMARY KEY
- `name`: TEXT NOT NULL
- `email`: TEXT NOT NULL
- `phone`: TEXT
- `arrival_date`: TEXT NOT NULL
- `departure_date`: TEXT NOT NULL
- `num_people`: INTEGER NOT NULL
- `message`: TEXT
- `status`: TEXT (pending/confirmed/declined/completed)
- `created_at`: TEXT
- `updated_at`: TEXT

### contacts
- `id`: INTEGER PRIMARY KEY
- `name`: TEXT NOT NULL
- `email`: TEXT NOT NULL
- `subject`: TEXT
- `message`: TEXT NOT NULL
- `is_read`: INTEGER (0/1)
- `created_at`: TEXT

## 📧 Email Konfiguration

For at aktivere email notifikationer, konfigurer SMTP indstillinger i `.env`:

### Gmail eksempel:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=din-email@gmail.com
SMTP_PASS=dit-app-password
EMAIL_FROM=din-email@gmail.com
EMAIL_TO=elin@example.com
```

**Note**: For Gmail skal du bruge et [App Password](https://support.google.com/accounts/answer/185833).

## 🏗️ Projektstruktur

```
server/
├── config/          # Konfiguration (env, logger)
├── controllers/     # Request handlers
├── db/              # Database setup og migrationer
├── middleware/      # Express middleware
├── repositories/    # Data access layer
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types og validering
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## 🧪 Testing

Tests er implementeret med Jest. Kør tests:

```bash
npm test                 # Kør alle tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # Med coverage rapport
```

## 📝 Logging

Logs gemmes i `logs/` mappen:
- `error.log`: Kun fejl
- `combined.log`: Alle log beskeder

I development vises logs også i konsollen med farver.

## 🔄 Videreudvikling

Forslag til fremtidige forbedringer:

- [ ] Admin dashboard med autentifikation
- [ ] Booking kalender med visuel oversigt
- [ ] SMS notifikationer
- [ ] Automatisk booking bekræftelse/afvisning
- [ ] Prisberegning baseret på antal personer/nætter
- [ ] Billede upload funktionalitet
- [ ] Integration med betalingssystem
- [ ] Multi-sprog support

## 📄 Licens

ISC

## 👤 Forfatter

Udviklet til Elins Overnatningshave
