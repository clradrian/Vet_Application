# Sistem de Notificări Email pentru Expirări

## Funcționalitate

Sistemul verifică automat expirarea vaccinurilor și deparazitărilor și trimite notificări prin email către proprietarii animalelor.

## Caracteristici

### ✅ Verificare automată
- **Programare zilnică**: verificare la ora 09:00 (fus orar București)
- **Interval de notificare**: 7 zile înainte de expirare
- **Tipuri monitorizate**: vaccinuri, deparazitări interne, deparazitări externe

### ✅ Notificări Email
- **Template HTML personalizat** cu informații complete
- **Versiune text simplă** pentru compatibilitate
- **Prevenirea spam-ului** prin log de notificări trimise

### ✅ Configurare flexibilă
- **Dezvoltare**: cont de test Ethereal Email (fără configurare)
- **Producție**: suport pentru SMTP personalizat (Gmail, SendGrid, etc.)

## Configurare

### Pentru dezvoltare
Nu este necesară nicio configurare. Sistemul folosește automat conturi de test Ethereal Email.

### Pentru producție
Adaugă în fișierul `.env`:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Clinica Veterinară <noreply@vetapp.ro>
```

## Utilizare

### Testare manuală
1. Accesează aplicația ca administrator
2. Mergi la secțiunea "Administrare personal"
3. Apasă butonul "Test Notificări Email"
4. Verifică consola backend-ului pentru link-uri de preview

### Monitorizare
- Toate emailurile de test sunt vizibile în consola backend-ului
- Link-urile de preview permit vizualizarea emailurilor trimise
- Log-urile detaliate pentru debugging

## Dependințe
- `nodemailer` - trimiterea emailurilor
- `node-cron` - programarea automată

## Programare
- **Verificare zilnică**: 09:00 (Europe/Bucharest)
- **Pentru dezvoltare**: opțional verificare la fiecare 5 minute (comentat în cod)

## Baza de date
Sistemul creează automat tabela `notification_log` pentru a preveni trimiterea repetată a aceluiași email în aceeași zi.

## Exemple de email

### Subiect
`Expirare Vaccin - Nume Animal`

### Conținut
- Informații despre proprietar
- Detalii despre animal
- Tip medicație și nume
- Data expirării
- Instrucțiuni pentru programare