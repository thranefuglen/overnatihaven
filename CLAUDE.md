# Claude Code – Projektregler

## Deployment-flow

Dette projekt deployer automatisk via Vercel ved push/merge til `main`.

### Regler
- **Claude må IKKE merge en PR til `main` uden eksplicit godkendelse fra brugeren.**
- Arbejd altid på en feature-branch, ikke direkte på `main`.
- Push til en branch → Vercel opretter automatisk en preview-URL med dev-databasen.
- Brugeren godkender preview → merger selv PR'en → prod deployer.

### Miljøer
| Miljø | Database | Trigger |
|-------|----------|---------|
| Production | Vercel Postgres (prod) | Merge til `main` |
| Preview | Vercel Postgres (dev/scratch) | Push til hvilken som helst branch |
| Development | Vercel Postgres (dev/scratch) | Lokalt |

### VIGTIGT: `api/index.js` er et committet build-artefakt
- `api/index.js` er den bundlede serverless-funktion, som Vercel deployer **som-det-er** (den genbygges ikke ved deploy).
- **Enhver ændring i `server/`** (ruter, controllers, schema i `schema.postgres.sql` osv.) kræver, at bundlen genbygges og committes i samme PR:
  ```
  npm run build:api   # skriver api/index.js
  git add api/index.js
  ```
- Glemmer du det, deployes frontenden uden den matchende backend → fx 404 på nye API-ruter i produktion.
- SQL-skemaet bundles ind via `--loader:.sql=text`, og `handler.ts` kører `runMigrations()` idempotent ved cold start — så nye tabeller oprettes automatisk, *forudsat* bundlen er genbygget.

## Test-regler

- Når du implementerer en feature, skriv altid en Playwright E2E-test der dækker de kritiske brugerflows. Testfiler placeres i `e2e/`-mappen.
- Tests skal bruge `POST /api/test/reset` i `beforeEach` for at sikre known database state.
- Se `e2e/login.spec.ts` som eksempel på teststruktur og -konventioner.
- Kør tests med `npm run test:e2e`.
