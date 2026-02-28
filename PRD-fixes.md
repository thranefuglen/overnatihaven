# Overnatihaven Fixes PRD

## Kontekst

Projektet er en Vite + React frontend med en Express backend deployeret som Vercel Serverless Function (`api/index.ts`). Databasen er PostgreSQL via Neon/Vercel Postgres. Billeder uploades via multer til lokal disk (`./uploads/gallery/`) og `image_url` gemmes som `/uploads/gallery/filename.jpg`. `vercel.json` router `/api/*` til serverless-funktionen og alt andet til `index.html`.

Relevante filer:
- `/c/Code/overnatihaven/.env.example` — committed eksempelfil med placeholder-credentials der trigger GitGuardian
- `/c/Code/overnatihaven/.gitignore` — excluder `.env` og `.env.local` men ikke nok
- `/c/Code/overnatihaven/server/middleware/upload.ts` — bruger `multer.diskStorage` og skriver til disk
- `/c/Code/overnatihaven/server/controllers/galleryController.ts` — sætter `image_url` til `/uploads/gallery/${filename}` (lokal sti)
- `/c/Code/overnatihaven/server/config/env.ts` — konfiguration, inkl. `upload.uploadDir`
- `/c/Code/overnatihaven/vite.config.ts` — ingen proxy konfigureret
- `/c/Code/overnatihaven/package.json` — ingen `dev:full` script, ingen `concurrently`
- `/c/Code/overnatihaven/vercel.json` — ingen `/uploads/*` route

## Mål

Løs tre konkrete problemer der forhindrer projektet i at fungere korrekt i produktion (Vercel) og lokalt:
1. Fjern GitGuardian-advarsler forårsaget af placeholder-credentials i `.env.example`
2. Få galleri-billeder til at virke på Vercel ved at bruge Vercel Blob Storage
3. Gør lokal udvikling nem og korrekt konfigureret med concurrent dev-scripts og proxy

---

## Krav

### Task 1: Fix GitGuardian SMTP secret alert

**FR-1.1** Erstat alle credential-lignende placeholder-værdier i `.env.example` med neutralt navngivne tokens der ikke trigger secret-scannere. Specifikke udskiftninger:
  - `SMTP_PASS=dit-password` → `SMTP_PASS=CHANGE_ME`
  - `DB_PASSWORD=your_password` → `DB_PASSWORD=CHANGE_ME`
  - `JWT_SECRET=your-super-secret-jwt-key-change-in-production` → `JWT_SECRET=CHANGE_ME`
  - `SMTP_USER=din-email@gmail.com` → `SMTP_USER=your-smtp-user@example.com`
  - `EMAIL_FROM=din-email@gmail.com` → `EMAIL_FROM=your-email@example.com`

**FR-1.2** Tilføj en kommentar i `.env.example` øverst der tydeligt angiver at filen er et eksempel og at alle `CHANGE_ME`-værdier skal udskiftes.

**FR-1.3** Verificer at `.gitignore` indeholder `.env` og `.env.local` som separate linjer (eksisterer allerede — bekræft og bevar).

**FR-1.4** Tilføj `BLOB_READ_WRITE_TOKEN=CHANGE_ME` til `.env.example` (bruges i Task 2).

**Completion-kriterie for Task 1:** Kommandoen `grep -E "(dit-password|your_password|your-super-secret|din-email)" /c/Code/overnatihaven/.env.example` returnerer nul matches.

---

### Task 2: Fix images not loading on Vercel (Vercel Blob Storage)

**FR-2.1** Installer `@vercel/blob` pakken:
```bash
npm install @vercel/blob
```

**FR-2.2** Modificer `/c/Code/overnatihaven/server/middleware/upload.ts`:
  - Udskift `multer.diskStorage` med `multer.memoryStorage()` så filen holdes i RAM (`req.file.buffer`)
  - Bevar `fileFilter` og `limits` uændret
  - Fjern `ensureUploadDir`, `deleteFile` og `getFileInfo` funktioner (de er filesystem-specifikke)
  - Eksporter stadig `upload` og `handleUploadError`

**FR-2.3** Opret en ny hjælpefunktion `uploadToBlob` i `/c/Code/overnatihaven/server/middleware/upload.ts` (eller en ny fil `/c/Code/overnatihaven/server/services/blobStorage.ts`):
  - Funktionen tager `(buffer: Buffer, filename: string, mimetype: string)` og returnerer `Promise<string>` (den fulde blob URL)
  - Hvis `process.env.BLOB_READ_WRITE_TOKEN` er sat: brug `@vercel/blob` `put()` til at uploade til Blob Storage med `access: 'public'`
  - Hvis `BLOB_READ_WRITE_TOKEN` ikke er sat (lokal dev): gem filen i `/tmp/uploads/` og returner `/tmp-uploads/${filename}` som URL
  - Funktionen skal generere et unikt filnavn med timestamp + random string + original extension (samme logik som eksisterende `filename` callback)

**FR-2.4** Modificer `/c/Code/overnatihaven/server/controllers/galleryController.ts` metoderne `createImage` og `updateImage`:
  - Kald `uploadToBlob` med `req.file.buffer`, `req.file.originalname` og `req.file.mimetype` når `req.file` er til stede
  - Gem den returnerede URL (fuld Blob HTTPS URL eller lokal sti) som `image_url` i stedet for `/uploads/gallery/${filename}`
  - Fjern referencer til `req.file.path` og `req.file.filename`

**FR-2.5** Tilføj en Express static-route i `/c/Code/overnatihaven/server/app.ts` (eller `index.ts`) til at serve `/tmp/uploads/` under URL-stien `/tmp-uploads/` — kun aktiv når `BLOB_READ_WRITE_TOKEN` ikke er sat. Dette sikrer at lokalt uploadede billeder kan vises i browseren.

**FR-2.6** Tilføj `BLOB_READ_WRITE_TOKEN` til `server/config/env.ts` config-objektet:
```typescript
blob: {
  readWriteToken: process.env.BLOB_READ_WRITE_TOKEN || '',
},
```

**Completion-kriterie for Task 2:**
- `grep -r "diskStorage" /c/Code/overnatihaven/server/` returnerer nul matches
- `grep -r "uploads/gallery" /c/Code/overnatihaven/server/` returnerer nul matches (undtagen evt. kommentarer)
- `grep "@vercel/blob" /c/Code/overnatihaven/package.json` returnerer et match
- `npx tsc -p /c/Code/overnatihaven/tsconfig.server.json --noEmit` returnerer exit code 0

---

### Task 3: Local dev + Vercel compatibility

**FR-3.1** Installer `concurrently` som devDependency:
```bash
npm install --save-dev concurrently
```

**FR-3.2** Tilføj følgende scripts til `/c/Code/overnatihaven/package.json`:
```json
"dev:full": "concurrently \"npm run dev\" \"npm run dev:backend\" --names \"vite,api\" --prefix-colors \"cyan,green\""
```

**FR-3.3** Ret PORT-mismatch: backenden kører på `PORT=3000` men `VITE_API_URL=http://localhost:3001/api` i `.env.example`. Opdater `.env.example`:
  - `VITE_API_URL=http://localhost:3000/api`

**FR-3.4** Konfigurer Vite proxy i `/c/Code/overnatihaven/vite.config.ts` så `/api/*` proxies til `http://localhost:3000` under lokal udvikling. Den endelige `vite.config.ts` skal se sådan ud:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
```

**FR-3.5** Opret filen `/c/Code/overnatihaven/.env.local.example` med korrekte værdier til lokal udvikling:
```
# Lokal udviklingsmiljø — kopiér til .env.local og udfyld CHANGE_ME-værdier

PORT=3000
NODE_ENV=development

# PostgreSQL (Neon eller lokal Postgres)
DATABASE_URL=CHANGE_ME

# JWT
JWT_SECRET=CHANGE_ME_local_dev_secret

# SMTP (valgfrit til lokal test — kan udelades)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=CHANGE_ME
# SMTP_PASS=CHANGE_ME
# EMAIL_FROM=CHANGE_ME
# EMAIL_TO=CHANGE_ME

# CORS
CORS_ORIGIN=http://localhost:5173

# Vercel Blob (udelad for at bruge lokal /tmp fallback)
# BLOB_READ_WRITE_TOKEN=CHANGE_ME

# Vite (frontend)
VITE_API_URL=http://localhost:3000/api
```

**FR-3.6** Opdater `/c/Code/overnatihaven/README.md` med en sektion "Lokal udvikling" der beskriver:
  - Kopiér `.env.local.example` til `.env.local` og udfyld værdier
  - Kør `npm install`
  - Kør `npm run dev:full` for at starte både frontend og backend samtidig
  - Frontend tilgængeligt på `http://localhost:5173`, API på `http://localhost:3000/api`
  - Sektionen skal indsættes som den første H2 efter projektbeskrivelsen

**Completion-kriterie for Task 3:**
- `grep "dev:full" /c/Code/overnatihaven/package.json` returnerer et match
- `grep "concurrently" /c/Code/overnatihaven/package.json` returnerer et match
- Filen `/c/Code/overnatihaven/.env.local.example` eksisterer
- `grep "proxy" /c/Code/overnatihaven/vite.config.ts` returnerer et match
- `grep "localhost:3001" /c/Code/overnatihaven/.env.example` returnerer nul matches
- `npx tsc -p /c/Code/overnatihaven/tsconfig.node.json --noEmit` returnerer exit code 0 (vite.config.ts kompilerer)

---

## Iterationsstruktur

1. **Første iteration**: Læs git log for at forstå den nuværende tilstand. Læs eksisterende filer nævnt under Kontekst. Udfør Task 1 fuldt ud: rediger `.env.example`, verificer `.gitignore`. Kør completion-kriterie-kommandoen for Task 1. Fortsæt til Task 2 start: installer `@vercel/blob`.

2. **Efterfølgende iterationer**: Læs git log og tjek hvilke filer der allerede er ændret. Fortsæt med næste udestående krav i rækkefølge (Task 2 → Task 3). Efter hver fil-ændring: kør TypeScript-check med `npx tsc -p /c/Code/overnatihaven/tsconfig.server.json --noEmit` og `npx tsc -p /c/Code/overnatihaven/tsconfig.node.json --noEmit`. Ret alle TypeScript-fejl inden du fortsætter.

3. **Validering efter hver task**: Kør den præcise completion-kriterie-kommando for den netop afsluttede task og bekræft at output er korrekt (nul matches / et match / exit code 0).

4. **Afslutning**: Når completion-kriterierne for ALLE tre tasks er bekræftet med grønne kommandoer, output completion promise.

---

## Selvkorrektions-instruktioner

- Kør altid TypeScript-check efter ændringer i `.ts`-filer: `npx tsc -p /c/Code/overnatihaven/tsconfig.server.json --noEmit` og `npx tsc -p /c/Code/overnatihaven/tsconfig.node.json --noEmit`
- Hvis TypeScript fejler: læs fejlbeskeden, identificer hvilken fil og linje der fejler, fiks præcist det og kør igen
- Hvis `@vercel/blob` import fejler med typefejl: tjek at `@types`-pakker er installeret korrekt med `npm list @vercel/blob`
- Hvis `multer.memoryStorage` giver TypeScript-fejl på `req.file.buffer`: tilføj `/// <reference types="multer" />` eller tjek at `@types/multer` er installeret
- Kør `npm install` igen hvis node_modules ser forældet ud efter pakkeinstallationer
- Tjek altid `git log --oneline -10 /c/Code/overnatihaven/` for at forstå hvad der allerede er gjort i tidligere iterationer
- Undgå at overskrive filer der allerede er rettet — læs dem altid inden du ændrer dem

---

## Escape hatch

Hvis alle tre tasks ikke er fuldført efter 20 iterationer:
- Skriv `/c/Code/overnatihaven/BLOCKED.md` med: hvilke tasks der er fuldført, hvad der blokerer, hvilke kommandoer der fejler og deres output
- Output: `<promise>BLOCKED</promise>`

---

## Completion promise

Kør følgende kommandoer i rækkefølge og bekræft at alle succeeder med det forventede output:

```bash
# Task 1
grep -E "(dit-password|your_password|your-super-secret|din-email)" /c/Code/overnatihaven/.env.example
# Forventer: nul output (exit code 1 fra grep = ingen matches = SUCCESS)

# Task 2
grep -r "diskStorage" /c/Code/overnatihaven/server/
# Forventer: nul output
grep "@vercel/blob" /c/Code/overnatihaven/package.json
# Forventer: matcher en linje
npx tsc -p /c/Code/overnatihaven/tsconfig.server.json --noEmit
# Forventer: exit code 0

# Task 3
grep "dev:full" /c/Code/overnatihaven/package.json
# Forventer: matcher en linje
grep "proxy" /c/Code/overnatihaven/vite.config.ts
# Forventer: matcher en linje
test -f /c/Code/overnatihaven/.env.local.example
# Forventer: exit code 0
grep "localhost:3001" /c/Code/overnatihaven/.env.example
# Forventer: nul output
npx tsc -p /c/Code/overnatihaven/tsconfig.node.json --noEmit
# Forventer: exit code 0
```

Når alle ovenstående kommandoer returnerer det forventede resultat, output præcis følgende tekst — og kun denne:

`<promise>COMPLETE</promise>`
