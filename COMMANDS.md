# Kommando Reference

Quick reference til alle npm scripts og kommandoer i projektet.

## 📦 Installation

```bash
# Install alle dependencies
npm install

# Eller med yarn
yarn install
```

## 🚀 Development

```bash
# Start backend i development mode (hot reload)
npm run dev:backend

# Start frontend i development mode
npm run dev

# Start både frontend og backend (i separate terminals)
npm run dev              # Terminal 1 - Frontend
npm run dev:backend      # Terminal 2 - Backend
```

## 🏗️ Build

```bash
# Build kun backend
npm run build:backend

# Build kun frontend
npm run build

# Build alt (både frontend og backend)
npm run build:backend && npm run build
```

## 🎯 Production

```bash
# Start backend i production mode
npm run start:backend

# Preview frontend build
npm run preview
```

## 🗄️ Database

```bash
# Kør database migrationer
npm run db:migrate

# Manuel database adgang (hvis du har sqlite3 installeret)
sqlite3 data/overnatihaven.db

# Backup database
# Windows
copy data\overnatihaven.db backups\overnatihaven-%date:~-4,4%%date:~-7,2%%date:~-10,2%.db

# Mac/Linux
cp data/overnatihaven.db backups/overnatihaven-$(date +%Y%m%d).db
```

## 🧪 Testing

```bash
# Kør alle tests
npm test

# Kør tests i watch mode
npm test -- --watch

# Kør tests med coverage
npm test -- --coverage

# Kør specifik test fil
npm test -- inquiryService.test.ts

# Kør tests og generer rapport
npm test -- --coverage --verbose
```

## 🔍 Code Quality

```bash
# Lint hele projektet
npm run lint

# Lint og fix automatisk
npm run lint -- --fix

# TypeScript type check
npx tsc --noEmit
```

## 📝 Logs

```bash
# Se seneste logs (Windows)
type logs\combined.log
type logs\error.log

# Se seneste logs (Mac/Linux)
tail -f logs/combined.log
tail -f logs/error.log

# Søg i logs (Windows PowerShell)
Select-String -Path logs\combined.log -Pattern "error"

# Søg i logs (Mac/Linux)
grep "error" logs/combined.log
```

## 🔧 Development Tools

```bash
# Watch TypeScript compilation
npx tsc --watch -p tsconfig.server.json

# Start med debug mode
node --inspect dist/server/index.js

# Check port usage (Windows)
netstat -ano | findstr :3000

# Check port usage (Mac/Linux)
lsof -i :3000

# Kill process on port (Windows)
# Find PID med netstat, derefter:
taskkill /PID <PID> /F

# Kill process on port (Mac/Linux)
kill -9 $(lsof -t -i:3000)
```

## 🧹 Cleanup

```bash
# Slet node_modules
# Windows
rmdir /s /q node_modules

# Mac/Linux
rm -rf node_modules

# Slet build output
# Windows
rmdir /s /q dist

# Mac/Linux
rm -rf dist

# Slet database og logs (reset alt)
# Windows
rmdir /s /q data logs
npm run db:migrate

# Mac/Linux
rm -rf data logs
npm run db:migrate

# Clean install (start forfra)
# Windows
rmdir /s /q node_modules
del package-lock.json
npm install

# Mac/Linux
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoring

```bash
# Tjek server status
curl http://localhost:3000/api/health

# Tjek med pretty print (Windows PowerShell)
(Invoke-WebRequest http://localhost:3000/api/health).Content | ConvertFrom-Json | ConvertTo-Json

# Tjek med pretty print (Mac/Linux)
curl http://localhost:3000/api/health | jq

# Monitor logs real-time (Mac/Linux)
tail -f logs/combined.log

# Monitor logs real-time (Windows PowerShell)
Get-Content logs\combined.log -Wait -Tail 50
```

## 🔐 Security

```bash
# Tjek for vulnerable dependencies
npm audit

# Fix vulnerable dependencies
npm audit fix

# Tjek for outdated dependencies
npm outdated

# Update dependencies
npm update

# Update specific dependency
npm update <package-name>
```

## 📦 Dependencies

```bash
# Installer ny dependency
npm install <package-name>

# Installer ny dev dependency
npm install -D <package-name>

# Fjern dependency
npm uninstall <package-name>

# Liste installerede pakker
npm list --depth=0

# Tjek package info
npm info <package-name>
```

## 🐛 Debugging

```bash
# Start med verbose logging
DEBUG=* npm run dev:backend

# Start med Node inspector
node --inspect-brk dist/server/index.js

# Start med specific debug namespace
DEBUG=express:* npm run dev:backend

# Check environment variables (Windows)
echo %PORT%
echo %NODE_ENV%

# Check environment variables (Mac/Linux)
echo $PORT
echo $NODE_ENV

# Print all env variables (Windows)
set

# Print all env variables (Mac/Linux)
printenv
```

## 🚢 Deployment

```bash
# Build for production
NODE_ENV=production npm run build:backend

# Start with PM2 (hvis installeret)
pm2 start dist/server/index.js --name overnatihaven

# Stop PM2
pm2 stop overnatihaven

# Restart PM2
pm2 restart overnatihaven

# View PM2 logs
pm2 logs overnatihaven

# PM2 status
pm2 status
```

## 🧪 API Testing

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test booking creation (Windows PowerShell)
$body = @{
    name = "Test User"
    email = "test@example.com"
    arrivalDate = "2025-07-01"
    departureDate = "2025-07-03"
    numPeople = 2
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:3000/api/inquiries -Method POST -Body $body -ContentType "application/json"

# Test booking creation (Mac/Linux)
curl -X POST http://localhost:3000/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "arrivalDate": "2025-07-01",
    "departureDate": "2025-07-03",
    "numPeople": 2
  }'

# Check availability
curl "http://localhost:3000/api/inquiries/availability?arrivalDate=2025-07-01&departureDate=2025-07-03"

# Create contact
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "message": "Test besked"
  }'
```

## 📱 Quick Commands (Mest Brugte)

```bash
# Start alt (development)
npm install                    # Første gang
npm run db:migrate            # Første gang
npm run dev:backend           # Start backend

# Check at det virker
curl http://localhost:3000/api/health

# Se logs
# Windows: type logs\combined.log
# Mac/Linux: tail -f logs/combined.log

# Stop server
# Ctrl+C i terminalen
```

## 🆘 Troubleshooting Commands

```bash
# Kan ikke starte server (port optaget)
# Find proces:
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000

# Database locked error
# Stop serveren og slet .db-journal fil:
# Windows: del data\overnatihaven.db-journal
# Mac/Linux: rm data/overnatihaven.db-journal

# TypeScript errors
npx tsc --noEmit    # Check for type errors

# Dependencies problemer
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation Commands

```bash
# Generate TypeScript docs (hvis typedoc er installeret)
npx typedoc --out docs src

# Åbn dokumentation
# Windows: start QUICKSTART.md
# Mac: open QUICKSTART.md
# Linux: xdg-open QUICKSTART.md
```

## 💡 Tips

### Alias for hurtigere udvikling

**Windows PowerShell** (`$PROFILE`):
```powershell
function Start-Backend { npm run dev:backend }
Set-Alias -Name backend -Value Start-Backend

function Test-Api { curl http://localhost:3000/api/health }
Set-Alias -Name apitest -Value Test-Api
```

**Mac/Linux** (`~/.bashrc` eller `~/.zshrc`):
```bash
alias backend='npm run dev:backend'
alias apitest='curl http://localhost:3000/api/health'
alias logs='tail -f logs/combined.log'
```

### VS Code Tasks

Opret `.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Backend",
      "type": "npm",
      "script": "dev:backend",
      "problemMatcher": []
    },
    {
      "label": "Run Tests",
      "type": "npm",
      "script": "test",
      "problemMatcher": []
    }
  ]
}
```

Kør med `Ctrl+Shift+P` > "Tasks: Run Task"

---

**Hurtig Reference:**
- `npm run dev:backend` - Start server
- `npm test` - Kør tests
- `npm run lint` - Check kode
- `curl localhost:3000/api/health` - Test API
- Se [QUICKSTART.md](./QUICKSTART.md) for mere
