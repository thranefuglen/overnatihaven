# Dead Code Removal PRD

## Kontekst
Overnatihaven har akkumuleret en masse overflødige filer fra udviklingsprocessen:
- Testfiler i roden: `test-api.html`, `test-gallery-api.html`, `test-schema-parse.cjs`, `test-schema-parse2.cjs`
- En tom database: `data/overnatihaven.db` (0 bytes)
- En mystisk fil ved navn `-p` i roden (sandsynligvis oprettet med `mkdir -p` ved en fejl)
- `server/simple-server.js` (376 linjer standalone server, bruges ikke)
- `server/services/mockService.ts` (197 linjer, importeres ingen steder)
- 18 overlappende markdown-filer i roden, herunder: `ADMIN_GUIDE.md`, `API.md`, `ARCHITECTURE.md`, `BACKEND_COMPLETE.md`, `BACKEND_GALLERY_COMPLETE.md`, `BACKEND_OVERVIEW.md`, `COMMANDS.md`, `COMPONENT_GUIDE.md`, `FRONTEND.md`, `FRONTEND_COMPLETE.md`, `FRONTEND_IMPLEMENTATION.md`, `GALLERY_BACKEND.md`, `IMPLEMENTATION_SUMMARY.md`, `QUICKSTART.md`, `START_HERE.md`, `VERCEL_DEPLOYMENT.md`

## Mål
Slet alle verificeret overflødige filer og konsolider de 18 markdown-filer til maks 4 essentielle dokumenter. Gør projektet nemmere at navigere.

## Krav

### Funktionelle krav
- Slet de 4 testfiler fra roden (`test-api.html`, `test-gallery-api.html`, `test-schema-parse.cjs`, `test-schema-parse2.cjs`)
- Slet `-p`-filen fra roden (verificer at det er en fejl-fil)
- Slet `data/overnatihaven.db` (tom SQLite-fil der ikke bruges i Vercel/Postgres-setup)
- Verificer at `server/simple-server.js` ikke importeres nogen steder, slet den derefter
- Verificer at `server/services/mockService.ts` ikke importeres nogen steder, slet den derefter
- Konsolider de 18 markdown-filer: bevar/opret `README.md`, `ARCHITECTURE.md`, `API.md`, `DEPLOYMENT.md` — slet resten efter at have bevaret unik information

### Tekniske krav
- Ingen filer der aktivt bruges må slettes
- `npm run build` skal fortsat bestå efter alle sletninger
- Git commit efter hvert logisk sæt af sletninger (ikke ét kæmpe commit)

## Iterationsstruktur
1. **Første iteration**: Kør `git log --oneline -5` og `ls` i roden. Verificer hvilke filer der eksisterer. Tjek om `simple-server.js` og `mockService.ts` importeres med `grep -r "simple-server\|mockService" server/ src/`. Skriv `CLEANUP_PLAN.md` med liste over hvad der skal slettes vs. bevares.
2. **Efterfølgende iterationer**: Læs `CLEANUP_PLAN.md`. Udfør næste sletning. Kør `npm run build`. Marker som done i planen.
3. **Markdown-konsolidering**: Læs alle 18 markdown-filer. Identificer unik information. Skriv de 4 konsoliderede filer. Slet de øvrige.
4. **Afslutning**: Alle overflødige filer slettet, build grønt, 4 markdown-filer tilbage → output completion promise.

## Selvkorrektions-instruktioner
- ALDRIG slet en fil uden at verificere den ikke importeres: `grep -r "filnavn" . --include="*.ts" --include="*.tsx" --include="*.js"`
- Kør `npm run build` efter hvert sæt sletninger
- Hvis build fejler efter sletning: restore filen med `git restore`, undersøg hvad der importerede den
- Tjek `git log` for at se hvad der allerede er slettet i tidligere iterationer

## Escape hatch
Hvis du efter 15 iterationer ikke har løst opgaven:
- Skriv `BLOCKED.md` med: hvad der er gjort, hvad der blokerer, forslag til løsning
- Output: `<promise>BLOCKED</promise>`

## Completion promise
Output præcis følgende tekst — og kun denne — når ALLE overflødige filer er slettet, markdown er konsolideret, og `npm run build` er grønt:
`<promise>COMPLETE</promise>`
