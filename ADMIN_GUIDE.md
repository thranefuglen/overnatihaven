# Admin Panel - Brugervejledning

## Adgang til Admin Panel

Admin panelet kan tilgås via:
- URL: `http://localhost:5173/admin/login` (udvikling)
- URL: `https://dit-domæne.dk/admin/login` (produktion)

## Login

Brug standard admin credentials:
- Brugernavn: `admin`
- Password: `admin123`

*(Disse kan ændres i databasen efter første login)*

## Funktioner

### 1. Galleri Administration (`/admin/gallery`)

**Tilføj billede:**
- Klik på "Tilføj billede" knappen
- Upload en billedfil (max 5MB) eller indtast en URL
- Udfyld titel (påkrævet) og beskrivelse (valgfrit)
- Billedet vil automatisk blive tilføjet til galleriet

**Rediger billede:**
- Klik på rediger-ikonet (blyant) ved et billede
- Opdater titel, beskrivelse, URL eller aktiv status
- Gem ændringer

**Sorter billeder:**
- Træk og slip billeder for at ændre rækkefølge
- Ændringer gemmes automatisk

**Aktiver/Deaktiver:**
- Klik på øje-ikonet for at skjule/vise et billede på hjemmesiden
- Inaktive billeder vises stadig i admin men ikke for besøgende

**Slet billede:**
- Klik på slet-ikonet (skraldespand)
- Bekræft sletning i dialogboksen

### 2. Forespørgsler (`/admin/inquiries`)

**Oversigt:**
- Se alle booking forespørgsler
- Status vises med farvekoder:
  - 🟡 Gul: Afventer svar
  - 🟢 Grøn: Bekræftet
  - 🔴 Rød: Afvist
  - 🔵 Blå: Gennemført

**Opdater status:**
- Brug dropdown menuen til at ændre status
- Ændringer gemmes automatisk

### 3. Kontaktbeskeder (`/admin/contacts`)

**Oversigt:**
- Se alle beskeder fra kontaktformularen
- Nye beskeder er markeret med "Ny" badge

**Markér som læst:**
- Klik på grønt flueben for at markere som læst
- Beskeden fjernes fra "Ny" listen

**Slet besked:**
- Klik på slet-ikonet for at fjerne beskeden permanent

## Navigation

- **Sidebar:** Brug menuen til venstre til at navigere mellem sektioner
- **Log ud:** Klik på "Log ud" knappen nederst i sidebar
- **Tilbage til hjemmeside:** Brug linket i topbjælken

## Sikkerhed

- Admin panelet er beskyttet med JWT tokens
- Tokens gemmes i localStorage og udløber efter 24 timer
- Alle API kald kræver gyldig token
- Automatisk redirect til login hvis token udløber

## API Integration

Admin panelet kommunikerer med backend API'en:
- Base URL: `http://localhost:3001/api` (udvikling)
- Alle requests inkluderer `Authorization: Bearer <token>` header
- Fejlhåndtering med brugervenlige beskeder

## Responsive Design

Admin panelet er fuldt responsive og virker på:
- Desktop (optimeret til 1024px+)
- Tablet (768px-1023px)
- Mobil (under 768px)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Fejlfinding

**Login virker ikke:**
- Tjek at backend kører på port 3001
- Verificer database forbindelse
- Tjek admin credentials i databasen

**Billeder vises ikke:**
- Tjek at upload mappen eksisterer og er skrivbar
- Verificer filstier i databasen
- Tjek CORS indstillinger

**API fejl:**
- Åbn browser konsol (F12)
- Tjek network fanen for failed requests
- Verificer at backend server kører