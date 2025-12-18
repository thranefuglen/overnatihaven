# Frontend Dokumentation - Elins Overnatningshave

## 🎨 Oversigt

Frontenden er bygget som en moderne single-page application (SPA) med React, TypeScript og Tailwind CSS. Designet er responsivt, tilgængeligt og optimeret for performance.

## 🏗️ Arkitektur

### Teknologier
- **React 19**: Moderne UI framework med hooks
- **TypeScript**: Type-sikkerhed og bedre developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Ultrafast build tool og dev server

### Komponent Hierarki
```
App
├── Header (navigation)
├── Hero (hero sektion)
├── About (om haven)
├── Facilities (faciliteter)
├── Gallery (billeder)
├── Pricing (priser)
├── Contact (kontakt formular)
└── Footer (footer)
```

## 📁 Filstruktur

```
src/
├── components/          # Alle React komponenter
│   ├── Header.tsx      # Navigation med smooth scroll
│   ├── Hero.tsx        # Hero med baggrund og CTA
│   ├── About.tsx       # Om-sektion
│   ├── Facilities.tsx  # Faciliteter grid
│   ├── Gallery.tsx     # Galleri med lightbox
│   ├── Pricing.tsx     # Priskort
│   ├── Contact.tsx     # Kontaktformular
│   └── Footer.tsx      # Footer
├── App.tsx             # Main app component
├── main.tsx            # React entry point
├── index.css           # Global styles + Tailwind
└── vite-env.d.ts       # Vite type definitions
```

## 🎯 Komponenter i Detaljer

### Header
- **Sticky navigation**: Bliver ved toppen når man scroller
- **Smooth scroll**: Animeret scroll til sektioner
- **Mobile menu**: Hamburger menu på mobil
- **Active state**: Viser hvilken sektion man er på

**Props:**
- `currentSection: string` - Nuværende aktive sektion
- `setCurrentSection: (section: string) => void` - Opdater aktiv sektion

### Hero
- **Fullscreen hero**: Fylder hele skærmen
- **Background image**: Med overlay for bedre læsbarhed
- **CTA buttons**: Primær og sekundær call-to-action
- **Feature highlights**: 3 hovedfunktioner
- **Scroll indicator**: Animeret pil til at scrolle ned

### About
- **Two-column layout**: Tekst til venstre, billede til højre
- **Responsive**: Stacker på mobil
- **Key features**: Checkmark liste med fordele
- **Decorative elements**: Subtile designelementer

### Facilities
- **Grid layout**: 4 kolonner på desktop, responsive
- **Icon cards**: Hver facilitet har ikon og beskrivelse
- **Hover effects**: Subtle scale og shadow effekter
- **Additional info**: Praktiske oplysninger og husregler

### Gallery
- **Responsive grid**: 3 kolonner på desktop, 2 på tablet, 1 på mobil
- **Image optimization**: Lazy loading af billeder
- **Lightbox**: Fuld-skærm visning med navigation
- **Keyboard support**: Arrow keys og Escape
- **Smooth animations**: Fade og scale transitions

**Lightbox features:**
- Click udenfor for at lukke
- Previous/Next buttons
- Keyboard navigation (arrows, Escape)
- Image counter (1/6)

### Pricing
- **Three tiers**: Enkelt, 2-3 nætter, ugentlig
- **Popular highlight**: Markerer det mest populære valg
- **Feature lists**: Checkmark lister med inkluderede features
- **Additional info**: Ekstra information om betaling, afbestilling etc.

### Contact
- **Two-column layout**: Formular til venstre, info til højre
- **Real-time validation**: Viser fejl med det samme
- **Success/error states**: Visual feedback på submit
- **Loading state**: Spinner når formularen sendes
- **Contact info**: Telefon, email, adresse
- **Map placeholder**: Klar til Google Maps integration

**Form fields:**
- Navn (required)
- Email (required, validated)
- Telefon (required)
- Ankomstdato (required)
- Afrejsedato (required)
- Antal personer (required, 1-9+)
- Besked (optional)

**Validation:**
- Email format check
- Date validation (afrejse efter ankomst)
- Required fields
- Min/max values

### Footer
- **Four columns**: About, Quick Links, Contact, Opening Hours
- **Social media**: Facebook, Instagram, Email icons
- **Navigation**: Links til alle sektioner
- **Copyright**: Dynamisk år

## 🎨 Design System

### Farver
```css
Primary Green:
- 50:  #f0fdf4
- 100: #dcfce7
- 200: #bbf7d0
- 300: #86efac
- 400: #4ade80
- 500: #22c55e (main)
- 600: #16a34a
- 700: #15803d
- 800: #166534
- 900: #14532d

Grays:
- 50:  #f9fafb
- 100: #f3f4f6
- ...
- 900: #111827
```

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Bold, 2.5rem - 5rem
- **Body**: Regular, 1rem - 1.25rem
- **Line height**: 1.5 - 1.75

### Spacing
- **Section padding**: 4rem - 6rem (responsive)
- **Container max-width**: 1280px
- **Grid gaps**: 1rem - 2rem

### Breakpoints
```css
sm:  640px   /* Tablet portrait */
md:  768px   /* Tablet landscape */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

## 🔧 Utility Classes

### Custom Classes (index.css)
```css
.btn-primary        /* Primary button styling */
.btn-secondary      /* Secondary button styling */
.section-container  /* Section wrapper med padding */
.card               /* Card component base */
```

## ♿ Tilgængelighed

### Implementerede features:
- ✅ Semantisk HTML (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- ✅ ARIA labels på interaktive elementer
- ✅ Keyboard navigation (Tab, Enter, Arrow keys, Escape)
- ✅ Focus indicators (synlige outlines)
- ✅ Alt text på alle billeder
- ✅ Color contrast > 4.5:1 (WCAG AA)
- ✅ Form labels og error messages
- ✅ Skip to content (kan tilføjes)

### Testing:
```bash
# Chrome DevTools Lighthouse
# Firefox Accessibility Inspector
# axe DevTools browser extension
```

## 🚀 Performance

### Optimizations:
- ✅ Code splitting (React.lazy kan tilføjes for større apps)
- ✅ Image lazy loading
- ✅ Minified CSS og JS i production
- ✅ Tree shaking (automatisk med Vite)
- ✅ Gzip compression (server-side)

### Metrics targets:
- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.8s
- **Cumulative Layout Shift**: < 0.1
- **Largest Contentful Paint**: < 2.5s

## 🧪 Testing

### Unit tests (kan implementeres):
```typescript
// Contact.test.tsx
describe('Contact Form', () => {
  test('validates email format', () => {
    // ...
  })
  
  test('shows error on invalid date range', () => {
    // ...
  })
})
```

### Integration tests (kan implementeres):
```typescript
// App.test.tsx
describe('Navigation', () => {
  test('scrolls to section on nav click', () => {
    // ...
  })
})
```

## 🔄 State Management

Nuværende implementation bruger kun lokalt state:
- `useState` for formular data
- `useState` for UI states (mobile menu, lightbox)

For større apps kan tilføjes:
- **Context API**: Global state (theme, user)
- **Zustand/Redux**: Kompleks state management
- **React Query**: Server state og caching

## 🌐 Integration med Backend

Contact formularen er klar til backend integration:

```typescript
// I Contact.tsx - opdater handleSubmit:
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) return
  
  setIsSubmitting(true)
  
  try {
    const response = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        arrivalDate: formData.arrivalDate,
        departureDate: formData.departureDate,
        numPeople: parseInt(formData.guests),
        message: formData.message,
      }),
    })
    
    if (!response.ok) throw new Error('Failed to submit')
    
    setSubmitStatus('success')
    // Reset form...
  } catch (error) {
    setSubmitStatus('error')
  } finally {
    setIsSubmitting(false)
  }
}
```

## 📦 Build og Deploy

### Development
```bash
npm run dev  # Start dev server på http://localhost:5173
```

### Production Build
```bash
npm run build  # Builds til /dist mappen
```

Output:
```
dist/
├── assets/
│   ├── index-[hash].js    # Bundled JS
│   ├── index-[hash].css   # Bundled CSS
│   └── ...
└── index.html             # Entry point
```

### Preview Production Build
```bash
npm run preview  # Serve production build lokalt
```

### Deploy
Kan deployes til:
- **Netlify**: Drag & drop /dist folder
- **Vercel**: Connect git repo
- **GitHub Pages**: Via GitHub Actions
- **Cloudflare Pages**: Connect git repo
- **Custom server**: Upload /dist til server

## 🔧 Maintenance

### Tilføj ny sektion:
1. Opret komponent i `src/components/NewSection.tsx`
2. Tilføj til `App.tsx`: `<NewSection />`
3. Tilføj til navigation i `Header.tsx`
4. Tilføj til footer links hvis relevant

### Opdater billeder:
1. Erstat Unsplash URLs i komponenter med egne billeder
2. Tilføj billeder til `/public/images/`
3. Opdater `src` i komponenterne
4. Husk alt text for tilgængelighed

### Opdater farver:
1. Rediger `tailwind.config.js` under `theme.extend.colors`
2. Genstart dev server
3. Test kontrast for tilgængelighed

### Tilføj ny facilitet:
1. Åbn `Facilities.tsx`
2. Tilføj nyt objekt til `facilities` array
3. Tilføj SVG ikon (fra heroicons eller custom)

## 📚 Ressourcer

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Web Accessibility (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Heroicons (Icons)](https://heroicons.com)

## 🤝 Bidrag

Når du arbejder på frontenden:
1. Følg eksisterende kode stil
2. Brug TypeScript types
3. Test på mobil og desktop
4. Check tilgængelighed
5. Optimér billeder
6. Kommentér kompleks logik

---

**Udviklet med ❤️ til Elins Overnatningshave**
