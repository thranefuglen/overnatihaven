# PRD: GitHub OAuth Login til Adminpanel

## Problem Statement

Adminpanelet kræver i dag brugernavn og password for at logge ind. Ejeren af overnatihaven.dk ønsker at kunne logge ind med sin GitHub-konto som et alternativ, da det er hurtigere og ikke kræver at man husker endnu et password.

## Solution

Tilføj GitHub OAuth 2.0 som alternativ login-metode i adminpanelet. Efter vellykket GitHub-login udstedes et JWT-token på samme måde som ved det eksisterende brugernavn/password-login. Kun pre-godkendte GitHub-brugernavne (hvidliste i koden) får adgang.

## User Stories

1. Som administrator vil jeg se en "Log ind med GitHub"-knap på login-siden, så jeg hurtigt kan logge ind uden at taste password.
2. Som administrator vil jeg blive sendt til GitHub for at godkende adgang, så jeg kan logge ind med min eksisterende GitHub-konto.
3. Som administrator vil jeg efter GitHub-godkendelse automatisk blive sendt tilbage til adminpanelet, så login-oplevelsen er smidig.
4. Som administrator vil jeg forblive logget ind på samme måde som ved password-login (JWT i localStorage), så oplevelsen er konsistent.
5. Som administrator vil jeg stadig kunne logge ind med brugernavn og password, så det eksisterende login ikke forsvinder.
6. Som uautoriseret GitHub-bruger vil jeg få en fejlbesked hvis min konto ikke er på hvidlisten, så uønskede personer ikke kan få adgang.
7. Som administrator vil jeg kunne logge ud på samme måde uanset hvilken login-metode jeg brugte, så logout-flowet er konsistent.

## Implementation Decisions

### Moduler der bygges/ændres

**Ny backend service: GitHub OAuth Service**
- Ansvar: Bygge GitHub authorization URL, bytte OAuth code for access token, hente GitHub-brugerinfo, validere bruger mod hvidliste
- Hvidliste: Hardcoded array af tilladte GitHub-brugernavne (`['thranefuglen']`)
- Enkel interface med 4 funktioner: `getAuthorizationUrl()`, `exchangeCodeForToken(code)`, `getGitHubUser(accessToken)`, `isAllowedUser(username)`

**Eksisterende auth routes (udvides)**
- `GET /api/auth/github` — redirect til GitHubs OAuth authorization URL
- `GET /api/auth/github/callback` — modtag OAuth code, valider bruger, udsted JWT, redirect til frontend

**Eksisterende Login-komponent (ændres)**
- Tilføj "Log ind med GitHub" knap under det eksisterende brugernavn/password-form
- Knappen navigerer til `/api/auth/github`

**Eksisterende Auth Context (ændres)**
- Håndter JWT-token leveret som URL-parameter efter OAuth-redirect
- Gem token i localStorage og ryd URL'en

### Arkitektoniske beslutninger

- **OAuth flow:** Authorization Code Flow (standard) uden PKCE — serverside secret håndterer sikkerheden
- **Token-strategi:** Eksisterende JWT-mekanisme genbruges — GitHub OAuth genererer et JWT på samme måde som password-login
- **Credentials:** `GITHUB_CLIENT_ID` og `GITHUB_CLIENT_SECRET` gemmes som miljøvariabler i `.env` og Vercel dashboard
- **Token-levering til frontend:** Backend redirecter til `/admin/login?token=<jwt>` efter succesfuld OAuth — frontend læser token fra URL og gemmer i localStorage
- **State-parameter:** Brug et tilfældigt `state`-parameter i OAuth-flowet for at forhindre CSRF-angreb
- **Ingen databaseændringer:** GitHub-brugere behøver ikke en række i `admin_users` — JWT udstedes direkte fra hvidliste-tjek
- **Callback URL (prod):** `https://overnatihaven.vercel.app/api/auth/github/callback`

### API-kontrakt

```
GET /api/auth/github
  → 302 redirect til https://github.com/login/oauth/authorize?...

GET /api/auth/github/callback?code=<code>&state=<state>
  → Ved succes: 302 redirect til /admin/login?token=<jwt>
  → Ved fejl (ikke på hvidliste): 302 redirect til /admin/login?error=unauthorized
  → Ved fejl (OAuth-fejl): 302 redirect til /admin/login?error=oauth_failed
```

## Testing Decisions

Ingen automatiserede tests implementeres for denne feature.

**Begrundelse:** GitHub OAuth-flowet kræver en ekstern OAuth-callback der kun virker med den registrerede callback-URL (`overnatihaven.vercel.app`). Preview-deployments har dynamiske URLs og kan ikke modtage GitHub OAuth-callbacks. Flowet testes manuelt direkte i produktion efter merge.

**Manuel test-tjekliste:**
- GitHub-knap vises på login-siden
- Klik sender til GitHub OAuth
- Godkendelse returnerer til adminpanelet som logget ind
- Ikke-godkendt GitHub-konto giver fejlbesked
- Eksisterende brugernavn/password-login virker stadig
- Logout virker

## Out of Scope

- Google OAuth eller andre OAuth-udbydere
- Dynamisk administration af hvidlisten (tilføj/fjern brugere via UI)
- Separate OAuth apps til lokal udvikling og preview-miljøer
- Automatiserede tests af OAuth-flowet
- Refresh tokens eller session-rotation
- "Husk mig"-funktionalitet

## Further Notes

- **GitHub OAuth App credentials:**
  - Client ID: `Ov23liBDZt6uxgP9fXP6`
  - Client Secret: gemmes i `.env` som `GITHUB_CLIENT_SECRET` og i Vercel dashboard
- **Tilladte GitHub-brugernavne ved launch:** `thranefuglen`
- For at tilføje flere brugere i fremtiden: tilføj GitHub-brugernavn til hvidlisten i `githubOAuthService`
- Eftersom callback-URL kun er registreret til prod-domænet, skal OAuth testes direkte i produktion efter merge til `main`
