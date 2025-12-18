# 🌿 Velkommen til Elins Overnatningshave Backend

## 🎉 Din backend er klar!

Jeg har implementeret en **komplet, produktionsklar backend** til din hjemmeside. Alt er sat op og klar til brug.

## ⚡ Quick Start (3 skridt)

```bash
# 1. Installer dependencies
npm install

# 2. Setup database
npm run db:migrate

# 3. Start serveren
npm run dev:backend
```

**Det er det!** Din backend kører nu på `http://localhost:3000`

Test det:
```bash
curl http://localhost:3000/api/health
```

## 📚 Dokumentation

Jeg har oprettet omfattende dokumentation til dig:

### 🚀 For at Komme i Gang
- **[QUICKSTART.md](./QUICKSTART.md)** ← **START HER!**
  - 5-minutter guide til at få alt til at virke
  - Step-by-step instruktioner
  - Troubleshooting

### 📖 For Udviklere
- **[BACKEND_OVERVIEW.md](./BACKEND_OVERVIEW.md)**
  - Komplet teknisk oversigt
  - Alle features forklaret
  - Best practices

- **[ARCHITECTURE.md](./ARCHITECTURE.md)**
  - System arkitektur med diagrammer
  - Data flow
  - Security architecture

- **[API.md](./API.md)**
  - Komplet API reference
  - Alle endpoints dokumenteret
  - cURL eksempler
  - Frontend integration eksempler

### 🔧 Reference
- **[COMMANDS.md](./COMMANDS.md)**
  - Alle npm kommandoer
  - Development tools
  - Debugging tips

- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**
  - Hvad er implementeret
  - Feature liste
  - Næste skridt

## 🎯 Hvad Kan Backenden?

### ✅ Booking System
- Gæster kan oprette booking forespørgsler
- Automatisk tjek for overlappende bookings
- Tilgængelighedstjek
- Email notifikationer (valgfrit)

### ✅ Kontaktformular
- Generel kontaktformular
- Email notifikationer til ejer

### ✅ Sikkerhed
- Rate limiting (spam beskyttelse)
- Input validering
- SQL injection beskyttelse
- CORS konfigureret

### ✅ Developer Experience
- TypeScript
- Hot reload
- Comprehensive logging
- Test setup
- Extensive documentation

## 📁 Projekt Struktur

```
overnatihaven/
├── server/              ← Backend kode
│   ├── config/          - Konfiguration
│   ├── controllers/     - Request handlers
│   ├── db/              - Database
│   ├── middleware/      - Express middleware
│   ├── repositories/    - Data access
│   ├── routes/          - API routes
│   ├── services/        - Business logic
│   └── types/           - TypeScript types
│
├── Documentation/
│   ├── START_HERE.md       ← Du er her
│   ├── QUICKSTART.md       ← Læs dette først
│   ├── API.md              - API reference
│   ├── BACKEND_OVERVIEW.md - Teknisk oversigt
│   ├── ARCHITECTURE.md     - Arkitektur diagrammer
│   ├── COMMANDS.md         - Kommando reference
│   └── README.md           - Projekt README
│
├── Configuration/
│   ├── .env                - Dine settings
│   ├── package.json        - Dependencies
│   ├── tsconfig.server.json - TypeScript config
│   └── jest.config.js      - Test config
│
└── test-api.html        - Test API'et i browseren
```

## 🔌 API Endpoints

| Endpoint | Method | Beskrivelse |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/inquiries` | POST | Opret booking |
| `/api/inquiries/availability` | GET | Tjek tilgængelighed |
| `/api/contacts` | POST | Send kontaktbesked |
| `/api/inquiries` | GET | Hent bookings (admin) |
| `/api/contacts` | GET | Hent beskeder (admin) |

**Se [API.md](./API.md) for detaljer**

## 🧪 Test API'et

### Option 1: Browser Test
Åbn `test-api.html` i din browser for en interaktiv test-side.

### Option 2: cURL
```bash
# Health check
curl http://localhost:3000/api/health

# Create booking
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "arrivalDate": "2025-07-01",
    "departureDate": "2025-07-03",
    "numPeople": 2
  }'
```

### Option 3: Postman/Insomnia
Import endpoints fra [API.md](./API.md)

## ⚙️ Konfiguration

### Basis Setup (Færdig!)
Alt virker out-of-the-box med default settings i `.env`

### Email Setup (Valgfrit)
For at aktivere email notifikationer, rediger `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=din-email@gmail.com
SMTP_PASS=dit-app-password
EMAIL_FROM=din-email@gmail.com
EMAIL_TO=elin@example.com
```

**Note:** Email er valgfrit. Alt fungerer uden email.

### Frontend Integration
Hvis din frontend ikke kører på `http://localhost:5173`, opdater i `.env`:

```env
CORS_ORIGIN=https://din-frontend-url.com
```

## 📊 Database

### Lokation
`data/overnatihaven.db` (SQLite)

### Backup
```bash
# Windows
copy data\overnatihaven.db backups\backup.db

# Mac/Linux
cp data/overnatihaven.db backups/backup.db
```

### Explore Data
```bash
sqlite3 data/overnatihaven.db
sqlite> SELECT * FROM inquiries;
sqlite> SELECT * FROM contacts;
```

## 📝 Logs

Logs gemmes automatisk i `logs/`:
- `error.log` - Kun fejl
- `combined.log` - Alle log beskeder

```bash
# Se logs (Windows)
type logs\combined.log

# Se logs (Mac/Linux)
tail -f logs/combined.log
```

## 🛠️ Almindelige Kommandoer

```bash
# Development
npm run dev:backend      # Start med hot reload

# Production
npm run build:backend    # Build
npm run start:backend    # Start

# Database
npm run db:migrate       # Kør migrations

# Testing
npm test                 # Kør tests
npm run lint             # Lint kode
```

**Se [COMMANDS.md](./COMMANDS.md) for alle kommandoer**

## 🔒 Sikkerhed

Backenden implementerer:
- ✅ Rate limiting (10 req/15 min)
- ✅ CORS protection
- ✅ Input validering (Zod)
- ✅ SQL injection protection
- ✅ Security headers (Helmet)
- ✅ Error handling uden sensitive data

## 🚀 Deployment

### Development
```bash
npm run dev:backend
```

### Production
```bash
# Build
npm run build:backend

# Start
NODE_ENV=production npm run start:backend

# Eller med PM2
pm2 start dist/server/index.js --name overnatihaven
```

**Se [BACKEND_OVERVIEW.md](./BACKEND_OVERVIEW.md) for deployment guide**

## 📞 Næste Skridt

1. ✅ **Læs [QUICKSTART.md](./QUICKSTART.md)** - Få alt til at virke
2. ✅ **Test API'et** - Åbn `test-api.html` i browser
3. ✅ **Byg frontend** - Brug endpoints fra [API.md](./API.md)
4. ✅ **Konfigurer email** - Valgfrit, se `.env.example`
5. ✅ **Deploy** - Når du er klar til production

## 💡 Tips

### Development Workflow
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend (når du opretter den)
npm run dev

# Terminal 3: Logs
tail -f logs/combined.log  # Mac/Linux
```

### VS Code Extensions
Anbefalede extensions:
- ESLint
- Prettier
- Thunder Client (API testing)
- SQLite Viewer

### Testing
```bash
# Quick test
curl http://localhost:3000/api/health

# eller åbn
http://localhost:3000/api/health
# i din browser
```

## 🆘 Problemer?

### Port optaget?
```bash
# Ændr i .env
PORT=3001
```

### Database fejl?
```bash
# Reset database
# Windows: del data\overnatihaven.db
# Mac/Linux: rm data/overnatihaven.db
npm run db:migrate
```

### Email virker ikke?
Email er valgfrit. Tjek logs for warnings. Alt andet virker uden email.

**Mere troubleshooting i [QUICKSTART.md](./QUICKSTART.md)**

## 📚 Lær Mere

| Emne | Dokument |
|------|----------|
| Kom i gang | [QUICKSTART.md](./QUICKSTART.md) |
| API reference | [API.md](./API.md) |
| Arkitektur | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Tekniske detaljer | [BACKEND_OVERVIEW.md](./BACKEND_OVERVIEW.md) |
| Kommandoer | [COMMANDS.md](./COMMANDS.md) |
| Feature liste | [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) |

## 🎯 Teknologi Stack

| Kategori | Teknologi |
|----------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express |
| Database | SQLite |
| Validering | Zod |
| Email | Nodemailer |
| Logging | Winston |
| Testing | Jest |

## ✨ Features

- ✅ Booking system med overlap detection
- ✅ Kontaktformular
- ✅ Email notifikationer
- ✅ Tilgængelighedstjek
- ✅ Rate limiting
- ✅ Input validering
- ✅ Struktureret logging
- ✅ Error handling
- ✅ TypeScript
- ✅ Tests
- ✅ Extensive documentation

## 🎉 Du er Klar!

Din backend er **100% funktionel** og klar til brug!

**Første skridt:**
```bash
npm install
npm run db:migrate
npm run dev:backend
```

**Så læs:**
- [QUICKSTART.md](./QUICKSTART.md) for detaljer
- [API.md](./API.md) for API integration

**Held og lykke! 🚀**

---

**Spørgsmål?** Se dokumentationen eller tjek kode kommentarer.  
**Backend version:** 1.0.0  
**Status:** ✅ Production Ready
