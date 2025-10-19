# 🏥 Ghid Pas cu Pas - Rularea Aplicației Vet

## Pasul 1: Pregătirea Mediului

### 1.1 Verifică că ai Docker instalat:
```bash
docker --version
docker-compose --version
```

Dacă nu ai Docker instalat:
- **macOS**: Descarcă Docker Desktop de pe [docker.com](https://www.docker.com/products/docker-desktop)
- **Windows**: Descarcă Docker Desktop pentru Windows
- **Linux**: `sudo apt-get install docker docker-compose` (Ubuntu/Debian)

### 1.2 Clonează repository-ul (dacă nu l-ai făcut deja):
```bash
git clone <repository-url>
cd Vet_App
git checkout feature/migrate-to-docker-composer
```

## Pasul 2: Configurarea Variabilelor de Mediu

### 2.1 Creează fișierul de configurare:
```bash
cp .env.example .env
```

### 2.2 Editează fișierul `.env` cu configurațiile tale:
```bash
nano .env
# sau
code .env
```

**Configurații importante de modificat:**
```env
# Database - schimbă parola!
DB_PASSWORD=parola_ta_sigura_aici

# JWT Secret - generează o cheie sigură!
JWT_SECRET=cheia_ta_jwt_foarte_sigura_aici_123456

# Email (pentru notificări) - OPȚIONAL la început
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=email-ul-tau@gmail.com
EMAIL_PASS=parola-aplicatie-gmail
EMAIL_FROM="Clinica Veterinara <noreply@clinica.ro>"
```

**💡 Tip:** Pentru Gmail, folosește "App Password", nu parola principală!

## Pasul 3: Rularea Aplicației

### Opțiunea A: Rulare Automată (RECOMANDAT pentru început)
```bash
./migrate-to-microservices.sh
```

Acest script va:
- Verifica că Docker este instalat
- Opri container-ele existente
- Construi și porni toate serviciile
- Verifica că totul funcționează

### Opțiunea B: Rulare Manuală

#### Pentru Dezvoltare (cu hot reload):
```bash
docker-compose -f docker-compose.dev.yml up --build
```

#### Pentru Producție:
```bash
docker-compose up --build
```

#### În background (fără să vezi log-urile):
```bash
docker-compose up -d --build
```

## Pasul 4: Verificarea că Aplicația Funcționează

### 4.1 Verifică că toate serviciile rulează:
```bash
docker-compose ps
```

Trebuie să vezi toate serviciile cu status "Up".

### 4.2 Testează endpoint-urile:
```bash
# User Service
curl http://localhost:3001/api/health

# Pet Service  
curl http://localhost:3002/api/health

# Notification Service
curl http://localhost:3003/api/health

# Frontend
curl http://localhost:3000
```

### 4.3 Deschide aplicația în browser:
```
http://localhost:3000
```

## Pasul 5: Primele Teste

### 5.1 Creează primul admin:
1. Deschide aplicația în browser: `http://localhost:3000`
2. Înregistrează-te ca utilizator nou
3. Sau conectează-te la baza de date pentru a face primul user admin:

```bash
# Conectează-te la baza de date
docker-compose exec postgres psql -U vet_user -d vet_app_db

# Fă primul utilizator admin
UPDATE users SET role = 'admin' WHERE username = 'numele_tau_de_utilizator';
\q
```

### 5.2 Testează funcționalitățile principale:
- ✅ Autentificare
- ✅ Adăugare animal nou
- ✅ Adăugare vaccinare
- ✅ Adăugare deparazitare

## Pasul 6: Monitorizarea

### 6.1 Vezi log-urile în timp real:
```bash
# Toate serviciile
docker-compose logs -f

# Un serviciu specific
docker-compose logs -f user-service
docker-compose logs -f pet-service
docker-compose logs -f notification-service
```

### 6.2 Monitorizează resursele:
```bash
docker stats
```

## Pasul 7: Oprirea Aplicației

### Oprire normală:
```bash
docker-compose down
```

### Oprire cu ștergerea volumelor (ATENȚIE - șterge datele!):
```bash
docker-compose down -v
```

## 🚨 Troubleshooting - Probleme Frecvente

### Problema 1: "Port already in use"
```bash
# Oprește toate container-ele Docker
docker stop $(docker ps -aq)

# Sau specifică alt port în docker-compose.yml
# Schimbă "3001:3001" în "3011:3001" de exemplu
```

### Problema 2: "Connection refused" la baza de date
```bash
# Așteaptă ca PostgreSQL să pornească complet
docker-compose logs postgres

# Verifică că serviciile pornesc în ordinea corectă
docker-compose up --build
```

### Problema 3: Frontend nu se conectează la API
1. Verifică că toate serviciile backend rulează
2. Verifică configurația proxy în `frontend/src/setupProxy.js`
3. Verifică că nu ai firewall care blochează porturile

### Problema 4: Email-urile nu se trimit
1. Verifică configurația email în `.env`
2. Pentru Gmail, activează "2-Step Verification" și generează "App Password"
3. Verifică log-urile notification-service: `docker-compose logs notification-service`

## 📊 Verificare Rapidă - Checklist

- [ ] Docker și Docker Compose instalate
- [ ] Fișierul `.env` creat și configurat
- [ ] Toate serviciile pornite cu `docker-compose ps`
- [ ] Health check-urile răspund (pasul 4.2)
- [ ] Frontend accesibil la `http://localhost:3000`
- [ ] Poți să te autentifici în aplicație
- [ ] Poți să adaugi un animal nou

## 🎉 Gata!

Dacă toate punctele de mai sus funcționează, aplicația ta veterinară cu microservicii rulează perfect! 

### Următorii pași opționali:
- Configurează email-urile pentru notificări
- Testează toate funcționalitățile aplicației
- Configurează backup-uri automate
- Set up monitoring în producție

### Pentru ajutor suplimentar:
- Consultă `README-MICROSERVICES.md` pentru detalii complete
- Verifică `MIGRATION-CHECKLIST.md` pentru troubleshooting avansat
- Vezi log-urile serviciilor pentru debugging: `docker-compose logs -f`