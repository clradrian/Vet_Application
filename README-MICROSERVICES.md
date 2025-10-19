# Vet App - Microservices Architecture

Aplicația veterinară a fost migrata la o arhitectură de microservicii folosind Docker Compose. Aplicația este compusă din următoarele servicii:

## Arhitectura Serviciilor

### 1. **User Service** (Port 3001)
- **Responsabilități**: Autentificare, gestionarea utilizatorilor, validare JWT
- **Endpoint-uri principale**:
  - `POST /api/login` - Autentificare utilizatori
  - `POST /api/register` - Înregistrare utilizatori noi
  - `GET /api/users` - Lista utilizatori (admin)
  - `POST /api/users` - Creare utilizator (admin)
  - `GET /api/health` - Health check

### 2. **Pet Service** (Port 3002)
- **Responsabilități**: Gestionarea animalelor, vaccinări, deparazitări, programe
- **Endpoint-uri principale**:
  - `GET /api/pets` - Lista animale
  - `POST /api/pets` - Adăugare animal nou
  - `GET /api/pets/:id/vaccines` - Vaccinări animal
  - `POST /api/pets/:id/vaccines` - Adăugare vaccinare
  - `GET /api/pets/:id/dewormings` - Deparazitări animal
  - `POST /api/pets/:id/dewormings` - Adăugare deparazitare
  - `GET /api/health` - Health check

### 3. **Notification Service** (Port 3003)
- **Responsabilități**: Notificări email, monitorizare expirări, cron jobs
- **Endpoint-uri principale**:
  - `POST /api/send-notification` - Trimitere email
  - `POST /api/check-expirations` - Verificare manuală expirări
  - `GET /api/health` - Health check

### 4. **Frontend Service** (Port 3000)
- **Responsabilități**: Interfața utilizator React, PWA
- **Tehnologii**: React 18, Service Workers, Proxy pentru microservicii

### 5. **PostgreSQL Database** (Port 5432)
- **Responsabilități**: Stocarea datelor pentru toate serviciile
- **Schema**: Utilizatori, animale, vaccinări, deparazitări, programe

### 6. **Nginx Reverse Proxy** (Port 80)
- **Responsabilități**: Load balancing, rate limiting, SSL termination
- **Funcționalități**: Security headers, health checks

## Instalare și Configurare

### 1. Pregătirea Mediului

```bash
# Clonează repository-ul
git clone <repository-url>
cd Vet_App

# Copiază fișierul de configurare
cp .env.example .env
```

### 2. Configurare Environment Variables

Editează fișierul `.env` cu configurațiile tale:

```bash
# Database
DB_USER=vet_user
DB_PASSWORD=vet_secure_password_2024
DB_NAME=vet_app_db

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key

# Email (pentru notificări)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Vet App <noreply@vetapp.com>"
```

### 3. Rulare cu Docker Compose

```bash
# Construiește și pornește toate serviciile
docker-compose up --build

# Sau în background
docker-compose up -d --build

# Vezi log-urile
docker-compose logs -f

# Oprește serviciile
docker-compose down

# Oprește și șterge volumele (ATENȚIE: șterge datele!)
docker-compose down -v
```

## Dezvoltare Locală

### Rulare servicii individuale pentru dezvoltare:

```bash
# User Service
cd user-service
npm install
npm start

# Pet Service  
cd pet-service
npm install
npm start

# Notification Service
cd notification-service
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

## Monitorizare și Health Checks

### Health Check Endpoints:
- User Service: `http://localhost:3001/api/health`
- Pet Service: `http://localhost:3002/api/health`
- Notification Service: `http://localhost:3003/api/health`
- Frontend: `http://localhost:3000`

### Verificare status servicii:
```bash
# Status toate serviciile
docker-compose ps

# Logs pentru un serviciu specific
docker-compose logs user-service

# Exec în container pentru debugging
docker-compose exec user-service sh
```

## Comunicarea Inter-Servicii

Serviciile comunică între ele folosind HTTP și validare JWT:

1. **Frontend** → **User Service**: Autentificare și gestionare utilizatori
2. **Frontend** → **Pet Service**: Operațiuni cu animale (cu token JWT)
3. **Pet Service** → **User Service**: Validare token-uri JWT
4. **Notification Service** → **Pet Service**: Obținere date pentru notificări
5. **Notification Service** → **User Service**: Validare și obținere date utilizatori

## Siguranță

- **JWT Authentication**: Toate endpoint-urile protejate necesită token JWT valid
- **Password Hashing**: bcrypt pentru criptarea parolelor
- **Rate Limiting**: Nginx limitează numărul de request-uri
- **Security Headers**: CORS, XSS protection, content security policy
- **Non-root Containers**: Toate container-ele rulează cu utilizatori non-privilegiați

## Backup și Recuperare

### Backup bază de date:
```bash
docker-compose exec postgres pg_dump -U vet_user vet_app_db > backup.sql
```

### Restore bază de date:
```bash
docker-compose exec -T postgres psql -U vet_user vet_app_db < backup.sql
```

## Troubleshooting

### Probleme comune:

1. **Serviciile nu se conectează la baza de date**:
   - Verifică că PostgreSQL container-ul a pornit complet
   - Verifică credențialele în `.env`

2. **Frontend nu poate accesa API-urile**:
   - Verifică proxy configuration în `setupProxy.js`
   - Verifică că toate serviciile backend rulează

3. **Email-urile nu se trimit**:
   - Verifică configurația email în `.env`
   - Pentru Gmail, folosește App Passwords, nu parola principală

4. **Probleme de permisiuni**:
   - Verifică că utilizatorii non-root din container-e au permisiuni corecte
   - Rulează `docker-compose down -v && docker-compose up --build`

## Contribuție

1. Creează un branch nou pentru feature-ul tău
2. Fă modificările necesare
3. Testează local cu `docker-compose up --build`
4. Creează un Pull Request

## Scalabilitate

Pentru producție, poți scala serviciile individual:

```bash
# Scalează pet service la 3 instanțe
docker-compose up --scale pet-service=3

# Folosește un load balancer extern (nginx, traefik)
# Adaugă monitoring (prometheus, grafana)
# Implementează logging centralizat (ELK stack)
```