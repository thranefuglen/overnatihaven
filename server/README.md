# Server Directory

Dette directory indeholder al backend kode til Elins Overnatningshave.

## 📁 Struktur

```
server/
├── config/          # Konfiguration og setup
├── controllers/     # HTTP request handlers
├── db/              # Database setup og migrations
├── middleware/      # Express middleware
├── repositories/    # Data access layer
├── routes/          # API route definitions
├── services/        # Business logic
├── types/           # TypeScript types og Zod schemas
├── app.ts          # Express app configuration
└── index.ts        # Server entry point
```

## 🏗️ Arkitektur

Koden følger **clean architecture** med lag-separering:

```
Routes → Controllers → Services → Repositories → Database
```

### Layer Ansvar

- **Routes**: URL mapping og middleware
- **Controllers**: HTTP request/response håndtering
- **Services**: Business logic og validering
- **Repositories**: Database queries
- **Types**: TypeScript types og Zod schemas

## 📝 Fil Guide

### Entry Points

- **`index.ts`** - Server opstart, database init, graceful shutdown
- **`app.ts`** - Express app konfiguration, middleware setup

### Configuration

- **`config/env.ts`** - Environment variabler og konfiguration
- **`config/logger.ts`** - Winston logger setup

### Database

- **`db/database.ts`** - SQLite connection management
- **`db/migrate.ts`** - Migration runner script
- **`db/schema.sql`** - Database schema definition

### Types & Validation

- **`types/index.ts`** - Alle TypeScript types og Zod validation schemas

### Controllers

- **`controllers/inquiryController.ts`** - Booking inquiry endpoints
- **`controllers/contactController.ts`** - Contact form endpoints

### Services

- **`services/inquiryService.ts`** - Booking business logic
- **`services/contactService.ts`** - Contact business logic
- **`services/emailService.ts`** - Email notification service
- **`services/inquiryService.test.ts`** - Unit tests eksempel

### Repositories

- **`repositories/inquiryRepository.ts`** - Inquiry CRUD operations
- **`repositories/contactRepository.ts`** - Contact CRUD operations

### Routes

- **`routes/index.ts`** - Main router, samler alle sub-routes
- **`routes/inquiryRoutes.ts`** - Booking inquiry routes
- **`routes/contactRoutes.ts`** - Contact routes

### Middleware

- **`middleware/errorHandler.ts`** - Global error handling og 404
- **`middleware/validator.ts`** - Request validation middleware

## 🔄 Request Flow

Eksempel på hvordan en request flyder gennem systemet:

```
1. POST /api/inquiries
   ↓
2. CORS, Rate Limiting, Body Parsing (app.ts)
   ↓
3. Route handler (routes/inquiryRoutes.ts)
   ↓
4. Validation middleware (middleware/validator.ts)
   ↓
5. Controller (controllers/inquiryController.ts)
   ↓
6. Service (services/inquiryService.ts)
   - Business logic
   - Validation
   - Email notification
   ↓
7. Repository (repositories/inquiryRepository.ts)
   - Database query
   ↓
8. Response tilbage til client
```

## 🧪 Testing

Unit tests er placeret ved siden af filen de tester:

```
services/
  inquiryService.ts
  inquiryService.test.ts  ← Test fil
```

Kør tests fra rod:
```bash
npm test
```

## 🎯 Tilføj Ny Feature

### 1. Tilføj Type/Schema

```typescript
// types/index.ts
export const newFeatureSchema = z.object({
  // ...
});

export type NewFeature = z.infer<typeof newFeatureSchema>;
```

### 2. Opret Repository

```typescript
// repositories/newFeatureRepository.ts
export class NewFeatureRepository {
  create(data: NewFeature) { /* ... */ }
  findById(id: number) { /* ... */ }
}
```

### 3. Opret Service

```typescript
// services/newFeatureService.ts
export class NewFeatureService {
  async createFeature(data: NewFeature) {
    // Business logic
    return repository.create(data);
  }
}
```

### 4. Opret Controller

```typescript
// controllers/newFeatureController.ts
export class NewFeatureController {
  async create(req: Request, res: Response) {
    const data = req.body;
    const result = await service.createFeature(data);
    res.json({ success: true, data: result });
  }
}
```

### 5. Opret Routes

```typescript
// routes/newFeatureRoutes.ts
const router = Router();
router.post('/', 
  validateBody(newFeatureSchema),
  asyncHandler(controller.create)
);
export default router;
```

### 6. Registrer Routes

```typescript
// routes/index.ts
import newFeatureRoutes from './newFeatureRoutes';
router.use('/new-feature', newFeatureRoutes);
```

## 📚 Coding Guidelines

### TypeScript

- Brug `interface` for objekter
- Brug `type` for unions
- Undgå `any`, brug `unknown` hvis nødvendigt
- Explicit return types på functions

### Naming Conventions

- **camelCase**: variabler, functions
- **PascalCase**: classes, interfaces, types
- **UPPER_SNAKE_CASE**: konstanter

### Error Handling

```typescript
try {
  // Operation
} catch (error) {
  logger.error('Beskrivelse', { error, context });
  throw new AppError('Brugervenlig besked', 400);
}
```

### Logging

```typescript
logger.info('Operation successful', { data });
logger.error('Operation failed', { error, context });
logger.debug('Debug info', { details });
```

### Async/Await

Brug altid async/await i services og controllers:

```typescript
async function example() {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    // Handle error
  }
}
```

## 🔒 Security Best Practices

1. **Always validate input** - Brug Zod schemas
2. **Use prepared statements** - Aldrig string concatenation i SQL
3. **Log security events** - Men ikke sensitive data
4. **Handle errors properly** - Ingen stack traces til klienter
5. **Sanitize output** - Escape data hvis nødvendigt

## 📊 Database Best Practices

1. **Use transactions** for multi-step operations
2. **Index frequently queried columns**
3. **Validate at both app and DB level**
4. **Use migrations** for schema changes
5. **Test queries** for performance

## 🚀 Performance Tips

1. **Avoid N+1 queries** - Use joins or batch queries
2. **Use indices** on WHERE/ORDER BY columns
3. **Limit result sets** - Use pagination
4. **Cache when appropriate** - But keep it simple
5. **Profile slow operations** - Use logger timestamps

## 🐛 Debugging

### Enable Debug Logs

```bash
DEBUG=* npm run dev:backend
```

### Check Database

```bash
sqlite3 data/overnatihaven.db
sqlite> .tables
sqlite> SELECT * FROM inquiries;
```

### Monitor Logs

```bash
# Windows
type logs\combined.log

# Mac/Linux
tail -f logs/combined.log
```

## 📝 Code Comments

Skriv kommentarer for:

- **Public APIs** - JSDoc comments
- **Complex logic** - Inline comments explaining WHY
- **TODOs** - `// TODO: beskrivelse`
- **Workarounds** - Forklar hvorfor

Undgå kommentarer der forklarer WHAT (koden skal være self-explanatory).

## 🔄 Git Workflow

```bash
# Før commit
npm run lint
npm test
npm run build:backend

# Commit
git add .
git commit -m "beskrivelse"
```

## 📚 Yderligere Læsning

- [../BACKEND_OVERVIEW.md](../BACKEND_OVERVIEW.md) - Komplet teknisk oversigt
- [../ARCHITECTURE.md](../ARCHITECTURE.md) - System arkitektur
- [../API.md](../API.md) - API dokumentation

## 💡 Tips

- Følg eksisterende patterns i kodebasen
- Hold functions små og fokuserede
- Skriv tests for ny functionality
- Dokumentér kompleks business logic
- Brug TypeScript til fulde (no `any`)

---

**Spørgsmål?** Se root README eller kode kommentarer.
