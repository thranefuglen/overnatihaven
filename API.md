# API Dokumentation

## Base URL
```
Development: http://localhost:3000/api
Production: [Din production URL]/api
```

## Response Format

Alle responses følger dette format:

### Success Response
```json
{
  "success": true,
  "message": "Valgfri besked",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Fejlbesked",
  "errors": [ ... ]  // Kun ved valideringsfejl
}
```

## Endpoints

### 🏥 Health Check

Tjek om API'en kører.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

### 📅 Booking Forespørgsler

#### Opret Booking Forespørgsel

Opret en ny booking forespørgsel. Der sendes automatisk email notifikationer til både ejer og gæst (hvis konfigureret).

**Endpoint:** `POST /inquiries`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+45 12345678",
  "arrivalDate": "2025-07-01",
  "departureDate": "2025-07-03",
  "numPeople": 2,
  "message": "Valgfri besked"
}
```

**Validering:**
- `name`: Minimum 2 tegn, maximum 100 tegn (påkrævet)
- `email`: Gyldig email adresse (påkrævet)
- `phone`: Valgfri
- `arrivalDate`: Skal være i dag eller senere (påkrævet)
- `departureDate`: Skal være efter ankomstdato (påkrævet)
- `numPeople`: 1-10 personer (påkrævet)
- `message`: Maximum 1000 tegn (valgfri)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Din forespørgsel er modtaget. Vi vender tilbage til dig hurtigst muligt.",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+45 12345678",
    "arrival_date": "2025-07-01",
    "departure_date": "2025-07-03",
    "num_people": 2,
    "message": "Valgfri besked",
    "status": "pending",
    "created_at": "2025-01-01T12:00:00Z",
    "updated_at": "2025-01-01T12:00:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Der er allerede en booking i denne periode"
}
```

---

#### Tjek Tilgængelighed

Tjek om en periode er tilgængelig for booking.

**Endpoint:** `GET /inquiries/availability`

**Query Parameters:**
- `arrivalDate`: Ankomstdato (YYYY-MM-DD) (påkrævet)
- `departureDate`: Afrejsedato (YYYY-MM-DD) (påkrævet)

**Eksempel:**
```
GET /inquiries/availability?arrivalDate=2025-07-01&departureDate=2025-07-03
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "available": true,
    "message": "Perioden er tilgængelig"
  }
}
```

eller hvis ikke tilgængelig:

```json
{
  "success": true,
  "data": {
    "available": false,
    "message": "Der er allerede en booking i denne periode"
  }
}
```

---

#### Hent Alle Forespørgsler (Admin)

Hent liste over alle booking forespørgsler.

**Endpoint:** `GET /inquiries`

**Query Parameters:**
- `status`: Filtrer på status (pending/confirmed/declined/completed) (valgfri)
- `limit`: Maksimum antal resultater (valgfri)

**Eksempel:**
```
GET /inquiries?status=pending&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+45 12345678",
      "arrival_date": "2025-07-01",
      "departure_date": "2025-07-03",
      "num_people": 2,
      "message": "Besked",
      "status": "pending",
      "created_at": "2025-01-01T12:00:00Z",
      "updated_at": "2025-01-01T12:00:00Z"
    }
  ],
  "count": 1
}
```

---

#### Hent Specifik Forespørgsel (Admin)

Hent detaljer om en specifik booking forespørgsel.

**Endpoint:** `GET /inquiries/:id`

**Eksempel:**
```
GET /inquiries/1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+45 12345678",
    "arrival_date": "2025-07-01",
    "departure_date": "2025-07-03",
    "num_people": 2,
    "message": "Besked",
    "status": "pending",
    "created_at": "2025-01-01T12:00:00Z",
    "updated_at": "2025-01-01T12:00:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Forespørgsel ikke fundet"
}
```

---

### 📧 Kontakt Beskeder

#### Opret Kontakt Besked

Send en generel kontaktbesked.

**Endpoint:** `POST /contacts`

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Spørgsmål om faciliteter",
  "message": "Jeg vil gerne vide mere om de tilgængelige faciliteter."
}
```

**Validering:**
- `name`: Minimum 2 tegn, maximum 100 tegn (påkrævet)
- `email`: Gyldig email adresse (påkrævet)
- `subject`: Maximum 200 tegn (valgfri)
- `message`: Minimum 10 tegn, maximum 2000 tegn (påkrævet)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Tak for din besked. Vi vender tilbage til dig hurtigst muligt.",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Spørgsmål om faciliteter",
    "message": "Jeg vil gerne vide mere om...",
    "is_read": 0,
    "created_at": "2025-01-01T12:00:00Z"
  }
}
```

---

#### Hent Alle Kontakt Beskeder (Admin)

Hent liste over alle kontakt beskeder.

**Endpoint:** `GET /contacts`

**Query Parameters:**
- `isRead`: Filtrer på læst status (true/false) (valgfri)
- `limit`: Maksimum antal resultater (valgfri)

**Eksempel:**
```
GET /contacts?isRead=false&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "subject": "Spørgsmål om faciliteter",
      "message": "Jeg vil gerne vide mere om...",
      "is_read": 0,
      "created_at": "2025-01-01T12:00:00Z"
    }
  ],
  "count": 1
}
```

---

#### Hent Specifik Kontakt Besked (Admin)

Hent detaljer om en specifik kontakt besked.

**Endpoint:** `GET /contacts/:id`

**Eksempel:**
```
GET /contacts/1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Spørgsmål om faciliteter",
    "message": "Jeg vil gerne vide mere om...",
    "is_read": 0,
    "created_at": "2025-01-01T12:00:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Besked ikke fundet"
}
```

---

## Rate Limiting

API'en har rate limiting på 10 requests per 15 minutter per IP adresse.

Hvis grænsen overskrides:

**Response (429):**
```json
{
  "success": false,
  "message": "For mange forespørgsler. Prøv venligst igen senere."
}
```

---

## Fejlkoder

| Status Code | Beskrivelse |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input or validation error |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## Eksempler på Frontend Integration

### JavaScript/Fetch

```javascript
// Opret booking forespørgsel
async function createInquiry(data) {
  try {
    const response = await fetch('http://localhost:3000/api/inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.data;
  } catch (error) {
    console.error('Error creating inquiry:', error);
    throw error;
  }
}

// Tjek tilgængelighed
async function checkAvailability(arrivalDate, departureDate) {
  try {
    const url = new URL('http://localhost:3000/api/inquiries/availability');
    url.searchParams.append('arrivalDate', arrivalDate);
    url.searchParams.append('departureDate', departureDate);
    
    const response = await fetch(url);
    const result = await response.json();
    
    return result.data.available;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
}
```

### React Hook Eksempel

```javascript
import { useState } from 'react';

function useInquiry() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createInquiry = async (data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createInquiry, loading, error };
}
```

---

## Testing med cURL

### Tjek health
```bash
curl http://localhost:3000/api/health
```

### Opret booking
```bash
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+45 12345678",
    "arrivalDate": "2025-07-01",
    "departureDate": "2025-07-03",
    "numPeople": 2,
    "message": "Glæder mig!"
  }'
```

### Tjek tilgængelighed
```bash
curl "http://localhost:3000/api/inquiries/availability?arrivalDate=2025-07-01&departureDate=2025-07-03"
```

### Opret kontakt
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "subject": "Spørgsmål",
    "message": "Jeg har et spørgsmål om jeres faciliteter."
  }'
```
