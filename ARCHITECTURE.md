# System Arkitektur

Visuel guide til backend arkitekturen for Elins Have.

## 🏛️ High-Level Arkitektur

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│              (React + Vite + TailwindCSS)                   │
│                    Port: 5173                               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           │ JSON
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                        │
│                 (Node.js + Express + TypeScript)            │
│                       Port: 3000                            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                       │   │
│  │  • CORS          • Rate Limiting                    │   │
│  │  • Helmet        • Body Parser                      │   │
│  │  • Logger        • Error Handler                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Routes Layer                           │   │
│  │  • /api/health                                      │   │
│  │  • /api/inquiries                                   │   │
│  │  • /api/contacts                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Controllers Layer                         │   │
│  │  • Parse requests                                   │   │
│  │  • Call services                                    │   │
│  │  • Format responses                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Services Layer                           │   │
│  │  • Business logic                                   │   │
│  │  • Validation                                       │   │
│  │  • Email notifications                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Repositories Layer                         │   │
│  │  • Database queries                                 │   │
│  │  • CRUD operations                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (SQLite)                         │
│                 data/overnatihaven.db                       │
│  • inquiries table                                          │
│  • contacts table                                           │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ (async)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              EMAIL SERVICE (Nodemailer)                      │
│                    SMTP Server                              │
│  • Booking confirmations                                    │
│  • Owner notifications                                      │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Layer Beskrivelser

### 1. Frontend Layer
- **Teknologi**: React, Vite, TailwindCSS
- **Ansvar**: UI, bruger interaktion, API kald
- **Kommunikation**: HTTP REST API til backend

### 2. Middleware Layer
- **Komponenter**:
  - CORS: Håndterer cross-origin requests
  - Helmet: Sikrer HTTP headers
  - Rate Limiter: Beskytter mod spam
  - Body Parser: Parser JSON requests
  - Logger: Logger alle requests
  - Error Handler: Fanger og håndterer fejl

### 3. Routes Layer
- **Ansvar**: URL routing og HTTP verb mapping
- **Endpoints**:
  - `/api/health` - Health check
  - `/api/inquiries` - Booking endpoints
  - `/api/contacts` - Contact endpoints

### 4. Controllers Layer
- **Ansvar**: HTTP request/response håndtering
- **Funktioner**:
  - Parse request data
  - Call service layer
  - Format JSON responses
  - HTTP status codes

### 5. Services Layer
- **Ansvar**: Business logic
- **Funktioner**:
  - Input validering (Zod)
  - Availability checks
  - Email notifications
  - Business rules

### 6. Repositories Layer
- **Ansvar**: Data access
- **Funktioner**:
  - CRUD operations
  - SQL queries
  - Database transactions
  - Data mapping

### 7. Database Layer
- **Teknologi**: SQLite
- **Tabeller**: inquiries, contacts
- **Features**: WAL mode, indices, migrations

### 8. Email Layer
- **Teknologi**: Nodemailer
- **Funktioner**: Async email sending
- **Recipients**: Gæster og ejer

## 🔄 Request Flow Diagram

### Booking Creation Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ POST /api/inquiries
     │ { name, email, dates, ... }
     ▼
┌─────────────────┐
│  Middleware     │
│  - CORS         │
│  - Rate Limit   │
│  - Body Parse   │
└────┬────────────┘
     ▼
┌─────────────────┐
│  Validator      │
│  - Zod Schema   │
│  - Type Check   │
└────┬────────────┘
     ▼
┌─────────────────┐
│  Controller     │
│  createInquiry()│
└────┬────────────┘
     ▼
┌─────────────────┐
│  Service        │
│  - Check        │
│    overlap      │
│  - Create       │
│  - Send emails  │
└────┬────────────┘
     ▼
┌─────────────────┐
│  Repository     │
│  - INSERT SQL   │
│  - Return data  │
└────┬────────────┘
     ▼
┌─────────────────┐
│  Database       │
│  - Save record  │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Response       │
│  201 Created    │
│  { success,     │
│    data }       │
└─────────────────┘
```

## 🗂️ Fil Organisering

```
C:\Code\overnatihaven\
│
├── server/                    # Backend kode
│   ├── config/               # Konfiguration
│   │   ├── env.ts           # Environment variabler
│   │   └── logger.ts        # Winston logger
│   │
│   ├── controllers/          # Request handlers
│   │   ├── inquiryController.ts
│   │   └── contactController.ts
│   │
│   ├── db/                   # Database
│   │   ├── database.ts      # Connection management
│   │   ├── migrate.ts       # Migrations
│   │   └── schema.sql       # SQL schema
│   │
│   ├── middleware/           # Express middleware
│   │   ├── errorHandler.ts  # Global error handling
│   │   └── validator.ts     # Request validation
│   │
│   ├── repositories/         # Data access
│   │   ├── inquiryRepository.ts
│   │   └── contactRepository.ts
│   │
│   ├── routes/              # API routes
│   │   ├── index.ts         # Main router
│   │   ├── inquiryRoutes.ts
│   │   └── contactRoutes.ts
│   │
│   ├── services/            # Business logic
│   │   ├── inquiryService.ts
│   │   ├── contactService.ts
│   │   └── emailService.ts
│   │
│   ├── types/               # TypeScript types
│   │   └── index.ts         # Types + Zod schemas
│   │
│   ├── app.ts              # Express app setup
│   └── index.ts            # Server entry point
│
├── data/                    # Database (git ignored)
│   └── overnatihaven.db
│
├── logs/                    # Log filer (git ignored)
│   ├── error.log
│   └── combined.log
│
├── dist/                    # Build output (git ignored)
│   └── server/
│
└── Configuration files
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.server.json
    ├── .env
    ├── .env.example
    └── .gitignore
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────┐
│            Client Request                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          CORS Validation                 │
│  ✓ Check origin                         │
│  ✓ Allow/Deny                           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          Rate Limiting                   │
│  ✓ Check request count                  │
│  ✓ Block if > 10/15min                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          Helmet Headers                  │
│  ✓ XSS Protection                       │
│  ✓ CSP                                  │
│  ✓ HSTS                                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       Input Validation (Zod)            │
│  ✓ Schema validation                    │
│  ✓ Type checking                        │
│  ✓ Sanitization                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Business Logic Validation          │
│  ✓ Date logic                           │
│  ✓ Availability check                   │
│  ✓ Business rules                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       Database (Prepared Statements)    │
│  ✓ SQL injection protection             │
│  ✓ Parameterized queries                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          Response                        │
│  ✓ No sensitive data                    │
│  ✓ No stack traces (prod)               │
│  ✓ Proper status codes                  │
└─────────────────────────────────────────┘
```

## 📊 Data Flow: Booking System

```
┌───────────────────────────────────────────────────────┐
│                    USER CREATES BOOKING                │
└─────────────────────┬─────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌──────────────┐            ┌──────────────┐
│  Validation  │            │  Check       │
│  - Name      │            │  Availability│
│  - Email     │            │  - Query DB  │
│  - Dates     │            │  - Check     │
│  - People    │            │    overlap   │
└──────┬───────┘            └──────┬───────┘
       │                           │
       │         ┌─────────────────┘
       │         │
       ▼         ▼
┌─────────────────────────┐
│   CREATE IN DATABASE    │
│   - INSERT inquiry      │
│   - Status: pending     │
└─────────┬───────────────┘
          │
          ├─────────────┬─────────────┐
          │             │             │
          ▼             ▼             ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │  Email   │  │  Email   │  │ Response │
   │  to      │  │  to      │  │ to       │
   │  Guest   │  │  Owner   │  │ Client   │
   └──────────┘  └──────────┘  └──────────┘
```

## 🔄 State Management: Inquiry Status

```
┌─────────┐
│ pending │  Initial status ved oprettelse
└────┬────┘
     │
     ├──────► ┌───────────┐
     │        │ confirmed │  Ejer accepterer
     │        └───────────┘
     │
     ├──────► ┌───────────┐
     │        │ declined  │  Ejer afviser
     │        └───────────┘
     │
     └──────► ┌───────────┐
              │ completed │  Efter ophold
              └───────────┘
```

## 🏗️ Database Schema Visual

```
┌─────────────────────────────────────────────┐
│              INQUIRIES TABLE                 │
├─────────────────────────────────────────────┤
│ id                  INTEGER (PK)            │
│ name                TEXT                    │
│ email               TEXT                    │
│ phone               TEXT (nullable)         │
│ arrival_date        TEXT                    │
│ departure_date      TEXT                    │
│ num_people          INTEGER                 │
│ message             TEXT (nullable)         │
│ status              TEXT (enum)             │
│ created_at          TEXT (auto)             │
│ updated_at          TEXT (auto)             │
├─────────────────────────────────────────────┤
│ Indices:                                    │
│ - idx_inquiries_status                      │
│ - idx_inquiries_created_at                  │
│ - idx_inquiries_arrival_date                │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│              CONTACTS TABLE                  │
├─────────────────────────────────────────────┤
│ id                  INTEGER (PK)            │
│ name                TEXT                    │
│ email               TEXT                    │
│ subject             TEXT (nullable)         │
│ message             TEXT                    │
│ is_read             INTEGER (0/1)           │
│ created_at          TEXT (auto)             │
├─────────────────────────────────────────────┤
│ Indices:                                    │
│ - idx_contacts_created_at                   │
│ - idx_contacts_is_read                      │
└─────────────────────────────────────────────┘
```

## 🌐 API Endpoint Structure

```
/api
├── /health (GET)
│   └── Returns: { success, message, timestamp }
│
├── /inquiries
│   ├── POST /
│   │   └── Body: CreateInquiryInput
│   │   └── Returns: Inquiry
│   │
│   ├── GET /
│   │   └── Query: status?, limit?
│   │   └── Returns: Inquiry[]
│   │
│   ├── GET /:id
│   │   └── Returns: Inquiry
│   │
│   └── GET /availability
│       └── Query: arrivalDate, departureDate
│       └── Returns: { available: boolean }
│
└── /contacts
    ├── POST /
    │   └── Body: CreateContactInput
    │   └── Returns: Contact
    │
    ├── GET /
    │   └── Query: isRead?, limit?
    │   └── Returns: Contact[]
    │
    └── GET /:id
        └── Returns: Contact
```

## 🔄 Dependency Injection Pattern

```
┌──────────────────────────────────────┐
│         Singleton Services            │
│                                      │
│  ┌────────────────────────────┐     │
│  │  emailService              │     │
│  │  - Shared instance         │     │
│  │  - Email transporter       │     │
│  └────────────────────────────┘     │
│                                      │
│  ┌────────────────────────────┐     │
│  │  inquiryService            │     │
│  │  - Uses inquiryRepository  │     │
│  │  - Uses emailService       │     │
│  └────────────────────────────┘     │
│                                      │
│  ┌────────────────────────────┐     │
│  │  contactService            │     │
│  │  - Uses contactRepository  │     │
│  │  - Uses emailService       │     │
│  └────────────────────────────┘     │
│                                      │
│  ┌────────────────────────────┐     │
│  │  inquiryRepository         │     │
│  │  - Uses database singleton │     │
│  └────────────────────────────┘     │
│                                      │
│  ┌────────────────────────────┐     │
│  │  contactRepository         │     │
│  │  - Uses database singleton │     │
│  └────────────────────────────┘     │
└──────────────────────────────────────┘
```

## 📈 Scalability Considerations

### Current Architecture (Small Scale)
```
Single Server + SQLite
├── Handles: ~1000 bookings/year
├── Concurrent users: ~10-50
└── Database size: <100MB
```

### Future Scaling Options
```
Option 1: Vertical Scaling
├── Larger server instance
├── More RAM/CPU
└── Still using SQLite

Option 2: Horizontal Scaling
├── Multiple app instances
├── PostgreSQL/MySQL
├── Redis for caching
└── Load balancer

Option 3: Serverless
├── AWS Lambda / Cloud Functions
├── DynamoDB / Firestore
├── S3 for static assets
└── CloudFront CDN
```

## 🎯 Design Principles

1. **Separation of Concerns**
   - Hver layer har specifikt ansvar
   - Ingen business logic i controllers
   - Ingen HTTP kode i services

2. **Dependency Inversion**
   - Services afhænger af repositories
   - Repositories afhænger af database
   - Nemt at teste og udskifte

3. **Single Responsibility**
   - En fil, én funktion
   - Services håndterer én ting
   - Clear naming conventions

4. **Error Handling**
   - Try-catch på alle async operations
   - Centralized error handler
   - User-friendly messages

5. **Security First**
   - Input validation everywhere
   - Prepared statements only
   - Rate limiting by default
   - CORS properly configured

---

**Se også:**
- [BACKEND_OVERVIEW.md](./BACKEND_OVERVIEW.md) - Teknisk detaljer
- [API.md](./API.md) - API reference
- [QUICKSTART.md](./QUICKSTART.md) - Kom i gang guide
