# PRD: Test-infrastruktur og testbar arkitektur

## Problem Statement

Kodebasen har ingen systematisk måde at regressionsteste ændringer inden release til produktion. Der er ingen E2E-tests, ingen måde at nulstille databasen til en known state, og dead code (SQLite-rester) forvirrer agenter der arbejder i kodebasen. Miljøforskelle mellem lokalt og prod gør det svært at stole på at det der virker lokalt også virker i prod.

Resultatet er at login og andre kritiske flows kun testes manuelt, og regressionsfejl først opdages i produktion.

## Solution

Gør kodebasen testbar ved at fjerne dead code, tilføje test-infrastruktur (database-reset, auth-bypass), opsætte Playwright E2E-tests, og indføre procesregler der sikrer at fremtidige features altid inkluderer tests.

Målet er at en agent (eller udvikler) kan køre `npm run test:e2e` lokalt mod dev-Postgres og få høj tillid til at prod vil virke.

## User Stories

1. Som udvikler vil jeg kunne køre E2E-tests lokalt der verificerer at password-login virker, så jeg kan fange login-regressionsfejl inden de når produktion.
2. Som udvikler vil jeg have en test-reset-mekanisme der nulstiller databasen til en known state, så tests altid starter fra et forudsigeligt udgangspunkt.
3. Som agent vil jeg kunne autentificere i tests uden at klikke mig igennem login-flowet, så E2E-tests der kræver admin-adgang er hurtige og pålidelige.
4. Som udvikler vil jeg have dead dependencies fjernet (better-sqlite3), så kodebasen er ren og ikke forvirrer agenter eller nye udviklere.
5. Som udvikler vil jeg have at `.env.example` dokumenterer alle nødvendige env vars til lokal test-setup, så opsætning af testmiljø er trivielt.
6. Som agent vil jeg have en CLAUDE.md-regel der siger at features altid skal have E2E-tests, så regressionstests vedligeholdes løbende.
7. Som udvikler vil jeg have at PRD-skabelonen inkluderer en test-sektion, så testbarhed tænkes ind allerede på planstadiet.
8. Som udvikler vil jeg have at lokalt miljø bruger samme database-engine (Postgres) som prod, så der ikke er runtime-forskelle mellem miljøer.
9. Som agent vil jeg have en simpel Playwright-konfiguration med eksempler, så det er nemt at skrive nye tests for fremtidige features.
10. Som udvikler vil jeg have at test-reset-endpointet er beskyttet så det aldrig kan køre i produktion, så der ikke er sikkerhedsrisici.

## Implementation Decisions

### Fase 1: Oprydning og testbar arkitektur

**Fjern dead SQLite-afhængighed**
- Fjern `better-sqlite3` og `@types/better-sqlite3` fra `package.json`
- Fjern `database.path` / `DB_PATH` fra `server/config/env.ts`
- Fjern SQLite-referencer fra `server/README.md`
- Kør `npm install` for at opdatere lockfile

**Test-reset endpoint**
- Nyt endpoint: `POST /api/test/reset`
- Kun tilgængeligt når `NODE_ENV=test` — returnerer 404 i alle andre miljøer
- Sletter alt data i tabellerne: `inquiries`, `contacts`, `gallery_images`, `facilities`
- Genindsætter seed-data fra `schema.postgres.sql` (admin-bruger med `admin/Susi2010`, standard-faciliteter, eksempel-galleribilleder)
- Implementeres som en ny route-fil og controller, ikke blandet ind i eksisterende routes

**TEST_ADMIN_TOKEN support i auth-middleware**
- Når env var `TEST_ADMIN_TOKEN` er sat, og en request sender denne værdi som Bearer token, bypass JWT-verifikation og sæt `req.user` til en fast test-bruger (`{ id: 1, username: 'admin' }`)
- Denne env var sættes kun i test-miljø — aldrig i prod eller preview
- Gør det muligt for Playwright-tests at kalde admin-endpoints direkte uden at gå igennem login-flowet

**Opdater `.env.example`**
- Tilføj `TEST_ADMIN_TOKEN` med forklaring
- Tilføj `NODE_ENV=test` instruktion til test-setup
- Dokumenter at `POSTGRES_URL` (Vercel-format) skal pege på dev-Postgres for lokal kørsel

### Fase 2: Playwright E2E-setup

**Installer og konfigurer Playwright**
- Tilføj `@playwright/test` som dev-dependency
- Opret `playwright.config.ts` i projekt-roden
- Konfigurer baseURL til `http://localhost:5173`
- Konfigurer webServer til at starte `npm run dev:full` automatisk

**Første E2E-test: Password-login flow**
- Test-fil: `e2e/login.spec.ts`
- Scenarie 1: Succesfuldt login med admin/Susi2010 — verificer at admin-dashboard vises
- Scenarie 2: Fejlet login med forkert password — verificer fejlbesked
- Scenarie 3: Logout — verificer redirect til login-side
- Brug test-reset endpoint i `beforeEach` for at sikre known state

**npm scripts**
- `npm run test:e2e` — kør Playwright-tests
- `npm run test:e2e:ui` — kør med Playwright UI (debugging)

### Fase 3: Procesændringer

**CLAUDE.md-regel**
- Tilføj regel: "Når du implementerer en feature, skriv altid en Playwright E2E-test der dækker de kritiske brugerflows. Testfiler placeres i `e2e/`-mappen."

**PRD-skabelon (write-a-prd skill)**
- Tilføj en test-sektion til PRD-skabelonen der spørger: "Hvilke brugerflows skal E2E-testes? Beskriv scenarierne."

### Arkitektoniske beslutninger

- **Postgres overalt**: Lokalt, preview og prod bruger alle Postgres (via `@vercel/postgres` med `POSTGRES_URL` env var). Ingen SQLite, ingen in-memory database, ingen shimming.
- **Test-reset er server-side**: Databasen nulstilles via et API-kald, ikke via direkte SQL-scripts. Det holder test-setup simpelt og platformsuafhængigt.
- **TEST_ADMIN_TOKEN er en env var, ikke en kode-flag**: Tokenet eksisterer kun i test-miljø. Ingen `if (isTest)` logik spredt ud over kodebasen — kun auth-middlewaren kender til det.
- **Playwright over Cypress/Jest-DOM**: Playwright er valgt fordi det kører en rigtig browser, har god TypeScript-support, og kan starte dev-serveren automatisk.
- **E2E over unit-tests som prioritet**: Kodebasen har allerede én Jest-unittest (`inquiryService.test.ts`). E2E-tests giver mest værdi lige nu fordi de tester hele stakken (frontend → API → database) og fanger de regressionsfejl der rammer produktion.

## Testing Decisions

**Hvad gør en god test i dette projekt:**
- Test kun ekstern adfærd fra brugerens perspektiv (klik, navigation, synligt indhold) — ikke implementation details
- Hvert testscenarie starter fra known state via test-reset endpoint
- Tests er selvstændige og kan køres i vilkårlig rækkefølge
- Tests bruger rigtig database (dev-Postgres), ikke mocks

**Moduler der testes:**
- Login-flowet (password-login, fejl-login, logout) — E2E med Playwright
- Test-reset endpoint — verificeres implicit af at tests kører pålideligt

**Prior art:**
- `server/services/inquiryService.test.ts` — eksisterende Jest-unittest med mocks. Denne tilgang bruges IKKE for de nye tests. E2E-tests bruger rigtig infrastruktur.

## Out of Scope

- GitHub OAuth automatiseret test (kræver ekstern GitHub-login-side — testes fortsat manuelt)
- CI/CD integration (GitHub Actions der kører tests ved PR) — kan tilføjes senere
- Unit-tests for eksisterende services og repositories
- Performance-tests eller load-tests
- Test-coverage-rapportering
- Docker-baseret lokal Postgres (brugeren bruger allerede Vercel dev-Postgres)
- Visual regression testing (screenshot-sammenligning)

## Further Notes

- **Eksisterende admin-credentials i schema**: `admin` / `Susi2010` — disse bruges som test-credentials og er allerede i `schema.postgres.sql`
- **Rate limiting**: Standard rate limit er 10 req/15 min. Tests kan ramme dette. Overvej at hæve eller deaktivere rate limiting når `NODE_ENV=test`.
- **GitHub OAuth**: Forbliver en manuel test. PRD'en for GitHub OAuth Login specificerer allerede en manuel test-tjekliste.
- **Fremtidige tests**: Når dette fundament er på plads, bør nye PRD'er inkludere E2E-testscenarier. Eksempler på næste tests: booking-forespørgsel, kontaktformular, galleri-administration, facilitetsadministration.
