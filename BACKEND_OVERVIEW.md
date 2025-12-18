# Backend Overview - Elins Overnatningshave

## 📋 Komplet Oversigt

Dette dokument giver et overblik over backend-implementeringen til Elins overnatningshave hjemmeside.

## 🏗️ Arkitektur

Backend følger en **clean architecture** med lag-separering:

```
┌─────────────────────────────────────────┐
│         Client (Frontend/App)            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       Routes (API Endpoints)             │
│  - /inquiries, /contacts, /health       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Controllers (Request Handlers)      │
│  - Parsing, Response formatting         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Services (Business Logic)           │
│  - Validation, Email, Availability      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    Repositories (Data Access Layer)      │
│  - Database queries, CRUD operations    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Database (SQLite)                │
│  - inquiries, contacts tables           │
└─────────────────────────────────────────┘
```

## 📁 Projektstruktur

```
server/
│
├── config/
│   ├── env.ts              # Environment konfiguration
│   └── logger.ts           # Winston logger setup
│
├── controllers/
│   ├── inquiryController.ts   # Booking request handlers
│   └── contactController.ts   # Contact form handlers
│
├── db/
│   ├── database.ts         # Database connection management
│   ├── migrate.ts          # Migration script
│   └── schema.sql          # Database schema definition
│
├── middleware/
│   ├── errorHandler.ts     # Global error handling
│   └── validator.ts        # Request validation middleware
│
├── repositories/
│   ├── inquiryRepository.ts   # Inquiry data access
│   └── contactRepository.ts   # Contact data access
│
├── routes/
│   ├── index.ts            # Main router
│   ├── inquiryRoutes.ts    # Inquiry endpoints
│   └── contactRoutes.ts    # Contact endpoints
│
├── services/
│   ├── inquiryService.ts      # Inquiry business logic
│   ├── contactService.ts      # Contact business logic
│   └── emailService.ts        # Email notifications
│
├── types/
│   └── index.ts            # TypeScript types & Zod schemas
│
├── app.ts                  # Express app configuration
└── index.ts                # Server entry point
```

## 🔄 Request Flow

### Eksempel: Opret Booking Forespørgsel

```
1. Client sender POST /api/inquiries
   ↓
2. Express middleware:
   - CORS check
   - Rate limiting
   - Body parsing
   - Request logging
   ↓
3. Route: /inquiries POST handler
   ↓
4. Middleware: validateBody(createInquirySchema)
   - Zod validering af input
   ↓
5. Controller: inquiryController.createInquiry()
   - Parse request
   - Call service
   - Format response
   ↓
6. Service: inquiryService.createInquiry()
   - Check for overlapping bookings
   - Create inquiry via repository
   - Send email notifications (async)
   ↓
7. Repository: inquiryRepository.create()
   - Prepared SQL statement
   - Insert into database
   - Return created record
   ↓
8. Response sendes tilbage til client
```

## 🗄️ Database Schema

### inquiries Tabel

Gemmer booking forespørgsler fra gæster.

| Column | Type | Constraints | Beskrivelse |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unikt ID |
| name | TEXT | NOT NULL | Gæstens navn |
| email | TEXT | NOT NULL | Gæstens email |
| phone | TEXT | NULL | Telefonnummer (valgfri) |
| arrival_date | TEXT | NOT NULL | Ankomstdato (ISO format) |
| departure_date | TEXT | NOT NULL | Afrejsedato (ISO format) |
| num_people | INTEGER | NOT NULL | Antal personer |
| message | TEXT | NULL | Besked fra gæst |
| status | TEXT | DEFAULT 'pending' | pending/confirmed/declined/completed |
| created_at | TEXT | AUTO | Oprettelsestidspunkt |
| updated_at | TEXT | AUTO | Seneste opdatering |

**Indices:**
- `idx_inquiries_status` på `status`
- `idx_inquiries_created_at` på `created_at`
- `idx_inquiries_arrival_date` på `arrival_date`

### contacts Tabel

Gemmer generelle kontaktbeskeder.

| Column | Type | Constraints | Beskrivelse |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY | Unikt ID |
| name | TEXT | NOT NULL | Afsenders navn |
| email | TEXT | NOT NULL | Afsenders email |
| subject | TEXT | NULL | Emne (valgfri) |
| message | TEXT | NOT NULL | Besked |
| is_read | INTEGER | DEFAULT 0 | 0 = ulæst, 1 = læst |
| created_at | TEXT | AUTO | Oprettelsestidspunkt |

**Indices:**
- `idx_contacts_created_at` på `created_at`
- `idx_contacts_is_read` på `is_read`

## 🔒 Sikkerhed

### Implementerede Sikkerhedsforanstaltninger

1. **Helmet** - Sætter sikre HTTP headers
   - XSS Protection
   - Content Security Policy
   - HSTS (production)

2. **CORS** - Cross-Origin Resource Sharing
   - Kun tillader requests fra konfigureret frontend domæne
   - Credentials support

3. **Rate Limiting**
   - Max 10 requests per 15 minutter per IP
   - Beskytter mod spam og DDoS

4. **Input Validering**
   - Zod schema validering på alle endpoints
   - Type-safe validering
   - Brugervenlige fejlbeskeder på dansk

5. **SQL Injection Beskyttelse**
   - Prepared statements (parameterized queries)
   - Ingen string concatenation i SQL

6. **Error Handling**
   - Ingen stack traces i production
   - Struktureret error logging
   - Brugervenlige fejlbeskeder

7. **Logging**
   - Alle requests logges
   - Fejl logges med context
   - Separate log filer for errors

## 📧 Email Flow

### Når en booking oprettes:

```
1. Inquiry created in database
   ↓
2. Email til ejer (Elin)
   - Besked: "Ny booking forespørgsel"
   - Indhold: Alle booking detaljer
   ↓
3. Email til gæst
   - Besked: "Tak for din forespørgsel"
   - Indhold: Bekræftelse på modtagelse
```

### Når en kontaktbesked oprettes:

```
1. Contact created in database
   ↓
2. Email til ejer (Elin)
   - Besked: "Ny kontaktbesked"
   - Indhold: Besked detaljer
```

**Note:** Email er valgfrit. Hvis ikke konfigureret, gemmes alt stadig i database.

## 🧪 Validering

Alle input valideres med Zod schemas før de når databasen.

### Booking Validering

```typescript
{
  name: 2-100 tegn (påkrævet)
  email: Gyldig email (påkrævet)
  phone: Valgfri
  arrivalDate: Skal være i dag eller senere (påkrævet)
  departureDate: Skal være efter ankomst (påkrævet)
  numPeople: 1-10 personer (påkrævet)
  message: Max 1000 tegn (valgfri)
}
```

### Business Logic Validering

- **Overlap Check**: Tjekker om der er andre bookings i perioden
- **Date Logic**: Afrejse skal være efter ankomst
- **Future Dates**: Ankomst skal være i dag eller fremtidig dato

### Kontakt Validering

```typescript
{
  name: 2-100 tegn (påkrævet)
  email: Gyldig email (påkrævet)
  subject: Max 200 tegn (valgfri)
  message: 10-2000 tegn (påkrævet)
}
```

## 📊 Performance Overvejelser

### Database

- **SQLite WAL mode** - Bedre concurrent read performance
- **Indices** - På ofte brugte kolonner (status, dates)
- **Prepared Statements** - Caching af query plans

### API

- **Rate Limiting** - Beskytter mod overload
- **JSON Body Limit** - Max 10MB
- **Connection Pooling** - SQLite håndterer dette automatisk

### Logging

- **File Rotation** - Max 5MB per fil, max 5 filer
- **Structured Logging** - JSON format for nem parsing
- **Log Levels** - Debug i development, Info i production

## 🚀 Deployment Overvejelser

### Environment

```bash
NODE_ENV=production
PORT=3000
DATABASE_PATH=/var/data/overnatihaven.db
CORS_ORIGIN=https://elins-overnatningshave.dk
```

### Process Manager

Brug PM2 eller lignende:

```bash
pm2 start dist/server/index.js --name overnatihaven
```

### Reverse Proxy

Sæt NGINX eller Caddy foran Express:

```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Database Backup

Backup SQLite database regelmæssigt:

```bash
# Cron job
0 2 * * * cp /var/data/overnatihaven.db /var/backups/overnatihaven-$(date +\%Y\%m\%d).db
```

### Monitoring

- **Logs**: Tjek `logs/` mappen dagligt
- **Health Check**: Monitor `/api/health` endpoint
- **Database**: Tjek database størrelse
- **Disk Space**: Sørg for nok plads til logs og database

## 🔧 Vedligeholdelse

### Daglig

- Tjek `logs/error.log` for fejl
- Monitor database størrelse

### Ugentlig

- Backup database
- Tjek for ubehandlede bookings

### Månedlig

- Opdater dependencies: `npm update`
- Gennemgå gamle bookings
- Ryd gamle logs (valgfrit)

### Ved Behov

- Tilføj nye features
- Optimér database queries
- Opdater email templates

## 📚 Dependencies

### Production

- `express` - Web framework
- `better-sqlite3` - SQLite database
- `zod` - Schema validering
- `nodemailer` - Email sending
- `winston` - Logging
- `helmet` - Security headers
- `cors` - CORS handling
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables

### Development

- `typescript` - Type safety
- `tsx` - TypeScript execution
- `jest` - Testing
- `eslint` - Code linting

## 🎯 Fremtidige Forbedringer

### Kort sigt

- [ ] Admin dashboard authentication
- [ ] Update booking status endpoint
- [ ] Email templates customization
- [ ] SMS notifications (via Twilio)

### Mellem sigt

- [ ] Booking kalender visning
- [ ] Automatisk booking approval/decline
- [ ] Payment integration (Stripe/MobilePay)
- [ ] Billede upload til bookings

### Lang sigt

- [ ] Multi-location support
- [ ] Dynamic pricing
- [ ] Availability calendar widget
- [ ] Review/rating system
- [ ] Admin mobile app

## 💡 Tips og Tricks

### Development

```bash
# Watch mode med automatic reload
npm run dev:backend

# Tjek logs real-time
tail -f logs/combined.log
```

### Testing

```bash
# Test specific file
npm test -- inquiryService.test.ts

# Test with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Database

```bash
# Explore database med SQLite CLI
sqlite3 data/overnatihaven.db

# Eksempel queries
sqlite> SELECT * FROM inquiries WHERE status = 'pending';
sqlite> SELECT COUNT(*) FROM contacts WHERE is_read = 0;
```

### Debugging

```bash
# Start med debug output
DEBUG=* npm run dev:backend

# Eller brug Node inspector
node --inspect dist/server/index.js
```

## 📞 Support

Ved spørgsmål eller problemer:

1. Tjek [QUICKSTART.md](./QUICKSTART.md) for almindelige problemer
2. Se [API.md](./API.md) for API dokumentation
3. Tjek `logs/error.log` for fejlbeskeder
4. Se kode kommentarer i relevante filer

## ✅ Checklist for Go-Live

- [ ] Environment variabler konfigureret
- [ ] Email notifikationer testet
- [ ] Database backup sat op
- [ ] CORS konfigureret til production domain
- [ ] Rate limiting testet
- [ ] Health check virker
- [ ] Logs rotation konfigureret
- [ ] SSL/HTTPS sat op (via reverse proxy)
- [ ] Monitoring sat op
- [ ] Documentation opdateret

---

**Status:** ✅ Klar til udvikling og test  
**Version:** 1.0.0  
**Sidste opdatering:** December 2025
