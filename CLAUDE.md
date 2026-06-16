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

### VIGTIGT: nye API-ruter skal registreres i `server/handler.ts`
- Produktionens serverless-entry er **`server/handler.ts`**, som har sin **egen** liste af `app.use('/api/...')`-mounts. Den deler **ikke** `server/routes/index.ts` (som kun bruges af dev-serveren via `app.ts`).
- Tilføjer du en ny rute, skal den registreres **begge** steder — ellers virker den lokalt/i E2E men giver **404 i produktion**.
- `api/index.js` er den bundlede serverless-funktion (committet build-artefakt). Efter enhver `server/`-ændring:
  ```
  npm run build:api   # bundler handler.ts → api/index.js
  git add api/index.js
  ```
- SQL-skemaet bundles ind via `--loader:.sql=text`, og `handler.ts` kører `runMigrations()` idempotent ved cold start — så nye tabeller oprettes automatisk i prod-databasen, *forudsat* bundlen er genbygget.

## Test-regler

- Når du implementerer en feature, skriv altid en Playwright E2E-test der dækker de kritiske brugerflows. Testfiler placeres i `e2e/`-mappen.
- Tests skal bruge `POST /api/test/reset` i `beforeEach` for at sikre known database state.
- Se `e2e/login.spec.ts` som eksempel på teststruktur og -konventioner.
- Kør tests med `npm run test:e2e`.
