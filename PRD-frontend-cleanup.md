# Frontend Cleanup PRD

## Kontekst
Overnatihaven er en React + Vite + Tailwind applikation.
Frontend har tre konkrete problemer:
1. `src/components/Gallery.tsx` linje 46-159: 110+ linjer hardcoded fallback-data (10 billede-objekter) direkte i komponenten
2. `API_BASE_URL` defineres forskelligt i `Hero.tsx` (uden `/api`) og `Gallery.tsx` (med `/api`) — inkonsistens der kan forårsage fejl
3. `src/components/Contact.tsx`: SVG-ikoner (telefon linje 28-35 + 62-68, email linje 42-48 + 80-86) er copy-pasted 2 gange i samme fil
4. `GalleryImage`-interface i `Gallery.tsx` linje 3-13 duplikerer typen der allerede er i `server/types/index.ts`

## Mål
Ryd op i frontend-koden ved at: centralisere API-konfiguration, udtrække genbrugte SVG-ikoner, fjerne hardcoded fallback-data, og dele typer mellem frontend og backend.

## Krav

### Funktionelle krav
- Opret `src/config/api.ts` med én fælles `API_BASE_URL` eksport — opdater alle komponenter til at bruge denne
- Opret `src/components/icons/` med `PhoneIcon.tsx` og `EmailIcon.tsx` — erstat alle inline SVG-duplikater
- Flyt hardcoded galleri-fallback data fra `Gallery.tsx` til `src/data/galleryFallback.ts` som en navngivet konstant
- Opret `src/types/index.ts` der re-eksporterer eller duplikerer de nødvendige server-typer (da frontend ikke kan importere direkte fra `server/`)
- Fjern `GalleryImage`-interface fra `Gallery.tsx` og brug typen fra `src/types/index.ts`

### Tekniske krav
- React + TypeScript — ingen nye dependencies
- Alle eksisterende funktionaliteter bevares (intet må gå i stykker)
- `npm run build` skal bestå
- Dark mode klasser bevares konsistent

## Iterationsstruktur
1. **Første iteration**: Læs `src/components/Gallery.tsx`, `Hero.tsx`, `Contact.tsx`. Kør `git log --oneline -5`. Lav `REFACTOR_PLAN.md` med rækkefølge for ændringer.
2. **Efterfølgende iterationer**: Læs `REFACTOR_PLAN.md`, udfør næste punkt, kør `npm run build`, marker punktet som done i planen.
3. **Validering**: `npm run build` skal være grønt efter hvert trin.
4. **Afslutning**: Alle 5 krav opfyldt + build grønt → output completion promise.

## Selvkorrektions-instruktioner
- Kør `npm run build` efter HVERT trin — fang TypeScript-fejl tidligt
- Hvis en komponent fejler efter refactoring: sammenlign med git diff, find den manglende import
- Tjek altid at dark mode klasser (`dark:bg-gray-800` etc.) er bevaret når du redigerer komponenter
- Verificer at `API_BASE_URL` peger på korrekt endpoint inden du opdaterer alle komponenter

## Escape hatch
Hvis du efter 12 iterationer ikke har løst opgaven:
- Skriv `BLOCKED.md` med: hvad der er gjort, hvad der blokerer, forslag til løsning
- Output: `<promise>BLOCKED</promise>`

## Completion promise
Output præcis følgende tekst — og kun denne — når ALLE 5 krav er implementeret og `npm run build` er grønt:
`<promise>COMPLETE</promise>`
