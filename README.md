
# Vet App - Aplicație Veterinară cu Microservicii

Această aplicație veterinară a fost migrata la o **arhitectură de microservicii** folosind Docker Compose pentru o scalabilitate și mentenanță îmbunătățite.

## 🏗️ Arhitectura Aplicației

### Servicii (Microservicii):
- **User Service** (port 3001): Autentificare și gestionare utilizatori
- **Pet Service** (port 3002): Gestionare animale, vaccinări, deparazitări
- **Notification Service** (port 3003): Notificări email și monitorizare expirări
- **Frontend Service** (port 3000): Interfață React PWA
- **PostgreSQL Database** (port 5432): Stocarea datelor
- **Nginx Reverse Proxy** (port 80): Load balancing și securitate

## 🚀 Rularea Rapidă (Start Here!)

### Metoda 1: Script Automat (RECOMANDAT)
```bash
# Configurare și pornire automată
./run-app.sh
```

### Metoda 2: Cu Make (pentru dezvoltatori)
```bash
# Vezi toate comenzile disponibile
make help

# Pornește aplicația
make start

# Vezi statusul
make status

# Vezi log-urile
make logs

# Oprește aplicația
make stop
```

### Metoda 3: Docker Compose Direct
```bash
# Configurare
cp .env.example .env
# Editează .env cu configurațiile tale

# Pornește aplicația
docker-compose up --build

# În background
docker-compose up -d --build
```

## 📋 Pași Detaliați

Pentru pași detaliați și troubleshooting, vezi:
- **[GHID-RULARE.md](GHID-RULARE.md)** - Ghid pas cu pas complet
- **[README-MICROSERVICES.md](README-MICROSERVICES.md)** - Documentație tehnică detaliată
- **[MIGRATION-CHECKLIST.md](MIGRATION-CHECKLIST.md)** - Checklist și troubleshooting

## ⚡ Quick Start - 3 Pași

1. **Configurare:**
   ```bash
   cp .env.example .env
   # Editează .env cu DB_PASSWORD și JWT_SECRET
   ```

2. **Pornire:**
   ```bash
   ./run-app.sh
   ```

3. **Accesare:**
   - Aplicația: http://localhost:3000
   - APIs: http://localhost:3001, 3002, 3003

## 🔧 Pentru Dezvoltatori

### Mod Dezvoltare (cu hot reload):
```bash
make dev
# sau
docker-compose -f docker-compose.dev.yml up --build
```

### Teste și Debugging:
```bash
# Health checks
make health

# Log-uri live
make logs

# Status servicii
make status
```

## 🌟 Funcționalități

- **Gestionare Animale**: CRUD complet pentru animale
- **Vaccinări**: Tracking cu date de expirare
- **Deparazitări**: Interne și externe cu monitorizare
- **Notificări Email**: Alerte automate pentru expirări
- **Interfață Responsivă**: PWA cu design modern
- **Autentificare Securizată**: JWT cu roluri (admin/staff)
- **Monitoring**: Health checks și logging

## 📊 Verificare Rapidă

După pornire, verifică că totul funcționează:
```bash
curl http://localhost:3001/api/health  # User Service
curl http://localhost:3002/api/health  # Pet Service  
curl http://localhost:3003/api/health  # Notification Service
curl http://localhost:3000             # Frontend
```

## 🆘 Probleme Frecvente

1. **Port ocupat**: `make clean` apoi `make start`
2. **Baza de date nu se conectează**: Așteaptă ~30 secunde pentru PostgreSQL
3. **Email nu funcționează**: Verifică configurația din `.env`
4. **Frontend nu accesează API**: Verifică că toate serviciile rulează

Pentru troubleshooting detaliat, vezi [GHID-RULARE.md](GHID-RULARE.md).

---

## 📚 Documentație Suplimentară

### Pentru Utilizatori:
- [GHID-RULARE.md](GHID-RULARE.md) - Cum să rulezi aplicația

### Pentru Dezvoltatori:
- [README-MICROSERVICES.md](README-MICROSERVICES.md) - Arhitectură tehnică
- [MIGRATION-CHECKLIST.md](MIGRATION-CHECKLIST.md) - Detalii migrare

### Configurări Avansate:
- `docker-compose.yml` - Configurare producție
- `docker-compose.dev.yml` - Configurare dezvoltare
- `nginx/nginx.conf` - Configurare reverse proxy

---

## 🏥 Cum să Folosești Aplicația

1. **Accesează**: http://localhost:3000
2. **Înregistrează-te** ca utilizator nou
3. **Fă primul user admin** (vezi [GHID-RULARE.md](GHID-RULARE.md) pasul 5.1)
4. **Adaugă animale** și **gestionează vaccinări/deparazitări**
5. **Configurează email-urile** pentru notificări automate

---

*Aplicație dezvoltată cu ❤️ pentru clinicile veterinare din România*

```bash
cd vet-app-backend
npm install
npm run migrate
```

Start backend:

```bash
npm start
```

Start frontend in another shell:

```bash
cd vet-app-frontend
npm install
npm start
```

Testing
- Backend: `cd vet-app-backend && npm test` (runs a small script that prints pets for a sample owner)
- Frontend: `cd vet-app-frontend && npm test -- --watchAll=false`

Changelog (high level)
- Added: pet details attachment (vaccines/dewormings) to `getPetsByOwner` (backend)
- Added: `expirydate` columns via migration
- Added: UI display and expiry badges for vaccine/deworming entries (frontend)
- Added: migration runner, tests, and CI workflow

UI polish notes
- Advanced pet modal (Staff Manager)
	- Vaccines and dewormings are listed with administration date and expiry date.
	- Items expiring within 30 days are flagged with a yellow "(X zile)" caption.
	- Expired items are shown with a red "(expirat)" caption.
	- Editing an animal's advanced details allows adding/removing vaccine and deworming entries, including expiry dates.

Security / audit notes
- `npm audit fix` was run on the backend. The frontend reported transitive vulnerabilities that require a breaking upgrade (react-scripts). To avoid breaking changes we did *not* force-upgrade react-scripts; instead we installed the needed testing libraries and left upgrading react-scripts for a separate task.

Next recommended steps
- (Optional) Upgrade `react-scripts` and related build deps in a separate PR and run CI to validate.
- Add more unit/integration tests for pet-create and vaccine/deworming flows.
- Add an automated migration check in CI (already implemented in the workflow).
