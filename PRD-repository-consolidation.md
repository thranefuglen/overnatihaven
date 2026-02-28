# Repository Consolidation PRD

## Kontekst
Overnatihaven er en React + Express/Vercel serverless applikation med Postgres.
Projektet har et datalaget der eksisterer i tredobbelte kopier per entitet:
- `server/repositories/contactRepository.ts` + `contactRepository.sqlite.ts` + `contactRepository.postgres.ts`
- `server/repositories/galleryRepository.ts` + `galleryRepository.sqlite.ts` + `galleryRepository.postgres.ts`
- `server/repositories/inquiryRepository.ts` + `inquiryRepository.sqlite.ts` + `inquiryRepository.postgres.ts`
- `server/services/authService.ts` + `authService.sqlite.ts` + `authService.postgres.ts`

Mange af disse filer er byte-for-byte identiske. Det udgør ~1.400 linjer duplikeret kode.
Projektet kører på Vercel med Postgres (ikke SQLite) i produktion.

## Mål
Konsolider det tredobbelte datalags til én kopi per entitet ved hjælp af TypeScript interfaces og en factory-funktion. Slet alle overflødige duplikater.

## Krav

### Funktionelle krav
- Ét TypeScript interface per entitet (`IContactRepository`, `IGalleryRepository`, `IInquiryRepository`)
- Én aktiv implementation per entitet (Postgres, da projektet kører på Vercel)
- En factory-funktion eller direkte export der returnerer den korrekte implementation
- Alle eksisterende routes/controllers skal fortsat fungere uden ændringer
- `.sqlite.ts`-filerne slettes (de er identiske med default-filerne)
- `authService.sqlite.ts` og den overflødige `authService.postgres.ts` (hvis identisk med `authService.ts`) slettes

### Tekniske krav
- TypeScript — bevar eksisterende typer og interfaces
- Ingen ændringer i `server/api/` eller `server/routes/`
- Imports i controllers opdateres hvis nødvendigt
- `npm run build` skal bestå efter refactoring

## Iterationsstruktur
1. **Første iteration**: Kør `git log --oneline -5` og læs de relevante filer. Sammenlign `.ts`- og `.sqlite.ts`-filerne linje for linje. Lav en plan: hvilke filer er identiske, hvilke har forskelle? Skriv planen til `REFACTOR_PLAN.md`.
2. **Efterfølgende iterationer**: Læs `REFACTOR_PLAN.md`. Udfør næste trin i planen. Opdater `REFACTOR_PLAN.md` med hvad der er gjort.
3. **Validering**: Kør `npm run build` efter hver ændring. Ret TypeScript-fejl før næste trin.
4. **Afslutning**: Når alle dubletter er slettet og buildet er grønt, output completion promise.

## Selvkorrektions-instruktioner
- Kør altid `npm run build` efter ændringer
- Hvis buildet fejler: læs fejlbeskeden, find den fil der importerer den slettede fil, opdater import-stien
- Tjek altid `git log` for at se hvad der allerede er gjort i tidligere iterationer
- Slet IKKE filer der ikke er duplikater — verificer altid ved diff først
- Hvis du er i tvivl om en fil bruges: kør `grep -r "filnavn" server/` inden sletning

## Escape hatch
Hvis du efter 15 iterationer ikke har løst opgaven:
- Skriv `BLOCKED.md` med: hvad der er gjort, hvad der blokerer, forslag til løsning
- Output: `<promise>BLOCKED</promise>`

## Completion promise
Output præcis følgende tekst — og kun denne — når ALLE dubletter er slettet og `npm run build` er grønt:
`<promise>COMPLETE</promise>`
